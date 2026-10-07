from pathlib import Path
import json,re,subprocess
root=Path(__file__).resolve().parents[1]
up=root/'sources/upstream'
chapters=[]
for f in sorted((up/'book').glob('*.md')):
    s=f.read_text(); m=re.search(r'^# (\d+)\. (.+)',s,re.M)
    if m: chapters.append({'id':int(m[1]),'title':m[2],'text':s,'url':'https://github.com/eternity4719/HowToLiveBetter/blob/main/book/'+f.name})
(root/'assets/sources.js').write_text('window.LifeSources = '+json.dumps({'date':'2026-09-26','commit':subprocess.check_output(['git','-C',str(up),'rev-parse','HEAD'],text=True).strip(),'chapters':chapters},ensure_ascii=False)+';\n')
print('已收录',len(chapters),'章，保留完整来源及适用备注')
