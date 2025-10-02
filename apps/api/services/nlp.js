import { getNlpPlanFromLlm } from './llm.js';

const MODE_ALIASES = {
  away: ['away', 'outside', 'lockdown', 'lock it down'],
  home: ['home', 'home mode'],
  stay: ['stay', 'stay mode', 'night', 'night mode']
};

function detectMode(text) {
  const lower = text.toLowerCase();
  for (const [mode, aliases] of Object.entries(MODE_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) return mode;
  }
  if (/(stay|home|away)/i.test(text)) return text.match(/(stay|home|away)/i)[1].toLowerCase();
  return 'away';
}

function extractPin(text) {
  const m = text.match(/\b(\d{4})\b/);
  return m ? m[1] : null;
}

function extractName(text) {
  const m = text.match(/\buser\s+([A-Za-z][A-Za-z\-]*)/i);
  return m ? m[1] : null;
}

function extractTimeRange(text) {
  // very simple heuristic placeholders
  const hasFrom = /from\s+([^]+?)\s+to\s+([^]+)$/i.exec(text);
  if (hasFrom) {
    return { start_time: hasFrom[1].trim(), end_time: hasFrom[2].trim() };
  }
  return { start_time: null, end_time: null };
}

export async function interpret(text) {
  const llmPlan = await getNlpPlanFromLlm(text);
  if (llmPlan && llmPlan.action) return { plan: llmPlan, source: 'llm' };

  const lower = text.toLowerCase();
  if (/(arm|activate|enable).*(system|alarm)/i.test(text)) {
    const mode = detectMode(text);
    return { plan: { action: 'ARM_SYSTEM', payload: { mode } }, source: 'rules' };
  }
  if (/(disarm|deactivate|disable|turn off).*(system|alarm)/i.test(text)) {
    return { plan: { action: 'DISARM_SYSTEM', payload: {} }, source: 'rules' };
  }
  if (/add\s+(a\s+)?(temporary\s+)?user/i.test(text)) {
    const name = extractName(text) || 'Guest';
    const pin = extractPin(text) || '0000';
    const { start_time, end_time } = extractTimeRange(text);
    return { plan: { action: 'ADD_USER', payload: { name, pin, start_time, end_time, permissions: ['arm', 'disarm'] } }, source: 'rules' };
  }
  if (/(remove|delete)\s+user/i.test(text)) {
    const name = extractName(text);
    const pin = extractPin(text);
    return { plan: { action: 'REMOVE_USER', payload: name ? { name } : pin ? { pin } : {} }, source: 'rules' };
  }
  if (/(list|show).*(users)/i.test(text)) {
    return { plan: { action: 'LIST_USERS', payload: {} }, source: 'rules' };
  }
  return { plan: { action: 'UNKNOWN', payload: {} }, source: 'rules' };
}


