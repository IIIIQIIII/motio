from pathlib import Path
from html.parser import HTMLParser
import re
root=Path(__file__).resolve().parents[1]/'site'
references=set()
class Refs(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for key,value in attrs:
   if key in ['src','href','poster','data-src','data-landscape','data-portrait']and value and not value.startswith(('#','https:','http:','data:','mailto:')):
    assert not value.startswith('/'),value
    references.add(value.split('?')[0])
Refs().feed((root/'index.html').read_text())
js=(root/'viewer.js').read_text()
references.update('models/'+name+'.glb'for name in re.findall(r'(\w+):\[',js[js.index('const scenes='):js.index('let scene,')]))
for path in references:assert(root/path).is_file(),path
for path in root.rglob('*'):
 if path.is_file():assert path.stat().st_size<100*1024**2,path
assert(root/'.nojekyll').is_file()
print(f'Validated {len(references)} local asset references.')
