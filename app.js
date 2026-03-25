const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodoverride = require('method-override');
const ejsmate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');


const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const review = require('./models/review.js');


const dburl = process.env.ATLASDB_URL;
main()
.then(() => console.log('connected to the database'))
.catch(err => console.log(err));

async function main() {
    await mongoose.connect(dburl);
}

app.use(methodoverride('_method'));
app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({extended: true}));

const store = MongoStore.create({
    mongoUrl:  dburl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on('error', ()=>{
    console.log('Error in Mongo Session Store', error);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
})

app.get('/demouser', async(req, res) => {
    let fakeuser = new User({
        email: 'student@gmail.com',
        username: 'rahul_sharma'
    });

    let registerdUser = await User.register(fakeuser, 'helloworld');
    res.send(registerdUser);
})

app.listen(8000, () => {
    console.log('server is listening on port 8000');
});


// app.get('/', (req, res) => {
//     res.send('Hello I am root!');
// });

app.get('/getcookies', (req, res) => {
    res.cookie('greet', 'hello');
    res.cookie('madein', 'India');
    res.send('sent you some cookie');
})

app.use('/listings', listingRouter);
app.use('/listings/:id/review', reviewRouter);
app.use('/', userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, 'Page not found!'));
});

app.use((err, req, res, next)=>{
    let {statusCode= 500, message="some error occured"} = err;
    // res.status(statusCode).send(message);
    res.render('error.ejs', {message});
});




