// src/app/models/template.model.ts

export interface TriggerTemplate {
  id: string;
  name: string;
  emoji: string;
  location: string;
  activity: string;
  emotions: string[];
  trigger: string;
  copingStrategy: string[];
  isCustom: boolean;
}

export const DEFAULT_TEMPLATES: TriggerTemplate[] = [
  {
    id: 'template-1',
    name: 'Nach der Arbeit',
    emoji: '💼',
    location: 'Zuhause',
    activity: 'Nach Hause kommen, entspannen',
    emotions: ['Gestresst', 'Müde/erschöpft'],
    trigger: 'Anstrengender Arbeitstag, Übergang vom Stress zur Entspannung',
    copingStrategy: ['Urge Surfing', 'Bewegung/Sport', 'Meditation'],
    isCustom: false
  },
  {
    id: 'template-2',
    name: 'Langeweile am Abend',
    emoji: '📺',
    location: 'Zuhause',
    activity: 'Fernsehen, auf dem Sofa',
    emotions: ['Gelangweilt', 'Einsam'],
    trigger: 'Nichts zu tun, alte Gewohnheit aktiviert sich',
    copingStrategy: ['Ablenkung', 'Person kontaktiert', 'Andere'],
    isCustom: false
  },
  {
    id: 'template-3',
    name: 'Soziale Situation',
    emoji: '👥',
    location: 'Unterwegs',
    activity: 'Mit Freunden/Familie',
    emotions: ['Ängstlich/nervös', 'Gestresst'],
    trigger: 'Sozialer Druck, andere machen es auch',
    copingStrategy: ['Situation verlassen', 'Atemübung', 'Urge Surfing'],
    isCustom: false
  },
  {
    id: 'template-4',
    name: 'Morgendliche Routine',
    emoji: '☕',
    location: 'Zuhause',
    activity: 'Morgenroutine, Kaffee trinken',
    emotions: ['Müde/erschöpft', 'Gestresst'],
    trigger: 'Gewohnte Morgenroutine, automatisches Verlangen',
    copingStrategy: ['Atemübung', 'Bewegung/Sport', 'Ablenkung'],
    isCustom: false
  },
  {
    id: 'template-5',
    name: 'Frustration/Ärger',
    emoji: '😤',
    location: 'Variabel',
    activity: 'Nach frustrierender Situation',
    emotions: ['Wütend/frustriert', 'Gestresst'],
    trigger: 'Konflikt, Enttäuschung, Dinge laufen nicht wie geplant',
    copingStrategy: ['Bewegung/Sport', 'Urge Surfing', 'Meditation'],
    isCustom: false
  }
];
