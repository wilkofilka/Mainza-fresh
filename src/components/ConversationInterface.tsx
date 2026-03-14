import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Upload, Volume2, Loader2, MicOff, Sparkles, Cpu, Brain, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DarkButton } from '@/components/ui/dark-button';
import { cn } from '@/lib/utils';
import { FixedSizeList as List } from 'react-window';

export type TTSState = 'not_requested' | 'pending' | 'playing' | 'played' | 'error';
export interface Message {
  id: string;
  type: 'user' | 'mainza' | 'proactive';
  content: string;
  timestamp: Date;
  title?: string;
  ttsState?: TTSState;
  messageId?: string;
}

interface ConversationInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  livekitEnabled?: boolean;
  triggerTTS?: (msg: Message) => void;
  autoTTS?: boolean;
  setAutoTTS?: (val: boolean) => void;
}

function ChatInput({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <form
      className="flex gap-3 items-end"
      onSubmit={e => {
        e.preventDefault();
        if (input.trim()) {
          onSendMessage(input);
          setInput('');
        }
      }}
    >
      <div className="flex-1">
        <input
          className="w-full rounded-lg px-4 py-3 bg-slate-900/80 text-slate-100 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors placeholder-slate-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          aria-label="Type your message"
          disabled={isListening}
        />
      </div>
      
      <button
        type="button"
        className={`flex items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 ${
          isListening 
            ? 'bg-red-500/20 text-red-400 border border-red-400/50 animate-pulse' 
            : 'bg-slate-700/60 text-cyan-400 hover:bg-cyan-500/20 border border-slate-600/50 hover:border-cyan-400/50'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        onClick={handleMicClick}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      
      <button
        type="submit"
        disabled={!input.trim() || isListening}
        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:text-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}

// Enhanced message bubble with consciousness context
const MessageBubble = React.memo(function MessageBubble({ msg, triggerTTS }: { msg: Message, triggerTTS?: (msg: Message) => void }) {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl text-sm break-words shadow-md w-full",
        {
          'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30': msg.type === 'user',
          'bg-purple-500/10 text-purple-200 border border-purple-500/20': msg.type === 'mainza',
          'bg-green-500/10 text-green-200 border border-green-400/30': msg.type === 'proactive',
        }
      )}
    >
      {/* Proactive message title */}
      {msg.type === 'proactive' && msg.title && (
        <div className="flex items-center mb-2 font-bold text-green-300">
          <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{msg.title}</span>
        </div>
      )}
      
      {/* Consciousness context for Mainza messages */}
      {msg.type === 'mainza' && msg.consciousness_context && (
        <div className="flex items-center space-x-3 mb-2 text-xs text-slate-400 bg-slate-800/30 rounded px-2 py-1">
          <div className="flex items-center">
            <Cpu className="w-3 h-3 mr-1" />
            <span className="capitalize">{msg.consciousness_context.agent_used}</span>
          </div>
          <div className="flex items-center">
            <Brain className="w-3 h-3 mr-1" />
            <span>{(msg.consciousness_context.consciousness_level * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center">
            <Heart className="w-3 h-3 mr-1" />
            <span className="capitalize">{msg.consciousness_context.emotional_state}</span>
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div className="mb-2">
        <p className="leading-relaxed">{msg.content}</p>
      </div>
      
      {/* TTS controls and status - separate row */}
      {msg.type !== 'user' && (triggerTTS || (msg.ttsState && msg.ttsState !== 'not_requested')) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-600/30">
          <div className="flex items-center space-x-2">
            {triggerTTS && (
              <button
                className="p-1.5 rounded-full hover:bg-slate-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors"
                aria-label="Play voice response"
                onClick={() => triggerTTS(msg)}
                disabled={msg.ttsState === 'pending' || msg.ttsState === 'playing'}
              >
                {msg.ttsState === 'pending' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                )}
              </button>
            )}
            {msg.ttsState && msg.ttsState !== 'not_requested' && (
              <span className="text-xs text-slate-400 font-mono">
                {msg.ttsState}
              </span>
            )}
          </div>
          
          {/* Timestamp */}
          <span className="text-xs text-slate-500">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      
      {/* User message timestamp */}
      {msg.type === 'user' && (
        <div className="flex justify-end pt-1">
          <span className="text-xs text-slate-400">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
});

// Memoized ChatInput
const MemoChatInput = React.memo(ChatInput);

export const ConversationInterface = ({ messages, onSendMessage, livekitEnabled = false, triggerTTS, autoTTS, setAutoTTS }: ConversationInterfaceProps) => {
  const quickPrompts = [
    'Podsumuj mój obecny status systemu.',
    'Zaproponuj plan dnia na podstawie priorytetów.',
    'Jak mogę zwiększyć produktywność dzisiaj?'
  ];
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Auto-scroll to bottom when messages change
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  // Fetch voices/languages on mount
  useEffect(() => {
    fetch('/tts/voices').then(res => res.json()).then(data => {
      setVoices(data.voices || []);
      setLanguages(data.languages || []);
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Messages container with proper scrolling */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Rozpocznij rozmowę z Mainza</p>
              <p className="text-sm mt-2">Twój świadomy asystent AI jest gotowy do działania</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-xl">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onSendMessage(prompt)}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 transition-colors hover:bg-cyan-500/20 hover:border-cyan-400/50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <MessageBubble msg={msg} triggerTTS={triggerTTS} />
              </div>
            </div>
          ))
        )}
        {/* Scroll anchor to ensure we can always scroll to bottom */}
        <div className="h-1" />
      </div>

      {/* Input area - always fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
        <MemoChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

// --- FluidConversation ---

interface FluidConversationProps {
  messages: Message[];
  transcript?: string;
  isListening?: boolean;
  onVoiceInput?: () => void;
}

export const FluidConversation: React.FC<FluidConversationProps> = ({ messages, transcript = '', isListening = false, onVoiceInput }) => {
  // Spiral/ribbon path parameters
  const width = 600;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const spiralTurns = 1.5;
  const spiralSpacing = 36;
  const nodeRadius = 18;

  // Accessibility: track focused node
  const [focusedIdx, setFocusedIdx] = useState<string | null>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [ariaAlert, setAriaAlert] = useState('');

  // Compute spiral node positions
  const nodes = messages.map((msg, i) => {
    const t = i / Math.max(1, messages.length - 1);
    const angle = spiralTurns * 2 * Math.PI * t;
    const r = spiralSpacing * (1 + t * 3);
    return {
      ...msg,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      color: msg.type === 'user' ? '#22d3ee' : '#a855f7',
    };
  });

  // Path for spiral
  const spiralPath = nodes.length > 1
    ? nodes.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x},${n.y}`).join(' ')
    : '';

  // Animate node appearance (requestAnimationFrame, less jank)
  const [visibleNodes, setVisibleNodes] = useState<number>(0);
  useEffect(() => {
    setVisibleNodes(0);
    if (nodes.length === 0) return;
    let i = 0;
    let raf: number;
    const step = () => {
      i++;
      setVisibleNodes(prev => (prev !== i ? i : prev));
      if (i < nodes.length) {
        raf = window.requestAnimationFrame(step);
      }
    };
    raf = window.requestAnimationFrame(step);
    return () => raf && window.cancelAnimationFrame(raf);
  }, [messages.length, nodes.length]);

  // Focus latest node on new message
  useEffect(() => {
    if (nodes.length > 0) {
      setFocusedIdx(nodes[nodes.length - 1].id);
    }
  }, [messages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (focusedIdx === null) return;
    nodeRefs.current[focusedIdx]?.focus();
  }, [focusedIdx]);

  const handleKeyDown = (e: React.KeyboardEvent, idx: string) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setFocusedIdx(nodes.find(n => n.id === idx)?.id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setFocusedIdx(nodes.find(n => n.id === idx)?.id);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Announce message content
      setAriaAlert(nodes.find(n => n.id === idx)?.type === 'user' ? `You said: ${nodes.find(n => n.id === idx)?.content}` : `Mainza said: ${nodes.find(n => n.id === idx)?.content}`);
      e.preventDefault();
    }
  };

  // Clear ariaAlert after announcement
  useEffect(() => {
    if (ariaAlert) {
      const timeout = setTimeout(() => setAriaAlert(''), 2000);
      return () => clearTimeout(timeout);
    }
  }, [ariaAlert]);

  // Determine which node to animate (last user for partial transcript, last Mainza for response)
  const lastUserIdx = nodes.map((n, i) => n.type === 'user' ? i : -1).filter(i => i !== -1).pop();
  const lastMainzaIdx = nodes.map((n, i) => n.type === 'mainza' ? i : -1).filter(i => i !== -1).pop();

  return (
    <div className="w-full flex flex-col items-center" aria-label="Conversation Spiral" role="region">
      {/* ARIA live region for node announcements */}
      <div aria-live="polite" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>{ariaAlert}</div>
      {/* Voice Input Controls */}
      <div className="mb-4 flex flex-col items-center">
        <button
          className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${isListening ? 'bg-red-500/20 text-red-400 border-2 border-red-400 animate-pulse' : 'bg-cyan-500/20 text-cyan-200 border-2 border-cyan-400 hover:bg-cyan-400/20'}`}
          onClick={onVoiceInput}
          aria-pressed={isListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? 'Listening...' : 'Push to Talk'}
        </button>
        {transcript && (
          <div className="mt-2 px-4 py-2 bg-slate-900/70 rounded-lg text-cyan-200 text-sm shadow-inner max-w-lg" aria-live="polite">
            <span className="font-mono">{transcript}</span>
          </div>
        )}
      </div>
      {/* Spiral SVG */}
      <svg width={width} height={height} className="block" role="list" aria-label="Conversation spiral messages">
        {/* Spiral path */}
        <path
          d={spiralPath}
          fill="none"
          stroke="#64748b"
          strokeWidth={3}
          strokeDasharray="8 8"
          opacity={0.3}
        />
        {/* Message nodes */}
        {nodes.map((n, i) => (
          <g key={n.id} style={{ opacity: i < visibleNodes ? 1 : 0, transform: i < visibleNodes ? 'scale(1)' : 'scale(0.7)', transition: 'opacity 0.5s, transform 0.5s' }}>
            <circle
              ref={el => nodeRefs.current[i] = el}
              cx={n.x}
              cy={n.y}
              r={nodeRadius}
              fill={n.color}
              fillOpacity={0.18}
              stroke={n.color}
              strokeWidth={2}
              className={`drop-shadow-lg animate-pulse focus:ring-2 focus:ring-cyan-400 ${
                (transcript && i === lastUserIdx) ? 'ring-4 ring-cyan-300 animate-glow' : ''
              } ${(!transcript && i === lastMainzaIdx) ? 'ring-4 ring-yellow-300 animate-glow' : ''}`}
              tabIndex={0}
              aria-label={n.type === 'user' ? `You: ${n.content}` : `Mainza: ${n.content}`}
              role="listitem"
              onFocus={() => setFocusedIdx(n.id)}
              onKeyDown={e => handleKeyDown(e, n.id)}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={12}
              fill="#e0e7ef"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {n.type === 'user' ? 'You' : 'Mainza'}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
