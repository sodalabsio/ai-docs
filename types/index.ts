export interface ChecklistItemType {
  id: string;
  title: string;
  description: string;
}

export interface ExampleType {
  title: string;
  content: string;
}

export interface SubsectionType {
  title: string;
  content: string;
  checklist?: ChecklistItemType[];
  examples?: ExampleType[];
}

export interface SectionType {
  title: string;
  tier?: number;
  content: string;
  checklist?: ChecklistItemType[];
  examples?: ExampleType[];
  subsections?: {
    [key: string]: SubsectionType;
  };
}

export interface DocumentationData {
  [key: string]: SectionType;
}

export interface ChecklistProgress {
  [key: string]: boolean;
}
