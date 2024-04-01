const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const forgot_pw = sequelize.define("forgot_pw", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
    },
    token:{
        type: DataTypes.STRING,
    }
});

// forgot_pw.sync()

module.exports = forgot_pw;