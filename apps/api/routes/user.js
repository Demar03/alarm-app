import { Router } from 'express';
import { state } from '../state.js';
import { maskPin, isValidPin } from '../utils/helpers.js';

const router = Router();

router.post('/api/add-user', (req, res) => {
  const { name, pin, start_time = null, end_time = null, permissions = [] } = req.body || {};

  if (!name || !isValidPin(pin)) {
    return res.status(400).json({ success: false, message: 'Name and 4-digit pin are required' });
  }

  const existing = state.users.find(u => u.name === name || u.pin === pin);
  if (existing) {
    return res.status(409).json({ success: false, message: 'User with same name or pin already exists' });
  }

  const now = new Date().toISOString();
  const temporary = Boolean(start_time || end_time);
  const user = {
    name,
    pin,
    permissions,
    temporary,
    start_time: start_time || null,
    end_time: end_time || null,
    createdAt: now
  };

  state.users.push(user);

  return res.json({
    success: true,
    message: `User ${name} added successfully`,
    user: {
      name: user.name,
      pin: maskPin(user.pin),
      permissions: user.permissions,
      temporary: user.temporary,
      createdAt: user.createdAt
    }
  });
});

router.post('/api/remove-user', (req, res) => {
  const { name, pin } = req.body || {};
  if (!name && !pin) {
    return res.status(400).json({ success: false, message: 'Provide name or pin to remove' });
  }

  const initialLength = state.users.length;
  state.users = state.users.filter(u => {
    if (name) return u.name !== name;
    if (pin) return u.pin !== pin;
    return true;
  });

  if (state.users.length === initialLength) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const identifier = name || maskPin(pin);
  return res.json({ success: true, message: `User ${identifier} removed successfully` });
});

router.get('/api/list-users', (req, res) => {
  const sanitized = state.users.map(u => ({
    name: u.name,
    pin: maskPin(u.pin),
    permissions: u.permissions,
    temporary: u.temporary,
    createdAt: u.createdAt
  }));
  return res.json({ users: sanitized, total: sanitized.length });
});

export default router;


