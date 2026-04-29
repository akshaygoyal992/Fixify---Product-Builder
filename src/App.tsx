/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  ChevronRight, 
  Home, 
  Grid, 
  Plus, 
  Clock, 
  User, 
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Mic,
  MoreVertical
} from 'lucide-react';

// --- Types ---
type Screen = 
  | 'SPLASH' | 'LOGIN' | 'OTP' | 'HOME' | 'CATEGORIES' | 'PRO_LIST'
  | 'UPLOAD' | 'NOTE' | 'AI_PREFILL' | 'ADDRESS' 
  | 'SLOT' | 'SUMMARY' | 'CONFIRMATION' | 'ORDERS' | 'ORDER_DETAILS' | 'PROFILE';

interface AppState {
  screen: Screen;
  image: string | null;
  note: string;
  selectedCategory: string | null;
  selectedOrderId: string | null;
  issueData: {
    type: string;
    service: string;
    urgency: string;
  };
  address: string;
  slot: { date: string; time: string };
}

// --- Constants ---
const PRIMARY_COLOR = "#2D336B";
const BG_COLOR = "#F9F8F6";

// --- Main App Component ---
export default function App() {
  const [state, setState] = useState<AppState>({
    screen: 'SPLASH',
    image: null,
    note: '',
    selectedCategory: null,
    selectedOrderId: null,
    issueData: {
      type: 'Water Leakage',
      service: 'Plumbing',
      urgency: 'Medium',
    },
    address: '123 Main St, Apartment 4B',
    slot: { date: 'May 1, 2026', time: '10:00 AM' },
  });

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (state.screen === 'SPLASH') {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, screen: 'LOGIN' }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.screen]);

  const navigate = (screen: Screen) => {
    setState(prev => ({ ...prev, screen }));
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Screen Rendering Logic
  const renderScreen = () => {
    switch (state.screen) {
      case 'SPLASH': return <SplashScreen />;
      case 'LOGIN': return <LoginScreen onNext={() => navigate('OTP')} />;
      case 'OTP': return <OTPScreen onNext={() => navigate('HOME')} />;
      case 'HOME': return <HomeScreen state={state} onAction={(scr) => navigate(scr)} setImg={(img) => updateState({ image: img })} />;
      case 'CATEGORIES': return <CategoriesScreen onBack={() => navigate('HOME')} onSelect={(cat) => { updateState({ selectedCategory: cat }); navigate('PRO_LIST'); }} />;
      case 'PRO_LIST': return <ProListScreen category={state.selectedCategory || 'Service'} onBack={() => navigate('CATEGORIES')} />;
      case 'UPLOAD': return <UploadScreen onBack={() => navigate('HOME')} onNext={(img) => { updateState({ image: img }); navigate('NOTE'); }} />;
      case 'NOTE': return <NoteScreen state={state} onBack={() => navigate('UPLOAD')} onNext={(note) => { updateState({ note }); navigate('AI_PREFILL'); }} />;
      case 'AI_PREFILL': return <AIPrefillScreen state={state} onBack={() => navigate('NOTE')} onNext={(data) => { updateState({ issueData: data }); navigate('ADDRESS'); }} />;
      case 'ADDRESS': return <AddressScreen state={state} onBack={() => navigate('AI_PREFILL')} onNext={(addr) => { updateState({ address: addr }); navigate('SLOT'); }} />;
      case 'SLOT': return <SlotSelectionScreen onBack={() => navigate('ADDRESS')} onNext={(slot) => { updateState({ slot }); navigate('SUMMARY'); }} />;
      case 'SUMMARY': return <SummaryScreen state={state} onBack={() => navigate('SLOT')} onNext={() => navigate('CONFIRMATION')} />;
      case 'CONFIRMATION': return <ConfirmationScreen onNext={() => navigate('ORDERS')} />;
      case 'ORDERS': return <OrdersScreen onBack={() => navigate('HOME')} onSelectOrder={(id) => { updateState({ selectedOrderId: id }); navigate('ORDER_DETAILS'); }} />;
      case 'ORDER_DETAILS': return <OrderDetailsScreen orderId={state.selectedOrderId || ''} onBack={() => navigate('ORDERS')} />;
      case 'PROFILE': return <ProfileScreen onBack={() => navigate('HOME')} />;
      default: return <HomeScreen state={state} onAction={(scr) => navigate(scr)} setImg={(img) => updateState({ image: img })} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 flex items-center justify-center font-sans">
      <div className="iphone-frame">
        <div className="iphone-content relative">
          {/* Status Bar */}
          <div className="h-11 px-8 pt-4 flex justify-between items-center z-50 bg-transparent">
            <span className="text-sm font-semibold">9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-4 h-4 bg-black rounded-full" />
              <div className="w-4 h-4 bg-black rounded-full" />
              <div className="w-6 h-3 border border-black rounded-sm relative">
                <div className="absolute left-[1px] top-[1px] bottom-[1px] right-1 bg-black rounded-sm" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.screen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1 overflow-y-auto"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Nav - Hidden on auth and specific screens */}
          {!['SPLASH', 'LOGIN', 'OTP', 'UPLOAD', 'NOTE', 'AI_PREFILL', 'ADDRESS', 'SLOT', 'SUMMARY', 'CONFIRMATION'].includes(state.screen) && (
            <BottomNav current={state.screen} onNavigate={navigate} />
          )}
          
          {/* Home Indicator */}
          <div className="h-8 flex justify-center items-end pb-2">
            <div className="w-32 h-1 bg-black/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component Fragments ---

function SplashScreen() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-brand-accent rounded-[28px] flex items-center justify-center mb-6 shadow-2xl">
          <Plus className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-brand-accent">Fixify</h1>
      </motion.div>
    </div>
  );
}

function LoginScreen({ onNext }: { onNext: () => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="h-full px-6 flex flex-col pt-20">
      <h2 className="text-3xl font-bold mb-2">Welcome to Fixify</h2>
      <p className="text-brand-muted mb-10">Sign in with your phone or email to start fixing.</p>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted ml-1">Email or Phone</label>
          <input 
            type="text" 
            placeholder="e.g. +1 555 000 0000" 
            className="w-full p-4 bg-white border border-brand-secondary rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
        <button 
          onClick={onNext}
          disabled={!val}
          className="btn-primary w-full disabled:opacity-50"
        >
          Send Code
        </button>
      </div>
      
      <p className="mt-auto mb-8 text-center text-xs text-brand-muted leading-relaxed">
        By continuing, you agree to Fixify's <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
}

function OTPScreen({ onNext }: { onNext: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  
  const handleChange = (i: number, v: string) => {
    const newOtp = [...otp];
    newOtp[i] = v.slice(-1);
    setOtp(newOtp);
    if (v && i < 3) {
      // Focus next logic would be here
    }
    if (newOtp.every(x => x)) {
      setTimeout(onNext, 400);
    }
  };

  return (
    <div className="h-full px-6 flex flex-col pt-20">
      <h2 className="text-3xl font-bold mb-2">Verify Account</h2>
      <p className="text-brand-muted mb-10">We've sent a 4-digit code to your mobile.</p>
      
      <div className="flex gap-4 justify-center mb-8">
        {otp.map((v, i) => (
          <input 
            key={i}
            type="number"
            className="w-16 h-20 text-center text-2xl font-bold bg-white border border-brand-secondary rounded-2xl outline-none focus:border-brand-accent transition-colors shadow-sm"
            value={v}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        ))}
      </div>
      
      <button className="text-brand-accent font-medium text-center bg-brand-accent/5 py-3 rounded-xl mx-auto px-6">
        Resend Code
      </button>
    </div>
  );
}

function HomeScreen({ state, onAction, setImg }: { 
  state: AppState, 
  onAction: (s: Screen) => void,
  setImg: (i: string) => void
}) {
  return (
    <div className="h-full px-6 pt-12 flex flex-col gap-8 pb-32">
      <header className="flex justify-between items-center">
        <div>
          <span className="text-xl font-bold tracking-tight text-brand-accent">Fixify</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-accent shadow-sm">
          <div className="w-2 h-2 rounded-full bg-red-500" />
        </div>
      </header>

      <div>
        <h1 className="text-[32px] font-semibold leading-tight text-brand-accent tracking-tight">What needs<br/>fixing?</h1>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <button 
          onClick={() => onAction('UPLOAD')}
          className="btn-primary w-full py-5 text-base"
        >
          <Camera size={22} strokeWidth={2.5} />
          <span>Take Photo</span>
        </button>
        <button 
          onClick={() => onAction('UPLOAD')}
          className="btn-secondary w-full py-5 text-base"
        >
          <ImageIcon size={22} className="opacity-60" />
          <span>Upload Gallery</span>
        </button>
      </div>

      {/* Recent Requests */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-muted">Recent Requests</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-brand-surface rounded-2xl border border-transparent hover:border-brand-secondary transition-all cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-accent shadow-sm">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Broken Kitchen Faucet</p>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Completed · 2 days ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Card - Problem Centric */}
      <div className="card bg-brand-accent/5 border-none p-6 rounded-[32px] flex items-center gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-brand-accent">Unsure what's wrong?</h4>
          <p className="text-xs text-brand-accent/70 mt-1">Our AI can analyze your problem and suggest the right professional.</p>
        </div>
        <Plus className="bg-brand-accent text-white rounded-full p-1" size={24} />
      </div>
    </div>
  );
}

function CategoriesScreen({ onBack, onSelect }: { onBack: () => void, onSelect: (cat: string) => void }) {
  const cats = ["Plumbing", "Electrical", "Carpentry", "Cleaning", "Appliance", "Gardening", "Painting", "Locksmith"];
  return (
    <div className="h-full px-6 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-bold">Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-20">
        {cats.map(c => (
          <div 
            key={c} 
            onClick={() => onSelect(c)}
            className="card h-32 flex flex-col justify-end gap-2 hover:border-brand-accent transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center group-hover:bg-brand-accent/10">
              <Grid size={16} className="text-brand-muted group-hover:text-brand-accent" />
            </div>
            <p className="font-bold text-sm">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProListScreen({ category, onBack }: { category: string, onBack: () => void }) {
  const [selectedPro, setSelectedPro] = useState<string | null>(null);

  const pros = [
    {
      id: "1",
      name: "Marcus Thorne",
      rating: 4.9,
      reviews: 124,
      xp: "12 years",
      price: "$45/hr",
      avatar: "MT",
      color: "bg-blue-600",
      topReview: "Marcus was incredibly professional. Fixed my leaking sink in 20 minutes. Highly recommended and very polite!"
    },
    {
      id: "2",
      name: "Elena Rodriguez",
      rating: 4.8,
      reviews: 89,
      xp: "8 years",
      price: "$50/hr",
      avatar: "ER",
      color: "bg-purple-600",
      topReview: "Super efficient and clean work. Elena explained exactly what was wrong before starting the job. A+ service."
    },
    {
      id: "3",
      name: "David Chen",
      rating: 4.7,
      reviews: 215,
      xp: "15 years",
      price: "$40/hr",
      avatar: "DC",
      color: "bg-emerald-600",
      topReview: "Great experience. David arrived right on time and had all the parts needed for a tricky repair. Very knowledgeable."
    }
  ];

  return (
    <div className="h-full flex flex-col pt-12">
      <div className="px-6 flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <div>
          <h2 className="text-xl font-bold">{category} Pros</h2>
          <p className="text-xs text-brand-muted font-medium uppercase tracking-widest">3 Top Rated Nearby</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
        {pros.map(pro => (
          <div key={pro.id} className="card p-0 overflow-hidden flex flex-col bg-white">
            <div className="p-5 flex gap-4">
              <div className={`w-14 h-14 rounded-2xl ${pro.color} text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-black/5`}>
                {pro.avatar}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{pro.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded text-yellow-700">
                    <span className="text-xs font-bold">{pro.rating}</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-1 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                  <span>{pro.xp} XP</span>
                  <span>{pro.reviews} Reviews</span>
                  <span className="text-brand-accent">{pro.price}</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-0">
               <div className="bg-brand-surface p-4 rounded-xl relative">
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-brand-surface rotate-45 border-l border-t border-brand-secondary/30" />
                  <p className="text-sm text-brand-text leading-relaxed font-medium italic">
                    "{pro.topReview}"
                  </p>
                  <p className="text-[10px] text-brand-muted font-bold mt-2 uppercase tracking-widest">Recent customer review</p>
               </div>
               
               <button 
                  onClick={() => setSelectedPro(pro.id)}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedPro === pro.id ? 'bg-brand-accent text-white' : 'bg-brand-accent/5 text-brand-accent border border-brand-accent/10'}`}
               >
                 {selectedPro === pro.id ? "Selected Pro" : "View Details & Book"}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadScreen({ onBack, onNext }: { onBack: () => void, onNext: (img: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Brief delay for visual feedback
        setTimeout(() => {
          onNext(dataUrl);
        }, 500);
      }
    }
  };

  const handleGalleryUpload = () => {
    // Falls back to mock if real upload isn't implemented
    onNext("https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=687&auto=format&fit=crop");
  };

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Snap the Issue</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 rounded-[40px] overflow-hidden bg-black relative shadow-2xl border border-brand-secondary/20">
        {!stream ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse flex items-center justify-center">
              <Camera size={32} />
            </div>
            <p className="text-sm font-medium opacity-60">Requesting camera access...</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute inset-0 pointer-events-none border-4 border-white/20 rounded-[40px] m-4" />
        
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button onClick={handleGalleryUpload} className="btn-secondary">
          <ImageIcon size={20} />
          Gallery
        </button>
        <button 
          onClick={capturePhoto} 
          disabled={!stream || isCapturing}
          className="btn-primary"
        >
          {isCapturing ? "Processing..." : "Capture"}
        </button>
      </div>

      <p className="text-center text-[10px] text-brand-muted mt-4 font-medium uppercase tracking-[0.1em]">
        AI detects service and urgency instantly
      </p>
    </div>
  );
}

function NoteScreen({ state, onBack, onNext }: { state: AppState, onBack: () => void, onNext: (note: string) => void }) {
  const [note, setNote] = useState('');
  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Add Details</h2>
        <div className="w-10" />
      </div>

      {state.image && (
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-inner relative group">
          <img src={state.image} className="w-full h-full object-cover" alt="Issue"/>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Retake</span>
          </div>
        </div>
      )}

      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2 block">Tell us more (Optional)</label>
        <textarea 
          placeholder="E.g. The leak started this morning, water is cold..." 
          className="w-full h-32 p-4 bg-white border border-brand-secondary rounded-2xl focus:ring-2 focus:ring-brand-accent/20 outline-none resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex items-center gap-2 mt-2 text-brand-muted">
           <Mic size={16} />
           <span className="text-xs">Tap to dictate note</span>
        </div>
      </div>

      <button onClick={() => onNext(note)} className="btn-primary w-full shadow-lg">
        Continue
      </button>
    </div>
  );
}

function AIPrefillScreen({ state, onBack, onNext }: { state: AppState, onBack: () => void, onNext: (d: any) => void }) {
  const [data, setData] = useState(state.issueData);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (analyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 relative bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6"
        >
           <Plus className="text-brand-accent w-10 h-10" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Analyzing Image...</h2>
        <p className="text-center text-brand-muted text-sm">Fixify AI is detecting the issue type and urgency level.</p>
        
        {/* Mock progress chips */}
        <div className="flex gap-2 mt-8">
           <div className="h-1 w-8 bg-brand-accent rounded-full animate-pulse" />
           <div className="h-1 w-8 bg-brand-accent/20 rounded-full" />
           <div className="h-1 w-8 bg-brand-accent/20 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
       <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">AI Analysis</h2>
        <div className="w-10" />
      </div>

      <div className="card bg-brand-accent/5 border-dashed border-brand-accent/30 flex items-center gap-3 p-3 rounded-2xl mb-6">
        <div className="p-2 bg-brand-accent text-white rounded-lg">
           <CheckCircle2 size={16} />
        </div>
        <p className="text-xs font-medium text-brand-accent">All fields pre-filled based on your image.</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="flex flex-col gap-1.5">
           <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1">Detected Issue</label>
           <div className="flex items-center justify-between p-4 bg-white border border-brand-secondary rounded-2xl">
             <span className="font-bold">{data.type}</span>
             <button className="text-brand-accent text-sm font-semibold">Edit</button>
           </div>
        </div>

        <div className="flex flex-col gap-1.5">
           <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1">Service Required</label>
           <div className="flex items-center justify-between p-4 bg-white border border-brand-secondary rounded-2xl">
             <span className="font-bold">{data.service}</span>
             <button className="text-brand-accent text-sm font-semibold">Edit</button>
           </div>
        </div>

        <div className="flex flex-col gap-1.5">
           <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1">Urgency</label>
           <div className="flex gap-2">
             {['Low', 'Medium', 'Emergency'].map(u => (
               <button 
                 key={u}
                 onClick={() => setData(prev => ({ ...prev, urgency: u }))}
                 className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${data.urgency === u ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-text border-brand-secondary'}`}
               >
                 {u}
               </button>
             ))}
           </div>
        </div>
      </div>

      <button onClick={() => onNext(data)} className="btn-primary w-full shadow-lg">
        Looks good, continue
      </button>
    </div>
  );
}

function AddressScreen({ state, onBack, onNext }: { state: AppState, onBack: () => void, onNext: (a: string) => void }) {
  const [addr, setAddr] = useState(state.address);
  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Address</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 space-y-6">
        <div className="card p-0 overflow-hidden">
          <div className="h-32 bg-gray-200 relative">
             <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="text-brand-accent animate-bounce" size={32} />
             </div>
             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=700&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Map"/>
          </div>
          <div className="p-4">
             <p className="text-xs font-semibold text-brand-muted uppercase mb-2">Saved Address</p>
             <p className="font-bold flex items-start gap-2">
               <Home size={18} className="text-brand-accent shrink-0 mt-0.5" />
               Work from Studio
             </p>
             <p className="text-sm text-brand-muted mt-1 ml-6">{addr}</p>
          </div>
        </div>

        <button className="text-brand-accent font-semibold flex items-center gap-2 px-1">
          <Plus size={18} />
          Add new address
        </button>

        <div className="flex flex-col gap-1.5 pt-4">
           <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1">Phone Number</label>
           <div className="p-4 bg-white border border-brand-secondary rounded-2xl flex justify-between items-center">
             <span className="font-bold">+1 (555) 012-3456</span>
             <p className="text-xs text-brand-muted font-medium">Verify</p>
           </div>
        </div>
      </div>

      <button onClick={() => onNext(addr)} className="btn-primary w-full">
        Proceed to Timeline
      </button>
    </div>
  );
}

function SlotSelectionScreen({ onBack, onNext }: { onBack: () => void, onNext: (s: any) => void }) {
  const dates = ["Apr 30", "May 1", "May 2", "May 3"];
  const times = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  const [selDate, setSelDate] = useState(dates[1]);
  const [selTime, setSelTime] = useState(times[1]);

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Select Slot</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 space-y-8">
        <section>
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1 mb-3 block">Date</label>
          <div className="flex gap-2">
            {dates.map(d => (
              <button 
                key={d}
                onClick={() => setSelDate(d)}
                className={`flex-1 py-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${selDate === d ? 'bg-brand-accent text-white border-brand-accent shadow-md' : 'bg-white text-brand-text border-brand-secondary'}`}
              >
                <span className="text-[10px] uppercase font-bold opacity-60">{d.split(' ')[0]}</span>
                <span className="text-lg font-black">{d.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted px-1 mb-3 block">Available Times</label>
          <div className="grid grid-cols-2 gap-3">
             {times.map(t => (
               <button 
                 key={t}
                 onClick={() => setSelTime(t)}
                 className={`py-4 rounded-xl border font-bold transition-all ${selTime === t ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-text border-brand-secondary'}`}
               >
                 {t}
               </button>
             ))}
          </div>
        </section>
      </div>

      <button onClick={() => onNext({ date: selDate, time: selTime })} className="btn-primary w-full">
        Continue
      </button>
    </div>
  );
}

function SummaryScreen({ state, onBack, onNext }: { state: AppState, onBack: () => void, onNext: () => void }) {
  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Summary</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 space-y-6">
        <div className="card space-y-4">
          <div className="flex gap-4">
             <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
               <img src={state.image || "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=687&auto=format&fit=crop"} className="w-full h-full object-cover" alt="issue"/>
             </div>
             <div>
               <p className="font-bold">{state.issueData.type}</p>
               <p className="text-xs text-brand-muted">{state.issueData.service} · {state.issueData.urgency} Urgency</p>
               <p className="text-xs italic text-brand-muted mt-1 truncate w-40">"{state.note || 'No additional notes'}"</p>
             </div>
          </div>
          
          <div className="h-px bg-brand-secondary" />

          <div className="space-y-3">
             <div className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-accent mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Home</p>
                  <p className="text-brand-muted">{state.address}</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <Calendar size={16} className="text-brand-accent mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">{state.slot.date}</p>
                  <p className="text-brand-muted">{state.slot.time}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="card bg-brand-bg border-none">
           <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-semibold text-brand-muted uppercase">Estimated Cost</span>
             <AlertCircle size={14} className="text-brand-muted" />
           </div>
           <p className="text-3xl font-black text-brand-accent">$45 - $80</p>
           <p className="text-[10px] text-brand-muted mt-2 leading-relaxed">Price may vary depending on parts required. You will be charged after completion.</p>
        </div>
      </div>

      <button onClick={onNext} className="btn-primary w-full shadow-xl">
        Confirm Booking
      </button>
    </div>
  );
}

function ConfirmationScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="h-full px-8 flex flex-col items-center justify-center text-center bg-brand-accent relative">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-20 h-20 bg-green-400 text-brand-accent rounded-full flex items-center justify-center mb-8 shadow-xl"
      >
        <CheckCircle2 size={40} strokeWidth={3} />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-2 text-center w-full">Booking Confirmed</h2>
      <p className="text-blue-100 text-sm mb-12 opacity-80 leading-relaxed font-medium">A professional will arrive today at 02:00 PM</p>
      
      <div className="bg-white/10 w-full py-6 rounded-[28px] mb-12 backdrop-blur-sm border border-white/5">
        <p className="text-[10px] text-blue-200 uppercase font-black tracking-[0.2em] mb-1">Order ID</p>
        <p className="text-white font-mono text-xl font-bold">FIX-9284-A</p>
      </div>

      <div className="w-full space-y-4">
        <button onClick={onNext} className="w-full bg-white text-brand-accent py-5 rounded-[22px] font-bold text-sm shadow-xl active:scale-95 transition-transform">
          Track Order
        </button>
        <button onClick={onNext} className="mt-4 text-white/60 text-xs font-bold uppercase tracking-widest block mx-auto">
          Back to Home
        </button>
      </div>
    </div>
  );
}

function OrdersScreen({ onBack, onSelectOrder }: { onBack: () => void, onSelectOrder: (id: string) => void }) {
  return (
    <div className="h-full px-6 pt-12 pb-32 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <MoreVertical className="text-brand-muted" />
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-4 ml-1">Active</h3>
          <div 
            onClick={() => onSelectOrder('FIX-99021')}
            className="card border-l-4 border-l-brand-accent cursor-pointer hover:bg-brand-surface transition-all"
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="font-bold">Water Leakage</p>
                  <p className="text-xs text-brand-muted">#FIX-99021 · May 1, 10:00 AM</p>
               </div>
               <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded uppercase">Finding Pro</span>
            </div>
            <button className="w-full py-2 bg-brand-accent text-white rounded-lg text-xs font-bold shadow-md">Track Pro</button>
          </div>
        </section>

        <section className="pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-4 ml-1">Past Requests</h3>
          <div className="space-y-3">
            <div 
              onClick={() => onSelectOrder('FIX-8821')}
              className="card flex items-center justify-between hover:bg-brand-surface cursor-pointer transition-colors"
            >
               <div>
                  <p className="font-bold">Broken Kitchen Sink</p>
                  <p className="text-xs text-brand-muted">Apr 12, 2026</p>
               </div>
               <div className="text-right">
                  <span className="text-green-600 font-bold text-xs block">Completed</span>
                  <p className="text-xs font-bold mt-1">$65.00</p>
               </div>
            </div>
            <div 
              onClick={() => onSelectOrder('FIX-7742')}
              className="card flex items-center justify-between hover:bg-brand-surface cursor-pointer transition-colors"
            >
               <div>
                  <p className="font-bold">AC Installation</p>
                  <p className="text-xs text-brand-muted">Mar 28, 2026</p>
               </div>
               <div className="text-right">
                  <span className="text-green-600 font-bold text-xs block">Completed</span>
                  <p className="text-xs font-bold mt-1">$120.00</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function OrderDetailsScreen({ orderId, onBack }: { orderId: string, onBack: () => void }) {
  const isActive = orderId === 'FIX-99021';
  const [hasReviewed, setHasReviewed] = useState(orderId === 'FIX-8821');

  const details = {
    id: orderId,
    title: isActive ? "Water Leakage" : (orderId === 'FIX-8821' ? "Broken Kitchen Sink" : "AC Installation"),
    bookedAt: isActive ? "May 1, 2026 · 10:00 AM" : (orderId === 'FIX-8821' ? "Apr 12, 2026 · 10:15 AM" : "Mar 28, 2026 · 09:30 AM"),
    completedAt: isActive ? null : (orderId === 'FIX-8821' ? "Apr 12, 2026 · 01:22 PM" : "Mar 28, 2026 · 03:45 PM"),
    status: isActive ? "Pro on the way" : "Completed",
    arrival: isActive ? "Today · 10:45 AM" : null,
    amount: isActive ? "$50 - $75" : (orderId === 'FIX-8821' ? "$65.00" : "$120.00"),
    paymentStatus: isActive ? "Unpaid" : "Paid",
    rating: orderId === 'FIX-8821' ? 5 : 0,
    review: orderId === 'FIX-8821' ? "The plumber arrived quickly and fixed the leak perfectly. Very clean work and friendly attitude." : "",
    beforeImg: isActive 
      ? "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1000&auto=format&fit=crop"
      : (orderId === 'FIX-8821' 
        ? "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1545244044-8961ad1844b6?q=80&w=1000&auto=format&fit=crop"),
    afterImg: isActive ? null : (orderId === 'FIX-8821'
      ? "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1000&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop"),
    description: isActive ? "There is a significant leak under the kitchen sink. Water is clear but it's soaking the cabinet floor." : null,
    pro: {
      name: "Marcus Thorne",
      rating: 4.9,
      avatar: "MT",
      color: "bg-blue-600"
    }
  };

  return (
    <div className="h-full flex flex-col pt-12">
      <div className="px-6 flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <div>
          <h2 className="text-xl font-bold">Order #{orderId}</h2>
          <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-brand-accent' : 'text-green-600'}`}>
            {details.status}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
        {isActive && (
          <section className="bg-brand-accent rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
               <Clock size={120} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
               <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60 mb-2">Estimated Arrival</p>
                  <p className="text-2xl font-black">{details.arrival}</p>
                  <p className="text-xs font-medium opacity-80 mt-1">Marcus is 2 miles away</p>
               </div>
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <MapPin size={24} />
               </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
           <div className="flex justify-between items-end">
              <h3 className="text-sm font-bold text-brand-accent">{details.title}</h3>
              {isActive && <div className="w-12 h-[2px] bg-brand-accent/20" />}
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="card bg-brand-surface border-none p-4">
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1">Booked On</p>
                <p className="text-xs font-bold leading-tight">{details.bookedAt}</p>
             </div>
             <div className="card bg-brand-surface border-none p-4">
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1">
                  {isActive ? "Payment Status" : "Completed On"}
                </p>
                <p className={`text-xs font-bold leading-tight ${isActive ? 'text-brand-accent' : ''}`}>
                  {isActive ? details.paymentStatus : details.completedAt}
                </p>
             </div>
           </div>
        </section>

        {isActive && (
          <section className="card border-none bg-white shadow-sm flex items-center gap-4">
             <div className={`w-12 h-12 rounded-xl ${details.pro.color} text-white flex items-center justify-center font-bold shadow-md`}>
                {details.pro.avatar}
             </div>
             <div className="flex-1">
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest mb-0.5">Assigned Expert</p>
                <div className="flex justify-between items-center">
                   <p className="font-bold">{details.pro.name}</p>
                   <div className="flex items-center gap-1 bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-700">
                      <span className="text-[10px] font-black">{details.pro.rating}</span>
                   </div>
                </div>
             </div>
             <div className="w-10 h-10 bg-brand-accent/5 rounded-full flex items-center justify-center text-brand-accent">
                <ChevronRight size={18} />
             </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
               {isActive ? "Your Upload" : "Job Preview"}
             </h3>
             {isActive && (
                <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded">Detected by AI</span>
             )}
          </div>
          
          {isActive ? (
            <div className="space-y-4">
              <div className="relative rounded-[32px] h-56 overflow-hidden border border-brand-secondary/30 shadow-lg">
                <img src={details.beforeImg} className="w-full h-full object-cover" alt="Upload"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-secondary/10">
                 <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Your Description</p>
                 <p className="text-sm font-medium text-brand-text leading-relaxed">
                   "{details.description}"
                 </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-48">
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-brand-secondary/30 group">
                  <img src={details.beforeImg} className="w-full h-full object-cover grayscale-[0.2]" alt="Before"/>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded backdrop-blur-md">Before</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-brand-accent/10">
                  <img src={details.afterImg} className="w-full h-full object-cover" alt="After"/>
                  <div className="absolute top-2 left-2 bg-brand-accent text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded shadow-sm">After</div>
              </div>
            </div>
          )}
        </section>

        {!isActive && (
          <section className="card p-0 overflow-hidden border-none shadow-md">
            <div className="bg-brand-surface p-5 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Payment Detail</span>
              <span className="text-lg font-black text-brand-accent">{details.amount}</span>
            </div>
            
            <div className="p-5 space-y-4 bg-white">
              {hasReviewed ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Your Review</h3>
                      <div className="flex text-yellow-500 gap-0.5">
                          {[...Array(details.rating)].map((_, i) => <CheckCircle2 key={i} size={14} className="fill-current" />)}
                      </div>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-xl italic text-sm text-brand-text font-medium leading-relaxed border border-brand-secondary/20">
                      "{details.review}"
                    </div>
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-brand-accent mb-1">Rate your experience</h3>
                      <p className="text-xs text-brand-muted">How was Elena's service today?</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} className="p-2 text-brand-secondary hover:text-yellow-400 transition-colors">
                          <Plus size={24} className="rotate-45" />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Briefly describe the quality of work..." 
                      className="w-full p-4 bg-brand-surface border border-brand-secondary/30 rounded-xl text-sm outline-none focus:border-brand-accent/30 transition-all resize-none h-20"
                    />
                    <button 
                      onClick={() => setHasReviewed(true)}
                      className="w-full btn-primary py-3 text-xs uppercase tracking-widest font-black"
                    >
                      Submit Review
                    </button>
                </div>
              )}
            </div>
          </section>
        )}

        <button className="w-full font-bold text-brand-accent/60 text-[10px] uppercase tracking-[0.2em] mb-4">
           {isActive ? "Need Help with this order?" : "Download Full Receipt"}
        </button>
      </div>
    </div>
  );
}

function ProfileScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full px-6 pt-12">
      <h2 className="text-2xl font-bold mb-8">Account</h2>
      <div className="flex items-center gap-4 mb-10 pb-10 border-bottom border-brand-secondary">
         <div className="w-20 h-20 rounded-[28px] bg-brand-accent flex items-center justify-center text-white text-3xl font-black">
           AG
         </div>
         <div>
            <p className="font-bold text-xl">Akshay Goyal</p>
            <p className="text-sm text-brand-muted">akshay@fixify.com</p>
            <button className="text-brand-accent text-xs font-bold mt-1">Edit Profile</button>
         </div>
      </div>

      <div className="space-y-2">
        {["Addresses", "Payment Methods", "Notifications", "Support", "Legal"].map(t => (
          <div key={t} className="card py-5 flex justify-between items-center hover:bg-brand-bg transition-colors cursor-pointer border-none shadow-none border-b border-brand-secondary rounded-none">
             <span className="font-semibold text-brand-text">{t}</span>
             <ChevronRight size={18} className="text-brand-muted" />
          </div>
        ))}
        <button className="w-full text-left py-5 px-4 font-bold text-red-500 mt-8">Sign Out</button>
      </div>
    </div>
  );
}

function BottomNav({ current, onNavigate }: { current: Screen, onNavigate: (s: Screen) => void }) {
  return (
    <div className="mt-auto border-t border-brand-secondary/30 flex justify-between px-8 py-5 bg-white relative z-50 rounded-b-[47px]">
      <button 
        onClick={() => onNavigate('HOME')}
        className={`relative ${current === 'HOME' ? 'text-brand-accent' : 'text-[#C0C0C0]'}`}
      >
        <Home size={24} fill={current === 'HOME' ? 'currentColor' : 'none'} strokeWidth={current === 'HOME' ? 2 : 2.5} />
      </button>
      
      <button 
        onClick={() => onNavigate('CATEGORIES')}
        className={`relative ${current === 'CATEGORIES' ? 'text-brand-accent' : 'text-[#C0C0C0]'}`}
      >
        <Grid size={24} strokeWidth={2.5} />
      </button>

      <button 
        onClick={() => onNavigate('UPLOAD')}
        className="w-12 h-12 bg-brand-accent rounded-full border-4 border-white flex items-center justify-center shadow-lg text-white font-bold text-xl -mt-10 active:scale-90 transition-transform"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <button 
        onClick={() => onNavigate('ORDERS')}
        className={`relative ${current === 'ORDERS' ? 'text-brand-accent' : 'text-[#C0C0C0]'}`}
      >
        <Clock size={24} strokeWidth={2.5} />
      </button>

      <button 
        onClick={() => onNavigate('PROFILE')}
        className={`relative ${current === 'PROFILE' ? 'text-brand-accent' : 'text-[#C0C0C0]'}`}
      >
        <User size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}

