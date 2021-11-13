const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SafeSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
})

module.exports = mongoose.model('Safe', SafeSchema)