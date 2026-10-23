// Refreshes data/prices.json from public pricing pages. Node 18+, no deps.
// Each extractor returns {id: perSec-or-clips patch}. If a page can't be parsed, the old value is kept
// and the entry is flagged "stale" so nothing made-up is ever written.
import fs from 'fs';
const F='data/prices.json'; const D=JSON.parse(fs.readFileSync(F)); const today=new Date().toISOString().slice(0,10);
const get=async u=>{const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (aivideoprice-bot)','accept-language':'en-US'}});if(!r.ok)throw new Error(u+' '+r.status);return r.text();};
const num=s=>parseFloat(s.replace('$',''));
const row=(txt,label)=>{const l=txt.split('\n').find(x=>x.includes(label));return l?[...l.matchAll(/\$([0-9.]+)/g)].map(m=>+m[1]):null;};
const X={
 'https://kling.ai/document-api/pricing/base/video.md':t=>{const o={};
   // Table cells: | Model | Variant | Billing | 720p | 1080p | 4k | ; match model+variant cells exactly (layout changed 2026-10)
   const cells=(m,v)=>{const l=t.split('\n').find(x=>{const c=x.split('|').map(y=>y.trim());return c[1]===m&&c[2]===v;});return l?l.split('|').slice(4,7).map(c=>{const q=c.match(/\$([0-9.]+)/);return q?+q[1]:null;}):null;};
   const a=cells('Kling 3.0','No Native Audio');if(a&&a.every(x=>x!=null))o.kling30={'720p':a[0],'1080p':a[1],'4k':a[2]};
   const b=cells('Kling 3.0','With Native Audio');if(b&&b.every(x=>x!=null))o['kling30-audio']={'720p':b[0],'1080p':b[1],'4k':b[2]};
   const c=cells('Kling 2.6','No Native Audio');if(c&&c[0]!=null&&c[1]!=null)o.kling26={'720p':c[0],'1080p':c[1]};return o;},
 'https://docs.dev.runwayml.com/guides/pricing/':t=>{const o={};const cr=(k)=>{const m=t.match(new RegExp(k+'[^0-9]{0,40}?(\\d+) credits per second'));return m?+m[1]*0.01:null;};
   const g=cr('gen4\\.5');if(g)o['runway-gen45']={default:g};const tu=cr('gen4_turbo');if(tu)o['runway-gen4t']={default:tu};const v=cr('veo3\\.1 \\(audio\\)');if(v)o['runway-veo31']={default:v};return o;},
 'https://open.higgsfield.ai/pricing':t=>{const o={};const f=(lab)=>{const m=t.match(new RegExp(lab.replace(/[.()]/g,'\\$&')+'[^$]{0,80}\\$([0-9.]+)\\s*/\\s*s'));return m?+m[1]:null;};
   let v=f('Kling 3.0 Pro · Text to Video · Image to Video');if(v)o['kling30pro-hf']={default:v};v=f('Kling 3.0 4K · Text to Video · Image to Video');if(v)o['kling30-4k-hf']={'4k':v};
   v=f('Seedance 2.5 · Text to Video · Image to Video');if(v)o['seedance25-hf']={'480p':v};v=f('Seedance 2.0 · Text to Video · Image to Video');if(v)o['seedance20-hf']={'480p':v};const fr=t.replace(/<[^>]+>/g,' ').match(/Seedance 2\.5 · Text to Video · Image to Video\s*480p\s*\$[0-9.]+\s*\/\s*s\s*Higgsfield\s*\$([0-9.]+)\s*\/\s*s\s*Fal/);if(fr)o['seedance25-fal']={'480p':+fr[1]};return o;},
 'https://cloud.google.com/vertex-ai/generative-ai/pricing':t=>{const o={};const s=t.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
   // Vertex Veo table: "<Model> Video + Audio generation ... Video + Audio <res> $X / 1 count ... Video generation" (prices per second of output). Use the Video + Audio rows.
   for(const [lab,id] of [['Veo 3.1 ','veo31-std'],['Veo 3.1 Fast ','veo31-fast'],['Veo 3.1 Lite ','veo31-lite']]){const i=s.indexOf(lab+'Video + Audio generation');if(i<0)continue;
     const seg=s.slice(i+lab.length+24);const end=seg.indexOf(' Video generation');const blk=end>0?seg.slice(0,end):'';const r={};
     for(const m of blk.matchAll(/(720p, 1080p|720p|1080p|4k) \$([0-9.]+) \/ 1 count/g)){if(m[1]==='720p, 1080p')r['720p']=r['1080p']=+m[2];else r[m[1]]=+m[2];}
     if(r['720p']&&r['1080p'])o[id]=r;}return o;},
 'https://lumalabs.ai/api/pricing':t=>{const s=t.replace(/<[^>]+>/g,' ');const r5=s.match(/T2V\/I2V \(5s\)\s*\$([0-9.]+)\s*\$([0-9.]+)\s*\$([0-9.]+)/),r10=s.match(/T2V\/I2V \(10s\)\s*\$([0-9.]+)\s*\$([0-9.]+)\s*\$([0-9.]+)/);
   if(!r5||!r10)return{};return{'luma-ray32':{clips:{'540p':{5:+r5[1],10:+r10[1]},'720p':{5:+r5[2],10:+r10[2]},'1080p':{5:+r5[3],10:+r10[3]}}}};},
 'https://fal.ai/models/fal-ai/pika/v2.2/text-to-video':t=>{const m=t.match(/5 second video at 720p costs \**\$([0-9]+\.[0-9]+)\**\. 5 second video at 1080p costs \**\$([0-9]+\.[0-9]+)/);return m?{'pika22-fal':{clips:{'720p':{5:+m[1]},'1080p':{5:+m[2]}}}}:{};}
};
const changes=[];
for(const [url,fn] of Object.entries(X)){
  let patch={};try{patch=fn(await get(url));}catch(e){console.error('FAIL',url,e.message);}
  for(const e of D.entries.filter(e=>e.source.startsWith(url.replace(/\?.*$/,'').replace(/\/$/,'')))){
    const p=patch[e.id];
    if(!p){e.stale=true;console.warn('not parsed:',e.id);continue;}
    const before=JSON.stringify(e.clips||e.perSec);
    if(p.clips)e.clips=p.clips;else e.perSec={...e.perSec,...p};
    if(JSON.stringify(e.clips||e.perSec)!==before)changes.push({id:e.id,before,after:JSON.stringify(e.clips||e.perSec),date:today});
    e.checked=today;delete e.stale;
  }
}
D.updated=today;fs.writeFileSync(F,JSON.stringify(D,null,2));
if(changes.length){const h='data/changes.json';const old=fs.existsSync(h)?JSON.parse(fs.readFileSync(h)):[];fs.writeFileSync(h,JSON.stringify([...changes,...old],null,2));}
console.log('changes:',changes.length);
