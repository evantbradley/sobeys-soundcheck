import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Volume2, Sparkles, Smartphone, BatteryCharging, 
  Shield, Brain, CheckSquare, QrCode, Clock, MapPin, Lock, X, Building, ShieldCheck,
  Headphones, AlertCircle, ShoppingBag, Target, TrendingUp, DollarSign, Award, Ear, RefreshCw
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
      audio.play().catch(e => console.log("Audio play prevented:", e));
    } else if (backgroundAudioRef.current.paused) {
      backgroundAudioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }

    let bgVol = 1.0; let speechVol = 0.3;

    if (mode === 'untreated') { bgVol = 1.0; speechVol = 0.2; } 
    else if (mode === 'suppression') { bgVol = 0.2; speechVol = 0.8; }
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
  const [currentFlow, setCurrentFlow] = useState('home');
  const [step, setStep] = useState(0);
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [simMode, setSimMode] = useState('untreated');
  const [activeEduTab, setActiveEduTab] = useState(0);
  const [frictionScore, setFrictionScore] = useState(0);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const audio = useAudioEngine();

  const returnHome = () => {
    audio.stopAll();
    setCurrentFlow('home');
    setStep(0);
    setFrictionScore(0);
    setConsentGiven(false);
  };

  useEffect(() => {
    if (currentFlow === 'instore' && step === 6) {
      setSimMode('untreated');
      audio.startCafeSimulation('untreated');
    } else {
      audio.stopAll();
    }
    return () => audio.stopAll();
  }, [currentFlow, step]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2026') { setShowPinModal(false); setPinInput(''); setCurrentFlow('enterprise'); setStep(0); }
    else { alert('Incorrect Access Code'); setPinInput(''); }
  };

  const next = (points = 0) => { setFrictionScore(prev => prev + points); setStep(s => s + 1); };
  const back = () => { setStep(s => Math.max(0, s - 1)); };

  const RHButton = ({ children, onClick, variant="p", className="", disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-10 py-5 rounded-full transition-all duration-500 text-xl font-light cursor-pointer ${disabled ? "bg-[#3E3E3E]/20 text-[#3E3E3E]/50 cursor-not-allowed" : variant === "p" ? "bg-[#1B5234] text-[#F9F8F4] hover:bg-[#133c26] active:scale-95 shadow-md" : "bg-[#E8E4DB] text-[#3E3E3E] hover:bg-[#DAD4C7] active:scale-95"} ${className}`}>{children}</button>
  );

  const bgClass = currentFlow === 'enterprise' ? "bg-white text-[#3E3E3E]" : "bg-[#F9F8F4] text-[#3E3E3E]";
  const progress = currentFlow === 'instore' ? (step / 8) * 100 : currentFlow === 'o2o' ? (step / 3) * 100 : 0;

  const eduContent = [
    { icon: <Brain size={40}/>, title: "The Cognitive Tax", body: "When you lose high frequencies, your brain works overtime to 'fill in the blanks.' This Cognitive Load is the reason socializing can leave you physically exhausted at the end of the day." },
    { icon: <Clock size={40}/>, title: "The Decade of Delay", body: "The average adult struggles with hearing decline for 7 to 10 years before seeking help. That is a decade of missed punchlines. Treating it early preserves neural pathways." },
    { icon: <RefreshCw size={40}/>, title: "Modern Truths", body: "The stigma is outdated. Constantly asking 'pardon?' ages us far more than wearing a hidden micro-computer. Modern tech uses AI to isolate human connection." }
  ];

  return (
    <div className={`h-screen w-full font-serif overflow-hidden relative flex flex-col items-center justify-center p-8 text-center transition-colors duration-1000 ${bgClass}`}>
      
      {/* GLOBAL HEADER */}
      <div className="fixed top-6 left-0 w-full px-8 flex justify-between items-center z-50">
        <div onClick={returnHome} className="cursor-pointer flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-[#1B5234]/10 hover:bg-white transition-all active:scale-95">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <span className="hidden text-2xl font-serif font-bold text-[#1B5234] tracking-tight">Sobeys</span>
        </div>
        {currentFlow !== 'enterprise' && (
          <div onClick={() => setShowPinModal(true)} className="flex items-center gap-2 text-[#1B5234] font-sans font-bold text-sm tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity bg-white/80 px-5 py-3 rounded-2xl backdrop-blur-sm border border-[#1B5234]/10 shadow-sm active:scale-95">
            <Lock size={16} /> Enterprise Portal
          </div>
        )}
      </div>

      {(currentFlow === 'instore' || currentFlow === 'o2o') && (<div className="fixed top-0 left-0 h-1.5 bg-[#E8E4DB] w-full z-50"><div className="h-full bg-[#1B5234] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>)}
      {(currentFlow === 'instore' || currentFlow === 'o2o') && (<div className="fixed bottom-0 left-0 w-full text-center py-3 bg-[#F9F8F4]/90 backdrop-blur-sm z-40 pointer-events-none border-t border-[#3E3E3E]/10"><p className="text-[10px] uppercase tracking-[0.1em] text-[#3E3E3E]/70 font-sans font-bold flex items-center justify-center gap-2"><AlertCircle size={12}/> Soundcheck is a lifestyle wellness screener, not a medical diagnostic tool.</p></div>)}

      <main className="max-w-4xl w-full flex flex-col justify-center items-center relative z-10 pb-12 mt-12">

        {/* --------------------------------------------------------- */}
        {/* HOME SCREEN: THE PROTOTYPE SELECTOR */}
        {/* --------------------------------------------------------- */}
        {currentFlow === 'home' && (
          <div className="space-y-12 animate-fade-in relative w-full flex flex-col items-center">
            <div className="flex flex-col items-center">
              <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-4">Hearing Wellness Portal</h1>
              <p className="text-[#3E3E3E] text-2xl font-light">Select deployment model to begin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-8">
              <div onClick={() => { setCurrentFlow('instore'); setStep(0); }} className="bg-white p-10 rounded-[3rem] border border-[#1B5234]/20 shadow-xl cursor-pointer hover:scale-105 transition-all flex flex-col items-center group">
                <div className="w-20 h-20 bg-[#F9F8F4] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#1B5234] transition-colors"><Headphones size={40} className="text-[#1B5234] group-hover:text-white transition-colors"/></div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">Premium Kiosk</h3>
                <p className="text-lg font-light opacity-80 mb-6 h-16">Full interactive flow with in-store audio simulation using sanitized ANC headphones.</p>
                <span className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Launch Flow A</span>
              </div>

              <div onClick={() => { setCurrentFlow('o2o'); setStep(0); }} className="bg-white p-10 rounded-[3rem] border border-[#1B5234]/20 shadow-xl cursor-pointer hover:scale-105 transition-all flex flex-col items-center group">
                <div className="w-20 h-20 bg-[#F9F8F4] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#1B5234] transition-colors"><Smartphone size={40} className="text-[#1B5234] group-hover:text-white transition-colors"/></div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">Express O2O</h3>
                <p className="text-lg font-light opacity-80 mb-6 h-16">30-second emotional intake that bridges the user to their own personal smartphone.</p>
                <span className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Launch Flow B</span>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* FLOW A: PREMIUM IN-STORE KIOSK */}
        {/* --------------------------------------------------------- */}
        {currentFlow === 'instore' && step === 0 && (
          <div className="space-y-8 animate-fade-in w-full max-w-xl text-center">
            <h1 className="text-5xl italic text-[#3E3E3E] mb-4">Let's establish your baseline.</h1>
            <p className="text-2xl font-light opacity-90 mb-12">Answer 3 quick questions about your daily life.</p>
            <RHButton onClick={() => next(0)}>Begin Assessment</RHButton>
          </div>
        )}
        
        {currentFlow === 'instore' && step === 1 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Media Check</h2><p className="text-2xl font-light opacity-90">Does the TV volume frequently cause disagreements, or do you find yourself needing captions to follow the dialogue?</p><div className="flex justify-center gap-4"><RHButton onClick={() => next(1)}>Frequently</RHButton><RHButton onClick={() => next(0)} variant="s">Rarely / Never</RHButton></div></div>)}
        {currentFlow === 'instore' && step === 2 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Crowd Check</h2><p className="text-2xl font-light opacity-90">In a lively bistro or family gathering, how much effort does it take to follow the punchline of a joke?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">It requires intense concentration</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">I catch most of it, but it's tiring</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">I hear everything effortlessly</button></div></div>)}
        {currentFlow === 'instore' && step === 3 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Social Check</h2><p className="text-2xl font-light opacity-90">Do you ever find yourself avoiding social gatherings or restaurants because listening in the noise is simply too exhausting?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">Yes, I often avoid noisy places</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">Sometimes, depending on my energy</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">No, I never avoid social situations</button></div></div>)}

        {/* Education & Destigmatization */}
        {currentFlow === 'instore' && step === 4 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-5xl italic text-[#3E3E3E] mb-6">The Hidden Impact</h2>
            <div className="w-full flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[3rem] border border-[#1B5234]/10 shadow-lg">
              <div className="flex flex-col gap-3 flex-1">
                {eduContent.map((tab, idx) => (
                  <button key={idx} onClick={() => setActiveEduTab(idx)} className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 border-2 text-left cursor-pointer ${activeEduTab === idx ? 'bg-[#F9F8F4] border-[#1B5234] shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50 opacity-60'}`}>
                    <div className={`${activeEduTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.icon}</div>
                    <span className={`font-bold text-lg ${activeEduTab === idx ? 'text-[#1B5234]' : 'text-[#3E3E3E]'}`}>{tab.title}</span>
                  </button>
                ))}
              </div>
              <div className="flex-[1.5] bg-[#F9F8F4] rounded-2xl p-8 flex flex-col justify-center text-left border border-[#E8E4DB]">
                <div className="text-[#1B5234] mb-6">{eduContent[activeEduTab].icon}</div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">{eduContent[activeEduTab].title}</h3>
                <p className="text-xl font-light leading-relaxed text-[#3E3E3E]/90">{eduContent[activeEduTab].body}</p>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>Continue to Technology</RHButton></div>
          </div>
        )}

        {/* The Headphone Gate */}
        {currentFlow === 'instore' && step === 5 && (
          <div className="space-y-8 animate-fade-in w-full max-w-2xl flex flex-col items-center">
            <div className="bg-[#1B5234] w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
              <Headphones size={64} className="text-white" />
            </div>
            <h2 className="text-5xl italic text-[#3E3E3E]">Prepare for Audio</h2>
            <p className="text-2xl font-light leading-relaxed text-[#3E3E3E] mb-8">For the ultimate experience, please sanitize and put on the noise-cancelling headphones provided at the kiosk.</p>
            <RHButton onClick={() => next(0)} className="!py-6 text-2xl w-full max-w-sm">I'm Ready</RHButton>
          </div>
        )}

        {/* Hear the Difference */}
        {currentFlow === 'instore' && step === 6 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <div className="mx-auto bg-white w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-sm border border-[#1B5234]/10"><Sparkles size={40} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#3E3E3E]">Hear The Difference</h2>
            <p className="text-2xl font-light leading-relaxed text-[#3E3E3E]/90 text-center px-4">Modern technology uses AI to instantly suppress background noise. Tap the enhancements below to hear the clarity.</p>
            <div className="w-full bg-white p-6 rounded-[3rem] border border-[#1B5234]/20 shadow-lg mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => handleSimChange('untreated')} className={`p-6 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 cursor-pointer ${simMode === 'untreated' ? 'bg-[#F9F8F4] border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Ear size={32} className={simMode === 'untreated' ? 'text-[#1B5234]' : ''}/><span className="font-bold text-xl leading-tight">Standard<br/>Hearing</span></button>
                <button onClick={() => handleSimChange('suppression')} className={`p-6 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 cursor-pointer ${simMode === 'suppression' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Shield size={32} className={simMode === 'suppression' ? 'text-white' : ''}/><span className="font-bold text-xl leading-tight">Noise<br/>Suppression</span></button>
                <button onClick={() => handleSimChange('active')} className={`p-6 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center gap-3 cursor-pointer ${simMode === 'active' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-xl scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}><Sparkles size={32} className={simMode === 'active' ? 'text-white' : ''}/><span className="font-bold text-xl leading-tight">AI Voice<br/>Clarity</span></button>
              </div>
            </div>
            <div className="pt-6"><RHButton onClick={() => next(0)}>View My Profile</RHButton></div>
          </div>
        )}

        {/* Profile Reveal */}
        {currentFlow === 'instore' && step === 7 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl">
            <div className="mx-auto bg-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#1B5234]/10"><UserCheck size={48} className="text-[#1B5234]" /></div>
            <h2 className="text-5xl italic text-[#1B5234] mb-8">Your Listening Profile</h2>
            <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-[#1B5234]/10 text-left">
              {frictionScore === 0 ? (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your psychosocial baseline indicates a very low level of social friction. Your natural hearing is serving you well.</p>
                  <p className="text-xl opacity-90 font-light">Explore <span className="font-bold text-[#1B5234]">Situational Enhancers</span> to protect your baseline in noisy spaces.</p>
                </>
              ) : (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your psychosocial baseline indicates elevated social friction. You are expending a high amount of cognitive energy to stay connected in noise.</p>
                  <p className="text-xl opacity-90 font-light">Explore <span className="font-bold text-[#1B5234]">Invisible AI Technology</span> to permanently reduce your cognitive tax.</p>
                </>
              )}
            </div>
            <div className="pt-8"><RHButton onClick={() => next(0)}>Claim Scene+ Reward</RHButton></div>
          </div>
        )}

        {/* Scene+ Vault */}
        {currentFlow === 'instore' && step === 8 && (
          <div className="w-full max-w-3xl space-y-8 animate-fade-in text-left">
            <div className="bg-gradient-to-br from-gray-900 to-[#1B5234] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <Award className="absolute -right-10 -bottom-10 text-white/10" size={200} />
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                  <div className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-xl tracking-widest uppercase shadow-md">Scene+</div>
                  <h2 className="text-4xl font-light">Earn 50 Points Today</h2>
                </div>
                <p className="text-xl font-light opacity-90">Securely save your Listening Profile to claim your points instantly.</p>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full bg-white/10 text-white placeholder-white/60 p-4 rounded-2xl outline-none font-serif italic text-lg border border-white/20 backdrop-blur-sm" />
                  <input type="tel" placeholder="Mobile Number" className="w-full bg-white/10 text-white placeholder-white/60 p-4 rounded-2xl outline-none font-serif italic text-lg border border-white/20 backdrop-blur-sm" />
                  <input type="text" placeholder="Scene+ Card (16 Digits)" className="w-full col-span-2 bg-white/20 text-white placeholder-white/70 p-5 rounded-2xl outline-none font-mono text-xl tracking-widest border border-white/30 backdrop-blur-sm shadow-inner" maxLength={16} />
                </div>
                <div className="flex items-start gap-4 bg-black/20 p-4 rounded-2xl cursor-pointer" onClick={() => setConsentGiven(!consentGiven)}>
                  <div className="mt-1 shrink-0">{consentGiven ? <CheckSquare size={28} className="text-white" /> : <div className="w-7 h-7 border-2 border-white/50 rounded bg-white/10" />}</div>
                  <p className="text-sm font-light opacity-90 leading-snug font-sans">I consent to securely save my profile. A Sobeys Partner may contact me regarding solutions based on my results.</p>
                </div>
                <button onClick={() => { alert("Profile Saved! Points Awarded."); returnHome(); }} disabled={!consentGiven} className={`w-full py-6 rounded-full font-bold uppercase tracking-widest text-lg transition-all ${consentGiven ? 'bg-white text-[#1B5234] hover:scale-[1.02] shadow-xl cursor-pointer' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}>Save Profile & Claim Points</button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* FLOW B: EXPRESS O2O (Offline to Online) */}
        {/* --------------------------------------------------------- */}
        {currentFlow === 'o2o' && step === 0 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Media Check</h2><p className="text-2xl font-light opacity-90">Does the TV volume frequently cause disagreements, or do you find yourself needing captions to follow the dialogue?</p><div className="flex justify-center gap-4"><RHButton onClick={() => next(1)}>Frequently</RHButton><RHButton onClick={() => next(0)} variant="s">Rarely / Never</RHButton></div></div>)}
        {currentFlow === 'o2o' && step === 1 && (<div className="space-y-8 w-full max-w-xl animate-fade-in"><h2 className="text-4xl leading-tight">The Social Check</h2><p className="text-2xl font-light opacity-90">Do you ever find yourself avoiding social gatherings or restaurants because listening in the noise is simply too exhausting?</p><div className="grid grid-cols-1 gap-4 text-left"><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">Yes, I often avoid noisy places</button><button onClick={() => next(1)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">Sometimes, depending on my energy</button><button onClick={() => next(0)} className="p-6 rounded-3xl bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] transition-all text-xl font-bold text-[#3E3E3E] cursor-pointer">No, I never avoid social situations</button></div></div>)}
        {currentFlow === 'o2o' && step === 2 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center text-center">
            <div className="text-[#1B5234] mb-2 bg-white p-6 rounded-full shadow-sm border border-[#1B5234]/10"><Brain size={64}/></div>
            <h2 className="text-5xl italic text-[#3E3E3E] mb-4">The Cognitive Tax</h2>
            <p className="text-2xl font-light leading-relaxed text-[#3E3E3E]/90 bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DB]">You aren't imagining it. When you lose specific sound frequencies, your brain works overtime to "fill in the blanks." This cognitive load is why socializing leaves you physically exhausted.</p>
            <RHButton onClick={() => next(0)} className="mt-4">Experience the Solution</RHButton>
          </div>
        )}
        {currentFlow === 'o2o' && step === 3 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="bg-[#1B5234] p-10 rounded-[3rem] shadow-xl border border-[#1B5234]/10 flex flex-col md:flex-row gap-10 items-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
              <div className="flex-1 space-y-6 relative z-10">
                <h3 className="text-5xl font-serif font-bold italic mb-2">Hear the Difference</h3>
                <p className="text-2xl font-light leading-relaxed opacity-90">To experience the AI Audio Simulation with perfect clarity, scan this code to continue on your personal smartphone using your own headphones.</p>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl w-fit border border-white/20 mt-4">
                  <div className="bg-white text-gray-900 px-3 py-1 rounded-lg font-black text-sm tracking-widest uppercase">Scene+</div>
                  <span className="font-bold">Earn 50 Points upon completion</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="w-72 h-80 bg-[#F9F8F4] border-2 border-[#E8E4DB] rounded-b-3xl relative shadow-2xl flex flex-col items-center justify-center p-6 text-[#3E3E3E]">
                  <div className="absolute top-0 left-0 w-full h-12 bg-white flex justify-between px-4 items-end pb-2 border-b-2 border-dashed border-[#E8E4DB]"><span className="w-4 h-4 rounded-full border border-gray-300"></span><span className="w-4 h-4 rounded-full border border-gray-300"></span></div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 opacity-50 mb-6 mt-10" />
                  <div className="bg-white p-4 rounded-xl shadow-sm mb-4"><QrCode size={100} className="text-[#3E3E3E]" /></div>
                  <p className="text-center font-bold text-[#1B5234] text-sm uppercase tracking-widest">Scan with Camera</p>
                </div>
              </div>
            </div>
            <div className="text-center pt-4"><button onClick={returnHome} className="text-[#3E3E3E]/50 font-bold uppercase tracking-widest text-sm hover:text-[#3E3E3E] cursor-pointer">Return to Home Screen</button></div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* ENTERPRISE PORTAL (PIN 2026) */}
        {/* --------------------------------------------------------- */}
        {currentFlow === 'enterprise' && step === 0 && (
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

        {currentFlow === 'enterprise' && step === 1 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
             <div className="flex items-center gap-4 mb-8"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><Clock size={32} /></div><h2 className="text-4xl font-light">The Canadian Horizon</h2></div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6">Canada is historically 2 to 3 years behind the FDA. The regulatory floodgates for OTC are cracking open right now.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Catalyst</p><h4 className="font-bold text-xl mb-3">Apple AirPods Approval</h4><p className="text-lg font-light opacity-90">Health Canada recently approved Apple's AirPods Pro 2 as a Class II medical hearing aid.</p></div>
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Demographic</p><h4 className="font-bold text-xl mb-3">10,000 Per Day</h4><p className="text-lg font-light opacity-90">The "Silver Tsunami" of Boomers turning 65 possess high disposable income and aversion to clinical stigma.</p></div>
              <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#3E3E3E]/10"><p className="font-bold text-[#1B5234] mb-2 uppercase tracking-widest text-xs">The Gap</p><h4 className="font-bold text-xl mb-3">80% Untreated</h4><p className="text-lg font-light opacity-90">A massive $10B+ market gap of individuals who refuse to visit a clinical audiologist but will buy a consumer device.</p></div>
            </div>
          </div>
        )}

        {currentFlow === 'enterprise' && step === 2 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-red-800 text-white rounded-2xl"><AlertCircle size={32} /></div><div><h2 className="text-4xl font-light">The Shoppers Drug Mart Threat</h2><p className="text-sm uppercase tracking-widest text-red-800 font-bold mt-1">Competitive Urgency</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8">If Sobeys waits for full OTC legalization to build a hearing strategy, the competition will already own the patient data.</p>
            <div className="bg-[#F9F8F4] p-8 rounded-[2rem] shadow-sm border border-red-800/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 bg-red-800 h-full"></div>
              <h3 className="text-3xl font-bold mb-4 text-[#3E3E3E]">The Data Land Grab</h3>
              <p className="text-xl font-light leading-relaxed opacity-90 mb-6">Shoppers Drug Mart and Loblaws are actively expanding their clinical footprint. The winner in the Canadian market will be the retailer who captures the patient data <span className="font-bold text-red-800">before</span> the laws change.</p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#E8E4DB]">
                <div><h4 className="font-bold text-[#3E3E3E] mb-3 text-sm uppercase tracking-widest">Reactive Strategy</h4><p className="text-lg font-light opacity-90">Wait for Health Canada to fully legalize OTC, then buy inventory and hope customers walk down the right aisle.</p></div>
                <div><h4 className="font-bold text-[#1B5234] mb-3 text-sm uppercase tracking-widest">Proactive Strategy</h4><p className="text-lg font-light opacity-90 text-[#1B5234] font-bold">Deploy Soundcheck now. Build a database of pre-qualified patients. Monetize instantly on Day 1 of legalization.</p></div>
              </div>
            </div>
          </div>
        )}

        {currentFlow === 'enterprise' && step === 3 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><TrendingUp size={32} /></div><div><h2 className="text-4xl font-light">The Sobeys Triage Engine</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Monetizing Captive Dwell Time</p></div></div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="bg-[#1B5234] p-8 rounded-3xl border border-[#1B5234] text-white shadow-xl">
                <h4 className="font-bold text-white mb-2 text-2xl flex items-center gap-2"><MapPin size={24}/> High Friction</h4>
                <p className="text-lg font-light opacity-100 leading-relaxed mb-4 border-b border-white/20 pb-4">Patients with severe loss are routed to local independent Audiology clinics via the Sobeys Partner Network.</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#E8E4DB]">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-100">Premium concierge medical referral, elevating brand trust with zero clinical liability.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 border-[#1B5234] shadow-md">
                <h4 className="font-bold text-[#1B5234] mb-2 text-2xl flex items-center gap-2"><ShoppingBag size={24}/> Low Friction</h4>
                <p className="text-lg font-light opacity-90 leading-relaxed mb-4 border-b border-[#3E3E3E]/10 pb-4">Patients with mild loss are cataloged securely. When OTC is legalized, Sobeys instantly retargets them.</p>
                <p className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Sobeys Benefit:</p>
                <p className="text-lg font-light opacity-90">A proprietary database of thousands of ready-to-buy customers competitors cannot access.</p>
              </div>
            </div>
          </div>
        )}

        {currentFlow === 'enterprise' && step === 4 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><QrCode size={32} /></div><div><h2 className="text-4xl font-light">Flexible Deployment</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Dual-Model Rollout Strategy</p></div></div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8E4DB]">
                <h3 className="text-2xl font-bold text-[#3E3E3E] mb-4 border-b pb-4">Phase 1: O2O Omnichannel</h3>
                <p className="text-lg font-light leading-relaxed opacity-90 mb-6">Print the Soundcheck QR code directly on Sobeys prescription bags to capture the market immediately with <span className="font-bold">Zero CapEx</span>.</p>
                <ul className="space-y-3 font-light">
                  <li className="flex items-center gap-2"><CheckSquare className="text-[#1B5234]" size={16}/> Shifts dwell time to the living room.</li>
                  <li className="flex items-center gap-2"><CheckSquare className="text-[#1B5234]" size={16}/> Patient uses their own headphones.</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8E4DB]">
                <h3 className="text-2xl font-bold text-[#3E3E3E] mb-4 border-b pb-4">Phase 2: Premium Kiosk</h3>
                <p className="text-lg font-light leading-relaxed opacity-90 mb-6">Deploy physical iPad stands with <span className="font-bold">Active Noise Cancelling (ANC)</span> headphones in high-traffic flagship pharmacies.</p>
                <ul className="space-y-3 font-light">
                  <li className="flex items-center gap-2"><CheckSquare className="text-[#1B5234]" size={16}/> High-converting "Apple Store" experience.</li>
                  <li className="flex items-center gap-2"><CheckSquare className="text-[#1B5234]" size={16}/> Antimicrobial wipe dispenser integrated.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Navigation Layer */}
      {currentFlow === 'instore' && step > 0 && step < 8 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50 cursor-pointer"><ChevronLeft size={24} /> Back</button>)}
      {currentFlow === 'o2o' && step > 0 && step < 3 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50 cursor-pointer"><ChevronLeft size={24} /> Back</button>)}

      {/* Enterprise Navigation */}
      {currentFlow === 'enterprise' && (
        <div className="fixed bottom-8 left-0 w-full flex justify-between px-12 z-50">
          <button onClick={() => setStep(step - 1)} disabled={step === 0} className={`flex items-center gap-2 font-bold uppercase tracking-widest text-sm transition-all bg-white px-4 py-2 rounded-full shadow-sm cursor-pointer ${step === 0 ? 'opacity-30' : 'text-[#3E3E3E]/60 hover:text-[#1B5234]'}`}><ChevronLeft size={20}/> Previous</button>
          {step < 4 ? (<button onClick={() => setStep(step + 1)} className="flex items-center gap-2 text-[#3E3E3E]/60 hover:text-[#1B5234] font-bold uppercase tracking-widest text-sm transition-all bg-white px-4 py-2 rounded-full shadow-sm cursor-pointer">Next <ChevronRight size={20}/></button>) : (<button onClick={returnHome} className="flex items-center gap-2 text-[#F9F8F4] font-bold uppercase tracking-widest text-sm transition-all bg-[#1B5234] px-6 py-3 rounded-full shadow-lg hover:bg-[#133c26] border border-[#1B5234] cursor-pointer">Exit Portal <Lock size={16}/></button>)}
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in backdrop-blur-md">
          <div className="bg-[#F9F8F4] p-8 rounded-3xl w-full max-w-sm text-center relative shadow-2xl border-2 border-[#1B5234]">
            <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 text-[#3E3E3E]/50 hover:text-[#3E3E3E] cursor-pointer"><X size={20}/></button>
            <Lock size={32} className="mx-auto text-[#1B5234] mb-6" />
            <h3 className="text-2xl font-bold mb-6 font-sans uppercase tracking-widest text-[#3E3E3E]">Executive Access</h3>
            <form onSubmit={handlePinSubmit}>
              <input type="password" placeholder="Enter PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full text-center tracking-[0.5em] p-4 bg-[#E8E4DB] rounded-xl outline-none mb-6 font-bold text-2xl text-[#3E3E3E]" autoFocus />
              <button type="submit" className="w-full py-4 bg-[#1B5234] text-[#F9F8F4] rounded-xl font-bold uppercase tracking-widest text-lg hover:bg-[#133c26] transition-all cursor-pointer">Unlock</button>
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
