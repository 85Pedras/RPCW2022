import json

with open('arq-son-EVO.json') as f:
    content = json.loads(f.read())
    musicas = content['musicas']

provs = {}
j = 1
for entry in musicas:
    if entry['prov'] not in provs:
        provs[entry['prov']] = j
        j += 1

i=0
string = '{ \"musicas\" : ['
for entry in musicas:
    i+=1
    entry['id'] = i
    entry['prov_id'] = provs[entry['prov']]
    data = json.dumps(entry)
    string += data + ',\n'
string += '] }'

f = open('arq-son-EVO-ready.json','w',encoding='utf-8')
f.write(string)