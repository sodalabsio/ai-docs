import React from 'react';
import { SearchResultWithContext, highlightSearchTerms } from '../utils/searchUtils';

interface SearchResultsProps {
  results: SearchResultWithContext[];
  query: string;
  onResultClick: (id: string) => void;
  onClearSearch: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  query, 
  onResultClick,
  onClearSearch
}) => {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
  
  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>Search Results for "{query}"</h2>
        <button className="clear-search-btn" onClick={onClearSearch}>
          Clear Search
        </button>
      </div>
      
      {results.length > 0 ? (
        <>
          <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          <ul className="results-list">
            {results.map(result => (
              <li key={result.id} className="result-item">
                <div className="result-header">
                  <button 
                    className="result-title"
                    onClick={() => onResultClick(result.id)}
                  >
                    {result.parentTitle && (
                      <span className="parent-title">
                        {result.parentTitle} &gt; 
                      </span>
                    )}
                    <span 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightSearchTerms(result.title, searchTerms) 
                      }} 
                    />
                  </button>
                </div>
                <div 
                  className="result-snippet"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSearchTerms(result.snippet, searchTerms) 
                  }} 
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="no-results">
          <p>No results found. Try a different search term.</p>
          <ul className="search-tips">
            <li>Check your spelling</li>
            <li>Try more general terms</li>
            <li>Try different keywords</li>
            <li>Try searching for concepts rather than specific terms</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
