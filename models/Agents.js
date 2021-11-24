module.exports = (sequelize, DataTypes) => {
  const Agents = sequelize.define("Agents", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agent_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return Agents;
};
