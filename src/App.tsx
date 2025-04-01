import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TierSection from './components/TierSection';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import GuidedWorkflow from './components/GuidedWorkflow';
import { documentationData } from '../data/documentationData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ChecklistProgress } from './types';
import { enhancedSearch, SearchResultWithContext } from './utils/searchUtils';
import './styles.css';

/**
 * Parse a search result ID to determine if it's a valid section, subsection, or example
 */
function parseSearchResultId(id: string): {
  isValid: boolean;
  sectionId: string;
} {
  // Check if it's a direct section
  if (documentationData[id]) {
    return { isValid: true, sectionId: id };
  }
  
  // Check if it's an example (format: "sectionId-example-index")
  const exampleMatch = id.match(/^(.+)-example-(\d+)$/);
  if (exampleMatch) {
    const parentId = exampleMatch[1];
    const exampleIndex = parseInt(exampleMatch[2], 10);
    
    // Check if the parent section exists and has the example
    if (
      documentationData[parentId] && 
      documentationData[parentId].examples && 
      documentationData[parentId].examples[exampleIndex]
    ) {
      return { isValid: true, sectionId: id };
    }
  }
  
  // Check if it's a subsection (format: "sectionId-subsectionId")
  const parts = id.split('-');
  if (parts.length > 1) {
    const parentId = parts[0];
    const subsectionId = parts[1];
    
    // Check if the parent section exists and has the subsection
    if (
      documentationData[parentId] && 
      documentationData[parentId].subsections && 
      documentationData[parentId].subsections[subsectionId]
    ) {
      return { isValid: true, sectionId: id };
    }
  }
  
  // If we get here, the ID is not valid
  console.error(`Invalid search result ID: ${id}`);
  return { isValid: false, sectionId: 'introduction' }; // Default to introduction
}

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
    // Parse the search result ID to ensure it's valid
    const { isValid, sectionId } = parseSearchResultId(id);
    
    // Clear search state completely
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    
    // Set the active section if the ID is valid
    if (isValid) {
      setActiveSection(sectionId);
    } else {
      // If the ID is not valid, show an error and default to introduction
      alert('The selected section could not be found. Returning to introduction.');
      setActiveSection('introduction');
    }
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
