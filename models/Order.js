module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyerId: { type: DataTypes.UUID, allowNull: false },
    serviceId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'pending' },
    metadata: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'orders',
    timestamps: true,
  });

  Order.associate = (models) => {
    if (models.User) Order.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' });
    if (models.Service) Order.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
  };

  return Order;
};
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'pending' },
    metadata: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'orders',
    timestamps: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' });
    Order.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
  };

  return Order;
};
