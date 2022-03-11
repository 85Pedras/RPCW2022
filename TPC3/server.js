const http = require("http")
const url = require("url")
const fs = require("fs")
const axios = require('axios')

function main_page_generator(){
    return `<!DOCTYPE html>
    <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
            <title>TPC3 - Escola de Música</title>
        </head>
        <body>
            <ul class="w3-ul w3-border">
                <li class="w3-black"><h1>Escola de Música</h1></li>
                <li class="w3-hover-grey"><h2><a href="http://localhost:4000/alunos">Alunos</a></h2></li>
                <li class="w3-hover-grey"><h2><a href="http://localhost:4000/cursos">Cursos</a></h2></li>
                <li class="w3-hover-grey"><h2><a href="http://localhost:4000/instrumentos">Intrumentos</a></h2></li>
            </ul>
        </body>
    </html>`
}

function students_generator(res){
    axios.get('http://localhost:3000/alunos')
    .then(function(resp) {
        data = resp.data
        var html = `<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script src="https://kit.fontawesome.com/c0690ba0c7.js" crossorigin="anonymous"></script>
        <title>TPC3 - Alunos</title>
    </head>
    <body>
        <div class="w3-bar w3-black w3-large">
            <a href="http://localhost:4000/" class="w3-bar-item w3-button"><i class="fa-solid fa-house"></i></a>
            <a href="http://localhost:4000/alunos" class="active w3-bar-item w3-button">Alunos</a>
            <a href="http://localhost:4000/cursos" class="w3-bar-item w3-button">Cursos</a>
            <a href="http://localhost:4000/instrumentos" class="w3-bar-item w3-button">Instrumentos</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>Alunos</h2></li>
        </ul>
        <table class="w3-table w3-white w3-hoverable">
            <thead>
                <tr>
                    <td><h5><b>ID</b></h5></th>
                    <td><h5><b>Nome</b></h5></th>
                    <td><h5><b>Curso</b></h5></th>
                    <td><h5><b>Intrumento</b></h5></th>
                </tr>
            </thead>`
        data.forEach(a => {
            html += `
            <tr>
                <td>` + a.id + `</td>
                <td><a href="http://localhost:4000/alunos?id=` + a.id + `">` + a.nome + `</a></td>
                <td><a href="http://localhost:4000/cursos?id=` + a.curso + `">` + a.curso + `</a></td>
                <td>` + a.instrumento + `</td>
            </tr>`
        });
        html += `
        </table>
    </body>
</html>`
        //console.log(html)
        res.write(html)
        res.end()
    })
    .catch(function (error) {
        console.log(error)
    });
}

function courses_generator(res){
    axios.get('http://localhost:3000/cursos')
    .then(function(resp) {
        data = resp.data
        var html = `<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script src="https://kit.fontawesome.com/c0690ba0c7.js" crossorigin="anonymous"></script>
        <title>TPC3 - Cursos</title>
    </head>
    <body>
        <div class="w3-bar w3-black w3-large">
            <a href="http://localhost:4000/" class="w3-bar-item w3-button"><i class="fa-solid fa-house"></i></a>
            <a href="http://localhost:4000/alunos" class="active w3-bar-item w3-button">Alunos</a>
            <a href="http://localhost:4000/cursos" class="w3-bar-item w3-button">Cursos</a>
            <a href="http://localhost:4000/instrumentos" class="w3-bar-item w3-button">Instrumentos</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>Cursos</h2></li>
        </ul>
        <table class="w3-table w3-white w3-hoverable">
            <thead>
                <tr>
                    <td><h5><b>ID</b></h5></th>
                    <td><h5><b>Designação</b></h5></th>
                    <td><h5><b>Duração</b></h5></th>
                </tr>
            </thead>`
        data.forEach(c => {
            html += `
            <tr>
                <td>` + c.id + `</td>
                <td><a href="http://localhost:4000/cursos?id=` + c.id + `">` + c.designacao + `</a></td>
                <td>` + c.duracao + `</td>
            </tr>`
        });
        html += `
        </table>
    </body>
</html>`
        //console.log(html)
        res.write(html)
        res.end()
    })
    .catch(function (error) {
        console.log(error)
    });
}

function instruments_generator(res){
    axios.get('http://localhost:3000/instrumentos')
    .then(function(resp) {
        data = resp.data
        var html = `<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script src="https://kit.fontawesome.com/c0690ba0c7.js" crossorigin="anonymous"></script>
        <title>TPC3 - Instrumentos</title>
    </head>
    <body>
        <div class="w3-bar w3-black w3-large">
            <a href="http://localhost:4000/" class="w3-bar-item w3-button"><i class="fa-solid fa-house"></i></a>
            <a href="http://localhost:4000/alunos" class="active w3-bar-item w3-button">Alunos</a>
            <a href="http://localhost:4000/cursos" class="w3-bar-item w3-button">Cursos</a>
            <a href="http://localhost:4000/instrumentos" class="w3-bar-item w3-button">Instrumentos</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>Instrumentos</h2></li>
        </ul>
        <table class="w3-table w3-white w3-hoverable">
            <thead>
                <tr>
                    <td><h5><b>ID</b></h5></th>
                    <td><h5><b>Designação</b></h5></th>
                </tr>
            </thead>`
        data.forEach(i => {
            old_key = '#text'
            new_key = 'text'
            i[new_key] = i[old_key]
            delete i[old_key]
            html += `
            <tr>
                <td>` + i.id + `</td>
                <td>` + i.text + `</td>
            </tr>`
        });
        html += `
        </table>
    </body>
</html>`
        //console.log(html)
        res.write(html)
        res.end()
    })
    .catch(function (error) {
        console.log(error)
    });
}

function student_generator(res,id_aluno){
    axios.get('http://localhost:3000/alunos?id=' + id_aluno)
    .then(function(resp) {
        data = resp.data
        var html = `<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script src="https://kit.fontawesome.com/c0690ba0c7.js" crossorigin="anonymous"></script>
        <title>TPC3 - ` + data[0].nome + `</title>
    </head>
    <body>
        <div class="w3-bar w3-black w3-large">
            <a href="http://localhost:4000/" class="w3-bar-item w3-button"><i class="fa-solid fa-house"></i></a>
            <a href="http://localhost:4000/alunos" class="active w3-bar-item w3-button">Alunos</a>
            <a href="http://localhost:4000/cursos" class="w3-bar-item w3-button">Cursos</a>
            <a href="http://localhost:4000/instrumentos" class="w3-bar-item w3-button">Instrumentos</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>` + data[0].id + `: ` + data[0].nome + `</h2></li>
        </ul>
        <div class="w3-container">
            <h4><b>Data de nascimento: </b>` + data[0].dataNasc + `</h4>
            <h4><b>Curso: </b><a href="http://localhost:4000/cursos?id=` + data[0].curso + `">` + data[0].curso + `</a></h4>
            <h4><b>Ano: </b>` + data[0].anoCurso + `</h4>
            <h4><b>Instrumento: </b>` + data[0].instrumento + `</h4>
        </div>`
        html += `
    </body>
</html>`
        //console.log(html)
        res.write(html)
        res.end()
    })
    .catch(function (error) {
        console.log(error)
    });
}

function course_generator(res,id_curso){
    axios.get('http://localhost:3000/cursos?id=' + id_curso)
    .then(function(resp) {
        data = resp.data
        old_key = '#text'
        new_key = 'text'
        data[0].instrumento[new_key] = data[0].instrumento[old_key]
        delete (data[0].instrumento[old_key])
        var html = `<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script src="https://kit.fontawesome.com/c0690ba0c7.js" crossorigin="anonymous"></script>
        <title>TPC3 - ` + data[0].designacao + `</title>
    </head>
    <body>
        <div class="w3-bar w3-black w3-large">
            <a href="http://localhost:4000/" class="w3-bar-item w3-button"><i class="fa-solid fa-house"></i></a>
            <a href="http://localhost:4000/alunos" class="active w3-bar-item w3-button">Alunos</a>
            <a href="http://localhost:4000/cursos" class="w3-bar-item w3-button">Cursos</a>
            <a href="http://localhost:4000/instrumentos" class="w3-bar-item w3-button">Instrumentos</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>` + data[0].id + `: ` + data[0].designacao + `</h2></li>
        </ul>
        <div class="w3-container">
            <h4><b>Duração: </b>` + data[0].duracao + `</h4>
            <h4><b>instrumento: </b>` + data[0].instrumento.text + `</h4>
        </div>`
        html += `
    </body>
</html>`
        //console.log(html)
        res.write(html)
        res.end()
    })
    .catch(function (error) {
        console.log(error)
    });
}

function create_server(){
    myserver = http.createServer( function(req,res) {
        var myurl = url.parse(req.url,true).pathname
        var query = url.parse(req.url,true).query
        console.log("URL: " + myurl)
        console.log("Query: " + query["id"])
        file=myurl.substring(1)
        arrStrings=myurl.split("/")

        if(arrStrings[1]=="alunos"){
            if(!query["id"]){
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                students_generator(res)
            }
            else{
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                student_generator(res,query["id"])
            }
        }

        else if(arrStrings[1]=="cursos"){
            if(!query["id"]){
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                courses_generator(res)
            }
            else{
                course_generator(res,query["id"])
            }
        }

        else if(arrStrings[1]=="instrumentos"){
            if(arrStrings.length==2){
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                instruments_generator(res)
            }
            else{

            }
        }
        else if(!arrStrings[1]){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(main_page_generator())
            res.end()

        }
    })

    myserver.listen(4000)
    console.log("Servidor a escuta na porta 4000")
}

create_server()