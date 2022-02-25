import json

movies = {}
actors = {}

with open('cinemaATP.json', encoding='utf-8') as f: data = json.load(f)

def home_page_generator():
    page = open("./html/index.html","w",encoding='utf-8')
    index_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Indice</title>
    </head>
    <body>
        <h1><a href="http://localhost:7777/filmes">Filmes</a></h1>
        <h1><a href="http://localhost:7777/atores">Atores</a></h1>
    </body>
</html>"""
    page.write(index_html)

def movies_page_generator():
    page = open("./html/filmes.html","w",encoding='utf-8')
    movies_html = """<!DOCTYPE html>
<html lang="pt">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Filmes</title>
    </head>
    <body>
        <h1>Filmes</h1>
        <ul>"""

    n = 1
    for m in movies:
        nr = str(n)
        movie_html = "\n\t\t\t<li><a href=\"http://localhost:7777/filmes/f" + nr + "\">" + m + " - " + str(movies[m][0]) + "</a></li>"
        movies_html += movie_html
        movie_page_generator(nr,m)
        n+=1

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
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - Atores</title>
    </head>
    <body>
        <h1>Atores</h1>
        <ul>"""

    n = 1
    for a in actors:
        nr = str(n)
        actor_html = "\n\t\t\t<li><a href=\"http://localhost:7777/atores/a" + nr + "\">" + a + "</a></li>"
        actors_html += actor_html
        actor_page_generator(nr,a)
        n += 1

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
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - """ + m + """</title>
    </head>
    <body>
        <h1>""" + m + """</h1>
        <h3>Ano: """ + str(movies[m][0]) + """</h3>
        <h3>Elenco:</h3>
        <ul>"""
    for a in movies[m][1]:
        movie_html += "\n\t\t\t<li>" + a + "</li>"
    
    movie_html += """
        </ul>
        <h3>Género(s)</h3>
        <ul>"""
    for g in movies[m][2]:
        movie_html += "\n\t\t\t<li>" + g + "</li>"

    movie_html += """
        </ul>
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
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>TPC2 - """ + a + """</title>
    </head>
    <body>
        <h1>""" + a + """</h1>
        <h3>Filmes:</h3>
        <ul>"""
    for m in actors[a]:
        actor_html += "\n\t\t\t<li>" + m + "</li>"
    
    actor_html += """
        </ul>
    </body>
</html>"""
    page.write(actor_html)

def valid_name(name):
    return ((name[0].isupper() or name[0] == 5)) and len(name) > 2 and name[1] != " "

def add_actor(a,m):
    if valid_name(a):
        if a in actors:
            actors[a].append(m)
        else:
            actors[a] = [m]

def add_movie(m):
    movies[m['title']] = [m['year'],m['cast'],m['genres']]

for m in data:
    add_movie(m)
    for a in m['cast']:
        add_actor(a,m['title'])

movies = dict(sorted(movies.items(), key = lambda x : x[0].lower()))
actors = dict(sorted(actors.items(), key = lambda x : x[0].lower()))


home_page_generator()
movies_page_generator()
actors_page_generator()




