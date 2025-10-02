export const maskPin = (pin) => (typeof pin === 'string' && pin.length >= 2 ? pin.slice(0, 2) + '**' : '**');
export const isValidMode = (mode) => ['away', 'home', 'stay'].includes(mode);
export const isValidPin = (pin) => typeof pin === 'string' && /^\d{4}$/.test(pin);

export const formatUptime = (uptimeSeconds) => {
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  return `${hours > 0 ? hours + ' hours ' : ''}${minutes} minutes`.trim();
};

