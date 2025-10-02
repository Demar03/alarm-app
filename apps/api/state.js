export const state = {
  users: [],
  system: {
    armed: false,
    mode: null,
    lastArmed: null,
    timestamp: new Date().toISOString()
  }
};

export const getMaskedUsers = () =>
  state.users.map(u => ({
    name: u.name,
    pin: (typeof u.pin === 'string' && u.pin.length >= 2 ? u.pin.slice(0, 2) + '**' : '**'),
    permissions: u.permissions,
    temporary: u.temporary,
    createdAt: u.createdAt
  }));


