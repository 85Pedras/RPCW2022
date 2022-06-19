var express = require('express');
var router = express.Router();
var Log = require('../controllers/log')

// Listar logs
router.get('/', function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  Log.list()
    .then(dados => {
      res.status(200).jsonp({dados})
    })
    .catch(error => res.status(500).jsonp(error))
});

// Inserir log
router.post('/', function(req, res){
  console.log(req.body)
  req.body.data = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
  Log.insert(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
})

// Resetar logs
router.delete('/', function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  Log.reset()
    .then(() => {
      res.status(200).jsonp()
    })
    .catch(error => res.status(500).jsonp(error))
});

module.exports = router;