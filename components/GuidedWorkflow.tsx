import React, { useState } from 'react';
import ChecklistItem from './ChecklistItem';
import { DocumentationData, ChecklistProgress } from '../types';

interface GuidedWorkflowProps {
  documentationData: DocumentationData;
  checklistProgress: ChecklistProgress;
  toggleChecklistItem: (itemId: string) => void;
  setActiveSection: (sectionId: string) => void;
  setShowGuidedWorkflow: (show: boolean) => void;
}

const GuidedWorkflow: React.FC<GuidedWorkflowProps> = ({
  documentationData,
  checklistProgress,
  toggleChecklistItem,
  setActiveSection,
  setShowGuidedWorkflow
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Define the guided workflow steps
  const steps = [
    {
      title: "Welcome to the Guided Workflow",
      content: `
        <p>This guided workflow will help you document your generative AI usage for research projects. We'll walk through the essential documentation sections step by step.</p>
        <p>This is especially helpful if you're new to AI documentation or want to ensure you're covering all the necessary aspects.</p>
        <p>Let's get started with the basics!</p>
      `,
      section: null
    },
    {
      title: "Step 1: AI Model Specification",
      content: `
        <p>First, let's document the AI model you used. This is like citing the specific tools in a scientific experiment - without this information, others cannot replicate your work.</p>
        <p>Complete the checklist below to document your AI model details:</p>
      `,
      section: "model-specification"
    },
    {
      title: "Step 2: Generation Parameters",
      content: `
        <p>Next, let's document the settings and controls you used when generating outputs from the AI model. These parameters act like "knobs and dials" that influence how the model responds.</p>
        <p>Complete the checklist below to document your generation parameters:</p>
      `,
      section: "generation-parameters"
    },
    {
      title: "Step 3: Prompt Engineering",
      content: `
        <p>Now, let's document the exact instructions (prompts) you gave to the AI model. Prompts are the questions, instructions, or examples you provide to guide the AI's response.</p>
        <p>Complete the checklist below to document your prompt engineering:</p>
      `,
      section: "prompt-engineering"
    },
    {
      title: "Step 4: Dataset and Input Documentation",
      content: `
        <p>Let's document all the data you provided to the AI model as input. This includes datasets, individual documents, or any information the model used to generate its responses.</p>
        <p>Complete the checklist below to document your datasets and inputs:</p>
      `,
      section: "dataset-documentation"
    },
    {
      title: "Step 5: Output Processing and Evaluation",
      content: `
        <p>Now, let's document how you processed and evaluated the AI's outputs. This includes any filtering, modification, or assessment of the generated content.</p>
        <p>Complete the checklist below to document your output processing and evaluation:</p>
      `,
      section: "output-processing"
    },
    {
      title: "Step 6: Reproducibility Materials",
      content: `
        <p>Finally, let's document the materials needed for others to reproduce your work. This includes code, scripts, and other resources.</p>
        <p>Complete the checklist below to document your reproducibility materials:</p>
      `,
      section: "reproducibility-materials"
    },
    {
      title: "Documentation Complete!",
      content: `
        <p>Congratulations! You've completed the essential documentation for your generative AI usage.</p>
        <p>You can now explore the full documentation framework to add more details in specific areas or review your work.</p>
        <p>Remember, good documentation ensures transparency, reproducibility, and accountability in your research.</p>
      `,
      section: null
    }
  ];

  const currentStepData = steps[currentStep];
  const section = currentStepData.section ? documentationData[currentStepData.section] : null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGuidedWorkflow(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExploreSection = () => {
    if (currentStepData.section) {
      setActiveSection(currentStepData.section);
      setShowGuidedWorkflow(false);
    }
  };

  const renderChecklist = () => {
    if (!section || !section.checklist || section.checklist.length === 0) {
      return null;
    }

    return (
      <div className="checklist-section">
        {section.checklist.map(item => {
          const itemId = `${currentStepData.section}-${item.id}`;
          
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

  return (
    <div className="guided-workflow">
      <div className="guided-workflow-step">
        <h2>{currentStepData.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
        
        {renderChecklist()}
        
        <div className="guided-workflow-navigation">
          <button 
            className="guided-workflow-btn secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          <div>
            {currentStepData.section && (
              <button 
                className="guided-workflow-btn secondary"
                onClick={handleExploreSection}
                style={{ marginRight: '1rem' }}
              >
                Explore This Section
              </button>
            )}
            
            <button 
              className="guided-workflow-btn"
              onClick={handleNext}
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedWorkflow;
