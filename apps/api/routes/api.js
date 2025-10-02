import { Router } from 'express';
import { state } from '../state.js';
import { isValidMode, formatUptime } from '../utils/helpers.js';

const router = Router();

router.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: formatUptime(process.uptime())
  });
});

router.post('/api/arm-system', (req, res) => {
  const { mode } = req.body || {};
  if (!isValidMode(mode)) {
    return res.status(400).json({ success: false, message: 'Invalid mode. Use away | home | stay' });
  }
  state.system.armed = true;
  state.system.mode = mode;
  state.system.lastArmed = new Date().toISOString();
  state.system.timestamp = state.system.lastArmed;
  return res.json({
    success: true,
    message: `System armed in ${mode} mode`,
    systemState: {
      armed: state.system.armed,
      mode: state.system.mode,
      timestamp: state.system.timestamp
    }
  });
});

router.post('/api/disarm-system', (req, res) => {
  state.system.armed = false;
  state.system.mode = null;
  state.system.timestamp = new Date().toISOString();
  return res.json({
    success: true,
    message: 'System disarmed successfully',
    systemState: {
      armed: state.system.armed,
      mode: state.system.mode,
      timestamp: state.system.timestamp
    }
  });
});

router.get('/api/system-status', (req, res) => {
  return res.json({
    armed: state.system.armed,
    mode: state.system.mode,
    lastArmed: state.system.lastArmed,
    usersCount: state.users.length,
    timestamp: new Date().toISOString()
  });
});

export default router;


