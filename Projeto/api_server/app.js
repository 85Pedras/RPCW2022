var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var jwt = require('jsonwebtoken')
var cors = require('cors')

var mongoose = require('mongoose')
var mongoDB = 'mongodb://127.0.0.1/RRD'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Erro de conexão ao MongoDB"))
db.once('open',function(){
  console.log("Conexão ao MongoDB realizada com sucesso")
})

var api_recursos = require('./routes/api_recursos');
var api_avisos = require('./routes/api_avisos');
var api_logs = require('./routes/api_logs')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next){
  var myToken = req.query.token || req.body.token;
  console.log(JSON.stringify(req.query.tipo))
  jwt.verify(myToken, 'RPCW2022', function(e, payload){
    if(e) res.status(401).jsonp({error: 'Erro na verificação do token: ' + e})
    else{
      if(payload.level === "Administrador")
        req.user = {level: payload.level, username: payload.username}
      else
        req.user = {level: payload.level, username: payload.username}

      console.log("token good verificado")
      next()
    } 
  })
})

app.use('/api/recursos', api_recursos);
app.use('/api/avisos', api_avisos);
app.use('/api/logs', api_logs);

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
