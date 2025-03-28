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
  console.log(`Available sections: ${Object.keys(documentationData).join(', ')}`);
  
  // If the section exists directly, use it without the parent/subsection logic
  if (sectionData) {
    return renderSection(sectionId, sectionData, null);
  }
  
  // If we get here, try the parent/subsection logic for complex IDs
  const ids = sectionId.split('-');
  const parentId = ids[0];
  const subsectionId = ids.length > 1 ? ids[1] : null;
  
  console.log(`Trying parent/subsection approach: Parent ID: ${parentId}, Subsection ID: ${subsectionId || 'none'}`);
  
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

  // Get the section based on whether it's a subsection or not
  const section = subsectionId 
    ? documentationData[parentId]?.subsections?.[subsectionId]
    : documentationData[parentId];

  if (!section) {
    console.error(`Section not found: ${sectionId}`);
    if (subsectionId) {
      console.error(`Subsection "${subsectionId}" not found in parent "${parentId}"`);
    }
    return (
      <div className="section-not-found">
        <h2>Section Not Found</h2>
        <p>The requested section cannot be found. Please check the documentation data.</p>
        <p>Available sections: {Object.keys(documentationData).join(', ')}</p>
      </div>
    );
  }

  return renderSection(parentId, section, subsectionId);
  
  // Helper function to render a section
  function renderSection(parentId: string, section: any, subsectionId: string | null) {
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
        <div>
          <h3>Examples</h3>
          {section.examples.map((example: any, index: number) => (
            <ExampleCard key={index} example={example} />
          ))}
        </div>
      );
    };

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
