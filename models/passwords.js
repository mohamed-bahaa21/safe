const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PasswordsSchema = new Schema({
    title: String,
    url: String,
    password: String,
    safe: {
        type: Schema.Types.ObjectId,
        ref: "Safe"
    },
})

module.exports = mongoose.model('Password', PasswordsSchema)