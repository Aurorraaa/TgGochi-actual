
export enum PetType {
  RAVEN = 'Raven',
  FOX = 'Fox',
  OWL = 'Owl',
  CAT = 'Cat'
}

export enum PetMood {
  HAPPY = 'Happy',
  SARCASM = 'Sarcastic',
  SLEEPY = 'Sleepy',
  ANGRY = 'Angry',
  GENIUS = 'Genius'
}

export interface Accessory {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'item';
  price: number;
  imageUrl: string;
}

export interface UserState {
  coins: number;
  energy: number;
  intellect: number;
  level: number;
  experience: number;
  petName: string;
  petType: PetType;
  hasSelectedPet: boolean;
  accessories: string[]; // IDs of owned accessories
  equipped: string[]; // IDs of equipped accessories
  lastQuizTime?: number;
  facts: string[]; // Memory of the AI
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
