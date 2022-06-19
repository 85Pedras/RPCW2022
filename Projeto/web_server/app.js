var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var axios = require('axios')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var dotenv = require('dotenv')
var { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');

dotenv.config();

passport.use(new LocalStrategy(
  {usernameField: 'username'}, (username, password, done) => {
    axios.get('http://localhost:4200/users/username/' + username + '?secret=segredo')
      .then(dados => {
        const user = dados.data
        if(!user) {  return done(null, false, {message: 'Utilizador inexistente\n'})}
        if(password != user.password) { return done(null, false, {message: 'Credenciais inválidas\n'})}
        return done(null, user)
      })
      .catch(e => done(e))
    })
)

passport.serializeUser(function(user, done) {
  console.log('Serialize: ' + user.email)
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  axios.get('http://localhost:4200/users/email/' + email + '?secret=segredo')
    .then(dados => {console.log('Deserialize: ' + dados); done(null, dados)})
    .catch(erro => done(erro, false))
});

var app = express();

app.use(session({
  genid: req => {
    return uuidv4()
  },
  store: new FileStore({retries: 2}),
  secret: 'RPCW2022',
  resave: false,
  saveUninitialized: false
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('RPCW2022'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use('/rrd', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
