import React from 'react';
import { ChecklistItemType } from '../types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: () => void;
  itemId: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  isChecked,
  onToggle,
  itemId
}) => {
  return (
    <div className="checklist-item">
      <div className="checklist-checkbox">
        <input
          type="checkbox"
          id={itemId}
          checked={isChecked}
          onChange={onToggle}
        />
      </div>
      <div className="checklist-content">
        <label htmlFor={itemId} className="checklist-title">
          {item.title}
        </label>
        <div className="checklist-description">
          {item.description}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
