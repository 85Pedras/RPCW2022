const mongoose = require('mongoose')
var File_Info = require('../models/file_info')

module.exports.list = () => {
    return File_Info
        .find()
        .sort({titulo:1})
        .exec()
}

module.exports.list_by_tipo = tipo => {
    return File_Info
        .find({tipo:tipo})
        .sort({titulo:1})
        .exec()
}

module.exports.list_by_user = user => {
    return File_Info
        .find({utilizador:user})
        .sort({titulo:1})
        .exec()
}

module.exports.list_tipos = () => {
    return File_Info
        .find({},{_id:0,tipo:1})
        .sort({tipo:1})
        .exec()
}

module.exports.look_up = id => {
    return File_Info
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.look_up_regex = pal => {
    return File_Info
        .find({titulo: {$regex: pal, $options: "i"}})
        .exec()
}

module.exports.path = id => {
    return File_Info
        .find({_id: mongoose.Types.ObjectId(id)},{_id:0,nome:1,tipo:1})
        .exec()
}

module.exports.insert = file_info => {
    var new_file_info = new File_Info(file_info)
    return new_file_info.save()
}

module.exports.editar = function(r){
    console.log(r)
    return File_Info.findOneAndUpdate({_id: mongoose.Types.ObjectId(r._id)}, {titulo: r.titulo, criador: r.criador, utilizador: r.utilizador, data_criacao: r.data_criacao, data_submissao: r.data_submissao, descricao: r.descricao}, {new: true})
}

module.exports.delete = id => {
    return File_Info
        .deleteOne({_id:mongoose.Types.ObjectId(id)})
        .exec()
};

module.exports.add_comentario = function(c){
    return File_Info.findOneAndUpdate({_id: mongoose.Types.ObjectId(c._id)}, {$push: 
        {comentarios: {id: c.id, autor: c.autor, texto: c.texto, data_submissao: c.data_submissao}}})
}

module.exports.delete_comentario = function(c){
    return File_Info.findOneAndUpdate({_id: mongoose.Types.ObjectId(c._id)}, {$pull: 
        {comentarios: {id: c.id}}})
}