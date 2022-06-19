var Log = require('../models/log')

module.exports.list = () => {
    return Log
        .find()
        .sort({data:-1})
        .exec()
}

module.exports.insert = log => {
    var new_log = new Log(log)
    return new_log.save()
}

module.exports.reset = () => {
    return Log
        .deleteMany({})
        .exec()
};