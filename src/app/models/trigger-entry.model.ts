export interface TriggerEntry {
  id: string;
  date: string;
  time: string;
  intensity: number;
  location: string;
  activity: string;
  withWhom: string;
  emotions: string[];
  physicalSensations: string;
  trigger: string;
  copingStrategy: string[];
  copingDetails: string;
  outcome: 'success' | 'partial' | 'relapse';
  whatHelped: string;
  whatDidntHelp: string;
  duration: number;
  notes: string;
}

export interface WeeklyStats {
  totalCravings: number;
  successfullyManaged: number;
  successRate: number;
  mostCommonTriggers: { trigger: string; count: number }[];
  mostCommonEmotions: { emotion: string; count: number }[];
  mostCommonTimes: { timeSlot: string; count: number }[];
  averageIntensity: number;
  averageDuration: number;
  bestCopingStrategies: { strategy: string; successRate: number }[];
}

export const EMOTION_OPTIONS = [
  'Gestresst',
  'Gelangweilt',
  'Einsam',
  'Traurig/niedergeschlagen',
  'Ängstlich/nervös',
  'Wütend/frustriert',
  'Müde/erschöpft',
  'Glücklich/aufgeregt',
  'Entspannt'
];

export const COPING_STRATEGY_OPTIONS = [
  'Urge Surfing',
  'Atemübung',
  'Bewegung/Sport',
  'Meditation',
  'Ablenkung',
  'Situation verlassen',
  'Person kontaktiert',
  'Andere'
];
