var express = require('express');
var router = express.Router();
var multer = require('multer')
const StreamZip = require('node-stream-zip'); 
var upload = multer({dest: 'uploads_prov'})
var axios = require('axios')
var fs = require('fs')
const url = require('url')
var mkdirp = require('mkdirp');
var passport = require('passport')
const JSZip = require('jszip');
//-------------------------------------------------------------------------------------------

// Funções auxiliares ---------------------------------------------------------------------
function verificaAutenticacao(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else{
  res.redirect('/rrd/login');}
}

function existe (a,b) {
  for (i = 0; i < b.length; i++)
    if (b[i] == a) return true
  return false
}

function alterarMeta (info, body) {
  var ficheiros = []
  var path = '../file_system/' + info.tipo + '/' + info.nome
  fs.readFile(path, function(err,data) {
    if (err) console.log(err)
    JSZip.loadAsync(data).then(function (zip) {
      Object.keys(zip.files).forEach(function (filename) {
        if (filename != "RRD.json"){
          var objt = {}
          objt[filename] = zip.files[filename].async('nodebuffer')
          ficheiros.push(objt)
        }
      })
      const jszip = new JSZip();
      try {
        for (const file of ficheiros) {

          jszip.file(Object.keys(file)[0],Object.values(file)[0]);
        }
        var meta = {
          "titulo": body.titulo, 
          "tipo": info.tipo,
          "autor": body.criador,
          "utilizador": body.utilizador,
          "data_criacao": body.data_criacao,
          "data_submissao": body.data_submissao,
          "descricao": body.descricao}
          jszip.file("RRD.json",JSON.stringify(meta))
          jszip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
              .pipe(fs.createWriteStream(path))
              .on('finish', function () {
                  console.log("zip editado");
              });
      } catch (err) {
          console.log("erro ao alterar json: " + err)
      }
    })
  })
}
//-------------------------------------------------------------------------------------------

// Registar/Login/Logout ---------------------------------------------------------------------------
router.get('/registar', function(req, res) {
  res.render('registar',{titulo:"Registar", user: "", email: "", level: ""});
});

router.post('/registar', function(req, res) {
  axios.post('http://localhost:4200/users/registar', req.body)
    .then(dados => res.redirect('/rrd/login'))
    .catch(error => {
      res.render('registar', {titulo: "Registar", error: error.response.data.error, user: req.body.username, email: req.body.email, level: req.body.level})})
    
});

router.get('/login', function(req, res) {
  var q = url.parse(req.url,true).query;
  if (q.erro != undefined) res.render('login', {error: "Credenciais inválidas", user: ""})
  else res.render('login',{titulo:"Login", user: ""});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/rrd/login?erro=autenticacao' }), function(req, res) {
  axios.post('http://localhost:4200/users/login', req.user)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        maxAge : new Date(Date.now() + 3600000),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      var my_token = req.cookies.token
      var body = {texto: req.body.username + " fez login com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(e => {
      res.render('login', {error: e, user: req.body.username})
  })
})

router.get('/logout', verificaAutenticacao, function(req,res,next) {
  var my_token = req.cookies.token
  var body = {texto: req.user.data.username + " fez logout com sucesso"}
  axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
    .then (() => {
      req.logout(function(error) {
        if (error) return next(error)
      });
      req.session.destroy(function (err) {
        if (!err) {
          console.log("Req.session destroyed!");
          res.redirect('/rrd/login')
        } else {
          console.log("Destroy session error: " + err)
          res.status(500).jsonp({error: err})
        }
      });
    })
    .catch(error => res.render('error', {titulo: "Erro", error: error}))
  
})
//----------------------------------------------------------------------------------------------------

// Página principal ----------------------------------------------------------------------------------
router.get('/', verificaAutenticacao, function(req, res, next) {
  var q = url.parse(req.url,true).query;
  var my_token = req.cookies.token;
  if (q.tipo != undefined){
    axios.get('http://localhost:4000/api/recursos?tipo=' + q.tipo + '&token=' + my_token)
      .then(dados => {
        var files = dados.data.dados
        axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
          .then(dados => res.render('tipo', {tipo:q.tipo,files:files,tipos:dados.data,titulo:q.tipo,level:req.user.data.level, u:req.user.data.username}))
          .catch(error => res.render('error', {error:error}))
      })
      .catch(e => res.render('error', {error:e}))
  }
  else {
    axios.get('http://localhost:4000/api/recursos?token=' + my_token)
      .then(dados => {
        var files = dados.data.dados
        axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
          .then(dados => {
            var tipos = dados.data
            axios.get('http://localhost:4000/api/avisos?token=' + my_token)
              .then(dados => {
                res.render('index', {files:files,tipos:tipos, avisos: dados.data.dados, titulo:"Página Inicial",level:req.user.data.level,u: req.user.data.username})
              })
              .catch(error => res.render('error', {error:error}))
          })
          .catch(error => res.render('error', {error:error}))
      })
      .catch(e => res.render('error', {error:e}))
  }
  
});
//----------------------------------------------------------------------------------------------------

// Funções relativas a utilizadores/perfil -------------------------------------------------------------
router.get('/users', verificaAutenticacao, function(req, res) {
  var my_token = req.cookies.token
  axios.get('http://localhost:4200/users?token=' + my_token)
    .then(dados => {
      var users = dados.data
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('users', {users:users,tipos:dados.data,titulo:"Utilizadores",level:req.user.data.level}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{titulo: "Erro", error: error.response.data.error}))
})

router.get('/users/editar/:id', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4200/users/' + req.params.id + '?token=' + my_token)
    .then(dados => {
      var user = dados.data
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('editar_user', {user:user,tipos:dados.data,titulo:"Editar utilizador",level:req.user.data.level}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.post('/users/alterar/:id', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token;
  axios.put('http://localhost:4200/users/' + req.params.id + '?token=' + my_token, req.body)
    .then(dados => {
      var body = {texto: req.user.data.username + " editou um utilizador (ID: " + req.params.id + ") com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd/users')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(e => {
      var body = {texto: "ERRO ->" + req.user.data.username + " editar um utilizador (ID: " + req.params.id + "): " + e.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:e.response.data.error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    }) 
})

router.get('/users/delete/:id', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.delete('http://localhost:4200/users/' + req.params.id + '?token=' + my_token)
    .then(() => {
      var body = {texto: req.user.data.username + " eliminou um utilizador (ID: " + req.params.id + ") com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd/users')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(error => {
      var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um utilizador (ID: " + req.params.id + "): " + e.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
})

router.get('/users/:id', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4200/users/' + req.params.id + '?token=' + my_token)
    .then(dados => {
      var user = dados.data
      axios.get('http://localhost:4000/api/recursos?user=' + user.username + '&token=' + my_token)
        .then(dados => {
          var files = dados.data.dados
          axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
            .then(dados => res.render('user', {user:user, files:files,tipos:dados.data,titulo:"Utilizador",level:req.user.data.level}))
            .catch(error => res.render('error', {error:error}))
        })
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.get('/perfil', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4200/users/perfil/' + req.user.data.username + '?token=' + my_token)
    .then(dados => {
      var user = dados.data
      axios.get('http://localhost:4000/api/recursos?user=' + req.user.data.username + '&token=' + my_token)
        .then(dados => {
          var files = dados.data.dados
          axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
            .then(dados => res.render('perfil', {user:user, files:files, tipos:dados.data,titulo:"Meu perfil",level:req.user.data.level}))
            .catch(error => res.render('error', {error:error}))
        })
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.get('/perfil/editar', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4200/users/perfil/' + req.user.data.username + '?token=' + my_token)
    .then(dados => {
      var user = dados.data
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('editar_perfil', {user:user,tipos:dados.data,titulo:"Editar perfil",level:req.user.data.level}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.post('/perfil/alterar', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token;
  axios.put('http://localhost:4200/users/perfil/' + req.user.data.username + '?token=' + my_token, req.body)
    .then(dados => {
      var body = {texto: req.user.data.username + " alterou o seu perfil com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd/perfil')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(e => {
      var body = {texto: "ERRO ->" + req.user.data.username + "alterar o seu perfil: " + e.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:e.response.data.error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    }) 
})

router.get('/perfil/delete', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.delete('http://localhost:4200/users/perfil/' + req.user.data.username + '?token=' + my_token)
    .then(() => {
      var body = {texto: req.user.data.username + " eliminou o seu perfil com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          req.logout(function(error) {
            if (error) return next(error)
          });
          req.session.destroy(function (err) {
            if (!err) {
              console.log("Req.session destroyed!");
              res.redirect('/rrd/login')
            } else {
              console.log("Destroy session error: " + err)
              res.status(500).jsonp({error: err})
            }
          });
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
      
    })
    .catch(error => {
      var body = {texto: "ERRO ->" + req.user.data.username + " eliminar o seu perfil: " + e.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
  
})
//----------------------------------------------------------------------------------------------------

// Funções realtivas a recursos/avisos ---------------------------------------------------------------------
router.post('/upload', verificaAutenticacao, upload.single('my_zip'), function(req, res, next){
  var my_token = req.cookies.token
  good = 1
  manifestoExiste = 1
  informationExiste = 1
  goodManifesto = 1
  goodInformation = 1
  preview = "nao"
  lista_ficheiros = []
  files = []
  obj = {}
  files_string = []
  var erros = []

  if(req.file.mimetype === 'application/zip' || req.file.mimetype === "application/x-zip-compressed"){
    const zip = new StreamZip({file:req.file.path,storeEntries: true})
    zip.on('ready', () => {
      for (const entry of Object.values(zip.entries())) {
        lista_ficheiros.push(entry.name)
        
        if (entry.name != "manifesto.txt" && entry.name != "RRD.json"){
          var objt = {}
          file_string = zip.entryDataSync(entry.name)
          objt[entry.name] = file_string
          files_string.push(objt)
          files.push(entry.name)
          entry_file = entry.name.split('.')
          if (entry_file[1] == "pdf" || entry_file[1] == "xml") preview = entry_file[1]
        }
      }
      if (existe("manifesto.txt",lista_ficheiros)){ 
        manifesto = zip.entryDataSync("manifesto.txt").toString('utf8');
        man_file = manifesto.split("\n")
        for (i in man_file)
          man_file[i] = man_file[i].replace(/\r/,"")
        for (i in lista_ficheiros){
          if (existe(lista_ficheiros[i],man_file) == false){
            good = 0;
            goodManifesto = 0;
          } 
        }
      }
  
      if(existe("RRD.json",lista_ficheiros)){
        metadados = zip.entryDataSync("RRD.json").toString('utf-8');
        meta_obj = JSON.parse(metadados)
        if (!(meta_obj.hasOwnProperty('titulo') && meta_obj.hasOwnProperty('data_criacao') && meta_obj.hasOwnProperty('produtor') && meta_obj.hasOwnProperty('tipo') && meta_obj.hasOwnProperty('descricao'))){
          good = 0;  
          goodInformation = 0;
        }
      }

      if(!existe("manifesto.txt",lista_ficheiros) || !existe("RRD.json",lista_ficheiros)) {
        good = 0;
        if (!existe("manifesto.txt",lista_ficheiros)) manifestoExiste = 0;
        else informationExiste = 0;
      }
      
      if(good == 1) {
        req.body.titulo = meta_obj.titulo; 
        req.body.criador = meta_obj.produtor; 
        req.body.extensao = preview;
        req.body.data_criacao = meta_obj.data_criacao
        req.body.tipo = meta_obj.tipo
        req.body.ficheiros = files
        req.body.descricao = meta_obj.descricao
        req.body.tamanho = req.file.size
        req.body.data_submissao = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
        zip.close();
        next();
      }

      else {
        if (!manifestoExiste) erros.push("O zip não possui manifesto")
        if (!informationExiste) erros.push("O zip não possui o ficheiro RRD.json")
        if (!goodManifesto) erros.push("O conteúdo do manifesto não corresponde a todos os ficheiros do zip")
        if (!goodInformation) erros.push("O ficheiro RRD.json não possui todos os atributos")
        
        let quarantinePath = __dirname + '/../' + req.file.path
        try {
          fs.unlinkSync(quarantinePath) //file removed
        } catch(err) {
          console.error(err)
        }
        var body = {texto: "ERRO ->" + req.user.data.username + " dar upload de um recurso: Ficheiro não cumpre requisitos"}
        axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
          .then (() => {
            res.render('error', {error: "Upload não realizado", erros:erros})
          })
          .catch(error => res.render('error', {titulo: "Erro", error: error}))
        
      } 
    });
  }
  else{
    erros.push("O ficheiro não é um zip")
    let quarantinePath = __dirname + '/../' + req.file.path
        try {
          fs.unlinkSync(quarantinePath) //file removed
        } catch(err) {
          console.error(err)
        }
    var body = {texto: "ERRO ->" + req.user.data.username + " dar upload de um recurso: Ficheiro não cumpre requisitos"}
    axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
      .then (() => {
        res.render('error', {error: "Upload não realizado", erros:erros})
      })
      .catch(error => res.render('error', {titulo: "Erro", error: error}))
  }
}, function(req,res){
  var my_token = req.cookies.token
  let old_path = __dirname + '/../' + req.file.path
  let new_path = __dirname + '/../../file_system/' + req.body.tipo
  mkdirp(new_path)
  .then(data => {
    new_path += '/' + req.file.originalname
    fs.rename(old_path, new_path, erro => {
      if(erro){ 
        throw erro
      }
      else {
        req.body.nome = req.file.originalname
        req.body.utilizador = req.user.data.username
        const jszip = new JSZip();
        try {
            jszip.file("manifesto.txt", manifesto);
            for (const file of files_string) {
                jszip.file(Object.keys(file)[0],Object.values(file)[0]);
            }
            var meta = {
              "titulo": req.body.titulo, 
              "tipo": req.body.tipo,
              "autor": req.body.criador,
              "utilizador": req.body.utilizador,
              "data_criacao": req.body.data_criacao,
              "data_submissao": req.body.data_submissao,
              "descricao": req.body.descricao}
            jszip.file("RRD.json",JSON.stringify(meta))
            jszip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(new_path))
                .on('finish', function () {
                    console.log("zip modficado");
                });
        } catch (err) {
            console.log(err)
        }
        axios.post('http://localhost:4000/api/recursos?token=' + my_token,req.body)
          .then(dados => {
            var body = {texto: req.user.data.username + " fez o upload do recurso " + meta_obj.titulo + " com sucesso"}
            axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
              .then (() => {
                res.redirect('/rrd')
              })
              .catch(error => res.render('error', {titulo: "Erro", error: error}))
          })
          .catch(e => {
            var body = {texto: "ERRO ->" + req.user.data.username + " dar upload do recurso " + meta_obj.titulo + ": " + e.response.data.error}
            axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
              .then (() => {
                res.render('error', {error:e.response.data.error})
              })
              .catch(error => res.render('error', {titulo: "Erro", error: error}))
          }) 
      }
    })
  })
});

router.get('/recursos/download/:rid', verificaAutenticacao, function(req,res) {
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token)
    .then(dados => {
      var body = {texto: req.user.data.username + " fez o download de um recurso (ID: " + req.params.rid + ") com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.download(__dirname + '/../../file_system/' + dados.data.tipo + '/' + dados.data.nome)
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(error => {
      var body = {texto: "ERRO ->" + req.user.data.username + " fazer download de um recurso (ID: " + req.params.rid + "): " + error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
})

router.post('/aviso', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  req.body.data_submissao = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
  req.body.autor = req.user.data.username
  axios.post('http://localhost:4000/api/avisos?token=' + my_token, req.body)
    .then(dados => {
      var body = {texto: req.user.data.username + " submeteu um aviso com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(error => {
      var body = {texto: "ERRO ->" + req.user.data.username + " submeter um aviso: " + error.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {titulo: "Erro", error: error.response.data.error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
})

router.get('/recursos', verificaAutenticacao, function(req, res, next) {
  var my_token = req.cookies.token;
  axios.get('http://localhost:4000/api/recursos?token=' + my_token)
    .then(dados => {
      var files = dados.data.dados
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => {
          var tipos = dados.data
          res.render('recursos', {files:files,tipos:tipos, titulo:"Recursos",level:req.user.data.level,u: req.user.data.username})
        })
        .catch(error => res.render('error', {error:error}))
    })
    .catch(e => res.render('error', {error:e}))
});

router.get('/avisos', verificaAutenticacao, function(req, res, next) {
  var my_token = req.cookies.token;
  axios.get('http://localhost:4000/api/avisos?token=' + my_token)
    .then(dados => {
      var avisos = dados.data.dados
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => {
          var tipos = dados.data
          res.render('avisos', {avisos:avisos,tipos:tipos, titulo:"Avisos",level:req.user.data.level,u: req.user.data.username})
        })
        .catch(error => res.render('error', {error:error}))
    })
    .catch(e => res.render('error', {error:e}))
});;

router.get('/recursos/:rid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token)
    .then(dados => {
      var file = dados.data
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('recurso', {file:file,tipos:dados.data,titulo:file.titulo,level:req.user.data.level,u:req.user.data.username}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.get('/avisos/:aid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/avisos/' + req.params.aid + '?token=' + my_token)
    .then(dados => {
      var aviso = dados.data
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('aviso', {aviso:aviso,tipos:dados.data,titulo:"Aviso",level:req.user.data.level,u:req.user.data.username}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.post('/search', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/recursos?q=' + req.body.search + '&token=' + my_token)
    .then(dados => {
      var files = dados.data.dados
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('pesquisa', {files:files,tipos:dados.data,titulo: "Pesquisa",level:req.user.data.level,u:req.user.data.username}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{error:error}))
})

router.get('/recursos/editar/:rid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  if (req.user.data.level != "Consumidor"){
    axios.get('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token)
      .then(dados => {
        var file = dados.data
        if (req.user.data.level === "Administrador" || file.utilizador == req.user.data.username){
          axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
            .then(dados => res.render('editar_recurso', {file:file,tipos:dados.data,titulo:"Editar recurso",level:req.user.data.level,u:req.user.data.level}))
            .catch(error => res.render('error', {error:error}))
        }
        else res.render('error', {titulo:"Erro",error:"Não autorizado"})
      })
      .catch(error => res.render('error',{error:error}))
  }
  else res.render('error', {titulo:"Erro",error:"Não autorizado"})
})

router.post('/recursos/alterar/:rid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token;
  axios.get('http://localhost:4000/api/recursos/path/' + req.params.rid + '?token=' + my_token)
    .then(dados => {
      var info = dados.data[0]
      alterarMeta(info,req.body)
      axios.put('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token, req.body)
        .then(dados => {
          var body = {texto: req.user.data.username + " editou um recurso (ID: " + req.params.rid + ") com sucesso"}
          axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
            .then (() => {
              res.redirect('/rrd/recursos/' + req.params.rid)
            })
            .catch(error => res.render('error', {titulo: "Erro", error: error}))
        })
        .catch(e => {
          var body = {texto: "ERRO ->" + req.user.data.username + " editar um recurso (ID: " + req.params.rid + "): " + e.response.data.error}
          axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
            .then (() => {
              res.render('error', {error:e.response.data.error})
            })
            .catch(error => res.render('error', {titulo: "Erro", error: error}))
        })
    })
    .catch(e => res.render('error', {error:e.response.data.error}))
   
})

router.get('/recursos/delete/:rid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  if (req.user.data.level != "Consumidor"){
    axios.get('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token)
      .then(dados => {
        if (req.user.data.level === "Administrador" || dados.data.utilizador == req.user.data.username){
          var path = __dirname + '/../../file_system/' + dados.data.tipo + '/' + dados.data.nome
          fs.unlink(path, error => {
            if(error) res.render('error', {error:error})
          })
          axios.delete('http://localhost:4000/api/recursos/' + req.params.rid + '?token=' + my_token)
            .then(() => {
              var body = {texto: req.user.data.username + " eliminou um recurso (ID: " + req.params.rid + ") com sucesso"}
              axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                .then (() => {
                  res.redirect('/rrd')
                })
                .catch(error => res.render('error', {titulo: "Erro", error: error}))
          })
            .catch(e => {
              var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um recurso (ID: " + req.params.rid + "): " + e.response.data.error}
              axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                .then (() => {
                  res.render('error', {error:e.response.data.error})
                })
                .catch(error => res.render('error', {titulo: "Erro", error: error}))
            })
        }
        else{
          var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um recurso (ID: " + req.params.rid + "): Não autorizado"}
          axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
            .then (() => {
              res.render('error', {titulo:"Erro",error:"Não autorizado"})
            })
            .catch(error => res.render('error', {titulo: "Erro", error: error}))
        }
      })
      .catch(error => res.render('error',{error:error}))
  }
  else{
    var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um recurso (ID: " + req.params.rid + "): Não autorizado"}
    axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
      .then (() => {
        res.render('error', {titulo:"Erro",error:"Não autorizado"})
      })
      .catch(error => res.render('error', {titulo: "Erro", error: error}))
  }
  
})

router.post('/recursos/comentar/:rid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  req.body.data_submissao = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
  req.body.autor = req.user.data.username
  axios.post('http://localhost:4000/api/recursos/comentar/' + req.params.rid + '?token=' + my_token, req.body)
    .then(dados => {
      var body = {texto: req.user.data.username + " comentou um recurso (ID: " + req.params.rid + ") com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('back')
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(error => {
      var body = {texto: "ERRO ->" + req.user.data.username + " comentar um recurso (ID: " + req.params.rid + "): " + error.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {titulo: "Erro", error: error.response.data.error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
})

router.get('/recursos/comentarios/:rid/delete/:cid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  var rid = req.params.rid
  var cid = req.params.cid
  var flag = false
  axios.get('http://localhost:4000/api/recursos/' + rid + '?token=' + my_token)
    .then(dados => {
      if (req.user.data.level === "Administrador" || dados.data.utilizador == req.user.data.username){
        axios.delete('http://localhost:4000/api/recursos/comentarios/' + rid + '/delete/' + cid + '?token=' + my_token)
          .then(() => {
            var body = {texto: req.user.data.username + " eliminou um comentário de um recurso (ID: " + req.params.rid + ") com sucesso"}
            axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
              .then (() => {
                res.redirect('back')
              })
              .catch(error => res.render('error', {titulo: "Erro", error: error}))
          })
          .catch(error => {
            var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um comentário de um recurso (ID: " + req.params.rid + "): " + error.response.data.error}
            axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
              .then (() => {
                res.render('error', {titulo: "Erro", error: error.response.data.error})
              })
              .catch(error => res.render('error', {titulo: "Erro", error: error}))
          })
      }
      else{
        dados.data.comentarios.forEach(c => {
          if (c.id == cid && req.user.data.username == c.autor){
            flag = true
            axios.delete('http://localhost:4000/api/recursos/comentarios/' + rid + '/delete/' + cid + '?token=' + my_token)
              .then(() => {
                var body = {texto: req.user.data.username + " eliminou um comentário de um recurso (ID: " + req.params.rid + ") com sucesso"}
                axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                  .then (() => {
                    res.redirect('back')
                  })
                  .catch(error => res.render('error', {titulo: "Erro", error: error}))
              })
              .catch(error => {
                var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um comentário de um recurso (ID: " + req.params.rid + "): " + error.response.data.error}
                axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                  .then (() => {
                    res.render('error', {titulo: "Erro", error: error})
                  })
                  .catch(error => res.render('error', {titulo: "Erro", error: error}))
              })
          }
        })
        if (flag == false) {
          var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um comentário de um recurso (ID: " + req.params.rid + "): Não autorizado"}
          axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
            .then (() => {
              res.render('error', {titulo:"Erro",error:"Não autorizado"})
            })
            .catch(error => res.render('error', {titulo: "Erro", error: error}))
        }
      }
    })
    .catch(error => res.render('error',{error:error}))
})

router.get('/avisos/editar/:aid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  if (req.user.data.level != "Consumidor"){
    axios.get('http://localhost:4000/api/avisos/' + req.params.aid + '?token=' + my_token)
      .then(dados => {
        var aviso = dados.data
        if (req.user.data.level === "Administrador" || aviso.autor == req.user.data.username){
          axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
            .then(dados => res.render('editar_aviso', {aviso:aviso,tipos:dados.data,titulo:"Editar aviso",level:req.user.data.level,u:req.user.data.level}))
            .catch(error => res.render('error', {error:error}))
        }
        else res.render('error', {titulo:"Erro",error:"Não autorizado"})
      })
      .catch(error => res.render('error',{error:error}))
  }
  else res.render('error', {titulo:"Erro",error:"Não autorizado"})
})

router.post('/avisos/alterar/:aid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token;
  req.body.data_submissao = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString().slice(0, 16).split('T').join(' ')
  axios.put('http://localhost:4000/api/avisos/' + req.params.aid + '?token=' + my_token, req.body)
    .then(dados => {
      var body = {texto: req.user.data.username + " editou um aviso (ID: " + req.params.aid + ") com sucesso"}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.redirect('/rrd/avisos/' + req.params.aid)
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
    })
    .catch(e => {
      var body = {texto: "ERRO ->" + req.user.data.username + " editar um aviso (ID: " + req.params.aid + "): " + e.response.data.error}
      axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
        .then (() => {
          res.render('error', {error:e.response.data.error})
        })
        .catch(error => res.render('error', {titulo: "Erro", error: error}))
      
    })
})

router.get('/avisos/delete/:aid', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  if (req.user.data.level != "Consumidor"){
    axios.get('http://localhost:4000/api/avisos/' + req.params.aid + '?token=' + my_token)
      .then(dados => {
        if (req.user.data.level === "Administrador" || dados.data.autor == req.user.data.username){
          axios.delete('http://localhost:4000/api/avisos/' + req.params.aid + '?token=' + my_token)
            .then(() => {
              var body = {texto: req.user.data.username + " eliminou um aviso (ID: " + req.params.aid + ") com sucesso"}
              axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                .then (() => {
                  res.redirect('/rrd/avisos')
                })
                .catch(error => res.render('error', {titulo: "Erro", error: error}))
            })
            .catch(e => {
              var body = {texto: "ERRO ->" + req.user.data.username + "eliminar um aviso (ID: " + req.params.aid + "): " + e.response.data.error}
              axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
                .then (() => {
                  res.render('error', {error:e.response.data.error})
                })
                .catch(error => res.render('error', {titulo: "Erro", error: error}))
            })
        }
        else {
          var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um aviso (ID: " + req.params.aid + "): Não autorizado"}
          axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
            .then (() => {
              res.render('error', {titulo:"Erro",error:"Não autorizado"})
            })
            .catch(error => res.render('error', {titulo: "Erro", error: error}))
        }
      })
      .catch(error => res.render('error',{error:error}))
  }
  else {
    var body = {texto: "ERRO ->" + req.user.data.username + " eliminar um aviso (ID: " + req.params.aid + "): Não autorizado"}
    axios.post('http://localhost:4000/api/logs?token=' + my_token, body)
      .then (() => {
        res.render('error', {titulo:"Erro",error:"Não autorizado"})
      })
      .catch(error => res.render('error', {titulo: "Erro", error: error}))
  }
  
})

// Funções relativas a logs
router.get('/logs', verificaAutenticacao, function(req, res) {
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/logs?token=' + my_token)
    .then(dados => {
      var logs = dados.data.dados
      axios.get('http://localhost:4000/api/recursos/tipos?token=' + my_token)
        .then(dados => res.render('logs', {logs:logs,tipos:dados.data,titulo:"Logs",level:req.user.data.level}))
        .catch(error => res.render('error', {error:error}))
    })
    .catch(error => res.render('error',{titulo: "Erro", error: error.response.data.error}))
})

router.get('/logs/download', verificaAutenticacao, function(req, res) {
  var my_token = req.cookies.token
  axios.get('http://localhost:4000/api/logs?token=' + my_token)
    .then(dados => {
      var logs = JSON.stringify(dados.data.dados,null,4)
      if(logs.length > 0){
        var path = __dirname + '/../logs/logs.json'
        fs.writeFileSync(path, logs);
        res.download(path)
      }
      else res.redirect('/rrd/logs')
    })
    .catch(error => res.render('error',{titulo: "Erro", error: error.response.data.error}))
})

router.get('/logs/reset', verificaAutenticacao, function(req,res){
  var my_token = req.cookies.token
  axios.delete('http://localhost:4000/api/logs?token=' + my_token)
    .then(() => res.redirect('back'))
    .catch(error => res.render('error',{error:error}))
  
})

module.exports = router;

