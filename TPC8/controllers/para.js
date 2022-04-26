const mongoose = require("mongoose")
var Para = require('../models/para')

module.exports.listar = function(){
    return Para
        .find()
        .exec()
}

module.exports.inserir = p =>{
    var d = new Date()
    p.data=d.toISOString().substring(0,16)
    delete p["_id"];

    var novoPara = new Para(p)
    return novoPara.save()
}

module.exports.eliminar = id => {
    return Para
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.alterar = p => {
    p._id=mongoose.Types.ObjectId(p._id)
    return Para
        .findByIdAndUpdate(p._id,p)
        .exec()
}