const db = require('../models');

const listServices = async (req, res) => {
  try {
    const { q, category, limit = 24, offset = 0 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (q) where.title = { [db.Sequelize.Op.iLike]: `%${q}%` };

    const services = await db.Service.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset), order: [['createdAt', 'DESC']] });
    return res.json({ success: true, total: services.count, rows: services.rows });
  } catch (err) {
    console.error('listServices', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.Service.findByPk(id);
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, service });
  } catch (err) {
    console.error('getService', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createService = async (req, res) => {
  try {
    const { title, description, category, price, thumbnail, creatorId, creatorName, metadata } = req.body;
    if (!title || !category) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const svc = await db.Service.create({ title, description, category, price: price || 0, thumbnail, creatorId, creatorName, metadata });
    return res.status(201).json({ success: true, service: svc });
  } catch (err) {
    console.error('createService', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const listCategories = async (req, res) => {
  try {
    // Use raw query to get distinct categories for portability across dialects
    const results = await db.Service.findAll({ attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']] });
    const categories = results.map((r) => r.get('category')).filter(Boolean);
    return res.json({ success: true, categories });
  } catch (err) {
    console.error('listCategories', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listServices, getService, createService, listCategories };

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.Service.findByPk(id);
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    await service.destroy();
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteService', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// expose deleteService for routes that support deletion by owner/admin
module.exports.deleteService = deleteService;
