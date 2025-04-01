import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import TierSection from '../components/TierSection';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import GuidedWorkflow from '../components/GuidedWorkflow';
import { documentationData } from '../data/documentationData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChecklistProgress } from '../types';
import { enhancedSearch, SearchResultWithContext } from '../utils/searchUtils';
import '../styles.css';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showGuidedWorkflow, setShowGuidedWorkflow] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultWithContext[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [checklistProgress, setChecklistProgress] = useLocalStorage<ChecklistProgress>('checklistProgress', {});

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = enhancedSearch(documentationData, query);
    setSearchResults(results);
  };

  const handleSearchResultClick = (id: string) => {
    // Clear search state completely
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    
    // Set the active section
    setActiveSection(id);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  // Reset search when navigating via the sidebar
  const handleSectionChange = (sectionId: string) => {
    clearSearch();
    setActiveSection(sectionId);
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklistProgress(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setChecklistProgress({});
    }
  };

  const calculateProgress = (): number => {
    const totalItems = Object.keys(documentationData).reduce((count, sectionId) => {
      const section = documentationData[sectionId];
      if (section.checklist) {
        count += section.checklist.length;
      }
      if (section.subsections) {
        Object.values(section.subsections).forEach(subsection => {
          if (subsection.checklist) {
            count += subsection.checklist.length;
          }
        });
      }
      return count;
    }, 0);

    const completedItems = Object.values(checklistProgress).filter(Boolean).length;
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Generative AI Documentation Checklist</h1>
        <div className="header-controls">
          <SearchBar 
            onSearch={handleSearch} 
            query={searchQuery} 
            setQuery={setSearchQuery} 
          />
          <button 
            className="guided-workflow-btn"
            onClick={() => setShowGuidedWorkflow(!showGuidedWorkflow)}
          >
            {showGuidedWorkflow ? 'Exit Guided Mode' : 'Start Guided Workflow'}
          </button>
        </div>
      </header>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Documentation Progress: {calculateProgress()}%
          <button className="reset-btn" onClick={resetProgress}>Reset Progress</button>
        </div>
      </div>

      <div className="app-content">
        <Navigation 
          documentationData={documentationData} 
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          checklistProgress={checklistProgress}
        />
        
        <main className="main-content">
          {showGuidedWorkflow ? (
            <GuidedWorkflow 
              documentationData={documentationData}
              checklistProgress={checklistProgress}
              toggleChecklistItem={toggleChecklistItem}
              setActiveSection={handleSectionChange}
              setShowGuidedWorkflow={setShowGuidedWorkflow}
            />
          ) : isSearching && searchQuery.trim() ? (
            <SearchResults 
              results={searchResults}
              query={searchQuery}
              onResultClick={handleSearchResultClick}
              onClearSearch={clearSearch}
            />
          ) : (
            <TierSection 
              sectionId={activeSection}
              documentationData={documentationData}
              checklistProgress={checklistProgress}
              toggleChecklistItem={toggleChecklistItem}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
