import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import TierSection from '../components/TierSection';
import SearchBar from '../components/SearchBar';
import GuidedWorkflow from '../components/GuidedWorkflow';
import { documentationData } from '../data/documentationData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChecklistProgress } from '../types';
import '../styles.css';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showGuidedWorkflow, setShowGuidedWorkflow] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [checklistProgress, setChecklistProgress] = useLocalStorage<ChecklistProgress>('checklistProgress', {});

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: string[] = [];
    
    // Search through all sections
    Object.entries(documentationData).forEach(([sectionId, section]) => {
      if (
        section.title.toLowerCase().includes(query.toLowerCase()) ||
        section.content.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(sectionId);
      }

      // Search through subsections if they exist
      if (section.subsections) {
        Object.entries(section.subsections).forEach(([subsectionId, subsection]) => {
          if (
            subsection.title.toLowerCase().includes(query.toLowerCase()) ||
            subsection.content.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push(`${sectionId}-${subsectionId}`);
          }
        });
      }
    });

    setSearchResults(results);
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
          <SearchBar onSearch={handleSearch} />
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
          setActiveSection={setActiveSection}
          checklistProgress={checklistProgress}
        />
        
        <main className="main-content">
          {showGuidedWorkflow ? (
            <GuidedWorkflow 
              documentationData={documentationData}
              checklistProgress={checklistProgress}
              toggleChecklistItem={toggleChecklistItem}
              setActiveSection={setActiveSection}
              setShowGuidedWorkflow={setShowGuidedWorkflow}
            />
          ) : isSearching ? (
            <div className="search-results">
              <h2>Search Results</h2>
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(result => {
                    const [sectionId, subsectionId] = result.split('-');
                    const section = documentationData[sectionId];
                    
                    if (!subsectionId) {
                      return (
                        <li key={result}>
                          <button 
                            onClick={() => {
                              setActiveSection(sectionId);
                              setIsSearching(false);
                              setSearchResults([]);
                            }}
                          >
                            {section.title}
                          </button>
                        </li>
                      );
                    } else {
                      const subsection = section.subsections?.[subsectionId];
                      return subsection ? (
                        <li key={result}>
                          <button 
                            onClick={() => {
                              setActiveSection(`${sectionId}-${subsectionId}`);
                              setIsSearching(false);
                              setSearchResults([]);
                            }}
                          >
                            {section.title} &gt; {subsection.title}
                          </button>
                        </li>
                      ) : null;
                    }
                  })}
                </ul>
              ) : (
                <p>No results found. Try a different search term.</p>
              )}
            </div>
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
