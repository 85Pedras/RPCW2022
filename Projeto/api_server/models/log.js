var mongoose = require('mongoose')

var log_schema = new mongoose.Schema({
    texto: String,
    data: String
})

module.exports = mongoose.model('log', log_schema)