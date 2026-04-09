import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Volume2, Sparkles, Smartphone, BatteryCharging, 
  Shield, Brain, Activity, CheckSquare, RefreshCw, QrCode,
  Clock, HeartPulse, MapPin, Lock, X, Building, ShieldCheck,
  Headphones, AlertCircle, ShoppingBag, Target, TrendingUp, DollarSign, Award, Ear, Wifi, Battery
} from 'lucide-react';

const useAudioEngine = () => {
  const audioCtxRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const speechIntervalRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) { const AudioContext = window.AudioContext || window.webkitAudioContext; audioCtxRef.current = new AudioContext(); }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const stopAll = () => {
    if (backgroundAudioRef.current) { backgroundAudioRef.current.pause(); backgroundAudioRef.current.currentTime = 0; }
    clearInterval(speechIntervalRef.current);
    window.speechSynthesis.cancel();
  };

  const startCafeSimulation = (mode) => {
    initAudio(); 
    
    if (!backgroundAudioRef.current) {
      const audio = new Audio('https://www.soundjay.com/misc/sounds/restaurant-1.mp3');
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      backgroundAudioRef.current = audio;
      audio.play().catch(e => console.log("Audio play prevented by browser:", e));
    } else if (backgroundAudioRef.current.paused) {
      backgroundAudioRef.current.play().catch(e => console.log(e));
    }

    let bgVol = 1.0; let speechVol = 0.3;

    if (mode === 'untreated') { bgVol = 1.0; speechVol = 0.2; } 
    else if (mode === 'directional') { bgVol = 0.4; speechVol = 0.6; } 
    else if (mode === 'suppression') { bgVol = 0.1; speechVol = 0.9; }
    else if (mode === 'active') { bgVol = 0.02; speechVol = 1.0; }

    backgroundAudioRef.current.volume = bgVol;
    window.speechSynthesis.cancel(); 
    
    const longSentence = "I was walking down to the market the other day, and the weather was absolutely beautiful. The sun was shining, a light breeze was blowing, and I ran into an old friend from university. We ended up chatting for over an hour about our travel plans for the summer, the new restaurants opening downtown, and how much the neighborhood has changed over the past few years.";
    
    const utterance = new SpeechSynthesisUtterance(longSentence);
    utterance.rate = 0.9; 
    utterance.volume = speechVol;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      if (backgroundAudioRef.current && !backgroundAudioRef.current.paused) {
        window.speechSynthesis.speak(utterance);
      }
    };
    
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return { startCafeSimulation, stopAll, initAudio };
};

export default function App() {
  const [step, setStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [simMode, setSimMode] = useState('untreated');
  
  // Interactive Dashboard States
  const [activeWearableTab, setActiveWearableTab] = useState(0);
  const [activeEduTab, setActiveEduTab] = useState(0);
  const [activeTechTab, setActiveTechTab] = useState(0);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [frictionScore, setFrictionScore] = useState(0);

  const audio = useAudioEngine();
  const patientSteps = 10; 
  const progress = (step / patientSteps) * 100;

  // GHOST PROTOCOL (60-Second Idle Timer)
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (step > 0 && step < 20) {
          audio.stopAll();
          setStep(0);
          setFrictionScore(0);
          setConsentGiven(false);
        }
      }, 60000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [step, audio]);

  useEffect(() => {
    if (step === 7) {
      setSimMode('untreated');
      audio.startCafeSimulation('untreated');
    } else {
      audio.stopAll();
    }
  }, [step]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2026') { setShowPinModal(false); setPinInput(''); setStep(20); }
    else { alert('Incorrect Access Code'); setPinInput(''); }
  };

  const next = (points = 0) => { 
    setFrictionScore(prev => prev + points);
    audio.stopAll(); setStep(s => s + 1); 
  };
  
  const back = () => { audio.stopAll(); setStep(s => Math.max(0, s - 1)); };

  const RHButton = ({ children, onClick, variant="p", className="", disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-10 py-5 rounded-full transition-all duration-500 text-xl font-light ${disabled ? "bg-[#3E3E3E]/20 text-[#3E3E3E]/50 cursor-not-allowed" : variant === "p" ? "bg-[#1B5234] text-[#F9F8F4] hover:bg-[#133c26] active:scale-95 shadow-md" : "bg-[#E8E4DB] text-[#3E3E3E] hover:bg-[#DAD4C7] active:scale-95"} ${className}`}>{children}</button>
  );

  const bgClass = step < 20 ? "bg-[#F9F8F4] text-[#3E3E3E]" : "bg-white text-[#3E3E3E]";

  const eduTabs = [
    { icon: <Brain size={24}/>, title: "The Cognitive Tax", content: "When you lose high frequencies, your brain works overtime to 'fill in the blanks.' This Cognitive Load is the reason socializing can leave you physically exhausted at the end of the day." },
    { icon: <Clock size={24}/>, title: "The Decade of Delay", content: "The average adult struggles with hearing decline for 7 to 10 years before seeking help. That is a decade of missed punchlines and misunderstood whispers. Treating it early preserves neural pathways." },
    { icon: <RefreshCw size={24}/>, title: "Modern Truths", content: "The stigma is outdated. Constantly asking 'pardon?' ages us far more than wearing a hidden micro-computer. Modern tech doesn't just turn up the volume; it uses AI to isolate human connection." }
  ];

  return (
    <div className={`h-screen w-full font-serif overflow-hidden relative flex flex-col items-center justify-center p-8 text-center transition-colors duration-1000 ${bgClass}`}>
      
      {/* GLOBAL HEADER */}
      <div className="fixed top-6 left-0 w-full px-8 flex justify-between items-center z-50">
        <div onClick={() => { audio.stopAll(); setStep(0); setFrictionScore(0); }} className="cursor-pointer flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-[#1B5234]/10 hover:bg-white transition-all active:scale-95">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <span className="hidden text-2xl font-serif font-bold text-[#1B5234] tracking-tight">Sobeys</span>
        </div>
        {step < 20 && (
          <div onClick={() => setShowPinModal(true)} className="flex items-center gap-2 text-[#1B5234] font-sans font-bold text-sm tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity bg-white/80 px-5 py-3 rounded-2xl backdrop-blur-sm border border-[#1B5234]/10 shadow-sm active:scale-95">
            <Lock size={16} /> Enterprise Portal
          </div>
        )}
      </div>

      {step > 0 && step <= patientSteps && (<div className="fixed top-0 left-0 h-1.5 bg-[#E8E4DB] w-full z-50"><div className="h-full bg-[#1B5234] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>)}
      {step < 20 && (<div className="fixed bottom-0 left-0 w-full text-center py-3 bg-[#F9F8F4]/90 backdrop-blur-sm z-40 pointer-events-none border-t border-[#3E3E3E]/10"><p className="text-[10px] uppercase tracking-[0.1em] text-[#3E3E3E]/70 font-sans font-bold flex items-center justify-center gap-2"><AlertCircle size={12}/> Soundcheck is a lifestyle wellness screener, not a medical diagnostic tool.</p></div>)}

      <main className="max-w-4xl w-full flex flex-col justify-center items-center relative z-10 pb-12 mt-12">

        {/* 1. WELCOME & QR HOOK */}
        {step === 0 && (
          <div className="space-y-8 animate-fade-in relative w-full flex flex-col items-center">
            <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-2">Experience AI-Enhanced Hearing</h1>
            <p className="text-[#3E3E3E] text-2xl font-light">Take your 3-Minute Hearing Wellness Check.</p>
            <div className="pt-8 w-full max-w-2xl flex flex-col items-center gap-8 border-t border-[#1B5234]/10">
              <RHButton onClick={() => next(0)} className="w-full max-w-sm !py-6 text-2xl shadow-lg">Begin Wellness Check</RHButton>
              <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-[#3E3E3E]/10">
                <div className="bg-[#E8E4DB] p-3 rounded-2xl"><QrCode size={40} className="text-[#1B5234]"/></div>
                <div className="text-left"><p className="font-bold text-[#3E3E3E] uppercase tracking-widest text-sm">In a rush?</p><p className="font-light text-sm opacity-80">Scan to complete securely on your mobile device.</p></div>
              </div>
            </div>
          </div>
        )}
        
        {/* HHIE-S QUESTIONS */}
        {step === 1 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Media Check</h2><p className="text-2xl font-light opacity-90">Does the TV volume frequently cause disagreements, or do you find yourself needing captions to follow the dialogue?</p><div className="flex justify-center gap-4"><RHButton onClick={() => next(1)}>Frequently</RHButton><RHButton onClick={() => next(0)} variant="s">Rarely / Never</RHButton></div></div>)}
        {step === 2 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Crowd Check</h2><p className="text-2xl font-light opacity-90">In a lively bistro or family gathering, how much effort does it take to follow the punchline of a joke?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">It requires intense concentration</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">I catch most of it, but it's tiring</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">I hear everything effortlessly</button></div></div>)}
        {step === 3 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Social Check</h2><p className="text-2xl font-light opacity-90">Do you ever find yourself avoiding social gatherings or restaurants because listening in the noise is simply too exhausting?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">Yes, I often avoid noisy places</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">Sometimes, depending on my energy</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">No, I never avoid social situations</button></div></div>)}
        
        {/* 5. THE EDUCATION DASHBOARD */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-5xl italic text-[#3E3E3E] mb-6">The Hidden Impact</h2>
            <div className="w-full flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[3rem] border border-[#1B5234]/10 shadow-lg">
              <div className="flex flex-col gap-3 flex-1">
                {eduTabs.map((tab, idx) => (
                  <button key={idx} onClick={() => setActiveEduTab(idx)} className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 border-2 text-left ${activeEduTab === idx ? 'bg-[#F9F8F4] border-[#1B5234] shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50 opacity-60'}`}>
                    <div className={`${activeEduTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.icon}</div>
                    <span className={`font-bold text-lg ${activeEduTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.title}</span>
                  </button>
                ))}
              </div>
              <div className="flex-[1.5] bg-[#F9F8F4] rounded-2xl p-8 flex flex-col justify-center text-left border border-[#E8E4DB]">
                <div className="text-[#1B5234] mb-6">{eduTabs[activeEduTab].icon}</div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">{eduTabs[activeEduTab].title}</h3>
                <p className="text-xl font-light leading-relaxed text-[#3E3E3E]/90">{eduTabs[activeEduTab].content}</p>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>Continue to Technology</RHButton></div>
          </div>
        )}

        {/* 6. SPOT THE TECH (Merged) */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl">
            <h2 className="text-5xl italic text-[#3E3E3E] mb-6">Invisible Sophistication</h2>
            <div className="w-full flex flex-col md:flex-row gap-6">
              <div onClick={() => setActiveTechTab(0)} className={`flex-1 p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${activeTechTab === 0 ? 'bg-white border-[#1B5234] shadow-lg scale-105 z-10' : 'bg-[#E8E4DB]/30 border-transparent hover:bg-white/50 opacity-70'}`}>
                <h3 className="text-2xl font-bold text-[#3E3E3E] mb-2">Receiver-in-Canal (RIC)</h3>
                <p className="font-light opacity-80 mb-8 h-16">The micro-computer sits invisibly behind the ear, delivering pristine audio.</p>
                <div className="relative w-full aspect-square bg-[#F9F8F4] rounded-2xl flex items-center justify-center border border-[#1B5234]/10 overflow-hidden">
                  <Ear size={120} className="text-[#3E3E3E]/10 absolute" />
                  <div className="absolute top-1/4 right-1/4 flex items-center gap-2"><div className="w-4 h-4 bg-[#1B5234] rounded-full animate-ping absolute"></div><div className="w-4 h-4 bg-[#1B5234] rounded-full relative z-10"></div></div>
                </div>
              </div>
              <div onClick={() => setActiveTechTab(1)} className={`flex-1 p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${activeTechTab === 1 ? 'bg-white border-[#1B5234] shadow-lg scale-105 z-10' : 'bg-[#E8E4DB]/30 border-transparent hover:bg-white/50 opacity-70'}`}>
                <h3 className="text-2xl font-bold text-[#3E3E3E] mb-2">Custom In-The-Ear</h3>
                <p className="font-light opacity-80 mb-8 h-16">Molded to your anatomy. Sits deep within the ear canal, 100% hidden.</p>
                <div className="relative w-full aspect-square bg-[#F9F8F4] rounded-2xl flex items-center justify-center border border-[#1B5234]/10 overflow-hidden">
                  <Ear size={120} className="text-[#3E3E3E]/10 absolute" />
                  <div className="absolute inset-0 flex items-center justify-center translate-x-4"><div className="w-4 h-4 bg-[#1B5234] rounded-full animate-ping absolute"></div><div className="w-4 h-4 bg-[#1B5234] rounded-full relative z-10"></div></div>
                </div>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>Experience AI Audio</RHButton></div>
          </div>
        )}
        
        {/* 7. HEAR THE DIFFERENCE */}
        {step === 6 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <div className="mx-auto bg-white w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-sm border border-[#1B5234]/10"><Sparkles size={40} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#3E3E3E]">Hear The Difference</h2>
            <p className="text-2xl font-light leading-relaxed text-[#3E3E3E]/90 text-center px-4">Modern technology uses AI to instantly suppress background noise. Tap the enhancements below to hear the clarity.</p>
            <div className="w-full bg-white p-6 rounded-[3rem] border border-[#1B5234]/20 shadow-lg mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => handleSimChange('untreated')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 ${simMode === 'untreated' ? 'bg-[#F9F8F4] border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Ear size={32} className={simMode === 'untreated' ? 'text-[#1B5234]' : ''}/><span className="font-bold text-lg leading-tight">Standard<br/>Hearing</span></button>
                <button onClick={() => handleSimChange('directional')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 ${simMode === 'directional' ? 'bg-[#F9F8F4] border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Volume2 size={32} className={simMode === 'directional' ? 'text-[#1B5234]' : ''}/><span className="font-bold text-lg leading-tight">Directional<br/>Focus</span></button>
                <button onClick={() => handleSimChange('suppression')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 ${simMode === 'suppression' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Shield size={32} className={simMode === 'suppression' ? 'text-white' : ''}/><span className="font-bold text-lg leading-tight">Noise<br/>Suppression</span></button>
                <button onClick={() => handleSimChange('active')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 ${simMode === 'active' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-xl scale-110' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Sparkles size={32} className={simMode === 'active' ? 'text-white' : ''}/><span className="font-bold text-lg leading-tight">AI Voice<br/>Clarity</span></button>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>Continue</RHButton></div>
          </div>
        )}

        {/* 8. WEARABLES DASHBOARD */}
        {step === 7 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-5xl italic text-[#3E3E3E] mb-6">High-Performance Wearables</h2>
            <div className="w-full flex flex-col md:flex-row gap-8 bg-white p-8 rounded-[3rem] border border-[#1B5234]/10 shadow-lg">
              <div className="flex flex-col gap-4 flex-1">
                {[
                  { icon: <Wifi size={32}/>, title: "Bluetooth Stream", desc: "Stream phone calls, podcasts, and music directly into your ears with pristine, zero-latency fidelity. Your phone stays in your pocket.", glow: "bg-blue-400" },
                  { icon: <Battery size={32}/>, title: "All-Day Battery", desc: "Forget tiny batteries. Drop them in the magnetic case at night and enjoy up to 24 hours of continuous AI processing on a single charge.", glow: "bg-green-400" },
                  { icon: <Activity size={32}/>, title: "Health Tracking", desc: "Built-in biometric sensors track your physical steps, heart rate, and overall cognitive engagement throughout the day.", glow: "bg-red-400" }
                ].map((tab, idx) => (
                  <button key={idx} onClick={() => setActiveWearableTab(idx)} className={`p-6 rounded-3xl flex items-center gap-4 transition-all duration-300 border-2 text-left ${activeWearableTab === idx ? 'bg-[#F9F8F4] border-[#1B5234] shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50 opacity-60'}`}>
                    <div className={`${activeWearableTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.icon}</div>
                    <span className={`font-bold text-xl ${activeWearableTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.title}</span>
                  </button>
                ))}
              </div>
              <div className="flex-[1.5] bg-[#F9F8F4] rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-[#E8E4DB] relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 ${['bg-blue-400','bg-green-400','bg-red-400'][activeWearableTab]} rounded-full blur-[80px] opacity-20 transition-colors duration-700`}></div>
                <div className="text-[#1B5234] mb-8 animate-fade-in">{[<Wifi size={64}/>, <Battery size={64}/>, <Activity size={64}/>][activeWearableTab]}</div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4 animate-fade-in">{["Bluetooth Stream", "All-Day Battery", "Health Tracking"][activeWearableTab]}</h3>
                <p className="text-xl font-light leading-relaxed text-[#3E3E3E]/80 animate-fade-in">{["Stream phone calls, podcasts, and music directly into your ears with pristine fidelity.", "Drop them in the magnetic case at night and enjoy up to 24 hours of continuous processing.", "Built-in biometric sensors track your physical steps, heart rate, and cognitive engagement."][activeWearableTab]}</p>
              </div>
            </div>
            <div className="pt-8"><RHButton onClick={() => next(0)}>View My Results</RHButton></div>
          </div>
        )}
        
        {/* 9. THE FORK (Reveal) */}
        {step === 8 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl">
            <div className="mx-auto bg-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#1B5234]/10"><UserCheck size={48} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#1B5234] mb-8">Your Listening Profile</h2>
            <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-[#1B5234]/10 text-left">
              {frictionScore === 0 ? (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your psychosocial baseline indicates a very low level of social friction. Your natural hearing is serving you well.</p>
                  <p className="font-bold text-xl text-[#3E3E3E] uppercase tracking-widest mb-2 mt-8">Your Next Step</p>
                  <p className="text-xl opacity-90 font-light">Explore <span className="font-bold text-[#1B5234]">Situational Enhancers</span> (like Apple AirPods Pro) to protect your baseline and isolate speech only when you need it.</p>
                </>
              ) : (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your psychosocial baseline indicates elevated social friction. You are expanding a high amount of cognitive energy to stay connected in noise.</p>
                  <p className="font-bold text-xl text-[#3E3E3E] uppercase tracking-widest mb-2 mt-8">Your Next Step</p>
                  <p className="text-xl opacity-90 font-light">Explore <span className="font-bold text-[#1B5234]">Invisible AI Technology</span> to permanently reduce your cognitive tax and effortlessly restore clarity.</p>
                </>
              )}
            </div>
            <div className="pt-8"><RHButton onClick={() => next(0)}>Claim Scene+ Reward</RHButton></div>
          </div>
        )}

        {/* 10. SCENE+ VAULT (Lead Capture) */}
        {step === 9 && (
          <div className="w-full max-w-3xl space-y-8 animate-fade-in text-left">
            <div className="bg-gradient-to-br from-gray-900 to-[#1B5234] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <Award className="absolute -right-10 -bottom-10 text-white/10" size={200} />
              
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                  <div className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-xl tracking-widest uppercase shadow-md">Scene+</div>
                  <h2 className="text-4xl font-light">Earn 50 Points Today</h2>
                </div>
                
                <p className="text-xl font-light opacity-90">Securely save your Listening Profile to your Sobeys Pharmacy account and claim your points instantly.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full bg-white/10 text-white placeholder-white/60 p-4 rounded-2xl outline-none font-serif italic text-lg border border-white/20 backdrop-blur-sm" />
                  <input type="tel" placeholder="Mobile Number" className="w-full bg-white/10 text-white placeholder-white/60 p-4 rounded-2xl outline-none font-serif italic text-lg border border-white/20 backdrop-blur-sm" />
                  <input type="text" placeholder="Scene+ Card (16 Digits)" className="w-full col-span-2 bg-white/20 text-white placeholder-white/70 p-5 rounded-2xl outline-none font-mono text-xl tracking-widest border border-white/30 backdrop-blur-sm shadow-inner" maxLength={16} />
                </div>

                <div className="flex items-start gap-4 bg-black/20 p-4 rounded-2xl">
                  <button onClick={() => setConsentGiven(!consentGiven)} className="mt-1 shrink-0">{consentGiven ? <CheckSquare size={28} className="text-white" /> : <div className="w-7 h-7 border-2 border-white/50 rounded bg-white/10" />}</button>
                  <p className="text-sm font-light opacity-90 leading-snug font-sans">I consent to securely save my profile. A Sobeys Health Partner may contact me regarding situational or invisible hearing solutions based on my results.</p>
                </div>

                <button onClick={() => { alert("Profile Saved! Points Awarded."); setStep(0); setFrictionScore(0); }} disabled={!consentGiven} className={`w-full py-6 rounded-full font-bold uppercase tracking-widest text-lg transition-all ${consentGiven ? 'bg-white text-[#1B5234] hover:scale-[1.02] shadow-xl' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}>Save Profile & Claim Points</button>
                
                <div className="flex justify-center items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-bold mt-2"><ShieldCheck size={16}/> PIPEDA Compliant & Encrypted</div>
              </div>
            </div>
          </div>
        )}

        {/* --- LAYER 2: SOBEYS RETAIL ENTERPRISE PORTAL (20-24) --- */}
        
        {step === 20 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><DollarSign size={32} /></div><div><h2 className="text-4xl font-light">The U.S. OTC Gold Rush</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Retail Market Precedent</p></div></div>
            </div>
            <p className="text-2xl italic leading-relaxed text-[#3E3E3E]/80 border-l-4 border-[#1B5234] pl-6 mb-8">In 2022, the FDA legalized Over-The-Counter (OTC) hearing aids. U.S. pharmacies immediately converted aisle space into a high-margin consumer electronics category.</p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="bg-white p-8 rounded-3xl border border-[#E8E4DB] shadow-sm"><h4 className="font-bold text-xl mb-4 text-[#3E3E3E] flex items-center gap-2"><Building size={20} className="text-[#1B5234]"/> The Big 3 Movers</h4><ul className="space-y-4 font-light text-lg leading-relaxed text-[#3E3E3E]/90"><li>• <span className="font-bold">CVS Health:</span> Rapid rollout of dedicated optical & hearing hubs.</li><li>• <span className="font-bold">Walgreens:</span> Launched dedicated OTC hearing displays across 8,000+ stores.</li><li>• <span className="font-bold">Best Buy:</span> Launched aggressive digital & physical hearing tech category.</li></ul></div>
              <div className="bg-[#1B5234] text-white p-8 rounded-3xl shadow-xl"><h4 className="font-bold text-xl mb-4 flex items-center gap-2"><Target size={20}/> The Economics</h4><ul className="space-y-4 font-light text-lg leading-relaxed opacity-90"><li>• Zero clinical staffing required.</li><li>• Boxed devices ranging from $299 to $999.</li><li>• Immediate monetization of existing 65+ pharmacy foot traffic.</li></ul></div>
            </div>
          </div>
        )}

        {step === 21 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
             <div className="flex items-center gap-4 mb-8"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><Clock size={32} /></div><h2 className="text-4xl font-light">The Canadian Horizon</h2></div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6">Canada is historically 2 to 3 years behind the FDA. The regulatory floodgates for OTC are cracking open right now.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-[#E8E4DB] shadow-sm"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Catalyst</p><h4 className="font-bold text-xl mb-3">Apple AirPods Approval</h4><p className="text-lg font-light opacity-80">Health Canada recently approved Apple's AirPods Pro 2 as a Class II medical hearing aid, normalizing self-fitting tech.</p></div>
              <div className="bg-white p-8 rounded-3xl border border-[#E8E4DB] shadow-sm"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Demographic</p><h4 className="font-bold text-xl mb-3">10,000 Per Day</h4><p className="text-lg font-light opacity-80">The "Silver Tsunami" of Boomers turning 65 possess high disposable income and a severe aversion to traditional medical stigma.</p></div>
              <div className="bg-white p-8 rounded-3xl border border-[#E8E4DB] shadow-sm"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Gap</p><h4 className="font-bold text-xl mb-3">80% Untreated</h4><p className="text-lg font-light opacity-80">A massive $10B+ market gap of individuals who refuse to visit a clinical audiologist but will buy a consumer device.</p></div>
            </div>
          </div>
        )}

        {step === 22 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-red-800 text-white rounded-2xl"><AlertCircle size={32} /></div><div><h2 className="text-4xl font-light">The Shoppers Drug Mart Threat</h2><p className="text-sm uppercase tracking-widest text-red-800 font-bold mt-1">Competitive Urgency</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8">If Sobeys waits for full OTC legalization to build a hearing strategy, the competition will already own the patient data.</p>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-red-800/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 bg-red-800 h-full"></div>
              <h3 className="text-3xl font-bold mb-4 text-[#3E3E3E]">The Data Land Grab</h3>
              <p className="text-xl font-light leading-relaxed opacity-80 mb-8">Shoppers Drug Mart and Loblaws are actively expanding their clinical footprint. The winner in the Canadian OTC market will not be the one with the best shelf space; it will be the retailer who captures the patient data <span className="font-bold text-red-800">before</span> the laws change.</p>
              <div className="grid grid-cols-2 gap-10 pt-8 border-t border-[#E8E4DB]">
                <div><h4 className="font-bold text-[#3E3E3E] mb-3 text-sm uppercase tracking-widest">Reactive Strategy</h4><p className="text-lg font-light opacity-80">Wait for Health Canada to fully legalize OTC, then buy inventory and hope customers walk down the right aisle.</p></div>
                <div><h4 className="font-bold text-[#1B5234] mb-3 text-sm uppercase tracking-widest">Proactive Strategy</h4><p className="text-lg font-light opacity-100 font-bold text-[#1B5234]">Deploy Soundcheck now. Build a database of pre-qualified patients. Monetize instantly on Day 1 of legalization.</p></div>
              </div>
            </div>
          </div>
        )}

        {step === 23 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><TrendingUp size={32} /></div><div><h2 className="text-4xl font-light">The Sobeys Triage Engine</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Monetizing Dwell Time</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E]/90">
              Sobeys deploys Soundcheck via Pharmacy counter iPads and QR codes to triage captive patients into two distinct revenue streams.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-[#1B5234] p-10 rounded-3xl border border-[#1B5234] text-white shadow-xl">
                <h4 className="font-bold text-white mb-2 text-2xl flex items-center gap-2"><MapPin size={24}/> High Friction (Severe)</h4>
                <p className="text-lg font-light opacity-100 leading-relaxed mb-6 border-b border-white/20 pb-6">Patients with complex loss are automatically routed to local independent Audiology clinics via the Sobeys Partner Network.</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#E8E4DB] mb-1">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-100">Provides a premium concierge medical referral, elevating brand trust with zero clinical liability.</p>
              </div>
              <div className="bg-white p-10 rounded-3xl border-2 border-[#1B5234] shadow-md">
                <h4 className="font-bold text-[#1B5234] mb-2 text-2xl flex items-center gap-2"><ShoppingBag size={24}/> Low Friction (Mild)</h4>
                <p className="text-lg font-light opacity-80 leading-relaxed mb-6 border-b border-[#3E3E3E]/10 pb-6">Patients with mild loss are cataloged securely via Scene+. Sobeys instantly retargets them for high-margin, in-store Situational Enhancers (Apple AirPods/OTC).</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#1B5234] mb-1">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-80">You own a proprietary database of thousands of ready-to-buy customers that your competitors cannot access.</p>
              </div>
            </div>
          </div>
        )}

        {/* 24. THE PHARMACY BAG STRATEGY */}
        {step === 24 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><QrCode size={32} /></div><div><h2 className="text-4xl font-light">The Omnichannel Rollout</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Zero-Cost Acquisition Strategy</p></div></div>
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-[#1B5234]/10 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-bold text-[#3E3E3E]">The Pharmacy Bag QR</h3>
                <p className="text-xl font-light leading-relaxed opacity-90">Hardware scaling takes time. To capture the market immediately, print the Soundcheck QR code directly on Sobeys prescription bags.</p>
                <ul className="space-y-4 font-light text-lg">
                  <li className="flex items-start gap-3"><CheckSquare className="text-[#1B5234] mt-1 shrink-0" size={20}/> <span><strong className="text-[#3E3E3E]">Zero CapEx:</strong> No iPads required in test locations.</span></li>
                  <li className="flex items-start gap-3"><CheckSquare className="text-[#1B5234] mt-1 shrink-0" size={20}/> <span><strong className="text-[#3E3E3E]">The Kitchen Table:</strong> Shifts the 3-minute dwell time from the noisy store to the comfort of the patient's home.</span></li>
                  <li className="flex items-start gap-3"><CheckSquare className="text-[#1B5234] mt-1 shrink-0" size={20}/> <span><strong className="text-[#3E3E3E]">Family Influence:</strong> Loved ones can prompt the patient to scan the code while unpacking groceries.</span></li>
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-80 bg-[#F9F8F4] border-2 border-[#E8E4DB] rounded-b-3xl relative shadow-lg flex flex-col items-center justify-center p-6">
                  <div className="absolute top-0 left-0 w-full h-12 bg-white flex justify-between px-4 items-end pb-2 border-b-2 border-dashed border-[#E8E4DB]"><span className="w-4 h-4 rounded-full border border-gray-300"></span><span className="w-4 h-4 rounded-full border border-gray-300"></span></div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 opacity-50 mb-6 mt-10" />
                  <div className="bg-white p-4 rounded-xl shadow-sm mb-4"><QrCode size={80} className="text-[#3E3E3E]" /></div>
                  <p className="text-center font-bold text-[#1B5234] text-sm uppercase tracking-widest">Scan for Hearing Wellness</p>
                  <p className="text-center text-xs opacity-60 mt-2 font-sans">Earn 50 Scene+ Points</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Navigation */}
      {step > 0 && step < 10 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50"><ChevronLeft size={24} /> Back</button>)}

      {/* Enterprise Navigation */}
      {step >= 20 && (
        <div className="fixed bottom-8 left-0 w-full flex justify-between px-12 z-50">
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-[#3E3E3E]/60 hover:text-[#1B5234] font-bold uppercase tracking-widest text-sm transition-all bg-white px-4 py-2 rounded-full shadow-sm"><ChevronLeft size={20}/> Previous</button>
          {step < 24 ? (<button onClick={() => setStep(step + 1)} className="flex items-center gap-2 text-[#3E3E3E]/60 hover:text-[#1B5234] font-bold uppercase tracking-widest text-sm transition-all bg-white px-4 py-2 rounded-full shadow-sm">Next <ChevronRight size={20}/></button>) : (<button onClick={() => {setStep(0); setFrictionScore(0);}} className="flex items-center gap-2 text-[#F9F8F4] font-bold uppercase tracking-widest text-sm transition-all bg-[#1B5234] px-6 py-3 rounded-full shadow-lg hover:bg-[#133c26] border border-[#1B5234]">Exit Portal <Lock size={16}/></button>)}
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in backdrop-blur-md">
          <div className="bg-[#F9F8F4] p-8 rounded-3xl w-full max-w-sm text-center relative shadow-2xl border-2 border-[#1B5234]">
            <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 text-[#3E3E3E]/50 hover:text-[#3E3E3E]"><X size={20}/></button>
            <Lock size={32} className="mx-auto text-[#1B5234] mb-6" />
            <h3 className="text-2xl font-bold mb-6 font-sans uppercase tracking-widest text-[#3E3E3E]">Executive Access</h3>
            <form onSubmit={handlePinSubmit}>
              <input type="password" placeholder="Enter PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full text-center tracking-[0.5em] p-4 bg-[#E8E4DB] rounded-xl outline-none mb-6 font-bold text-2xl text-[#3E3E3E]" autoFocus />
              <button type="submit" className="w-full py-4 bg-[#1B5234] text-[#F9F8F4] rounded-xl font-bold uppercase tracking-widest text-lg hover:bg-[#133c26] transition-all">Unlock</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
