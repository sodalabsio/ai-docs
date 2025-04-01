import React from 'react';
import ChecklistItem from './ChecklistItem';
import ExampleCard from './ExampleCard';
import { DocumentationData, ChecklistProgress } from '../types';

interface TierSectionProps {
  sectionId: string;
  documentationData: DocumentationData;
  checklistProgress: ChecklistProgress;
  toggleChecklistItem: (itemId: string) => void;
}

/**
 * Parse a section ID into its components
 * Handles various formats:
 * - "sectionId" (simple section)
 * - "sectionId-subsectionId" (subsection)
 * - "sectionId-example-index" (example)
 */
function parseSectionId(sectionId: string): {
  parentId: string;
  subsectionId: string | null;
  isExample: boolean;
  exampleIndex: number | null;
} {
  // Check if it's an example (format: "sectionId-example-index")
  const exampleMatch = sectionId.match(/^(.+)-example-(\d+)$/);
  if (exampleMatch) {
    return {
      parentId: exampleMatch[1],
      subsectionId: null,
      isExample: true,
      exampleIndex: parseInt(exampleMatch[2], 10)
    };
  }
  
  // Check if it's a subsection (format: "sectionId-subsectionId")
  const parts = sectionId.split('-');
  if (parts.length > 1) {
    return {
      parentId: parts[0],
      subsectionId: parts[1],
      isExample: false,
      exampleIndex: null
    };
  }
  
  // It's a simple section
  return {
    parentId: sectionId,
    subsectionId: null,
    isExample: false,
    exampleIndex: null
  };
}

const TierSection: React.FC<TierSectionProps> = ({
  sectionId,
  documentationData,
  checklistProgress,
  toggleChecklistItem
}) => {
  // Direct access to the section data
  const sectionData = documentationData[sectionId];
  
  // Debug logging
  console.log(`Trying to find section: ${sectionId}`);
  console.log(`Section exists in documentationData: ${!!sectionData}`);
  
  // If the section exists directly, use it without the parent/subsection logic
  if (sectionData) {
    return renderSection(sectionId, sectionData, null, false, null);
  }
  
  // Parse the section ID to handle complex IDs
  const { parentId, subsectionId, isExample, exampleIndex } = parseSectionId(sectionId);
  
  console.log(`Parsed section ID: Parent ID: ${parentId}, Subsection ID: ${subsectionId || 'none'}, Is Example: ${isExample}, Example Index: ${exampleIndex}`);
  
  // Check if the parent section exists
  if (!documentationData[parentId]) {
    console.error(`Parent section "${parentId}" not found in documentationData`);
    return (
      <div className="section-not-found">
        <h2>Section Not Found</h2>
        <p>The requested section "{sectionId}" cannot be found. Please check the documentation data.</p>
        <p>Available sections: {Object.keys(documentationData).join(', ')}</p>
      </div>
    );
  }

  // Get the parent section
  const parentSection = documentationData[parentId];
  
  // Handle example case
  if (isExample && exampleIndex !== null) {
    if (!parentSection.examples || !parentSection.examples[exampleIndex]) {
      console.error(`Example at index ${exampleIndex} not found in section "${parentId}"`);
      return (
        <div className="section-not-found">
          <h2>Example Not Found</h2>
          <p>The requested example cannot be found. Please check the documentation data.</p>
        </div>
      );
    }
    
    // For examples, we'll render the parent section but scroll to the example
    // We'll use the parent section data but pass the example info
    return renderSection(parentId, parentSection, null, true, exampleIndex);
  }
  
  // Handle subsection case
  if (subsectionId) {
    if (!parentSection.subsections || !parentSection.subsections[subsectionId]) {
      console.error(`Subsection "${subsectionId}" not found in parent "${parentId}"`);
      return (
        <div className="section-not-found">
          <h2>Subsection Not Found</h2>
          <p>The requested subsection cannot be found. Please check the documentation data.</p>
        </div>
      );
    }
    
    const subsection = parentSection.subsections[subsectionId];
    return renderSection(parentId, subsection, subsectionId, false, null);
  }

  // If we get here, just render the parent section
  return renderSection(parentId, parentSection, null, false, null);
  
  // Helper function to render a section
  function renderSection(
    parentId: string, 
    section: any, 
    subsectionId: string | null, 
    isExample: boolean, 
    exampleIndex: number | null
  ) {
    const getTierBadgeClass = (tier: number) => {
      switch (tier) {
        case 1: return 'tier1';
        case 2: return 'tier2';
        case 3: return 'tier3';
        default: return '';
      }
    };

    const renderContent = () => {
      return (
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      );
    };

    const renderChecklist = () => {
      if (!section.checklist || section.checklist.length === 0) {
        return null;
      }

      return (
        <div className="checklist-section">
          <h3>Documentation Checklist</h3>
          {section.checklist.map((item: any) => {
            const itemId = subsectionId 
              ? `${parentId}-${subsectionId}-${item.id}`
              : `${parentId}-${item.id}`;
              
            return (
              <ChecklistItem
                key={itemId}
                item={item}
                isChecked={!!checklistProgress[itemId]}
                onToggle={() => toggleChecklistItem(itemId)}
                itemId={itemId}
              />
            );
          })}
        </div>
      );
    };

    const renderExamples = () => {
      if (!section.examples || section.examples.length === 0) {
        return null;
      }

      return (
        <div className="examples-section">
          <h3>Examples</h3>
          {section.examples.map((example: any, index: number) => (
            <div 
              key={index} 
              id={`example-${index}`} // Add an ID for scrolling
              className={isExample && exampleIndex === index ? 'highlighted-example' : ''}
            >
              <ExampleCard example={example} />
            </div>
          ))}
        </div>
      );
    };

    // If this is an example, scroll to it after render
    React.useEffect(() => {
      if (isExample && exampleIndex !== null) {
        const exampleElement = document.getElementById(`example-${exampleIndex}`);
        if (exampleElement) {
          // Scroll to the example with a slight delay to ensure rendering is complete
          setTimeout(() => {
            exampleElement.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }, [isExample, exampleIndex]);

    return (
      <div className="tier-section">
        {section.tier && (
          <div className={`tier-badge ${getTierBadgeClass(section.tier)}`}>
            Tier {section.tier}: {section.tier === 1 ? 'Foundations' : section.tier === 2 ? 'Typical Components' : 'Bleeding Edge'}
          </div>
        )}
        
        <h2>{section.title}</h2>
        
        {renderContent()}
        {renderChecklist()}
        {renderExamples()}
      </div>
    );
  }
};

export default TierSection;
