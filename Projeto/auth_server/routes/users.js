var express = require('express');
var router = express.Router();
var User = require('../controllers/user')
var passport = require('passport')
var jwt = require('jsonwebtoken')

function verificaToken(req, res, next){
  var my_token = req.query.token || req.body.token;
  jwt.verify(my_token, 'RPCW2022', function(e, payload){
    if(e) res.status(401).jsonp({error: 'Erro na verificação do token: ' + e})
    else{
      if(payload.level === "Administrador")
        req.user = { level: payload.level, username: payload.username}
      else
        req.user = { level: payload.level, username: payload.username}
      console.log("token good verificado")
      next()
    } 
  })
}

// Listar utilizadores
router.get('/', verificaToken, function(req,res,next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  User.list(req.user.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Registar
router.post('/registar', function(req,res) {
  req.body.data_registo = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
  User.consultar(req.body.username)
    .then(dados => {
      if (dados == null) {
        User.registar(req.body)
          .then(dados => res.status(200).jsonp(dados))
          .catch(e => res.status(500).jsonp({error: e}))
      }
      else res.status(501).jsonp({error:"Utilizador já existente"})
    })
    .catch(e => res.status(500).jsonp({error: e}))
})

// Login
router.post('/login', function(req,res) {
  jwt.sign({username: req.body.username, level: req.body.level,
  sub: 'Projeto RPCW2022'}, "RPCW2022", function(e,token) {
    if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
    else res.status(201).jsonp({token: token})
  })
})

// Serielização ///////////////////////
// Consultar utilizador por email
router.get('/email/:email', function(req,res,next) {
  if (req.query.secret === "segredo") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){

  User.consultar_by_email(req.params.email)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Consultar utilizador por username
router.get('/username/:username', function(req,res,next) {
  if (req.query.secret === "segredo") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res) {
  
  User.consultar(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Consultar perfil
router.get('/perfil/:username', function(req,res,next) {
  User.consultar(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Editar perfil
router.put('/perfil/:username', verificaToken, function(req,res,next) {
  req.body.username = req.params.username
  User.editar_perfil(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Eliminar perfil
router.delete('/perfil/:username', verificaToken, function(req, res, next) {
  User.delete_perfil(req.params.username)
    .then(() => res.status(200).jsonp())
    .catch(error => res.status(500).jsonp(error))
});

// Consultar um utilizador
router.get('/:id', verificaToken, function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  User.look_up(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
});
/////////////////////////////////////

// Editar um utilizador
router.put('/:id', verificaToken, function(req,res,next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  req.body._id = req.params.id
  User.editar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Eliminar um utilizador
router.delete('/:id', verificaToken, function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res) {
  User.delete(req.params.id)
    .then(() => res.status(200).jsonp())
    .catch(error => res.status(500).jsonp(error))
});

module.exports = router;
