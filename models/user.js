const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }

});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(uniqueValidator, { message: 'Sorry, this email was already registered' });

module.exports = mongoose.model('User', UserSchema);