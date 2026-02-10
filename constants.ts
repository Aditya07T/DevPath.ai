import { AppNode, GeneratedNode, Resource, RoadmapData } from './types';
import { Edge } from 'reactflow';

// Simple tree layout algorithm to convert flat list to x,y coordinates
export const layoutNodes = (nodes: GeneratedNode[]): { nodes: AppNode[], edges: Edge[] } => {
  const flowNodes: AppNode[] = [];
  const flowEdges: Edge[] = [];
  
  // Group by "level" (depth)
  const levelMap = new Map<string, number>(); // nodeId -> depth
  const childrenMap = new Map<string, string[]>(); // parentId -> [childIds]
  const roots: string[] = [];

  // Initialize
  nodes.forEach(node => {
    if (!node.parentId) {
      roots.push(node.id);
      levelMap.set(node.id, 0);
    } else {
      const existing = childrenMap.get(node.parentId) || [];
      childrenMap.set(node.parentId, [...existing, node.id]);
    }
  });

  // BFS to assign levels
  const queue = [...roots];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentLevel = levelMap.get(currentId) || 0;
    const children = childrenMap.get(currentId) || [];
    
    children.forEach(childId => {
      levelMap.set(childId, currentLevel + 1);
      queue.push(childId);
    });
  }

  // Calculate Positions
  const LEVEL_HEIGHT = 150;
  const NODE_WIDTH = 250;
  const X_SPACING = 300;
  
  // Track vertical usage per level to prevent overlapping
  const levelYUsage: Record<number, number> = {};

  nodes.forEach((node) => {
    const level = levelMap.get(node.id) || 0;
    const yIndex = levelYUsage[level] || 0;
    levelYUsage[level] = yIndex + 1;

    flowNodes.push({
      id: node.id,
      position: { x: level * X_SPACING, y: yIndex * LEVEL_HEIGHT },
      data: {
        label: node.label,
        description: node.description,
        status: 'pending',
        resources: node.resources,
      },
      type: 'default', // Using standard React Flow node for simplicity, usually custom
      style: { 
        background: '#1e293b', 
        color: '#fff', 
        border: '1px solid #475569', 
        width: 180,
        fontSize: '12px',
        padding: '10px'
      }
    });

    if (node.parentId) {
      flowEdges.push({
        id: `e-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        animated: true,
        style: { stroke: '#64748b' }
      });
    }
  });

  return { nodes: flowNodes, edges: flowEdges };
};

export const SAMPLE_ROADMAP_DATA: RoadmapData = {
  id: 'frontend-dev',
  title: 'Frontend Developer',
  ...layoutNodes([
    {
      id: '1', label: 'Internet', description: 'How the internet works.', parentId: null,
      resources: [{ title: 'How does the Internet work?', url: '#', type: 'article' }]
    },
    {
      id: '2', label: 'HTML', description: 'Structure of web pages.', parentId: '1',
      resources: [{ title: 'MDN HTML', url: '#', type: 'documentation' }]
    },
    {
      id: '3', label: 'CSS', description: 'Styling web pages.', parentId: '1',
      resources: [{ title: 'MDN CSS', url: '#', type: 'documentation' }]
    },
    {
      id: '4', label: 'JavaScript', description: 'Programming logic.', parentId: '1',
      resources: [{ title: 'JS Info', url: '#', type: 'article' }]
    },
    {
      id: '5', label: 'React', description: 'UI Library.', parentId: '4',
      resources: [{ title: 'React Docs', url: '#', type: 'documentation' }]
    },
    {
      id: '6', label: 'Tailwind CSS', description: 'Utility-first CSS.', parentId: '3',
      resources: [{ title: 'Tailwind Docs', url: '#', type: 'documentation' }]
    },
    {
      id: '7', label: 'Git', description: 'Version control system.', parentId: '4',
      resources: [{ title: 'Git Docs', url: 'https://git-scm.com/doc', type: 'documentation' }]
    }
  ])
};