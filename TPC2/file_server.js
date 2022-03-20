const http = require("http")
const url = require("url")
const fs = require("fs")

myserver = http.createServer( function(req,res) {
    var myurl = url.parse(req.url,true).pathname
    console.log("URL: " + myurl)
    file=myurl.substring(1)
    arrStrings=myurl.split("/")
    console.log(arrStrings)
    if(arrStrings[1]=="filmes"){
        if(arrStrings.length==2){
            file="html/filmes.html"
        }else{
            file="html/" + arrStrings[1]+"/"+arrStrings[2]+".html"
        }
    }
    else{
        if(arrStrings[1]=="atores"){
            if(arrStrings.length==2){
                file="html/atores.html"
            }else{
                file="html/" + arrStrings[1]+"/"+arrStrings[2]+".html"
            }
        }
        else{
            file="html/index.html"
        }
    }
    
    console.log("Ficheiro pedido: " + file)

    fs.readFile(file, function(err, data){
        if(err){
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            res.write("Erro na leitura do ficheiro...");
        }else{
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(data);
        }
        res.end();
    })
})

myserver.listen(7777)
console.log("Servidor a escuta na porta 7777")