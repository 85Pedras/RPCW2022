var mongoose = require('mongoose')

var aviso_schema = new mongoose.Schema({
    autor: String,
    texto: String,
    data_submissao: String
})

module.exports = mongoose.model('aviso', aviso_schema)