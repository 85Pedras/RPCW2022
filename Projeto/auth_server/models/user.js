const mongoose = require('mongoose')

var user_schema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    level: String,
    data_registo: String
  });

module.exports = mongoose.model('user', user_schema)