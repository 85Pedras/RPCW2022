var http = require('http')
var axios = require('axios')
var fs = require('fs')
var {parse} = require('querystring')

function data_atual(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(),
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return diaF+"-"+mesF+"-"+anoF;
}

function data_atual_reverse(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(),
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return anoF+"-"+mesF+"-"+diaF;
}

function recupera_info(request, callback){
    if(request.headers['content-type'] ==
    'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }
}

function pagina_generator(tarefas,data,tarefa){
    let por_realizar = []
    let realizadas = []
    tarefas.forEach(t => {
        if(t.tipo == "Por realizar") por_realizar.push(t)
        else realizadas.push(t)
    });
    let line
    if (por_realizar.length > realizadas.length) line = 70 + (por_realizar.length*40)
    else line = 70 + (realizadas.length*40)
    let html = 
`<html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Tarefas</title>
    </head>
    <body>
        <div class="w3-container w3-margin-left">`
    if (JSON.stringify(tarefa) != '{}'){
        html += `
        <h3><b>Editar tarefa:</b></h3>
        </div>
        <form class="w3-container" w3-bottombar action="/${tarefa.id}" method="POST">
            <div class="w3-row-padding">
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Nome" value="${tarefa.nome}" name="nome" required>
                </div>
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Autor" value="${tarefa.autor}" name="autor" required>
                </div>
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Data limite" value="${tarefa.data_limite}" onfocus="(this.type='date')" onblur="(this.type='text')" name="data_limite" min="${data}" required>
                </div>`
    }
    else{
        html += `
        <h3><b>Registar tarefa:</b></h3>
        </div>
        <form class="w3-container" w3-bottombar method="POST">
            <div class="w3-row-padding">
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Nome" name="nome" required>
                </div>
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Autor" name="autor" required>
                </div>
                <div class="w3-third">
                    <input class="w3-input w3-border w3-border-black" type="text" placeholder="Data limite" onfocus="(this.type='date')" onblur="(this.type='text')" name="data_limite" min="${data}" required>
                </div>`
    }
    html += `        
            </div>
            <div class="w3-container w3-margin-top">
                <input class="w3-button w3-round w3-green w3-hover-green" type="submit" value="Registar"/>
                <input class="w3-button w3-round w3-red w3-hover-red" type="reset" value="Limpar valores"/>
            </div>
        </form>
        <hr style="height:10px;border-width:0;margin-bottom:0;color:black;background-color:black">
        <div class="w3-row">
            <div class="w3-col s6 w3-center w3-rightbar w3-border-black" style="height:${line}px;">
                <h2>Tarefas por realizar</h2>`
    por_realizar.forEach(t => {
        html += `
                <p>
                    ${t.nome} - Autor: ${t.autor} | Data limite: ${t.data_limite}
                    <a href="http://localhost:4000/done/${t.id}" class="w3-button w3-round w3-padding-small w3-green w3-hover-green">Realizada</a>
                    <a href="http://localhost:4000/edit/${t.id}" class="w3-button w3-round w3-padding-small w3-yellow w3-hover-yellow">Editar</a>
                    <a href="http://localhost:4000/delete/${t.id}" class="w3-button w3-round w3-padding-small w3-red w3-hover-red">Eliminar</a>
                </p>`
    })
    html += `
            </div>
            <div class="w3-col s6 w3-center w3-leftbar w3-border-black" style="height:${line}px;">
                <h2>Tarefas realizadas</h2>`
    realizadas.forEach(t => {
        html += `
                <p>
                    ${t.nome} - Autor: ${t.autor} | Data da realização: ${t.data_realizacao}
                    <a href="http://localhost:4000/delete/${t.id}" class="w3-button w3-round w3-padding-small w3-red w3-hover-red" style="width:12%">Eliminar</a>
                </p>`
    })
    html += `
            </div>
        </div>
    </body>
</html>`
    return html
}

// Criação do servidor
var to_do_list = http.createServer(function(req,res) {
    var d = data_atual()
    console.log(req.method + " " + req.url + " " + d)
    switch(req.method){
        case "GET":
            if(req.url == "/" ){
                axios.get("http://localhost:3000/tarefas")
                    .then(response => {
                        var tarefas = response.data
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write(pagina_generator(tarefas,data_atual_reverse(),{}))
                        res.end()
                    })
                    .catch(function(erro){
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write("<p>Erro")
                        res.end()
                    })
            }
            else if(/\/delete\/?/.test(req.url)){
                const id = req.url.split('/')[2]
                axios.delete('http://localhost:3000/tarefas/' + id)
                    .then(resp => {
                        res.writeHead(303, {'Location': '/'})
                        res.end()
                    })  
                    .catch(erro => {
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                    res.write("<p>Erro no DELETE: " + erro + '</p>')
                    res.end()
                })
            }
            else if(/\/done\/?/.test(req.url)){
                const id = req.url.split('/')[2]
                axios.get('http://localhost:3000/tarefas?id=' + id)
                    .then(resp => {
                        tarefa = (resp.data)[0]
                        tarefa.tipo = "Realizada"
                        tarefa.data_realizacao = d
                        axios.put('http://localhost:3000/tarefas/' + id, tarefa)
                            .then(resp => {
                                console.log('GET para marcar a tarefa com id ' + id + ' como realizada, sucesso!')
                                res.writeHead(303, {'Location': '/'})
                                res.end()
                            })
                            .catch(erro => {
                                res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                                res.write('<p>Erro ao marcar a tarefa como realizada: ' + erro + '</p>')
                                res.write('<p><a href="/">Voltar</a></p>')
                                res.end()
                            });
                    })
                    .catch(error => {
                        console.log('Erro: ' + error);
                        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                        res.write('<p>Erro ao marcar a tarefa como realizada: ' + error + '</p>')
                        res.end()
                    })
            }
            else if(/\/edit\/?/.test(req.url)){
                const id = req.url.split("/")[2]
                    axios.get('http://localhost:3000/tarefas')
                    .then(tarefas => {
                        axios.get('http://localhost:3000/tarefas?id=' + id)
                        .then(tarefa => {
                            console.log('GET para editar: Tarefa ' + id)
                            console.log(tarefa.data);
                            res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                            res.write(pagina_generator(tarefas.data, data_atual_reverse(), (tarefa.data)[0]))
                            res.end()
                        })
                        .catch(error => {
                            console.log('Erro: ' + error);
                            res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                            res.write('<p>Erro no edit: ' + error + '</p>')
                            res.end()
                        });
                    })
            }
            else{
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                res.write("<p>" + req.method + " " + req.url + " não suportado neste serviço.</p>")
                res.end()
            }
            break
        case "POST":
            if(req.url == "/" ){
                recupera_info(req,resultado => {
                    resultado['tipo'] = "Por realizar"
                    resultado['data_criacao'] = d
                    resultado['data_realizacao'] = ""
                    axios.post('http://localhost:3000/tarefas',resultado)
                        .then(response => {
                            res.writeHead(303, {'Location': '/'})
                            res.end()
                        })
                        .catch(function(erro){
                            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write('<p>Erro: ' + erro + '</p>')
                            res.end()
                        })
                    })
            }
            else if(/\/[0-9+]/.test(req.url)){
                recupera_info(req,resultado => {
                    const id = req.url.split("/")[1]
                        console.log('POST de uma tarefa editada: ' + id + ' - ' +  JSON.stringify(resultado))
                        axios.get('http://localhost:3000/tarefas?id=' + id)
                        .then(resp => {
                            var tarefa = (resp.data)[0]
                            if (resultado.data_limite != ""){
                                tarefa.data_limite = resultado.data_limite
                            }
                            if (resultado.autor != ""){
                                tarefa.autor = resultado.autor
                            }
                            if (resultado.nome != ""){
                                tarefa.nome = resultado.nome
                            }
                            axios.put('http://localhost:3000/tarefas/' + id, tarefa)
                            .then(resp => {
                                res.writeHead(303, {'Location': '/'})
                                res.end()
                            })
                            .catch(erro => {
                                res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                                res.write('<p>Erro no POST da edição: ' + erro + '</p>')
                                res.end()
                            });
                        })
                        .catch(erro => {
                            res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
                            res.write('<p>Erro no POST da edição: ' + erro + '</p>')
                            res.write('<p><a href="/">Voltar</a></p>')
                            res.end()
                        });
                    })
            }
            break
    }
})

to_do_list.listen(4000)
console.log('Servidor à escuta na porta 4000')