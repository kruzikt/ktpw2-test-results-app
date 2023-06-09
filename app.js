const express = require('express');
// const { v4: uuid } = require('uuid');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Test = require('./models/test');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { validateTest } = require('./middleware/validation');
const path = require('path');
const userRouter = require('./routes/users');
const { isLoggedIn, isAuthor } = require('./middleware/authentication');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

mongoose
  .connect('mongodb://127.0.0.1:27017/testsKTPW2')
  .catch((err) => console.log(err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', () => {
  console.log('Database connected');
});

const sessionConfig = {
  secret: 'hornedlouhyretezcznaku',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/', userRouter);
// app.use('/tests', commentRouter);
// router.get("/", callback funkce pro zobrazení seznamu všech komentářů)

app.get(
  '/documentation',
  catchAsync(async (req, res) => {
    res.render('documentation');
  })
);

app.get(
  '/tests',
  catchAsync(async (req, res) => {
    const tests = await Test.find({});
    res.render('tests/index', { tests });
  })
);

app.get('/tests/new', isLoggedIn, (req, res) => {
  res.render('tests/new');
});

app.get(
  '/tests/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const test = await Test.findById(id).populate('author');
    res.render('tests/show', { test });
  })
);

app.get(
  '/tests/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const test = await Test.findById(id);
    res.render('tests/edit', { test });
  })
);

app.patch(
  '/tests/:id',
  isLoggedIn,
  isAuthor,
  validateTest,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // const { title, description } = req.body;
    const myTest = await Test.findByIdAndUpdate(id, {
      ...req.body.description,
    });
    res.redirect(`/tests/${id}`);
  })
);

app.delete(
  '/tests/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Test.findByIdAndDelete(id);
    res.redirect('/tests');
  })
);

app.post(
  '/tests',
  isLoggedIn,
  validateTest,
  catchAsync(async (req, res) => {
    const test = new Test(req.body.test);
    test.author = req.user._id;
    await test.save();
    res.redirect('/tests');
  })
);

app.all('*', (req, res, next) => {
  const err = new ExpressError('Page not found', 404);
  next(err);
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = 'Something went wrong';
  }
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Web server started and listening at 3000 port');
});
