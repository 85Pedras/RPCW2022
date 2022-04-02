var mongoose = require('mongoose')

var file_schema = new mongoose.Schema({
    name: String,
    mimetype: String,
    description: String,
    size: Number,
    date: String
})

module.exports = mongoose.model('file', file_schema)