module.exports = (sequelize, DataTypes) => {
  const Bookings = sequelize.define("Bookings", {
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Bookings.associate = (models) => {
    Bookings.belongsTo(models.Users, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Bookings;
};
