const fs = require('fs');
const path = require('path');

const contact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

    const messagesDir = path.join(__dirname, '..', 'messages');
    if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir);

    const filename = path.join(messagesDir, `${Date.now()}-${email.replace(/[^a-z0-9@.]/gi, '_')}.json`);
    fs.writeFileSync(filename, JSON.stringify({ name, email, message, date: new Date().toISOString() }, null, 2));

    console.log('New contact message saved:', filename);
    res.json({ message: 'Message received' });
  } catch (err) {
    console.error('Contact handler error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
};

module.exports = { contact };
