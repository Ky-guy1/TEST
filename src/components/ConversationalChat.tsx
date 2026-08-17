import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Volume2, VolumeX, RefreshCw, Receipt, 
  AlertTriangle, MapPin, Check, Copy, Droplet, ShieldCheck, Phone, 
  CreditCard, Lightbulb, Calculator, Search, 
  ArrowRight, CheckCircle2, Info, MessageSquare, ChevronDown, ChevronRight,
  Globe, Key, MessageCircle, X, Building2, Users, Wrench, BadgeCheck,
  Plus, Camera, Image, Cloud, Paperclip, FileText, Upload, Clock,
  Calendar, FileCheck, ThumbsUp, Share2, HelpCircle, Eye, EyeOff, Lock,
  ExternalLink, ArrowUpRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, WaterBill } from '../types';
import { MOCK_BILLS, GRENADA_PARISHES, getOrCreateBill } from '../data/mockData';

interface ConversationalChatProps {
  onSelectBill: (accountNumber: string) => void;
  onOpenLeakModal: () => void;
  initialQuery?: string;
}

interface CommunityPost {
  id: string;
  parish: string;
  title: string;
  author: string;
  authorRole: string;
  timeAgo: string;
  content: string;
  category: 'Notice' | 'Truck Schedule' | 'Repairs' | 'Water Tip';
  upvotes: number;
  hasUpvoted?: boolean;
}

interface OfficialForm {
  id: string;
  title: string;
  description: string;
  fee: string;
  processingTime: string;
  requiredDocs: string[];
}

export const ConversationalChat: React.FC<ConversationalChatProps> = ({ 
  onSelectBill, 
  onOpenLeakModal, 
  initialQuery 
}) => {
  // Navigation Tabs inside Core Left Primary Workspace
  const [activeTab, setActiveTab] = useState<'chat' | 'community' | 'faq' | 'forms' | 'territory' | 'contact'>('chat');

  // Sidebar Account Lookup & Quick Balance State
  const [sidebarAccountQuery, setSidebarAccountQuery] = useState<string>('ACC-849201');
  const [activeAccount, setActiveAccount] = useState<WaterBill>(() => getOrCreateBill('ACC-849201'));

  // Assistant Settings State
  const [language, setLanguage] = useState<string>('English');
  const [persona, setPersona] = useState<string>('Household Customer');
  const [territory, setTerritory] = useState<string>('Grenada');
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);
  const [simpleLanguage, setSimpleLanguage] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('nawasa_custom_api_key') || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `**Welcome to the NAWASA Customer Support Desk.**\n\nI can assist you with your water account, billing statements, leak reports, and service applications across Grenada, Carriacou, and Petite Martinique.\n\n- Look up account balances and payment options\n- Report pipe leaks or low water pressure in your parish\n- View scheduled maintenance and parish water truck dispatch\n- Review tariff rates and download service connection forms`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        "Check bill balance (ACC-849201)",
        "Report a leak in Grand Anse",
        "Payment locations & online banking",
        "Headquarters & parish offices",
        "Dry season conservation tips",
        "Calculate monthly water rate"
      ]
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attachment State
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<{
    name: string;
    type: 'camera' | 'photos' | 'drive' | 'files';
    previewUrl?: string;
  }[]>([]);
  const [showDrivePickerModal, setShowDrivePickerModal] = useState<boolean>(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState<string>('');
  const [customDriveFileName, setCustomDriveFileName] = useState<string>('');

  // Hidden File Input Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Bill Modal
  const [isQuickBillModalOpen, setIsQuickBillModalOpen] = useState<boolean>(false);
  const [quickBillInput, setQuickBillInput] = useState<string>('ACC-849201');

  // Community State
  const [communityParishFilter, setCommunityParishFilter] = useState<string>('All Parishes');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      parish: 'St. George',
      title: 'Scheduled Water Truck Schedule: Woburn & Morne Rouge',
      author: 'NAWASA Operations Dispatch',
      authorRole: 'Official Authority',
      timeAgo: '2 hours ago',
      content: 'Water dispatch trucks will supply the upper Woburn, Morne Jaloux, and Morne Rouge ridges between 1:00 PM and 5:30 PM today during scheduled line maintenance.',
      category: 'Truck Schedule',
      upvotes: 24,
      hasUpvoted: false
    },
    {
      id: 'post-2',
      parish: 'St. Andrew',
      title: 'Repairs Completed at Mirabeau Water Treatment Plant',
      author: 'Field Maintenance Crew (St. Andrew)',
      authorRole: 'Official Authority',
      timeAgo: '4 hours ago',
      content: 'Pressure equalization is underway across Grenville Town and Canal Road. Normal distribution pressure is expected across higher elevations by 6:00 PM.',
      category: 'Repairs',
      upvotes: 38,
      hasUpvoted: true
    },
    {
      id: 'post-3',
      parish: 'Carriacou & Petite Martinique',
      title: 'Desalination Storage Facility at 94% Operational Capacity',
      author: 'Carriacou Sub-Station',
      authorRole: 'Official Authority',
      timeAgo: '1 day ago',
      content: 'The Hillsborough Reverse Osmosis plant completed routine servicing. Rainwater harvesting storage reserves remain robust for the dry period.',
      category: 'Notice',
      upvotes: 19,
      hasUpvoted: false
    },
    {
      id: 'post-4',
      parish: 'St. David',
      title: 'Conservation Guidance: Rainwater Harvesting Best Practices',
      author: 'NAWASA Conservation Advisory',
      authorRole: 'Advisory Unit',
      timeAgo: '2 days ago',
      content: 'Customers in St. David are encouraged to clean guttering and ensure water cistern mesh screens are clear ahead of expected weekend precipitation.',
      category: 'Water Tip',
      upvotes: 42,
      hasUpvoted: false
    }
  ]);
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostParish, setNewPostParish] = useState<string>('St. George');
  const [newPostCategory, setNewPostCategory] = useState<'Notice' | 'Truck Schedule' | 'Repairs' | 'Water Tip'>('Notice');

  // FAQ State
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Forms State
  const [selectedForm, setSelectedForm] = useState<OfficialForm | null>(null);
  const [formSubmitModalOpen, setFormSubmitModalOpen] = useState<boolean>(false);
  const [formFullName, setFormFullName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formParish, setFormParish] = useState<string>('St. George');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSubmittedReceipt, setFormSubmittedReceipt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS not available", e);
    }
  };

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('nawasa_custom_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('nawasa_custom_api_key');
    }
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const handleSidebarLookup = (query: string) => {
    const bill = getOrCreateBill(query);
    setActiveAccount(bill);
    setSidebarAccountQuery(bill.accountNumber);
  };

  // Attachment handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'camera' | 'photos' | 'files') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = type === 'camera' || type === 'photos' ? URL.createObjectURL(file) : undefined;
      setAttachments(prev => [...prev, { name: file.name, type, previewUrl }]);
    }
  };

  const handleSelectDriveFile = (fileName: string) => {
    setAttachments(prev => [...prev, { name: fileName, type: 'drive' }]);
    setShowDrivePickerModal(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Message Send Logic
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText && attachments.length === 0) return;

    const currentAttachments = [...attachments];
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText || (currentAttachments.length > 0 ? `Uploaded ${currentAttachments.length} document(s)` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentAttachments.length > 0 
            ? `${queryText} [User uploaded attachments: ${currentAttachments.map(a => `${a.type}:${a.name}`).join(', ')}]`
            : queryText,
          persona,
          territory,
          simpleLanguage,
          customApiKey: customApiKey || undefined
        })
      });

      const data = await res.json();
      let botReply = data.reply || "I am connected to NAWASA records. You can look up your water account or submit a service request directly using the portal controls.";

      if (currentAttachments.length > 0 && (!data.reply || data.reply.includes("offline mode"))) {
        botReply = `Received ${currentAttachments.length} attachment(s): **${currentAttachments.map(a => a.name).join(', ')}**.\n\nYour submission has been cataloged for verification by our customer service desk for **${territory}**.`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botReply,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: queryText.toLowerCase().includes('bill') 
          ? ["Search Another Account", "Pay Bill Now", "View 6-Month Chart"]
          : queryText.toLowerCase().includes('leak')
          ? ["File Leak Report", "Call Emergency Hotline (276)"]
          : ["Check Account ACC-849201", "Parish Office Locations", "Conservation Guidance", "Apply for Service Connection"]
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(botReply);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: currentAttachments.length > 0 
          ? `Received attachment(s): **${currentAttachments.map(a => a.name).join(', ')}**. Stored for review.`
          : "You can query account **ACC-849201**, view active outage notices, or submit a maintenance ticket via the portal navigation above.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyReferenceCode = () => {
    navigator.clipboard.writeText('REF-WES-067');
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleToggleUpvote = (postId: string) => {
    setCommunityPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isUpvoted = post.hasUpvoted;
        return {
          ...post,
          upvotes: isUpvoted ? post.upvotes - 1 : post.upvotes + 1,
          hasUpvoted: !isUpvoted
        };
      }
      return post;
    }));
  };

  const handleCreateCommunityPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      parish: newPostParish,
      title: newPostTitle.trim(),
      author: persona,
      authorRole: 'Community Member',
      timeAgo: 'Just now',
      content: newPostContent.trim(),
      category: newPostCategory,
      upvotes: 1,
      hasUpvoted: true
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formAddress.trim()) return;

    setFormSubmitting(true);
    setTimeout(() => {
      const receiptCode = `NAW-${selectedForm?.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormSubmittedReceipt(receiptCode);
      setFormSubmitting(false);
    }, 900);
  };

  const resetFormModal = () => {
    setFormSubmitModalOpen(false);
    setFormSubmittedReceipt(null);
    setFormFullName('');
    setFormPhone('');
    setFormAddress('');
  };

  const getQuickReplyIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('bill') || lower.includes('account')) return <Receipt className="w-3.5 h-3.5 text-sky-400" />;
    if (lower.includes('leak') || lower.includes('report')) return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes('pay') || lower.includes('outlet') || lower.includes('banking')) return <CreditCard className="w-3.5 h-3.5 text-teal-400" />;
    if (lower.includes('contact') || lower.includes('headquarters') || lower.includes('location') || lower.includes('office')) return <MapPin className="w-3.5 h-3.5 text-sky-400" />;
    if (lower.includes('tip') || lower.includes('save') || lower.includes('season') || lower.includes('conservation')) return <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes('tariff') || lower.includes('calculate') || lower.includes('rate')) return <Calculator className="w-3.5 h-3.5 text-indigo-400" />;
    if (lower.includes('apply') || lower.includes('connection') || lower.includes('form')) return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    return <HelpCircle className="w-3.5 h-3.5 text-sky-400" />;
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
        
        return (
          <div key={idx} className="flex items-start gap-2 my-1 bg-black/30 border border-white/[0.06] rounded-lg p-2 px-2.5">
            <div className="p-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="text-slate-300 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        );
      }

      if (!trimmed) return <div key={idx} className="h-1" />;

      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
      return (
        <p key={idx} className="text-slate-300 leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  // FAQ Directory
  const faqItems = [
    {
      category: "Contact & Head Office",
      q: "Where is NAWASA's main customer service office located?",
      a: "Our central headquarters is located at **The Carenage, St. George's (P.O. Box 392)**. Customer cashier desks operate Monday through Friday from 8:00 AM to 3:30 PM. Hotlines: **(473) 440-2155** or emergency toll-free **276**."
    },
    {
      category: "Billing & Settlement",
      q: "How can I settle my water bill without visiting a physical office?",
      a: "You can settle online through local banking portals (Grenada Co-operative Bank, Republic Bank, RBTT), authorized SurePay outlets, or direct card payment within this portal."
    },
    {
      category: "Water Outages & Pressure",
      q: "How do I report low water pressure or a broken main in my parish?",
      a: "Click the **Report a Leak** button or select the Advisories tab. In emergency circumstances such as road flooding or trunk main bursts, call the 24/7 emergency dispatch directly at **276**."
    },
    {
      category: "New Water Connections",
      q: "What documentation is required to apply for a new residential water connection?",
      a: "You will need a certified copy of your property deed or land tax receipt, valid national photo ID, approved plumbing diagram from the Ministry of Works, and a connection survey deposit."
    },
    {
      category: "Meters & Conservation",
      q: "How do I read my water meter to verify monthly volume?",
      a: "NAWASA meters display volume in Imperial Gallons or Cubic Meters (m³). Record only the black numbers from left to right to calculate your monthly consumption volume."
    }
  ];

  // Official Forms
  const officialForms: OfficialForm[] = [
    {
      id: 'new-conn',
      title: 'New Water Service Connection',
      description: 'Application for new permanent domestic or commercial water meter connection from distribution line.',
      fee: 'EC$ 150.00 Deposit',
      processingTime: '5-7 Working Days',
      requiredDocs: ['Property Deed / Land Registry', 'Valid National ID', 'Approved Plumbing Plan']
    },
    {
      id: 'meter-test',
      title: 'Meter Accuracy Testing & Calibration',
      description: 'Request official benchmark inspection and flow calibration for suspected high billing or meter inaccuracies.',
      fee: 'EC$ 40.00 Inspection Fee',
      processingTime: '3-4 Working Days',
      requiredDocs: ['Recent Water Bill Receipt', 'Access Authorization']
    },
    {
      id: 'tariff-reclass',
      title: 'Tariff Reclassification Request',
      description: 'Modify utility tariff classification between Domestic, Commercial, or Agricultural rates.',
      fee: 'EC$ 25.00 Admin Fee',
      processingTime: '3 Working Days',
      requiredDocs: ['Business Certificate (if commercial)', 'Parish Assessment']
    },
    {
      id: 'tenancy-change',
      title: 'Change of Tenancy & Account Transfer',
      description: 'Transfer billing liability between landlord and tenant or upon sale of estate.',
      fee: 'EC$ 30.00 Transfer Fee',
      processingTime: '2 Working Days',
      requiredDocs: ['Tenancy Agreement', 'Final Meter Reading', 'Landlord Consent Form']
    }
  ];

  // NAWASA Parish Offices
  const parishOffices = [
    {
      name: "NAWASA Headquarters & Central Cashier",
      parish: "St. George",
      address: "The Carenage, P.O. Box 392, St. George's",
      hours: "Mon - Fri: 8:00 AM - 3:30 PM",
      phone: "(473) 440-2155",
      services: "Full Customer Service, Engineering, Bill Payments"
    },
    {
      name: "Grenville Sub-Office & Cashier",
      parish: "St. Andrew",
      address: "Victoria Street, Grenville, St. Andrew",
      hours: "Mon - Fri: 8:00 AM - 3:00 PM",
      phone: "(473) 442-7277",
      services: "Bill Payments, Leak Reports, Account Inquiries"
    },
    {
      name: "Sauteurs Sub-Station",
      parish: "St. Patrick",
      address: "Main Street, Sauteurs, St. Patrick",
      hours: "Mon - Fri: 8:30 AM - 3:00 PM",
      phone: "(473) 442-9366",
      services: "Cashier Desk, Pipe Repair Coordination"
    },
    {
      name: "Hillsborough Main Office",
      parish: "Carriacou & Petite Martinique",
      address: "Hillsborough, Carriacou",
      hours: "Mon - Fri: 8:00 AM - 3:30 PM",
      phone: "(473) 443-7360",
      services: "Desalination Management, Tank Logistics"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* =========================================================================
          LEFT COLUMN (PRIMARY WORKSPACE - ~70% WIDTH, 8 COLS): 
          CUSTOMER SUPPORT DESK & MULTI-TAB WORKSPACE
          ========================================================================= */}
      <div className="lg:col-span-8 space-y-3">
        
        {/* Core Primary Card Container */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/[0.08] flex flex-col relative">
          
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent z-20" />

          {/* Primary Card Header */}
          <div className="p-3.5 sm:p-4 bg-[#0A0F1D]/90 border-b border-white/[0.07] backdrop-blur-xl flex items-center justify-between gap-3 z-10">
            
            {/* Customer Support Desk Badge */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-inner">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white text-sm sm:text-base tracking-tight">
                    Customer Support Desk
                  </h2>
                  <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>National Water and Sewerage Authority • {persona}</span>
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  speechEnabled
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'glass-input text-slate-400 hover:text-slate-200'
                }`}
                title={speechEnabled ? "Voice Output Active" : "Enable Voice Output"}
              >
                {speechEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <span className="hidden sm:inline text-[11px]">{speechEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>

              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-xl glass-input text-slate-400 hover:text-white hover:border-white/[0.2] transition-colors cursor-pointer group"
                title="Reset Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* INTEGRATED TAB NAVIGATION */}
          <div className="px-3 sm:px-4 py-1.5 bg-[#080C17]/95 border-b border-white/[0.06] overflow-x-auto">
            <nav className="flex items-center gap-1 min-w-max">
              {[
                { id: 'chat', label: 'Support Chat', icon: MessageSquare },
                { id: 'community', label: 'Community Bulletin', icon: Users },
                { id: 'faq', label: 'Help & FAQs', icon: HelpCircle },
                { id: 'forms', label: 'Service Forms', icon: FileText },
                { id: 'territory', label: 'System Grid', icon: Activity },
                { id: 'contact', label: 'Parish Offices', icon: Building2 }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm border border-sky-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* TAB 1: SUPPORT CHAT STREAM */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[490px] bg-black/20 relative">
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                          <Droplet className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="max-w-[88%] sm:max-w-[84%] space-y-1.5">
                        <div
                          className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-sm font-medium shadow-md'
                              : 'glass-card text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          <div className="space-y-0.5">
                            {renderFormattedText(msg.text)}
                          </div>

                          {/* Uploaded attachments preview */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/[0.08]">
                              {msg.attachments.map((att, attIdx) => (
                                <div 
                                  key={attIdx} 
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-black/40 border-white/[0.08] text-slate-300"
                                >
                                  {att.type === 'camera' && <Camera className="w-3 h-3 text-sky-400 shrink-0" />}
                                  {att.type === 'photos' && <Image className="w-3 h-3 text-emerald-400 shrink-0" />}
                                  {att.type === 'drive' && <Cloud className="w-3 h-3 text-amber-400 shrink-0" />}
                                  {att.type === 'files' && <Paperclip className="w-3 h-3 text-purple-400 shrink-0" />}
                                  <span className="truncate max-w-[160px] font-mono">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {msg.sender === 'bot' && (
                            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-xs">
                              {msg.text.toLowerCase().includes('acc-') && (
                                <button
                                  onClick={() => {
                                    const match = msg.text.match(/ACC-\d{6}/i);
                                    onSelectBill(match ? match[0] : 'ACC-849201');
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium text-[11px] transition-all cursor-pointer active:scale-[0.98]"
                                >
                                  <Receipt className="w-3 h-3 text-sky-400" />
                                  <span>Open Account Ledger</span>
                                  <ArrowRight className="w-3 h-3 text-sky-400" />
                                </button>
                              )}

                              {msg.text.toLowerCase().includes('leak') && (
                                <button
                                  onClick={onOpenLeakModal}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-[11px] transition-all cursor-pointer active:scale-[0.98]"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  <span>Submit Leak Report</span>
                                  <ArrowRight className="w-3 h-3 text-amber-400" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Utilities */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                          <span>{msg.timestamp}</span>

                          {msg.sender === 'bot' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyText(msg.id, msg.text)}
                                className="hover:text-slate-300 transition-colors p-0.5 rounded cursor-pointer"
                                title="Copy Text"
                              >
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>

                              <button
                                onClick={() => speakText(msg.text)}
                                className="hover:text-slate-300 transition-colors p-0.5 rounded cursor-pointer"
                                title="Read Aloud"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Quick Reply Chips */}
                        {msg.quickReplies && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {msg.quickReplies.map((reply, rIdx) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSendMessage(reply)}
                                className="px-2.5 py-1 rounded-lg bg-black/35 hover:bg-white/[0.06] border border-white/[0.08] hover:border-sky-500/30 text-slate-300 hover:text-sky-300 text-[11px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
                              >
                                {getQuickReplyIcon(reply)}
                                <span>{reply}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
                      <Droplet className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-xl glass-card text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                      <span>Retrieving information from NAWASA records...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attachments Preview Strip */}
              {attachments.length > 0 && (
                <div className="bg-[#090E1A]/90 border-t border-white/[0.06] p-2 px-3 flex items-center gap-2 overflow-x-auto z-10">
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase">Attached:</span>
                  {attachments.map((att, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 bg-slate-900 border border-white/[0.08] rounded-md px-2 py-0.5 text-xs text-slate-200 shrink-0"
                    >
                      {att.type === 'camera' && <Camera className="w-3 h-3 text-sky-400" />}
                      {att.type === 'photos' && <Image className="w-3 h-3 text-emerald-400" />}
                      {att.type === 'drive' && <Cloud className="w-3 h-3 text-amber-400" />}
                      {att.type === 'files' && <Paperclip className="w-3 h-3 text-purple-400" />}
                      
                      <span className="font-mono text-[10px] max-w-[120px] truncate">{att.name}</span>
                      
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-[#0A0F1D]/80 border-t border-white/[0.06] z-10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 glass-input rounded-xl p-1 px-2.5 transition-colors relative"
                >
                  {/* Plus Attachment Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Attach file or photo"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute bottom-9 left-0 bg-[#0E1528] border border-white/[0.1] rounded-xl shadow-2xl p-1.5 w-52 space-y-1 z-30 text-xs backdrop-blur-xl"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              cameraInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-sky-400" />
                            <span>Capture Meter Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              photoInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Image className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Upload Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              setShowDrivePickerModal(true);
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Cloud className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cloud Documents</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachmentMenu(false);
                              fileInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                            <span>Attach Document</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type an inquiry (e.g. check bill ACC-849201, report leak in Grand Anse)..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none px-1.5 py-1 font-sans"
                  />

                  <button
                    type="submit"
                    disabled={(!input.trim() && attachments.length === 0) || loading}
                    className="p-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all duration-200 cursor-pointer shrink-0 shadow-md active:scale-[0.98]"
                    title="Send Inquiry"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY WATER BULLETIN */}
          {activeTab === 'community' && (
            <div className="p-4 space-y-3 overflow-y-auto h-[490px] bg-black/20">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Parish Community Water Bulletin</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Truck schedules and neighborhood dispatch updates</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={communityParishFilter}
                    onChange={(e) => setCommunityParishFilter(e.target.value)}
                    className="glass-input rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="All Parishes" className="bg-[#0D1424]">All 7 Parishes</option>
                    {GRENADA_PARISHES.map(p => (
                      <option key={p} value={p} className="bg-[#0D1424]">{p}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    Post Update
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {communityPosts
                  .filter(post => communityParishFilter === 'All Parishes' || post.parish.toLowerCase().includes(communityParishFilter.toLowerCase()))
                  .map((post) => (
                    <div key={post.id} className="glass-card rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="font-mono text-sky-400 uppercase font-semibold">{post.parish}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{post.timeAgo}</span>
                          </div>
                          <h4 className="font-semibold text-white text-xs mt-0.5">{post.title}</h4>
                        </div>

                        <button
                          onClick={() => handleToggleUpvote(post.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer ${
                            post.hasUpvoted
                              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                              : 'bg-black/30 border-white/[0.06] text-slate-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{post.upvotes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-[10px] text-slate-400">
                        <span>Source: <strong className="text-slate-300 font-normal">{post.author}</strong></span>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`Inquire about notice: "${post.title}" in ${post.parish}`);
                          }}
                          className="text-sky-400 hover:underline cursor-pointer"
                        >
                          Inquire in Chat →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: FAQ DIRECTORY */}
          {activeTab === 'faq' && (
            <div className="p-4 space-y-2.5 overflow-y-auto h-[490px] bg-black/20">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    placeholder="Search answers (bill, leak, meter, connection)..."
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {faqItems
                  .filter(item => {
                    const matchQuery = !faqSearchQuery || 
                      item.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                      item.a.toLowerCase().includes(faqSearchQuery.toLowerCase());
                    return matchQuery;
                  })
                  .map((item, idx) => {
                    const isOpen = expandedFaqIndex === idx;
                    return (
                      <div key={idx} className="glass-card rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                          className="w-full p-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:text-sky-300 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{item.q}</span>
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">{isOpen ? '▲' : '▼'}</span>
                        </button>

                        {isOpen && (
                          <div className="px-3.5 pb-3 pt-0.5 text-xs text-slate-300 leading-relaxed border-t border-white/[0.06] bg-black/30 space-y-2">
                            <div dangerouslySetInnerHTML={{ __html: item.a.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') }} />
                            <button
                              onClick={() => {
                                setActiveTab('chat');
                                handleSendMessage(`Please provide details regarding: ${item.q}`);
                              }}
                              className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Inquire with Support Desk</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL DIGITAL FORMS */}
          {activeTab === 'forms' && (
            <div className="p-4 space-y-3 overflow-y-auto h-[490px] bg-black/20">
              <div className="border-b border-white/[0.06] pb-2">
                <h3 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>NAWASA Service Application Forms</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {officialForms.map((form) => (
                  <div key={form.id} className="glass-card rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-semibold text-white text-xs">{form.title}</h4>
                        <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">
                          {form.fee}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{form.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedForm(form);
                        setFormSubmitModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-semibold text-xs cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      Fill Online Application
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM GRID */}
          {activeTab === 'territory' && (
            <div className="p-4 space-y-3 overflow-y-auto h-[490px] bg-black/20">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <h3 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Parish Water Pressure & Reservoir Monitoring</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-semibold">
                  98.4% Normal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { name: "St. George South", pressure: "45 PSI Normal", reservoir: "88% Full", status: "Operational" },
                  { name: "St. George Concord", pressure: "48 PSI Optimal", reservoir: "92% Full", status: "Operational" },
                  { name: "St. Andrew Mirabeau", pressure: "42 PSI Normal", reservoir: "85% Full", status: "Operational" },
                  { name: "St. David Ridge", pressure: "38 PSI Normal", reservoir: "80% Full", status: "Operational" },
                  { name: "St. Patrick Peggy's Whim", pressure: "40 PSI Normal", reservoir: "84% Full", status: "Operational" },
                  { name: "St. Mark Victoria", pressure: "46 PSI Normal", reservoir: "90% Full", status: "Operational" },
                  { name: "Carriacou Hillsborough", pressure: "35 PSI Desal", reservoir: "94% Full", status: "Operational" }
                ].map((st, i) => (
                  <div key={i} className="p-3 rounded-xl glass-card space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-white">
                      <span>{st.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                      <div>Pressure: <strong className="text-slate-200">{st.pressure}</strong></div>
                      <div>Storage: <strong className="text-sky-300">{st.reservoir}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT DIRECTORY */}
          {activeTab === 'contact' && (
            <div className="p-4 space-y-2.5 overflow-y-auto h-[490px] bg-black/20">
              <div className="border-b border-white/[0.06] pb-2">
                <h3 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>NAWASA Cashier & Parish Office Directory</span>
                </h3>
              </div>

              <div className="space-y-2">
                {parishOffices.map((off, i) => (
                  <div key={i} className="glass-card rounded-xl p-3 space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold text-white">
                      <span>{off.name}</span>
                      <span className="text-[10px] font-mono text-sky-400 uppercase">{off.parish}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{off.address}</p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
                      <span>Hours: {off.hours}</span>
                      <span className="text-sky-300 font-medium">{off.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* =========================================================================
          RIGHT COLUMN (UTILITY SIDEBAR - ~30% WIDTH, 4 COLS):
          1. TOP: CUSTOMER ACCOUNT MANAGEMENT
          2. MIDDLE: SUPPORT PREFERENCES
          3. BOTTOM: QUICK ACTION SHORTCUTS
          ========================================================================= */}
      <div className="lg:col-span-4 space-y-3 font-sans">
        
        {/* WIDGET 1: CUSTOMER ACCOUNT MANAGEMENT */}
        <div className="glass-card rounded-2xl p-4 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Account Management</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-semibold">
              Verified
            </span>
          </div>

          {/* Quick Account Input */}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={sidebarAccountQuery}
              onChange={(e) => setSidebarAccountQuery(e.target.value)}
              placeholder="ACC-XXXXXX"
              className="flex-1 glass-input rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => handleSidebarLookup(sidebarAccountQuery)}
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              Lookup
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {['ACC-849201', 'ACC-102938', 'ACC-391048'].map((acc) => (
              <button
                key={acc}
                onClick={() => handleSidebarLookup(acc)}
                className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  activeAccount.accountNumber === acc
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                    : 'bg-black/30 text-slate-400 border-white/[0.06] hover:text-white'
                }`}
              >
                {acc}
              </button>
            ))}
          </div>

          {/* Active Account Balance Card */}
          <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{activeAccount.customerName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase font-semibold ${
                activeAccount.status === 'Paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : activeAccount.status === 'Overdue'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {activeAccount.status}
              </span>
            </div>

            <div className="flex justify-between items-baseline font-mono pt-1">
              <span className="text-[11px] text-slate-400">Outstanding Balance:</span>
              <span className="text-base font-bold text-sky-400">EC$ {activeAccount.currentBalance.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Due: {activeAccount.dueDate}</span>
              <span>{activeAccount.parish}</span>
            </div>

            <div className="pt-2 flex gap-1.5 border-t border-white/[0.06]">
              <button
                onClick={() => onSelectBill(activeAccount.accountNumber)}
                className="flex-1 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                <Receipt className="w-3 h-3" />
                <span>View Bill Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* WIDGET 2: SUPPORT PREFERENCES */}
        <div className="glass-card rounded-2xl p-4 space-y-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Support Preferences</h3>
            </div>
            <button
              onClick={handleCopyReferenceCode}
              className="text-[10px] font-mono text-slate-400 hover:text-sky-300 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/[0.06] cursor-pointer"
              title="Copy session reference"
            >
              <span>REF-WES-067</span>
              {copiedRef ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Language Selection */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Language</span>
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="glass-input rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="English" className="bg-[#0D1424]">English</option>
                <option value="Spanish" className="bg-[#0D1424]">Spanish</option>
                <option value="French" className="bg-[#0D1424]">French</option>
                <option value="Patois" className="bg-[#0D1424]">Patois</option>
              </select>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <User className="w-3 h-3 text-sky-400" />
                <span>Customer Type</span>
              </span>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="glass-input rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none cursor-pointer max-w-[160px]"
              >
                <option value="Household Customer" className="bg-[#0D1424]">Household Resident</option>
                <option value="Business / Commercial Customer" className="bg-[#0D1424]">Commercial Account</option>
                <option value="New Connection Applicant" className="bg-[#0D1424]">New Applicant</option>
                <option value="Field Worker" className="bg-[#0D1424]">Field Technician</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="pt-1.5 border-t border-white/[0.06] space-y-1.5">
              <div 
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className="flex items-center justify-between p-2 bg-black/30 border border-white/[0.06] rounded-lg cursor-pointer hover:bg-white/[0.04]"
              >
                <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-sky-400" />
                  <span>Speech output</span>
                </span>
                <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${speechEnabled ? 'bg-sky-500' : 'bg-slate-800'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${speechEnabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div 
                onClick={() => setSimpleLanguage(!simpleLanguage)}
                className="flex items-center justify-between p-2 bg-black/30 border border-white/[0.06] rounded-lg cursor-pointer hover:bg-white/[0.04]"
              >
                <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-teal-400" />
                  <span>Step-by-step guidance</span>
                </span>
                <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${simpleLanguage ? 'bg-teal-500' : 'bg-slate-800'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${simpleLanguage ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Custom API Key Input */}
            <div className="pt-1.5 border-t border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Custom Gemini Key</span>
                </span>
                {apiKeySaved && <span className="text-emerald-400 font-mono text-[10px]">Saved</span>}
              </div>

              <div className="flex gap-1">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="API key (optional)..."
                    className="w-full glass-input rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-2 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-[11px] rounded-lg cursor-pointer font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: SERVICE SHORTCUTS */}
        <div className="glass-card rounded-2xl p-3.5 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Emergency & Service Actions
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={onOpenLeakModal}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Leak</span>
            </button>

            <button
              onClick={() => setIsQuickBillModalOpen(true)}
              className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Receipt className="w-3.5 h-3.5 text-sky-400" />
              <span>Find Account</span>
            </button>

            <button
              onClick={() => setActiveTab('forms')}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Connection</span>
            </button>

            <a
              href="tel:276"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Hotline 276</span>
            </a>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MODALS: QUICK BILL LOOKUP, DRIVE PICKER, FORM SUBMISSION, COMMUNITY POST
          ========================================================================= */}

      {/* MODAL 1: QUICK BILL LOOKUP */}
      <AnimatePresence>
        {isQuickBillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-slate-200 font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <h3 className="font-semibold text-white text-sm">NAWASA Account Lookup</h3>
                </div>
                <button
                  onClick={() => setIsQuickBillModalOpen(false)}
                  className="p-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Enter your Account Number (e.g. <strong className="text-sky-300 font-mono">ACC-849201</strong>) to retrieve current balances.
              </p>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={quickBillInput}
                  onChange={(e) => setQuickBillInput(e.target.value)}
                  placeholder="ACC-XXXXXX"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsQuickBillModalOpen(false);
                      onSelectBill(quickBillInput || 'ACC-849201');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-semibold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Bill</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickBillModalOpen(false);
                      setActiveTab('chat');
                      handleSendMessage(`Check water account ${quickBillInput}`);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium cursor-pointer flex items-center gap-1 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Inquire in Chat</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: GOOGLE DRIVE PICKER */}
      <AnimatePresence>
        {showDrivePickerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-slate-200 font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">Select Document Attachment</h3>
                </div>
                <button
                  onClick={() => setShowDrivePickerModal(false)}
                  className="p-1 rounded-full bg-white/[0.06] text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {[
                  { name: "NAWASA_Water_Bill_Receipt.pdf", size: "1.2 MB" },
                  { name: "Property_Deed_St_George.pdf", size: "3.4 MB" },
                  { name: "Meter_Photo_Grand_Anse.jpg", size: "2.1 MB" }
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectDriveFile(f.name)}
                    className="w-full flex justify-between items-center p-2 rounded-lg bg-black/30 border border-white/[0.06] text-left hover:border-amber-500/40 cursor-pointer"
                  >
                    <span className="text-xs font-mono text-slate-200 truncate">{f.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold shrink-0">Attach</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DIGITAL FORM SUBMISSION */}
      <AnimatePresence>
        {formSubmitModalOpen && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-slate-200 font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <h3 className="font-semibold text-white text-sm">{selectedForm.title}</h3>
                <button onClick={resetFormModal} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!formSubmittedReceipt ? (
                <form onSubmit={handleFormSubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Applicant Name *</label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="Full legal name"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="(473) XXX-XXXX"
                        className="w-full glass-input rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Parish</label>
                      <select
                        value={formParish}
                        onChange={(e) => setFormParish(e.target.value)}
                        className="w-full glass-input rounded-xl px-2 py-1.5 text-white focus:outline-none cursor-pointer"
                      >
                        {GRENADA_PARISHES.map(p => (
                          <option key={p} value={p} className="bg-[#0D1424]">{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Service Address / Lot Number *</label>
                    <input
                      type="text"
                      required
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Lot, Street, Parish"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    {formSubmitting ? 'Submitting Application...' : 'Submit Service Application'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-center py-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">Application Recorded</h4>
                  <p className="text-xs text-slate-400">Your application has been received for technical review.</p>
                  <div className="bg-black/40 p-3 rounded-xl text-left text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tracking Reference:</span>
                      <span className="text-sky-300 font-semibold">{formSubmittedReceipt}</span>
                    </div>
                  </div>
                  <button onClick={resetFormModal} className="w-full py-2 bg-white/[0.06] text-white text-xs rounded-xl cursor-pointer">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: NEW COMMUNITY POST */}
      <AnimatePresence>
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-slate-200 font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <h3 className="font-semibold text-white text-sm">Post Community Water Notice</h3>
                <button onClick={() => setShowNewPostModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunityPost} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Headline *</label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Water truck schedule for Upper Woburn"
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Parish</label>
                    <select
                      value={newPostParish}
                      onChange={(e) => setNewPostParish(e.target.value)}
                      className="w-full glass-input rounded-xl px-2 py-1.5 text-white focus:outline-none cursor-pointer"
                    >
                      {GRENADA_PARISHES.map(p => (
                        <option key={p} value={p} className="bg-[#0D1424]">{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value as any)}
                      className="w-full glass-input rounded-xl px-2 py-1.5 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Notice" className="bg-[#0D1424]">Notice</option>
                      <option value="Truck Schedule" className="bg-[#0D1424]">Truck Schedule</option>
                      <option value="Repairs" className="bg-[#0D1424]">Repairs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Details & Location *</label>
                  <textarea
                    required
                    rows={2}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Provide specific details..."
                    className="w-full glass-input rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Publish Notice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input type="file" ref={cameraInputRef} onChange={(e) => handleFileChange(e, 'camera')} accept="image/*" capture="environment" className="hidden" />
      <input type="file" ref={photoInputRef} onChange={(e) => handleFileChange(e, 'photos')} accept="image/*" className="hidden" />
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'files')} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.xls,.xlsx" className="hidden" />

    </div>
  );
};
