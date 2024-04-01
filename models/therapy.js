const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const t_sessions = sequelize.define("t_sessions", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    DSI: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    session_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    word: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prompt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    interpretation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
});

// t_sessions.sync()

module.exports = t_sessions;