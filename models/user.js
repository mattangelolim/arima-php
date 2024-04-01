const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const users = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    firstname: {
        type: DataTypes.STRING,
    },
    lastname: {
        type: DataTypes.STRING,
    },
    birthdate: {
        type: DataTypes.DATEONLY,
    },
    address: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
    },
    email : {
        type: DataTypes.STRING,
    },
    username : {
        type: DataTypes.STRING,
    },
    password : {
        type: DataTypes.STRING,
    },
    role : {
        type: DataTypes.STRING,
    },
    status : {
        type: DataTypes.INTEGER,
    },
    prc_id : {
        type: DataTypes.STRING,
    },
    prc_id_no: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
});

// users.sync()

module.exports = users;