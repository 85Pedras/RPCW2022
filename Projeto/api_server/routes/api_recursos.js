var express = require('express');
var router = express.Router();
var File_Info = require('../controllers/file_info')
const url = require('url')
const mongoose = require('mongoose')

// Listar recursos
router.get('/', function(req, res, next) {
  var q = url.parse(req.url,true).query;
  if (q.tipo != undefined) {
    File_Info.list_by_tipo(q.tipo)
      .then(dados => {
        res.status(200).jsonp({dados})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else if (q.q != undefined) {
    File_Info.look_up_regex(q.q)
      .then(dados => {
        res.status(200).jsonp({dados})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else if (q.user != undefined) {
    File_Info.list_by_user(q.user)
      .then(dados => {
        res.status(200).jsonp({dados})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else {
    File_Info.list()
      .then(dados => {
        res.status(200).jsonp({dados})
      })
      .catch(error => res.status(500).jsonp(error))
  }
});

// Inserir um recurso
router.post('/', function(req,res,next) {
  if (req.user.level != "Consumidor") next();
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  File_Info.insert(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
})

// Listar tipos
router.get('/tipos', function(req, res, next) {
  File_Info.list_tipos()
    .then(dados => {
      var tipos = new Set()
      dados.forEach(d => {
        tipos.add(d.tipo)
      })
      var tipos_sorted = Array.from(tipos).sort()
      res.status(200).jsonp(tipos_sorted)
    })
    .catch(error => res.status(500).jsonp(error))
});

// Consultar a path de um recurso
router.get('/path/:rid', function(req, res, next) {
  File_Info.path(req.params.rid)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
});

// Comentar
router.post('/comentar/:rid', function(req,res,next) {
  
  req.body._id = req.params.rid
  req.body.id = mongoose.Types.ObjectId()
  File_Info.add_comentario(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
})

// Eliminar um comentário
router.delete('/comentarios/:rid/delete/:cid', function(req, res, next) {
  var flag = false
  if (req.user.level === "Administrador") next();
  else {
    File_Info.look_up(req.params.rid)
      .then(dados => {
        if (req.user.username == dados.utilizador) next()
        else {
          dados.comentarios.forEach(c => {
            console.log(c)
            if (c.id == req.params.cid && req.user.username == c.autor){
              flag = true
              next()
            } 
          })
          if (flag == false) res.status(401).jsonp({error: "Não autorizado"})
        }
      })
      .catch(error => res.status(500).jsonp(error))
  }
}, function(req, res) {
  req.body._id = req.params.rid
  req.body.id = req.params.cid
  File_Info.delete_comentario(req.body)
    .then(() => res.status(200).jsonp())
    .catch(error => res.status(500).jsonp(error))
});

// Consultar um recurso
router.get('/:rid', function(req, res, next) {
  File_Info.look_up(req.params.rid)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
});


// Editar um recurso
router.put('/:rid', function(req,res,next) {
  if (req.user.level === "Administrador") next();
  else if (req.user.level === "Produtor") {
    File_Info.look_up(req.params.rid)
      .then(dados => {
        console.log(dados)
        if (req.user.username == dados.utilizador) next()
        else res.status(401).jsonp({error: "Não autorizado"})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res){
  req.body._id = req.params.rid
  File_Info.editar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Eliminar um recurso
router.delete('/:rid', function(req, res, next) {
  if (req.user.level === "Administrador") next();
  else if (req.user.level === "Produtor") {
    File_Info.look_up(req.params.rid)
      .then(dados => {
        if (req.user.username == dados.data.utilizador) next()
        else res.status(401).jsonp({error: "Não autorizado"})
      })
      .catch(error => res.status(500).jsonp(error))
  }
  else res.status(401).jsonp({error: "Não autorizado"})
}, function(req, res) {
  File_Info.delete(req.params.rid)
    .then(() => res.status(200).jsonp())
    .catch(error => res.status(500).jsonp(error))
});

module.exports = router;
