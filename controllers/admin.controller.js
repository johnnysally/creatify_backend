const db = require('../models');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/db-stats
 * Returns per-table row counts and size information for the current database.
 * Requires authentication and an elevated role (it_support or ceo).
 */
exports.getDbStats = async (req, res) => {
  try {
    const sequelize = db.sequelize;
    const dbName = sequelize.config.database;

    // Query INFORMATION_SCHEMA for table sizes and row counts
    const sql = `
      SELECT
        TABLE_NAME AS tableName,
        TABLE_ROWS AS rowsEstimate,
        DATA_LENGTH AS dataLength,
        INDEX_LENGTH AS indexLength,
        (DATA_LENGTH + INDEX_LENGTH) AS totalBytes
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = :dbName
      ORDER BY totalBytes DESC;
    `;

    const [results] = await sequelize.query(sql, {
      replacements: { dbName },
      type: db.Sequelize.QueryTypes.SELECT,
    });

    const tables = Array.isArray(results)
      ? results.map((r) => ({
          table: r.tableName,
          rowsEstimate: r.rowsEstimate || 0,
          dataBytes: Number(r.dataLength || 0),
          indexBytes: Number(r.indexLength || 0),
          totalBytes: Number(r.totalBytes || 0),
          dataMB: Number(((r.dataLength || 0) / (1024 * 1024)).toFixed(3)),
          indexMB: Number(((r.indexLength || 0) / (1024 * 1024)).toFixed(3)),
          totalMB: Number(((r.totalBytes || 0) / (1024 * 1024)).toFixed(3)),
        }))
      : [];

    const totalBytes = tables.reduce((s, t) => s + t.totalBytes, 0);
    const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(3));

    res.json({
      database: dbName,
      totalMB,
      tables,
    });
  } catch (error) {
    console.error('Failed to get DB stats', error);
    res.status(500).json({ error: 'Failed to get DB stats' });
  }
};

/**
 * PUT /api/admin/users/:userId/password
 * Body: { newPassword }
 * Allows IT support or CEO to reset/change a user's password.
 */
exports.changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const requestingRole = req.user.role;

    const targetUser = await db.User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only CEO can change another CEO's password
    if (targetUser.role === 'ceo' && requestingRole !== 'ceo') {
      return res.status(403).json({ error: 'Insufficient permissions to modify CEO account' });
    }

    // Hash and update
    const hashed = await bcrypt.hash(newPassword, 10);
    targetUser.password = hashed;
    await targetUser.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
