const mongoose = require('mongoose')
var File = require('../models/file')

module.exports.list = () => {
    return File
        .find()
        .sort({name:1})
        .exec()
}

module.exports.look_up = id => {
    return File
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.insert = file => {
    var new_file = new File(file)
    return new_file.save()
}

module.exports.delete = id => {
    return File
        .deleteOne({_id:mongoose.Types.ObjectId(id)})
        .exec()
};