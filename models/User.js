module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Use a string for role to remain compatible with existing DB schemas
    // If you prefer enum constraints, run a DB migration to update the column type.
    role: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'public',
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Approval, {
      foreignKey: 'userId',
      as: 'approvalRequests',
    });
    User.hasMany(models.Approval, {
      foreignKey: 'approvedBy',
      as: 'approvalsGiven',
    });
  };

  return User;
};