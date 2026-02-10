import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowProvider,
} from 'reactflow';
import { AppNode, RoadmapData } from '../types';

interface RoadmapRendererProps {
  data: RoadmapData;
  onNodeClick: (node: AppNode) => void;
}

const RoadmapRendererInner: React.FC<RoadmapRendererProps> = ({ data, onNodeClick }) => {
  // We need to use local state for React Flow interactivity (dragging etc)
  // but sync it when 'data' prop changes significantly (like loading a new roadmap)
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  // Update effect when the roadmap data ID changes
  React.useEffect(() => {
    setNodes(data.nodes);
    setEdges(data.edges);
  }, [data, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick(node as AppNode);
  }, [onNodeClick]);

  return (
    <div className="w-full h-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-800 border-slate-700" />
      </ReactFlow>
    </div>
  );
};

// Wrap in provider to ensure context exists
const RoadmapRenderer: React.FC<RoadmapRendererProps> = (props) => (
  <ReactFlowProvider>
    <RoadmapRendererInner {...props} />
  </ReactFlowProvider>
);

export default RoadmapRenderer;
