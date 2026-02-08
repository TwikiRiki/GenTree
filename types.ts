
export interface Person {
  id: string;
  name: string;
  born: string;
  died: string;
  notes: string;
  photo?: string;
}

export interface Family {
  id: string;
  label: string;
  spouses: string[]; // Person IDs
  children: string[]; // Person IDs
  notes: string;
}

export interface StyleConfig {
  family_label_default: string;
  edge_width: number;
  node_size_person: { width: number; height: number };
  node_size_family: number;
  ranksep: number;
  nodesep: number;
}

export interface TreeData {
  people: Person[];
  families: Family[];
  style: StyleConfig;
}

export type ViewType = 'home' | 'view' | 'edit' | 'settings';
export type Language = 'en' | 'it';
