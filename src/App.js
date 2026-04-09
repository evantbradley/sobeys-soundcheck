import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Volume2, Sparkles, Smartphone, BatteryCharging, 
  Play, Shield, Brain, Activity, CheckSquare, RefreshCw, 
  Clock, HeartPulse, Star, MapPin, Lock, X, Building, 
  Headphones, AlertCircle, ShoppingBag, Target, TrendingUp, DollarSign, UserCheck, Award, Ear, Wifi, Battery
} from 'lucide-react';

const useAudioEngine = () => {
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const speechIntervalRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) { const AudioContext = window.AudioContext || window.webkitAudioContext; audioCtxRef.current = new AudioContext(); }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const stopAll = () => {
    if (oscillatorRef.current) { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); }
    if (backgroundAudioRef.current) { backgroundAudioRef.current.pause(); backgroundAudioRef.current.currentTime = 0; }
    clearInterval(speechIntervalRef.current);
    window.speechSynthesis.cancel();
  };

  const playTone = (freq, vol, duration = 1.5) => {
    initAudio(); stopAll();
    const ctx = audioCtxRef.current; const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1); g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(g); g.connect(ctx.destination); osc.start(); oscillatorRef.current = osc;
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.85; utterance.pitch = 1; utterance.volume = 1; window.speechSynthesis.speak(utterance);
  };

  const startCafeSimulation = (mode) => {
    initAudio(); 
    
    // iPad/Safari Safe Audio Loading (.mp3 is universally supported)
    if (!backgroundAudioRef.current) {
      const audio = new Audio('https://www.soundjay.com/misc/sounds/restaurant-1.mp3');
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      backgroundAudioRef.current = audio;
      audio.play().catch(e => console.log("Audio play prevented by browser:", e));
    } else if (backgroundAudioRef.current.paused) {
      backgroundAudioRef.current.play().catch(e => console.log(e));
    }

    // CORS-Safe Volume Modulation
    let bgVol = 1.0;
    let speechVol = 0.3;

    if (mode === 'untreated') { bgVol = 1.0; speechVol = 0.2; } 
    else if (mode === 'directional') { bgVol = 0.4; speechVol = 0.6; } 
    else if (mode === 'suppression') { bgVol = 0.1; speechVol = 0.9; }
    else if (mode === 'active') { bgVol = 0.02; speechVol = 1.0; }

    backgroundAudioRef.current.volume = bgVol;

    // Continuous, natural story for the foreground
    window.speechSynthesis.cancel(); 
    
    const longSentence = "I was walking down to the market the other day, and the weather was absolutely beautiful. The sun was shining, a light breeze was blowing, and I ran into an old friend from university. We ended up chatting for over an hour about our travel plans for the summer, the new restaurants opening downtown, and how much the neighborhood has changed over the past few years. It's funny how quickly time passes when you're deeply engaged in a good conversation.";
    
    const utterance = new SpeechSynthesisUtterance(longSentence);
    utterance.rate = 0.9; // Slightly slower for natural feel
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

  return { playTone, speakWord, startCafeSimulation, stopAll, initAudio };
};

export default function App() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toneState, setToneState] = useState({ freqIndex: 0, currentVol: 0.1, attempt: 0 });
  const [toneActive, setToneActive] = useState(false);
  const [bistroStep, setBistroStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [linkScenePlus, setLinkScenePlus] = useState(false);
  const [flippedMyths, setFlippedMyths] = useState({ 1: false, 2: false });
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [simMode, setSimMode] = useState('untreated');
  
  // Interactive Wearables State
  const [activeWearableTab, setActiveWearableTab] = useState(0);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [frictionScore, setFrictionScore] = useState(0);

  const audio = useAudioEngine();
  const toneTimerRef = useRef(null);

  const patientSteps = 19; 
  const progress = (step / patientSteps) * 100;

  const frequencies = [1000, 2000, 4000, 8000];
  const bistroWords = [{ correct: "Park", options: ["Park", "Bark", "Dark"] }, { correct: "Time", options: ["Dime", "Time", "Chime"] }, { correct: "Base", options: ["Face", "Lace", "Base"] }, { correct: "Coat", options: ["Goat", "Coat", "Boat"] }, { correct: "Sure", options: ["Pure", "Lure", "Sure"] }];
  const clinics = [{ id: 1, name: "Elite Audiology Group", distance: "1.2 miles away", description: "Premium partner clinic. Secure routing & readiness scoring enabled.", sponsored: true, image: "[ Elite ]" }, { id: 2, name: "ClearPath Hearing Specialists", distance: "3.4 miles away", description: "Comprehensive diagnostics and personalized care plans.", sponsored: false, image: "[ ClearPath ]" }, { id: 3, name: "Sound & Life Center", distance: "5.0 miles away", description: "Family-owned clinic serving the community for over 20 years.", sponsored: false, image: "[ SoundLife ]" }];

  useEffect(() => {
    if (step === 16) {
      setSimMode('untreated');
      audio.startCafeSimulation('untreated');
    }
  }, [step]);

  const startSweep = () => { audio.initAudio(); setIsPlaying(true); setToneState({ freqIndex: 0, currentVol: 0.15, attempt: 0 }); triggerTone(0, 0.15, 0); };
  const triggerTone = (fIndex, vol, attempt) => {
    if (fIndex >= frequencies.length) { setIsPlaying(false); setToneActive(false); setStep(8); return; }
    setToneState({ freqIndex: fIndex, currentVol: vol, attempt }); setToneActive(true);
    audio.playTone(frequencies[fIndex], vol, 1.5);
    toneTimerRef.current = setTimeout(() => { setToneActive(false); setTimeout(() => { attempt < 1 ? triggerTone(fIndex, vol * 1.5, attempt + 1) : triggerTone(fIndex + 1, 0.15, 0); }, 1000); }, 3000);
  };
  const handleToneHit = () => {
    if (!toneActive) return; clearTimeout(toneTimerRef.current); setToneActive(false); audio.stopAll();
    setTimeout(() => { toneState.attempt === 0 ? triggerTone(toneState.freqIndex, toneState.currentVol * 0.4, toneState.attempt + 1) : triggerTone(toneState.freqIndex + 1, 0.15, 0); }, 1000);
  };

  const startBistro = () => { 
    audio.initAudio(); 
    setIsPlaying(true); 
    // Fallback static noise for the word test to avoid talking over the voice
    const audioEl = new Audio('https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg');
    audioEl.crossOrigin = "anonymous"; audioEl.loop = true; audioEl.volume = 0.3; audioEl.play().catch(e=>console.log(e));
    setTimeout(() => { audio.speakWord(bistroWords[0].correct); }, 1500); 
  };
  
  const handleBistroAnswer = () => { 
    if (bistroStep < 4) { 
      const nextStep = bistroStep + 1; setBistroStep(nextStep); setTimeout(() => { audio.speakWord(bistroWords[nextStep].correct); }, 1500); 
    } else { 
      audio.stopAll(); setIsPlaying(false); 
      if (frictionScore === 0) { setStep(18); } else { setStep(9); }
    } 
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2026') { setShowPinModal(false); setPinInput(''); setStep(20); }
    else { alert('Incorrect Access Code'); setPinInput(''); }
  };

  const next = (points = 0) => { 
    setFrictionScore(prev => prev + points);
    audio.stopAll(); setIsPlaying(false); setStep(s => s + 1); 
  };
  const back = () => { audio.stopAll(); setIsPlaying(false); setStep(s => Math.max(0, s - 1)); };

  const handleSimChange = (mode) => {
    setSimMode(mode);
    audio.startCafeSimulation(mode);
  }

  const RHButton = ({ children, onClick, variant="p", className="", disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-10 py-5 rounded-full transition-all duration-500 text-xl font-light ${disabled ? "bg-[#3E3E3E]/20 text-[#3E3E3E]/50 cursor-not-allowed" : variant === "p" ? "bg-[#1B5234] text-[#F9F8F4] hover:bg-[#133c26] active:scale-95 shadow-md" : "bg-[#E8E4DB] text-[#3E3E3E] hover:bg-[#DAD4C7] active:scale-95"} ${className}`}>{children}</button>
  );

  const bgClass = step < 20 ? "bg-[#F9F8F4] text-[#3E3E3E]" : "bg-white text-[#3E3E3E]";

  // Wearables Content
  const wearableTabs = [
    { icon: <Wifi size={32}/>, title: "Bluetooth Stream", desc: "Stream phone calls, podcasts, and music directly into your ears with pristine, zero-latency fidelity. Your phone stays in your pocket.", glow: "bg-blue-400" },
    { icon: <Battery size={32}/>, title: "All-Day Battery", desc: "Forget tiny batteries. Drop them in the magnetic case at night and enjoy up to 24 hours of continuous AI processing on a single charge.", glow: "bg-green-400" },
    { icon: <Activity size={32}/>, title: "Health Tracking", desc: "Built-in biometric sensors track your physical steps, heart rate, and overall cognitive engagement throughout the day.", glow: "bg-red-400" }
  ];

  return (
    <div className={`h-screen w-full font-serif overflow-hidden relative flex flex-col items-center justify-center p-8 text-center transition-colors duration-1000 ${bgClass}`}>
      
      {/* GLOBAL HEADER: Sobeys Logo (Home) & Corporate Login */}
      <div className="fixed top-6 left-0 w-full px-8 flex justify-between items-center z-50">
        {/* Sobeys Logo with CSS Fallback */}
        <div onClick={() => { audio.stopAll(); setStep(0); }} className="cursor-pointer flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-[#1B5234]/10 hover:bg-white transition-all active:scale-95">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <span className="hidden text-2xl font-serif font-bold text-[#1B5234] tracking-tight">Sobeys</span>
        </div>

        {/* Corporate Login */}
        {step < 20 && (
          <div onClick={() => setShowPinModal(true)} className="flex items-center gap-2 text-[#1B5234] font-sans font-bold text-sm tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity bg-white/80 px-5 py-3 rounded-2xl backdrop-blur-sm border border-[#1B5234]/10 shadow-sm active:scale-95">
            <Lock size={16} /> Enterprise Portal
          </div>
        )}
      </div>

      {step > 0 && step <= patientSteps && (<div className="fixed top-0 left-0 h-1.5 bg-[#E8E4DB] w-full z-50"><div className="h-full bg-[#1B5234] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>)}
      {step < 20 && (<div className="fixed bottom-0 left-0 w-full text-center py-3 bg-[#F9F8F4]/90 backdrop-blur-sm z-40 pointer-events-none border-t border-[#3E3E3E]/10"><p className="text-[10px] uppercase tracking-[0.1em] text-[#3E3E3E]/70 font-sans font-bold flex items-center justify-center gap-2"><AlertCircle size={12}/> Soundcheck is an informational screening tool, not a diagnostic medical evaluation.</p></div>)}

      <main className="max-w-4xl w-full flex flex-col justify-center items-center relative z-10 pb-12 mt-12">

        {step === 0 && (
          <div className="space-y-6 animate-fade-in relative w-full flex flex-col items-center">
            <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-2">Hearing Health</h1>
            <p className="text-[#3E3E3E] uppercase tracking-[0.2em] text-sm font-bold font-sans flex items-center gap-2">Powered by Soundcheck <Sparkles size={14} className="text-[#1B5234]"/></p>
            <div className="pt-12"><RHButton onClick={() => next(0)}>Begin Your Experience</RHButton></div>
          </div>
        )}
        
        {step === 1 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Media Check</h2><p className="text-2xl font-light opacity-90">Does the TV remote often stay in your hand to adjust for "mumbles" or keep the volume higher than others prefer?</p><div className="flex justify-center gap-4"><RHButton onClick={() => next(1)}>Frequently</RHButton><RHButton onClick={() => next(0)} variant="s">Rarely</RHButton></div></div>)}
        {step === 2 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Crowd Check</h2><p className="text-2xl font-light opacity-90">In a lively bistro or family gathering, how much effort does it take to follow the punchline of a joke?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(2)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">It requires a lot of concentration</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">I catch most of it, but it's tiring</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E]">I hear everything effortlessly</button></div></div>)}
        {step === 3 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Distance Check</h2><p className="text-2xl font-light opacity-90">If someone calls to you from another room, do you usually have to walk over to hear them clearly?</p><div className="flex justify-center gap-4"><RHButton onClick={() => next(1)}>Yes, almost always</RHButton><RHButton onClick={() => next(0)} variant="s">No, I hear them fine</RHButton></div></div>)}
        {step === 4 && (<div className="space-y-8 w-full max-w-2xl animate-fade-in"><h2 className="text-4xl italic mb-8">What is your "go-to" phrase for repetition?</h2><div className="grid grid-cols-2 gap-4"><button onClick={() => next(1)} className="border-2 border-[#1B5234]/40 p-6 rounded-2xl italic text-2xl hover:bg-[#1B5234] hover:text-white transition-all text-[#3E3E3E]">"Pardon me?"</button><button onClick={() => next(1)} className="border-2 border-[#1B5234]/40 p-6 rounded-2xl italic text-2xl hover:bg-[#1B5234] hover:text-white transition-all text-[#3E3E3E]">"What did you say?"</button><button onClick={() => next(1)} className="border-2 border-[#1B5234]/40 p-6 rounded-2xl italic text-2xl hover:bg-[#1B5234] hover:text-white transition-all text-[#3E3E3E]">"Say that again?"</button><button onClick={() => next(0)} className="border-2 border-[#1B5234]/40 p-6 rounded-2xl italic text-2xl hover:bg-[#1B5234] hover:text-white transition-all text-[#3E3E3E]">I never ask people to repeat</button></div></div>)}
        {step === 5 && (<div className="space-y-12 max-w-2xl animate-fade-in"><div className="mx-auto w-20 h-[1px] bg-[#1B5234] mb-8" /><h2 className="text-4xl italic leading-relaxed text-[#1B5234]">"What feels like a simple request for clarity can feel like conflict to a loved one."</h2><p className="text-2xl font-light opacity-90">When we struggle to hear, frustration builds. Our tone often sounds sharp without us realizing it. It turns connection into conflict.</p><RHButton onClick={() => next(0)}>Reflect & Continue</RHButton></div>)}
        {step === 6 && (<div className="space-y-8 w-full max-w-2xl animate-fade-in"><h2 className="text-4xl leading-tight">If a modern, virtually invisible solution could effortlessly restore your clarity, where do you stand?</h2><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl border-2 border-transparent hover:border-[#1B5234]">I'm ready to see what's out there.</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl border-2 border-transparent hover:border-[#1B5234]">I'm curious, but a bit hesitant.</button></div></div>)}
        
        {step === 7 && (<div className="space-y-12 animate-fade-in flex flex-col items-center justify-center w-full"><h2 className="text-4xl">Adaptive Listening Check</h2><p className="text-2xl font-light opacity-90 max-w-xl mx-auto">Tones will automatically play and adjust in volume.</p>{!isPlaying ? (<RHButton onClick={startSweep} className="mt-8">Start Sound Check</RHButton>) : (<div className="space-y-8 flex flex-col items-center mt-8"><div className="text-lg uppercase tracking-widest text-[#1B5234] font-bold">Testing Frequency {toneState.freqIndex + 1} of 4</div><button onMouseDown={handleToneHit} className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-150 shadow-2xl ${toneActive ? 'border-[#1B5234] text-[#1B5234] hover:bg-[#1B5234] hover:text-[#F9F8F4] active:scale-90 animate-pulse' : 'border-[#E8E4DB] text-[#E8E4DB] cursor-default'}`}><span className="text-3xl font-light tracking-widest">I HEAR IT</span></button></div>)}</div>)}
        {step === 8 && (<div className="space-y-12 animate-fade-in w-full max-w-2xl flex flex-col items-center"><h2 className="text-4xl">The Bistro Simulation</h2><p className="text-2xl opacity-90 font-light">Identify the 5 words spoken through the background noise.</p>{!isPlaying ? (<button onClick={startBistro} className="mt-8 w-72 h-72 rounded-full bg-[#E8E4DB] text-[#3E3E3E] flex flex-col items-center justify-center shadow-xl hover:bg-[#1B5234] hover:text-white transition-all active:scale-95"><Volume2 size={48} className="mb-4" /><span className="text-2xl italic">Play Crowd Noise & Start</span></button>) : (<div className="w-full space-y-8 mt-8"><div className="text-lg uppercase tracking-widest text-[#1B5234] mb-8 font-bold">Word {bistroStep + 1} of 5</div><div className="grid grid-cols-3 gap-4 w-full">{bistroWords[bistroStep].options.map(w => (<button key={w} onClick={handleBistroAnswer} className="p-8 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#1B5234] hover:text-white transition-all text-3xl font-light shadow-sm border-2 border-transparent hover:border-white">{w}</button>))}</div></div>)}</div>)}
        
        {step === 9 && (<div className="space-y-8 animate-fade-in w-full max-w-2xl"><div className="mx-auto bg-[#E8E4DB] w-24 h-24 rounded-full flex items-center justify-center mb-6"><Brain size={48} className="text-[#1B5234]" /></div><h2 className="text-5xl italic">The Cognitive Tax</h2><p className="text-2xl font-light leading-relaxed text-left border-l-4 border-[#1B5234] pl-6">Did you know your ears collect sound, but <span className="font-bold">your brain actually listens?</span> <br/><br/>When you lose high frequencies, your brain works overtime to "fill in the blanks". This Cognitive Load is the reason socializing can leave you exhausted.</p><RHButton onClick={() => next(0)} className="mt-8">Continue</RHButton></div>)}
        
        {step === 10 && (<div className="space-y-8 animate-fade-in w-full max-w-3xl"><h2 className="text-4xl italic mb-4">Modern Truths</h2><p className="text-xl opacity-90 mb-8 text-[#1B5234] font-bold">Tap both cards below to reveal the reality.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"><div onClick={() => setFlippedMyths({...flippedMyths, 1: true})} className={`p-8 rounded-3xl cursor-pointer transition-all duration-500 min-h-[240px] flex flex-col justify-center relative overflow-hidden ${flippedMyths[1] ? 'bg-[#1B5234] text-white shadow-inner' : 'bg-[#E8E4DB] hover:bg-[#DAD4C7] shadow-md border-2 border-[#1B5234]/20'}`}>{flippedMyths[1] ? (<p className="text-2xl font-light italic animate-fade-in">"Constantly asking 'pardon?' and withdrawing ages us far more than wearing a hidden micro-computer."</p>) : (<div className="animate-fade-in z-10"><p className="text-[#1B5234] font-bold text-sm uppercase tracking-widest mb-2">The Stigma</p><p className="text-3xl font-bold">"Treating my hearing will make me look older."</p><div className="absolute bottom-0 left-0 w-full bg-[#1B5234] text-white py-3 text-center font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2"><RefreshCw size={14}/> Tap to Reveal Truth</div></div>)}</div><div onClick={() => setFlippedMyths({...flippedMyths, 2: true})} className={`p-8 rounded-3xl cursor-pointer transition-all duration-500 min-h-[240px] flex flex-col justify-center relative overflow-hidden ${flippedMyths[2] ? 'bg-[#1B5234] text-white shadow-inner' : 'bg-[#E8E4DB] hover:bg-[#DAD4C7] shadow-md border-2 border-[#1B5234]/20'}`}>{flippedMyths[2] ? (<p className="text-2xl font-light italic animate-fade-in">"Modern tech isn't about volume; it's about clarity. It uses AI to lift speech out of the noise."</p>) : (<div className="animate-fade-in z-10"><p className="text-[#1B5234] font-bold text-sm uppercase tracking-widest mb-2">The Misconception</p><p className="text-3xl font-bold">"Hearing tech just turns up the volume on everything."</p><div className="absolute bottom-0 left-0 w-full bg-[#1B5234] text-white py-3 text-center font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2"><RefreshCw size={14}/> Tap to Reveal Truth</div></div>)}</div></div><div className="pt-8"><RHButton onClick={() => next(0)} disabled={!(flippedMyths[1] && flippedMyths[2])}>{flippedMyths[1] && flippedMyths[2] ? "Discover More" : "Read Cards to Continue"}</RHButton></div></div>)}

        {step === 11 && (<div className="space-y-8 animate-fade-in w-full max-w-2xl"><div className="mx-auto bg-[#E8E4DB] w-24 h-24 rounded-full flex items-center justify-center mb-6"><Clock size={48} className="text-[#1B5234]" /></div><h2 className="text-5xl italic">The Decade of Delay</h2><p className="text-2xl font-light leading-relaxed">Did you know the average person struggles with hearing loss for <span className="font-bold text-[#1B5234]">7 to 10 years</span> before seeking help?<br/><br/>That is a decade of missed punchlines and misunderstood whispers. You don't get those years back.</p><RHButton onClick={() => next(0)} className="mt-8">Continue</RHButton></div>)}
        {step === 12 && (<div className="space-y-8 animate-fade-in w-full max-w-2xl"><div className="mx-auto bg-[#E8E4DB] w-24 h-24 rounded-full flex items-center justify-center mb-6"><Activity size={48} className="text-[#1B5234]" /></div><h2 className="text-4xl italic">The "Use It or Lose It" Principle</h2><p className="text-2xl font-light leading-relaxed text-left border-l-4 border-[#1B5234] pl-6">When your auditory nerve stops sending certain sound frequencies to the brain, the speech-processing center actually begins to shrink. <br/><br/>This is <span className="font-bold">Auditory Deprivation</span>. Treating hearing loss early preserves your brain's ability to understand words.</p><RHButton onClick={() => next(0)} className="mt-8">Next</RHButton></div>)}
        {step === 13 && (<div className="space-y-8 animate-fade-in w-full max-w-2xl"><div className="mx-auto bg-[#E8E4DB] w-24 h-24 rounded-full flex items-center justify-center mb-6"><HeartPulse size={48} className="text-[#1B5234]" /></div><h2 className="text-4xl italic">The Hidden Cost of Isolation</h2><p className="text-2xl font-light leading-relaxed">When conversation becomes exhausting, we naturally start to withdraw. <br/><br/>This social isolation is linked to a significantly higher risk of cognitive decline and dementia.</p><RHButton onClick={() => next(0)} className="mt-8">See The Solution</RHButton></div>)}
        
        {/* PROPRIETARY DIAGRAMS (Replacing broken stock photos) */}
        {step === 14 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl">
            <h2 className="text-4xl font-light">Spot the Technology.</h2>
            <div className="w-full bg-[#E8E4DB]/40 rounded-[3rem] p-12 border border-[#1B5234]/20 shadow-md relative overflow-hidden flex items-center justify-between cursor-pointer group" onClick={() => next(0)}>
              <div className="flex-1 text-left relative z-10">
                <p className="text-[#1B5234] font-bold text-sm uppercase tracking-widest mb-2">Form Factor 1</p>
                <h3 className="text-4xl font-bold text-[#3E3E3E] mb-4">Receiver-in-Canal (RIC)</h3>
                <p className="text-xl font-light opacity-80 leading-relaxed border-l-4 border-[#1B5234] pl-4">The micro-computer sits invisibly behind the ear, while a nearly invisible wire delivers pristine AI-processed audio directly into the ear canal.</p>
                <span className="mt-8 inline-block text-[#1B5234] font-bold underline text-lg">Tap to Reveal Custom Devices</span>
              </div>
              <div className="flex-1 flex justify-center relative">
                <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#1B5234]/10 group-hover:scale-105 transition-transform duration-500">
                  <Ear size={100} className="text-[#3E3E3E]/20" />
                  {/* Glowing node showing RIC placement */}
                  <div className="absolute top-4 -right-2 flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#1B5234] rounded-full animate-ping absolute"></div>
                    <div className="w-4 h-4 bg-[#1B5234] rounded-full relative z-10 shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 15 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl">
            <h2 className="text-4xl font-light italic">Invisible Sophistication.</h2>
            <div className="w-full bg-[#E8E4DB]/40 rounded-[3rem] p-12 border border-[#1B5234]/20 shadow-md relative overflow-hidden flex items-center justify-between cursor-pointer group" onClick={() => next(0)}>
              <div className="flex-1 text-left relative z-10">
                <p className="text-[#1B5234] font-bold text-sm uppercase tracking-widest mb-2">Form Factor 2</p>
                <h3 className="text-4xl font-bold text-[#3E3E3E] mb-4">Custom In-The-Ear (ITE)</h3>
                <p className="text-xl font-light opacity-80 leading-relaxed border-l-4 border-[#1B5234] pl-4">Laser-scanned and molded perfectly to your unique anatomy. The entire device sits deep within the ear canal, rendering it 100% invisible to others.</p>
                <span className="mt-8 inline-block text-[#1B5234] font-bold underline text-lg">Tap to Experience AI Audio</span>
              </div>
              <div className="flex-1 flex justify-center relative">
                <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#1B5234]/10 group-hover:scale-105 transition-transform duration-500">
                  <Ear size={100} className="text-[#3E3E3E]/20" />
                  {/* Glowing node showing ITE placement deep inside */}
                  <div className="absolute inset-0 flex items-center justify-center translate-x-4">
                    <div className="w-4 h-4 bg-[#1B5234] rounded-full animate-ping absolute"></div>
                    <div className="w-4 h-4 bg-[#1B5234] rounded-full relative z-10 shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* INTERACTIVE CAFE SIMULATOR */}
        {step === 16 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <div className="mx-auto bg-[#E8E4DB] w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner"><Sparkles size={40} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#3E3E3E]">Hear The Difference</h2>
            <p className="text-2xl font-light leading-relaxed text-[#3E3E3E]/90 text-center px-4">Modern technology uses AI to instantly suppress background noise and lift human speech. Tap the enhancements below to experience it live.</p>
            <div className="w-full bg-[#E8E4DB]/50 p-6 rounded-[3rem] border border-[#1B5234]/20 shadow-sm mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => handleSimChange('untreated')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-2 ${simMode === 'untreated' ? 'bg-white border-[#1B5234] shadow-md scale-105' : 'bg-[#F9F8F4] border-transparent hover:bg-white text-[#3E3E3E]/70'}`}><Ear size={28} className={simMode === 'untreated' ? 'text-[#1B5234]' : ''}/><span className="font-bold text-lg leading-tight">Untreated<br/>Hearing</span></button>
                <button onClick={() => handleSimChange('directional')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-2 ${simMode === 'directional' ? 'bg-white border-[#1B5234] shadow-md scale-105' : 'bg-[#F9F8F4] border-transparent hover:bg-white text-[#3E3E3E]/70'}`}><Volume2 size={28} className={simMode === 'directional' ? 'text-[#1B5234]' : ''}/><span className="font-bold text-lg leading-tight">Directional<br/>Focus</span></button>
                <button onClick={() => handleSimChange('suppression')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-2 ${simMode === 'suppression' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-md scale-105' : 'bg-[#F9F8F4] border-transparent hover:bg-white text-[#3E3E3E]/70'}`}><Shield size={28} className={simMode === 'suppression' ? 'text-white' : ''}/><span className="font-bold text-lg leading-tight">Noise<br/>Suppression</span></button>
                <button onClick={() => handleSimChange('active')} className={`p-4 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-2 ${simMode === 'active' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-xl scale-110' : 'bg-[#F9F8F4] border-transparent hover:bg-white text-[#3E3E3E]/70'}`}><Sparkles size={28} className={simMode === 'active' ? 'text-white' : ''}/><span className="font-bold text-lg leading-tight">AI Voice<br/>Clarity</span></button>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>Continue</RHButton></div>
          </div>
        )}

        {/* INTERACTIVE WEARABLES DASHBOARD */}
        {step === 17 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-5xl italic text-[#3E3E3E] mb-6">High-Performance Wearables</h2>
            <div className="w-full flex flex-col md:flex-row gap-8 bg-[#E8E4DB]/40 p-8 rounded-[3rem] border border-[#1B5234]/20 shadow-md">
              {/* Tabs */}
              <div className="flex flex-col gap-4 flex-1">
                {wearableTabs.map((tab, idx) => (
                  <button key={idx} onClick={() => setActiveWearableTab(idx)} className={`p-6 rounded-3xl flex items-center gap-4 transition-all duration-300 border-2 text-left ${activeWearableTab === idx ? 'bg-white border-[#1B5234] shadow-md' : 'bg-transparent border-transparent hover:bg-white/50 opacity-70'}`}>
                    <div className={`${activeWearableTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.icon}</div>
                    <span className={`font-bold text-xl ${activeWearableTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.title}</span>
                  </button>
                ))}
              </div>
              {/* Display Panel */}
              <div className="flex-[1.5] bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 ${wearableTabs[activeWearableTab].glow} rounded-full blur-[80px] opacity-20 transition-colors duration-700`}></div>
                <div className="text-[#1B5234] mb-8 animate-fade-in">{wearableTabs[activeWearableTab].icon}</div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4 animate-fade-in">{wearableTabs[activeWearableTab].title}</h3>
                <p className="text-xl font-light leading-relaxed text-[#3E3E3E]/80 animate-fade-in">{wearableTabs[activeWearableTab].desc}</p>
              </div>
            </div>
            <div className="pt-8"><RHButton onClick={() => setStep(19)}>View My Results</RHButton></div>
          </div>
        )}
        
        {/* STEP 18: HEALTHY OFF-RAMP */}
        {step === 18 && (
          <div className="space-y-8 animate-fade-in w-full max-w-2xl">
            <div className="mx-auto bg-[#E8E4DB] w-24 h-24 rounded-full flex items-center justify-center mb-6"><UserCheck size={48} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#1B5234]">Exceptional Baseline</h2>
            <p className="text-2xl font-light leading-relaxed text-left border-l-4 border-[#1B5234] pl-6">Great news! Your responses indicate a very low level of social friction and excellent speech-in-noise processing. Your hearing health is currently performing exceptionally well.</p>
            <RHButton onClick={() => setStep(19)} className="mt-8 text-xl">Save My Baseline</RHButton>
          </div>
        )}

        {/* STEP 19: LEAD GEN (SCENE+ & CLINIC ROUTING) */}
        {step === 19 && (
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 animate-fade-in text-left relative">
            <div className="flex-1 bg-[#E8E4DB]/50 rounded-[3rem] p-10 relative overflow-hidden flex flex-col border border-[#1B5234]/20 shadow-sm">
              <Shield className="absolute -top-6 -right-6 text-[#1B5234] opacity-10" size={120} />
              <h2 className="text-4xl italic text-[#1B5234] mb-6 relative z-10 font-bold">Your Insight Map</h2>
              {frictionScore === 0 ? (
                <p className="font-light text-2xl leading-relaxed border-l-4 border-[#1B5234] pl-6 relative z-10 mb-8 text-[#3E3E3E]">Your baseline indicates <span className="font-bold text-[#1B5234]">Zero Social Friction</span>. Maintain this healthy baseline and monitor for changes over time.</p>
              ) : (
                <p className="font-light text-2xl leading-relaxed border-l-4 border-[#1B5234] pl-6 relative z-10 mb-8 text-[#3E3E3E]">Your profile indicates elevated <span className="font-bold">Social Friction</span> and difficulty isolating speech. You are working harder than necessary to stay connected.</p>
              )}
              <div className="mt-auto relative z-10">
                <p className="text-sm font-bold uppercase tracking-widest text-[#3E3E3E] mb-2">Next Step:</p>
                <p className="font-light opacity-90 text-xl">{frictionScore === 0 ? "Save your secure profile to earn Scene+ points." : "Select a local certified partner to explore invisible technology."}</p>
              </div>
            </div>
            
            <div className="flex-[1.2] flex flex-col gap-4">
              {frictionScore > 0 && (
                <>
                  <h3 className="text-2xl font-light mb-2">Sobeys Local Partner Network</h3>
                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {clinics.map((clinic) => (
                      <div key={clinic.id} onClick={() => setSelectedClinic(clinic)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 flex gap-4 items-center ${selectedClinic?.id === clinic.id ? 'bg-white border-[#1B5234] shadow-lg scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white'}`}>
                        <div className="w-16 h-16 bg-[#E8E4DB] rounded-xl flex-shrink-0 flex items-center justify-center text-[8px] text-center italic text-[#3E3E3E]/50 font-bold">{clinic.image}</div>
                        <div className="flex-1"><div className="flex justify-between items-start"><h4 className="font-bold text-xl leading-tight">{clinic.name}</h4>{clinic.sponsored && <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1B5234] text-white px-2 py-1 rounded-md flex items-center gap-1"><Star size={10}/> Sponsor</span>}</div><p className="text-sm font-bold text-[#1B5234] flex items-center gap-1 mt-1 mb-1"><MapPin size={12}/> {clinic.distance}</p><p className="text-sm font-light opacity-90 leading-snug">{clinic.description}</p></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={`transition-all duration-500 overflow-hidden ${(selectedClinic || frictionScore === 0) ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-[#1B5234]/20 space-y-6">
                  
                  {/* SCENE+ INTEGRATION */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-inner flex flex-col gap-4 relative overflow-hidden">
                    <Award className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="bg-white text-gray-900 p-2 rounded-lg font-bold text-sm tracking-widest uppercase shadow-md">Scene+</div>
                      <h4 className="font-bold text-lg">Earn 50 Points Today</h4>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <button onClick={() => setLinkScenePlus(!linkScenePlus)} className="shrink-0">{linkScenePlus ? <CheckSquare size={28} className="text-white" /> : <div className="w-7 h-7 border-2 border-white/50 rounded bg-white/10 hover:bg-white/20 transition-colors" />}</button>
                      <p className="text-sm font-light opacity-90">Link my Scene+ card to save my hearing baseline securely to my profile.</p>
                    </div>
                    {linkScenePlus && (
                      <input type="text" placeholder="Enter 16-Digit Scene+ Card Number" className="w-full bg-white/10 text-white placeholder-white/50 p-4 rounded-xl outline-none font-mono text-lg border border-white/20 mt-2 relative z-10 tracking-widest" maxLength={16} />
                    )}
                  </div>

                  <div className="flex gap-4 items-start"><button onClick={() => setConsentGiven(!consentGiven)} className="mt-1 shrink-0">{consentGiven ? <CheckSquare size={28} className="text-[#1B5234]" /> : <div className="w-7 h-7 border-2 border-[#3E3E3E] rounded" />}</button><p className="text-sm font-light opacity-90 leading-snug font-sans">I consent to securely save my screening data and contact information{selectedClinic ? ` and share it with ${selectedClinic.name}` : ''}.</p></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="w-full bg-[#F9F8F4] p-4 rounded-xl outline-none font-serif italic text-lg border border-[#3E3E3E]/10" />
                    <input type="text" placeholder="Last Name" className="w-full bg-[#F9F8F4] p-4 rounded-xl outline-none font-serif italic text-lg border border-[#3E3E3E]/10" />
                    <input type="tel" placeholder="Phone Number" className="w-full bg-[#F9F8F4] p-4 rounded-xl outline-none font-serif italic text-lg border border-[#3E3E3E]/10" />
                    <input type="text" placeholder="Postal Code" className="w-full bg-[#F9F8F4] p-4 rounded-xl outline-none font-serif italic text-lg border border-[#3E3E3E]/10 uppercase" maxLength={6} />
                  </div>
                  
                  <RHButton onClick={() => setStep(0)} className={`w-full !py-5 shadow-md text-xl ${!consentGiven ? 'opacity-50 cursor-not-allowed' : ''}`}>{selectedClinic ? `Connect with ${selectedClinic.name}` : 'Save Profile & Claim Points'}</RHButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LAYER 2: SOBEYS RETAIL ENTERPRISE PORTAL (20-23) --- */}
        
        {step === 20 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><DollarSign size={32} /></div><div><h2 className="text-4xl font-light">The U.S. OTC Gold Rush</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Retail Market Precedent</p></div></div>
            </div>
            <p className="text-2xl italic leading-relaxed text-[#3E3E3E]/80 border-l-4 border-[#1B5234] pl-6 mb-8">In 2022, the FDA legalized Over-The-Counter (OTC) hearing aids. U.S. pharmacies immediately converted aisle space into a high-margin consumer electronics category.</p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="bg-[#F9F8F4] p-8 rounded-3xl border border-[#E8E4DB]"><h4 className="font-bold text-xl mb-4 text-[#3E3E3E] flex items-center gap-2"><Building size={20} className="text-[#1B5234]"/> The Big 3 Movers</h4><ul className="space-y-4 font-light text-lg leading-relaxed text-[#3E3E3E]/90"><li>• <span className="font-bold">CVS Health:</span> Rapid rollout of dedicated optical & hearing hubs.</li><li>• <span className="font-bold">Walgreens:</span> Launched dedicated OTC hearing displays across 8,000+ stores.</li><li>• <span className="font-bold">Best Buy:</span> Launched aggressive digital & physical hearing tech category.</li></ul></div>
              <div className="bg-white p-8 rounded-3xl border-2 border-[#1B5234] shadow-lg"><h4 className="font-bold text-xl mb-4 text-[#1B5234] flex items-center gap-2"><Target size={20}/> The Economics</h4><ul className="space-y-4 font-light text-lg leading-relaxed text-[#3E3E3E]/90"><li>• Zero clinical staffing required.</li><li>• Boxed devices ranging from $299 to $999.</li><li>• Immediate monetization of existing 65+ pharmacy foot traffic.</li></ul></div>
            </div>
          </div>
        )}

        {step === 21 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
             <div className="flex items-center gap-4 mb-8"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><Clock size={32} /></div><h2 className="text-4xl font-light">The Canadian Horizon</h2></div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6">Canada is historically 2 to 3 years behind the FDA. The regulatory floodgates for OTC are cracking open right now.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Catalyst</p><h4 className="font-bold text-xl mb-3">Apple AirPods Approval</h4><p className="text-lg font-light opacity-90">Health Canada recently approved Apple's AirPods Pro 2 as a Class II medical hearing aid, normalizing self-fitting tech.</p></div>
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Demographic</p><h4 className="font-bold text-xl mb-3">10,000 Per Day</h4><p className="text-lg font-light opacity-90">The "Silver Tsunami" of Boomers turning 65 possess high disposable income and a severe aversion to traditional medical stigma.</p></div>
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Gap</p><h4 className="font-bold text-xl mb-3">80% Untreated</h4><p className="text-lg font-light opacity-90">A massive $10B+ market gap of individuals who refuse to visit a clinical audiologist but will buy a consumer device.</p></div>
            </div>
          </div>
        )}

        {step === 22 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-red-800 text-white rounded-2xl"><AlertCircle size={32} /></div><div><h2 className="text-4xl font-light">The Shoppers Drug Mart Threat</h2><p className="text-sm uppercase tracking-widest text-red-800 font-bold mt-1">Competitive Urgency</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8">If Sobeys waits for full OTC legalization to build a hearing strategy, the competition will already own the patient data.</p>
            <div className="bg-[#F9F8F4] p-8 rounded-[2rem] shadow-sm border border-red-800/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 bg-red-800 h-full"></div>
              <h3 className="text-3xl font-bold mb-4 text-[#3E3E3E]">The Data Land Grab</h3>
              <p className="text-xl font-light leading-relaxed opacity-90 mb-6">Shoppers Drug Mart and Loblaws are actively expanding their clinical footprint. The winner in the Canadian OTC market will not be the one with the best shelf space; it will be the retailer who captures the patient data <span className="font-bold text-red-800">before</span> the laws change.</p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#E8E4DB]">
                <div><h4 className="font-bold text-[#3E3E3E] mb-3 text-sm uppercase tracking-widest">Reactive Strategy</h4><p className="text-lg font-light opacity-90">Wait for Health Canada to fully legalize OTC, then buy inventory and hope customers walk down the right aisle.</p></div>
                <div><h4 className="font-bold text-[#1B5234] mb-3 text-sm uppercase tracking-widest">Proactive Strategy</h4><p className="text-lg font-light opacity-90">Deploy Soundcheck now. Build a database of pre-qualified "Mild Loss" patients. Flip the switch and monetize instantly on Day 1 of legalization.</p></div>
              </div>
            </div>
          </div>
        )}

        {step === 23 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><TrendingUp size={32} /></div><div><h2 className="text-4xl font-light">The Sobeys Triage Engine</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">How Sobeys Wins Today</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E]/90">
              Sobeys deploys Soundcheck interactive kiosks in pharmacies today to monetize captive dwell time and triage patients into two distinct revenue streams.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-[#1B5234] p-8 rounded-3xl border border-[#1B5234] text-white shadow-xl">
                <h4 className="font-bold text-white mb-2 text-2xl flex items-center gap-2"><MapPin size={24}/> The Whales (Severe Loss)</h4>
                <p className="text-lg font-light opacity-100 leading-relaxed mb-4 border-b border-white/20 pb-4">Patients with complex loss are automatically routed to local independent Audiology clinics via the Sobeys Partner Network.</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#E8E4DB]">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-100">Provides a premium concierge medical referral, elevating brand trust with zero clinical liability.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 border-[#1B5234] shadow-md">
                <h4 className="font-bold text-[#1B5234] mb-2 text-2xl flex items-center gap-2"><ShoppingBag size={24}/> The Minnows (Mild Loss)</h4>
                <p className="text-lg font-light opacity-90 leading-relaxed mb-4 border-b border-[#3E3E3E]/10 pb-4">Patients with mild loss are cataloged securely. When OTC is legalized, Sobeys instantly retargets them for high-margin, in-store devices.</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-90">You own a proprietary database of thousands of ready-to-buy customers that your competitors cannot access.</p>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Patient Back Button */}
      {step > 0 && step < 20 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50"><ChevronLeft size={24} /> Back</button>)}

      {/* Enterprise Layer Navigators */}
      {step >= 20 && (
        <div className="fixed bottom-8 left-0 w-full flex justify-between px-12 z-50">
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-[#3E3E3E]/60 hover:text-[#1B5234] font-bold uppercase tracking-widest text-sm transition-all"><ChevronLeft size={20}/> Previous</button>
          {step < 23 ? (<button onClick={() => setStep(step + 1)} className="flex items-center gap-2 text-[#3E3E3E]/60 hover:text-[#1B5234] font-bold uppercase tracking-widest text-sm transition-all">Next <ChevronRight size={20}/></button>) : (<button onClick={() => setStep(0)} className="flex items-center gap-2 text-[#F9F8F4] font-bold uppercase tracking-widest text-sm transition-all bg-[#1B5234] px-6 py-3 rounded-full shadow-md hover:bg-[#133c26] border border-[#1B5234]">Exit Portal <Lock size={16}/></button>)}
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1B5234; border-radius: 10px; opacity: 0.5; }
      `}</style>
    </div>
  );
}
