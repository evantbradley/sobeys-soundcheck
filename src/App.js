import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Lock, X, ShieldCheck, Headphones, AlertCircle, 
  Minus, Plus, User, Volume2, Shield, Sparkles, CheckSquare, 
  Circle, PlayCircle, RefreshCw, Smartphone, Brain, QrCode, Award 
} from 'lucide-react';

const useAudioEngine = () => {
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const bgAudioRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (frequency, volumeLevel) => {
    initAudio();
    stopTone();
    
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = frequency; 
    gain.gain.value = (volumeLevel / 10) * 0.1; 
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    
    oscRef.current = osc;
    gainRef.current = gain;
  };

  const updateToneVolume = (volumeLevel) => {
    if (gainRef.current) {
      gainRef.current.gain.value = (volumeLevel / 10) * 0.1;
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e){}
      oscRef.current.disconnect();
      oscRef.current = null;
    }
  };

  const startBistroNoise = () => {
    initAudio();
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 1.0;
      bgAudioRef.current.play().catch(e => console.log("Safari blocked autoplay. Needs user click."));
    }
  };

  const stopBistroNoise = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
  };

  const liveUpdateFilters = (mode) => {
    if (bgAudioRef.current) {
      if (mode === 'untreated') bgAudioRef.current.volume = 1.0;
      else if (mode === 'suppression') bgAudioRef.current.volume = 0.2;
      else if (mode === 'active') bgAudioRef.current.volume = 0.02;
    }
  };

  const speakWord = (text, mode = 'active') => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha'));
    if (premiumVoice) utterance.voice = premiumVoice;

    if (mode === 'untreated' || mode === 'suppression') {
      utterance.volume = 0.2; 
      utterance.pitch = 0.8;
    } else {
      utterance.volume = 1.0; 
      utterance.pitch = 1.0;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const stopAll = () => {
    stopTone();
    stopBistroNoise();
  };

  return { 
    initAudio, playTone, updateToneVolume, stopTone, 
    startBistroNoise, stopBistroNoise, liveUpdateFilters, speakWord, stopAll 
  };
};

export default function App() {
  const [currentFlow, setCurrentFlow] = useState('home');
  const [step, setStep] = useState(0);
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('London Audiology Centre');
  const [frictionScore, setFrictionScore] = useState(0);
  
  const [highFreqVol, setHighFreqVol] = useState(5);
  const [midFreqVol, setMidFreqVol] = useState(5);
  const [lowFreqVol, setLowFreqVol] = useState(5);

  const [simMode, setSimMode] = useState('untreated');
  const [wordStep, setWordStep] = useState(0);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const audio = useAudioEngine();

  const returnHome = () => {
    audio.stopAll();
    setCurrentFlow('home');
    setStep(0);
    setFrictionScore(0);
    setConsentGiven(false);
    setHighFreqVol(5);
    setMidFreqVol(5);
    setLowFreqVol(5);
    setSimMode('untreated');
    setWordStep(0);
  };

  useEffect(() => {
    if (currentFlow === 'instore') {
      if (step === 6) audio.playTone(4000, highFreqVol);
      else if (step === 7) audio.playTone(1000, midFreqVol);
      else if (step === 8) audio.playTone(250, lowFreqVol);
      else audio.stopTone();

      if (step === 10 || step === 11) audio.startBistroNoise();
      else audio.stopBistroNoise();
    }
  }, [step, currentFlow]);

  useEffect(() => { if (step === 6) audio.updateToneVolume(highFreqVol); }, [highFreqVol]);
  useEffect(() => { if (step === 7) audio.updateToneVolume(midFreqVol); }, [midFreqVol]);
  useEffect(() => { if (step === 8) audio.updateToneVolume(lowFreqVol); }, [lowFreqVol]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2026') { setShowPinModal(false); setPinInput(''); setCurrentFlow('enterprise'); setStep(0); }
    else { alert('Incorrect Access Code'); setPinInput(''); }
  };

  const handleScore = (points) => {
    setFrictionScore(prev => prev + points);
    setStep(s => s + 1);
  };

  const back = () => { 
    setStep(s => Math.max(0, s - 1)); 
    audio.stopAll();
  };

  const bgClass = currentFlow === 'enterprise' ? "bg-white text-[#3E3E3E]" : "bg-[#F9F8F4] text-[#3E3E3E]";
  const progress = currentFlow === 'instore' ? (step / 13) * 100 : currentFlow === 'o2o' ? (step / 5) * 100 : 0;

  const ThreeOptions = () => (
    <div className="flex flex-col gap-4 w-full max-w-sm mt-10">
      {[{l:'Yes', p:2}, {l:'Sometimes', p:1}, {l:'No', p:0}].map(item => (
        <button key={item.l} onClick={() => handleScore(item.p)} className="py-6 rounded-2xl bg-white border-2 border-[#E8E4DB] hover:border-[#1B5234] hover:bg-[#F9F8F4] transition-all text-2xl font-bold text-[#3E3E3E] cursor-pointer shadow-sm active:scale-95">
          {item.l}
        </button>
      ))}
    </div>
  );

  const testWords = [
    { w: "Coat", opts: ["Goat", "Coat", "Boat"] },
    { w: "Park", opts: ["Bark", "Park", "Dark"] },
    { w: "Time", opts: ["Dime", "Time", "Chime"] },
    { w: "Loud", opts: ["Cloud", "Loud", "Proud"] },
    { w: "Read", opts: ["Read", "Seed", "Weed"] }
  ];

  const handleWordSelect = () => {
    if (wordStep < 4) {
      setWordStep(w => w + 1);
    } else {
      setStep(11);
      setSimMode('untreated'); 
      audio.liveUpdateFilters('untreated'); 
    }
  };

  const clinics = ["London Audiology Centre", "Elgin Audiology", "Bentley Hearing Services"];

  return (
    <div className={`h-screen w-full font-serif overflow-hidden relative flex flex-col items-center justify-center p-8 text-center transition-colors duration-1000 ${bgClass}`}>
      
      <audio ref={audio.bgAudioRef} src="https://www.soundjay.com/misc/sounds/restaurant-1.mp3" loop crossOrigin="anonymous" preload="auto" />

      <div className="fixed top-6 left-0 w-full px-8 flex justify-between items-center z-50">
        <div onClick={returnHome} className="cursor-pointer flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-[#1B5234]/10 hover:bg-white transition-all active:scale-95">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-6 object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <span className="hidden text-2xl font-serif font-bold text-[#1B5234] tracking-tight">Sobeys</span>
        </div>
        {currentFlow !== 'enterprise' && (
          <div onClick={() => { setShowPinModal(true); setPinInput(''); }} className="flex items-center gap-2 text-[#1B5234] font-sans font-bold text-sm tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity bg-white/80 px-5 py-3 rounded-2xl backdrop-blur-sm border border-[#1B5234]/10 shadow-sm active:scale-95">
            <Lock size={16} /> Enterprise Portal
          </div>
        )}
      </div>

      {(currentFlow === 'instore' || currentFlow === 'o2o') && (<div className="fixed top-0 left-0 h-1.5 bg-[#E8E4DB] w-full z-50"><div className="h-full bg-[#1B5234] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} /></div>)}
      
      {(currentFlow === 'instore' || currentFlow === 'o2o') && (<div className="fixed bottom-0 left-0 w-full text-center py-3 bg-[#F9F8F4]/90 backdrop-blur-sm z-40 pointer-events-none border-t border-[#3E3E3E]/10"><p className="text-[10px] uppercase tracking-[0.1em] text-[#3E3E3E]/70 font-sans font-bold flex items-center justify-center gap-2"><AlertCircle size={12}/> Soundcheck is a lifestyle wellness screener, not a medical diagnostic tool.</p></div>)}

      <main className="max-w-6xl w-full flex flex-col justify-center items-center relative z-10 pb-12 mt-12">

        {/* HOME SCREEN */}
        {currentFlow === 'home' && (
          <div className="space-y-12 animate-fade-in relative w-full flex flex-col items-center">
            <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-4">Hearing Wellness Portal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-8">
              <div onClick={() => { setCurrentFlow('instore'); setStep(0); }} className="bg-white p-10 rounded-[3rem] border border-[#1B5234]/20 shadow-xl cursor-pointer hover:scale-105 transition-all flex flex-col items-center group">
                <div className="w-20 h-20 bg-[#F9F8F4] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#1B5234] transition-colors"><Headphones size={40} className="text-[#1B5234] group-hover:text-white transition-colors"/></div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">Premium Kiosk</h3>
                <span className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Launch Flow A</span>
              </div>
              <div onClick={() => { setCurrentFlow('o2o'); setStep(0); }} className="bg-white p-10 rounded-[3rem] border border-[#1B5234]/20 shadow-xl cursor-pointer hover:scale-105 transition-all flex flex-col items-center group">
                <div className="w-20 h-20 bg-[#F9F8F4] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#1B5234] transition-colors"><Smartphone size={40} className="text-[#1B5234] group-hover:text-white transition-colors"/></div>
                <h3 className="text-3xl font-bold text-[#3E3E3E] mb-4">Express O2O</h3>
                <span className="text-sm font-bold uppercase tracking-widest text-[#1B5234]">Launch Flow B</span>
              </div>
            </div>
          </div>
        )}

        {/* IN-STORE FLOW */}
        {currentFlow === 'instore' && step === 0 && (
          <div className="space-y-8 animate-fade-in w-full flex flex-col items-center text-center">
            <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-2">Hearing Wellness Portal</h1>
            <p className="text-[#3E3E3E] text-2xl font-light mb-12 max-w-2xl">Take your 3-Minute Listening Check to discover your personalized sound profile.</p>
            <button onClick={() => { audio.initAudio(); setStep(1); }} className="px-10 py-6 rounded-full bg-[#1B5234] text-[#F9F8F4] text-2xl font-bold hover:bg-[#133c26] active:scale-95 shadow-xl transition-all cursor-pointer w-full max-w-md">Begin Wellness Check</button>
          </div>
        )}

        {currentFlow === 'instore' && step === 1 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I need the TV volume turned up loud, or I rely heavily on subtitles."</p>
            <ThreeOptions />
          </div>
        )}
        {currentFlow === 'instore' && step === 2 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I often feel like people are mumbling or not speaking clearly."</p>
            <ThreeOptions />
          </div>
        )}
        {currentFlow === 'instore' && step === 3 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I avoid social gatherings because listening in noise takes too much effort."</p>
            <ThreeOptions />
          </div>
        )}
        {currentFlow === 'instore' && step === 4 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I find it exhausting to keep up with conversations in group settings."</p>
            <ThreeOptions />
          </div>
        )}

        {currentFlow === 'instore' && step === 5 && (
          <div className="space-y-8 animate-fade-in w-full max-w-2xl flex flex-col items-center">
            <div className="bg-[#1B5234] w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
              <Headphones size={64} className="text-white" />
            </div>
            <p className="text-3xl font-light leading-relaxed text-[#3E3E3E] mb-8">Please take a sanitizing wipe, clean the earpads, and put on the headphones.</p>
            <button onClick={() => { audio.initAudio(); setStep(6); }} className="px-10 py-6 rounded-full bg-[#1B5234] text-[#F9F8F4] text-2xl font-bold hover:bg-[#133c26] active:scale-95 shadow-xl transition-all cursor-pointer w-full max-w-sm">I'm Ready</button>
          </div>
        )}

        {currentFlow === 'instore' && step === 6 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center">
            <p className="text-4xl font-light leading-relaxed text-[#3E3E3E] mb-2 px-8">High Frequencies</p>
            <p className="text-xl font-light opacity-80">Tap the minus button until the high tone disappears, then tap plus just until you hear it.</p>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-[#1B5234]/10 w-full flex flex-col items-center mt-6">
              <div className="flex items-center justify-center gap-12 w-full mb-10">
                <button onClick={() => setHighFreqVol(v => Math.max(0, v - 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Minus size={48} className="text-[#3E3E3E]" /></button>
                <div className="flex gap-2">{[...Array(10)].map((_, i) => (<div key={i} className={`w-3 rounded-full transition-all duration-300 ${i < highFreqVol ? 'bg-[#1B5234] h-16' : 'bg-[#E8E4DB] h-8'}`} />))}</div>
                <button onClick={() => setHighFreqVol(v => Math.min(10, v + 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Plus size={48} className="text-[#3E3E3E]" /></button>
              </div>
              <button onClick={() => setStep(7)} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md w-full max-w-sm cursor-pointer">Confirm Level</button>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 7 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center">
            <p className="text-4xl font-light leading-relaxed text-[#3E3E3E] mb-2 px-8">Mid Frequencies</p>
            <p className="text-xl font-light opacity-80">Tap the minus button until the mid tone disappears, then tap plus just until you hear it.</p>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-[#1B5234]/10 w-full flex flex-col items-center mt-6">
              <div className="flex items-center justify-center gap-12 w-full mb-10">
                <button onClick={() => setMidFreqVol(v => Math.max(0, v - 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Minus size={48} className="text-[#3E3E3E]" /></button>
                <div className="flex gap-2">{[...Array(10)].map((_, i) => (<div key={i} className={`w-3 rounded-full transition-all duration-300 ${i < midFreqVol ? 'bg-[#1B5234] h-16' : 'bg-[#E8E4DB] h-8'}`} />))}</div>
                <button onClick={() => setMidFreqVol(v => Math.min(10, v + 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Plus size={48} className="text-[#3E3E3E]" /></button>
              </div>
              <button onClick={() => setStep(8)} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md w-full max-w-sm cursor-pointer">Confirm Level</button>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 8 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center">
            <p className="text-4xl font-light leading-relaxed text-[#3E3E3E] mb-2 px-8">Low Frequencies</p>
            <p className="text-xl font-light opacity-80">Tap the minus button until the low tone disappears, then tap plus just until you hear it.</p>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-[#1B5234]/10 w-full flex flex-col items-center mt-6">
              <div className="flex items-center justify-center gap-12 w-full mb-10">
                <button onClick={() => setLowFreqVol(v => Math.max(0, v - 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Minus size={48} className="text-[#3E3E3E]" /></button>
                <div className="flex gap-2">{[...Array(10)].map((_, i) => (<div key={i} className={`w-3 rounded-full transition-all duration-300 ${i < lowFreqVol ? 'bg-[#1B5234] h-16' : 'bg-[#E8E4DB] h-8'}`} />))}</div>
                <button onClick={() => setLowFreqVol(v => Math.min(10, v + 1))} className="w-24 h-24 rounded-full bg-[#F9F8F4] border-2 border-[#E8E4DB] flex items-center justify-center hover:bg-[#E8E4DB] active:scale-95 transition-all cursor-pointer shadow-sm"><Plus size={48} className="text-[#3E3E3E]" /></button>
              </div>
              <button onClick={() => setStep(9)} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md w-full max-w-sm cursor-pointer">Confirm Level</button>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 9 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center text-center">
            <div className="text-[#1B5234] mb-2 bg-white p-6 rounded-full shadow-sm border border-[#1B5234]/10"><Brain size={64}/></div>
            <p className="text-3xl font-light leading-relaxed text-[#3E3E3E]/90 bg-white p-10 rounded-3xl shadow-xl border border-[#E8E4DB]">
              You aren't imagining the exhaustion. When you lose specific frequencies, your brain works overtime to "fill in the blanks" in conversations. This is why socializing leaves you drained.
            </p>
            <button onClick={() => setStep(10)} className="px-10 py-6 rounded-full bg-[#1B5234] text-[#F9F8F4] text-2xl font-bold hover:bg-[#133c26] active:scale-95 shadow-xl transition-all cursor-pointer mt-4">Start Audio Challenge</button>
          </div>
        )}

        {currentFlow === 'instore' && step === 10 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl flex flex-col items-center">
            <p className="text-4xl font-light leading-relaxed text-[#3E3E3E] text-center px-4">Listen to the restaurant noise. Tap "Play Word" and identify what is spoken.</p>
            <div className="w-full bg-white p-12 rounded-[3rem] border border-[#1B5234]/20 shadow-xl mt-4 flex flex-col items-center">
              <div className="text-sm font-bold uppercase tracking-widest text-[#1B5234] mb-6">Word {wordStep + 1} of 5</div>
              <button onClick={() => audio.speakWord(testWords[wordStep].w, 'untreated')} className="mb-10 flex items-center gap-3 bg-[#1B5234] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-lg hover:bg-[#133c26] active:scale-95 transition-all shadow-md cursor-pointer">
                <PlayCircle size={28}/> Play Word
              </button>
              <div className="w-full border-t border-[#E8E4DB] pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
                  {testWords[wordStep].opts.map(word => (
                    <button key={word} onClick={handleWordSelect} className="py-6 rounded-2xl bg-[#F9F8F4] border-2 border-[#E8E4DB] hover:border-[#1B5234] transition-all text-3xl font-bold text-[#3E3E3E] cursor-pointer shadow-sm active:scale-95">
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 11 && (
          <div className="space-y-8 animate-fade-in w-full max-w-5xl flex flex-col items-center">
            <p className="text-4xl font-light leading-relaxed text-[#3E3E3E] text-center px-4 max-w-4xl">Tap the filters below to instantly suppress the background noise and enhance the voice.</p>
            <div className="w-full bg-white p-8 rounded-[3rem] border border-[#1B5234]/20 shadow-xl mt-4">
              <div className="flex justify-center mb-8">
                <button onClick={() => audio.speakWord("I was walking down to the market the other day, and the weather was absolutely beautiful.", simMode)} className="flex items-center gap-3 bg-[#F9F8F4] border-2 border-[#E8E4DB] text-[#3E3E3E] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:border-[#1B5234] active:scale-95 transition-all cursor-pointer">
                  <RefreshCw size={20}/> Play Voice Demo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => { setSimMode('untreated'); audio.liveUpdateFilters('untreated'); }} className={`p-8 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center justify-center gap-4 cursor-pointer ${simMode === 'untreated' ? 'bg-[#F9F8F4] border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}>
                  <Volume2 size={48} className={simMode === 'untreated' ? 'text-[#1B5234]' : ''}/>
                  <span className="font-bold text-2xl leading-tight">Standard<br/>Hearing</span>
                </button>
                <button onClick={() => { setSimMode('suppression'); audio.liveUpdateFilters('suppression'); }} className={`p-8 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center justify-center gap-4 cursor-pointer ${simMode === 'suppression' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-md scale-105' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}>
                  <Shield size={48} className={simMode === 'suppression' ? 'text-white' : ''}/>
                  <span className="font-bold text-2xl leading-tight">Noise<br/>Suppression</span>
                </button>
                <button onClick={() => { setSimMode('active'); audio.liveUpdateFilters('active'); }} className={`p-8 rounded-3xl transition-all duration-300 border-2 flex flex-col items-center justify-center gap-4 cursor-pointer ${simMode === 'active' ? 'bg-[#1B5234] text-white border-[#1B5234] shadow-2xl scale-110' : 'bg-white border-transparent hover:bg-gray-50 text-[#3E3E3E]/60'}`}>
                  <Sparkles size={48} className={simMode === 'active' ? 'text-white' : ''}/>
                  <span className="font-bold text-2xl leading-tight">AI Voice<br/>Clarity</span>
                </button>
              </div>
            </div>
            <div className="pt-6">
              <button onClick={() => { setStep(12); audio.stopAll(); }} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md cursor-pointer">View My Profile</button>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 12 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl">
            <div className="mx-auto bg-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#1B5234]/10"><User size={48} className="text-[#1B5234]" /></div>
            <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-[#1B5234]/10 text-left flex flex-col justify-center">
              {frictionScore < 4 ? (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your baseline indicates very low social friction. Your natural hearing is serving you well.</p>
                  <p className="text-xl opacity-90 font-light">Explore <span className="font-bold text-[#1B5234]">Situational Enhancers</span> to protect your baseline in noisy spaces.</p>
                </>
              ) : (
                <>
                  <p className="font-light text-3xl leading-relaxed border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E] mb-6">Your baseline indicates elevated social friction. You are expending a high amount of cognitive energy to stay connected in noise.</p>
                  <p className="text-xl opacity-90 font-light">To permanently reduce your cognitive tax, we recommend a professional evaluation of Invisible AI Technology.</p>
                </>
              )}
            </div>
            <div className="pt-8">
              <button onClick={() => setStep(13)} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md cursor-pointer">Continue</button>
            </div>
          </div>
        )}

        {currentFlow === 'instore' && step === 13 && (
          <div className="w-full max-w-5xl space-y-8 animate-fade-in text-left">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-xl tracking-widest uppercase shadow-md">Scene+</div>
              <h2 className="text-4xl font-light text-[#3E3E3E]">Earn 50 Points Today</h2>
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-[#E8E4DB] relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-6">
                  <h3 className="text-2xl font-bold text-[#3E3E3E] mb-2">1. Your Information</h3>
                  <input type="text" placeholder="First Name" className="w-full bg-[#F9F8F4] text-[#3E3E3E] p-5 rounded-2xl outline-none font-serif italic text-lg border border-[#E8E4DB]" />
                  <input type="tel" placeholder="Mobile Number" className="w-full bg-[#F9F8F4] text-[#3E3E3E] p-5 rounded-2xl outline-none font-serif italic text-lg border border-[#E8E4DB]" />
                  <input type="text" placeholder="Scene+ Card (16 Digits)" className="w-full bg-[#F9F8F4] text-[#3E3E3E] p-5 rounded-2xl outline-none font-mono text-xl tracking-widest border border-[#E8E4DB] shadow-inner" maxLength={16} />
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="text-2xl font-bold text-[#3E3E3E] mb-2">2. Local Partner</h3>
                  <div className="space-y-3 mb-2">
                    {clinics.map(clinic => (
                      <div key={clinic} onClick={() => setSelectedClinic(clinic)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedClinic === clinic ? 'border-[#1B5234] bg-[#F9F8F4] shadow-sm' : 'border-transparent hover:border-[#E8E4DB]'}`}>
                        <div className="shrink-0">{selectedClinic === clinic ? <CheckSquare size={20} className="text-[#1B5234]"/> : <Circle size={20} className="text-[#3E3E3E]/30"/>}</div>
                        <span className={`font-bold text-lg ${selectedClinic === clinic ? 'text-[#1B5234]' : 'text-[#3E3E3E]/70'}`}>{clinic}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#F9F8F4] p-6 rounded-2xl border border-[#E8E4DB] flex items-start gap-4 cursor-pointer" onClick={() => setConsentGiven(!consentGiven)}>
                    <div className="mt-1 shrink-0">{consentGiven ? <CheckSquare size={28} className="text-[#1B5234]" /> : <div className="w-7 h-7 border-2 border-[#3E3E3E]/30 rounded bg-white" />}</div>
                    <p className="text-sm font-light opacity-90 leading-snug font-sans text-[#3E3E3E]">
                      I consent to securely save my profile to Sobeys for Scene+ rewards, and I agree to have <strong className="font-bold text-[#1B5234]">{selectedClinic}</strong> contact me.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-[#E8E4DB] flex flex-col items-center">
                <button onClick={() => { alert("Profile Saved! Partner Contacted."); returnHome(); }} disabled={!consentGiven} className={`w-full max-w-md py-6 rounded-full font-bold uppercase tracking-widest text-xl transition-all cursor-pointer ${consentGiven ? 'bg-[#1B5234] text-white hover:bg-[#133c26] shadow-xl hover:scale-105' : 'bg-[#E8E4DB] text-[#3E3E3E]/50 cursor-not-allowed'}`}>Claim Points & Save</button>
                <div className="flex justify-center items-center gap-2 text-[#3E3E3E]/50 text-xs uppercase tracking-widest font-bold mt-4"><ShieldCheck size={16}/> PIPEDA Compliant & Encrypted</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* EXPRESS O2O FLOW */}
        {/* ========================================== */}
        {currentFlow === 'o2o' && step === 0 && (
          <div className="space-y-8 animate-fade-in w-full flex flex-col items-center text-center">
            <h1 className="text-6xl font-serif text-[#1B5234] font-bold tracking-tight mb-2">Hearing Wellness Portal</h1>
            <p className="text-[#3E3E3E] text-2xl font-light mb-12 max-w-2xl">Take your 30-Second Listening Check to discover your personalized sound profile.</p>
            <button onClick={() => setStep(1)} className="px-10 py-6 rounded-full bg-[#1B5234] text-[#F9F8F4] text-2xl font-bold hover:bg-[#133c26] active:scale-95 shadow-xl transition-all cursor-pointer w-full max-w-md">Begin Wellness Check</button>
          </div>
        )}
        
        {currentFlow === 'o2o' && step === 1 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I need the TV volume turned up loud, or I rely heavily on subtitles."</p>
            <ThreeOptions />
          </div>
        )}

        {currentFlow === 'o2o' && step === 2 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-5xl font-light leading-tight opacity-90 max-w-4xl text-center px-4">"I avoid social gatherings because listening takes too much effort."</p>
            <ThreeOptions />
          </div>
        )}

        {currentFlow === 'o2o' && step === 3 && (
          <div className="space-y-8 animate-fade-in w-full max-w-3xl flex flex-col items-center text-center">
            <div className="text-[#1B5234] mb-2 bg-white p-6 rounded-full shadow-sm border border-[#1B5234]/10"><Brain size={64}/></div>
            <p className="text-3xl font-light leading-relaxed text-[#3E3E3E]/90 bg-white p-8 rounded-3xl shadow-sm border border-[#E8E4DB]">You aren't imagining it. When you lose specific sound frequencies, your brain works overtime to "fill in the blanks." This cognitive load is why socializing leaves you physically exhausted.</p>
            <button onClick={() => setStep(4)} className="px-10 py-5 rounded-full bg-[#1B5234] text-[#F9F8F4] text-xl font-bold hover:bg-[#133c26] active:scale-95 shadow-md cursor-pointer mt-4">Experience the Solution</button>
          </div>
        )}

        {currentFlow === 'o2o' && step === 4 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="bg-[#1B5234] p-12 rounded-[3rem] shadow-2xl border border-[#1B5234]/10 flex flex-col md:flex-row gap-12 items-center text-white relative overflow-hidden">
              <div className="flex-1 space-y-6 relative z-10">
                <h3 className="text-5xl font-serif font-bold italic mb-2">Hear the Difference</h3>
                <p className="text-2xl font-light leading-relaxed opacity-90">To experience the AI Audio Simulation with perfect clarity, scan this code to continue on your personal smartphone using your own headphones.</p>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl w-fit border border-white/20 mt-4 shadow-inner">
                  <div className="bg-white text-gray-900 px-3 py-1 rounded-lg font-black text-sm tracking-widest uppercase">Scene+</div>
                  <span className="font-bold text-lg">Earn 50 Points upon completion</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="w-80 bg-[#F9F8F4] border-4 border-white rounded-3xl relative shadow-2xl flex flex-col items-center justify-center p-8 text-[#3E3E3E]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sobeys_logo.svg" alt="Sobeys" className="h-8 opacity-50 mb-8" />
                  <div className="bg-white p-4 rounded-2xl shadow-md mb-6"><QrCode size={140} className="text-[#3E3E3E]" /></div>
                  <p className="text-center font-black text-[#1B5234] text-sm uppercase tracking-widest">Scan with Camera</p>
                </div>
              </div>
            </div>
            <div className="text-center pt-4"><button onClick={returnHome} className="text-[#3E3E3E]/50 font-bold uppercase tracking-widest text-sm hover:text-[#3E3E3E] cursor-pointer">Return to Home Screen</button></div>
          </div>
        )}

        {/* ENTERPRISE PORTAL */}
        {currentFlow === 'enterprise' && step === 0 && (
          <div className="space-y-8 animate-fade-in w-full max-w-4xl text-left">
            <div className="flex items-center justify-between mb-8 border-b border-[#3E3E3E]/20 pb-6">
              <div className="flex items-center gap-4"><div className="p-4 bg-[#1B5234] text-white rounded-2xl"><Award size={32} /></div><div><h2 className="text-4xl font-light">The Sobeys Retail Media Network</h2><p className="text-sm uppercase tracking-widest text-[#1B5234] font-bold mt-1">Zero-Liability Monetization</p></div></div>
            </div>
            <p className="text-2xl font-light leading-relaxed mb-8 border-l-4 border-[#1B5234] pl-6 text-[#3E3E3E]/90">We do not sell medical data. We sell highly targeted <span className="font-bold">Digital Real Estate</span>.</p>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="bg-[#1B5234] p-8 rounded-3xl border border-[#1B5234] text-white shadow-xl">
                <h4 className="font-bold text-white mb-2 text-xl flex items-center gap-2">Sobeys Value</h4>
                <p className="text-lg font-light opacity-90 leading-relaxed">Sobeys retains 100% of the patient demographic and Scene+ data for future OTC targeting. You take zero liability for clinical referrals.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 border-[#1B5234] shadow-md">
                <h4 className="font-bold text-[#1B5234] mb-2 text-xl flex items-center gap-2">Partner Value</h4>
                <p className="text-lg font-light opacity-90 leading-relaxed text-[#3E3E3E]">Local clinics purchase Geo-Targeted Ad placements at the exact moment a high-friction patient finishes the screener. It is the highest-intent advertising in healthcare.</p>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {currentFlow === 'instore' && step > 0 && step < 13 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50 cursor-pointer"><ChevronLeft size={24} /> Back</button>)}
      {currentFlow === 'o2o' && step > 0 && step < 4 && (<button onClick={back} className="fixed bottom-12 left-12 text-[#3E3E3E]/40 hover:text-[#3E3E3E] flex items-center gap-2 text-xl italic transition-all z-50 cursor-pointer"><ChevronLeft size={24} /> Back</button>)}

      {currentFlow === 'enterprise' && (
        <div className="fixed bottom-8 left-0 w-full flex justify-between px-12 z-50">
          <button disabled className="opacity-30 flex items-center gap-2 font-bold uppercase tracking-widest text-sm bg-white px-4 py-2 rounded-full shadow-sm"><ChevronLeft size={20}/> Previous</button>
          <button onClick={returnHome} className="flex items-center gap-2 text-[#F9F8F4] font-bold uppercase tracking-widest text-sm transition-all bg-[#1B5234] px-6 py-3 rounded-full shadow-lg hover:bg-[#133c26] border border-[#1B5234] cursor-pointer">Exit Portal <Lock size={16}/></button>
        </div>
      )}

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
