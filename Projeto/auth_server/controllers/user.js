const mongoose = require('mongoose')
var User = require('../models/user')

module.exports.list = (username) => {
    return User.find({
        username: {$nin: [username]}})
        .sort({username:1}).exec();
}

module.exports.look_up = id => {
    return User.findOne({_id: mongoose.Types.ObjectId(id)}).exec()
}

module.exports.consultar = username => {
    return User.findOne({username: username}).exec();
}

module.exports.consultar_by_email = email => {
    return User.findOne({email: email}).exec();
}

module.exports.registar = user => {
    var new_user = new User(user);
    return new_user.save();
}

module.exports.editar = function(u){
    return User.findOneAndUpdate({_id: mongoose.Types.ObjectId(u._id)}, u, {new: true})
}

module.exports.editar_perfil = function(u){
    return User.findOneAndUpdate({username: u.username}, u, {new: true})
}

module.exports.delete = id => {
    return User
        .deleteOne({_id:mongoose.Types.ObjectId(id)})
        .exec()
};

module.exports.delete_perfil = username => {
    return User
        .deleteOne({username:username})
        .exec()
};