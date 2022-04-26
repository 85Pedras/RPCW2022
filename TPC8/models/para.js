var mongoose = require('mongoose')

var paraSchema = new mongoose.Schema({
    data: String,
    para: String,
})

module.exports = mongoose.model('paras', paraSchema)