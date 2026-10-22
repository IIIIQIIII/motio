'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionPaused=reduced;
const autoVideos=new Set();
const observer=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting})=>{
 if(isIntersecting){if(v.dataset.src&&!v.src)v.src=v.dataset.src;autoVideos.add(v);if(!motionPaused)v.play().catch(()=>{});}else{v.pause();autoVideos.delete(v);}
}),{threshold:.2,rootMargin:'100px'});
document.querySelectorAll('video[muted]').forEach(v=>{v.muted=true;observer.observe(v)});
const toggle=document.querySelector('#motion-toggle');
function updateMotion(){toggle.textContent=motionPaused?'▶ Play motion':'Ⅱ Pause motion';toggle.setAttribute('aria-pressed',String(motionPaused));autoVideos.forEach(v=>motionPaused?v.pause():v.play().catch(()=>{}));document.dispatchEvent(new CustomEvent('motionchange',{detail:{paused:motionPaused}}));}
updateMotion();toggle.addEventListener('click',()=>{motionPaused=!motionPaused;updateMotion()});
document.addEventListener('visibilitychange',()=>{document.querySelectorAll('video').forEach(v=>{if(document.hidden)v.pause();else if(autoVideos.has(v)&&!motionPaused)v.play().catch(()=>{});})});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
 document.querySelectorAll('[data-category]').forEach(tile=>{tile.hidden=b.dataset.filter!=='all'&&tile.dataset.category!==b.dataset.filter;if(tile.hidden)tile.querySelector('video')?.pause();});
}));
const chapterFiles=new WeakMap();
const chapterIntent=new WeakMap();
function waitForMetadata(video){return new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',()=>reject(new Error('The selected recording could not load.')),{once:true});});}
async function seekFullRecording(button){
 const video=document.getElementById(button.dataset.videoTarget),target=Number(button.dataset.seek),group=button.closest('.chapters');
 const intent=(chapterIntent.get(video)||0)+1;chapterIntent.set(video,intent);
 let status=group.parentElement.querySelector('.chapter-status');
 if(!status){status=document.createElement('p');status.className='chapter-status';status.setAttribute('role','status');group.after(status);}
 try{
  const canSeek=target===0||Array.from({length:video.seekable.length},(_,i)=>[video.seekable.start(i),video.seekable.end(i)]).some(([a,b])=>target>=a&&target<=b);
  if(!canSeek){
   status.textContent='Loading selected chapter…';
   let file=chapterFiles.get(video);
   if(!file){const source=video.getAttribute('src');file=fetch(source,{credentials:'same-origin'}).then(async response=>{if(!response.ok)throw new Error('The recording could not load.');const blob=await response.blob();return URL.createObjectURL(blob);});chapterFiles.set(video,file);}
   const source=await file;if(chapterIntent.get(video)!==intent)return;
   if(video.getAttribute('src')!==source){const ready=waitForMetadata(video);video.src=source;video.load();await ready;}
  }
  if(chapterIntent.get(video)!==intent)return;
  video.currentTime=target;video.muted=true;await video.play();
  group.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));status.textContent='';
 }catch(error){chapterFiles.delete(video);status.textContent='Please use the player controls to retry this chapter.';}
}
document.querySelectorAll('[data-seek]').forEach(button=>button.addEventListener('click',()=>seekFullRecording(button)));
const overview=document.querySelector('#overview-video');overview.volume=.8;overview.addEventListener('loadedmetadata',()=>{const t=Math.round(overview.duration);document.querySelector('#film-duration').textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')} · Simulation to reality`;});
document.querySelectorAll('video').forEach(v=>v.addEventListener('error',()=>{v.setAttribute('title','Video could not load. Please reload the page.')}));

const hero=document.querySelector("#hero-motion");const portrait=matchMedia("(max-width:700px)");function heroSource(){const s=portrait.matches?hero.dataset.portrait:hero.dataset.landscape;if(!hero.src.endsWith(s)){hero.src=s;if(!motionPaused)hero.play().catch(()=>{});}}heroSource();portrait.addEventListener("change",heroSource);
