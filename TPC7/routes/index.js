var express = require('express');
var router = express.Router();
var axios = require('axios');
var fs = require('fs')

const api_key = fs.readFileSync('./api_key.txt',{encoding:'utf-8', flag:'r'})

router.get('/', function(req, res, next) {
  axios.get("http://clav-api.di.uminho.pt/v2/classes?nivel=1&apikey=" + api_key)
        .then(response => {
            var cs = response.data
            res.render('index',{classes:cs})
        })
        .catch(function(erro){
            res.render('error',{error:erro})
        })
});

router.get('/:class', function(req, res, next) {
    var class_id = req.params.class
    axios.get("http://clav-api.di.uminho.pt/v2/classes/c" + class_id + "?apikey=" + api_key)
          .then(response => {
              var c = response.data
              res.render('class',{c:c})
          })
          .catch(function(erro){
              res.render('error',{error:erro})
          })
  });

module.exports = router;
