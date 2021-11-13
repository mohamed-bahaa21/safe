const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Password = require('./models/passwords');
const flash = require('connect-flash');
const pass = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const { isAuthor, isLoggedIn } = require('./middleware');
const Safe = require('./models/safe');
const { find } = require('./models/passwords');



mongoose.connect('mongodb://localhost:27017/safe');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(express.static(__dirname + '/public'));
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})



app.use(pass.initialize())
app.use(pass.session())
pass.use(new LocalStrategy(User.authenticate()));

pass.serializeUser(User.serializeUser());
pass.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next()
})

app.get('/', (req, res) => {
    res.render('home')
})


// app.get('/my', isLoggedIn,isCreated, async (req,res) => {

// })

// app.get('/mysafe', async(req,res)=> {
//     const safe= await Safe.find({})
//     res.render('passwords/newsafe', { safe })
// })


app.get('/mysafe', isLoggedIn, async (req, res) => {
    let safe = await Safe.findOne({ author: req.user._id });
    if (!safe) {
        safe = new Safe()
        safe.author = req.user._id
        safe.save()

    }
    res.redirect(`/mysafe/${safe._id}`)
})

app.get('/mysafe/:safeid', isLoggedIn, isAuthor, async (req, res) => {
    const { safeid } = req.params;

    try {
        const safe = await Safe.find({ _id: mongoose.Types.ObjectId(safeid) }).populate('author')
        console.log("Safe: ", safe);

        if (!safe) {
            return res.status(404).render('errors/404.ejs')
        }

        const password = await Password.find({ safe: mongoose.Types.ObjectId(safeid) }).populate('safe')
        return res.render('passwords/index', { password, safe })

    }
    catch (error) {
        return res.status(500).render('errors/500')
    }
})


app.get('/mysafe/:safeid/new', isLoggedIn, isAuthor, async (req, res) => {
    const { safeid } = req.params;

    try {
        const safe = await Safe.find({ _id: mongoose.Types.ObjectId(safeid) }).populate('author')

        if (!safe) {
            return res.status(404).render('errors/404.ejs')
        }

        res.render('passwords/new', { safe });
    }
    catch (error) {
        return res.status(500).render('errors/500')
    }
})



app.post('/mysafe/:safeid', async (req, res) => {
    const { safeid } = req.params;
    const safe = await Safe.findById(safeid)
    const password = new Password(req.body.password)
    password.safe = safe
    await password.save();
    console.log(password)
    res.redirect(`/mysafe/${safe._id}`)
})





app.get('/mysafe/:safeid/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
    const { safeid } = req.params;
    const safe = await Safe.findById(safeid)
    const password = await Password.findById(req.params.id).populate('safe')
    if (!password.safe.author._id.equals(req.user._id)) {
        req.flash('error', 'Notfound');
        return res.redirect(`/mysafe`);
    }
    res.render('passwords/edit', { password, safe });
})




app.put('/mysafe/:safeid/:id', async (req, res) => {


    const { safeid } = req.params;
    const safe = await Safe.findById(safeid)


    const password = await Password.findByIdAndUpdate(req.params.id, { ...req.body.password })

    res.redirect(`/mysafe/${safe._id}`)
})





app.get('/mysafe/:safeid/:id/delete', isLoggedIn, isAuthor, async (req, res) => {
    const { safeid } = req.params;
    const safe = await Safe.findById(safeid)
    const password = await Password.findById(req.params.id).populate('safe')
    if (!password.safe.author._id.equals(req.user._id)) {
        req.flash('error', 'Notfound');
        return res.redirect(`/mysafe`);
    }
    res.render('passwords/delete', { password, safe });
})


app.delete('/mysafe/:safeid/:id', async (req, res) => {
    const { safeid } = req.params;
    const safe = await Safe.findById(safeid)


    const password = await Password.findByIdAndDelete(req.params.id)

    res.redirect(`/mysafe/${safe._id}`);
})







app.get('/register', (req, res) => {
    res.render('users/register')
})
app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username, })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to SAFE!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
});


app.get('/login', (req, res) => {
    res.render('users/login')
})
app.post('/login', pass.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');

    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;

    res.redirect(redirectUrl);
})

app.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', "Goodbye")
    res.redirect('/')
})




app.listen(3000, () => {
    console.log('Serving on port 3000')
})
