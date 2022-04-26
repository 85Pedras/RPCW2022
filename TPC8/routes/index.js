var express = require('express');
var router = express.Router();
var Para = require("../controllers/para.js");
var cors = require('cors')

/* GET home page. */
router.get('/paras', function(req, res, next) {
  Para.listar()
    .then( data => res.status(200).jsonp(data))
    .catch( error => {
      console.log(error)
      res.status(501).jsonp({error: error})
    })
});

router.post("/paras", function(req, res, next){
  if(req.body._id == ""){
    Para.inserir(req.body)
      .then( data => res.status(200).jsonp(data))
      .catch( error => {
        console.log(error)
        res.status(502).jsonp({error: error})
      })
  }else{
    Para.alterar(req.body)
      .then( data => {
        res.status(200).jsonp(req.body)
      })
      .catch( error => {
        console.log(error)
        res.status(502).jsonp({error: error})
      })
  }
  
});

//id" , cors() , func
router.delete("/paras/:id", cors(), function(req, res, next){
  id = req.params.id
  Para.eliminar(id)
    .then(data => {
      console.log(id + ": " +data)
      res.status(200).jsonp({})
    })
    .catch(error => 
      res.status(504).jsonp({error: error})
    )
});

module.exports = router;
