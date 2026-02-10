import React, { useState, useEffect } from 'react';
import { AppNode, RoadmapData, GeneratedRoadmapResponse } from './types';
import { SAMPLE_ROADMAP_DATA, layoutNodes } from './constants';
import { generateRoadmapAI } from './services/geminiService';
import RoadmapRenderer from './components/RoadmapRenderer';
import NodeDrawer from './components/NodeDrawer';
import ChatWidget from './components/ChatWidget';
import { Compass, Plus, Github, Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData>(SAMPLE_ROADMAP_DATA);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle node selection
  const handleNodeClick = (node: AppNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNode(null);
  };

  // Mark node as done logic
  const handleMarkComplete = (nodeId: string) => {
    const updatedNodes = currentRoadmap.nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, status: 'completed' as const } } 
        : node
    );
    
    // Update local state
    setCurrentRoadmap(prev => ({ ...prev, nodes: updatedNodes }));
    
    // Update selected node ref if it's the one open
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, status: 'completed' } });
    }
  };

  // AI Generation Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generationPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const response: GeneratedRoadmapResponse = await generateRoadmapAI(generationPrompt);
      
      const { nodes, edges } = layoutNodes(response.nodes);
      
      const newRoadmap: RoadmapData = {
        id: Date.now().toString(),
        title: response.title || generationPrompt,
        nodes,
        edges
      };

      setCurrentRoadmap(newRoadmap);
      setGenerationPrompt('');
    } catch (err) {
      setError("Failed to generate roadmap. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar Navigation (Simple) */}
      <div className="w-16 md:w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 z-20">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Compass className="text-white" size={24} />
        </div>
        <div className="flex-1 w-full flex flex-col items-center gap-4">
          <button className="p-3 rounded-lg bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-colors" title="Home">
            <Compass size={20} />
          </button>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-3 text-slate-500 hover:text-white transition-colors">
          <Github size={20} />
        </a>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 z-10 absolute top-0 w-full pointer-events-none">
           {/* Left side: Title */}
          <div className="pointer-events-auto flex items-center gap-4">
             <h1 className="text-xl font-bold text-white tracking-tight">{currentRoadmap.title}</h1>
             <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">Interactive</span>
          </div>

          {/* Center: Generation Input */}
          <div className="pointer-events-auto w-full max-w-xl mx-4">
            <form onSubmit={handleGenerate} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sparkles size={16} className={`text-indigo-500 ${isGenerating ? 'animate-pulse' : ''}`} />
              </div>
              <input
                type="text"
                disabled={isGenerating}
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                className="block w-full pl-10 pr-24 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="Generate a roadmap (e.g., 'Golang for Backend')..."
              />
              <button
                type="submit"
                disabled={isGenerating || !generationPrompt}
                className="absolute inset-y-1 right-1 px-3 flex items-center bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin mr-1"/> : 'Generate'}
              </button>
            </form>
          </div>
          
           {/* Right placeholder */}
           <div className="w-10"></div>
        </div>

        {/* Error Banner */}
        {error && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 border border-red-700 text-red-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-2 hover:text-white"><Plus size={16} className="rotate-45" /></button>
            </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950 pt-16 h-full">
          {isGenerating && (
             <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                 <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">Architecting your path...</h2>
                 <p className="text-slate-400">Gemini is thinking about the best curriculum for "{generationPrompt}"</p>
             </div>
          )}
          <RoadmapRenderer 
            data={currentRoadmap} 
            onNodeClick={handleNodeClick} 
          />
        </div>

      </div>

      {/* Side Drawer */}
      <NodeDrawer
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onMarkComplete={handleMarkComplete}
      />

      {/* Chat Widget */}
      <ChatWidget selectedNode={selectedNode} />
    </div>
  );
};

export default App;
