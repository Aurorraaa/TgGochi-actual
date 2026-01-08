
import React from 'react';
import { UserState, PetMood } from '../types';
import { PET_ASSETS, ACCESSORIES } from '../constants';

interface PetDisplayProps {
  userState: UserState;
  mood: PetMood;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ userState, mood }) => {
  const equippedItems = ACCESSORIES.filter(a => userState.equipped.includes(a.id));
  
  // Animation mapping based on mood
  const getAnimationClass = () => {
    switch (mood) {
      case PetMood.HAPPY: return 'animate-bounce';
      case PetMood.ANGRY: return 'animate-ping';
      case PetMood.SLEEPY: return 'opacity-60';
      case PetMood.GENIUS: return 'scale-110 brightness-125';
      default: return 'animate-pulse';
    }
  };

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700 shadow-2xl group">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
      
      {/* Level Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-blue-400">
          Уровень {userState.level}
        </div>
      </div>

      {/* Evolution Stage Indicator */}
      <div className="absolute top-4 right-4 z-10 text-right">
         <div className="text-[10px] text-slate-400 uppercase font-bold">Интеллект</div>
         <div className="text-xl font-mono text-cyan-400">{userState.intellect}</div>
      </div>

      {/* Main Pet Body */}
      <div className={`relative flex flex-col items-center transition-all duration-500 ${getAnimationClass()}`}>
        <div className="text-9xl filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          {PET_ASSETS[userState.petType]}
        </div>

        {/* Equipped Accessories Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {equippedItems.map(acc => (
            <div 
              key={acc.id} 
              className={`absolute text-4xl transform ${acc.type === 'hat' ? '-top-6 left-1/2 -translate-x-1/2' : acc.type === 'glasses' ? 'top-8 left-1/2 -translate-x-1/2 scale-110' : 'bottom-0 -right-4'}`}
            >
              {acc.imageUrl}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bars Overlay */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-yellow-400 transition-all duration-1000" 
            style={{ width: `${userState.energy}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Энергия: {userState.energy}%</span>
          <span>{userState.petName} ({userState.petType})</span>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
