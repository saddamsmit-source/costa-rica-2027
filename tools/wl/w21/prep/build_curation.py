import json,re
wl=json.load(open('wl2_base.json'));cur=json.load(open('cur_text.json'));saf=json.load(open('cur_safety.json'))
ioc=json.load(open('ioc_nl.json'))['sci']
C={}
def put(k,**f):
    assert k in wl,k
    C.setdefault(k,{}).update(f)
def addak(k,*names):
    a=C.setdefault(k,{}).get('ak') or list(cur.get(k,{}).get('ak',[]))
    for n in names:
        if n and n not in a and n!=k:a.append(n)
    C[k]['ak']=a
for k,v in cur.items():put(k,**v)
for k,v in saf.items():
    for x,y in v.items():C.setdefault(k,{})[x]=y
# correcties op eerdere concepten
C['Gartered violaceous trogon'].pop('en',None);C['Gartered violaceous trogon']['ak']=['Violaceous trogon','Gartered trogon']
put('Black-throated trogon',en='Graceful black-throated trogon');addak('Black-throated trogon','Black-throated trogon','Northern black-throated trogon')
# eBird-namen (Clements 2025)
for k,en in {'Cattle egret':'Western cattle-egret','Yellow warbler':'Northern yellow warbler','White-fronted parrot':'White-fronted amazon',
             'Red-lored parrot':'Red-lored amazon','Mealy parrot':'Mealy amazon','Yellow-naped parrot':'Yellow-naped amazon',
             'Gray-tailed mountain-gem':'White-throated mountain-gem'}.items():
    put(k,en=en);addak(k,k)
put('Gray-tailed mountain-gem',fm='Grijsstaartvorm (Costa Rica)')
put("Passerini's tanager",en='Scarlet-rumped tanager',fm='Caribische vorm',sp="Passerini's tanager");addak("Passerini's tanager","Passerini's tanager")
put("Cherrie's tanager",en='Scarlet-rumped tanager',fm='Pacifische vorm',sp="Passerini's tanager");addak("Cherrie's tanager","Cherrie's tanager")
put('Orange-bellied trogon',en='Collared trogon (orange-bellied)');addak('Orange-bellied trogon','Orange-bellied trogon')
# IOC 15.2 Nederlandse namen, zinsnaamconventie
DEM=re.compile(r"^(Amerikaanse|Mexicaanse|Costaricaanse|Zuid-Amerikaanse|Noord-Amerikaanse|Nicaraguaanse|Braziliaanse|Caribische|Pacifische|Panamese|Westelijke|Noordelijke)$")
def sent(n):
    w=n.split(' ');return ' '.join([w[0]]+[x if DEM.match(x) and False else x.lower() for x in w[1:]])
SPECIAL={'Orange-bellied trogon':'Oranjebuiktrogon',"Passerini's tanager":'Roodrugtangare (Caribische vorm)',"Cherrie's tanager":'Roodrugtangare (Pacifische vorm)',
 'Clay-colored thrush':'Grays lijster (yigüirro)','Muscovy duck':'Muskuseend (wild)','Black-throated trogon':'Noordelijke zwartkeeltrogon',
 'Collared trogon':'Gekraagde trogon','Hepatic tanager':'Hooglandlevertangare'}
n_ioc=0
for k,r in wl.items():
    if r['c']!='Vogels':continue
    old=C.get(k,{}).get('nl',r['nl'])
    new=SPECIAL.get(k) or (sent(ioc[r['s']][1]) if r['s'] in ioc else None)
    if new and new!=old:
        put(k,nl=new);addak(k,old);n_ioc+=1
put('Hepatic tanager',fm='Hooglandvorm (lutea-groep)')
# overige correcties uit de controle
put('Magenta-throated woodstar',se='')
put('Lesser ground-cuckoo',h=wl['Lesser ground-cuckoo']['h'].replace('geel oogring','gele oogring'))
put('Eyelash viper',en='Central American eyelash-viper');addak('Eyelash viper','Eyelash viper')
put('Neotropical river otter',en='Northern Neotropical river otter');addak('Neotropical river otter','Neotropical river otter')
put('Nicaraguan slider',l=wl['Nicaraguan slider']['l'].rstrip()+' De populatie in Costa Rica wordt meestal tot T. grayi emolli gerekend.')
RAY='Giftige staartstekel: schuifel in ondiep water met je voeten en stap of grijp nooit naar een rog.'
for k in ['Longtail stingray','Pacific chupare whipray','Caribbean whiptail stingray','Southern stingray','Leopard round stingray','Spotted eagle ray']:
    if k in wl:put(k,sf=RAY)
TIPS={'Snowcap':'Zoek bij bloeiende struiken aan bosranden in het Caribische heuvelland; mannetjes zijn klein maar opvallend door de witte kap.',
 'Yellow-billed cotinga':'Kijk vroeg in de ochtend naar witte vogels op kale boomtoppen langs mangroven, bijvoorbeeld tijdens de boottocht bij Sierpe.',
 'Bare-necked umbrellabird':'Zeldzaam en lokaal; een gids met een recente plek in het Caribische heuvelland is de beste kans.',
 'Turquoise cotinga':'Scan in de ochtend kale boomtoppen vanaf een open uitzichtpunt in het zuiden.',
 'Three-wattled bellbird':"Eerst horen, dan zoeken: de luide 'BONK' draagt honderden meters ver."}
for k,t in TIPS.items():put(k,tp=t)
addak('Chestnut-capped warbler','Rufous-capped warbler')
for k in ["Passerini's tanager","Cherrie's tanager"]:
    put(k,h=wl[k]['h'].replace('roodstuittangare','roodrugtangare'))
put("Cherrie's tanager",tp='Pacifische vorm van de roodrugtangare (Scarlet-rumped tanager); vrouwtjes met oranje borst.')
assert C["Red coffee snake"]['sf']=='Kan op een gevaarlijke koraalslang lijken. Raak onbekende slangen niet aan en probeer ze niet op te pakken.'
json.dump(C,open('/tmp/repo/tools/wl/w21/curation.json','w'),ensure_ascii=False,indent=0)
print('curatie',len(C),'IOC',n_ioc)
C2=json.load(open('/tmp/repo/tools/wl/w21/curation.json'))
for k,v in {'Humpback whale':'boot','Pantropical spotted dolphin':'boot','Common bottlenose dolphin':'boot','Green sea turtle':'snorkel','Hawksbill sea turtle':'snorkel','Olive ridley sea turtle':'boot','Whitetip reef shark':'duik','Spotted eagle ray':'snorkel','Longtail stingray':'strand','Leopard round stingray':'strand','Caribbean whiptail stingray':'snorkel','Southern stingray':'snorkel','Nurse shark':'snorkel','Pacific chupare whipray':'strand'}.items():
    assert k in wl,k;C2.setdefault(k,{})['vw']=v
json.dump(C2,open('/tmp/repo/tools/wl/w21/curation.json','w'),ensure_ascii=False,indent=0);print('vw toegevoegd')
C3=json.load(open('/tmp/repo/tools/wl/w21/curation.json'))
AUF={'Tinamidae','Formicariidae','Grallariidae','Odontophoridae','Troglodytidae','Strigidae','Nyctibiidae','Caprimulgidae'}
n=0
for k,r in wl.items():
    if r.get('f') in AUF or k in ('Three-wattled bellbird','Mantled howler monkey','Collared forest-falcon','Laughing falcon'):
        C3.setdefault(k,{})['au']=1;n+=1
json.dump(C3,open('/tmp/repo/tools/wl/w21/curation.json','w'),ensure_ascii=False,indent=0);print('au',n)
