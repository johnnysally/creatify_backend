module.exports = (sequelize, DataTypes) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // Use a flexible string for requestedRole so new roles (e.g. service_seller) don't get truncated
    requestedRole: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'approvals',
    timestamps: true,
  });

  Approval.associate = (models) => {
    Approval.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Approval.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver',
    });
  };

  return Approval;
};