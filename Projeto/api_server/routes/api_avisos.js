var express = require('express');
var router = express.Router();
var Aviso = require('../controllers/aviso')

// Listar avisos
router.get('/', function(req, res, next) {
  Aviso.list()
    .then(dados => {
      res.status(200).jsonp({dados})
    })
    .catch(error => res.status(500).jsonp(error))
});
  
// Inserir um aviso
router.post('/', function(req,res,next) {
  if (req.user.level != "Consumidor") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  Aviso.insert(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
})

// Consultar um aviso
router.get('/:aid', function(req, res, next) {
  Aviso.look_up(req.params.aid)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
});

// Editar um aviso
router.put('/:aid', function(req,res,next) {
  if (req.user.level === "Administrador") next();
  else if (req.user.level === "Produtor") {
    Aviso.look_up(req.params.aid)
      .then(dados => {
        if (req.user.username == dados.autor) next()
        else res.status(401).jsonp({error: "Não autorizado"})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  req.body._id = req.params.aid
  Aviso.editar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Eliminar um aviso
router.delete('/:aid', function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else if (req.user.level === "Produtor") {
    Aviso.look_up(req.params.aid)
      .then(dados => {
        if (req.user.username == dados.autor) next()
        else res.status(401).jsonp({error: "Não autorizado"})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res) {
  Aviso.delete(req.params.aid)
    .then(() => res.status(200).jsonp())
    .catch(error => res.status(500).jsonp(error))
});
  
  module.exports = router;