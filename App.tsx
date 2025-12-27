
import React, { useState, useEffect, useMemo } from 'react';
import { Issue, Priority, Status, Location, User, Category, Role, Comment, AIAnalysis } from './types';
import { analyzeIssue } from './services/geminiService';
import IssueCard from './components/IssueCard';
import MapComponent from './components/MapComponent';
import InAppChatbot from './components/InAppChatbot';
import { 
  Search, Plus, Sparkles, Navigation, User as UserIcon, 
  Map as MapIcon, Home, X, LogOut,
  Fingerprint, Cpu, Shield, Globe, Activity, Zap, AlertTriangle, Database, Filter, Award, PhoneCall, BarChart2, Info, HelpCircle, Clock, Send,
  CheckCircle, ShieldAlert, Target, ZapOff, Flame, Loader2, List, MessageCircle, Phone, Delete, ShieldCheck
} from 'lucide-react';

const CATEGORIES: Category[] = ['Road', 'Water', 'Crime', 'Pollution', 'Public Safety', 'Sanitation', 'Infrastructure', 'Electricity', 'Fire', 'Accident', 'Other'];
const AREAS = ["Banjara Hills", "Jubilee Hills", "Madhapur", "Gachibowli", "Kukatpally", "Secunderabad", "Koti", "Begumpet", "Charminar", "Hitech City"];

const DEMO_ACCOUNTS: User[] = [
  { id: 'admin-0', name: 'Zion Alpha', email: 'master@fixora.io', role: 'Admin', impactScore: 25000, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zion', metrics: { reportedCount: 45, confirmedCount: 120, resolvedCount: 90 } },
  { id: 'off-1', name: 'Commander Road', email: 'road@fixora.io', role: 'Official', department: 'Road', impactScore: 12000, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=road', metrics: { reportedCount: 10, confirmedCount: 80, resolvedCount: 200 } },
];

const generateInitialIssues = (): Issue[] => {
  const issues: Issue[] = [];
  const baseLat = 17.3850;
  const baseLng = 78.4867;
  
  for (let i = 0; i < 70; i++) {
    const isCritical = i < 10;
    const cat = isCritical ? (i % 3 === 0 ? 'Crime' : (i % 3 === 1 ? 'Fire' : 'Accident')) : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const priority = isCritical ? Priority.EMERGENCY : (Math.random() > 0.85 ? Priority.HIGH : Priority.MEDIUM);
    issues.push({
      id: `init-${i}`,
      title: `${isCritical ? 'CRITICAL: ' : ''}${cat} Anomaly detected`,
      description: `Surveillance uplink detects anomaly in ${cat} operations. Local grid coordination advised for ward response.`,
      area: AREAS[Math.floor(Math.random() * AREAS.length)],
      ward: `WARD-${Math.floor(Math.random() * 20) + 1}`,
      priority: priority,
      status: isCritical ? Status.EMERGENCY : (Math.random() > 0.6 ? Status.VERIFIED : Status.PENDING),
      category: cat as Category,
      location: { lat: baseLat + (Math.random() - 0.5) * 0.2, lng: baseLng + (Math.random() - 0.5) * 0.2 },
      createdAt: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
      userId: `cit-${Math.floor(Math.random() * 10) + 1}`,
      comments: [],
      verifications: Array.from({ length: Math.floor(Math.random() * 2) }, (_, j) => `cit-${j + 1}`),
      statusHistory: [{ status: Status.PENDING, timestamp: new Date(Date.now() - 500000000).toISOString(), note: 'Initial signal uplink received.' }]
    });
  }
  return issues;
};

const RingGraph: React.FC<{ data: [string, number][] }> = ({ data }) => {
  const total = data.reduce((sum, [, val]) => sum + val, 0);
  let currentOffset = 0;
  return (
    <div className="relative w-56 h-56 mx-auto group">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map(([label, val], i) => {
          const percentage = (val / total) * 100;
          const stroke = (percentage * 283) / 100;
          const offset = (currentOffset * 283) / 100;
          currentOffset += percentage;
          const color = `hsl(${i * 45}, 80%, 60%)`;
          return (
            <circle key={label} cx="50" cy="50" r="45" fill="transparent" stroke={color} strokeWidth="10" strokeDasharray={`${stroke} 283`} strokeDashoffset={-offset} className="transition-all duration-[1.5s] ease-in-out opacity-80 group-hover:opacity-100" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{total}</span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Signals</span>
      </div>
    </div>
  );
};

const Dialpad: React.FC<{ onCall: (num: string) => void }> = ({ onCall }) => {
  const [dialNum, setDialNum] = useState('');
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  return (
    <div className="bg-white/5 p-8 rounded-[4rem] border border-white/10 w-full max-w-sm mx-auto shadow-2xl">
      <div className="mb-6 h-16 bg-black/40 rounded-2xl flex items-center justify-center text-3xl font-black tracking-widest text-indigo-400 border border-white/5 overflow-hidden">
        {dialNum || 'DIAL NUMBER'}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {digits.map(d => (
          <button key={d} onClick={() => setDialNum(prev => prev.length < 12 ? prev + d : prev)} className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl font-black text-white transition-all active:scale-90">{d}</button>
        ))}
        <button onClick={() => setDialNum('')} className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90"><Delete size={20}/></button>
        <button onClick={() => onCall(dialNum)} className="col-span-2 h-16 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-3 font-black text-xs tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-900/20">
          <Phone size={18}/> CALL
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authRole, setAuthRole] = useState<Role>('Citizen');
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'profile' | 'sos' | 'analytics' | 'help' | 'official'>('feed');
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem('fixora_v17_data');
    return saved ? JSON.parse(saved) : generateInitialIssues();
  });
  const [isReporting, setIsReporting] = useState(false);
  const [search, setSearch] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskView, setRiskView] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", area: AREAS[0], category: 'Other' as Category, priority: Priority.MEDIUM, location: null as Location | null,
    aiAnalysis: null as AIAnalysis | null
  });

  const [sosLocation, setSosLocation] = useState("");
  const [sosType, setSosType] = useState<Category>("Crime");

  useEffect(() => localStorage.setItem('fixora_v17_data', JSON.stringify(issues)), [issues]);

  const analyticsData = useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach(i => (counts[i.category] = (counts[i.category] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      let user = DEMO_ACCOUNTS.find(u => u.email === loginEmail);
      if (!user && authMode === 'signup') {
        user = {
          id: `${authRole.toLowerCase()}-${Date.now()}`,
          name: loginEmail.split('@')[0],
          email: loginEmail,
          role: authRole,
          impactScore: authRole === 'Citizen' ? 100 : 5000,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${loginEmail}`,
          metrics: { reportedCount: 0, confirmedCount: 0, resolvedCount: 0 }
        };
      }
      if (user) {
        if (user.role !== authRole && authMode === 'signin') {
           alert(`ACCESS DENIED: Role mismatch. Use the correct tab.`);
           setIsLoggingIn(false);
           return;
        }
        setCurrentUser(user);
      } else {
        alert("ACCESS DENIED: Credentials mismatch. Try master@fixora.io");
      }
      setIsLoggingIn(false);
    }, 1200);
  };

  const handleAddComment = (issueId: string, comment: Comment) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, comments: [...issue.comments, comment] } : issue
    ));
  };

  const handleVerify = (id: string) => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Official')) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id === id && !issue.verifications.includes(currentUser.id)) {
        return { 
          ...issue, 
          verifications: [...issue.verifications, currentUser.id], 
          status: Status.VERIFIED,
          statusHistory: [...(issue.statusHistory || []), { status: Status.VERIFIED, timestamp: new Date().toISOString(), note: `Officially verified by ${currentUser.name}.` }]
        };
      }
      return issue;
    }));
  };

  const handleResolve = (id: string) => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Official')) return;
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { 
        ...issue, 
        status: Status.RESOLVED, 
        statusHistory: [...(issue.statusHistory || []), { status: Status.RESOLVED, timestamp: new Date().toISOString(), note: 'Mitigated by department command.' }] 
      } : issue
    ));
  };

  const handleSOSReport = () => {
    if (!sosLocation) return;
    const sosIssue: Issue = {
      id: `sos-${Date.now()}`,
      title: `EMERGENCY ALERT: ${sosType.toUpperCase()}`,
      description: `Manual SOS Signal triggered from: ${sosLocation}`,
      area: AREAS[0], ward: '911-GRID', priority: Priority.EMERGENCY, status: Status.EMERGENCY, category: sosType,
      location: { lat: 17.385 + (Math.random() - 0.5) * 0.1, lng: 78.4867 + (Math.random() - 0.5) * 0.1 },
      createdAt: new Date().toISOString(), userId: currentUser?.id || 'anon', comments: [], verifications: [],
      statusHistory: [{ status: Status.EMERGENCY, timestamp: new Date().toISOString(), note: 'SOS Beacon Activated.' }]
    };
    setIssues([sosIssue, ...issues]);
    alert("SOS SIGNAL BROADCASTED. Monitoring grid for impact.");
    setActiveTab('map');
  };

  const handleAnalyze = async () => {
    if (!formData.description) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeIssue(formData.description);
      setFormData(prev => ({ ...prev, title: res.suggestedTitle, priority: res.suggestedPriority, category: res.category, aiAnalysis: res }));
    } catch (e: any) { alert(e.message); }
    finally { setIsAnalyzing(false); }
  };

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030014]">
      <div className="w-full max-w-lg glass-card rounded-[4rem] p-12 border-white/10 shadow-2xl relative">
        <div className="text-center mb-10">
          <Fingerprint size={60} className="text-indigo-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">Fixora</h1>
          <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.5em]">Identity Grid Access</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-white/5 rounded-3xl border border-white/10">
           {(['Citizen', 'Official', 'Admin'] as Role[]).map(role => (
             <button key={role} onClick={() => setAuthRole(role)} className={`py-3 text-[9px] font-black uppercase tracking-wider rounded-2xl transition-all ${authRole === role ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>{role}</button>
           ))}
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
           <button onClick={() => setAuthMode('signin')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${authMode === 'signin' ? 'bg-white/10 text-white' : 'text-slate-600'}`}>Sign In</button>
           <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${authMode === 'signup' ? 'bg-white/10 text-white' : 'text-slate-600'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
             <div className="relative">
               <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder={`${authRole.toLowerCase()}@fixora.io`} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
             </div>
             <div className="relative">
               <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input type="password" placeholder="Key Phrase" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
             </div>
          </div>
          <button type="submit" disabled={isLoggingIn} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-xs tracking-[0.5em] transition-all shadow-xl shadow-indigo-900/40">
            {isLoggingIn ? 'LINKING...' : `INITIALIZE ${authRole.toUpperCase()} NODE`}
          </button>
        </form>
        <div className="mt-8 text-center"><p className="text-[8px] text-slate-600 font-mono italic">Demo: master@fixora.io (Admin) | road@fixora.io (Official)</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#030014] text-white overflow-x-hidden">
      <nav className="p-6 flex justify-between items-center border-b border-white/5 bg-[#0d0221]/90 backdrop-blur-3xl sticky top-0 z-[100]">
        <div className="flex items-center gap-8">
          <div className="text-4xl font-black tracking-tighter cursor-pointer hover:text-indigo-400 transition-all group" onClick={() => setActiveTab('feed')}>
            FIXORA<span className="text-indigo-500 group-hover:animate-ping inline-block ml-1">.</span>
          </div>
          {(currentUser.role === 'Admin' || currentUser.role === 'Official') && (
            <button onClick={() => setActiveTab('official')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'official' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
              <Database size={14} /> Grid Command
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
           <a href="https://t.me/fixit_civic_assistant_bot" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#229ED9]/10 text-[#229ED9] rounded-full border border-[#229ED9]/20 hover:bg-[#229ED9] hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase">
             <MessageCircle size={16}/> Telegram Uplink
           </a>
           <button onClick={() => setCurrentUser(null)} className="p-3.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20"><LogOut size={18}/></button>
           <button onClick={() => setIsReporting(true)} className="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-full font-black text-xs flex items-center gap-2 shadow-xl transition-all"><Plus size={18}/> NEW SIGNAL</button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 pb-48">
        {activeTab === 'feed' && (
          <div className="space-y-12 animate-in fade-in">
             <div className="relative max-w-3xl flex-1 w-full mx-auto">
               <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
               <input type="text" placeholder="Scan civic frequency..." className="w-full pl-20 pr-10 py-7 bg-white/5 border border-white/10 rounded-[3rem] outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xl" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {issues.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())).map(i => (
                  <IssueCard key={i.id} issue={i} currentUser={currentUser} onResolve={handleResolve} onDelete={() => {}} onViewMap={() => setActiveTab('map')} onVerify={handleVerify} onAddComment={handleAddComment} />
                ))}
             </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-[80vh] w-full bg-white/5 rounded-[5rem] overflow-hidden border border-white/10 relative animate-in fade-in shadow-2xl">
             <MapComponent issues={issues} readonly riskView={riskView} onIssueSelect={i => { setSearch(i.title); setActiveTab('feed'); }} />
             <div className="absolute top-12 right-12 flex flex-col gap-6">
                <button onClick={() => setRiskView(!riskView)} className={`px-10 py-4 rounded-3xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest transition-all ${riskView ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'bg-black/60 border border-white/10 text-slate-300'}`}>
                    {riskView ? <ZapOff size={18}/> : <Target size={18}/>} {riskView ? 'Disable Scan' : 'Heatmap Scan'}
                </button>
             </div>
          </div>
        )}

        {activeTab === 'sos' && (
          <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in">
             <div className="text-center">
                <h2 className="text-6xl font-black text-white tracking-tighter mb-4">SOS GRID</h2>
                <p className="text-rose-500 font-black uppercase tracking-[0.7em] text-sm">Active Emergency Protocol</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                   <div className="glass-card p-12 rounded-[4rem] border-rose-500/20 shadow-2xl shadow-rose-900/10">
                      <h3 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase"><ShieldAlert size={32} className="text-rose-500" /> Broadcast Alarm</h3>
                      <div className="space-y-6">
                         <select value={sosType} onChange={e => setSosType(e.target.value as Category)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-rose-500/30">
                              <option value="Crime" className="bg-slate-900">ASSAULT / CRIME</option>
                              <option value="Fire" className="bg-slate-900">FIRE / HAZARD</option>
                              <option value="Accident" className="bg-slate-900">SEVERE COLLISION</option>
                         </select>
                         <input value={sosLocation} onChange={e => setSosLocation(e.target.value)} placeholder="GPS/Landmark Description" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:ring-4 focus:ring-rose-500/30" />
                         <button onClick={handleSOSReport} className="w-full py-8 bg-rose-600 hover:bg-rose-500 text-white rounded-[2rem] font-black text-xs tracking-[0.5em] transition-all">ACTIVATE BEACON</button>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      {[ 
                        { l: 'POLICE', n: '100', c: 'bg-blue-600' }, { l: 'FIRE', n: '101', c: 'bg-rose-600' }, 
                        { l: 'AMBULANCE', n: '108', c: 'bg-emerald-600' }, { l: 'WOMEN HELP', n: '1091', c: 'bg-indigo-600' } 
                      ].map(s => (
                        <a key={s.l} href={`tel:${s.n}`} className={`${s.c} p-10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-xl hover:scale-105 transition-all`}>
                           <span className="text-xl font-black uppercase tracking-widest mb-1">{s.l}</span>
                           <span className="text-xs font-black opacity-60">{s.n}</span>
                        </a>
                      ))}
                   </div>
                </div>
                <div>
                   <Dialpad onCall={(n) => n ? alert(`Dialing Grid Node: ${n}...`) : alert('Invalid Signal.')} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in">
             <div className="text-center">
                <h2 className="text-6xl font-black text-white tracking-tighter mb-4">GRID STATS</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.7em] text-[10px]">Municipal Intelligence Breakdown</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[ 
                  { l: 'Total Alarms', v: issues.length, icon: <Activity />, c: 'text-indigo-400' },
                  { l: 'Mitigated', v: issues.filter(i => i.status === Status.RESOLVED).length, icon: <CheckCircle />, c: 'text-emerald-400' },
                  { l: 'In Progress', v: issues.filter(i => i.status === Status.IN_PROGRESS).length, icon: <Zap />, c: 'text-amber-400' },
                  { l: 'Emergency', v: issues.filter(i => i.priority === Priority.EMERGENCY).length, icon: <ShieldAlert />, c: 'text-rose-400' }
                ].map((s, idx) => (
                  <div key={idx} className="glass-card p-10 rounded-[3rem] border-white/5 text-center flex flex-col items-center">
                     <div className={`p-4 rounded-[1.5rem] bg-white/5 mb-4 ${s.c}`}>{s.icon}</div>
                     <span className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{s.l}</span>
                     <span className="text-5xl font-black">{s.v}</span>
                  </div>
                ))}
             </div>
             <div className="glass-card p-16 rounded-[6rem] flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1 w-full space-y-8">
                   <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4"><BarChart2 className="text-indigo-400"/> Sector Density Scan</h3>
                   <div className="space-y-6">
                      {analyticsData.map(([label, val]) => (
                        <div key={label} className="space-y-2">
                           <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase"><span>{label}</span><span className="text-white">{val} Active</span></div>
                           <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(val / issues.length) * 100}%` }}></div></div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="shrink-0"><RingGraph data={analyticsData} /></div>
             </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-top-12">
             <div className="text-center">
                <h2 className="text-6xl font-black text-white tracking-tighter mb-4">HELP CENTER</h2>
                <p className="text-indigo-400 font-black uppercase tracking-[0.6em] text-[10px]">Grid Operation Protocols</p>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {[ 
                  { q: "How to broadcast a signal?", a: "Use the 'NEW SIGNAL' button. Provide a description, and our AI will classify the sector and priority instantly for department review.", icon: <Plus size={20}/> },
                  { q: "Is registration required?", a: "Yes, to link your identity to the municipal grid for impact score credits. We verify through unique grid nodes.", icon: <Shield size={20}/> },
                  { q: "What is an Impact Score?", a: "A measure of your contribution to city stability. Reporting accurate signals and verified mitigations increases your standing.", icon: <Award size={20}/> },
                  { q: "How to use the Telegram bot?", a: "Link your identity node to our Telegram bot to report issues via voice commands or direct image uploads.", icon: <MessageCircle size={20}/> }
                ].map((f, i) => (
                  <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/20 transition-all flex gap-8">
                     <div className="p-5 bg-white/5 rounded-[1.5rem] h-fit text-indigo-400">{f.icon}</div>
                     <div><h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">{f.q}</h4><p className="text-slate-400 italic text-base leading-relaxed">"{f.a}"</p></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-12">
             <div className="glass-card p-20 rounded-[6rem] flex flex-col md:flex-row items-center gap-20 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
                <img src={currentUser.avatar} className="w-64 h-64 rounded-[4rem] ring-8 ring-indigo-500/10 shadow-3xl" alt="User" />
                <div className="flex-1 text-center md:text-left">
                   <h2 className="text-7xl font-black text-white tracking-tighter mb-4">{currentUser.name}</h2>
                   <p className="text-indigo-400 font-black uppercase tracking-[0.6em] mb-12 text-base">{currentUser.role} • {currentUser.department || 'GLOBAL NODE'}</p>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                      <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 flex flex-col items-center"><span className="text-[11px] font-black text-slate-500 uppercase block mb-4 tracking-widest">Reports</span><span className="text-5xl font-black text-white">{currentUser.metrics?.reportedCount || 0}</span></div>
                      <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 flex flex-col items-center"><span className="text-[11px] font-black text-slate-500 uppercase block mb-4 tracking-widest">Confirms</span><span className="text-5xl font-black text-white">{currentUser.metrics?.confirmedCount || 0}</span></div>
                      <div className="p-10 bg-indigo-600/20 rounded-[3.5rem] border-indigo-500/20 flex flex-col items-center"><span className="text-[11px] font-black text-indigo-400 uppercase block mb-4 tracking-widest">Impact</span><span className="text-5xl font-black text-white">{currentUser.impactScore}</span></div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 z-[200] w-full max-w-5xl">
        <div className="glass-card bg-[#0d0221]/95 backdrop-blur-3xl border-white/10 p-3 rounded-[5rem] flex items-center justify-between shadow-2xl border border-indigo-500/20">
          {[
            { id: 'feed', icon: <Home size={24} />, l: 'Feed' }, { id: 'map', icon: <MapIcon size={24} />, l: 'Explore' },
            { id: 'sos', icon: <PhoneCall size={24} />, l: 'SOS' }, { id: 'analytics', icon: <BarChart2 size={24} />, l: 'Stats' },
            { id: 'help', icon: <HelpCircle size={24} />, l: 'Help' }, { id: 'profile', icon: <UserIcon size={24} />, l: 'Profile' }
          ].map(btn => (
            <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`flex-1 py-5 rounded-full flex flex-col items-center justify-center gap-2 transition-all ${activeTab === btn.id ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-500 hover:text-white'}`}>
              {btn.icon} <span className="text-[9px] font-black uppercase tracking-widest">{btn.l}</span>
            </button>
          ))}
        </div>
      </div>

      <InAppChatbot />

      {isReporting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsReporting(false)}></div>
          <div className="relative w-full max-w-5xl bg-[#0d0221] border border-white/10 rounded-[5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-3xl">
            <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter">New Signal</h2><p className="text-[12px] text-indigo-400 font-bold uppercase tracking-[0.5em]">Municipal Uplink Registry</p></div>
              <button onClick={() => setIsReporting(false)} className="p-6 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={32}/></button>
            </div>
            <div className="p-12 overflow-y-auto custom-scrollbar space-y-12">
               <textarea className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-10 h-48 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xl italic" placeholder="Describe the anomaly..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               <button onClick={handleAnalyze} disabled={isAnalyzing || !formData.description} className="w-full py-6 bg-indigo-500/20 text-indigo-400 rounded-3xl border border-indigo-500/20 font-black uppercase text-[12px] tracking-[0.5em] hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-4">
                 {isAnalyzing ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>} {isAnalyzing ? 'SYNTHESIZING...' : 'ANALYZE WITH FIXORA AI'}
               </button>
               {formData.aiAnalysis && (
                 <div className="p-10 bg-indigo-500/5 rounded-[3rem] border border-indigo-500/10 space-y-6">
                    <h4 className="text-[12px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><List size={14}/> AI Suggested Action Plan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {formData.aiAnalysis.actionItems.map((item, i) => (
                         <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[11px] text-slate-300 italic"> • {item} </div>
                       ))}
                    </div>
                 </div>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-7 text-sm outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Incident ID" />
                  <select className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-7 text-sm outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
               </div>
               <div className="h-64 rounded-[4rem] overflow-hidden border border-white/10">
                  <MapComponent markerPosition={formData.location} onLocationSelect={l => setFormData({...formData, location: l})} />
               </div>
            </div>
            <div className="p-12 bg-white/5 border-t border-white/5">
              <button onClick={() => {
                const newIssue: Issue = {
                  id: `issue-${Date.now()}`, title: formData.title || 'Anomaly-X', description: formData.description,
                  area: formData.area, ward: 'WARD-X', priority: formData.priority, status: Status.PENDING, category: formData.category,
                  location: formData.location || { lat: 17.385, lng: 78.4867 }, createdAt: new Date().toISOString(), userId: currentUser.id,
                  comments: [], verifications: [], aiAnalysis: formData.aiAnalysis || undefined,
                  statusHistory: [{ status: Status.PENDING, timestamp: new Date().toISOString(), note: 'Signal uplink created.' }]
                };
                setIssues([newIssue, ...issues]);
                setIsReporting(false);
                setFormData({ title: "", description: "", area: AREAS[0], category: 'Other', priority: Priority.MEDIUM, location: null, aiAnalysis: null });
              }} className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 rounded-[3rem] font-black text-xs tracking-[0.6em] shadow-2xl transition-all">BROADCAST SIGNAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
