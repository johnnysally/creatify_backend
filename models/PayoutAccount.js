module.exports = (sequelize, DataTypes) => {
  const PayoutAccount = sequelize.define(
    'PayoutAccount',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'mpesa',
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'payout_accounts',
      timestamps: true,
    }
  );

  PayoutAccount.associate = (models) => {
    PayoutAccount.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return PayoutAccount;
};
