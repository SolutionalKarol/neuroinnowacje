"""Generate public search metadata. Supply the confirmed production origin to finish URL metadata."""
import argparse,json,re,html
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--origin');args=parser.parse_args()
origin=(args.origin or '').rstrip('/')
if origin and not re.fullmatch(r'https://[A-Za-z0-9.-]+',origin): raise SystemExit('Use the confirmed HTTPS production origin, without a path.')
pages={
 'index.html':('Psycholog Wrocław, terapia i VR | Neuroinnowacje NCNI','Pomoc psychologiczna i terapia par we Wrocławiu oraz online. Daria Cerazy, Sebastian Kraszewski, ADHD, autyzm, wsparcie przy migrenie i fobiach. Poznaj ceny.'),
 'neuroroznorodnosc.html':('ADHD, autyzm i neuroróżnorodność Wrocław | Neuroinnowacje','Wsparcie przy ADHD, autyzmie i trudnościach w uczeniu się we Wrocławiu. Diagnostyka, psychoedukacja i codzienne strategie w NCNI. Poznaj możliwości pomocy.')}
org={'@type':'Organization','@id':'https://ncni.pl/#organization','name':'Naukowe Centrum Neuroinnowacji sp. z o.o.','alternateName':'NCNI','url':'https://ncni.pl/','telephone':'+48600608333','email':'kontakt@ncni.pl','address':{'@type':'PostalAddress','streetAddress':'ul. Stefana Żeromskiego 60/5a','postalCode':'50-312','addressLocality':'Wrocław','addressCountry':'PL'}}
people=[{'@type':'Person','@id':'https://ncni.pl/psycholog.html#daria-cerazy','name':'Daria Cerazy','jobTitle':'Psycholog, psychoterapeutka','sameAs':['https://dariacerazy.pl/o-mnie/']},{'@type':'Person','@id':'https://ncni.pl/kraszewski.html#sebastian-kraszewski','name':'Sebastian Kraszewski','jobTitle':'Dyrektor naukowy NCNI, profesor Politechniki Wrocławskiej','sameAs':['https://ncni.pl/kraszewski.html']}]
for filename,(title,description) in pages.items():
 p=Path(filename);s=p.read_text()
 s=re.sub(r'<title>.*?</title>','',s,flags=re.S)
 s=re.sub(r'<meta\s+(?:name="(?:description|robots|author|twitter:[^"]+)"|property="og:[^"]+")[^>]*>','',s)
 s=re.sub(r'<link rel="canonical"[^>]*>','',s)
 s=re.sub(r'<!-- SEARCH METADATA START -->.*?<!-- SEARCH METADATA END -->','',s,flags=re.S)
 url=origin+('/' if filename=='index.html' else '/'+filename) if origin else None
 graph=[org,{'@type':'Brand','name':'Neuroinnowacje','description':'Pomoc psychologiczna i wsparcie w NCNI we Wrocławiu.'}]
 if filename=='index.html':
  graph+=people
  from html.parser import HTMLParser
  class FAQParser(HTMLParser):
   def __init__(self):super().__init__();self.inside=False;self.part=None;self.q='';self.a='';self.items=[]
   def handle_starttag(self,tag,attrs):
    if tag=='section' and 'faq-section' in dict(attrs).get('class',''):self.inside=True
    if self.inside and tag=='details':self.q='';self.a=''
    if self.inside and tag in ['summary','p']:self.part=tag
   def handle_data(self,data):
    if self.inside and self.part=='summary':self.q+=data
    if self.inside and self.part=='p':self.a+=data
   def handle_endtag(self,tag):
    if tag in ['p','summary']:self.part=None
    if self.inside and tag=='details':
     self.items.append({'@type':'Question','name':self.q.strip(),'acceptedAnswer':{'@type':'Answer','text':self.a.strip()}});self.q='';self.a=''
    if tag=='section':self.inside=False
  faq=FAQParser();faq.feed(s)
  if faq.items:graph.append({'@type':'FAQPage','mainEntity':faq.items})
  for name,price in [('Konsultacja psychologiczna','220'),('Psychoterapia par w języku polskim','300'),('Rozmowa z pomiarem HRV / EEG','450'),('Sesja NCNI.System','350')]:
   graph.append({'@type':'Service','name':name,'provider':{'@id':org['@id']},'areaServed':{'@type':'City','name':'Wrocław'},'offers':{'@type':'Offer','price':price,'priceCurrency':'PLN'}})
 if url:graph.append({'@type':'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,'inLanguage':'pl-PL','publisher':{'@id':org['@id']}})
 tags=f'<title>{html.escape(title)}</title>\n<meta name="description" content="{html.escape(description,quote=True)}">\n<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">\n<meta property="og:title" content="{html.escape(title,quote=True)}">\n<meta property="og:description" content="{html.escape(description,quote=True)}">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="pl_PL">\n<meta property="og:site_name" content="Neuroinnowacje · NCNI">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="{html.escape(title,quote=True)}">\n<meta name="twitter:description" content="{html.escape(description,quote=True)}">\n'
 if url:tags+=f'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">\n<meta property="og:image" content="{origin}/assets/gabinet.webp">\n<meta property="og:image:alt" content="Gabinet NCNI we Wrocławiu">\n<meta name="twitter:image" content="{origin}/assets/gabinet.webp">\n'
 tags+='<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>\n'
 # Remove only metadata generated by this script on prior runs.
 s=re.sub(r'<script type="application/ld\+json">.*?</script>','',s,flags=re.S)
 s=s.replace('</head>','<!-- SEARCH METADATA START -->\n'+tags+'<!-- SEARCH METADATA END -->\n</head>')
 p.write_text(s)
robots='User-agent: *\nAllow: /\n'
if origin:
 robots+='\nSitemap: '+origin+'/sitemap.xml\n'
 from xml.sax.saxutils import escape
 Path('sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+escape(origin+('/' if p=='index.html' else '/'+p))+'</loc></url>\n' for p in pages)+'</urlset>\n')
Path('robots.txt').write_text(robots)
for filename in ['coaching.html','psychologia.html']:
 p=Path(filename);s=p.read_text()
 if 'name="robots"' not in s:s=s.replace('</head>','<meta name="robots" content="noindex, follow"></head>')
 p.write_text(s)
print('Prepared search metadata'+(' for '+origin if origin else '; production origin still required for canonical, sitemap and share-image URLs.'))
