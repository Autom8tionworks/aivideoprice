import fs from 'fs';
const D = JSON.parse(fs.readFileSync('data/prices.json'));
const A = JSON.parse(fs.readFileSync('affiliates.config.json'));
const NL = A.newsletter;
const famLink = {higgsfield:A.higgsfield.url,kling:A.kling.url,runway:A.runway.url,luma:A.luma.url,veo:A.google.url,pika:A.fal.url,seedance:A.higgsfield.url};
const provLink = e => e.provider.includes('Higgsfield')?A.higgsfield.url:e.provider.includes('Runway')?A.runway.url:e.provider.includes('Luma')?A.luma.url:e.provider.includes('Google')?A.google.url:e.provider.startsWith('fal')?A.fal.url:e.provider.includes('Kling')?A.kling.url:'#';
const money = v => v==null?'—':'$'+(v<1?v.toFixed(3).replace(/0$/,''):v.toFixed(2));
function cost(e,res,len){
  if(e.perSec){const p=e.perSec[res]??e.perSec.default; if(p==null)return null; return {ps:p,clip:p*len,est:!e.perSec[res]};}
  const t=e.clips[res]; if(!t)return null; const d=Object.keys(t).map(Number).sort((a,b)=>a-b).find(d=>d>=len); if(!d)return null; return {ps:t[d]/d,clip:t[d],est:false,billed:d};
}
const klBox=`<aside class="el-callout"><p><b>Trying Kling?</b> Sign up through <a href="${A.kling.url}" rel="sponsored noopener">our Kling referral link</a>: per Kling's referral page, new subscribers get 10% bonus credits in their first month (max 1,500).</p></aside>`;
const elBox=`<aside class="el-callout"><p><b>Need a voiceover or AI audio for your clips?</b> Several models above don't generate native audio. <a href="${A.elevenlabs.url}" rel="sponsored noopener">ElevenLabs</a> makes voiceovers, sound effects and music you can add in post. See their site for current plans.</p></aside>`;
const page=(title,desc,body,path='')=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name='impact-site-verification' value='2572bc28-c73f-4829-9b57-71a3d3903304'><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${desc}"><link rel="canonical" href="/${path}"><link rel="stylesheet" href="/style.css"></head><body><header><a class="logo" href="/">AI Video <b>Price</b> Tracker</a><nav><a href="/#table">Prices</a><a href="/#calc">Calculator</a><a href="/compare/">Comparisons</a><a href="${NL}" rel="noopener">Newsletter</a></nav></header><main>${body}</main><footer><p>Prices from vendors' public pricing pages; each row links its source and the date we last checked it. Estimates only: vendors may round, bill minimums, or restrict clip lengths. Disclosure: some links (Higgsfield, ElevenLabs and Kling) are affiliate or referral links; we may earn a commission at no extra cost to you. This does not affect prices shown. Data updated ${D.updated}.</p></footer></body></html>`;
const rows=D.entries.map(e=>{const pr=e.perSec?Object.entries(e.perSec).map(([r,p])=>`${r==='default'?'':r+': '}${money(p)}/s`).join('<br>'):Object.entries(e.clips).map(([r,t])=>r+': '+Object.entries(t).map(([d,p])=>`${money(p)}/${d}s`).join(', ')).join('<br>');
 const c8=cost(e,'1080p',8)||cost(e,'720p',8)||cost(e,'default',8);
 return `<tr><td><b>${e.model}</b>${e.note?`<br><small>${e.note}</small>`:''}</td><td><a href="${provLink(e)}" rel="sponsored noopener">${e.provider}</a></td><td>${e.audio===true?'Yes':e.audio===false?'No':'?'}</td><td>${pr}</td><td>${c8?money(c8.clip)+(c8.billed&&c8.billed!==8?` (${c8.billed}s clip)`:''):'—'}</td><td><a href="${e.source}" rel="noopener">source</a><br><small>${e.checked}</small></td></tr>`}).join('');
const nlBox=`<section class="nl"><h2>Get price changes weekly</h2><p>One email when AI video prices move. Free.</p><a class="btn" href="${NL}" rel="noopener">Subscribe on Beehiiv</a></section>`;
const disc=D.discontinued.map(d=>`<li><b>${d.model}</b>: ${d.note} <a href="${d.source}">source</a> (checked ${d.checked})</li>`).join('');
const pairs=[['kling','veo'],['kling','runway'],['veo','runway'],['seedance','kling'],['luma','kling'],['pika','luma'],['veo','seedance'],['runway','luma']];
const name={kling:'Kling',veo:'Veo',runway:'Runway',seedance:'Seedance',luma:'Luma',pika:'Pika'};
const compareLinks=pairs.map(([a,b])=>`<li><a href="/${a}-vs-${b}-cost">${name[a]} vs ${name[b]} cost</a></li>`).join('');
const home=page('AI Video Price Tracker: cost per second for Kling, Veo, Runway, Seedance, Luma, Pika','Compare AI video generation prices per second and per clip, with sources and last-checked dates.',
`<h1>What does an AI video clip really cost?</h1><p class="lead">Per-second and per-clip prices for ${D.entries.length} AI video models and plans, pulled from public pricing pages, plus a cheapest-option calculator.</p>
<section id="calc"><h2>Cheapest-option calculator</h2><label>Resolution <select id="res"><option>720p</option><option selected>1080p</option><option>4k</option><option>540p</option><option>480p</option></select></label> <label>Length (s) <input id="len" type="number" min="1" max="20" value="8"></label> <label><input id="aud" type="checkbox"> Needs native audio</label><ol id="out"></ol>${klBox}${elBox}<p><small>Rows marked "res. unconfirmed" use a single published rate where the source doesn't break out resolution.</small></p></section>
<section id="table"><h2>All prices</h2><div class="tw"><table><thead><tr><th>Model</th><th>Provider</th><th>Audio</th><th>Price</th><th>8s clip (1080p, or best listed)</th><th>Source / checked</th></tr></thead><tbody>${rows}</tbody></table></div>${klBox}${elBox}<h3>Discontinued</h3><ul>${disc}</ul></section>
${nlBox}<section><h2>Head-to-head cost comparisons</h2><ul>${compareLinks}</ul></section>
<script>const E=${JSON.stringify(D.entries)};const L=${JSON.stringify(Object.fromEntries(D.entries.map(e=>[e.id,provLink(e)])))};
function cost(e,res,len){if(e.perSec){const p=e.perSec[res]??e.perSec.default;if(p==null)return null;return{clip:p*len,est:e.perSec[res]==null};}const t=e.clips[res];if(!t)return null;const d=Object.keys(t).map(Number).sort((a,b)=>a-b).find(d=>d>=len);if(!d)return null;return{clip:t[d],billed:d};}
function run(){const r=res.value,l=+len.value||8,a=aud.checked;const x=E.filter(e=>!a||e.audio===true).map(e=>[e,cost(e,r,l)]).filter(z=>z[1]).sort((p,q)=>p[1].clip-q[1].clip);out.innerHTML=x.slice(0,8).map(([e,c])=>'<li><b>$'+c.clip.toFixed(2)+'</b> '+e.model+' via <a rel="sponsored noopener" href="'+L[e.id]+'">'+e.provider+'</a>'+(c.est?' <small>(res. unconfirmed)</small>':'')+(c.billed&&c.billed!=l?' <small>(billed as '+c.billed+'s clip)</small>':'')+' <a href="'+e.source+'"><small>source</small></a></li>').join('')||'<li>No published price for that combo.</li>';}
[res,len,aud].forEach(el=>el.oninput=run);run();</script>`);
fs.mkdirSync('dist/compare',{recursive:true});
fs.writeFileSync('dist/index.html',home);
for(const [a,b] of pairs){
  const ea=D.entries.filter(e=>e.family===a), eb=D.entries.filter(e=>e.family===b);
  const tbl=(res,len)=>[...ea,...eb].map(e=>[e,cost(e,res,len)]).filter(z=>z[1]).sort((p,q)=>p[1].clip-q[1].clip).map(([e,c])=>`<tr><td>${e.model}</td><td><a rel="sponsored noopener" href="${provLink(e)}">${e.provider}</a></td><td>${money(c.clip)}${c.est?' <small>(res. unconfirmed)</small>':''}${c.billed&&c.billed!==len?` <small>(${c.billed}s clip)</small>`:''}</td><td><a href="${e.source}">source</a> <small>${e.checked}</small></td></tr>`).join('')||'<tr><td colspan=4>No public price at this setting.</td></tr>';
  const sect=(res,len)=>`<h2>${len}-second ${res} clip</h2><div class="tw"><table><thead><tr><th>Model</th><th>Provider</th><th>Cost</th><th>Source</th></tr></thead><tbody>${tbl(res,len)}</tbody></table></div>`;
  const t=`${name[a]} vs ${name[b]} cost (${D.updated.slice(0,7)})`;
  fs.writeFileSync(`dist/${a}-vs-${b}-cost.html`,page(t+' | AI Video Price Tracker',`How much ${name[a]} and ${name[b]} cost per clip at 720p and 1080p, from their public pricing pages.`,`<h1>${t}</h1><p class="lead">Every published ${name[a]} and ${name[b]} rate we track, priced for common clip lengths, cheapest first.</p>${(a==='seedance'||b==='seedance')?sect('480p',5):''}${sect('720p',5)}${sect('1080p',8)}${sect('1080p',10)}<p><a href="/#calc">Try other lengths in the calculator →</a></p>${nlBox}`,`${a}-vs-${b}-cost`));
}
fs.writeFileSync('dist/compare/index.html',page('AI video cost comparisons','Head-to-head AI video generator cost comparisons.',`<h1>Cost comparisons</h1><ul>${compareLinks}</ul>${nlBox}`,'compare/'));
fs.writeFileSync('dist/prices.json',JSON.stringify(D,null,1));
fs.copyFileSync('style.css','dist/style.css');
const urls=['',...pairs.map(([a,b])=>`${a}-vs-${b}-cost`),'compare/'];
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>https://aivideoprice.vercel.app/${u}</loc><lastmod>${D.updated}</lastmod></url>`).join('')}</urlset>`);
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://aivideoprice.vercel.app/sitemap.xml\n');
fs.writeFileSync('dist/vercel.json',JSON.stringify({cleanUrls:true}));
console.log('built',fs.readdirSync('dist'));
