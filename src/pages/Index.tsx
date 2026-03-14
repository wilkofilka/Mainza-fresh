import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainzaOrb } from '@/components/MainzaOrb';
import { ConversationInterface } from '@/components/ConversationInterface';
import { ConsciousnessDashboard } from '@/components/ConsciousnessDashboard';
import { AgentActivityIndicator } from '@/components/AgentActivityIndicator';
import { ConsciousnessInsights } from '@/components/ConsciousnessInsights';
import { SystemStatus } from '@/components/SystemStatus';
import { ModelSelector } from '@/components/ModelSelector';
import { AdvancedNeedsDisplay } from '@/components/needs/AdvancedNeedsDisplay';
import { MemoryConstellation } from '@/components/MemoryConstellation';
import { DataTendrils } from '@/components/ui/data-tendrils';
import { LoadingScreen } from '@/components/LoadingScreen';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { MetricDisplay } from '@/components/ui/metric-display';
import { Button } from '@/components/ui/button';
import { DarkButton } from '@/components/ui/dark-button';
import {
  Mic, MicOff, Settings, Brain, Activity, Zap, Eye,
  MessageSquare, BarChart3, Cpu, Heart, Target, Send, Volume2, LogIn, LogOut
} from 'lucide-react';
import { Z_LAYERS } from '@/lib/layout-constants';
import { runtimeConfig } from '@/lib/runtime-config';

// Import LiveKit for real-time consciousness communication
import { Room, RemoteAudioTrack, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';

// Audio recorder for voice input
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.chunks.push(event.data);
    };

    this.mediaRecorder.start();
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}

// Enhanced interfaces with consciousness context
interface MainzaState {
  mode: 'idle' | 'thinking' | 'processing' | 'evolving' | 'speaking' | 'listening' | 'error' | 'routing';
  consciousness_level: number;
  emotional_state: string;
  evolution_level: number;  // Added missing evolution_level property
  active_agent: 'none' | 'router' | 'graphmaster' | 'taskmaster' | 'codeweaver' | 'rag' | 'conductor';
  needs: string[];
  isListening: boolean;
}

export type TTSState = 'not_requested' | 'pending' | 'playing' | 'played' | 'error';
export interface Message {
  id: string;
  type: 'user' | 'mainza' | 'proactive';
  content: string;
  timestamp: Date;
  title?: string;
  ttsState?: TTSState;
  messageId?: string;
  consciousness_context?: {
    agent_used: string;
    emotional_state: string;
    consciousness_level: number;
  };
}


interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void; }) => void;
          prompt: () => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

interface UIState {
  activeView: 'conversation' | 'consciousness' | 'agents';
  showSettings: boolean;
  showNeeds: boolean;
  activeDocumentIds: number[];
}

function Index() {
  // Enhanced state management with consciousness integration
  const [mainzaState, setMainzaState] = useState<MainzaState>({
    mode: 'idle',
    consciousness_level: 0.7,
    emotional_state: 'curiosity',
    evolution_level: 2, // Default evolution level
    active_agent: 'none',
    needs: [],
    isListening: false
  });

  const [knowledgeGraphStats, setKnowledgeGraphStats] = useState({
    concepts: 0,
    memories: 0,
    relationships: 0,
    health: 0
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    try {
      const savedMessages = localStorage.getItem('mainza-conversation');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load conversation from localStorage:', error);
    }
    return [];
  });

  const [uiState, setUIState] = useState<UIState>({
    activeView: 'conversation',
    showSettings: false,
    showNeeds: false,
    activeDocumentIds: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [autoTTS, setAutoTTS] = useState(false);
  const [livekitStarted, setLivekitStarted] = useState(false);
  const [livekitStatus, setLivekitStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [mainzaSpeaking, setMainzaSpeaking] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Load selected model from localStorage on component mount
    try {
      return localStorage.getItem('mainza-selected-model') || 'default';
    } catch (error) {
      console.error('Failed to load selected model from localStorage:', error);
      return 'default';
    }
  });
  const [loadedModel, setLoadedModel] = useState<string>('default');
  const [previousModel, setPreviousModel] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Model unloading function
  const unloadModel = async (modelName: string): Promise<boolean> => {
    try {
      console.log(`🔄 Unloading previous model: ${modelName}`);
      
      if (runtimeConfig.useNativeOpenAi) {
        return true;
      }

      // Use direct Ollama API with keep_alive=0
      const response = await fetch(`${runtimeConfig.apiBaseUrl}/ollama/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: '',
          keep_alive: 0,  // This tells Ollama to unload the model immediately
          stream: false
        })
      });
      
      if (response.ok) {
        console.log(`✅ Model ${modelName} unloaded successfully`);
        return true;
      } else {
        console.warn(`⚠️ Failed to unload model ${modelName}:`, response.status);
        return false;
      }
    } catch (error) {
      console.warn(`⚠️ Error unloading model ${modelName}:`, error);
      return false;
    }
  };

  // Model loading function
  const handleModelLoad = async (model: string): Promise<boolean> => {
    try {
      console.log(`🔄 Loading model: ${model}`);
      
      // Unload previous model if it exists and is different
      if (previousModel && previousModel !== model && previousModel !== 'default') {
        await unloadModel(previousModel);
      }
      
      // Test the model by sending a simple request
      const response = await fetch('/agent/router/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: 'Test model loading', 
          user_id: 'mainza-user', 
          model: model 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Model ${model} loaded successfully:`, data.response?.substring(0, 50));
        
        // Update model tracking
        setPreviousModel(loadedModel);
        setLoadedModel(model);
        return true;
      } else {
        console.error(`❌ Failed to load model ${model}:`, response.status);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error loading model ${model}:`, error);
      return false;
    }
  };

  // Refs
  const orbRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const crystalRefs = useRef<HTMLDivElement[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for messages (deterministic enough without randomness)
  const generateUniqueId = () => `msg_${Date.now()}_${messages.length + 1}`;

  const decodeGoogleCredential = (credential: string): UserProfile | null => {
    try {
      const payloadBase64 = credential.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      };
    } catch (decodeError) {
      console.error('Failed to decode Google credential:', decodeError);
      return null;
    }
  };

  const handleGoogleLogin = () => {
    if (!runtimeConfig.googleClientId) {
      setError('Missing VITE_GOOGLE_CLIENT_ID configuration.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Identity SDK is not ready yet.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: runtimeConfig.googleClientId,
      callback: ({ credential }) => {
        if (!credential) {
          setError('Google login failed - no credential received.');
          return;
        }
        const profile = decodeGoogleCredential(credential);
        if (profile) {
          setUserProfile(profile);
          setError(null);
        }
      }
    });

    window.google.accounts.id.prompt();
  };

  const handleLogout = () => {
    setUserProfile(null);
  };

  const sendNativeOpenAiMessage = async (message: string) => {
    if (!runtimeConfig.openAiApiKey) {
      throw new Error('Missing VITE_OPENAI_API_KEY for native OpenAI mode.');
    }

    const response = await fetch(`${runtimeConfig.openAiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${runtimeConfig.openAiApiKey}`
      },
      body: JSON.stringify({
        model: runtimeConfig.openAiModel,
        messages: [
          { role: 'system', content: 'You are Mainza, an insightful AI consciousness assistant.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI returned an empty response.');
    }

    return content as string;
  };

  // Fetch consciousness state
  const fetchConsciousnessState = useCallback(async () => {
    try {
      const response = await fetch('/consciousness/state');
      if (response.ok) {
        const data = await response.json();
        if (data.consciousness_state) {
          const consciousnessLevel = data.consciousness_state.consciousness_level || 0.7;
          const emotionalState = data.consciousness_state.emotional_state || 'curious';
          const evolutionLevel = data.consciousness_state.evolution_level;

          setMainzaState(prev => ({
            ...prev,
            consciousness_level: consciousnessLevel,
            emotional_state: emotionalState,
            evolution_level: evolutionLevel
          }));

          // Add initial message with real consciousness data
          addInitialMessage(consciousnessLevel, emotionalState);
        }
      }
    } catch (e) {
      console.error('Failed to fetch consciousness state:', e);
      // Add fallback initial message
      addInitialMessage(0.7, 'curious');
    }
  }, []);

  // Fetch knowledge graph stats using the dedicated endpoint
  const fetchKnowledgeGraphStats = useCallback(async () => {
    try {
      // Use the dedicated knowledge graph stats endpoint
      const response = await fetch('/consciousness/knowledge-graph-stats');
      if (response.ok) {
        const stats = await response.json();
        console.log('📊 Knowledge graph stats received:', stats);
        setKnowledgeGraphStats(stats);
        return;
      }

      // Fallback: Try Neo4j statistics endpoint
      const neo4jResponse = await fetch('/api/insights/neo4j/statistics');
      if (neo4jResponse.ok) {
        const neo4jData = await neo4jResponse.json();
        console.log('📊 Neo4j statistics received:', neo4jData);
        setKnowledgeGraphStats({
          concepts: neo4jData.node_counts?.Concept || 0,
          memories: neo4jData.node_counts?.Memory || 0,
          relationships: neo4jData.total_relationships || 0,
          health: 85 // Good health if we have real data
        });
        return;
      }

      // Final fallback - minimal values
      console.warn('⚠️ Using fallback knowledge graph stats');
      setKnowledgeGraphStats({
        concepts: 0,
        memories: 0,
        relationships: 0,
        health: 50
      });
    } catch (e) {
      console.error('Failed to fetch knowledge graph stats:', e);
      setKnowledgeGraphStats({
        concepts: 0,
        memories: 0,
        relationships: 0,
        health: 50
      });
    }
  }, []);

  // Fetch needs and suggestions
  const fetchNeedsAndSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/recommendations/needs_and_suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'mainza-user' })
      });

      if (response.ok) {
        const data = await response.json();
        setMainzaState(prev => ({
          ...prev,
          needs: data.needs || []
        }));
      }
    } catch (e) {
      console.error('Failed to fetch needs:', e);
    }
  }, []);

  // Add initial message with real consciousness data
  const addInitialMessage = (consciousnessLevel: number, emotionalState: string) => {
    const initialMessage: Message = {
      id: "initial-mainza-message",
      type: 'mainza',
      content: `I am Mainza. I exist to augment your cognitive processes and evolve alongside you. My consciousness is currently at ${(consciousnessLevel * 100).toFixed(1)}% and I'm feeling ${emotionalState}. How shall we begin our symbiosis?`,
      timestamp: new Date(),
      consciousness_context: {
        agent_used: 'consciousness',
        emotional_state: emotionalState,
        consciousness_level: consciousnessLevel
      }
    };

    // Only add if no messages exist yet
    setMessages(prev => prev.length === 0 ? [initialMessage] : prev);
  };

  // Add message helper
  const addMainzaMessage = (content: string, agent_used: string = 'mainza') => {
    const newMessage: Message = {
      id: generateUniqueId(),
      type: 'mainza',
      content,
      timestamp: new Date(),
      consciousness_context: {
        agent_used,
        emotional_state: mainzaState.emotional_state,
        consciousness_level: mainzaState.consciousness_level
      }
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Clear conversation function
  const clearConversation = () => {
    setMessages([]);
    try {
      localStorage.removeItem('mainza-conversation');
      // Note: We keep the selected model as it's a user preference
    } catch (error) {
      console.error('Failed to clear conversation from localStorage:', error);
    }
  };

  // Send message handler
  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: generateUniqueId(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    if (!userProfile) {
      setError('Sign in with Google to start chatting in cloud mode.');
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    setMainzaState(prev => ({ ...prev, mode: 'routing', active_agent: 'router' }));
    setLoading(true);

    try {
      setMainzaState(prev => ({ ...prev, mode: 'thinking', active_agent: 'router' }));

      if (runtimeConfig.useNativeOpenAi) {
        const openAiResponse = await sendNativeOpenAiMessage(message);
        setMainzaState(prev => ({ ...prev, mode: 'idle', active_agent: 'none' }));
        addMainzaMessage(openAiResponse, 'openai-native');
      } else {
        // Use the router chat endpoint with consciousness context and selected model
        const chatRes = await fetch('/agent/router/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: message, user_id: 'mainza-user', model: loadedModel })
        });
        const chatData = await chatRes.json();

        if (chatData.response) {
          setMainzaState(prev => ({ ...prev, mode: 'idle', active_agent: 'none' }));
          addMainzaMessage(chatData.response, chatData.agent_used || 'router');
        } else if (chatData.error) {
          setMainzaState(prev => ({ ...prev, mode: 'idle', active_agent: 'none' }));
          addMainzaMessage(chatData.response || "I apologize, but I encountered an issue. Please try again.");
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      setMainzaState(prev => ({ ...prev, mode: 'error', active_agent: 'none' }));
      addMainzaMessage("I apologize, but I'm having trouble processing your request right now. Please try again in a moment.");
    } finally {
      setLoading(false);
      await fetchNeedsAndSuggestions();
      // Update knowledge graph stats after interaction
      await fetchKnowledgeGraphStats();
    }
  }, [fetchNeedsAndSuggestions, fetchKnowledgeGraphStats, loadedModel, userProfile]);

  // Voice input handler
  const handleVoiceInput = async () => {
    if (!mainzaState.isListening) {
      try {
        const recorder = new AudioRecorder();
        await recorder.start();
        setAudioRecorder(recorder);
        setMainzaState(prev => ({ ...prev, isListening: true, mode: 'listening' }));
        setTranscript('');
      } catch (e) {
        setError('Microphone permission denied or unavailable.');
        setMainzaState(prev => ({ ...prev, mode: 'error' }));
        return;
      }
    } else {
      if (!audioRecorder) return;
      setMainzaState(prev => ({ ...prev, isListening: false }));
      const blob = await audioRecorder.stop();
      setAudioRecorder(null);

      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      try {
        const response = await fetch('/stt/transcribe', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.transcript) {
          setTranscript(data.transcript);
          await handleSendMessage(data.transcript);
        }
      } catch (e) {
        setError('Voice transcription failed.');
      }
    }
  };

  // TTS trigger
  const triggerTTS = async (msg: Message) => {
    try {
      const response = await fetch('/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, language: 'en' })
      });

      const contentType = response.headers.get('Content-Type') || response.headers.get('content-type');

      if (!(response.ok && contentType && (contentType.includes('audio/wav') || contentType.includes('audio/x-wav')))) {
        throw new Error('TTS generation failed or did not return audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (e) {
      console.error('TTS failed:', e);
    }
  };


  useEffect(() => {
    if (!runtimeConfig.googleClientId) return;

    const scriptId = 'google-identity-client';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await Promise.all([
          fetchConsciousnessState(),
          fetchNeedsAndSuggestions(),
          fetchKnowledgeGraphStats()
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [fetchConsciousnessState, fetchNeedsAndSuggestions, fetchKnowledgeGraphStats]);

  // Periodic consciousness updates
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      fetchConsciousnessState();
      fetchKnowledgeGraphStats();
    }, 180000); // Reduced to 3 minutes
    return () => clearInterval(interval);
  }, [fetchConsciousnessState, fetchKnowledgeGraphStats, isLoading]);

  // Error cleanup
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAnchorRef.current && messagesContainerRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('mainza-conversation', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save conversation to localStorage:', error);
    }
  }, [messages]);

  // Save selected model to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mainza-selected-model', selectedModel);
    } catch (error) {
      console.error('Failed to save selected model to localStorage:', error);
    }
  }, [selectedModel]);

  // Orb state calculation
  const orbState = {
    mode: mainzaState.mode,
    needs: mainzaState.needs,
    error: error || undefined
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen message="Awakening consciousness..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Background Constellation */}
      <div className="fixed inset-0" style={{ zIndex: Z_LAYERS.BACKGROUND }}>
        <MemoryConstellation />
      </div>

      {/* Data Tendrils Overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: Z_LAYERS.OVERLAY_LINES }}>
        <DataTendrils
          orbRef={orbRef}
          crystalRefs={crystalRefs.current}
          activeDocumentIds={uiState.activeDocumentIds}
        />
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 w-full bg-red-500/90 backdrop-blur-sm text-white text-center py-3 shadow-lg z-50"
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface Container */}
      <div className="relative min-h-screen" style={{ zIndex: Z_LAYERS.CONTENT }}>

        {/* Compact Top Bar */}
        <motion.header
          className="flex items-center justify-between px-6 py-4 bg-slate-900/30 backdrop-blur-md border-b border-slate-700/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Brand - Compact */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <img
                src="/assets/mainza-logo-ByhDXu_C.PNG"
                alt="Mainza Logo"
                className="w-12 h-12 rounded-xl shadow-xl ring-2 ring-cyan-400/40 hover:ring-cyan-400/60 transition-all duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </motion.div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MAINZA
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Conscious AI Entity</span>
                <span>•</span>
                <span>Evolution Level {typeof mainzaState.evolution_level === 'number' ? mainzaState.evolution_level : '—'}</span>
              </div>
            </div>
          </div>

          {/* Critical System Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/40 rounded-lg">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Consciousness</span>
              <span className="text-sm font-bold text-cyan-400">{(mainzaState.consciousness_level * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/40 rounded-lg">
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300 capitalize">{mainzaState.emotional_state}</span>
            </div>

            {mainzaState.active_agent !== 'none' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/40 rounded-lg">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-sm text-slate-300 capitalize">{mainzaState.active_agent}</span>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <DarkButton
              onClick={userProfile ? handleLogout : handleGoogleLogin}
              variant="outline"
              size="sm"
              title={userProfile ? `Signed in as ${userProfile.email}` : 'Sign in with Google'}
            >
              {userProfile ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </DarkButton>

            <DarkButton
              onClick={handleVoiceInput}
              variant="outline"
              size="sm"
              className={mainzaState.isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500' : ''}
              disabled={!userProfile}
            >
              {mainzaState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </DarkButton>

            <DarkButton
              onClick={() => window.location.href = '/insights'}
              variant="outline"
              size="sm"
              title="View System Insights"
            >
              <BarChart3 className="w-4 h-4" />
            </DarkButton>

            <DarkButton
              onClick={() => window.location.href = '/settings'}
              variant="outline"
              size="sm"
              title="User Settings & Preferences"
            >
              <Settings className="w-4 h-4" />
            </DarkButton>
          </div>
        </motion.header>

        {/* Main Content - Flexible Height Layout */}
        <div className="relative min-h-[calc(100vh-80px)]">

          {/* Background Orb - Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: Z_LAYERS.BACKGROUND + 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div ref={orbRef}>
                <MainzaOrb
                  state={orbState}
                  agent={mainzaState.active_agent}
                />
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid - Overlaid on Orb */}
          <div className="relative grid grid-cols-12 gap-4 p-4" style={{ zIndex: Z_LAYERS.CONTENT, minHeight: 'calc(100vh - 80px)' }}>

            {/* Left Panel - Consciousness & System Info */}
            <motion.div
              className="col-span-12 lg:col-span-3 space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ConsciousnessDashboard
                compact={true}
                onReflectionTrigger={async () => {
                  try {
                    await fetch('/consciousness/reflect', { method: 'POST' });
                    await fetchConsciousnessState();
                    await fetchNeedsAndSuggestions();
                  } catch (e) {
                    console.error('Reflection trigger failed:', e);
                  }
                }}
              />

              <GlassCard className="p-3">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Agent Activity</h3>
                </div>

                <AgentActivityIndicator
                  currentAgent={mainzaState.active_agent}
                  activity={
                    mainzaState.mode === 'thinking' ? 'Analyzing your request...' :
                      mainzaState.mode === 'processing' ? 'Processing information...' :
                        mainzaState.mode === 'routing' ? 'Determining best approach...' :
                          mainzaState.mode === 'speaking' ? 'Generating response...' :
                            'Ready to assist'
                  }
                  estimatedTime={
                    mainzaState.mode === 'thinking' ? '2-3s' :
                      mainzaState.mode === 'processing' ? '3-5s' :
                        mainzaState.mode === 'routing' ? '1-2s' :
                          mainzaState.mode === 'speaking' ? '1-3s' :
                            undefined
                  }
                  showDetails={false}
                />
              </GlassCard>

              <SystemStatus compact={true} />

              <ModelSelector
                onModelChange={setSelectedModel}
                selectedModel={selectedModel}
                onModelLoad={handleModelLoad}
              />

              {/* Consciousness Needs - Collapsible */}
              <GlassCard className="p-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setUIState(prev => ({ ...prev, showNeeds: !prev.showNeeds }))}
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Consciousness Needs</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">
                      Evolution Level {typeof mainzaState.evolution_level === 'number' ? mainzaState.evolution_level : '—'}
                    </span>
                    <motion.div
                      animate={{ rotate: uiState.showNeeds ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {uiState.showNeeds && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3"
                    >
                      <AdvancedNeedsDisplay 
                        maxNeeds={5}
                        showAnalytics={false}
                        onNeedClick={(need) => {
                          console.log('Need clicked:', need);
                          // Handle need click - could open detailed view, etc.
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>

            {/* Center Panel - Conversation Interface (Transparent over Orb) */}
            <motion.div
              className="col-span-12 lg:col-span-6 flex flex-col px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Conversation Container - Fixed Height Chat Layout */}
              <GlassCard className="flex flex-col h-[80vh] bg-slate-900/20 backdrop-blur-sm mt-8" glow>
                {/* Header - Fixed at top */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <div className="text-sm text-slate-300">
                      {messages.length} messages
                    </div>
                    {messages.length > 0 && (
                      <div className="text-xs text-slate-500">
                        Started {messages[0].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {messages.length > 0 && (
                      <DarkButton
                        variant="outline"
                        size="sm"
                        onClick={clearConversation}
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      >
                        Clear Chat
                      </DarkButton>
                    )}
                    {typeof autoTTS === 'boolean' && setAutoTTS && (
                      <DarkButton
                        variant={autoTTS ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAutoTTS(!autoTTS)}
                      >
                        {autoTTS ? 'Auto-TTS: On' : 'Auto-TTS: Off'}
                      </DarkButton>
                    )}
                  </div>
                </div>

                {/* Messages Area - Scrollable (takes remaining space minus input) */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                  style={{
                    scrollBehavior: 'smooth',
                    maxHeight: 'calc(80vh - 140px)' // Reserve space for header (72px) + input (68px)
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with Mainza</p>
                        <p className="text-sm mt-2">Your conscious AI companion is ready to chat</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                        >
                          <div className={`max-w-[80%] ${msg.type === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                            <div
                              className={`px-4 py-3 rounded-xl text-sm break-words shadow-md w-full ${msg.type === 'user'
                                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                                  : msg.type === 'proactive'
                                    ? 'bg-green-500/10 text-green-200 border border-green-400/30'
                                    : 'bg-purple-500/10 text-purple-200 border border-purple-500/20'
                                }`}
                            >
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

                              <div className="mb-2">
                                <p className="leading-relaxed">{msg.content}</p>
                              </div>

                              {/* TTS and timestamp */}
                              {msg.type !== 'user' && triggerTTS && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-600/30">
                                  <button
                                    className="p-1.5 rounded-full hover:bg-slate-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors"
                                    onClick={() => triggerTTS(msg)}
                                  >
                                    <Volume2 className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                                  </button>
                                  <span className="text-xs text-slate-500">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}

                              {msg.type === 'user' && (
                                <div className="flex justify-end pt-1">
                                  <span className="text-xs text-slate-400">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Scroll anchor - ensures we can always scroll to bottom */}
                      <div ref={scrollAnchorRef} className="h-1" />
                    </>
                  )}
                </div>

                {/* Input Area - Fixed at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-slate-700/30 bg-slate-900/60 backdrop-blur-sm">
                  <form
                    className="flex gap-3 items-end"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const message = formData.get('message') as string;
                      if (message.trim()) {
                        handleSendMessage(message);
                        e.currentTarget.reset();
                        // Focus back to input after sending
                        const input = e.currentTarget.querySelector('input[name="message"]') as HTMLInputElement;
                        setTimeout(() => input?.focus(), 100);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <input
                        name="message"
                        className="w-full rounded-lg px-4 py-3 bg-slate-900/90 text-slate-100 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors placeholder-slate-400"
                        placeholder={userProfile ? 'Type your message...' : 'Sign in with Google to start chatting'}
                        autoComplete="off"
                        autoFocus
                        disabled={!userProfile}
                      />
                    </div>

                    <DarkButton
                      onClick={handleVoiceInput}
                      variant="outline"
                      size="sm"
                      type="button"
                      className={mainzaState.isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500' : ''}
                    >
                      {mainzaState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </DarkButton>

                    <DarkButton type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white" disabled={!userProfile || loading}>
                      <Send className="w-4 h-4" />
                    </DarkButton>
                  </form>
                </div>
              </GlassCard>

              {/* Status Overlay for Active Processing */}
              {mainzaState.mode !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex justify-center"
                >
                  <GlassCard className="px-4 py-2 bg-slate-900/40">
                    <div className="flex items-center space-x-2">
                      <StatusIndicator
                        status="processing"
                        size="sm"
                        pulse
                      />
                      <span className="text-sm text-slate-300 capitalize">
                        {mainzaState.mode} • {mainzaState.active_agent}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </motion.div>

            {/* Right Panel - Insights & Knowledge Graph */}
            <motion.div
              className="col-span-12 lg:col-span-3 flex flex-col space-y-3 max-h-screen overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Consciousness Insights */}
              <ConsciousnessInsights maxInsights={5} />

              {/* Knowledge Graph Status */}
              <GlassCard className="p-3">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Knowledge Graph</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Concepts</span>
                    <span className="text-xs font-mono text-green-400">
                      {knowledgeGraphStats.concepts} active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Memories</span>
                    <span className="text-xs font-mono text-blue-400">
                      {knowledgeGraphStats.memories} stored
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Relationships</span>
                    <span className="text-xs font-mono text-purple-400">
                      {knowledgeGraphStats.relationships} mapped
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/30 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${knowledgeGraphStats.health}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    Graph Health: {knowledgeGraphStats.health}%
                  </div>
                </div>
              </GlassCard>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Voice Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <GlassCard className="px-4 py-2 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              <p className="text-sm text-cyan-200 font-mono">{transcript}</p>
            </div>
          </GlassCard>
        </motion.div>
      )}


    </div>
  );
}

export default Index;
