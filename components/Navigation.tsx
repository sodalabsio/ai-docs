import React from 'react';
import { FaCheckCircle, FaCircle, FaAdjust } from 'react-icons/fa';
import { DocumentationData, ChecklistProgress } from '../types';

interface NavigationProps {
  documentationData: DocumentationData;
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
  checklistProgress: ChecklistProgress;
}

const Navigation: React.FC<NavigationProps> = ({
  documentationData,
  activeSection,
  setActiveSection,
  checklistProgress
}) => {
  const calculateSectionProgress = (sectionId: string) => {
    const section = documentationData[sectionId];
    let totalItems = 0;
    let completedItems = 0;

    // Count checklist items in the main section
    if (section.checklist) {
      totalItems += section.checklist.length;
      section.checklist.forEach(item => {
        if (checklistProgress[`${sectionId}-${item.id}`]) {
          completedItems++;
        }
      });
    }

    // Count checklist items in subsections
    if (section.subsections) {
      Object.entries(section.subsections).forEach(([subsectionId, subsection]) => {
        if (subsection.checklist) {
          totalItems += subsection.checklist.length;
          subsection.checklist.forEach(item => {
            if (checklistProgress[`${sectionId}-${subsectionId}-${item.id}`]) {
              completedItems++;
            }
          });
        }
      });
    }

    if (totalItems === 0) return 'none';
    if (completedItems === 0) return 'not-started';
    if (completedItems === totalItems) return 'complete';
    return 'partial';
  };

  const renderProgressIcon = (progress: string) => {
    switch (progress) {
      case 'complete':
        return <FaCheckCircle size={12} />;
      case 'partial':
        return <FaAdjust size={12} />;
      case 'not-started':
        return <FaCircle size={12} />;
      default:
        return null;
    }
  };

  // Verify section exists before trying to access it
  const sectionExists = (sectionId: string): boolean => {
    return !!documentationData[sectionId];
  };

  return (
    <nav className="navigation">
      <div className="nav-section">
        <h2 className="nav-section-title">Introduction</h2>
        <ul className="nav-list">
          <li className="nav-item">
            <button
              className={`nav-link ${activeSection === 'introduction' ? 'active' : ''}`}
              onClick={() => setActiveSection('introduction')}
            >
              Introduction
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeSection === 'how-to-use' ? 'active' : ''}`}
              onClick={() => {
                // Verify the section exists before setting it active
                if (sectionExists('how-to-use')) {
                  setActiveSection('how-to-use');
                } else {
                  console.error("Section 'how-to-use' not found in documentationData");
                }
              }}
            >
              How to Use This Document
            </button>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h2 className="nav-section-title">Tier 1: Foundations</h2>
        <ul className="nav-list">
          {Object.entries(documentationData)
            .filter(([_, section]) => section.tier === 1)
            .map(([sectionId, section]) => {
              const progress = calculateSectionProgress(sectionId);
              
              return (
                <li key={sectionId} className="nav-item">
                  <button
                    className={`nav-link ${activeSection === sectionId ? 'active' : ''}`}
                    onClick={() => setActiveSection(sectionId)}
                  >
                    {section.title}
                    {progress !== 'none' && (
                      <span className={`nav-link-progress ${progress}`}>
                        {renderProgressIcon(progress)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="nav-section">
        <h2 className="nav-section-title">Tier 2: Typical Components</h2>
        <ul className="nav-list">
          {Object.entries(documentationData)
            .filter(([_, section]) => section.tier === 2)
            .map(([sectionId, section]) => {
              const progress = calculateSectionProgress(sectionId);
              
              return (
                <li key={sectionId} className="nav-item">
                  <button
                    className={`nav-link ${activeSection === sectionId ? 'active' : ''}`}
                    onClick={() => setActiveSection(sectionId)}
                  >
                    {section.title}
                    {progress !== 'none' && (
                      <span className={`nav-link-progress ${progress}`}>
                        {renderProgressIcon(progress)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="nav-section">
        <h2 className="nav-section-title">Tier 3: Bleeding Edge</h2>
        <ul className="nav-list">
          {Object.entries(documentationData)
            .filter(([_, section]) => section.tier === 3)
            .map(([sectionId, section]) => {
              const progress = calculateSectionProgress(sectionId);
              
              return (
                <li key={sectionId} className="nav-item">
                  <button
                    className={`nav-link ${activeSection === sectionId ? 'active' : ''}`}
                    onClick={() => setActiveSection(sectionId)}
                  >
                    {section.title}
                    {progress !== 'none' && (
                      <span className={`nav-link-progress ${progress}`}>
                        {renderProgressIcon(progress)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
