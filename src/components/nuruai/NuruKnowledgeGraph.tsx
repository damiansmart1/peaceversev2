import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GitBranch, Building2, FileText, DollarSign, Tag, MessageSquareText,
  ArrowRight, Search, ZoomIn, ZoomOut, Maximize2, Filter
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions } from '@/hooks/useNuruAI';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const sb = supabase as any;

const ENTITY_COLORS: Record<string, string> = {
  institution: '#818cf8',
  document: '#34d399',
  budget: '#fbbf24',
  topic: '#f97316',
  question: '#22d3ee',
  response: '#ec4899',
  policy: '#38bdf8',
};

const ENTITY_ICONS: Record<string, any> = {
  institution: Building2,
  document: FileText,
  budget: DollarSign,
  topic: Tag,
  question: MessageSquareText,
  response: ArrowRight,
  policy: FileText,
};

interface GraphNode {
  id: string;
  name: string;
  type: string;
  connections: string[];
  x: number;
  y: number;
  properties?: Record<string, any>;
}

const NuruKnowledgeGraph = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: graphData } = useQuery({
    queryKey: ['knowledge-graph'],
    queryFn: async () => {
      const { data, error } = await sb.from('civic_knowledge_graph').select('*').limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Build graph nodes from available data
  const nodes: GraphNode[] = useMemo(() => {
    const result: GraphNode[] = [];
    const centerX = 400;
    const centerY = 300;

    // From knowledge graph table
    if (graphData?.length) {
      graphData.forEach((g: any, i: number) => {
        const angle = (i / Math.max(graphData.length, 1)) * Math.PI * 2;
        const radius = 150 + Math.random() * 100;
        result.push({
          id: g.id,
          name: g.entity_name,
          type: g.entity_type,
          connections: Array.isArray(g.connections) ? g.connections : [],
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          properties: g.properties,
        });
      });
    }

    // Generate from documents if no graph data
    if (!result.length && documents?.length) {
      // Document nodes
      documents.slice(0, 15).forEach((doc: any, i: number) => {
        const angle = (i / Math.min(documents.length, 15)) * Math.PI * 2;
        result.push({
          id: `doc-${doc.id}`,
          name: doc.title,
          type: 'document',
          connections: [],
          x: centerX + Math.cos(angle) * 180,
          y: centerY + Math.sin(angle) * 180,
          properties: { country: doc.country, type: doc.document_type },
        });

        // Extract institutions from doc
        if (doc.institutions?.length) {
          doc.institutions.forEach((inst: string, j: number) => {
            const instId = `inst-${inst.replace(/\s+/g, '-').toLowerCase()}`;
            if (!result.find(n => n.id === instId)) {
              const iAngle = angle + (j * 0.3);
              result.push({
                id: instId,
                name: inst,
                type: 'institution',
                connections: [`doc-${doc.id}`],
                x: centerX + Math.cos(iAngle) * 280,
                y: centerY + Math.sin(iAngle) * 280,
              });
            }
            const existing = result.find(n => n.id === `doc-${doc.id}`);
            if (existing && !existing.connections.includes(instId)) existing.connections.push(instId);
          });
        }

        // Extract topics
        if (doc.topics?.length) {
          doc.topics.slice(0, 3).forEach((topic: string, j: number) => {
            const topicId = `topic-${topic.replace(/\s+/g, '-').toLowerCase()}`;
            if (!result.find(n => n.id === topicId)) {
              const tAngle = angle - 0.2 + (j * 0.2);
              result.push({
                id: topicId,
                name: topic,
                type: 'topic',
                connections: [`doc-${doc.id}`],
                x: centerX + Math.cos(tAngle) * 120,
                y: centerY + Math.sin(tAngle) * 120,
              });
            }
            const existing = result.find(n => n.id === `doc-${doc.id}`);
            if (existing && !existing.connections.includes(topicId)) existing.connections.push(topicId);
          });
        }
      });

      // Question nodes connected to documents
      questions?.slice(0, 10).forEach((q: any, i: number) => {
        const angle = (i / 10) * Math.PI * 2 + 0.5;
        const qNode: GraphNode = {
          id: `q-${q.id}`,
          name: q.question_text?.substring(0, 40) + '...',
          type: 'question',
          connections: q.document_id ? [`doc-${q.document_id}`] : [],
          x: centerX + Math.cos(angle) * 240,
          y: centerY + Math.sin(angle) * 240,
        };
        result.push(qNode);
      });
    }

    return result;
  }, [graphData, documents, questions]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (searchTerm && !n.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [nodes, filterType, searchTerm]);

  // Get connections for rendering
  const connections = useMemo(() => {
    const lines: { from: GraphNode; to: GraphNode }[] = [];
    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]));
    filteredNodes.forEach(node => {
      node.connections.forEach(connId => {
        const target = nodeMap.get(connId);
        if (target) lines.push({ from: node, to: target });
      });
    });
    return lines;
  }, [filteredNodes]);

  const entityTypes = useMemo(() => {
    const types = new Set(nodes.map(n => n.type));
    return Array.from(types);
  }, [nodes]);

  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    nodes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
    return { total: nodes.length, connections: connections.length, types: typeCounts };
  }, [nodes, connections]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Democratic Knowledge Graph</h2>
            <p className="text-[11px] text-muted-foreground">Explore relationships between policies, institutions, budgets, and civic questions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {Object.entries(stats.types).map(([type, count]) => {
            const Icon = ENTITY_ICONS[type] || Tag;
            return (
              <div key={type} className="p-2.5 rounded-xl border border-border/20 text-center">
                <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: ENTITY_COLORS[type] || '#888' }} />
                <p className="text-[10px] text-muted-foreground capitalize">{type}s</p>
                <p className="text-sm font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input className="h-8 text-xs pl-9" placeholder="Search entities..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 text-xs w-[140px]"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {entityTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}><ZoomOut className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}><Maximize2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden relative" style={{ height: '500px' }}>
        {filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Upload documents to generate the knowledge graph</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Relationships are automatically extracted from civic documents</p>
            </div>
          </div>
        ) : (
          <svg
            width="100%" height="100%"
            viewBox={`0 0 800 600`}
            className="cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            <defs>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.2" />
              </marker>
            </defs>

            {/* Connections */}
            {connections.map((conn, i) => (
              <line
                key={i}
                x1={conn.from.x} y1={conn.from.y}
                x2={conn.to.x} y2={conn.to.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
                strokeOpacity={selectedNode && (selectedNode.id === conn.from.id || selectedNode.id === conn.to.id) ? 0.5 : 0.1}
                markerEnd="url(#arrowhead)"
              />
            ))}

            {/* Nodes */}
            {filteredNodes.map((node, i) => {
              const Icon = ENTITY_ICONS[node.type] || Tag;
              const color = ENTITY_COLORS[node.type] || '#888';
              const isSelected = selectedNode?.id === node.id;
              const isConnected = selectedNode?.connections.includes(node.id) || node.connections.includes(selectedNode?.id || '');
              const opacity = selectedNode ? (isSelected || isConnected ? 1 : 0.3) : 1;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className="cursor-pointer"
                  opacity={opacity}
                >
                  <circle r={isSelected ? 22 : 16} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={isSelected ? 2 : 1} strokeOpacity={0.4} filter={isSelected ? 'url(#nodeGlow)' : undefined} />
                  <circle r={6} fill={color} fillOpacity={0.9} />
                  <text y={28} textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" fontWeight={isSelected ? '600' : '400'} opacity={0.8}>
                    {node.name.length > 25 ? node.name.substring(0, 25) + '…' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${ENTITY_COLORS[selectedNode.type]}15` }}>
              {(() => { const Icon = ENTITY_ICONS[selectedNode.type] || Tag; return <Icon className="h-4 w-4" style={{ color: ENTITY_COLORS[selectedNode.type] }} />; })()}
            </div>
            <div>
              <h3 className="text-sm font-semibold">{selectedNode.name}</h3>
              <Badge variant="outline" className="text-[10px] capitalize">{selectedNode.type}</Badge>
            </div>
          </div>
          {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(selectedNode.properties).map(([key, val]) => (
                <div key={key} className="text-[11px]">
                  <span className="text-muted-foreground capitalize">{key}: </span>
                  <span className="font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-[11px] text-muted-foreground">
            Connected to {selectedNode.connections.length} entities
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(ENTITY_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NuruKnowledgeGraph;
