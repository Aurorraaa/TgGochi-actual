
import React, { useState, useEffect } from 'react';
import { UserState, Message, PetType, PetMood } from './types';
import { INITIAL_USER_STATE, ACCESSORIES, PET_DATA } from './constants';
import PetDisplay from './components/PetDisplay';
import { chatWithBuddy, generateQuiz } from './geminiService';
import { 
  MessageSquare, 
  Gamepad2, 
  ShoppingBag, 
  User, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Coins,
  BrainCircuit,
  Settings,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('ai_buddy_user_state');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'quiz' | 'shop'>('home');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "С возвращением, углеродная форма жизни. Готов подтянуть свой крошечный мозг?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState<PetMood>(PetMood.HAPPY);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Для процесса выбора
  const [tempName, setTempName] = useState('');
  const [selectedType, setSelectedType] = useState<PetType>(PetType.OWL);

  // Сохранение состояния
  useEffect(() => {
    localStorage.setItem('ai_buddy_user_state', JSON.stringify(userState));
  }, [userState]);

  // Обработчики
  const handleSelectPet = () => {
    if (!tempName.trim()) return;
    setUserState(prev => ({
      ...prev,
      petName: tempName,
      petType: selectedType,
      hasSelectedPet: true
    }));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', content: chatInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setIsTyping(true);
    setMood(PetMood.SARCASM);

    try {
      const response = await chatWithBuddy(newMessages, userState);
      setMessages([...newMessages, { role: 'model', content: response || "Мои цепи перегорели. Спроси еще раз." }]);
      
      setUserState(prev => {
        const newExp = prev.experience + 5;
        const levelUp = newExp >= 100;
        return {
          ...prev,
          experience: levelUp ? 0 : newExp,
          level: levelUp ? prev.level + 1 : prev.level,
          intellect: prev.intellect + 1,
          energy: Math.max(0, prev.energy - 2)
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setMood(PetMood.HAPPY);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    try {
      const quiz = await generateQuiz(userState);
      setCurrentQuiz(quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (index === currentQuiz.correctIndex) {
      setMood(PetMood.GENIUS);
      setUserState(prev => ({
        ...prev,
        coins: prev.coins + 20,
        intellect: prev.intellect + 10,
        experience: prev.experience + 25,
        energy: Math.max(0, prev.energy - 5)
      }));
      alert(`Верно! "${currentQuiz.explanation}"`);
    } else {
      setMood(PetMood.ANGRY);
      alert(`Ошибка, примитив! Правильный ответ был: ${currentQuiz.options[currentQuiz.correctIndex]}.`);
    }
    setCurrentQuiz(null);
  };

  const buyAccessory = (id: string) => {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (acc && userState.coins >= acc.price && !userState.accessories.includes(id)) {
      setUserState(prev => ({
        ...prev,
        coins: prev.coins - acc.price,
        accessories: [...prev.accessories, id]
      }));
    }
  };

  const toggleAccessory = (id: string) => {
    setUserState(prev => {
      const isEquipped = prev.equipped.includes(id);
      return {
        ...prev,
        equipped: isEquipped 
          ? prev.equipped.filter(e => e !== id) 
          : [...prev.equipped, id]
      };
    });
  };

  // Экран приветствия/выбора
  if (!userState.hasSelectedPet) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 p-6">
        <div className="text-center mb-10 space-y-2 pt-8">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">ИИ-Напарник</h1>
          <p className="text-slate-400 text-sm">Выбери партнера для интеллектуального доминирования.</p>
        </div>

        <div className="space-y-4 mb-8">
          {PET_DATA.map(pet => (
            <button
              key={pet.type}
              onClick={() => setSelectedType(pet.type)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group ${
                selectedType === pet.type 
                  ? 'border-blue-500 bg-slate-900 ring-2 ring-blue-500/20' 
                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pet.color} flex items-center justify-center text-4xl shadow-inner`}>
                {pet.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{pet.type}</span>
                  <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{pet.vibe}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{pet.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <input 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Дай имя напарнику..."
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
          />
          <button 
            disabled={!tempName.trim()}
            onClick={handleSelectPet}
            className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            ПРИЗВАТЬ
          </button>
        </div>
      </div>
    );
  }

  // Основное приложение
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 shadow-xl border-x border-slate-800">
      
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="font-mono font-bold text-lg">{userState.coins}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
             <BrainCircuit className="w-4 h-4 text-cyan-400" />
             <span className="text-xs font-bold">{userState.intellect} IQ</span>
           </div>
           <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            <PetDisplay userState={userState} mood={mood} />
            
            <section className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
               <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4" /> 
                 Статистика напарника
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                   <div className="text-[10px] text-slate-400 font-bold uppercase">Энергия</div>
                   <div className="text-xl font-mono text-yellow-400">{userState.energy}%</div>
                 </div>
                 <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                   <div className="text-[10px] text-slate-400 font-bold uppercase">Опыт</div>
                   <div className="text-xl font-mono text-blue-400">{userState.experience}/100</div>
                 </div>
               </div>
            </section>

            <button 
              onClick={() => setActiveTab('quiz')}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Zap className="w-5 h-5" />
              СТИМУЛИРОВАТЬ НЕЙРОНЫ
            </button>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[70vh] p-4">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-slate-800 p-3 rounded-2xl animate-pulse text-xs text-slate-400">
                     {userState.petName} оценивает твою грамматику...
                   </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Поговори с напарником..."
                className="flex-1 bg-transparent border-none outline-none p-2 text-sm text-white"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 p-2 rounded-xl text-white"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="p-6">
            {!currentQuiz && !quizLoading && (
              <div className="text-center py-12 space-y-6">
                <BrainCircuit className="w-16 h-16 text-blue-400 mx-auto opacity-50" />
                <h2 className="text-2xl font-bold">Расширение мозга</h2>
                <p className="text-slate-400 text-sm">Правильные ответы тешат самолюбие {userState.petName} и твой кошелек.</p>
                <button 
                  onClick={loadQuiz}
                  className="bg-blue-600 px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-900/40"
                >
                  Начать испытание
                </button>
              </div>
            )}
            
            {quizLoading && (
              <div className="text-center py-12 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Сбор данных из облака...</p>
              </div>
            )}

            {currentQuiz && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-lg font-medium leading-relaxed">
                  {currentQuiz.question}
                </div>
                <div className="space-y-3">
                  {currentQuiz.options.map((opt: string, i: number) => (
                    <button 
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-colors flex justify-between items-center group"
                    >
                      <span className="text-sm">{opt}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold px-2">Рынок</h2>
            <div className="grid grid-cols-2 gap-4">
              {ACCESSORIES.map(acc => {
                const isOwned = userState.accessories.includes(acc.id);
                const isEquipped = userState.equipped.includes(acc.id);
                return (
                  <div key={acc.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-3">
                    <div className="text-5xl bg-slate-800 w-full h-24 flex items-center justify-center rounded-xl">
                      {acc.imageUrl}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold truncate">{acc.name}</div>
                      <div className="text-xs text-yellow-400 font-mono">{acc.price} 🪙</div>
                    </div>
                    {isOwned ? (
                      <button 
                        onClick={() => toggleAccessory(acc.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold ${isEquipped ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                      >
                        {isEquipped ? 'Снять' : 'Надеть'}
                      </button>
                    ) : (
                      <button 
                        disabled={userState.coins < acc.price}
                        onClick={() => buyAccessory(acc.id)}
                        className="w-full py-2 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Купить
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-400' : 'text-slate-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">ГЛАВНАЯ</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-blue-400' : 'text-slate-500'}`}>
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-bold">ЧАТ</span>
        </button>
        <button onClick={() => setActiveTab('quiz')} className={`flex flex-col items-center gap-1 ${activeTab === 'quiz' ? 'text-blue-400' : 'text-slate-500'}`}>
          <Gamepad2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">КВИЗ</span>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center gap-1 ${activeTab === 'shop' ? 'text-blue-400' : 'text-slate-500'}`}>
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[10px] font-bold">РЫНОК</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
