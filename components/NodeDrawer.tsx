import React from 'react';
import { AppNode, Resource } from '../types';
import { X, CheckCircle, ExternalLink, BookOpen, Video, FileText } from 'lucide-react';

interface NodeDrawerProps {
  node: AppNode | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete: (nodeId: string) => void;
}

const NodeDrawer: React.FC<NodeDrawerProps> = ({ node, isOpen, onClose, onMarkComplete }) => {
  if (!node) return null;

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-blue-400" />;
      case 'documentation': return <FileText size={16} className="text-orange-400" />;
      default: return <BookOpen size={16} className="text-green-400" />;
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{node.data.label}</h2>
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              node.data.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-300'
            }`}>
              {node.data.status === 'completed' ? 'Completed' : 'Pending'}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="prose prose-invert">
            <h3 className="text-lg font-semibold text-white">Overview</h3>
            <p className="text-slate-400">{node.data.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Curated Resources</h3>
            <div className="space-y-3">
              {node.data.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      {getIcon(res.type)}
                      {res.type}
                    </span>
                    <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400" />
                  </div>
                  <h4 className="text-slate-200 font-medium">{res.title}</h4>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
          <button
            onClick={() => onMarkComplete(node.id)}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
              node.data.status === 'completed'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <CheckCircle size={20} />
            {node.data.status === 'completed' ? 'Completed' : 'Mark as Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDrawer;
