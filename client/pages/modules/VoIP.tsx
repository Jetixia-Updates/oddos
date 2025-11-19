import React, { useState, useEffect, useRef } from "react";
import { Phone, Plus, Search, PhoneCall, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock, Play, Download, Users, TrendingUp, Activity, Settings, Mic, MicOff, Volume2, VolumeX, Pause, X, MessageSquare, Video, Monitor, PhoneForwarded, UserPlus, Voicemail, Grid3x3, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Call {
  _id: string;
  callId: string;
  phoneNumberId: string;
  caller: string;
  receiver: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'ongoing' | 'cancelled' | 'failed';
  startTime: string;
  endTime?: string;
  duration: number;
  recordingUrl?: string;
  notes: string;
  assignedTo?: string;
  callType: 'sales' | 'support' | 'general' | 'emergency';
  tags: string[];
}

interface PhoneNumber {
  _id: string;
  number: string;
  country: string;
  type: 'local' | 'toll-free' | 'mobile';
  assignedTo?: string;
  assignedToName?: string;
  isActive: boolean;
  forwardingEnabled: boolean;
  forwardingNumber?: string;
  voicemailEnabled: boolean;
  department: string;
  purchaseDate: string;
  monthlyCost: number;
}

interface Recording {
  _id: string;
  callId: string;
  caller: string;
  receiver: string;
  recordingUrl: string;
  duration: number;
  date: string;
  fileSize: number;
  transcription?: string;
  tags: string[];
}

interface QueueEntry {
  _id: string;
  callerNumber: string;
  callerName: string;
  phoneNumberId: string;
  waitTime: number;
  priority: 'low' | 'normal' | 'high';
  status: 'waiting' | 'connected' | 'abandoned';
}

interface Analytics {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  avgDuration: number;
  avgWaitTime: number;
  callVolume: Array<{ hour: string; count: number }>;
  callsByType: Record<string, number>;
  callsByStatus: Record<string, number>;
  topCallers: Array<{ number: string; count: number }>;
}

export default function VoIP() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showNumberDialog, setShowNumberDialog] = useState(false);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [viewingRecording, setViewingRecording] = useState<Recording | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Active call state
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [isRinging, setIsRinging] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transferNumber, setTransferNumber] = useState('');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [callForm, setCallForm] = useState<Partial<Call>>({
    callId: '',
    phoneNumberId: '',
    caller: '',
    receiver: '',
    direction: 'outbound',
    status: 'completed',
    startTime: new Date().toISOString(),
    duration: 0,
    notes: '',
    callType: 'general',
    tags: []
  });

  const [numberForm, setNumberForm] = useState<Partial<PhoneNumber>>({
    number: '',
    country: 'US',
    type: 'local',
    assignedTo: '',
    isActive: true,
    forwardingEnabled: false,
    forwardingNumber: '',
    voicemailEnabled: true,
    department: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    monthlyCost: 0
  });

  useEffect(() => { 
    fetchData(); 
    
    // Cleanup on unmount
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);
  
  // Auto-refresh active calls every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCall) {
        // Refresh call data
        fetchData();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeCall]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, pn, rec, q, a, emp] = await Promise.all([
        fetch('/api/voip/calls').then(r => r.json()).catch(() => []),
        fetch('/api/voip/phone-numbers').then(r => r.json()).catch(() => []),
        fetch('/api/voip/recordings').then(r => r.json()).catch(() => []),
        fetch('/api/voip/queue').then(r => r.json()).catch(() => []),
        fetch('/api/voip/analytics').then(r => r.json()).catch(() => null),
        fetch('/api/hr/employees').then(r => r.json()).catch(() => [])
      ]);
      setCalls(Array.isArray(c) ? c : []);
      setPhoneNumbers(Array.isArray(pn) ? pn : []);
      setRecordings(Array.isArray(rec) ? rec : []);
      setQueue(Array.isArray(q) ? q : []);
      setAnalytics(a);
      setEmployees(Array.isArray(emp) ? emp : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const generateCallId = () => {
    return `CALL-${Date.now()}`;
  };

  const handleSaveCall = async () => {
    try {
      if (!editingCall) {
        callForm.callId = generateCallId();
      }
      const url = editingCall ? `/api/voip/calls/${editingCall._id}` : '/api/voip/calls';
      await fetch(url, {
        method: editingCall ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callForm)
      });
      fetchData();
      setShowCallDialog(false);
      resetCallForm();
    } catch (error) {
      console.error('Error saving call:', error);
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!confirm('Delete this call record?')) return;
    try {
      await fetch(`/api/voip/calls/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting call:', error);
    }
  };

  const handleSavePhoneNumber = async () => {
    try {
      const url = editingNumber ? `/api/voip/phone-numbers/${editingNumber._id}` : '/api/voip/phone-numbers';
      await fetch(url, {
        method: editingNumber ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numberForm)
      });
      fetchData();
      setShowNumberDialog(false);
      resetNumberForm();
    } catch (error) {
      console.error('Error saving phone number:', error);
    }
  };

  const handleDeletePhoneNumber = async (id: string) => {
    if (!confirm('Delete this phone number?')) return;
    try {
      await fetch(`/api/voip/phone-numbers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting phone number:', error);
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Delete this recording?')) return;
    try {
      await fetch(`/api/voip/recordings/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const handleDownloadRecording = (url: string) => {
    window.open(url, '_blank');
  };

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Get user media (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;
      
      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle incoming remote stream
      peerConnection.ontrack = (event) => {
        if (remoteStreamRef.current && event.streams[0]) {
          remoteStreamRef.current.srcObject = event.streams[0];
          remoteStreamRef.current.play();
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In production, send this to signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('Microphone access denied or not available');
      return false;
    }
  };

  // Real-time call functions
  const startCall = async (number: string) => {
    try {
      setCallStatus('calling');
      
      // Initialize WebRTC
      const webRTCReady = await initializeWebRTC();
      if (!webRTCReady) {
        setCallStatus('idle');
        return;
      }
      
      const newCall: Partial<Call> = {
        callId: generateCallId(),
        caller: 'Current User',
        receiver: number,
        direction: 'outbound',
        status: 'ongoing',
        startTime: new Date().toISOString(),
        duration: 0,
        callType: 'general',
        notes: '',
        tags: []
      };
      
      const response = await fetch('/api/voip/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCall)
      });
      
      const savedCall = await response.json();
      setActiveCall(savedCall);
      setCallDuration(0);
      setCallStatus('ringing');
      setIsRinging(true);
      
      // Play ringing tone
      const ringTone = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTWK0fPTgjMGHWu98OZZQA0PVKzn77JgGwg+ltryxnUrBSp+zPLaizsIGGS36+mdUQwLUqjk77htGwc4kNXzzn0vBSl+zPDdkUALEl+16+uoVRQKR5/h8sBtIgU2jNDz04IzBhxqvfDnXEEOD1Ot5++yYBoIPZTY88V3LAUofszx3YtACRNfu+vurFkcCkef4PPCcSYGN4vP89SGMwYcab3w52BCC1Sp5O+zYRsIPpLU88h1KwYpf8zw3pJACRRfu+zsrVkcCkaf4vLEcSYGOIvO89SHNAYcZ73w62JEDVCn4+2zYxwIOpPV88l3LQUnfszx3pNACRVgvOzrs1oYCUae4vPEcicGOYzO89SJNQYbZrzv62NFDVCm4+21YxwIOZPW88p5LQYogM3w35RACRVhvezss1wYCEae4vPFdCkGOY3O89SKNgYbZ7vv62NIEFCm4u21ZB0IOZLW88p6LwUnf83x35ZACRZivezstF0YCEae4vPGdioGOY7P89WKOQYZZL3v62NFDk+m4uy2ZRwIOJLV88l6MAUlgM/w3pdBCRVhu+zstWAZB0We4PPHdy0GOIzO89KFOgcZY7zu7GFCE1Cl4uu3ZRsIOpLV88h6LwYmgM/y35dBCRZgu+zsuGEZB0Se4fPIeC4GN4vN89KGOwcZYrzv7WFCE1Cj4Ou3ZBsIN5DU88Z5LwcngM/y3phCChVfu+zruGIaB0Sd4PPJDDGN4vPKeDIHN4rN8tCEOwgYYrvv7WRFEk+i4Oy4ZRsINpDV8sZ6MQYmgM7y3ZdBChVgvOrruWMaBESd3/PLeDIHNYnN8s+DPQgXYrru7GVGEk+i4+23ZhwIN47U8sN8MwYmfs7y3phCChZgvOrsvGQaA0Oc3vPLeDIGNYnN8s+DPggWYLzv7WZHEk6h4+22Zh0IOI3U8sN8NAYlfs7x3ZhCChdhvOvsvWUaA0Kb3vPMeDMGNInM8s6EQAcVX7vu7WdIEk6h4uy2ZxwINI3V8sJ8NAYkfs3y3JhCCxdhvevswGYaBEOa3vPNeTQGM4fM8s2FQQcTXrrv7mlKEU2f4uy3ZxsINYzU8sF8NQUjfs3x25lCCxdiu+vswmgbBEKa3fPOejUGMobM8syCQwcSXbnu7mxLEUyf4+y4aBsINozT8sB8NQUjfc3x2ppDDBdiu+rtw2kcBEGZ3fPPejUFMYbM8suCQwcRXbnu72xMEEyf4+y6aRsIM4rS8r58NgQifMvx2ZtDDBdjvOrtxGocA0CY3PPQejYFMYXL8sqCQwYRXbnt72xNEEuZ4um5aBoIMonR8r5+OAQhfMrx2Jtd');
      ringTone.loop = true;
      ringTone.play();
      
      // Simulate call being answered after 3 seconds
      setTimeout(() => {
        ringTone.pause();
        setIsRinging(false);
        setCallStatus('connected');
        
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 3000);
      
      setDialNumber('');
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
    }
  };

  const endCall = async () => {
    if (!activeCall) return;
    
    try {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Stop remote audio
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = null;
      }
      
      await fetch(`/api/voip/calls/${activeCall._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endTime: new Date().toISOString(),
          duration: callDuration
        })
      });
      
      setActiveCall(null);
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeakerOn(false);
      setIsHolding(false);
      setCallStatus('idle');
      setIsRinging(false);
      fetchData();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Actually mute/unmute the microphone
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    
    // Adjust remote audio volume
    if (remoteStreamRef.current) {
      remoteStreamRef.current.volume = newSpeakerState ? 1.0 : 0.5;
    }
  };

  const toggleHold = () => {
    const newHoldState = !isHolding;
    setIsHolding(newHoldState);
    
    // Disable/enable local audio when on hold
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newHoldState;
      });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // في الإنتاج، سيبدأ/يوقف تسجيل المكالمة الفعلي
    console.log(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const handleTransferCall = async () => {
    if (!activeCall?._id || !transferNumber) return;
    
    try {
      await fetch(`/api/voip/calls/${activeCall._id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferTo: transferNumber })
      });
      
      setShowTransferDialog(false);
      setTransferNumber('');
      endCall();
    } catch (error) {
      console.error('Error transferring call:', error);
    }
  };

  const dialpadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  
  const handleDialpadPress = (number: string) => {
    // إرسال DTMF tones في المكالمة الحقيقية
    console.log('DTMF tone:', number);
    // يمكن استخدام RTCDTMFSender في WebRTC
    if (peerConnectionRef.current) {
      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'audio');
      if (sender && sender.dtmf) {
        sender.dtmf.insertDTMF(number);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetCallForm = () => {
    setCallForm({
      callId: '',
      phoneNumberId: '',
      caller: '',
      receiver: '',
      direction: 'outbound',
      status: 'completed',
      startTime: new Date().toISOString(),
      duration: 0,
      notes: '',
      callType: 'general',
      tags: []
    });
    setEditingCall(null);
  };

  const resetNumberForm = () => {
    setNumberForm({
      number: '',
      country: 'US',
      type: 'local',
      assignedTo: '',
      isActive: true,
      forwardingEnabled: false,
      forwardingNumber: '',
      voicemailEnabled: true,
      department: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      monthlyCost: 0
    });
    setEditingNumber(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-500',
      missed: 'bg-red-500/20 text-red-500',
      ongoing: 'bg-blue-500/20 text-blue-500',
      cancelled: 'bg-gray-500/20 text-gray-500',
      failed: 'bg-orange-500/20 text-orange-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />;
  };

  const getCallTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-blue-500/20 text-blue-500',
      support: 'bg-purple-500/20 text-purple-500',
      general: 'bg-gray-500/20 text-gray-500',
      emergency: 'bg-red-500/20 text-red-500'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !searchTerm || 
      call.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.callId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
    const matchesDirection = filterDirection === 'all' || call.direction === filterDirection;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const filteredNumbers = phoneNumbers.filter(num => {
    const matchesSearch = !searchTerm || 
      num.number.includes(searchTerm) ||
      num.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      num.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredRecordings = recordings.filter(rec => {
    const matchesSearch = !searchTerm || 
      rec.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Active Call Widget */}
      {activeCall && (
        <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-2xl">
          <CardContent className="p-8">
            {/* رأس المكالمة */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <PhoneCall className="w-10 h-10 text-white" />
                  </div>
                  {callStatus === 'ringing' && (
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-500/30 animate-ping" />
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{activeCall.receiver}</h3>
                  <p className="text-2xl text-muted-foreground font-mono">{formatDuration(callDuration)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${callStatus === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {callStatus === 'connected' ? '✓ متصل' : callStatus === 'ringing' ? '🔔 يرن' : '📞 يتصل'}
                    </Badge>
                    {isRecording && (
                      <Badge className="bg-red-500/20 text-red-500 animate-pulse">
                        ● تسجيل
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار التحكم الرئيسية */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  onClick={toggleMute}
                  className="w-16 h-16 rounded-full"
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                <span className="text-xs text-muted-foreground">{isMuted ? 'كتم' : 'ميكروفون'}</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={isSpeakerOn ? "default" : "outline"}
                  size="lg"
                  onClick={toggleSpeaker}
                  className="w-16 h-16 rounded-full"
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>
                <span className="text-xs text-muted-foreground">سماعة</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={isHolding ? "secondary" : "outline"}
                  size="lg"
                  onClick={toggleHold}
                  className="w-16 h-16 rounded-full"
                >
                  <Pause className="w-6 h-6" />
                </Button>
                <span className="text-xs text-muted-foreground">{isHolding ? 'معلق' : 'تعليق'}</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  onClick={toggleRecording}
                  className="w-16 h-16 rounded-full"
                >
                  <Play className="w-6 h-6" />
                </Button>
                <span className="text-xs text-muted-foreground">تسجيل</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <X className="w-6 h-6" />
                </Button>
                <span className="text-xs text-muted-foreground">إنهاء</span>
              </div>
            </div>

            {/* أزرار إضافية */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowDialpad(!showDialpad)}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                لوحة الأرقام
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowTransferDialog(true)}
                className="flex items-center gap-2"
              >
                <PhoneForwarded className="w-4 h-4" />
                تحويل
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                دمج
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCallMenu(!showCallMenu)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                خيارات
              </Button>
            </div>

            {/* لوحة الأرقام */}
            {showDialpad && (
              <Card className="mb-4 bg-white/5">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {dialpadNumbers.map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="lg"
                        onClick={() => handleDialpadPress(num)}
                        className="h-14 text-xl font-bold hover:bg-blue-500/20"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* حالة المكالمة */}
            <div className="flex gap-2 text-sm">
              {isMuted && <Badge variant="secondary" className="bg-red-500/20 text-red-500">● كتم الصوت</Badge>}
              {isSpeakerOn && <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">🔊 سماعة مفعلة</Badge>}
              {isHolding && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">⏸ معلق</Badge>}
              {isRecording && <Badge variant="secondary" className="bg-red-500/20 text-red-500 animate-pulse">● يسجل</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نافذة تحويل المكالمة */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحويل المكالمة</DialogTitle>
            <DialogDescription>
              أدخل الرقم الذي تريد تحويل المكالمة إليه
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                type="tel"
                placeholder="أدخل رقم الهاتف"
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleTransferCall} disabled={!transferNumber}>
              <PhoneForwarded className="w-4 h-4 mr-2" />
              تحويل الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">VoIP System</h1>
            <p className="text-muted-foreground">Manage calls, phone numbers, and recordings</p>
          </div>
          
          {/* Quick Dial */}
          <div className="flex items-center gap-2">
            <Input 
              type="tel" 
              placeholder="Enter phone number" 
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              className="w-48"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && dialNumber) {
                  startCall(dialNumber);
                }
              }}
            />
            <Button 
              onClick={() => dialNumber && startCall(dialNumber)}
              disabled={!dialNumber || !!activeCall}
              className="bg-green-500 hover:bg-green-600"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalCalls || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.completedCalls || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Successful calls</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Missed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{analytics?.missedCalls || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Missed calls</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{formatDuration(analytics?.avgDuration || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Average call time</p>
              </CardContent>
            </Card>
          </div>

          {queue.length > 0 && (
            <Card className="glass border-white/10 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-orange-500">Call Queue</CardTitle>
                </div>
                <CardDescription>Callers waiting to be connected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queue.slice(0, 5).map(entry => (
                    <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                      <div>
                        <p className="font-semibold">{entry.callerName || entry.callerNumber}</p>
                        <p className="text-sm text-muted-foreground">Priority: {entry.priority}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-orange-500/20 text-orange-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(entry.waitTime / 60)}:{(entry.waitTime % 60).toString().padStart(2, '0')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Call Statistics
                </CardTitle>
                <CardDescription>Call breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.callsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          style={{ width: `${((count as number) / (analytics?.totalCalls || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Call Types
                </CardTitle>
                <CardDescription>Distribution by call type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.callsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <Badge className={getCallTypeColor(type)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Call Volume by Hour
              </CardTitle>
              <CardDescription>Hourly call distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.callVolume?.map((stat) => (
                  <div key={stat.hour} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.hour}</span>
                      <span className="text-sm font-bold">{stat.count} calls</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${((stat.count) / Math.max(...(analytics?.callVolume?.map(s => s.count) || [1]))) * 100}%` }}
                      />
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calls Tab */}
        <TabsContent value="calls" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Call History</CardTitle>
                  <CardDescription>View and manage all call records</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetCallForm(); setShowCallDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Call Record
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by caller, receiver, or call ID..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDirection} onValueChange={setFilterDirection}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Directions</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Call ID</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Caller</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Recording</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          Loading calls...
                        </TableCell>
                      </TableRow>
                    ) : filteredCalls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No calls found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCalls.map((call) => (
                        <TableRow key={call._id}>
                          <TableCell className="font-mono text-xs">{call.callId}</TableCell>
                          <TableCell>
                            <Badge className={call.direction === 'inbound' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}>
                              {getDirectionIcon(call.direction)}
                              <span className="ml-1">{call.direction}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{call.caller}</TableCell>
                          <TableCell className="font-semibold">{call.receiver}</TableCell>
                          <TableCell>
                            <Badge className={getCallTypeColor(call.callType)}>{call.callType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(call.status)}>{call.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(call.startTime).toLocaleString()}</TableCell>
                          <TableCell className="font-bold">{formatDuration(call.duration)}</TableCell>
                          <TableCell>
                            {call.recordingUrl ? (
                              <Badge className="bg-purple-500/20 text-purple-500">Available</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { 
                                  setEditingCall(call); 
                                  setCallForm(call); 
                                  setShowCallDialog(true); 
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteCall(call._id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Numbers Tab */}
        <TabsContent value="numbers" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Phone Numbers</CardTitle>
                  <CardDescription>Manage phone numbers and assignments</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetNumberForm(); setShowNumberDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Phone Number
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search phone numbers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNumbers.map(number => {
                  const assignedEmployee = employees.find(e => e._id === number.assignedTo);
                  return (
                    <Card key={number._id} className="glass border-white/10">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-mono">{number.number}</CardTitle>
                            <Badge className={number.type === 'toll-free' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}>
                              {number.type}
                            </Badge>
                          </div>
                          <Badge className={number.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                            {number.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="font-semibold">{assignedEmployee?.name || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-semibold">{number.department || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Forwarding</p>
                            <Badge className={number.forwardingEnabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                              {number.forwardingEnabled ? 'On' : 'Off'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Voicemail</p>
                            <Badge className={number.voicemailEnabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                              {number.voicemailEnabled ? 'On' : 'Off'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Cost</p>
                          <p className="font-bold text-green-500">${number.monthlyCost}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingNumber(number); setNumberForm(number); setShowNumberDialog(true); }}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePhoneNumber(number._id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recordings Tab */}
        <TabsContent value="recordings" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div>
                <CardTitle>Call Recordings</CardTitle>
                <CardDescription>Access and manage call recordings</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search recordings..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Caller</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Transcription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading recordings...
                        </TableCell>
                      </TableRow>
                    ) : filteredRecordings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No recordings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecordings.map((recording) => (
                        <TableRow key={recording._id}>
                          <TableCell>{new Date(recording.date).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">{recording.caller}</TableCell>
                          <TableCell className="font-semibold">{recording.receiver}</TableCell>
                          <TableCell className="font-bold">{formatDuration(recording.duration)}</TableCell>
                          <TableCell>{formatFileSize(recording.fileSize)}</TableCell>
                          <TableCell>
                            {recording.transcription ? (
                              <Badge className="bg-green-500/20 text-green-500">Available</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setViewingRecording(recording);
                                  setShowRecordingDialog(true);
                                }}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownloadRecording(recording.recordingUrl)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteRecording(recording._id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCall ? 'Edit Call Record' : 'New Call Record'}</DialogTitle>
            <DialogDescription>Manage call details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingCall && (
              <div className="space-y-2">
                <Label>Call ID</Label>
                <Input value={callForm.callId} disabled className="font-mono" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Caller *</Label>
                <Input value={callForm.caller} onChange={(e) => setCallForm({...callForm, caller: e.target.value})} placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label>Receiver *</Label>
                <Input value={callForm.receiver} onChange={(e) => setCallForm({...callForm, receiver: e.target.value})} placeholder="+1234567890" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={callForm.direction} onValueChange={(value) => setCallForm({...callForm, direction: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={callForm.status} onValueChange={(value) => setCallForm({...callForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={callForm.callType} onValueChange={(value) => setCallForm({...callForm, callType: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="datetime-local" value={callForm.startTime?.slice(0, 16)} onChange={(e) => setCallForm({...callForm, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input type="number" value={callForm.duration} onChange={(e) => setCallForm({...callForm, duration: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recording URL</Label>
              <Input value={callForm.recordingUrl || ''} onChange={(e) => setCallForm({...callForm, recordingUrl: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={callForm.notes} onChange={(e) => setCallForm({...callForm, notes: e.target.value})} rows={3} placeholder="Call notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCall} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Number Dialog */}
      <Dialog open={showNumberDialog} onOpenChange={setShowNumberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNumber ? 'Edit Phone Number' : 'Add Phone Number'}</DialogTitle>
            <DialogDescription>Configure phone number settings</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input value={numberForm.number} onChange={(e) => setNumberForm({...numberForm, number: e.target.value})} placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={numberForm.type} onValueChange={(value) => setNumberForm({...numberForm, type: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="toll-free">Toll-Free</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={numberForm.assignedTo} onValueChange={(value) => setNumberForm({...numberForm, assignedTo: value})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={numberForm.department} onChange={(e) => setNumberForm({...numberForm, department: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Forwarding Number</Label>
              <Input value={numberForm.forwardingNumber} onChange={(e) => setNumberForm({...numberForm, forwardingNumber: e.target.value})} placeholder="+1234567890" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Cost</Label>
                <Input type="number" value={numberForm.monthlyCost} onChange={(e) => setNumberForm({...numberForm, monthlyCost: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={numberForm.purchaseDate} onChange={(e) => setNumberForm({...numberForm, purchaseDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={numberForm.isActive} onChange={(e) => setNumberForm({...numberForm, isActive: e.target.checked})} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={numberForm.forwardingEnabled} onChange={(e) => setNumberForm({...numberForm, forwardingEnabled: e.target.checked})} />
                <Label>Enable Call Forwarding</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={numberForm.voicemailEnabled} onChange={(e) => setNumberForm({...numberForm, voicemailEnabled: e.target.checked})} />
                <Label>Enable Voicemail</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNumberDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePhoneNumber} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recording View Dialog */}
      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Call Recording</DialogTitle>
            <DialogDescription>
              {viewingRecording?.caller} → {viewingRecording?.receiver}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-bold">{formatDuration(viewingRecording?.duration || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-bold">{viewingRecording && new Date(viewingRecording.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-bold">{formatFileSize(viewingRecording?.fileSize || 0)}</p>
              </div>
            </div>
            {viewingRecording?.recordingUrl && (
              <div className="space-y-2">
                <Label>Audio Player</Label>
                <audio controls className="w-full">
                  <source src={viewingRecording.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {viewingRecording?.transcription && (
              <div className="space-y-2">
                <Label>Transcription</Label>
                <div className="p-4 rounded-lg bg-white/5 max-h-[300px] overflow-y-auto">
                  <p className="text-sm">{viewingRecording.transcription}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordingDialog(false)}>Close</Button>
            <Button onClick={() => viewingRecording && handleDownloadRecording(viewingRecording.recordingUrl)}>
              <Download className="w-4 h-4 mr-2" />Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteStreamRef} autoPlay style={{ display: 'none' }} />
    </div>
  );
}
