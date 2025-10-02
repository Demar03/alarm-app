import { Router } from 'express';
import fetch from 'node-fetch';
import { interpret } from '../services/nlp.js';

const router = Router();
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

async function callBackend(plan) {
  const { action, payload } = plan;
  let method = 'GET';
  let path = '/healthz';
  let body = null;

  switch (action) {
    case 'ARM_SYSTEM':
      method = 'POST';
      path = '/api/arm-system';
      body = JSON.stringify({ mode: payload?.mode || 'away' });
      break;
    case 'DISARM_SYSTEM':
      method = 'POST';
      path = '/api/disarm-system';
      body = JSON.stringify({});
      break;
    case 'ADD_USER':
      method = 'POST';
      path = '/api/add-user';
      body = JSON.stringify({
        name: payload?.name,
        pin: payload?.pin,
        start_time: payload?.start_time ?? null,
        end_time: payload?.end_time ?? null,
        permissions: payload?.permissions ?? ['arm', 'disarm']
      });
      break;
    case 'REMOVE_USER':
      method = 'POST';
      path = '/api/remove-user';
      body = JSON.stringify(payload && Object.keys(payload).length ? payload : {});
      break;
    case 'LIST_USERS':
      method = 'GET';
      path = '/api/list-users';
      break;
    default:
      return { status: 400, data: { success: false, message: 'Unknown action' } };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : body
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, method, path, body: body ? JSON.parse(body) : undefined };
}

router.post('/nl/execute', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ success: false, message: 'text is required' });

    const { plan, source } = await interpret(text);
    if (plan.action === 'UNKNOWN') {
      return res.status(400).json({ success: false, message: 'Could not interpret command', plan, source });
    }

    const result = await callBackend(plan);
    return res.status(result.status).json({
      success: result.status < 400,
      input: text,
      plan,
      source,
      api: { method: result.method, path: result.path, body: result.body },
      response: result.data
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('NL execute error', err?.message);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

export default router;


