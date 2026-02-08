
import { TreeData, StyleConfig } from './types';

export const DEFAULT_STYLE: StyleConfig = {
  family_label_default: '💍',
  edge_width: 2,
  node_size_person: { width: 140, height: 60 },
  node_size_family: 30,
  ranksep: 120,
  nodesep: 80,
};

export const DEMO_DATA: TreeData = {
  people: [
    { id: 'p1', name: 'Mario Rossi', born: '1935', died: '2010', notes: 'Grandfather / Nonno' },
    { id: 'p2', name: 'Anna Bianchi', born: '1938', died: '', notes: 'Grandmother / Nonna' },
    { id: 'p3', name: 'Luigi Rossi', born: '1965', died: '', notes: 'Father / Padre' },
    { id: 'p4', name: 'Elena Neri', born: '1968', died: '', notes: 'Mother / Madre' },
    { id: 'p5', name: 'Marco Rossi', born: '1995', died: '', notes: 'Son / Figlio' },
    { id: 'p6', name: 'Sofia Rossi', born: '1998', died: '', notes: 'Daughter / Figlia' },
  ],
  families: [
    {
      id: 'FAM_MARIO_ANNA',
      label: '💍 1960',
      spouses: ['p1', 'p2'],
      children: ['p3'],
      notes: 'Main line',
    },
    {
      id: 'FAM_LUIGI_ELENA',
      label: '💍 1990',
      spouses: ['p3', 'p4'],
      children: ['p5', 'p6'],
      notes: 'Second generation',
    },
  ],
  style: DEFAULT_STYLE,
};

export const STORAGE_KEY = 'genealogy_tree_data_v2'; // Bumped version
