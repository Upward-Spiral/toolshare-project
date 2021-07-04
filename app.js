require('dotenv').config();

const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const mongoose     = require('mongoose');
const session      = require("express-session");
const MongoStore   = require("connect-mongo")(session);
const logger       = require('morgan');
const path         = require('path');
var cors           = require('cors');


mongoose
  .connect(process.env.db, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 36000000}, //10 hours
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60,
    }),
  })
);

// Middleware Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: [process.env.client_origin_a, process.env.client_origin_b],
  credentials: true
}))

// Express View engine setup
app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Tool Hub';

// Middleware Setup
app.use('/user', protect);
app.use('/tool', protect);
app.use('/transaction', protect);
// app.use('/location', protect);


//Routes
const index = require('./routes/index');
app.use('/', index);
const user = require('./routes/user');
app.use('/user', user);
const tool = require('./routes/tool');
app.use('/tool', tool);
const transaction = require('./routes/transaction');
app.use('/transaction', transaction);
// const location = require('./routes/location');
// app.use('/location', location);

// Function definitions
//middleware definition
function protect (req,res,next){ 
  if (req.session.currentUser) next()
  else { res.status(403).json({
    messageBody: "Login Required!"
    }); 
  }
}


module.exports = app;
