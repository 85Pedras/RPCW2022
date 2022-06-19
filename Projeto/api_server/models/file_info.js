var mongoose = require('mongoose')

var file_info_schema = new mongoose.Schema({
    titulo: String,
    nome: String,
    tipo: String,
    tamanho: Number,
    extensao: String,
    ficheiros: [String],
    data_criacao: String,
    data_submissao: String,
    criador: String,
    utilizador: String,
    descricao: String,
    comentarios: [{
        id: String,
        autor: String,
        texto: String,
        data_submissao: String
    }] 
})

module.exports = mongoose.model('file_info', file_info_schema, 'metadata')