/**
 * gptEngine.js
 * GPT-powered thought graph engine.
 * Set VITE_OPENAI_KEY in .env to enable GPT.
 * Falls back to local logic when no key is present.
 */
import { parseThought, computeLayout } from './engine';

const API = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function key() { return import.meta.env.VITE_OPENAI_KEY || ''; }

// ── Core GPT call ─────────────────────────────────────────────────────────────
async function gpt(system, user) {
  if (!key()) return null;
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 700,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return null;
  }
}

const SYS = `You are a cognitive mapping AI. You help people think more clearly by mapping their thoughts as a visual graph.
Always respond ONLY with valid JSON matching the exact schema requested. No explanations, no markdown — pure JSON.`;

// ── ID helpers ────────────────────────────────────────────────────────────────
let _counter = 200;
export function uid() { return `gn${_counter++}`; }
export function eid(a, b) { return `ge-${a}-${b}-${Date.now()}`; }

// ── Radial positioning helper ─────────────────────────────────────────────────
export function radialPos(center, index, total, r = 220) {
  const angle = (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2;
  return { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle) };
}

// ── Type color map ────────────────────────────────────────────────────────────
export const TYPE_CFG = {
  decision:    { color: '#f472b6', bg: '#fff1f5', border: '#f9a8d4', emoji: '⚡', title: 'DECISION'    },
  fear:        { color: '#f87171', bg: '#fff5f5', border: '#fca5a5', emoji: '😰', title: 'FEAR'        },
  goal:        { color: '#34d399', bg: '#f0fdf4', border: '#86efac', emoji: '🎯', title: 'GOAL'        },
  opportunity: { color: '#2dd4bf', bg: '#f0fdfa', border: '#5eead4', emoji: '✨', title: 'OPPORTUNITY' },
  unknown:     { color: '#fbbf24', bg: '#fffbeb', border: '#fde68a', emoji: '❓', title: 'UNKNOWN'     },
  pressure:    { color: '#a78bfa', bg: '#faf5ff', border: '#c4b5fd', emoji: '⚖️', title: 'PRESSURE'   },
  past:        { color: '#fb923c', bg: '#fff7ed', border: '#fdba74', emoji: '🌿', title: 'PAST'        },
  outcome:     { color: '#818cf8', bg: '#f5f3ff', border: '#a5b4fc', emoji: '🔮', title: 'OUTCOME'    },
};

function cfg(type) { return TYPE_CFG[type] || TYPE_CFG.unknown; }
export function typeColor(type) { return cfg(type).color; }

// ── Build React Flow edge ─────────────────────────────────────────────────────
function makeEdge(sourceId, targetId, targetType) {
  return {
    id: eid(sourceId, targetId),
    source: sourceId,
    target: targetId,
    type: 'smoothstep',
    animated: true,
    style: { stroke: typeColor(targetType), strokeWidth: 1.8, strokeOpacity: 0.7 },
  };
}

// ── initGraph ─────────────────────────────────────────────────────────────────
export async function initGraph(text) {
  const result = await gpt(SYS, `Map this thought into a decision graph.

User's thought: "${text}"

Return JSON:
{
  "nodes": [
    { "id": "n1", "ntype": "decision", "label": "max 6 word label" },
    { "id": "n2", "ntype": "fear|goal|opportunity|unknown|pressure|past", "label": "max 6 words" }
  ],
  "edges": [{ "source": "n1", "target": "n2" }],
  "nudge": "one short insight about their thinking pattern (max 18 words)"
}

Rules:
- Exactly 1 node with ntype "decision" — the core choice/situation
- 3 to 6 other nodes that directly reflect the user's text
- ntype must be one of: decision, fear, goal, opportunity, unknown, pressure, past
- Labels max 6 words, clear and direct
- Edges connect logically related nodes`);

  if (result?.nodes?.length) return buildInitLayout(result, text);
  return localInitGraph(text);
}

function buildInitLayout({ nodes, edges, nudge }, _text) {
  const decNode = nodes.find(n => n.ntype === 'decision') || nodes[0];
  const others  = nodes.filter(n => n !== decNode);
  const center  = { x: 440, y: 320 };
  const posMap  = {};

  const rfNodes = [
    makeNode(decNode.id, decNode.ntype, decNode.label, center),
  ];
  posMap[decNode.id] = center;

  others.forEach((n, i) => {
    const pos = radialPos(center, i, others.length, 240);
    posMap[n.id] = pos;
    rfNodes.push(makeNode(n.id, n.ntype, n.label, pos));
  });

  const rfEdges = (edges || []).map(e =>
    makeEdge(e.source, e.target, nodes.find(n => n.id === e.target)?.ntype || 'unknown')
  );

  return { nodes: rfNodes, edges: rfEdges, nudge: nudge || '' };
}

function localInitGraph(text) {
  const parsed = parseThought(text);
  const laid   = computeLayout(parsed);
  const center = { x: 440, y: 320 };
  const rfNodes = [];
  const rfEdges = [];
  const idMap   = {};

  laid.forEach((n, i) => {
    const rfId = `ln${n.id}`;
    idMap[n.id] = rfId;
    const type = n.type === 'core' ? 'decision' : n.type;
    const pos  = i === 0 ? center : radialPos(center, i - 1, laid.length - 1, 240);
    rfNodes.push(makeNode(rfId, type, n.label, pos));
  });

  const coreId = idMap[laid[0]?.id];
  laid.slice(1).forEach(n => {
    const rfId = idMap[n.id];
    const type = n.type === 'core' ? 'decision' : n.type;
    rfEdges.push(makeEdge(coreId, rfId, type));
  });

  return { nodes: rfNodes, edges: rfEdges, nudge: '' };
}

// ── expandNode ────────────────────────────────────────────────────────────────
export async function expandNode(parentId, parentLabel, parentType, currentNodes) {
  const existing = currentNodes.map(n => n.data.label).join(', ');
  const parentNode = currentNodes.find(n => n.id === parentId);
  const parentPos  = parentNode?.position || { x: 440, y: 320 };

  const result = await gpt(SYS, `A user is exploring a specific thought node on their decision graph.

Node to expand: "${parentLabel}" (type: ${parentType})
Existing node labels (avoid duplicating): ${existing}

Return JSON:
{
  "new_nodes": [
    { "id": "e1", "ntype": "fear|goal|opportunity|unknown|pressure|past|outcome", "label": "max 6 words" },
    { "id": "e2", "ntype": "...", "label": "..." }
  ],
  "nudge": "one coaching insight about this exploration (max 18 words)"
}

Rules:
- Return 2 to 3 new child nodes
- Choose types that logically follow from a "${parentType}" node
- Make labels direct and specific to "${parentLabel}"
- Never repeat any existing label`);

  if (result?.new_nodes?.length) {
    const newNodes = result.new_nodes.map((n, i) => {
      const pos = radialPos(parentPos, i, result.new_nodes.length, 190);
      return makeNode(uid(), n.ntype, n.label, pos);
    });
    const newEdges = newNodes.map(n => makeEdge(parentId, n.id, n.type));
    return { nodes: newNodes, edges: newEdges, nudge: result.nudge || '' };
  }

  return localExpand(parentId, parentLabel, parentType, parentPos);
}

const LOCAL_EXPANSIONS = {
  fear:        ['What specifically triggers this?', 'Worst realistic outcome', 'What would help me cope?'],
  goal:        ['What does success look like?', "What's blocking this?", 'First concrete step'],
  decision:    ['Stay on current path', 'Make the change', 'Explore a middle ground'],
  opportunity: ['Skills needed', 'Possible obstacles', 'Timeline to try it'],
  unknown:     ['How can I find out?', 'Who already knows this?', 'What can I safely assume?'],
  pressure:    ['Where does this come from?', 'Is this pressure valid?', 'What do I actually want?'],
  past:        ['What was different then?', 'What did I learn?', "Am I the same person now?"],
  outcome:     ['What enables this?', 'What could prevent it?', 'Probability'],
};

function localExpand(parentId, label, type, parentPos) {
  const labels = (LOCAL_EXPANSIONS[type] || LOCAL_EXPANSIONS.decision).slice(0, 2);
  const childType = type === 'fear' ? 'unknown' : type === 'goal' ? 'opportunity' : 'unknown';
  const newNodes = labels.map((lbl, i) => {
    const pos = radialPos(parentPos, i, labels.length, 190);
    return makeNode(uid(), childType, lbl, pos);
  });
  const newEdges = newNodes.map(n => makeEdge(parentId, n.id, n.type));
  return { nodes: newNodes, edges: newEdges, nudge: '' };
}

// ── addThought ────────────────────────────────────────────────────────────────
export async function addThought(input, currentNodes) {
  const nodeSummary = currentNodes
    .map(n => `${n.id} (${n.type}): "${n.data.label}"`)
    .join('\n');
  const decisionNode = currentNodes.find(n => n.type === 'decision') || currentNodes[0];
  const decPos = decisionNode?.position || { x: 440, y: 320 };

  const result = await gpt(SYS, `A user is adding a new thought to their decision graph.

New thought: "${input}"

Existing nodes:
${nodeSummary}

Return JSON:
{
  "new_nodes": [
    { "id": "a1", "ntype": "fear|goal|opportunity|unknown|pressure|past|outcome", "label": "max 6 words" }
  ],
  "connect_to": "id of the most relevant existing node to connect from",
  "nudge": "one short coaching insight about this new thought (max 18 words)"
}

Rules:
- Create 1 or 2 nodes that capture the new thought
- connect_to must be one of the existing node ids`);

  if (result?.new_nodes?.length) {
    const connectToId = currentNodes.find(n => n.id === result.connect_to)
      ? result.connect_to
      : decisionNode?.id;
    const connectPos = currentNodes.find(n => n.id === connectToId)?.position || decPos;

    const newNodes = result.new_nodes.map((n, i) => {
      const pos = radialPos(connectPos, i + 2, result.new_nodes.length + 2, 210);
      return makeNode(uid(), n.ntype, n.label, pos);
    });
    const newEdges = newNodes.map(n => makeEdge(connectToId, n.id, n.type));
    return { nodes: newNodes, edges: newEdges, nudge: result.nudge || '' };
  }

  // Local fallback
  const newId = uid();
  const words = input.trim().split(/\s+/).slice(0, 6).join(' ');
  const fallbackNode = makeNode(newId, 'unknown', words, {
    x: decPos.x + 280 + (Math.random() * 60 - 30),
    y: decPos.y + (Math.random() * 140 - 70),
  });
  return {
    nodes: [fallbackNode],
    edges: [makeEdge(decisionNode?.id || 'ln0', newId, 'unknown')],
    nudge: '',
  };
}

// ── getNudges ─────────────────────────────────────────────────────────────────
export async function getNudges(currentNodes, rawText) {
  if (currentNodes.length < 3) return { nudges: [], dominant: null };

  const summary = currentNodes.map(n => `${n.type}: "${n.data.label}"`).join('; ');

  const result = await gpt(SYS, `Analyze this thinking graph and return coaching guidance.

Graph: ${summary}
Original thought: "${rawText || ''}"

Return JSON:
{
  "nudges": ["coaching hint 1 (max 22 words)", "coaching hint 2 (max 22 words)"],
  "dominant": "the most prominent node type in this graph",
  "missing": "what type of thinking would most help right now"
}`);

  if (result?.nudges) return result;

  // Local fallback nudges
  const counts = {};
  currentNodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
  const nudges = [];
  if ((counts.fear || 0) >= 2 && !(counts.goal || 0))
    nudges.push("You've mapped a lot of fears — what does success actually look like to you?");
  if (!(counts.opportunity || 0))
    nudges.push("You haven't explored any opportunities yet. What's one possible upside?");
  if ((counts.pressure || 0) >= 1)
    nudges.push("You're feeling external pressure. What would you choose if no one was watching?");
  if (!nudges.length)
    nudges.push("Click any node to explore it deeper. What matters most right now?");

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return { nudges: nudges.slice(0, 2), dominant, missing: null };
}

// ── makeNode helper ───────────────────────────────────────────────────────────
function makeNode(id, type, label, position) {
  const safeType = TYPE_CFG[type] ? type : 'unknown';
  return {
    id,
    type: safeType,
    position,
    data: { label },
  };
}
