import { Edge, Node } from 'reactflow';

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'documentation';
}

export interface RoadmapNodeData {
  label: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  resources: Resource[];
  isAI?: boolean;
}

// Extension of React Flow Node specifically for our app
export type AppNode = Node<RoadmapNodeData>;

export interface RoadmapData {
  id: string;
  title: string;
  nodes: AppNode[];
  edges: Edge[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

// Raw JSON format expected from Gemini for generation
export interface GeneratedNode {
  id: string;
  label: string;
  description: string;
  parentId: string | null; // For tree structure
  resources: Resource[];
}

export interface GeneratedRoadmapResponse {
  title: string;
  nodes: GeneratedNode[];
}
