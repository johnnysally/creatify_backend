const path = require('path');
const fs = require('fs');

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const filename = req.file.filename;
    const size = req.file.size || 0;
    const mimetype = req.file.mimetype || '';

    if (size <= 0) return res.status(400).json({ success: false, message: 'Uploaded file is empty' });

    const publicPath = `/uploads/${filename}`;
    return res.json({ success: true, url: publicPath, filename, size, mimetype });
  } catch (err) {
    console.error('uploadFile', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

module.exports = { uploadFile };
