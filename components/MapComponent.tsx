
import React, { useEffect, useRef, useState } from 'react';
import { Location, Issue, Priority, Status } from '../types';
import { Navigation, X, Maximize2, ZapOff, Target, Clock, User as UserIcon, MessageSquare, Eye } from 'lucide-react';

interface MapComponentProps {
  center?: Location;
  markerPosition?: Location | null;
  issues?: Issue[];
  onLocationSelect?: (location: Location) => void;
  onIssueSelect?: (issue: Issue) => void;
  readonly?: boolean;
  riskView?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  center = { lat: 17.385, lng: 78.4867 }, 
  markerPosition, 
  issues = [],
  onLocationSelect,
  readonly = false,
  riskView = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const heatmap = useRef<any>(null);
  const issueMarkers = useRef<Map<string, any>>(new Map());
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streetViewActive, setStreetViewActive] = useState(false);

  const classesRef = useRef<{ AdvancedMarkerElement: any; PinElement: any; } | null>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) { containerRef.current.requestFullscreen(); setIsFullscreen(true); } 
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const toggleStreetView = () => {
    if (!googleMap.current) return;
    const sv = googleMap.current.getStreetView();
    const active = !sv.getVisible();
    sv.setVisible(active);
    setStreetViewActive(active);
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const getMarkerColor = (issue: Issue) => {
    const isCritical = issue.priority === Priority.EMERGENCY || ['Crime', 'Fire', 'Accident'].includes(issue.category);
    if (issue.status === Status.RESOLVED) return '#10b981';
    if (issue.status === Status.VERIFIED) return '#0ea5e9';
    if (isCritical) return '#000000';
    return '#f43f5e';
  };

  useEffect(() => {
    const initMap = async () => {
      const google = (window as any).google;
      if (!mapRef.current || !google || !google.maps) return;
      try {
        const [{ Map }, { AdvancedMarkerElement, PinElement }, { HeatmapLayer }] = await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
          google.maps.importLibrary("visualization")
        ]);
        classesRef.current = { AdvancedMarkerElement, PinElement };
        googleMap.current = new Map(mapRef.current, {
          center, zoom: 13, mapId: 'FIXORA_ADVANCED_GRID', 
          disableDefaultUI: false, streetViewControl: true, mapTypeControl: false,
          fullscreenControl: false, zoomControl: true,
          styles: [{ "elementType": "geometry", "stylers": [{ "color": "#030014" }] }]
        });
        heatmap.current = new HeatmapLayer({ data: [], map: null, radius: 60, opacity: 0.8 });
        googleMap.current.addListener("click", (e: any) => {
          if (!readonly && onLocationSelect) onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
        renderMarkers();
      } catch (error) { console.error("Map Load Failure", error); }
    };
    initMap();
  }, []);

  const renderMarkers = () => {
    if (!googleMap.current || !classesRef.current) return;
    const { AdvancedMarkerElement, PinElement } = classesRef.current;
    const google = (window as any).google;
    if (riskView) {
      const points = issues.map(i => new google.maps.LatLng(i.location.lat, i.location.lng));
      heatmap.current.setData(points);
      heatmap.current.setMap(googleMap.current);
      issueMarkers.current.forEach(m => (m.map = null));
    } else {
      heatmap.current.setMap(null);
      issueMarkers.current.forEach(m => (m.map = null));
      issueMarkers.current.clear();
      issues.forEach(issue => {
        const isCritical = issue.priority === Priority.EMERGENCY || ['Crime', 'Fire', 'Accident'].includes(issue.category);
        const pin = new PinElement({ background: getMarkerColor(issue), borderColor: isCritical ? "#ff0000" : "#ffffff", scale: isCritical ? 1.4 : 1.0 });
        const m = new AdvancedMarkerElement({ position: issue.location, content: pin.element, title: issue.title, zIndex: isCritical ? 1000 : 1, map: googleMap.current });
        if (isCritical) pin.element.classList.add('emergency-pulse');
        m.addListener('click', () => { setSelectedIssue(issue); googleMap.current.panTo(issue.location); googleMap.current.setZoom(16); });
        issueMarkers.current.set(issue.id, m);
      });
    }
  };

  useEffect(() => { renderMarkers(); }, [issues, riskView]);

  return (
    <div ref={containerRef} className="w-full h-full relative group flex">
      <div ref={mapRef} className="flex-1 h-full" />
      <div className="absolute top-8 left-8 flex flex-col gap-4 z-[110]">
        <button onClick={toggleFullscreen} className="p-4 bg-black/60 backdrop-blur-2xl rounded-3xl text-white border border-white/10 hover:bg-indigo-600 transition-all shadow-2xl"><Maximize2 size={24} /></button>
        <button onClick={toggleStreetView} className={`p-4 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 transition-all shadow-2xl ${streetViewActive ? 'text-indigo-400 border-indigo-500' : 'text-white'}`}><Eye size={24} /></button>
      </div>
      {selectedIssue && (
        <div className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-[#0d0221]/95 backdrop-blur-3xl border-l border-white/10 z-[200] animate-in slide-in-from-right flex flex-col shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">{selectedIssue.category}</span><h2 className="text-3xl font-black text-white leading-none uppercase">{selectedIssue.title}</h2></div>
            <button onClick={() => setSelectedIssue(null)} className="p-4 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={24}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 pb-32">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Context</h4>
              <p className="text-sm text-slate-300 italic leading-relaxed">"{selectedIssue.description}"</p>
              {selectedIssue.imageUrl && <div className="rounded-3xl overflow-hidden border border-white/10"><img src={selectedIssue.imageUrl} className="w-full h-auto" /></div>}
            </section>
            <section className="space-y-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14} className="text-indigo-400"/> Status History</h4>
               <div className="space-y-4 pl-4 border-l border-white/10">
                 {selectedIssue.statusHistory?.map((h, i) => (
                   <div key={i} className="relative">
                     <div className="absolute -left-[1.25rem] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#0d0221]"></div>
                     <span className="text-[10px] font-black text-white block uppercase">{h.status}</span>
                     <span className="text-[9px] text-slate-600">{new Date(h.timestamp).toLocaleString()}</span>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        </div>
      )}
      <button onClick={() => navigator.geolocation.getCurrentPosition(p => { googleMap.current.panTo({lat: p.coords.latitude, lng: p.coords.longitude}); googleMap.current.setZoom(15); })} className="absolute bottom-10 right-10 p-6 bg-indigo-600 text-white rounded-full shadow-xl z-[110]"><Navigation size={24} /></button>
    </div>
  );
};

export default MapComponent;
