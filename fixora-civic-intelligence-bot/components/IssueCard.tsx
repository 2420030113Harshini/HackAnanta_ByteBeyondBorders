
import React, { useState } from 'react';
import { Issue, Priority, Status, User, Comment } from '../types';
import { MapPin, CheckCircle, ShieldCheck, Users, Zap, Map as MapIcon, Send, User as UserIcon, Activity, Lock, Maximize2, X } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  currentUser: User;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onViewMap: (issue: Issue) => void;
  onVerify: (id: string) => void;
  onAddComment?: (issueId: string, comment: Comment) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, currentUser, onResolve, onDelete, onViewMap, onVerify, onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showFullImg, setShowFullImg] = useState(false);
  
  const isCritical = issue.priority === Priority.EMERGENCY || ['Crime', 'Fire', 'Accident'].includes(issue.category);
  const isVerifiedStatus = issue.status === Status.VERIFIED || issue.status === Status.RESOLVED;
  const isOfficial = currentUser.role === 'Admin' || currentUser.role === 'Official';
  const hasVerified = issue.verifications?.includes(currentUser.id);
  const verificationCount = issue.verifications?.length || 0;

  const priorityColors = {
    [Priority.EMERGENCY]: 'bg-black text-white border-rose-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]',
    [Priority.HIGH]: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    [Priority.MEDIUM]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    [Priority.LOW]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, text: commentText, createdAt: new Date().toISOString()
    };
    onAddComment?.(issue.id, newComment);
    setCommentText('');
  };

  return (
    <div className={`group glass-card rounded-3xl border transition-all hover:bg-white/[0.07] flex flex-col relative overflow-hidden 
      ${isCritical ? 'border-black ring-2 ring-black border-4 shadow-[0_0_40px_rgba(0,0,0,0.9)] z-50 cinematic-emergency' : 'border-white/5'} 
      ${issue.status === Status.RESOLVED ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      
      {isCritical && <div className="absolute inset-0 border-4 border-black animate-pulse pointer-events-none z-10"></div>}
      
      {issue.imageUrl && (
        <div className="w-full h-40 overflow-hidden relative cursor-pointer" onClick={() => setShowFullImg(true)}>
          <img src={issue.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="Evidence" />
          <div className="absolute top-4 right-4 p-2 bg-black/40 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={16}/></div>
        </div>
      )}

      <div className="p-6 relative z-20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] uppercase font-black tracking-widest ${isCritical ? 'text-rose-500' : 'text-indigo-400'}`}>{issue.category}</span>
              {issue.aiAnalysis && <span className="flex items-center gap-1 text-[8px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 font-black uppercase"><Zap size={8} /> AI Uplink</span>}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white leading-tight">{issue.title}</h3>
              {isVerifiedStatus && <ShieldCheck size={18} className="text-emerald-400" title="Verified Signal" />}
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 uppercase tracking-wider font-bold"><MapPin size={10} /> {issue.area}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest shrink-0 ${priorityColors[issue.priority]}`}>{issue.priority}</span>
        </div>

        <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed font-light italic">"{issue.description}"</p>

        {issue.aiAnalysis && (
          <div className="mb-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2"><Activity size={12} /> AI Analysis Breakdown</h4>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-white"><span className="text-slate-500 uppercase text-[9px]">Classification:</span> {issue.aiAnalysis.suggestedTitle}</p>
              <p className="text-[10px] text-slate-400 line-clamp-2 italic"><span className="text-slate-500 uppercase text-[9px]">Reasoning:</span> {issue.aiAnalysis.reasoning}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[9px] text-slate-500 uppercase font-black">Urgency:</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${issue.aiAnalysis.severityScore * 10}%` }}></div></div>
                <span className="text-[10px] font-black text-indigo-400">{issue.aiAnalysis.severityScore}/10</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {[...Array(Math.min(verificationCount, 3))].map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0d0221] flex items-center justify-center"><UserIcon size={10} className="text-slate-500" /></div>)}
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{verificationCount} Confirmations</span>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={12} className="text-indigo-400" /> Chatter ({issue.comments.length})</h4>
          <div className="max-h-24 overflow-y-auto custom-scrollbar mb-4 space-y-2">
            {issue.comments.length === 0 ? <p className="text-[9px] text-slate-600 italic">No notes from field nodes.</p> : [...issue.comments].reverse().map((comment) => (
              <div key={comment.id} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-indigo-300 uppercase">{comment.userName}</span></div>
                <p className="text-[10px] text-slate-300">"{comment.text}"</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add note..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl active:scale-95 transition-all"><Send size={14} /></button>
          </form>
        </div>

        <div className="flex gap-2 pt-6 mt-4 border-t border-white/5">
          {isOfficial ? (
            <button onClick={() => onVerify(issue.id)} disabled={hasVerified || issue.status === Status.RESOLVED} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black transition-all border ${hasVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-indigo-500 hover:text-white'}`}>
              {hasVerified ? 'OFFICIALLY LOGGED' : 'VERIFY SIGNAL'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black bg-white/5 text-slate-600 italic border border-white/5"><Lock size={12} /> OFFICIALS ONLY</div>
          )}
          <button onClick={() => onViewMap(issue)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"><MapIcon size={16} /></button>
          {isOfficial && issue.status !== Status.RESOLVED && (
            <button onClick={() => onResolve(issue.id)} className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
          )}
        </div>
      </div>

      {showFullImg && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-10">
          <button onClick={() => setShowFullImg(false)} className="absolute top-10 right-10 p-4 text-white hover:bg-white/10 rounded-full"><X size={32}/></button>
          <img src={issue.imageUrl} className="max-w-full max-h-full object-contain shadow-2xl" alt="Full Evidence" />
        </div>
      )}
    </div>
  );
};

export default IssueCard;
