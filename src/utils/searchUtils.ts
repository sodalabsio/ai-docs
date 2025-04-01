/**
 * Utility functions for enhanced search capabilities
 */

import { DocumentationData, SectionType, SubsectionType } from '../types';

// Interface for search result with context
export interface SearchResultWithContext {
  id: string;
  type: 'section' | 'subsection';
  title: string;
  parentTitle?: string;
  snippet: string;
  matchCount: number;
}

/**
 * Extracts plain text from HTML content
 */
export function extractTextFromHtml(html: string): string {
  // Simple HTML tag removal - for production, consider using a proper HTML parser
  return html
    .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
    .trim();
}

/**
 * Finds a snippet of text around the search term
 */
export function findSnippet(text: string, searchTerm: string, snippetLength: number = 150): string {
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  const index = lowerText.indexOf(lowerSearchTerm);
  if (index === -1) return text.substring(0, snippetLength) + '...';
  
  // Calculate start and end positions for the snippet
  const halfLength = Math.floor(snippetLength / 2);
  let start = Math.max(0, index - halfLength);
  let end = Math.min(text.length, index + searchTerm.length + halfLength);
  
  // Adjust to not cut words
  while (start > 0 && text[start] !== ' ' && text[start] !== '.') start--;
  while (end < text.length && text[end] !== ' ' && text[end] !== '.') end++;
  
  // Create the snippet
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += text.substring(start, end).trim();
  if (end < text.length) snippet += '...';
  
  return snippet;
}

/**
 * Counts occurrences of a search term in text
 */
export function countMatches(text: string, searchTerm: string): number {
  const regex = new RegExp(searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Performs an enhanced search across documentation data
 */
export function enhancedSearch(
  documentationData: DocumentationData, 
  query: string
): SearchResultWithContext[] {
  if (!query.trim()) return [];
  
  const results: SearchResultWithContext[] = [];
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
  
  // Search through all sections
  Object.entries(documentationData).forEach(([sectionId, section]) => {
    const sectionTextContent = extractTextFromHtml(section.content);
    const sectionTitleLower = section.title.toLowerCase();
    
    // Check if any search term matches the section
    const matchesSection = searchTerms.some(term => 
      sectionTitleLower.includes(term) || sectionTextContent.toLowerCase().includes(term)
    );
    
    if (matchesSection) {
      // Find the term that has the most matches for snippet creation
      let bestTerm = searchTerms[0];
      let maxMatches = 0;
      
      searchTerms.forEach(term => {
        const matches = countMatches(sectionTextContent.toLowerCase(), term);
        if (matches > maxMatches) {
          maxMatches = matches;
          bestTerm = term;
        }
      });
      
      results.push({
        id: sectionId,
        type: 'section',
        title: section.title,
        snippet: findSnippet(sectionTextContent, bestTerm),
        matchCount: maxMatches
      });
    }
    
    // Search through subsections if they exist
    if (section.subsections) {
      Object.entries(section.subsections).forEach(([subsectionId, subsection]) => {
        const subsectionTextContent = extractTextFromHtml(subsection.content);
        const subsectionTitleLower = subsection.title.toLowerCase();
        
        // Check if any search term matches the subsection
        const matchesSubsection = searchTerms.some(term => 
          subsectionTitleLower.includes(term) || subsectionTextContent.toLowerCase().includes(term)
        );
        
        if (matchesSubsection) {
          // Find the term that has the most matches for snippet creation
          let bestTerm = searchTerms[0];
          let maxMatches = 0;
          
          searchTerms.forEach(term => {
            const matches = countMatches(subsectionTextContent.toLowerCase(), term);
            if (matches > maxMatches) {
              maxMatches = matches;
              bestTerm = term;
            }
          });
          
          results.push({
            id: `${sectionId}-${subsectionId}`,
            type: 'subsection',
            title: subsection.title,
            parentTitle: section.title,
            snippet: findSnippet(subsectionTextContent, bestTerm),
            matchCount: maxMatches
          });
        }
      });
    }
    
    // Search through examples if they exist
    if (section.examples) {
      section.examples.forEach((example, index) => {
        const exampleTextContent = extractTextFromHtml(example.content);
        const exampleTitleLower = example.title.toLowerCase();
        
        // Check if any search term matches the example
        const matchesExample = searchTerms.some(term => 
          exampleTitleLower.includes(term) || exampleTextContent.toLowerCase().includes(term)
        );
        
        if (matchesExample) {
          // Find the term that has the most matches for snippet creation
          let bestTerm = searchTerms[0];
          let maxMatches = 0;
          
          searchTerms.forEach(term => {
            const matches = countMatches(exampleTextContent.toLowerCase(), term);
            if (matches > maxMatches) {
              maxMatches = matches;
              bestTerm = term;
            }
          });
          
          results.push({
            id: `${sectionId}-example-${index}`,
            type: 'subsection', // Treat examples as subsections for UI consistency
            title: example.title,
            parentTitle: section.title,
            snippet: findSnippet(exampleTextContent, bestTerm),
            matchCount: maxMatches
          });
        }
      });
    }
  });
  
  // Sort results by match count (most matches first)
  return results.sort((a, b) => b.matchCount - a.matchCount);
}

/**
 * Highlights search terms in text
 */
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  if (!searchTerms.length) return text;
  
  let highlightedText = text;
  searchTerms.forEach(term => {
    if (term.length > 1) {
      const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
  });
  
  return highlightedText;
}
