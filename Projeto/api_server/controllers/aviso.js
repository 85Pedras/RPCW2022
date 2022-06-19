const mongoose = require('mongoose')
var Aviso = require('../models/aviso')

module.exports.list = () => {
    return Aviso
        .find()
        .sort({data_submissao:-1})
        .exec()
}

module.exports.insert = aviso => {
    var new_aviso = new Aviso(aviso)
    return new_aviso.save()
}

module.exports.look_up = id => {
    return Aviso
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.editar = function(a){
    return Aviso.findOneAndUpdate({_id: mongoose.Types.ObjectId(a._id)}, {texto: a.texto,data_submissao: a.data_submissao}, {new: true})
}

module.exports.delete = id => {
    return Aviso
        .deleteOne({_id:mongoose.Types.ObjectId(id)})
        .exec()
};