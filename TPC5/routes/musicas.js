var express = require('express');
var router = express.Router();
var axios = require('axios')

function recupera_info(request, callback){
    if(request.headers['content-type'] == 'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', ()=>{
            console.log(body)
            callback(parse(body))
        })
    }
}

router.get('/', function(req, res, next) {
    axios.get("http://localhost:3000/musicas")
        .then(response => {
            var m = response.data
            res.render('index',{musicas:m})
        })
        .catch(function(erro){
            res.render('error',{error:erro})
        })
});

router.get('/:id',function(req,res,next){
    var id = req.params.id
    axios.get("http://localhost:3000/musicas/" + id)
        .then( response => {
            let m = response.data
            res.render('musica',{musica:m});
        })
        .catch(function(erro){
            res.render('error',{error:erro});
        })
});

router.post('/',function(req,res,next){
    console.log("POST de musica " + JSON.stringify(req.body))
    axios.post("http://localhost:3000/musicas", req.body)
        .then(response => {
            res.redirect('back');
        })
        .catch(function(erro){
            res.render('error' , {error : erro})
            })
});

router.get('/delete/:id', function(req, res, next) {
    var id = req.params.id
    axios.delete('http://localhost:3000/musicas/' + id)
        .then(response => {
            res.redirect('back')
        })
        .catch(function(erro){
            res.render('error',{error:erro})
        })
});

router.get('/prov/:prov',function(req,res,next){
    var id_prov = req.params.prov
    axios.get("http://localhost:3000/musicas?prov_id=" + id_prov)
        .then( response => {
            var m = response.data
            res.render('prov',{musicas:m});
        })
        .catch(function(erro){
            res.render('error',{error:erro});
        })
  });

module.exports = router;