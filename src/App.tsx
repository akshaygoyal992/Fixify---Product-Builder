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
  MoreVertical,
  Send,
  Sparkles,
  Star,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  ShieldCheck,
  Bell,
  Tag,
  Package,
  Settings,
  History,
  MessageCircle,
  FileText,
  Share2,
  XCircle,
  Info,
  Maximize2,
  Tv,
  Hammer,
  Building,
  Zap,
  Leaf,
  Key,
  Paintbrush,
  Droplet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface TaxDetails {
  hsn: string;
  rate: number;
  cgstRate: number;
  sgstRate: number;
  description: string;
}

function compressImage(dataUrl: string, maxDim = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
}

function getGSTDetailsByService(service: string): TaxDetails {
  const norm = (service || '').toLowerCase();
  if (norm.includes('plumb')) {
    return {
      hsn: '998711',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Plumbing & Drainage Support Services'
    };
  }
  if (norm.includes('elect')) {
    return {
      hsn: '998713',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Electrical Repairs & Installation Services'
    };
  }
  if (norm.includes('carpent')) {
    return {
      hsn: '998715',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Carpentry & Joinery Services'
    };
  }
  if (norm.includes('paint')) {
    return {
      hsn: '995473',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Painting & Surface Decorating Services'
    };
  }
  if (norm.includes('applian')) {
    return {
      hsn: '998716',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Domestic Appliance Repair Services'
    };
  }
  if (norm.includes('mason')) {
    return {
      hsn: '9954',
      rate: 0.18,
      cgstRate: 0.09,
      sgstRate: 0.09,
      description: 'Masonry & Structuring Services'
    };
  }
  return {
    hsn: '9987',
    rate: 0.18,
    cgstRate: 0.09,
    sgstRate: 0.09,
    description: 'Maintenance & Repair Services n.e.c.'
  };
}

// --- Types ---
type Screen = 
  | 'SPLASH' | 'LOGIN' | 'OTP' | 'HOME' | 'CATEGORIES' | 'PRO_LIST'
  | 'UPLOAD' | 'NOTE' | 'AI_PREFILL' | 'AI_SLOT' | 'ADDRESS' 
  | 'SLOT' | 'SUMMARY' | 'CONFIRMATION' | 'ORDERS' | 'ORDER_DETAILS' | 'SUPPORT_CHAT' | 'ADDRESS_LIST' | 'PAYMENT_METHODS' | 'NOTIFICATIONS' | 'LEGAL' | 'TERMS' | 'PRIVACY' | 'CHAT_HISTORY' | 'PROFILE' | 'EDIT_PROFILE';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

const INITIAL_STATE: Omit<AppState, 'screen'> = {
  image: null,
  note: '',
  selectedCategory: null,
  selectedOrderId: null,
  chatMessages: [],
  addresses: [
    { id: '1', label: 'Home', fullAddress: '123 Main St, Apartment 4B, New York, NY 10001', isDefault: true },
    { id: '2', label: 'Office', fullAddress: '456 Tech Way, Suite 200, San Francisco, CA 94105', isDefault: false }
  ],
  notifications: [
    { id: '1', title: 'Worker on the Way', message: 'Ashish has started his journey to your location.', time: '2 mins ago', type: 'ORDER', isUnread: true },
    { id: '2', title: 'Job Booked Successfully', message: 'Your booking for Plumbing Repair (FIX-8821) is confirmed for tomorrow.', time: '1 hour ago', type: 'ORDER', isUnread: false },
    { id: '3', title: 'Profile Verified', message: 'Your phone number has been successfully verified.', time: '2 hours ago', type: 'SYSTEM', isUnread: false },
    { id: '4', title: 'Special Offer!', message: 'Get 20% off on your next AC service using code COOLFIX.', time: '5 hours ago', type: 'PROMO', isUnread: false }
  ],
  issueData: {
    type: 'Water Leakage',
    service: 'Plumbing',
    urgency: 'Medium',
  },
  address: '123 Main St, Apartment 4B',
  slot: { date: 'May 1, 2026', time: '10:00 AM' },
  history: [],
  userProfile: {
    name: 'Akshay Goyal',
    email: 'akshay@fixify.com',
    phone: '+91 98765 43210',
    avatarUrl: null
  },
};

interface ChatMessage {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
}

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ORDER' | 'SYSTEM' | 'PROMO';
  isUnread: boolean;
}

interface Order {
  id: string;
  type: string;
  service: string;
  urgency: string;
  date: string;
  time: string;
  status: 'Finding Pro' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: string;
  image: string | null;
  note: string;
  pro?: {
    name: string;
    rating: number;
    avatar: string;
    color: string;
  };
}

interface AppState {
  screen: Screen;
  image: string | null;
  note: string;
  selectedCategory: string | null;
  selectedOrderId: string | null;
  chatMessages: ChatMessage[];
  addresses: Address[];
  notifications: Notification[];
  issueData: {
    type: string;
    service: string;
    urgency: string;
  };
  address: string;
  slot: { date: string; time: string };
  history: Order[];
  userProfile: UserProfile;
}

// --- Constants ---
const PRIMARY_COLOR = "#2D336B";
const BG_COLOR = "#F9F8F6";

const DEFAULT_PRO = {
  name: "Ashish Kumar",
  rating: 4.7,
  avatar: "AK",
  color: "bg-emerald-600"
};

// --- Main App Component ---
export default function App() {
  const [state, setState] = useState<AppState>({
    screen: 'SPLASH',
    image: null,
    note: '',
    selectedCategory: null,
    selectedOrderId: null,
    chatMessages: JSON.parse(localStorage.getItem('fixify_chat') || '[]'),
    addresses: JSON.parse(localStorage.getItem('fixify_addresses') || JSON.stringify([
      { id: '1', label: 'Home', fullAddress: '123 Main St, Apartment 4B, New York, NY 10001', isDefault: true },
      { id: '2', label: 'Office', fullAddress: '456 Tech Way, Suite 200, San Francisco, CA 94105', isDefault: false }
    ])),
    notifications: [
      { id: '1', title: 'Worker on the Way', message: 'Ashish has started his journey to your location.', time: '2 mins ago', type: 'ORDER', isUnread: true },
      { id: '2', title: 'Job Booked Successfully', message: 'Your booking for Plumbing Repair (FIX-8821) is confirmed for tomorrow.', time: '1 hour ago', type: 'ORDER', isUnread: false },
      { id: '3', title: 'Profile Verified', message: 'Your phone number has been successfully verified.', time: '2 hours ago', type: 'SYSTEM', isUnread: false },
      { id: '4', title: 'Special Offer!', message: 'Get 20% off on your next AC service using code COOLFIX.', time: '5 hours ago', type: 'PROMO', isUnread: false }
    ],
    issueData: {
      type: 'Water Leakage',
      service: 'Plumbing',
      urgency: 'Medium',
    },
    address: '123 Main St, Apartment 4B',
    slot: (() => {
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const todayStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
      
      const slotTimeObj = new Date(now.getTime() + 4 * 60 * 60 * 1000); // at least 3 hours in future
      let hours = slotTimeObj.getHours();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      let mins = slotTimeObj.getMinutes();
      let roundedMins = Math.round(mins / 15) * 15;
      if (roundedMins === 60) {
        roundedMins = 0;
        hours = (hours % 12) + 1;
      }
      const minStr = roundedMins < 10 ? '0' + roundedMins : roundedMins;
      return { date: todayStr, time: `${hours}:${minStr} ${ampm}` };
    })(),
    history: (() => {
      const raw = localStorage.getItem('fixify_history');
      let parsed = [];
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = [];
        }
      } else {
        parsed = [
          {
            id: 'FIX-99021',
            type: 'Water Leakage',
            service: 'Plumbing',
            urgency: 'Medium',
            date: 'May 1',
            time: '10:00 AM',
            status: 'Confirmed',
            amount: '₹600 - ₹900',
            image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80",
            note: "Significant leak under kitchen sink.",
            pro: DEFAULT_PRO
          },
          {
            id: 'FIX-8821',
            type: 'Broken Kitchen Sink',
            service: 'Plumbing',
            urgency: 'Medium',
            date: 'May 21, 2026',
            time: '10:15 AM',
            status: 'Completed',
            amount: '₹850.00',
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
            note: ""
          },
          {
            id: 'FIX-7742',
            type: 'AC Installation',
            service: 'Electrical',
            urgency: 'Medium',
            date: 'May 13, 2026',
            time: '09:30 AM',
            status: 'Completed',
            amount: '₹950.00',
            image: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=800&q=80",
            note: ""
          }
        ];
      }
      
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const todayStrShort = `${months[now.getMonth()]} ${now.getDate()}`;
      
      const slotTimeObj = new Date(now.getTime() + 4 * 60 * 60 * 1000); // at least 3 hours in future
      let hours = slotTimeObj.getHours();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      let mins = slotTimeObj.getMinutes();
      let roundedMins = Math.round(mins / 15) * 15;
      if (roundedMins === 60) {
        roundedMins = 0;
        hours = (hours % 12) + 1;
      }
      const minStr = roundedMins < 10 ? '0' + roundedMins : roundedMins;
      const futureTimeStr = `${hours}:${minStr} ${ampm}`;

      // Migrate and ensure dynamic dates (not older than 1 month) and pricing <= ₹1000
      return parsed.map((item: any) => {
        const itemNow = new Date();
        const dateOptions: Intl.DateTimeFormatOptions = {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        };
        if (item.id === 'FIX-99021') {
          return { ...item, date: todayStrShort, time: futureTimeStr, amount: '₹600 - ₹900' };
        }
        if (item.id === 'FIX-8821') {
          const jDate = new Date(itemNow.getTime() - 11 * 24 * 60 * 60 * 1000); // 11 days ago
          return { ...item, date: `${months[jDate.getMonth()]} ${jDate.getDate()}, ${jDate.getFullYear()}`, amount: '₹850.00' };
        }
        if (item.id === 'FIX-7742') {
          const jDate = new Date(itemNow.getTime() - 21 * 24 * 60 * 60 * 1000); // 21 days ago
          return { ...item, date: `${months[jDate.getMonth()]} ${jDate.getDate()}, ${jDate.getFullYear()}`, amount: '₹950.00' };
        }
        if (typeof item.amount === 'string' && item.amount.includes('$')) {
          let amt = item.amount;
          amt = amt.replace('$50 - $75', '₹600 - ₹900');
          amt = amt.replace('$45 - $80', '₹550 - ₹850');
          amt = amt.replace('$65.00', '₹850.00');
          amt = amt.replace('$120.00', '₹950.00');
          amt = amt.replace(/\$([0-9.,]+)/g, (match: string, p1: string) => {
            const num = parseFloat(p1.replace(/,/g, ''));
            const finalNum = num * 83 > 1000 ? 950 : Math.round(num * 83);
            return '₹' + finalNum.toLocaleString('en-IN');
          });
          return { ...item, amount: amt };
        }
        // General safe-guard for other completed orders to keep dates within last 30 days and amounts <= ₹1000
        if (item.status === 'Completed') {
          let currentAmt = item.amount;
          if (typeof currentAmt === 'string') {
            const matchInt = currentAmt.match(/₹\s*([0-9,.]+)/);
            if (matchInt) {
              const val = parseFloat(matchInt[1].replace(/,/g, ''));
              if (val > 1000) {
                currentAmt = '₹950.00';
              }
            } else if (currentAmt.includes('-')) {
              currentAmt = '₹600 - ₹900';
            }
          }
          let itemDate = new Date(item.date);
          if (isNaN(itemDate.getTime()) || (itemNow.getTime() - itemDate.getTime() > 30 * 24 * 60 * 60 * 1000)) {
            const backupDate = new Date(itemNow.getTime() - 14 * 24 * 60 * 60 * 1000);
            return {
              ...item,
              date: `${months[backupDate.getMonth()]} ${backupDate.getDate()}, ${backupDate.getFullYear()}`,
              amount: currentAmt
            };
          }
          return { ...item, amount: currentAmt };
        }
        return item;
      });
    })(),
    userProfile: JSON.parse(localStorage.getItem('fixify_profile') || JSON.stringify({
      name: 'Akshay Goyal',
      email: 'akshay@fixify.com',
      phone: '+91 98765 43210',
      avatarUrl: null
    })),
  });

  const [booting, setBooting] = useState(true);
  const [indiaTime, setIndiaTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Kolkata",
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        };
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const parts = formatter.formatToParts(now);
        
        let weekday = "";
        let month = "";
        let day = "";
        let hour = "";
        let minute = "";
        let second = "";
        let dayPeriod = "";
        
        parts.forEach(part => {
          if (part.type === "weekday") weekday = part.value;
          if (part.type === "month") month = part.value;
          if (part.type === "day") day = part.value;
          if (part.type === "hour") hour = part.value;
          if (part.type === "minute") minute = part.value;
          if (part.type === "second") second = part.value;
          if (part.type === "dayPeriod") dayPeriod = part.value;
        });
        
        setIndiaTime(`${weekday}, ${month} ${day} • ${hour}:${minute}:${second} ${dayPeriod}`);
      } catch (e) {
        setIndiaTime(new Date().toLocaleString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (updates.chatMessages) {
        localStorage.setItem('fixify_chat', JSON.stringify(newState.chatMessages));
      }
      if (updates.addresses) {
        localStorage.setItem('fixify_addresses', JSON.stringify(newState.addresses));
      }
      if (updates.history) {
        localStorage.setItem('fixify_history', JSON.stringify(newState.history));
      }
      if (updates.userProfile) {
        localStorage.setItem('fixify_profile', JSON.stringify(newState.userProfile));
      }
      return newState;
    });
  };

  // Screen Rendering Logic
  const renderScreen = () => {
    switch (state.screen) {
      case 'SPLASH': return <SplashScreen />;
      case 'LOGIN': return <LoginScreen onNext={() => navigate('OTP')} />;
      case 'OTP': return <OTPScreen onNext={() => navigate('HOME')} />;
      case 'HOME': return <HomeScreen state={state} onAction={(scr) => navigate(scr)} setImg={(img) => updateState({ image: img })} onSelectOrder={(id) => { updateState({ selectedOrderId: id }); navigate('ORDER_DETAILS'); }} />;
      case 'CATEGORIES': return <CategoriesScreen onBack={() => navigate('HOME')} onSelect={(cat) => { updateState({ selectedCategory: cat }); navigate('PRO_LIST'); }} />;
      case 'PRO_LIST': return <ProListScreen category={state.selectedCategory || 'Service'} onBack={() => navigate('CATEGORIES')} />;
      case 'UPLOAD': return <UploadScreen onBack={() => navigate('HOME')} onNext={(img, note) => { updateState({ image: img, note: note || '' }); navigate('NOTE'); }} />;
      case 'NOTE': return <NoteScreen state={state} onBack={() => navigate('UPLOAD')} onNext={(note) => { updateState({ note }); navigate('AI_PREFILL'); }} />;
      case 'AI_PREFILL': return <AIPrefillScreen state={state} onBack={() => navigate('NOTE')} onNext={(data) => {
        updateState({ issueData: data });
        navigate('AI_SLOT');
      }} />;
      case 'AI_SLOT': return (
        <SlotSelectionScreen 
          onBack={() => navigate('AI_PREFILL')} 
          onNext={(slot) => {
            const orderId = `FIX-${Math.floor(10000 + Math.random() * 90000)}`;
            const newOrder: Order = {
              id: orderId,
              type: state.issueData.type,
              service: state.issueData.service,
              urgency: state.issueData.urgency,
              date: slot.date,
              time: slot.time,
              status: 'Confirmed',
              amount: '₹600 - ₹900',
              image: state.image,
              note: state.note,
              pro: DEFAULT_PRO
            };
            updateState({ slot, history: [newOrder, ...state.history], selectedOrderId: orderId });
            navigate('CONFIRMATION');
          }} 
        />
      );
      case 'ADDRESS': return <AddressScreen state={state} onBack={() => navigate('AI_PREFILL')} onNext={(addr) => { updateState({ address: addr }); navigate('SLOT'); }} />;
      case 'SLOT': return <SlotSelectionScreen onBack={() => navigate('ADDRESS')} onNext={(slot) => { updateState({ slot }); navigate('SUMMARY'); }} />;
      case 'SUMMARY': return <SummaryScreen state={state} onBack={() => navigate('SLOT')} onNext={() => {
        const orderId = `FIX-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder: Order = {
          id: orderId,
          type: state.issueData.type,
          service: state.issueData.service,
          urgency: state.issueData.urgency,
          date: state.slot.date,
          time: state.slot.time,
          status: 'Confirmed',
          amount: '₹600 - ₹900',
          image: state.image,
          note: state.note,
          pro: DEFAULT_PRO
        };
        updateState({ history: [newOrder, ...state.history], selectedOrderId: orderId });
        navigate('CONFIRMATION');
      }} />;
      case 'CONFIRMATION': return (
        <ConfirmationScreen 
          orderId={state.selectedOrderId || ''} 
          onNext={() => navigate('HOME')} 
          onTrack={() => navigate('ORDER_DETAILS')}
        />
      );
      case 'ORDERS': return <OrdersScreen history={state.history} onBack={() => navigate('HOME')} onSelectOrder={(id) => { updateState({ selectedOrderId: id }); navigate('ORDER_DETAILS'); }} />;
      case 'ORDER_DETAILS': return (
        <OrderDetailsScreen 
          orders={state.history} 
          orderId={state.selectedOrderId || ''} 
          onBack={() => navigate('ORDERS')} 
          onSupport={() => navigate('SUPPORT_CHAT')}
          onCancelOrder={(id) => {
            const newHistory = state.history.map(o => o.id === id ? { ...o, status: 'Cancelled' as const } : o);
            updateState({ history: newHistory });
          }}
        />
      );
      case 'SUPPORT_CHAT': return <SupportChatScreen userName={state.userProfile.name} history={state.chatMessages} onUpdate={(msgs) => updateState({ chatMessages: msgs })} onBack={() => navigate('PROFILE')} />;
      case 'ADDRESS_LIST': return <AddressListScreen addresses={state.addresses} onUpdate={(addrs) => updateState({ addresses: addrs })} onBack={() => navigate('PROFILE')} />;
      case 'PAYMENT_METHODS': return <PaymentMethodsScreen onBack={() => navigate('PROFILE')} />;
      case 'NOTIFICATIONS': return <NotificationsScreen notifications={state.notifications} onBack={() => navigate('PROFILE')} onMarkRead={(id) => updateState({ notifications: state.notifications.map(n => n.id === id ? { ...n, isUnread: false } : n) })} />;
      case 'LEGAL': return <LegalScreen onBack={() => navigate('PROFILE')} onOpenTerms={() => navigate('TERMS')} onOpenPrivacy={() => navigate('PRIVACY')} />;
      case 'TERMS': return <DocumentScreen title="Terms & Conditions" onBack={() => navigate('LEGAL')} content={TERMS_CONTENT} />;
      case 'PRIVACY': return <DocumentScreen title="Privacy Policy" onBack={() => navigate('LEGAL')} content={PRIVACY_POLICY_CONTENT} />;
      case 'CHAT_HISTORY': return <ChatHistoryScreen onBack={() => navigate('PROFILE')} onSelectChat={() => navigate('SUPPORT_CHAT')} />;
      case 'PROFILE': return (
        <ProfileScreen 
          userProfile={state.userProfile}
          onEditProfile={() => navigate('EDIT_PROFILE')}
          onBack={() => navigate('HOME')} 
          onSupport={() => navigate('SUPPORT_CHAT')} 
          onAddresses={() => navigate('ADDRESS_LIST')} 
          onPayments={() => navigate('PAYMENT_METHODS')} 
          onNotifications={() => navigate('NOTIFICATIONS')} 
          onLegal={() => navigate('LEGAL')} 
          onChatHistory={() => navigate('CHAT_HISTORY')} 
          onLogout={() => {
            localStorage.removeItem('fixify_chat');
            updateState({ ...INITIAL_STATE, screen: 'LOGIN' });
          }} 
        />
      );
      case 'EDIT_PROFILE': return (
        <EditProfileScreen 
          userProfile={state.userProfile} 
          onSave={(profile) => {
            updateState({ userProfile: profile });
            navigate('PROFILE');
          }} 
          onBack={() => navigate('PROFILE')} 
        />
      );
      default: return <HomeScreen state={state} onAction={(scr) => navigate(scr)} setImg={(img) => updateState({ image: img })} onSelectOrder={(id) => { updateState({ selectedOrderId: id }); navigate('ORDER_DETAILS'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 flex items-center justify-center font-sans">
      <div className="iphone-frame">
        <div className="iphone-content relative">
          {/* Status Bar */}
          <div className="h-11 px-8 pt-4 flex justify-between items-center z-50 bg-transparent">
            <span className="text-xs md:text-sm font-semibold">{indiaTime || "9:41"}</span>
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

function FixifyLogo({ className = "h-8", showText = true, iconOnly = false, lightMode = false }: { className?: string, showText?: boolean, iconOnly?: boolean, lightMode?: boolean }) {
  const textColor = lightMode ? 'text-white' : 'text-brand-accent';
  const iconColor = lightMode ? 'text-white' : 'text-neutral-900';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon representing the original logo designed */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-10 h-10 flex-shrink-0"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className={iconColor}>
          {/* TROWEL (SHOVEL) pointing up-left */}
          {/* Shovel blade: Rounded pointed shield shape */}
          <path 
            d="M 18 18 C 30 14, 44 26, 44 40 C 44 44, 40 44, 38 43 C 26 43, 14 30, 18 18 Z" 
            fill="currentColor"
          />
          {/* Shovel handle shank */}
          <line 
            x1="38" 
            y1="38" 
            x2="48" 
            y2="48" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Shovel handle grip */}
          <line 
            x1="46" 
            y1="46" 
            x2="68" 
            y2="68" 
            stroke="currentColor" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
          />

          {/* HAMMER pointing up-right, crossed over / under the trowel */}
          {/* Hammer handle */}
          <line 
            x1="34" 
            y1="68" 
            x2="56" 
            y2="46" 
            stroke="currentColor" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
          />
          <line 
            x1="54" 
            y1="48" 
            x2="63" 
            y2="39" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Hammer head */}
          {/* Face on top-right, claw curving left-down */}
          <path 
            d="M 52 35 C 50 25, 54 18, 62 16 C 65 15, 68 18, 70 20 L 78 14 C 81 12, 84 15, 82 18 L 76 24 C 74 26, 76 29, 78 30 L 82 34 C 84 37, 81 40, 78 38 L 68 28 C 66 32, 60 36, 52 35 Z" 
            fill="currentColor"
          />
        </g>
      </svg>

      {showText && !iconOnly && (
        <span className={`text-2xl font-black tracking-tight ${textColor} lowercase font-sans`}>
          fixify
        </span>
      )}
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-brand-accent rounded-[28px] flex items-center justify-center mb-6 shadow-2xl">
          <FixifyLogo iconOnly className="text-white w-14 h-14" lightMode />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-brand-accent lowercase font-sans">fixify</span>
        </div>
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

function HomeScreen({ state, onAction, setImg, onSelectOrder }: { 
  state: AppState, 
  onAction: (s: Screen) => void,
  setImg: (i: string) => void,
  onSelectOrder: (id: string) => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImg(compressed);
        onAction('NOTE');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full px-6 pt-12 flex flex-col gap-8 pb-32">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <header className="flex justify-center items-center">
        <FixifyLogo className="h-7" showText={true} />
      </header>

      <div>
        <h1 className="text-[32px] font-semibold leading-tight text-brand-accent tracking-tight">What needs fixing?</h1>
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
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full py-5 text-base"
        >
          <ImageIcon size={22} className="opacity-60" />
          <span>Upload Gallery</span>
        </button>
      </div>

      {/* Recent Requests or Active Job */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent/40">
            {state.history.length > 0 ? "Active Request" : "Recent Requests"}
          </h3>
          <button onClick={() => onAction('ORDERS')} className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">View All</button>
        </div>
        <div className="space-y-3">
          {state.history.length > 0 ? (
            (() => {
              const latest = state.history[0];
              const isActive = latest.status !== 'Completed' && latest.status !== 'Cancelled';
              return (
                <div 
                  onClick={() => onSelectOrder(latest.id)}
                  className="group relative flex items-center gap-4 p-5 bg-white rounded-3xl border border-brand-accent/5 hover:border-brand-accent/20 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <div className="w-14 h-14 bg-brand-accent/5 rounded-2xl flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                    {isActive ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-black text-brand-text text-sm">{latest.type}</p>
                      {isActive && (
                        latest.pro ? (
                          <div className="flex items-center gap-2 bg-brand-surface px-2 py-1 rounded-xl border border-brand-accent/5">
                            <div className={`w-8 h-8 ${latest.pro.color} rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0`}>
                              {latest.pro.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-brand-text uppercase leading-none mb-0.5 truncate">{latest.pro.name}</p>
                              <div className="flex items-center gap-0.5">
                                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[8px] font-bold text-brand-muted">{latest.pro.rating}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-[9px] font-black text-yellow-600 uppercase">{latest.status}</span>
                          </div>
                        )
                      )}
                    </div>
                    <p className={`text-[11px] font-medium ${isActive ? 'text-brand-muted' : 'text-green-600 uppercase font-black tracking-wider'}`}>
                      {isActive ? `Coming ${latest.date} @ ${latest.time}` : `Completed · ${latest.date}`}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-brand-muted/30 group-hover:text-brand-accent transition-colors" />
                </div>
              );
            })()
          ) : (
            <div className="text-center py-8 bg-white rounded-3xl border border-dashed border-brand-accent/10">
               <p className="text-xs text-brand-muted font-bold uppercase tracking-widest">No recent requests</p>
            </div>
          )}
        </div>
      </section>

      {/* Promotional Card - Problem Centric */}
      <div 
        onClick={() => onAction('UPLOAD')}
        className="card bg-brand-accent/5 border-none p-6 rounded-[32px] flex items-center gap-4 cursor-pointer hover:bg-brand-accent/10 transition-all active:scale-[0.98]"
      >
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
  const cats = ["Appliance", "Carpentry", "Civil work", "Electrical", "Gardening", "Locksmith", "Painting", "Plumbing"];
  
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Appliance": return <Tv size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Carpentry": return <Hammer size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Civil work": return <Building size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Electrical": return <Zap size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Gardening": return <Leaf size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Locksmith": return <Key size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Painting": return <Paintbrush size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      case "Plumbing": return <Droplet size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
      default: return <Grid size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors" />;
    }
  };

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
            className="card h-32 flex flex-col items-center justify-center text-center gap-2.5 hover:border-brand-accent transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-accent/5 flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
              {getCategoryIcon(c)}
            </div>
            <p className="font-bold text-sm text-brand-accent/95">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_PROS: Record<string, Array<{
  id: string;
  name: string;
  rating: number;
  reviews: number;
  xp: string;
  price: string;
  avatar: string;
  color: string;
  topReview: string;
}>> = {
  "Appliance": [
    {
      id: "app-1",
      name: "Sachin Thakur",
      rating: 4.8,
      reviews: 94,
      xp: "6 years",
      price: "₹450/hr",
      avatar: "ST",
      color: "bg-blue-600",
      topReview: "Sachin diagnosed the AC compressor issue quickly and charged exactly as estimated. Clean work!"
    },
    {
      id: "app-2",
      name: "Ashish Kumar",
      rating: 4.7,
      reviews: 82,
      xp: "5 years",
      price: "₹380/hr",
      avatar: "AK",
      color: "bg-emerald-600",
      topReview: "Very professional washing machine service. Ashish was punctual and extremely humble."
    },
    {
      id: "app-3",
      name: "Rajat Sharma",
      rating: 4.9,
      reviews: 110,
      xp: "8 years",
      price: "₹520/hr",
      avatar: "RS",
      color: "bg-indigo-600",
      topReview: "Rajat fixed the microwave turntable in no time. Great communication!"
    }
  ],
  "Carpentry": [
    {
      id: "carp-1",
      name: "Manoj Panchal",
      rating: 4.9,
      reviews: 145,
      xp: "10 years",
      price: "₹650/hr",
      avatar: "MP",
      color: "bg-amber-600",
      topReview: "Manoj repaired our alignment of teak wooden cabinets perfectly. Highly skilled master!"
    },
    {
      id: "carp-2",
      name: "Vikram Suthar",
      rating: 4.6,
      reviews: 58,
      xp: "4 years",
      price: "₹420/hr",
      avatar: "VS",
      color: "bg-rose-600",
      topReview: "Vikram was prompt to mend the squeaky door hinge. Good pricing."
    },
    {
      id: "carp-3",
      name: "Devendra Jangid",
      rating: 4.8,
      reviews: 190,
      xp: "12 years",
      price: "₹700/hr",
      avatar: "DJ",
      color: "bg-teal-600",
      topReview: "Excellent craftsmanship on the custom shelf installation. Devendra is very professional."
    }
  ],
  "Civil work": [
    {
      id: "civ-1",
      name: "Ramesh Verma",
      rating: 4.7,
      reviews: 102,
      xp: "9 years",
      price: "₹800/hr",
      avatar: "RV",
      color: "bg-stone-600",
      topReview: "Ramesh fixed our wall plaster crack with immaculate precision. Clean work on disposal."
    },
    {
      id: "civ-2",
      name: "Harish Solanki",
      rating: 4.8,
      reviews: 130,
      xp: "11 years",
      price: "₹950/hr",
      avatar: "HS",
      color: "bg-orange-600",
      topReview: "Harish redid our loose balcony tiles beautifully. Very experienced and neat."
    },
    {
      id: "civ-3",
      name: "Sandeep Yadav",
      rating: 4.5,
      reviews: 74,
      xp: "6 years",
      price: "₹600/hr",
      avatar: "SY",
      color: "bg-indigo-700",
      topReview: "Punctual sand filler and cement grouter. Highly efficient."
    }
  ],
  "Electrical": [
    {
      id: "elec-1",
      name: "Amit Mishra",
      rating: 4.9,
      reviews: 135,
      xp: "7 years",
      price: "₹480/hr",
      avatar: "AM",
      color: "bg-yellow-600",
      topReview: "Amit solved a recurring short-circuit issue in our line instantly. Fully certified and safe."
    },
    {
      id: "elec-2",
      name: "Vikas Pandey",
      rating: 4.8,
      reviews: 142,
      xp: "9 years",
      price: "₹550/hr",
      avatar: "VP",
      color: "bg-violet-600",
      topReview: "Excellent work on the new smart switchboard installation. Vikas was very safe."
    },
    {
      id: "elec-3",
      name: "Rohit Sen",
      rating: 4.6,
      reviews: 69,
      xp: "5 years",
      price: "₹350/hr",
      avatar: "RS",
      color: "bg-cyan-600",
      topReview: "Rohit was friendly and replaced the ceiling hook & fan in 15 minutes flat."
    }
  ],
  "Gardening": [
    {
      id: "gard-1",
      name: "Rajesh Mali",
      rating: 4.9,
      reviews: 220,
      xp: "14 years",
      price: "₹600/hr",
      avatar: "RM",
      color: "bg-green-600",
      topReview: "Rajesh reshaped our overgrown nursery into a peaceful green haven. Excellent plant selection knowledge."
    },
    {
      id: "gard-2",
      name: "Sunil Saini",
      rating: 4.7,
      reviews: 96,
      xp: "8 years",
      price: "₹400/hr",
      avatar: "SS",
      color: "bg-emerald-700",
      topReview: "Sunil set up our drip irrigation and pruned the roses. Extremely tidy and helpful."
    },
    {
      id: "gard-3",
      name: "Vijay Maurya",
      rating: 4.8,
      reviews: 78,
      xp: "6 years",
      price: "₹380/hr",
      avatar: "VM",
      color: "bg-lime-600",
      topReview: "Vijay is very passionate about soil health. He added high-quality compost and cleared weeds."
    }
  ],
  "Locksmith": [
    {
      id: "lock-1",
      name: "Pawan Chaurasia",
      rating: 4.8,
      reviews: 88,
      xp: "7 years",
      price: "₹500/hr",
      avatar: "PC",
      color: "bg-sky-600",
      topReview: "Pawan unlocked our jammed digital door handle within minutes. Excellent locksmith skills."
    },
    {
      id: "lock-2",
      name: "Ajay Jha",
      rating: 4.9,
      reviews: 154,
      xp: "10 years",
      price: "₹720/hr",
      avatar: "AJ",
      color: "bg-zinc-600",
      topReview: "Replaced old cylinders with high-security locks. Ajay was fast and very informative."
    },
    {
      id: "lock-3",
      name: "Jagdish Prasad",
      rating: 4.6,
      reviews: 112,
      xp: "12 years",
      price: "₹580/hr",
      avatar: "JP",
      color: "bg-slate-600",
      topReview: "Jagdish made perfect duplicate heavy-duty keys for our iron main gate."
    }
  ],
  "Painting": [
    {
      id: "paint-1",
      name: "Deepak Chawla",
      rating: 4.8,
      reviews: 115,
      xp: "8 years",
      price: "₹750/hr",
      avatar: "DC",
      color: "bg-pink-600",
      topReview: "Very clean painter! Deepak masked everything so there wasn't a single drop of paint on floors."
    },
    {
      id: "paint-2",
      name: "Sanjay Gupta",
      rating: 4.7,
      reviews: 140,
      xp: "11 years",
      price: "₹850/hr",
      avatar: "SG",
      color: "bg-red-600",
      topReview: "Sanjay suggested the perfect matte wall texture for our living room backdrop. Absolute artist!"
    },
    {
      id: "paint-3",
      name: "Anil Khatri",
      rating: 4.9,
      reviews: 92,
      xp: "6 years",
      price: "₹600/hr",
      avatar: "AK",
      color: "bg-fuchsia-600",
      topReview: "Highly dynamic damp treatment followed by pristine premium paint coating."
    }
  ],
  "Plumbing": [
    {
      id: "plumb-1",
      name: "Suresh Kumar",
      rating: 4.9,
      reviews: 188,
      xp: "11 years",
      price: "₹490/hr",
      avatar: "SK",
      color: "bg-blue-600",
      topReview: "Suresh fixed the clogged shower fitting and pressure pump perfectly. Very neat work."
    },
    {
      id: "plumb-2",
      name: "Jitendra Paswan",
      rating: 4.8,
      reviews: 121,
      xp: "9 years",
      price: "₹450/hr",
      avatar: "JP",
      color: "bg-cyan-700",
      topReview: "Highly responsive plumber. Jitendra repaired the kitchen pipe joint with high durability."
    },
    {
      id: "plumb-3",
      name: "Vinod Saxena",
      rating: 4.7,
      reviews: 94,
      xp: "7 years",
      price: "₹390/hr",
      avatar: "VS",
      color: "bg-emerald-600",
      topReview: "Vinod resolves running flush tanks under budget and quickly. Very satisfied with his honesty."
    }
  ]
};

function ProListScreen({ category, onBack }: { category: string, onBack: () => void }) {
  const [selectedPro, setSelectedPro] = useState<string | null>(null);

  const pros = CATEGORY_PROS[category] || CATEGORY_PROS["Plumbing"];

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

function UploadScreen({ onBack, onNext }: { onBack: () => void, onNext: (img: string, note?: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const SAMPLE_ISSUES = [
    {
      name: "Leaky Faucet",
      description: "Plumbing - Water dripping",
      note: "The kitchen faucet is dripping continuously from the handle and the spout, leaking about 1 liter per hour.",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' style='background:%230F172A'><path d='M350 400 h100 v50 h-100 z M400 300 v100 M380 300 h40 M360 250 c0-50 80-50 80 0 v50 h-80 z' stroke='%2338BDF8' stroke-width='12' fill='none'/><circle cx='400' cy='480' r='12' fill='%2338BDF8'/><text x='400' y='180' fill='%2394A3B8' font-family='sans-serif' font-size='32' text-anchor='middle' font-weight='bold'>Leaky Faucet</text></svg>"
    },
    {
      name: "Sparking Outlet",
      description: "Electrical - Sparks when plugged",
      note: "The living room wall socket sparked when I tried to plug in my charger. It smells a bit like burnt plastic.",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' style='background:%230F172A'><rect x='340' y='200' width='120' height='200' rx='20' stroke='%23F59E0B' stroke-width='8' fill='none'/><path d='M380 260 h40 M380 340 h40' stroke='%23F59E0B' stroke-width='8' stroke-linecap='round'/><path d='M400 100 L420 150 L380 170 L430 240' stroke='%23EF4444' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='400' y='500' fill='%2394A3B8' font-family='sans-serif' font-size='32' text-anchor='middle' font-weight='bold'>Sparking Outlet</text></svg>"
    },
    {
      name: "Broken Hinge",
      description: "Carpentry - Door won't close",
      note: "The bedroom door is sagging because the top hinge is completely loose and the screw holes are stripped.",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' style='background:%230F172A'><rect x='300' y='150' width='200' height='350' stroke='%2310B981' stroke-width='10' fill='none'/><line x1='300' y1='150' x2='480' y2='200' stroke='%23EF4444' stroke-width='10'/><circle cx='460' cy='325' r='12' fill='%2310B981'/><text x='400' y='100' fill='%2394A3B8' font-family='sans-serif' font-size='32' text-anchor='middle' font-weight='bold'>Broken Door</text></svg>"
    },
    {
      name: "Leaking AC",
      description: "Appliance - Water dripping inside",
      note: "The split AC unit is dripping water from the indoor unit's bottom right corner onto the floor.",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' style='background:%230F172A'><rect x='250' y='200' width='300' height='120' rx='10' stroke='%23A78BFA' stroke-width='8' fill='none'/><path d='M300 320 v30 M400 320 v50 M500 320 v40' stroke='%2360A5FA' stroke-width='6' stroke-linecap='round'/><text x='400' y='140' fill='%2394A3B8' font-family='sans-serif' font-size='32' text-anchor='middle' font-weight='bold'>Leaking AC</text></svg>"
    }
  ];

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err: any) {
      console.error("Camera access denied:", err);
      setCameraError(err?.message || "Permission denied or device not supported.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const maxDim = 800;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        const compressed = await compressImage(reader.result as string);
        onNext(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <input 
        type="file" 
        ref={galleryInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleGalleryChange} 
      />
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Snap the Issue</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 rounded-[40px] overflow-hidden bg-black relative shadow-2xl border border-brand-secondary/20">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white p-6 text-center overflow-y-auto no-scrollbar">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Camera size={26} />
            </div>
            <p className="text-sm font-bold text-red-200">Camera Access Blocked / Restricted</p>
            <p className="text-xs text-neutral-400 max-w-[280px]">
              We couldn't open your camera. This usually happens in embedded preview frames.
            </p>
            
            <div className="flex items-center gap-3 w-full max-w-[280px] shrink-0">
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 py-2.5 bg-brand-accent text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-accent/90 transition-colors cursor-pointer"
              >
                Upload Photo
              </button>
              <button 
                onClick={startCamera}
                className="flex-1 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
              >
                Retry Camera
              </button>
            </div>

            <div className="w-full max-w-[280px] border-t border-white/10 pt-4 mt-2 shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-3">Or try a sample issue</p>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_ISSUES.map((issue, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNext(issue.image, issue.note)}
                    className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white leading-tight">{issue.name}</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">{issue.name === 'Leaky Faucet' ? 'Plumbing' : issue.name === 'Sparking Outlet' ? 'Electrical' : issue.name === 'Broken Hinge' ? 'Carpentry' : 'Appliance'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !stream ? (
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
        <button onClick={() => galleryInputRef.current?.click()} className="btn-secondary">
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
  const [note, setNote] = useState(state.note || '');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNote(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      if (isListening) {
        if ((window as any)._stopSpeechSim) {
          (window as any)._stopSpeechSim();
        }
        setIsListening(false);
        return;
      }
      setIsListening(true);
      
      const phrases = [
        "The water is leaking from the main pipe under the sink. ",
        "It started about an hour ago, and the floor is getting slightly wet. ",
        "We tried shutting off the valve, but it is stuck. Please send someone who can help with old plumbing."
      ];
      
      let currentPhraseIdx = 0;
      let currentWordIdx = 0;
      
      const interval = setInterval(() => {
        if (currentPhraseIdx >= phrases.length) {
          clearInterval(interval);
          setIsListening(false);
          return;
        }

        const words = phrases[currentPhraseIdx].split(" ");
        if (currentWordIdx < words.length) {
          setNote(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + words[currentWordIdx]);
          currentWordIdx++;
        } else {
          currentPhraseIdx++;
          currentWordIdx = 0;
        }
      }, 350);

      const stopSim = () => {
        clearInterval(interval);
        setIsListening(false);
      };

      (window as any)._stopSpeechSim = stopSim;
      return;
    }

    if (isListening) {
      if ((window as any)._stopSpeechSim) {
        (window as any)._stopSpeechSim();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Real speech recognition start failed, using pre-recorded mock typing simulation fallback:", err);
        const phrases = [
          "The water leak is spreading behind the kitchen cabinet. ",
          "It started leaking rapidly and it's quite cold. ",
          "I think we need a plumber as soon as possible to check the pipes."
        ];
        
        let currentPhraseIdx = 0;
        let currentWordIdx = 0;
        
        const interval = setInterval(() => {
          const words = phrases[currentPhraseIdx]?.split(" ");
          if (!words) {
            clearInterval(interval);
            setIsListening(false);
            return;
          }
          if (currentWordIdx < words.length) {
            setNote(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + words[currentWordIdx]);
            currentWordIdx++;
          } else {
            currentPhraseIdx++;
            currentWordIdx = 0;
          }
        }, 300);

        const stopSim = () => {
          clearInterval(interval);
          setIsListening(false);
        };

        (window as any)._stopSpeechSim = stopSim;
      }
    }
  };

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Add Details</h2>
        <div className="w-10" />
      </div>

      {state.image && (
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-inner relative group">
          <img src={state.image} className="w-full h-full object-cover" alt="Issue" referrerPolicy="no-referrer" />
          <button 
            onClick={onBack}
            className="absolute bottom-4 right-4 bg-black/75 hover:bg-black/95 text-white text-xs font-semibold py-2.5 px-4 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          >
            <Camera size={14} />
            <span>Retake / Change Photo</span>
          </button>
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
        <div 
          onClick={toggleListening}
          className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl border transition-all duration-300 w-fit cursor-pointer select-none active:scale-95 ${
            isListening 
              ? "bg-red-50/70 border-red-200 text-red-600 font-medium animate-pulse shadow-sm" 
              : "bg-brand-surface border-brand-secondary/30 text-brand-muted hover:text-brand-accent hover:border-brand-accent/20 hover:shadow-sm"
          }`}
        >
           <Mic size={16} className={isListening ? "animate-bounce" : ""} />
           <span className="text-xs">
             {isListening ? "Listening... Tap to stop" : "Tap to dictate note"}
           </span>
        </div>
      </div>

      <button onClick={() => onNext(note)} className="btn-primary w-full shadow-lg">
        AI to Pre-Fill Details
      </button>
    </div>
  );
}

function AIPrefillScreen({ state, onBack, onNext }: { state: AppState, onBack: () => void, onNext: (d: any) => void }) {
  const [data, setData] = useState(state.issueData);
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeIssue = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            image: state.image,
            note: state.note
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("AI Analysis Error:", err);
        setError("AI detection failed. You can manually adjust the details.");
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeIssue();
  }, [state.image, state.note]);

  if (analyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 relative bg-white">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 10, -10, 0],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6"
        >
           <Sparkles className="text-brand-accent w-10 h-10" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Analyzing Issue...</h2>
        <p className="text-center text-brand-muted text-sm px-4">Fixify AI is detecting the exact issue type and urgency level based on your photo and notes.</p>
        
        <div className="flex gap-2 mt-12">
           <motion.div 
             animate={{ height: [4, 12, 4] }}
             transition={{ duration: 1, repeat: Infinity, delay: 0 }}
             className="w-1.5 bg-brand-accent rounded-full" 
           />
           <motion.div 
             animate={{ height: [4, 12, 4] }}
             transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
             className="w-1.5 bg-brand-accent rounded-full" 
           />
           <motion.div 
             animate={{ height: [4, 12, 4] }}
             transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
             className="w-1.5 bg-brand-accent rounded-full" 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-6 flex flex-col pt-12 pb-8 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-brand-surface rounded-xl transition-colors"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-brand-text">AI Analysis</h2>
        <div className="w-10" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {data?.isFallback && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-amber-800 font-bold leading-normal">Vercel Deployment Notice</p>
            <p className="text-[11px] text-amber-700 leading-normal">
              {data.reason || "Using rule-based backup analyzer because GEMINI_API_KEY is not set."}
            </p>
            <p className="text-[10px] text-amber-600 font-medium leading-normal mt-1.5">
              To activate Gemini AI image detection on Vercel: Add the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[9px] text-amber-800">GEMINI_API_KEY</code> environment variable in your Vercel Project Settings, then redeploy!
            </p>
          </div>
        </div>
      )}

      <div className="bg-brand-accent/5 rounded-[32px] p-8 mb-8 border border-brand-accent/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Sparkles size={48} className="text-brand-accent" />
        </div>
        <p className="text-[10px] font-black uppercase text-brand-accent tracking-[0.2em] mb-4">Detected Details</p>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1.5 block px-1">Issue Type</label>
            <input 
              type="text" 
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              className="bg-white border border-brand-secondary rounded-2xl p-4 w-full font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1.5 block px-1">Service Required</label>
            <input 
              type="text" 
              value={data.service}
              onChange={(e) => setData({ ...data, service: e.target.value })}
              className="bg-white border border-brand-secondary rounded-2xl p-4 w-full font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1.5 block px-1">Urgency Level</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map(u => (
                <button 
                  key={u}
                  onClick={() => setData({ ...data, urgency: u })}
                  className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${data.urgency === u ? 'bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20' : 'bg-white text-brand-text border-brand-secondary'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 px-2">
          <ShieldCheck size={16} className="text-green-500" />
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">AI results can be edited if needed</p>
        </div>
        <button onClick={() => onNext(data)} className="btn-primary w-full py-4 text-base shadow-xl">
          Continue
        </button>
      </div>
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
             <img src="https://picsum.photos/seed/map/800/600" className="w-full h-full object-cover opacity-50" alt="Map" referrerPolicy="no-referrer" />
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
  const getDynamicDates = () => {
    const list = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(`${months[d.getMonth()]} ${d.getDate()}`);
    }
    return list;
  };
  const dates = getDynamicDates();
  const times = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  const [selDate, setSelDate] = useState(dates[0]);
  
  const getInitialTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const targetHour = currentHour + 3;
    if (targetHour < 11) return "11:00 AM";
    if (targetHour < 13) return "1:00 PM";
    if (targetHour < 15) return "3:00 PM";
    return "5:00 PM";
  };
  const [selTime, setSelTime] = useState(getInitialTime());

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
  const [showSummaryBreakdown, setShowSummaryBreakdown] = useState(false);
  const taxDetails = getGSTDetailsByService(state.issueData.service);

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
               <img src={state.image || "https://picsum.photos/seed/default/800/600"} className="w-full h-full object-cover" alt="issue" referrerPolicy="no-referrer" />
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

        <div className="card bg-brand-bg border-none relative overflow-hidden">
           <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-semibold text-brand-muted uppercase">Estimated Cost</span>
             <button 
               onClick={() => setShowSummaryBreakdown(!showSummaryBreakdown)}
               className="text-brand-muted hover:text-brand-accent transition-colors flex items-center gap-1 text-[11px] font-bold"
             >
               <span>Breakdown</span>
               <Info size={14} />
             </button>
           </div>
           <p className="text-3xl font-black text-brand-accent">₹600 - ₹900</p>
           <p className="text-[10px] text-brand-muted mt-2 leading-relaxed">The final amount will be declared and finalized after the assigned professional assesses the job on-site. You will be charged only after completion.</p>

           <AnimatePresence>
             {showSummaryBreakdown && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden mt-4 pt-4 border-t border-brand-secondary/20 space-y-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted"
               >
                 <div className="flex justify-between items-center">
                   <span>Visiting Charges (Fixed)</span>
                   <span className="text-brand-text">₹250</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span>Platform Fees (Fixed)</span>
                   <span className="text-brand-text">₹250</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span>CGST (9% · HSN {taxDetails.hsn})</span>
                   <span className="text-brand-text">On Completion (18%)</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span>SGST (9% · HSN {taxDetails.hsn})</span>
                   <span className="text-brand-text">On Completion (18%)</span>
                 </div>
                 <div className="text-[9px] normal-case tracking-normal italic text-brand-muted font-medium mt-1 leading-relaxed">
                   *Fixed platform fee and visiting charges are guaranteed. Final taxes & job cost are derived after the assigned pro completes inspection.
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <button onClick={onNext} className="btn-primary w-full shadow-xl">
        Confirm Booking
      </button>
    </div>
  );
}

function ConfirmationScreen({ orderId, onNext, onTrack }: { orderId: string, onNext: () => void, onTrack: () => void }) {
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
      <p className="text-blue-100 text-sm mb-12 opacity-80 leading-relaxed font-medium">Professional arriving soon</p>
      
      <div className="bg-white/10 w-full py-6 rounded-[28px] mb-12 backdrop-blur-sm border border-white/5">
        <p className="text-[10px] text-blue-200 uppercase font-black tracking-[0.2em] mb-1">Order ID</p>
        <p className="text-white font-mono text-xl font-bold">{orderId}</p>
      </div>

      <div className="w-full space-y-4">
        <button onClick={onTrack} className="w-full bg-white text-brand-accent py-5 rounded-[22px] font-bold text-sm shadow-xl active:scale-95 transition-transform">
          Track Order
        </button>
        <button onClick={onNext} className="mt-4 text-white/60 text-xs font-bold uppercase tracking-widest block mx-auto">
          Back to Home
        </button>
      </div>
    </div>
  );
}

function OrdersScreen({ history, onBack, onSelectOrder }: { history: Order[], onBack: () => void, onSelectOrder: (id: string) => void }) {
  const activeOrders = history.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const pastOrders = history.filter(o => o.status === 'Completed' || o.status === 'Cancelled');

  return (
    <div className="h-full px-6 pt-12 pb-32 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <MoreVertical className="text-brand-muted" />
      </div>

      <div className="space-y-6">
        {activeOrders.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-4 ml-1">Active</h3>
            <div className="space-y-3">
              {activeOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="card border-l-4 border-l-brand-accent cursor-pointer hover:bg-brand-surface transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="font-bold">{order.type}</p>
                        <p className="text-xs text-brand-muted">#{order.id} · {order.date}, {order.time}</p>
                     </div>
                     {order.pro ? (
                        <div className="flex items-center gap-2 bg-brand-surface px-2 py-1 rounded-xl border border-brand-accent/5">
                          <div className={`w-7 h-7 ${order.pro.color} rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>
                            {order.pro.avatar}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-text uppercase leading-none mb-0.5">{order.pro.name}</p>
                            <div className="flex items-center gap-0.5">
                              <Star size={8} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-[8px] font-bold text-brand-muted">{order.pro.rating}</span>
                            </div>
                          </div>
                        </div>
                     ) : (
                        <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded uppercase">{order.status}</span>
                     )}
                  </div>
                  <button className="w-full py-2 bg-brand-accent text-white rounded-lg text-xs font-bold shadow-md">Track Pro</button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-4 ml-1">Past Requests</h3>
          <div className="space-y-3">
            {pastOrders.length > 0 ? pastOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="card flex items-center justify-between hover:bg-brand-surface cursor-pointer transition-colors"
              >
                 <div>
                    <p className="font-bold">{order.type}</p>
                    <p className="text-xs text-brand-muted">{order.date}</p>
                 </div>
                 <div className="text-right">
                    <span className={`font-bold text-xs block ${order.status === 'Completed' ? 'text-green-600' : 'text-red-500'}`}>{order.status}</span>
                    <p className="text-xs font-bold mt-1">{order.amount}</p>
                 </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <Package size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No past orders</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function OrderDetailsScreen({ orders, orderId, onBack, onSupport, onCancelOrder }: { orders: Order[], orderId: string, onBack: () => void, onSupport: () => void, onCancelOrder: (id: string) => void }) {
  const order = orders.find(o => o.id === orderId);
  const isActive = order ? order.status !== 'Completed' && order.status !== 'Cancelled' : false;
  const [hasReviewed, setHasReviewed] = useState(orderId === 'FIX-8821');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!order) return <div className="h-full flex items-center justify-center p-6 text-brand-muted font-bold text-center">Order not found.</div>;

  const getJobImages = (orderData: Order) => {
    let before = orderData.image || "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80";
    let after = "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80"; // default sparkling clean kitchen sink

    const typeTxt = (orderData.type || "").toLowerCase();
    const serviceTxt = (orderData.service || "").toLowerCase();
    const noteTxt = (orderData.note || "").toLowerCase();

    if (typeTxt.includes("stair") || serviceTxt.includes("stair") || noteTxt.includes("stair")) {
      before = "https://images.unsplash.com/photo-1511216113906-8f57bb83e776?auto=format&fit=crop&w=800&q=80"; // broken stone steps
      after = "https://images.unsplash.com/photo-1562663474-6cbb3fee4c77?auto=format&fit=crop&w=800&q=80"; // sturdy elegant staircase
    } else if (typeTxt.includes("sink") || typeTxt.includes("leak") || serviceTxt.includes("plumb")) {
      before = orderData.image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"; // broken sink/bathroom leak area under repairs
      after = "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80"; // modern sparkling clean kitchen sink
    } else if (typeTxt.includes("ac") || typeTxt.includes("air cond") || typeTxt.includes("cooling")) {
      before = "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=800&q=80"; // empty bare wall before installation
      after = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"; // clean modern wall AC unit split installed
    }

    return {
      beforeImg: before,
      afterImg: orderData.status === 'Completed' ? after : null
    };
  };

  const jobImages = getJobImages(order);

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getRelativeDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    
    // Normalize dateStr: remove year if present (e.g. "Jun 26, 2026" -> "Jun 26")
    const normalize = (s: string) => {
      return s.split(',')[0].trim();
    };
    
    const target = normalize(dateStr);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const today = new Date();
    const todayStr = `${months[today.getMonth()]} ${today.getDate()}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${months[tomorrow.getMonth()]} ${tomorrow.getDate()}`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${months[yesterday.getMonth()]} ${yesterday.getDate()}`;
    
    if (target === todayStr) {
      return "Today";
    } else if (target === tomorrowStr) {
      return "Tomorrow";
    } else if (target === yesterdayStr) {
      return "Yesterday";
    } else {
      return dateStr;
    }
  };

  const details = {
    id: order.id,
    title: order.type,
    service: order.service,
    bookedAt: order.id === 'FIX-99021' ? `${getYesterdayDateString()} · 10:15 AM` : `${order.date} · ${order.time}`,
    completedAt: order.status === 'Completed' ? order.date : null,
    status: order.status,
    arrival: isActive ? `${getRelativeDateLabel(order.date)} · ${order.time}` : null,
    amount: order.amount,
    paymentStatus: order.status === 'Completed' ? "Paid" : "Unpaid",
    rating: orderId === 'FIX-8821' ? 5 : 0,
    review: orderId === 'FIX-8821' ? "The plumber arrived quickly and fixed the leak perfectly. Very clean work and friendly attitude." : "",
    beforeImg: jobImages.beforeImg,
    afterImg: jobImages.afterImg,
    description: order.note || "No additional description provided.",
    pro: order.pro || {
      name: "Ashish Kumar",
      rating: 4.7,
      avatar: "AK",
      color: "bg-emerald-600"
    }
  };

  const handleDownloadReceipt = () => {
    setIsDownloading(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(45, 51, 107); // Brand Primary
    doc.text("FIXIFY RECEIPT", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Order ID: #${details.id}`, 20, 38);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 43);
    
    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 50, 190, 50);
    
    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Service Details", 20, 65);
    
    doc.setFontSize(11);
    doc.text(`Service Name:`, 20, 75);
    doc.setFont("helvetica", "bold");
    doc.text(`${details.title}`, 60, 75);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Status:`, 20, 83);
    doc.text(`${details.status}`, 60, 83);
    
    doc.text(`Booked On:`, 20, 91);
    doc.text(`${details.bookedAt}`, 60, 91);
    
    if (details.completedAt) {
      doc.text(`Completed On:`, 20, 99);
      doc.text(`${details.completedAt}`, 60, 99);
    }
    
    // Pro Details
    doc.setFontSize(14);
    doc.text("Professional Assigned", 20, 115);
    doc.setFontSize(11);
    doc.text(`${details.pro.name}`, 20, 125);
    
    // Calculate precise pricing details based on Indian HSN service tax laws
    const parsedAmt = parseFloat(details.amount.replace(/[^\d.-]/g, '')) || 0;
    const taxDetails = getGSTDetailsByService(details.service);
    const visiting = 250;
    const platform = 250;
    const rawCost = (parsedAmt - visiting - platform) / (1 + taxDetails.rate);
    const cgst = Math.round(rawCost * taxDetails.cgstRate);
    const sgst = Math.round(rawCost * taxDetails.sgstRate);
    const jobCost = parsedAmt - visiting - platform - cgst - sgst;

    const fmt = (val: number) => `INR ${val.toLocaleString('en-IN')}`;

    // Payment Details Box with Itemized Table
    doc.setDrawColor(45, 51, 107);
    doc.setFillColor(245, 245, 250);
    doc.rect(20, 138, 170, 77, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 51, 107);
    doc.text("Payment Summary (INR)", 30, 148);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Base Job Cost:`, 30, 157);
    doc.text(`${fmt(jobCost)}`, 130, 157);
    
    doc.text(`Visiting Fee (Fixed):`, 30, 163);
    doc.text(`${fmt(visiting)}`, 130, 163);
    
    doc.text(`Platform Fee (Fixed):`, 30, 169);
    doc.text(`${fmt(platform)}`, 130, 169);
    
    doc.text(`CGST (9% - HSN ${taxDetails.hsn}):`, 30, 175);
    doc.text(`${fmt(cgst)}`, 130, 175);
    
    doc.text(`SGST (9% - HSN ${taxDetails.hsn}):`, 30, 181);
    doc.text(`${fmt(sgst)}`, 130, 181);
    
    doc.setDrawColor(210, 210, 220);
    doc.line(30, 187, 180, 187);
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 51, 107);
    doc.text(`Total Paid:`, 30, 195);
    doc.text(`INR ${parsedAmt.toLocaleString('en-IN')}`, 130, 195);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Payment Status: ${details.paymentStatus}`, 30, 204);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text("Thank you for using Fixify. For any queries, contact support@fixify.com", 105, 280, { align: "center" });
    
    // Save
    setTimeout(() => {
      doc.save(`Fixify_Receipt_${details.id}.pdf`);
      setIsDownloading(false);
    }, 1000);
  };

  const handleShare = async () => {
    const shareText = `Fixify Order #${details.id}: My ${details.title} service is ${details.status}. Booked for ${details.bookedAt}.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fixify Order Details',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(shareText);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
    }
  };

  const checkCancellationCharge = () => {
    try {
      const parts = details.bookedAt.split(' · ');
      if (parts.length < 2) return false;
      const dateStr = parts[0]; 
      const timeStr = parts[1];
      const bookedTime = new Date(`${dateStr} ${timeStr}`);
      const now = new Date();
      const diffMs = bookedTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < 4;
    } catch (e) {
      return false;
    }
  };

  const isLateCancellation = checkCancellationCharge();

  return (
    <div className="h-full flex flex-col pt-12 relative overflow-hidden">
      <AnimatePresence>
        {showShareSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-accent text-white py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 size={14} />
            Details copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-brand-surface rounded-xl transition-colors"><ArrowLeft size={24} /></button>
          <div>
            <h2 className="text-xl font-bold text-brand-text">Order #{orderId}</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-accent' : 'text-green-600'}`}>
              {details.status}
            </p>
          </div>
        </div>
        <button 
          onClick={handleShare}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-accent shadow-sm border border-brand-accent/5 hover:bg-brand-accent hover:text-white transition-all active:scale-95"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
        {isActive && <LiveMap proName={details.pro.name} />}

        {isActive && (
          <section className="bg-brand-accent rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
               <Clock size={120} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
               <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60 mb-2">Estimated Arrival</p>
                  <p className="text-2xl font-black">{details.arrival}</p>
                  <p className="text-xs font-medium opacity-80 mt-1">{details.pro.name.split(' ')[0]} is 2 miles away</p>
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
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1">BOOKED SLOT</p>
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
          <section className="card p-0 overflow-hidden border border-brand-accent/10 shadow-sm rounded-3xl bg-white">
            <div className="bg-brand-surface p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted block mb-0.5">Estimated Amount</span>
                <span className="text-lg font-black text-brand-accent">{details.amount}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Estimate</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50/20 text-amber-900 border-t border-brand-accent/5 flex gap-3 items-start">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                Please note that this is an estimation. The final amount will be declared and finalized after the assigned professional assesses the job on-site.
              </p>
            </div>
          </section>
        )}

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
                <img src={details.beforeImg} className="w-full h-full object-cover" alt="Upload" referrerPolicy="no-referrer" />
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
                  <img src={details.beforeImg} className="w-full h-full object-cover grayscale-[0.2]" alt="Before" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded backdrop-blur-md">Before</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-brand-accent/10">
                  <img src={details.afterImg} className="w-full h-full object-cover" alt="After" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 left-2 bg-brand-accent text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded shadow-sm">After</div>
              </div>
            </div>
          )}
        </section>

        {!isActive && (
          <section className="card p-0 overflow-hidden border-none shadow-md">
            <div className="bg-brand-surface p-5 flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-0.5">Amount Paid</span>
                  <span className="text-lg font-black text-brand-accent">{details.amount}</span>
                </div>
                <button 
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="p-1 text-brand-muted hover:text-brand-accent transition-colors"
                >
                  <Info size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full">
                 <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                 <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Paid</span>
              </div>
            </div>
            
            <AnimatePresence>
              {showBreakdown && (() => {
                const parsedAmt = parseFloat(details.amount.replace(/[^\d.-]/g, '')) || 0;
                const taxDetails = getGSTDetailsByService(details.service);
                const visiting = 250;
                const platform = 250;
                
                let jobCost = 0;
                let cgst = 0;
                let sgst = 0;

                if (parsedAmt > 0) {
                  const rawCost = (parsedAmt - visiting - platform) / (1 + taxDetails.rate);
                  cgst = Math.round(rawCost * taxDetails.cgstRate);
                  sgst = Math.round(rawCost * taxDetails.sgstRate);
                  jobCost = parsedAmt - visiting - platform - cgst - sgst;
                }

                const fmt = (val: number) => `₹${val.toLocaleString('en-IN')}`;

                return (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-brand-surface/50 border-t border-brand-secondary/10 px-5 py-4 space-y-2"
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span>Job Cost</span>
                      <span className="text-brand-text">{fmt(jobCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span>Visiting Charges (Fixed)</span>
                      <span className="text-brand-text">{fmt(visiting)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span>Platform Fees (Fixed)</span>
                      <span className="text-brand-text">{fmt(platform)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span>CGST (9% · HSN {taxDetails.hsn})</span>
                      <span className="text-brand-text">{fmt(cgst)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span>SGST (9% · HSN {taxDetails.hsn})</span>
                      <span className="text-brand-text">{fmt(sgst)}</span>
                    </div>
                    <div className="pt-2 border-t border-brand-secondary/10 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Total Paid</span>
                      <span className="text-xs font-black text-brand-accent">{details.amount}</span>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
            
            <div className="p-5 space-y-4 bg-white">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Review Status</h3>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${hasReviewed ? 'text-green-600' : 'text-orange-500'}`}>
                    {hasReviewed ? 'Review Given' : 'Ask for Review'}
                 </span>
              </div>

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
                <div className="space-y-4 pt-2">
                    <div className="text-center p-4 bg-brand-surface rounded-2xl border border-dashed border-brand-secondary/50 mb-4">
                       <p className="text-xs font-bold text-brand-accent mb-2">Final Step: Mark as Complete</p>
                       <button 
                         onClick={() => setShowConfirm(true)}
                         className="btn-primary w-full py-3 text-xs uppercase tracking-widest font-black shadow-lg shadow-brand-accent/20"
                       >
                         Mark as Complete
                       </button>
                    </div>

                    <div className="text-center">
                      <h3 className="text-sm font-bold text-brand-accent mb-1">Rate your experience</h3>
                      <p className="text-xs text-brand-muted">How was {details.pro.name.split(' ')[0]}'s service today?</p>
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

        {isActive && (
          <section className="pt-2 pb-2">
             <div className="text-center p-4 bg-brand-accent/5 rounded-2xl border border-dashed border-brand-accent/20">
               <p className="text-xs font-bold text-brand-accent mb-3">Job finished? Close the request.</p>
               <button 
                onClick={() => setShowConfirm(true)}
                className="btn-primary w-full py-4 text-xs uppercase tracking-widest font-black shadow-lg shadow-brand-accent/20"
               >
                 Mark as Complete
               </button>
             </div>
          </section>
        )}

        <button 
          onClick={isActive ? onSupport : handleDownloadReceipt}
          disabled={isDownloading}
          className="w-full font-bold text-brand-accent text-[10px] uppercase tracking-[0.2em] mb-4 hover:bg-brand-accent/5 py-4 rounded-2xl transition-all border border-brand-accent/20 flex items-center justify-center gap-2"
        >
           {isDownloading ? (
             <>
               <Clock size={14} className="animate-spin" />
               Generating Receipt...
             </>
           ) : (
             <>
               {!isActive && <FileText size={14} />}
               {isActive ? "Need Help with this order?" : "Download Full Receipt"}
             </>
           )}
        </button>

        {isActive && (
          <button 
            onClick={() => setShowCancelConfirm(true)}
            className="w-full font-bold text-red-500/60 text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={14} />
            Cancel Request
          </button>
        )}

        <AnimatePresence>
          {showCancelConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <XCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-text">Cancel Job Request?</h3>
                
                <div className="bg-brand-surface rounded-2xl p-4 mb-8 text-left border border-brand-secondary/10">
                   <div className="flex items-start gap-3">
                      <Info size={18} className="text-brand-accent mt-0.5 shrink-0" />
                      <div>
                         <p className="text-xs font-black uppercase text-brand-accent tracking-wider mb-1">Cancellation Policy</p>
                         <p className="text-[11px] font-medium text-brand-muted leading-relaxed">
                            {isLateCancellation ? (
                              <span className="text-red-500 font-bold">50% charge will apply as less than 4 hours remain.</span>
                            ) : (
                              "Free cancellation as more than 4 hours remain before the service slot."
                            )}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="py-4 text-xs font-black uppercase tracking-widest text-brand-muted bg-brand-surface rounded-2xl"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={() => {
                      onCancelOrder(orderId);
                      setShowCancelConfirm(false);
                      onBack();
                    }}
                    className="py-4 text-xs font-black uppercase tracking-widest text-white bg-red-500 rounded-2xl shadow-lg shadow-red-500/20"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-xs shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Job Completion</h3>
                <p className="text-sm text-brand-muted mb-8 leading-relaxed">
                  Are you sure the pro has finished the job to your satisfaction? This will finalize the service and process payment.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="py-4 text-xs font-black uppercase tracking-widest text-brand-muted bg-brand-surface rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setHasReviewed(true);
                      setShowConfirm(false);
                    }}
                    className="py-4 text-xs font-black uppercase tracking-widest text-white bg-brand-accent rounded-2xl shadow-lg"
                  >
                    Yes, Complete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SupportChatScreen({ userName, history, onUpdate, onBack }: { userName: string, history: ChatMessage[], onUpdate: (msgs: ChatMessage[]) => void, onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(history.length > 0 ? history : [
    { id: 1, text: `Hi ${userName.split(' ')[0]}! I'm your Fixify AI assistant. How can I help you today?`, sender: 'bot', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Sync with global state for persistence
    onUpdate(messages);
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { 
      id: Date.now(), 
      text: input, 
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "I'm looking into that for you. Is it regarding your active order #FIX-99021?";
      if (input.toLowerCase().includes('refund')) {
        response = "I understand you're looking for a refund. Let me check our policy for you. Our typical processing time is 3-5 business days.";
      } else if (input.toLowerCase().includes('plumber')) {
        response = "I can definitely help you find a plumber. You can also use the 'Fix' button to snap a photo and I'll match you automatically!";
      }
      
      const botMsg: ChatMessage = { 
        id: Date.now() + 1, 
        text: response, 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const clearHistory = () => {
    const initialMsg: ChatMessage = { id: 1, text: "Hi Akshay! I'm your Fixify AI assistant. How can I help you today?", sender: 'bot', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([initialMsg]);
    onUpdate([initialMsg]);
  };

  return (
    <div className="h-full flex flex-col pt-12 bg-white">
      <div className="px-6 flex items-center justify-between mb-4 border-b border-brand-secondary/30 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white">
                <Sparkles size={16} />
             </div>
             <div>
                <h2 className="text-sm font-bold">Fixify AI Support</h2>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-[10px] font-bold text-brand-muted uppercase">Always Online</span>
                </div>
             </div>
          </div>
        </div>
        <button onClick={clearHistory} className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-red-500 transition-colors">
          Clear
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-6 py-4 no-scrollbar">
        {messages.map((m, idx) => {
          const showTime = idx === 0 || messages[idx-1].timestamp !== m.timestamp;
          return (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {showTime && <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1 mx-2">{m.timestamp}</p>}
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                m.sender === 'user' 
                  ? 'bg-brand-accent text-white rounded-tr-none' 
                  : 'bg-brand-surface text-brand-text rounded-tl-none border border-brand-secondary/20'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-brand-surface px-4 py-3 rounded-2xl rounded-tl-none border border-brand-secondary/20 flex gap-1 items-center">
              <div className="w-1 h-1 bg-brand-muted rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-brand-muted rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-brand-muted rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-brand-secondary/20 flex gap-3 items-end">
        <div className="flex-1 bg-brand-surface rounded-2xl border border-brand-secondary/30 flex items-center px-4 py-3">
          <textarea 
            rows={1}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-12 h-12 bg-brand-accent text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 transition-opacity"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function LiveMap({ proName = "Ashish Kumar" }: { proName?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-56 bg-slate-100 rounded-[32px] overflow-hidden border border-brand-accent/5 shadow-inner mb-2"
    >
      {/* Grid Pattern Background to simulate map */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'radial-gradient(#2D336B 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }} />
      
      {/* Simulated Road Path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
        <path
          d="M 50 150 Q 150 150, 150 100 T 350 50"
          fill="transparent"
          stroke="#2D336B"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.1"
        />
        <motion.path
          d="M 50 150 Q 150 150, 150 100 T 350 50"
          fill="transparent"
          stroke="#2D336B"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Destination Marker (User Home) */}
      <div className="absolute top-[40px] right-[40px] z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-ping scale-150" />
          <div className="bg-brand-accent p-2 rounded-xl text-white shadow-lg relative z-10">
            <Home size={16} />
          </div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-md border border-brand-accent/5 whitespace-nowrap">
            <span className="text-[8px] font-black uppercase text-brand-text">Your Home</span>
          </div>
        </div>
      </div>

      {/* Worker Marker (Moving Pro) */}
      <motion.div 
        className="absolute bottom-[140px] left-[40px] z-20"
        animate={{ 
          x: [0, 80, 80, 260],
          y: [0, 0, -40, -80]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="bg-brand-accent px-2 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-tighter mb-1 shadow-sm border border-white/20">
            {proName.split(' ')[0]} (Pro)
          </div>
          <div className="w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-accent border-2 border-brand-accent/5">
            <div className="relative">
               <MapPin size={24} className="fill-brand-accent/10" />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Content Overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-brand-accent/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-brand-accent tracking-tighter mb-0.5">Live Traffic</p>
            <p className="text-xs font-bold text-brand-text">12 mins away</p>
          </div>
        </div>
        <button className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-brand-accent/5 text-brand-accent active:scale-95 transition-transform">
          <Maximize2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function ProfileScreen({ 
  userProfile,
  onEditProfile,
  onBack, 
  onSupport, 
  onAddresses, 
  onPayments, 
  onNotifications, 
  onLegal, 
  onChatHistory, 
  onLogout 
}: { 
  userProfile: UserProfile,
  onEditProfile: () => void,
  onBack: () => void, 
  onSupport: () => void, 
  onAddresses: () => void, 
  onPayments: () => void,
  onNotifications: () => void,
  onLegal: () => void,
  onChatHistory: () => void,
  onLogout: () => void
}) {
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (nameStr[0] || 'U').toUpperCase();
  };

  return (
    <div className="h-full px-6 pt-12 pb-32 overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold mb-8">Account</h2>
      <div className="flex items-center gap-4 mb-10 pb-10 border-b border-brand-secondary/30">
         <div className="w-16 h-16 rounded-[22px] bg-brand-accent flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden">
           {userProfile.avatarUrl ? (
             <img src={userProfile.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Profile" />
           ) : (
             getInitials(userProfile.name)
           )}
         </div>
         <div>
            <p className="font-extrabold text-lg text-brand-accent">{userProfile.name}</p>
            <p className="text-xs text-brand-muted font-medium">{userProfile.email}</p>
            <button 
              onClick={onEditProfile}
              className="text-brand-accent text-[10px] font-black uppercase tracking-widest mt-2 border-b border-brand-accent/30 pb-0.5"
            >
              Edit Profile
            </button>
         </div>
      </div>

      <div className="space-y-1">
        {["Addresses", "Payment Methods", "Notifications", "Chat History", "Support", "Legal"].map(t => (
          <div 
            key={t} 
            onClick={() => {
              if (t === 'Support') onSupport();
              if (t === 'Addresses') onAddresses();
              if (t === 'Payment Methods') onPayments();
              if (t === 'Notifications') onNotifications();
              if (t === 'Legal') onLegal();
              if (t === 'Chat History') onChatHistory();
            }}
            className="flex justify-between items-center py-5 px-4 hover:bg-brand-surface transition-colors cursor-pointer border-b border-brand-secondary/20 last:border-b-0 rounded-xl"
          >
             <span className="font-bold text-sm text-brand-text/80">{t}</span>
             <ChevronRight size={18} className="text-brand-muted" />
          </div>
        ))}
        <button 
          onClick={onLogout}
          className="w-full text-left py-6 px-4 font-black text-red-500 text-xs uppercase tracking-[0.2em] mt-8 border-t border-brand-secondary/20 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function EditProfileScreen({ 
  userProfile, 
  onSave, 
  onBack 
}: { 
  userProfile: UserProfile, 
  onSave: (p: UserProfile) => void, 
  onBack: () => void 
}) {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile.avatarUrl);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG/JPG/WEBP).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl
    });
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (nameStr[0] || 'U').toUpperCase();
  };

  return (
    <div className="h-full px-6 pt-12 pb-32 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="w-10 h-10 rounded-xl bg-white border border-brand-secondary flex items-center justify-center text-brand-accent hover:bg-brand-surface active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-bold">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Avatar with file chooser upload / drag drop zone */}
        <div className="flex flex-col items-center gap-4 p-5 bg-white border border-brand-secondary/40 rounded-3xl shadow-sm">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-brand-accent flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden border-2 border-brand-surface">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Profile Preview" />
              ) : (
                getInitials(name || "U")
              )}
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                title="Remove photo"
              >
                <XCircle size={14} className="fill-white text-red-500" />
              </button>
            )}
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-brand-accent bg-brand-accent/5' 
                : 'border-brand-secondary hover:border-brand-accent bg-brand-surface'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input 
              id="file-upload-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <div className="flex flex-col items-center gap-1.5">
              <Upload size={20} className="text-brand-muted" />
              <p className="text-xs font-bold text-brand-text">Drag & drop image or click to choose</p>
              <p className="text-[10px] text-brand-muted">Supports PNG, JPG, or WEBP formats</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Akshay Goyal" 
              className="w-full p-4 bg-white border border-brand-secondary rounded-2xl focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all text-sm font-semibold text-brand-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted ml-1">Email ID</label>
            <input 
              type="email" 
              placeholder="e.g. akshay@fixify.com" 
              className="w-full p-4 bg-white border border-brand-secondary rounded-2xl focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all text-sm font-semibold text-brand-text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted ml-1">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. +91 98765 43210" 
              className="w-full p-4 bg-white border border-brand-secondary rounded-2xl focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all text-sm font-semibold text-brand-text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit"
            className="btn-primary w-full shadow-lg shadow-brand-accent/10"
          >
            Save Changes
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="w-full py-2 text-xs font-black uppercase text-brand-muted tracking-widest text-center hover:text-brand-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressListScreen({ addresses, onUpdate, onBack }: { addresses: Address[], onUpdate: (addrs: Address[]) => void, onBack: () => void }) {
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');

  const handleDelete = (id: string) => {
    onUpdate(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    onUpdate(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const handleSave = () => {
    if (!newLabel || !newPath) return;

    if (editingAddr) {
      onUpdate(addresses.map(a => a.id === editingAddr.id ? { ...a, label: newLabel, fullAddress: newPath } : a));
    } else {
      const newAddr: Address = {
        id: Date.now().toString(),
        label: newLabel,
        fullAddress: newPath,
        isDefault: addresses.length === 0
      };
      onUpdate([...addresses, newAddr]);
    }
    
    setEditingAddr(null);
    setShowAddForm(false);
    setNewLabel('');
    setNewPath('');
  };

  const startEdit = (addr: Address) => {
    setEditingAddr(addr);
    setNewLabel(addr.label);
    setNewPath(addr.fullAddress);
    setShowAddForm(true);
  };

  return (
    <div className="h-full flex flex-col pt-12 bg-brand-bg">
      <div className="px-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold">Saved Addresses</h2>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => {
              setEditingAddr(null);
              setNewLabel('');
              setNewPath('');
              setShowAddForm(true);
            }} 
            className="p-2 bg-brand-accent text-white rounded-full shadow-lg"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-12 no-scrollbar">
        {showAddForm ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 space-y-4 bg-white border-none shadow-xl rounded-[32px]"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-brand-accent">
              {editingAddr ? "Update Address" : "New Address"}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Label (e.g. Home, Mom's House)</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-brand-surface rounded-2xl border border-brand-secondary/30 outline-none focus:border-brand-accent transition-all"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Home"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Full Address</label>
                <textarea 
                  className="w-full p-4 bg-brand-surface rounded-2xl border border-brand-secondary/30 outline-none focus:border-brand-accent transition-all h-24 resize-none"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="123 Street Name, Area, City"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
               <button 
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-brand-muted bg-brand-surface rounded-2xl"
               >
                 Cancel
               </button>
               <button 
                onClick={handleSave}
                disabled={!newLabel || !newPath}
                className="flex-2 py-4 text-xs font-black uppercase tracking-widest text-white bg-brand-accent rounded-2xl shadow-lg disabled:opacity-50"
               >
                 Save Address
               </button>
            </div>
          </motion.div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className="card p-5 bg-white border-none shadow-sm flex items-start gap-4 group">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-brand-accent text-white' : 'bg-brand-surface text-brand-muted'}`}>
                  <Home size={18} />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-2">
                        <h4 className="font-bold text-brand-text">{addr.label}</h4>
                        {addr.isDefault && (
                          <span className="text-[8px] font-black bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded uppercase tracking-wider">Default</span>
                        )}
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => startEdit(addr)} className="text-brand-muted hover:text-brand-accent transition-colors font-bold text-[10px] uppercase">Edit</button>
                        {!addr.isDefault && (
                          <button onClick={() => handleDelete(addr.id)} className="text-red-400 hover:text-red-600 transition-colors font-bold text-[10px] uppercase">Delete</button>
                        )}
                     </div>
                  </div>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">{addr.fullAddress}</p>
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(addr.id)}
                      className="mt-3 text-[10px] font-black text-brand-accent uppercase tracking-widest border-b border-brand-accent/20 pb-0.5"
                    >
                      Set as default
                    </button>
                  )}
               </div>
            </div>
          ))
        )}

        {!showAddForm && addresses.length === 0 && (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-brand-muted">
                <MapPin size={24} />
             </div>
             <p className="text-sm font-bold text-brand-text">No addresses saved yet</p>
             <p className="text-xs text-brand-muted mt-2">Add your first address to speed up bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentMethodsScreen({ onBack }: { onBack: () => void }) {
  const options = [
    { id: 'card', title: 'Add Credit/Debit Card', subtitle: 'Visa, Mastercard, RuPay & more', icon: <CreditCard size={20} /> },
    { id: 'upi', title: 'Pay via UPI Apps', subtitle: 'Google Pay, PhonePe, Paytm', icon: <Smartphone size={20} /> },
    { id: 'wallet', title: 'Pay via Wallet', subtitle: 'Paytm, Amazon Pay, Mobikwik', icon: <Wallet size={20} /> },
    { id: 'cash', title: 'Pay with Cash', subtitle: 'Pay after service is completed', icon: <Banknote size={20} /> }
  ];

  return (
    <div className="h-full flex flex-col pt-12 bg-brand-bg">
      <div className="px-6 flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Payment Methods</h2>
      </div>

      <div className="px-6 space-y-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-6 ml-1">Choose a Payment Option</div>
        
        {options.map((opt) => (
          <div 
            key={opt.id} 
            className="card p-5 bg-white border-none shadow-sm flex items-center gap-4 hover:bg-brand-surface transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-surface text-brand-accent flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
              {opt.icon}
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-brand-text text-sm">{opt.title}</h4>
               <p className="text-[10px] text-brand-muted font-medium mt-0.5">{opt.subtitle}</p>
            </div>
            <ChevronRight size={16} className="text-brand-muted/40 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}

        <div className="mt-12 p-6 bg-brand-accent/5 rounded-[32px] border border-dashed border-brand-accent/20">
           <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={18} className="text-brand-accent" />
              <h5 className="text-xs font-black uppercase tracking-widest text-brand-accent">Secure Payments</h5>
           </div>
           <p className="text-[10px] text-brand-accent/70 font-medium leading-relaxed">
             Your payment details are encrypted and securely stored. We do not share your private financial information.
           </p>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen({ notifications, onBack, onMarkRead }: { notifications: Notification[], onBack: () => void, onMarkRead: (id: string) => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <Package size={18} />;
      case 'PROMO': return <Tag size={18} />;
      default: return <Settings size={18} />;
    }
  };

  return (
    <div className="h-full flex flex-col pt-12 bg-brand-bg">
      <div className="px-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        <div className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center text-brand-accent relative">
           <Bell size={20} />
           {notifications.some(n => n.isUnread) && (
             <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-surface" />
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-12 no-scrollbar">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            onClick={() => onMarkRead(notif.id)}
            className={`card p-5 border-none transition-all cursor-pointer relative overflow-hidden group ${notif.isUnread ? 'bg-white shadow-md' : 'bg-brand-surface/50 opacity-80'}`}
          >
             {notif.isUnread && (
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent" />
             )}
             <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.isUnread ? 'bg-brand-accent/10 text-brand-accent' : 'bg-gray-100 text-gray-400'}`}>
                   {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold ${notif.isUnread ? 'text-brand-text' : 'text-brand-muted'}`}>{notif.title}</h4>
                      <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">{notif.time}</span>
                   </div>
                   <p className="text-xs text-brand-muted leading-relaxed">{notif.message}</p>
                </div>
             </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-brand-muted">
                <Bell size={24} />
             </div>
             <p className="text-sm font-bold text-brand-text">All caught up!</p>
             <p className="text-xs text-brand-muted mt-2">No new notifications for you right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegalScreen({ onBack, onOpenTerms, onOpenPrivacy }: { onBack: () => void, onOpenTerms: () => void, onOpenPrivacy: () => void }) {
  const options = [
    { title: "Terms and Conditions", action: onOpenTerms },
    { title: "Privacy Policy", action: onOpenPrivacy }
  ];

  return (
    <div className="h-full flex flex-col pt-12 bg-brand-bg">
      <div className="px-6 flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Legal</h2>
      </div>

      <div className="px-6 space-y-4">
        {options.map((opt, i) => (
          <div 
            key={i} 
            onClick={opt.action}
            className="card p-5 bg-white border-none shadow-sm flex items-center justify-between hover:bg-brand-surface transition-all cursor-pointer group active:scale-[0.98] rounded-2xl"
          >
            <span className="font-bold text-brand-text text-sm">{opt.title}</span>
            <ChevronRight size={18} className="text-brand-muted/40 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
        
        <div className="mt-12 text-center">
           <p className="text-[10px] text-brand-muted font-bold uppercase tracking-[0.2em]">Version 1.4.2 (App Store)</p>
           <p className="text-[9px] text-brand-muted mt-2 opacity-50">© 2026 Fixify Technologies Inc.</p>
        </div>
      </div>
    </div>
  );
}

function DocumentScreen({ title, content, onBack }: { title: string, content: string, onBack: () => void }) {
  return (
    <div className="h-full flex flex-col pt-12 bg-white">
      <div className="px-6 flex items-center gap-4 mb-6 sticky top-0 py-2 bg-white z-10">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
        <div className="prose prose-sm max-w-none text-brand-text/80 font-medium leading-relaxed space-y-6">
           {content.split('\n\n').map((paragraph, i) => (
             <p key={i}>{paragraph}</p>
           ))}
        </div>
      </div>
    </div>
  );
}

const TERMS_CONTENT = `Last Updated: April 2026

1. ACCEPTANCE OF TERMS
By accessing or using the Fixify mobile application (the "App") and the services provided through it (the "Services"), you agree to be bound by these Terms and Conditions.

2. DESCRIPTION OF SERVICES
Fixify provides a platform that connects users ("Customers") with third-party service providers ("Pros") for home maintenance, repair, and other professional services. Fixify does not provide the professional services itself.

3. USER RESPONSIBILITIES
You must be at least 18 years old to use the Services. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.

4. PAYMENTS AND CANCELLATIONS
Customers agree to pay the fees quoted for each service. Cancellations must be made within the timeframes specified in the App. Late cancellations may be subject to a fee.

5. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Fixify shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.

6. CONTACT US
If you have any questions about these Terms, please contact us at legal@fixify.com.`;

const PRIVACY_POLICY_CONTENT = `Last Updated: April 2026

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as your name, email address, phone number, and address when you create an account. We also collect location data to match you with nearby Pros.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to provide, maintain, and improve our Services, to process transactions, and to communicate with you about your bookings and promotional offers.

3. DATA SHARING
We share your information with the Pros you choose to book so they can provide the requested services. We do not sell your personal data to third parties for marketing purposes.

4. DATA SECURITY
We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.

5. YOUR CHOICES
You may update your account information at any time through the App settings. You can also request deletion of your account by contacting support.

6. CHANGES TO THIS POLICY
We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.`;

function ChatHistoryScreen({ onBack, onSelectChat }: { onBack: () => void, onSelectChat: (id: string) => void }) {
  const histories = [
    { id: '1', title: 'Plumbing Issue', date: 'April 20, 2026', lastMsg: 'Your pro is on their way.', status: 'Closed' },
    { id: '2', title: 'Electrical Sparks', date: 'March 15, 2026', lastMsg: 'Thank you for choosing Fixify.', status: 'Closed' },
    { id: '3', title: 'AC Not Cooling', date: 'Feb 10, 2026', lastMsg: 'The issue was with the filter.', status: 'Closed' }
  ];

  return (
    <div className="h-full flex flex-col pt-12 bg-brand-bg">
      <div className="px-6 flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold">Chat History</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-12 no-scrollbar">
        {histories.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat.id)}
            className="card p-5 bg-white border-none shadow-sm flex items-start gap-4 hover:bg-brand-surface transition-all cursor-pointer group active:scale-[0.98] rounded-2xl"
          >
             <div className="w-12 h-12 rounded-2xl bg-brand-surface text-brand-accent flex items-center justify-center shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                <MessageCircle size={22} />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-brand-text text-sm">{chat.title}</h4>
                   <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">{chat.date}</span>
                </div>
                <p className="text-xs text-brand-muted line-clamp-1">{chat.lastMsg}</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                   <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{chat.status}</span>
                </div>
             </div>
             <ChevronRight size={16} className="text-brand-muted/40 self-center" />
          </div>
        ))}
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

