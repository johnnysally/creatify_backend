const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'config', 'settings.json');

const DEFAULT_SETTINGS = {
  theme: 'dark',
  platformFee: 0.2,
  mpesa: {},
  featureFlags: {},
  approvals: { autoApproveCeo: true },
  categories: ['animation','digital-art','photography','3d-art']
};

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(obj) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write settings:', err);
    return false;
  }
}

exports.getSettings = (req, res) => {
  const settings = readSettings();
  res.json({ settings });
};

exports.updateSettings = (req, res) => {
  try {
    const incoming = req.body;
    const current = readSettings();
    const merged = { ...current, ...incoming };
    const ok = writeSettings(merged);
    if (!ok) return res.status(500).json({ error: 'Failed to persist settings' });
    res.json({ settings: merged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Invalid payload' });
  }
};
