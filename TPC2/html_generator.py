import json
from operator import index

movies = {}
actors = {}

with open('cinemaATP.json', encoding='utf-8') as f: data = json.load(f)

def home_page_generator():
    page = open("./html/index.html","w",encoding='utf-8')
    index_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Indice</title>
    </head>
    <body>
        <ul class="w3-ul w3-border">
            <li class="w3-black"><h1>TPC2 - Indice</h1></li>
            <li class="w3-hover-grey"><h2><a href="http://localhost:7777/filmes">Filmes</a></h2></li>
            <li class="w3-hover-grey"><h2><a href="http://localhost:7777/atores">Atores</a></h2></li>
        </ul>
    </body>
</html>"""
    page.write(index_html)

def movies_page_generator():
    page = open("./html/filmes.html","w",encoding='utf-8')
    movies_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Filmes</title>
    </head>
    <body>
        <div class="w3-bar w3-black">
            <a href="http://localhost:7777/" class="w3-bar-item w3-button">Indice</a>
            <a href="http://localhost:7777/filmes" class="active w3-bar-item w3-button">Filmes</a>
            <a href="http://localhost:7777/atores" class="w3-bar-item w3-button">Atores</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>Filmes</h2></li>"""

    for m in movies:
        nr = str(movies[m][0])
        movie_html = "\n\t\t\t<li class=\"w3-hover-grey\"><a href=\"http://localhost:7777/filmes/f" + nr + "\">-> " + m + " - " + str(movies[m][1]) + "</a></li>"
        movies_html += movie_html
        movie_page_generator(nr,m)

    movies_html += """
        </ul>
    </body>
</html>"""
    page.write(movies_html)

def actors_page_generator():
    page = open("./html/atores.html","w",encoding='utf-8')
    actors_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Atores</title>
    </head>
    <body>
        <div class="w3-bar w3-black">
            <a href="http://localhost:7777/" class="w3-bar-item w3-button">Indice</a>
            <a href="http://localhost:7777/filmes" class="w3-bar-item w3-button">Filmes</a>
            <a href="http://localhost:7777/atores" class="active w3-bar-item w3-button">Atores</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>Atores</h2></li>"""

    for a in actors:
        nr = str(actors[a][0])
        actor_html = "\n\t\t\t<li class=\"w3-hover-grey\"><a href=\"http://localhost:7777/atores/a" + nr + "\">" + a + "</a></li>"
        actors_html += actor_html
        actor_page_generator(nr,a)

    actors_html += """
        </ul>
    </body>
</html>"""
    page.write(actors_html) 

def movie_page_generator(nr,m):
    path = "./html/filmes/f" + nr +".html"
    page = open(path,"w",encoding='utf-8')
    movie_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - """ + m + """</title>
    </head>
    <body>
        <div class="w3-bar w3-black">
            <a href="http://localhost:7777/" class="w3-bar-item w3-button">Indice</a>
            <a href="http://localhost:7777/filmes" class="w3-bar-item w3-button">Filmes</a>
            <a href="http://localhost:7777/atores" class="w3-bar-item w3-button">Atores</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>""" + m + """</h2></li>
        </ul>
        <div class="w3-container">
            <h4><b>Ano:</b> """ + str(movies[m][1]) + """</h4>
            <h4><b>Elenco:</b></h4>
            <ul class="w3-ul">"""
    for a in movies[m][2]:
        nr = str(actors[a][0])
        movie_html += "\n\t\t\t\t<li class=\"w3-hover-grey\">" + "<a href=\"http://localhost:7777/atores/a" + nr + "\">" + a + "</a></li>"
    
    movie_html += """
            </ul>
            <h4><b>Género(s):</b></h4>
            <ul class="w3-ul">"""
    for g in movies[m][3]:
        movie_html += "\n\t\t\t\t<li>" + g + "</li>"

    movie_html += """
            </ul>
        </div>
    </body>
</html>"""
    page.write(movie_html)

def actor_page_generator(nr,a):
    path = "./html/atores/a" + nr +".html"
    page = open(path,"w",encoding='utf-8')
    actor_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - """ + a + """</title>
    </head>
    <body>
        <div class="w3-bar w3-black">
            <a href="http://localhost:7777/" class="w3-bar-item w3-button">Indice</a>
            <a href="http://localhost:7777/filmes" class="w3-bar-item w3-button">Filmes</a>
            <a href="http://localhost:7777/atores" class="w3-bar-item w3-button">Atores</a>
        </div>
        <ul class="w3-ul">
            <li class="w3-dark-grey"><h2>""" + a + """</h2></li>
        </ul>
        <div class="w3-container">
            <h4><b>Filmes:</b></h4>
            <ul class="w3-ul">"""
    for m in actors[a][1]:
        nr = str(movies[m][0])
        actor_html += "\n\t\t\t\t<li class=\"w3-hover-grey\">" + "<a href=\"http://localhost:7777/filmes/f" + nr + "\">" + m + "</a></li>"
    
    actor_html += """
            </ul>
        </div>
    </body>
</html>"""
    page.write(actor_html)

def valid_name(name):
    return ((name[0].isupper() or name[0] == 5)) and len(name) > 2 and name[1] != " "

def cast_filter(cast):
    aux = []
    for c in cast:
        if valid_name(c): aux.append(c)
    return sorted(aux)

i = 1
j = 1

for m in data:
    movies[m['title']] = [i,m['year'],cast_filter(m['cast']),sorted(m['genres'])]
    i += 1  
    for a in m['cast']:
        if valid_name(a):
            if a in actors:
                actors[a][1].append(m['title'])
            else:
                actors[a] = [j,[m['title']]]
                j += 1
    for a in actors:
        actors[a][1] = sorted(actors[a][1])

movies = dict(sorted(movies.items(), key = lambda x : x[0].lower()))
actors = dict(sorted(actors.items(), key = lambda x : x[0].lower()))

#print(movies)
#print(actors)
home_page_generator()
movies_page_generator()
actors_page_generator()




