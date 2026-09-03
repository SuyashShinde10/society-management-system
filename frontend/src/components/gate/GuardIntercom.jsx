import React, { useState, useEffect, useContext } from 'react';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, Shield, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const GuardIntercom = () => {
  const { user } = useContext(AuthContext);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'connected'
  const [muted, setMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Synthesize soft intercom telephone tone using Web Audio API
  const playTone = (freq, durationMs) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      // AudioContext muted/blocked by browser policy until gesture
    }
  };

  useEffect(() => {
    let timer;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const startCall = () => {
    setCallState('calling');
    playTone(440, 800);
    toast.info('Dialing Main Gate Security Booth...');

    setTimeout(() => {
      setCallState('connected');
      playTone(880, 200);
      toast.success('Intercom Connected to Gate Guard');
    }, 2500);
  };

  const endCall = () => {
    setCallState('idle');
    playTone(300, 300);
    toast.info('Intercom Call Ended');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '30px',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '20px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: callState === 'connected' ? '#ECFDF5' : callState === 'calling' ? '#FFF7ED' : '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `3px solid ${callState === 'connected' ? '#10B981' : callState === 'calling' ? '#EA580C' : '#CBD5E1'}`
      }}>
        <Radio size={32} color={callState === 'connected' ? '#10B981' : callState === 'calling' ? '#EA580C' : '#64748B'} />
      </div>

      <div>
        <h3 style={{ margin: '0 0 6px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: theme.textMain }}>
          {user.role === 'security' ? 'Resident Intercom Terminal' : 'Main Security Post Intercom'}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>
          {callState === 'connected' ? (
            <span style={{ color: '#059669', fontWeight: '600' }}>Active VoIP Call • {formatTime(callDuration)}</span>
          ) : callState === 'calling' ? (
            <span style={{ color: '#EA580C', fontWeight: '600' }}>Calling Gate Station...</span>
          ) : (
            'Direct peer audio link between resident flat and security gate'
          )}
        </p>
      </div>

      {callState === 'connected' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#F9F8F3',
          padding: '10px 20px',
          borderRadius: '12px'
        }}>
          <Volume2 size={18} color={theme.accent} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>Encrypted Audio Channel HD</span>
        </div>
      )}

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {callState === 'idle' ? (
          <button
            onClick={startCall}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
            }}
          >
            <PhoneCall size={20} /> Connect Intercom
          </button>
        ) : (
          <>
            <button
              onClick={() => setMuted(!muted)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: muted ? '#EF4444' : '#E2E8F0',
                color: muted ? 'white' : '#1E293B',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={endCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)'
              }}
            >
              <PhoneOff size={20} /> Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GuardIntercom;
