const mongoose = require('mongoose');
const passwords = require('./models/passwords');
const Password = require('./models/passwords');
const safe = require('./models/safe');
const Safe = require('./models/safe');

module.exports.isAuthor = (req, res, next) => {
    const { safeid } = req.params

    if (!mongoose.Types.ObjectId.isValid(safeid)) {
        return res.status(404).render('errors/404.ejs')
    }

    Safe.findById(safeid).then(safe => {
        if (!safe) {
            return res.status(404).render('errors/404.ejs')
        }
        if (!safe.author._id.equals(req.user._id)) {
            req.flash('error', 'Notfound');
            return res.redirect('/');
        }
        next();
    });

}


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

