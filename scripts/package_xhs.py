from pathlib import Path
import zipfile,re,hashlib,json
root=Path(__file__).resolve().parents[1]
files=['index.html']+[str(p.relative_to(root)) for p in sorted((root/'assets').glob('*')) if p.is_file()]
assert all(Path(p).suffix in ['.html','.css','.js','.svg','.jpg','.png','.webp','.woff2'] for p in files)
html=(root/'index.html').read_text()
assert len(re.findall(r'<script\b',html))==len(re.findall(r'<script src="\./[^\"]+"\s*></script>',html))
assert not re.search(r'\son\w+\s*=|type="module"|<iframe|<object|<base|http[s]?://',html)
for ref in re.findall(r'(?:src|href)="\./([^\"]+)"',html):assert ref in files,ref
for f in files:
 if Path(f).suffix!='.js' or f.endswith('sources.js'):continue
 code=(root/f).read_text()
 for pattern in [r'\bfetch\s*\(',r'XMLHttpRequest',r'window\.open\s*\(',r'navigator\.clipboard',r'\beval\s*\(',r'new Function',r'new Worker',r'postNote\s*\(',r'\.getStorage\s*\(']:
  assert not re.search(pattern,code),(f,pattern)
for ref in re.findall(r'url\([\"\']?([^\)\"\']+)',(root/'assets/style.css').read_text()):
 if ref.startswith(('data:','%23','#')):continue
 assert (root/'assets'/ref).exists(),ref
output=root/'人生之书-交互原型-小红书小工具.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
 for f in files:z.write(root/f,f)
with zipfile.ZipFile(output) as z:
 assert z.testzip() is None
 assert 'index.html' in z.namelist()
 assert len([x for x in z.namelist() if x.endswith('.html')])==1
 assert not any('写实' in x or x.startswith('design/') or 'upstream/' in x for x in z.namelist())
 z.extractall(root/'dist')
assert output.stat().st_size<2*1024*1024
report={'files':files,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'source_commit':json.loads((root/'assets/sources.js').read_text().split(' = ',1)[1].rstrip(';\n'))['commit']}
(root/'design/打包检查.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
