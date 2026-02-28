import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, useNodesState, useEdgesState } from '@xyflow/react';
import { ArrowLeft, Zap, RefreshCw } from 'lucide-react';
import InteractiveGraph from './components/InteractiveGraph';
import GPTNudge from './components/GPTNudge';
import LoopBreaker from './components/LoopBreaker';
import OverthinkingIntervention from './components/OverthinkingIntervention';
import ClarityReport from './components/ClarityReport';
import { detectLoop } from './data/engine';
import {
  initGraph, expandNode, addThought, getNudges,
  uid, eid, typeColor, radialPos,
} from './data/gptEngine';

// ── Loop object for repeat-expansion detection ──────────────────────────────
function makeExpansionLoop(label) {
  return {
    detected: true,
    type: 'amplification',
    label: 'Thought Loop Detected',
    emoji: '🔁',
    tagline: `You've explored "${label.slice(0, 30)}" multiple times — this looks like circular thinking.`,
    rootAssumption: 'Diving deeper into the same thought is a way of avoiding a decision.',
    chain: [label.split(' ').slice(0, 4).join(' '), '→', 'Deeper exploration', '→', 'Same concern again', '🔁'],
    steps: [
      { icon: '🎯', title: 'Name the real stuck point', action: 'What specific question are you actually trying to answer by revisiting this thought? Write it as one sentence.' },
      { icon: '📋', title: 'List what you already know', action: "You've explored this area multiple times. What do you know for certain? Write 3 things you can confirm right now." },
      { icon: '🚪', title: 'Explore a different node', action: 'Click a different node in your graph. What other part of this decision has been unexamined?' },
      { icon: '⚡', title: 'Make a provisional decision', action: "If you had to decide right now — not perfectly, just directionally — what would you choose? Say it out loud." },
    ],
    message: `You've expanded "${label.slice(0, 30)}" multiple times. This is a loop.`,
  };
}

// ── Inner workspace (needs ReactFlowProvider) ────────────────────────────────
function Workspace({ onBack }) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  const [phase, setPhase]           = useState('idle');   // idle | loading | active
  const [rawText, setRawText]       = useState('');
  const [draftText, setDraftText]   = useState('');
  const [addInput, setAddInput]     = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [expandingId, setExpandingId] = useState(null);
  const [lastExpandedId, setLastExpandedId] = useState(null);
  const [nudges, setNudges]         = useState([]);
  const [loopInfo, setLoopInfo]     = useState({ detected: false });
  const [loopBroken, setLoopBroken] = useState(false);
  const [loopOpen, setLoopOpen]     = useState(true);
  const [intervention, setIntervention] = useState(null);
  const [interventionAnswers, setInterventionAnswers] = useState(null);
  const [showReport, setShowReport]     = useState(false);

  const hasKey = !!import.meta.env.VITE_OPENAI_KEY;

  // Stable refs so callbacks never go stale
  const nodesRef          = useRef([]);
  const expansionRef      = useRef({});
  const expansionCountRef = useRef(0);        // total expand clicks this session
  const loopRef           = useRef({ detected: false });
  const interventionFired = useRef(false);   // prevent re-triggering mid-session

  useEffect(() => { nodesRef.current = rfNodes; }, [rfNodes]);
  useEffect(() => { loopRef.current = loopInfo; }, [loopInfo]);

  // ── INIT ──────────────────────────────────────────────────────────────────
  async function handleInit(e) {
    e.preventDefault();
    if (!draftText.trim()) return;
    setPhase('loading');
    setRawText(draftText.trim());
    expansionRef.current = {};
    expansionCountRef.current = 0;
    interventionFired.current = false;

    const { nodes, edges, nudge } = await initGraph(draftText.trim());
    setRfNodes(nodes);
    setRfEdges(edges);
    setNudges(nudge ? [nudge] : []);

    // Text-based loop detection on initial input
    const loop = detectLoop([], draftText.trim());
    if (loop.detected) { setLoopInfo(loop); setLoopOpen(true); }
    else setLoopInfo({ detected: false });
    setLoopBroken(false);
    setPhase('active');
  }

  // ── EXPAND NODE ───────────────────────────────────────────────────────────
  const handleExpand = useCallback(async (nodeId, label, type) => {
    setExpandingId(nodeId);
    const count = (expansionRef.current[nodeId] || 0) + 1;
    expansionRef.current[nodeId] = count;
    expansionCountRef.current += 1;

    const { nodes: newNodes, edges: newEdges, nudge } = await expandNode(
      nodeId, label, type, nodesRef.current
    );
    setRfNodes(prev => [...prev, ...newNodes]);
    setRfEdges(prev => [...prev, ...newEdges]);
    if (nudge) setNudges(prev => [nudge, ...prev.slice(0, 1)]);
    setExpandingId(null);
    setLastExpandedId(nodeId);

    // Detect repeating expansion loop
    if (count >= 2 && !loopRef.current.detected) {
      setLoopInfo(makeExpansionLoop(label));
      setLoopOpen(true);
      setLoopBroken(false);
    }

    // Overthinking intervention: negative nodes dominate with little resolution
    const allNodes = [...nodesRef.current, ...newNodes];
    const fearNodes    = allNodes.filter(n => n.type === 'fear' || n.type === 'pressure');
    const unknownNodes = allNodes.filter(n => n.type === 'unknown' || n.type === 'past');
    const resolvedCount = allNodes.filter(n => n.type === 'goal' || n.type === 'opportunity').length;
    const negCount = fearNodes.length + unknownNodes.length;
    const dominantType = fearNodes.length >= unknownNodes.length ? 'fear' : 'unknown';
    const enoughExplored = expansionCountRef.current >= 3;
    if (enoughExplored && negCount >= 5 && resolvedCount < negCount && !interventionFired.current) {
      interventionFired.current = true;
      setIntervention({ triggerLabel: label, dominantType });
    }

    // Refresh nudges every 3 nodes
    if (allNodes.length % 3 === 0) {
      const nb = await getNudges(allNodes, '');
      if (nb.nudges?.length) setNudges(nb.nudges);
    }
  }, []);

  // ── DELETE NODE ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (nodeId) => {
    const remaining = nodesRef.current.filter(n => n.id !== nodeId);
    setRfNodes(remaining);
    setRfEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    const nb = await getNudges(remaining, '');
    if (nb.nudges?.length) setNudges(nb.nudges);
  }, []);

  // ── ADD THOUGHT ───────────────────────────────────────────────────────────
  async function handleAddThought(e) {
    e.preventDefault();
    if (!addInput.trim() || addLoading) return;
    setAddLoading(true);
    const { nodes: newNodes, edges: newEdges, nudge } = await addThought(
      addInput.trim(), nodesRef.current
    );
    setRfNodes(prev => [...prev, ...newNodes]);
    setRfEdges(prev => [...prev, ...newEdges]);
    if (nudge) setNudges([nudge]);
    setAddInput('');
    setAddLoading(false);
  }

  // ── INTERVENTION COMPLETE ─────────────────────────────────────────────────
  function handleInterventionComplete(answers) {
    setIntervention(null);
    setInterventionAnswers(answers);
    const decisionNode = nodesRef.current.find(n => n.type === 'decision') || nodesRef.current[0];
    const decPos = decisionNode?.position || { x: 440, y: 320 };
    const answerEntries = Object.entries(answers);
    const labelMap = {
      insight:    'I already know',
      want:       'What I want',
      choose:     'My choice',
      worst:      'Realistic worst case',
      action:     'Next action',
      friend:     'Advice to myself',
      commit:     'Commitment',
      positive_0: 'Could go right',
      positive_1: 'Could go right',
      positive_2: 'Could go right',
    };
    const answerNodes = answerEntries.map(([key, val], i) => {
      const pos = radialPos(decPos, i, answerEntries.length, 360);
      const shortText = val.text.split(' ').slice(0, 8).join(' ');
      return {
        id: uid(),
        type: val.type,
        position: pos,
        data: { label: `${labelMap[key] || key}: ${shortText}` },
      };
    });
    const answerEdges = answerNodes.map(n => ({
      id: eid(decisionNode?.id || 'root', n.id),
      source: decisionNode?.id || nodesRef.current[0]?.id,
      target: n.id,
      type: 'smoothstep',
      animated: true,
    }));
    setRfNodes(prev => [...prev, ...answerNodes]);
    setRfEdges(prev => [...prev, ...answerEdges]);
    setNudges(["You've broken through the loop — your clarity is now on the map. 🎯"]);
    setTimeout(() => setShowReport(true), 1800);
  }

  // ── RESET ─────────────────────────────────────────────────────────────────
  function handleReset() {
    setPhase('idle');
    setRfNodes([]);
    setRfEdges([]);
    setNudges([]);
    setLoopInfo({ detected: false });
    setLoopBroken(false);
    setDraftText('');
    setAddInput('');
    expansionRef.current = {};
    expansionCountRef.current = 0;
    interventionFired.current = false;
    setInterventionAnswers(null);
    setShowReport(false);
    setLastExpandedId(null);
  }

  // ── IDLE SCREEN ───────────────────────────────────────────────────────────
  if (phase === 'idle' || phase === 'loading') {
    return (
      <div className="clarity-bg min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'rgba(131,24,67,0.6)' }}
          >
            <ArrowLeft size={15} /> Hub
          </button>
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(244,114,182,0.6)' }}>
            Clarity Engine
          </span>
          <div className="w-16" />
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(244,114,182,0.15)', border: '1.5px solid rgba(244,114,182,0.3)' }}
              >
                <Zap size={28} style={{ color: '#f472b6' }} />
              </div>
            </div>

            <h1 className="text-2xl font-black text-center mb-2" style={{ color: 'rgba(131,24,67,0.9)' }}>
              What's on your mind?
            </h1>
            <p className="text-center text-sm mb-8" style={{ color: 'rgba(131,24,67,0.5)' }}>
              Describe your decision or situation. GPT will map it live — you click, explore, and think.
            </p>

            {/* API key notice */}
            {!hasKey && (
              <div
                className="mb-5 px-4 py-2.5 rounded-xl text-xs text-center"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(120,80,0,0.7)' }}
              >
                ⚡ Demo mode — add <code>VITE_OPENAI_KEY</code> in <code>.env</code> for GPT-powered insights
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleInit}>
              <textarea
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder={"e.g. \"I want to quit my job but I'm scared of the financial risk and what my family will think...\"\n\nWrite as much or as little as you like."}
                rows={5}
                className="w-full rounded-2xl px-4 py-3.5 text-sm resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  border: '1.5px solid rgba(244,114,182,0.3)',
                  color: 'rgba(50,20,35,0.85)',
                  boxShadow: '0 2px 20px rgba(244,114,182,0.08)',
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleInit(e); }}
              />

              <button
                type="submit"
                disabled={!draftText.trim() || phase === 'loading'}
                className="mt-4 w-full py-3.5 rounded-2xl font-bold text-sm transition-all"
                style={{
                  background: draftText.trim()
                    ? 'linear-gradient(135deg,#f9a8d4,#f472b6)'
                    : 'rgba(244,114,182,0.15)',
                  color: draftText.trim() ? '#fff' : 'rgba(244,114,182,0.5)',
                  boxShadow: draftText.trim() ? '0 4px 20px rgba(244,114,182,0.35)' : 'none',
                }}
              >
                {phase === 'loading' ? '🧠 Mapping your thought…' : 'Map my thinking →'}
              </button>
            </form>

            <p className="text-center mt-4 text-xs" style={{ color: 'rgba(131,24,67,0.35)' }}>
              Cmd+Enter to submit · Click any node to explore · Add thoughts at any time
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── ACTIVE WORKSPACE ──────────────────────────────────────────────────────
  const showLoopPanel = loopInfo.detected && !loopBroken && loopOpen;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* ── Fixed top bar ───────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-2.5 z-20"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(244,114,182,0.18)',
          boxShadow: '0 1px 12px rgba(244,114,182,0.08)',
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold shrink-0 transition-colors"
          style={{ color: 'rgba(131,24,67,0.55)' }}
        >
          <ArrowLeft size={13} />
          Hub
        </button>

        {/* Title */}
        <span className="text-xs font-black tracking-widest uppercase shrink-0" style={{ color: '#f472b6' }}>
          🧠 Clarity
        </span>

        {/* Add thought input */}
        <form onSubmit={handleAddThought} className="flex-1 flex items-center gap-2 min-w-0">
          <input
            value={addInput}
            onChange={e => setAddInput(e.target.value)}
            placeholder="Add a thought… (e.g. 'But I also want stability')"
            className="flex-1 rounded-xl px-3 py-1.5 text-xs focus:outline-none min-w-0"
            style={{
              background: 'rgba(244,114,182,0.07)',
              border: '1px solid rgba(244,114,182,0.25)',
              color: 'rgba(50,20,35,0.8)',
            }}
          />
          <button
            type="submit"
            disabled={addLoading || !addInput.trim()}
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: addInput.trim() ? 'rgba(244,114,182,0.15)' : 'transparent',
              color: addInput.trim() ? '#f472b6' : 'rgba(244,114,182,0.35)',
              border: '1px solid rgba(244,114,182,0.2)',
            }}
          >
            {addLoading ? '…' : '+ Add'}
          </button>
        </form>

        {/* Loop badge */}
        {loopInfo.detected && !loopBroken && (
          <button
            onClick={() => setLoopOpen(o => !o)}
            className="shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(244,114,182,0.15)',
              color: '#f472b6',
              border: '1px solid rgba(244,114,182,0.3)',
            }}
          >
            🔁 Loop
          </button>
        )}

        {/* Report button */}
        <button
          onClick={() => setShowReport(true)}
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full transition-all"
          style={{
            background: interventionAnswers ? 'linear-gradient(135deg,#f9a8d4,#f472b6)' : 'rgba(244,114,182,0.1)',
            color: interventionAnswers ? '#fff' : 'rgba(244,114,182,0.5)',
            border: '1px solid rgba(244,114,182,0.25)',
          }}
        >
          {interventionAnswers ? '📊 Report' : '📊'}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          title="Start over"
          className="shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(131,24,67,0.4)' }}
        >
          <RefreshCw size={13} />
        </button>

        {/* Demo badge */}
        {!hasKey && (
          <span
            className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.15)', color: 'rgba(120,80,0,0.6)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            Demo
          </span>
        )}
      </div>

      {/* ── Graph workspace ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <InteractiveGraph
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onExpand={handleExpand}
          onDelete={handleDelete}
          expandingId={expandingId}
          lastExpandedId={lastExpandedId}
        />

        {/* GPT floating nudges */}
        <GPTNudge nudges={nudges} hasKey={hasKey} />

        {/* ── Loop Breaker side panel ─────────────────────────────────── */}
        <AnimatePresence>
          {showLoopPanel && (
            <motion.div
              key="loop-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute top-3 right-3 z-20 overflow-y-auto"
              style={{ maxWidth: 310, maxHeight: 'calc(100% - 24px)' }}
            >
              <LoopBreaker
                loopInfo={loopInfo}
                onBreak={() => { setLoopBroken(true); setLoopOpen(false); }}
              />
              <button
                onClick={() => setLoopOpen(false)}
                className="mt-2 w-full text-xs py-1.5 rounded-xl transition-colors"
                style={{ color: 'rgba(131,24,67,0.45)', background: 'rgba(244,114,182,0.08)' }}
              >
                Hide for now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Overthinking Intervention modal ─────────────────────────── */}
        <AnimatePresence>
          {intervention && (
            <OverthinkingIntervention
              key="intervention"
              onComplete={handleInterventionComplete}
              onDismiss={() => setIntervention(null)}
              dominantType={intervention.dominantType}
            />
          )}
        </AnimatePresence>

        {/* ── Clarity Report modal ─────────────────────────────────────── */}
        <AnimatePresence>
          {showReport && (
            <ClarityReport
              key="report"
              nodes={rfNodes}
              rawText={rawText}
              answers={interventionAnswers}
              onClose={() => setShowReport(false)}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>

        {/* ── Node count / status hint ────────────────────────────────── */}
        <div
          className="absolute bottom-24 left-4 z-20 text-xs pointer-events-none"
          style={{ color: 'rgba(244,114,182,0.45)' }}
        >
          {rfNodes.length} nodes · click any node to explore deeper
        </div>
      </div>
    </div>
  );
}

// ── Export with Provider ──────────────────────────────────────────────────────
export default function ClarityEngineApp({ onBack }) {
  return (
    <ReactFlowProvider>
      <Workspace onBack={onBack} />
    </ReactFlowProvider>
  );
}
