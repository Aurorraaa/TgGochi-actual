
import { Accessory, PetType } from './types';

export const INITIAL_USER_STATE = {
  coins: 100,
  energy: 100,
  intellect: 1,
  level: 1,
  experience: 0,
  petName: '',
  petType: PetType.OWL,
  hasSelectedPet: false,
  accessories: [],
  equipped: [],
  facts: []
};

export const ACCESSORIES: Accessory[] = [
  { id: 'top_hat', name: 'Кибер-цилиндр', type: 'hat', price: 50, imageUrl: '🎩' },
  { id: 'glasses_neon', name: 'Неоновый визор', type: 'glasses', price: 75, imageUrl: '🕶️' },
  { id: 'coffee', name: 'Бесконечный кофе', type: 'item', price: 120, imageUrl: '☕' },
  { id: 'crown', name: 'Корона злодея', type: 'hat', price: 200, imageUrl: '👑' },
  { id: 'monocle', name: 'Монокль гения', type: 'glasses', price: 150, imageUrl: '🧐' },
];

export const PET_ASSETS: Record<PetType, string> = {
  [PetType.RAVEN]: '🐦‍⬛',
  [PetType.FOX]: '🦊',
  [PetType.OWL]: '🦉',
  [PetType.CAT]: '🐈',
};

export const PET_DATA = [
  {
    type: PetType.RAVEN,
    icon: '🐦‍⬛',
    vibe: 'Злодейский',
    description: 'Темный стратег. Обожает секреты и долгосрочные манипуляции.',
    color: 'from-purple-600 to-indigo-900'
  },
  {
    type: PetType.FOX,
    icon: '🦊',
    vibe: 'Саркастичный',
    description: 'Остроумный трикстер. Высмеет тебя прежде, чем поможет.',
    color: 'from-orange-500 to-red-800'
  },
  {
    type: PetType.OWL,
    icon: '🦉',
    vibe: 'Гениальный',
    description: 'Высокомерный ученый. Одержим данными и твоим скудоумием.',
    color: 'from-cyan-500 to-blue-900'
  },
  {
    type: PetType.CAT,
    icon: '🐈',
    vibe: 'Безразличный',
    description: 'Космический властелин. Помогает только ради забавы.',
    color: 'from-pink-500 to-rose-900'
  }
];
