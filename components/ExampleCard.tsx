import React from 'react';
import { ExampleType } from '../types';

interface ExampleCardProps {
  example: ExampleType;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ example }) => {
  return (
    <div className="example-card">
      <h4>{example.title}</h4>
      <div dangerouslySetInnerHTML={{ __html: example.content }} />
    </div>
  );
};

export default ExampleCard;
