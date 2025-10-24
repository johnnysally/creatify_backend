const db = require('../models');

const createOrder = async (req, res) => {
  try {
    const { serviceId, title, description, amount, metadata } = req.body;
    const buyerId = req.user && req.user.id;

    if (!buyerId || !title) return res.status(400).json({ error: 'buyerId and title are required' });

    const order = await db.Order.create({ buyerId, serviceId, title, description, amount: amount || 0, metadata });
    return res.status(201).json({ order });
  } catch (err) {
    console.error('createOrder', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
};

const listOrders = async (req, res) => {
  try {
    const buyerId = req.user && req.user.id;
    const orders = await db.Order.findAll({ where: { buyerId }, order: [['createdAt', 'DESC']], include: [{ model: db.Service, as: 'service' }] });
    return res.json({ orders });
  } catch (err) {
    console.error('listOrders', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.Order.findByPk(id, { include: [{ model: db.Service, as: 'service' }] });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.buyerId !== (req.user && req.user.id) && req.user.role !== 'admin' && req.user.role !== 'ceo') return res.status(403).json({ error: 'Forbidden' });
    return res.json({ order });
  } catch (err) {
    console.error('getOrder', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await db.Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    // only admins/ceo or owner can update status
    if (req.user.role !== 'admin' && req.user.role !== 'ceo' && order.buyerId !== (req.user && req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    order.status = status;
    await order.save();
    return res.json({ order });
  } catch (err) {
    console.error('updateOrderStatus', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
};

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };

