var express = require('express');
var File = require('../controllers/file');
const file = require('../models/file');
var fs = require('fs')
var multer = require('multer')
var upload = multer({dest: 'uploads'})

var router = express.Router();

router.get('/', function(req, res, next) {
  File.list()
    .then(data => {
      res.render('index',{files:data})
    })
    .catch(error => {
      res.render('error', {error:error})
    })
});

router.post('/insert', upload.single('my_file'), (req,res) => {
  var date = new Date().toISOString().substring(0,16)
  console.log("coisas")
  console.log(req.file.path)
  let old_path = __dirname + '/../' + req.file.path
  let new_path = __dirname + '/../public/images/' + req.file.originalname
  fs.rename(old_path, new_path, erro => {
    if(erro) throw erro
  })

  var file = {
    name : req.file.originalname,
    mimetype : req.file.mimetype,
    description : req.body.description,
    size : req.file.size,
    date : date
  }

  File.insert(file)
    .then(() => {res.redirect(301,'/')})
    .catch(error => {res.render('error',{error:error})})
})

router.post('/delete/:id',(req,res)=>{
  File.look_up(req.params.id)
      .then(data => {
        var path = __dirname + '/../public/images/' + data.name
        fs.unlink(path, erro => {
          if(erro) res.render('error', {error:erro})
        })
      })
      .catch(erro => {res.render('error',{error:erro})})

  File.delete(req.params.id)
      .then(() => {res.redirect(301,'/')} )
      .catch(erro => {res.render('error',{error:erro})})
});

module.exports = router;
