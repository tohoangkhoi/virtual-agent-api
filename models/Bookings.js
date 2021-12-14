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
    prefered_university: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    academic_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gpa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    english_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    englist_result: {
      type: DataTypes.STRING,
      allowNull: true,
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
