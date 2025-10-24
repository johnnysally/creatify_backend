module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    creatorId: { type: DataTypes.UUID, allowNull: true },
    creatorName: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'services',
    timestamps: true,
  });

  Service.associate = (models) => {
    if (models.User) {
      Service.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
    }
  };

  return Service;
};
