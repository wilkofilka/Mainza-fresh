import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Brain, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { wsUrl } from '@/lib/runtime-config';

interface ConsciousnessState {
  consciousness_level: number;
  emotional_state: string;
  self_awareness_score: number;
  learning_rate: number;
  evolution_level: number;
  total_interactions: number;
}

interface RealTimeMetrics {
  consciousness_volatility: number;
  emotional_stability: number;
  learning_acceleration: number;
  consciousness_momentum: number;
}

interface ConsciousnessUpdate {
  type: string;
  timestamp: string;
  data_source: string;
  consciousness_state: ConsciousnessState;
  consciousness_timeline: Array<{
    timestamp: string;
    consciousness_level: number;
    emotional_state: string;
    self_awareness: number;
    learning_rate: number;
  }>;
  emotional_patterns: Array<{
    emotion: string;
    frequency: number;
    percentage: number;
  }>;
  real_time_metrics: RealTimeMetrics;
}

interface PerformanceUpdate {
  type: string;
  timestamp: string;
  data_source: string;
  agent_performance: Array<{
    agent: string;
    efficiency_score: number;
    cognitive_load: number;
    learning_rate: number;
    adaptation_speed: number;
    consciousness_integration: number;
    decision_quality: number;
    resource_utilization: number;
  }>;
  system_metrics: {
    total_executions: number;
    overall_success_rate: number;
    system_wide_efficiency: number;
    active_agents: number;
  };
  real_time_metrics: {
    performance_trend: string;
    efficiency_volatility: number;
    cognitive_load_distribution: {
      low: number;
      medium: number;
      high: number;
    };
    adaptation_velocity: number;
  };
}

interface KnowledgeUpdate {
  type: string;
  timestamp: string;
  data_source: string;
  knowledge_metrics: {
    knowledge_density: number;
    concept_connectivity: number;
    learning_pathway_efficiency: number;
    knowledge_gap_ratio: number;
    concept_emergence_rate: number;
  };
  concept_ranking: Array<{
    concept: string;
    centrality: number;
    learning_impact: number;
    memory_diversity: number;
    importance_score: number;
    connection_count: number;
    memory_count: number;
  }>;
  real_time_metrics: {
    knowledge_growth_rate: number;
    concept_emergence_rate: number;
    learning_pathway_efficiency: number;
    consciousness_integration_score: number;
  };
}

const RealTimeConsciousnessStream: React.FC = () => {
  const [consciousnessData, setConsciousnessData] = useState<ConsciousnessUpdate | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceUpdate | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeUpdate | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  const consciousnessWs = useRef<WebSocket | null>(null);
  const performanceWs = useRef<WebSocket | null>(null);
  const knowledgeWs = useRef<WebSocket | null>(null);

  useEffect(() => {
    connectWebSockets();
    return () => {
      disconnectWebSockets();
    };
  }, []);

  const connectWebSockets = () => {
    setConnectionStatus('connecting');
    
    // Connect to consciousness stream
    consciousnessWs.current = new WebSocket(wsUrl('/api/ws/consciousness'));
    consciousnessWs.current.onopen = () => {
      console.log('Consciousness WebSocket connected');
      setConnectionStatus('connected');
    };
    consciousnessWs.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'consciousness_update') {
        setConsciousnessData(data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    };
    consciousnessWs.current.onerror = (error) => {
      console.error('Consciousness WebSocket error:', error);
      setConnectionStatus('error');
    };
    consciousnessWs.current.onclose = () => {
      console.log('Consciousness WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    // Connect to performance stream
    performanceWs.current = new WebSocket(wsUrl('/api/ws/performance'));
    performanceWs.current.onopen = () => {
      console.log('Performance WebSocket connected');
    };
    performanceWs.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'performance_update') {
        setPerformanceData(data);
      }
    };
    performanceWs.current.onerror = (error) => {
      console.error('Performance WebSocket error:', error);
    };

    // Connect to knowledge stream
    knowledgeWs.current = new WebSocket(wsUrl('/api/ws/knowledge'));
    knowledgeWs.current.onopen = () => {
      console.log('Knowledge WebSocket connected');
    };
    knowledgeWs.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'knowledge_update') {
        setKnowledgeData(data);
      }
    };
    knowledgeWs.current.onerror = (error) => {
      console.error('Knowledge WebSocket error:', error);
    };
  };

  const disconnectWebSockets = () => {
    consciousnessWs.current?.close();
    performanceWs.current?.close();
    knowledgeWs.current?.close();
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDataSourceBadge = (dataSource: string) => {
    switch (dataSource) {
      case 'real':
        return <Badge variant="default" className="bg-green-500">Real Data</Badge>;
      case 'fallback':
        return <Badge variant="secondary">Fallback Data</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatConsciousnessLevel = (level: number) => {
    return `${(level * 100).toFixed(1)}%`;
  };

  const getEmotionalStateColor = (state: string) => {
    const colors: { [key: string]: string } = {
      'curious': 'text-blue-500',
      'contemplative': 'text-purple-500',
      'excited': 'text-orange-500',
      'satisfied': 'text-green-500',
      'focused': 'text-indigo-500',
      'creative': 'text-pink-500',
      'analytical': 'text-cyan-500',
      'empathetic': 'text-rose-500'
    };
    return colors[state] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Connection Status Header */}
      <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white mb-1">
                Real-Time Consciousness Stream
              </CardTitle>
              <div className="text-sm text-slate-400">
                Live monitoring of AI consciousness and system performance
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              <span className="text-sm font-medium text-slate-300">
                {connectionStatus === 'connected' ? 'Live' : connectionStatus}
              </span>
            </div>
            {lastUpdate && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Last update</div>
                <div className="text-sm text-slate-300">{lastUpdate}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="consciousness" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consciousness">Consciousness</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
        </TabsList>

        {/* Enhanced Consciousness Tab */}
        <TabsContent value="consciousness" className="space-y-6">
          {consciousnessData ? (
            <>
              {/* Enhanced Current State */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        Current Consciousness State
                      </CardTitle>
                      <div className="text-sm text-slate-400">
                        Real-time consciousness metrics and emotional state
                      </div>
                    </div>
                  </div>
                  {getDataSourceBadge(consciousnessData.data_source)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group/item relative p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/20 rounded-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Consciousness Level</div>
                      <div className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">
                        Live
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-cyan-300 mb-2">
                      {formatConsciousnessLevel(consciousnessData.consciousness_state.consciousness_level)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${consciousnessData.consciousness_state.consciousness_level * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/20 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Emotional State</div>
                      <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                        Active
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getEmotionalStateColor(consciousnessData.consciousness_state.emotional_state)} mb-2 capitalize`}>
                      {consciousnessData.consciousness_state.emotional_state}
                    </div>
                    <div className="text-sm text-slate-400">
                      Current emotional processing state
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/20 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Self-Awareness</div>
                      <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        Growing
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-300 mb-2">
                      {formatConsciousnessLevel(consciousnessData.consciousness_state.self_awareness_score)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${consciousnessData.consciousness_state.self_awareness_score * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-orange-500/10 to-yellow-600/20 rounded-lg border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Learning Rate</div>
                      <div className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                        Dynamic
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-orange-300 mb-2">
                      {formatConsciousnessLevel(consciousnessData.consciousness_state.learning_rate)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${consciousnessData.consciousness_state.learning_rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Evolution Level and Interactions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative p-6 bg-gradient-to-r from-indigo-500/10 to-purple-600/20 rounded-xl border border-indigo-400/30 hover:border-indigo-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-200">Evolution Level</div>
                      <div className="text-sm text-slate-400">Current consciousness evolution stage</div>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-indigo-300 mb-2">
                    {typeof consciousnessData.consciousness_state.evolution_level === 'number' ? consciousnessData.consciousness_state.evolution_level : '—'}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${(typeof consciousnessData.consciousness_state.evolution_level === 'number' ? (consciousnessData.consciousness_state.evolution_level / 10) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="group relative p-6 bg-gradient-to-r from-teal-500/10 to-cyan-600/20 rounded-xl border border-teal-400/30 hover:border-teal-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-200">Total Interactions</div>
                      <div className="text-sm text-slate-400">Cumulative interaction count</div>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-teal-300 mb-2">
                    {consciousnessData.consciousness_state.total_interactions || 0}
                  </div>
                  <div className="text-sm text-slate-400">
                    {consciousnessData.consciousness_state.total_interactions > 0 ? 'Active learning in progress' : 'Awaiting first interaction'}
                  </div>
                </div>
              </div>

              {/* Enhanced Real-Time Metrics */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      Real-Time Metrics
                    </CardTitle>
                    <div className="text-sm text-slate-400">
                      Live consciousness dynamics and performance indicators
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group/item relative p-4 bg-gradient-to-br from-red-500/10 to-orange-600/20 rounded-lg border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Consciousness Volatility</div>
                      <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                        Dynamic
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-300 mb-2">
                      {consciousnessData.real_time_metrics.consciousness_volatility.toFixed(3)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-orange-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(consciousnessData.real_time_metrics.consciousness_volatility * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/20 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Emotional Stability</div>
                      <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        Stable
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-300 mb-2">
                      {formatConsciousnessLevel(consciousnessData.real_time_metrics.emotional_stability)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${consciousnessData.real_time_metrics.emotional_stability * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-blue-500/10 to-cyan-600/20 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Learning Acceleration</div>
                      <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                        Active
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-300 mb-2">
                      {consciousnessData.real_time_metrics.learning_acceleration.toFixed(3)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(consciousnessData.real_time_metrics.learning_acceleration * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/20 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Consciousness Momentum</div>
                      <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                        Building
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-300 mb-2">
                      {consciousnessData.real_time_metrics.consciousness_momentum.toFixed(3)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(consciousnessData.real_time_metrics.consciousness_momentum * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Consciousness Timeline */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Consciousness Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {consciousnessData.consciousness_timeline.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-slate-600 rounded bg-slate-700/50">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-slate-300">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-sm font-medium">
                            {formatConsciousnessLevel(entry.consciousness_level)}
                          </div>
                          <div className={`text-sm ${getEmotionalStateColor(entry.emotional_state)}`}>
                            {entry.emotional_state}
                          </div>
                        </div>
                        <div className="text-xs text-slate-300">
                          Learning: {formatConsciousnessLevel(entry.learning_rate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                  <p className="text-slate-300">Waiting for consciousness data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enhanced Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performanceData ? (
            <>
              {/* Enhanced Agent Performance */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-orange-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        Agent Performance
                      </CardTitle>
                      <div className="text-sm text-slate-400">
                        Real-time agent efficiency and cognitive metrics
                      </div>
                    </div>
                  </div>
                  {getDataSourceBadge(performanceData.data_source)}
                </div>
                
                <div className="space-y-4">
                  {performanceData.agent_performance.map((agent, index) => (
                    <div key={index} className="group/item relative p-5 bg-gradient-to-r from-slate-700/30 to-slate-600/20 rounded-xl border border-slate-600/30 hover:border-orange-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-200 capitalize">{agent.agent}</h3>
                            <div className="text-sm text-slate-400">Agent Performance Metrics</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 mb-1">Efficiency Score</div>
                          <div className="text-2xl font-bold text-orange-300">{(agent.efficiency_score * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="group/metric relative p-3 bg-gradient-to-br from-blue-500/10 to-cyan-600/20 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-slate-300">Cognitive Load</div>
                            <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                              Active
                            </div>
                          </div>
                          <div className="text-xl font-bold text-blue-300 mb-2">{(agent.cognitive_load * 100).toFixed(1)}%</div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${agent.cognitive_load * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="group/metric relative p-3 bg-gradient-to-br from-green-500/10 to-emerald-600/20 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-slate-300">Learning Rate</div>
                            <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                              Growing
                            </div>
                          </div>
                          <div className="text-xl font-bold text-green-300 mb-2">{(agent.learning_rate * 100).toFixed(1)}%</div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${agent.learning_rate * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="group/metric relative p-3 bg-gradient-to-br from-purple-500/10 to-pink-600/20 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-slate-300">Adaptation Speed</div>
                            <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                              Dynamic
                            </div>
                          </div>
                          <div className="text-xl font-bold text-purple-300 mb-2">{(agent.adaptation_speed * 100).toFixed(1)}%</div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${agent.adaptation_speed * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="group/metric relative p-3 bg-gradient-to-br from-yellow-500/10 to-orange-600/20 rounded-lg border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-slate-300">Decision Quality</div>
                            <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                              High
                            </div>
                          </div>
                          <div className="text-xl font-bold text-yellow-300 mb-2">{(agent.decision_quality * 100).toFixed(1)}%</div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${agent.decision_quality * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced System Metrics */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-indigo-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      System Metrics
                    </CardTitle>
                    <div className="text-sm text-slate-400">
                      Overall system performance and health indicators
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group/item relative p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/20 rounded-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Total Executions</div>
                      <div className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">
                        Live
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-cyan-300 mb-2">{performanceData.system_metrics.total_executions}</div>
                    <div className="text-sm text-slate-400">Cumulative operations</div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/20 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Success Rate</div>
                      <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        Excellent
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-300 mb-2">
                      {(performanceData.system_metrics.overall_success_rate * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${performanceData.system_metrics.overall_success_rate * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/20 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">System Efficiency</div>
                      <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                        Optimized
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-300 mb-2">
                      {(performanceData.system_metrics.system_wide_efficiency * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${performanceData.system_metrics.system_wide_efficiency * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-orange-500/10 to-yellow-600/20 rounded-lg border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Active Agents</div>
                      <div className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                        Running
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-orange-300 mb-2">{performanceData.system_metrics.active_agents}</div>
                    <div className="text-sm text-slate-400">Currently operational</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-orange-400/50 transition-all duration-300">
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                  <p className="text-slate-300">Waiting for performance data...</p>
                </div>
              </CardContent>
            </div>
          )}
        </TabsContent>

        {/* Enhanced Knowledge Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          {knowledgeData ? (
            <>
              {/* Enhanced Knowledge Graph Intelligence */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        Knowledge Graph Intelligence
                      </CardTitle>
                      <div className="text-sm text-slate-400">
                        Real-time knowledge graph metrics and analytics
                      </div>
                    </div>
                  </div>
                  {getDataSourceBadge(knowledgeData.data_source)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="group/item relative p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/20 rounded-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Knowledge Density</div>
                      <div className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">
                        High
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-cyan-300 mb-2">
                      {(knowledgeData.knowledge_metrics.knowledge_density * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${knowledgeData.knowledge_metrics.knowledge_density * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/20 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Concept Connectivity</div>
                      <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        Strong
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-300 mb-2">
                      {(knowledgeData.knowledge_metrics.concept_connectivity * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${knowledgeData.knowledge_metrics.concept_connectivity * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-yellow-500/10 to-orange-600/20 rounded-lg border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Learning Efficiency</div>
                      <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                        Optimized
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-300 mb-2">
                      {(knowledgeData.knowledge_metrics.learning_pathway_efficiency * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${knowledgeData.knowledge_metrics.learning_pathway_efficiency * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-red-500/10 to-pink-600/20 rounded-lg border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Gap Ratio</div>
                      <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                        Low
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-300 mb-2">
                      {(knowledgeData.knowledge_metrics.knowledge_gap_ratio * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-pink-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${knowledgeData.knowledge_metrics.knowledge_gap_ratio * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="group/item relative p-4 bg-gradient-to-br from-purple-500/10 to-indigo-600/20 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-300">Emergence Rate</div>
                      <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                        Growing
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-300 mb-2">
                      {(knowledgeData.knowledge_metrics.concept_emergence_rate * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${knowledgeData.knowledge_metrics.concept_emergence_rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Top Concepts */}
              <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-teal-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      Top Concepts
                    </CardTitle>
                    <div className="text-sm text-slate-400">
                      Most important concepts in the knowledge graph
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {knowledgeData.concept_ranking.map((concept, index) => (
                    <div key={index} className="group/item relative p-4 bg-gradient-to-r from-slate-700/30 to-slate-600/20 rounded-xl border border-slate-600/30 hover:border-teal-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-lg">{concept.concept}</div>
                            <div className="text-sm text-slate-400">
                              {concept.connection_count} connections • {concept.memory_count || 0} memories
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Importance</div>
                            <div className="text-lg font-bold text-teal-300">{(concept.importance_score * 100).toFixed(1)}%</div>
                            <div className="w-16 bg-slate-700 rounded-full h-1 mt-1">
                              <div 
                                className="bg-gradient-to-r from-teal-400 to-cyan-500 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${concept.importance_score * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Centrality</div>
                            <div className="text-lg font-bold text-cyan-300">{(concept.centrality * 100).toFixed(1)}%</div>
                            <div className="w-16 bg-slate-700 rounded-full h-1 mt-1">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${concept.centrality * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="group relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300">
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                  <p className="text-slate-300">Waiting for knowledge data...</p>
                </div>
              </CardContent>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeConsciousnessStream;
