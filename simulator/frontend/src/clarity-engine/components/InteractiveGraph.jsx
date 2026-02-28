import React, { memo, createContext, useContext, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  Handle, Position, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TYPE_CFG } from '../data/gptEngine';

// ── Handler context ───────────────────────────────────────────────────────────
export const GraphCtx = createContext({ onExpand: () => {}, onDelete: () => {}, expandingId: null, lastExpandedId: null });

// ── Universal node component ──────────────────────────────────────────────────
const ThoughtNode = memo(function ThoughtNode({ id, type, data, selected }) {
  const { onExpand, onDelete, expandingId, lastExpandedId } = useContext(GraphCtx);
  const c = TYPE_CFG[type] || TYPE_CFG.unknown;
  const isExpanding    = expandingId === id;
  const isLastExplored = lastExpandedId === id && !isExpanding;
  const isDecision     = type === 'decision';

  return (
    <div
      className={`relative rounded-2xl transition-all duration-200 ${isExpanding ? 'opacity-40' : 'opacity-100'}`}
      style={{
        width: 220,
        minHeight: 84,
        background: selected ? '#fff' : isLastExplored ? `${c.bg}` : c.bg,
        border: isLastExplored
          ? `2.5px dashed ${c.color}`
          : `2px solid ${selected ? c.color : c.border}`,
        boxShadow: selected
          ? `0 0 0 3px ${c.color}, 0 0 0 6px ${c.color}40, 0 8px 32px ${c.color}50`
          : isLastExplored
          ? `0 0 0 3px ${c.color}55, 0 4px 20px ${c.color}30`
          : `0 2px 12px ${c.color}15`,
        cursor: 'pointer',
        transform: selected ? 'scale(1.06)' : isLastExplored ? 'scale(1.02)' : 'scale(1)',
        zIndex: selected ? 10 : isLastExplored ? 5 : 1,
      }}
    >
      {/* Last-explored indicator badge */}
      {isLastExplored && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap"
          style={{ background: c.color, color: '#fff', boxShadow: `0 2px 8px ${c.color}60` }}>
          last explored
        </div>
      )}

      {/* Selected glow ring — animated */}
      {selected && !isExpanding && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
          style={{ boxShadow: `0 0 0 4px ${c.color}55` }}
        />
      )}

      {/* Fear pulse ring (unselected only — selected has its own glow) */}
      {type === 'fear' && !isExpanding && !selected && (
        <div
          className="absolute inset-0 rounded-2xl animate-pulse pointer-events-none"
          style={{ boxShadow: `0 0 0 3px ${c.color}22` }}
        />
      )}
      {isExpanding && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none z-10"
          style={{ background: `${c.bg}cc` }}>
          <span className="text-lg animate-spin inline-block">⟳</span>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: c.color, border: 'none', width: 8, height: 8, zIndex: 10 }}
      />

      {/* Clickable body — triggers explore */}
      <div
        className="px-3.5 pt-2.5 pb-2 nodrag"
        onClick={e => { e.stopPropagation(); onExpand(id, data.label, type); }}
      >
        {/* Type badge row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-md"
            style={{ background: c.color, color: '#fff' }}
          >
            {c.emoji} {c.title}
          </span>

          {/* Hint text when selected */}
          {selected && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: `${c.color}18`, color: c.color }}>
              tap to explore →
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold leading-snug" style={{ color: selected ? c.color : c.color, fontWeight: selected ? 700 : 600 }}>
          {data.label}
        </p>
      </div>

      {/* Action footer */}
      <div
        className="nodrag flex items-center justify-between px-3.5 py-1.5 border-t"
        style={{ borderColor: `${c.color}18` }}
      >
        <button
          onClick={e => { e.stopPropagation(); onExpand(id, data.label, type); }}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all active:scale-95"
          style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}
          title="Explore deeper"
        >
          {isExpanding ? '…' : '+ explore'}
        </button>

        {!isDecision && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(id); }}
            className="text-[10px] px-2 py-0.5 rounded-lg transition-all active:scale-95"
            style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }}
            title="Remove"
          >
            remove
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: c.color, border: 'none', width: 8, height: 8, zIndex: 10 }}
      />
      {isDecision && (
        <>
          <Handle type="source" id="left"  position={Position.Left}  style={{ background: c.color, border: 'none', width: 6, height: 6 }} />
          <Handle type="source" id="right" position={Position.Right} style={{ background: c.color, border: 'none', width: 6, height: 6 }} />
        </>
      )}
    </div>
  );
});

const NODE_TYPES = Object.fromEntries(
  Object.keys(TYPE_CFG).map(t => [t, ThoughtNode])
);

// ── Auto-fit: only when nodes first appear (0 → positive) ────────────────────
function FitViewOnChange({ nodeCount }) {
  const { fitView } = useReactFlow();
  const prevCountRef = useRef(0);
  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = nodeCount;
    // Fit view only when the graph is freshly populated (was empty, now has nodes)
    if (prev === 0 && nodeCount > 0) {
      const t = setTimeout(() => fitView({ duration: 600, padding: 0.3 }), 150);
      return () => clearTimeout(t);
    }
  }, [nodeCount, fitView]);
  return null;
}

// ── InteractiveGraph ──────────────────────────────────────────────────────────
export default function InteractiveGraph({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onExpand,
  onDelete,
  expandingId,
  lastExpandedId,
}) {
  const ctxValue = useMemo(
    () => ({ onExpand, onDelete, expandingId, lastExpandedId }),
    [onExpand, onDelete, expandingId, lastExpandedId]
  );

  return (
    <GraphCtx.Provider value={ctxValue}>
      <div className="map-bg" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.28 }}
          minZoom={0.25}
          maxZoom={2.5}
          deleteKeyCode={null}
          selectionKeyCode="Shift"
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <FitViewOnChange nodeCount={nodes.length} />
          <Controls
            style={{
              bottom: 16, left: 16, top: 'auto',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 12,
              border: '1px solid rgba(244,114,182,0.2)',
              boxShadow: '0 2px 12px rgba(244,114,182,0.1)',
            }}
          />
          <MiniMap
            style={{
              bottom: 16, right: 16,
              width: 130, height: 80,
              borderRadius: 12,
              border: '1px solid rgba(244,114,182,0.2)',
              background: 'rgba(255,255,255,0.85)',
            }}
            nodeColor={n => TYPE_CFG[n.type]?.color || '#94a3b8'}
            maskColor="rgba(255,241,245,0.7)"
          />
        </ReactFlow>
      </div>
    </GraphCtx.Provider>
  );
}
