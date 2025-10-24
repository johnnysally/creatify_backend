module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'M-Pesa transaction ID',
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total payment amount',
    },
    creatorAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Amount for creator (80%)',
    },
    platformCommission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Platform commission (20%)',
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'M-Pesa phone number',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Content/Item being purchased',
    },
    itemTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: 'buyerId',
      as: 'buyer',
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'creator',
    });
  };

  return Payment;
};
