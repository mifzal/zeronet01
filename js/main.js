/* ===== MAIN — boot, terminal, scramble, reveal, tabs, form ===== */
(function(){
"use strict";
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine    = matchMedia('(pointer: fine)').matches;
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------- BOOT ---------- */
const bootLines = [
  '[ OK ] memantik modul kriptografi',
  '[ OK ] memuat dossier: M.EKO.NUGROHO',
  '[ OK ] handshake TLS 1.3 / X25519',
  '[ !! ] ego terdeteksi: dalam batas wajar',
  '> membuka antarmuka…'
];
const bootEl = $('#boot'), bootTxt = $('#boot-text');
function endBoot(){ bootEl.classList.add('done'); setTimeout(()=>bootEl.remove(), 600); startHero(); }
if (reduced){ bootTxt.textContent = bootLines.join('\n'); setTimeout(endBoot, 120); }
else {
  let li = 0;
  (function nextLine(){
    if (li >= bootLines.length){ setTimeout(endBoot, 320); return; }
    bootTxt.textContent += bootLines[li] + '\n'; li++;
    setTimeout(nextLine, 150);
  })();
}

/* ---------- JAM ---------- */
const clockEl = $('#clock');
function tick(){
  const t = new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour12:false});
  clockEl.innerHTML = t + ' WIB <i>▮</i>';
}
tick(); setInterval(tick, 1000);

/* ---------- SCRAMBLE DECODE ---------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01XZ$%&';
function scramble(el){
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  if (reduced){ el.textContent = final; return; }
  const start = performance.now(), dur = 850;
  (function frame(now){
    const p = Math.min(1,(now-start)/dur);
    const solid = Math.floor(p * final.length);
    let out = final.slice(0, solid);
    for (let i = solid; i < final.length; i++)
      out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random()*GLYPHS.length)|0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
  })(start);
}

/* ---------- TERMINAL HERO ---------- */
const termEl = $('#term');
const script = [
  ['cmd','whoami'],
  ['out','mifzal.eko.nugroho — pentester & peneliti keamanan'],
  ['cmd','nmap -sV --script vuln target-anda.co.id'],
  ['out','42 port dipindai · 3 celah kritis ditandai · laporan menyusul'],
  ['cmd','./kanal --buka --enkripsi'],
  ['out hot','TLS 1.3 · X25519 · SIAP MENERIMA BRIEF █']
];
let heroStarted = false;
function startHero(){
  if (heroStarted) return; heroStarted = true;
  $$('[data-scramble]').forEach((el,i)=>setTimeout(()=>scramble(el), i*180));
  if (reduced){
    script.forEach(([c,t])=>{ const d=document.createElement('div'); d.className=c; d.textContent=t; termEl.appendChild(d); });
    return;
  }
  let i = 0;
  (function typeLine(){
    if (i >= script.length) return;
    const [cls, text] = script[i];
    const div = document.createElement('div'); div.className = cls; termEl.appendChild(div);
    let c = 0;
    const speed = cls === 'cmd' ? 34 : 12;
    (function typeChar(){
      div.textContent = text.slice(0, ++c);
      if (c < text.length) setTimeout(typeChar, speed);
      else { i++; setTimeout(typeLine, cls==='cmd' ? 380 : 300); }
    })();
  })();
}

/* ---------- MARQUEE ---------- */
const items = ['WEB EXPLOITATION','ACTIVE DIRECTORY','RED TEAM','MALWARE REVERSING','OSINT','CLOUD MISCONFIG','BUG BOUNTY','DFIR','CTF','OPSEC'];
const half = items.map(t=>`<span>${t}<b>▸</b></span>`).join('');
$('#mq').innerHTML = half + half;

/* ---------- REVEAL + COUNTER + BARS ---------- */
function countUp(el){
  const target = +el.dataset.val, suf = el.dataset.suffix || '';
  if (reduced){ el.textContent = target + suf; return; }
  const start = performance.now(), dur = 1400;
  (function f(now){
    const p = Math.min(1,(now-start)/dur), e = 1-Math.pow(1-p,3);
    el.textContent = Math.round(target*e) + suf;
    if (p<1) requestAnimationFrame(f);
  })(start);
}
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if (!en.isIntersecting) return;
    const t = en.target;
    t.classList.add('in');
    t.querySelectorAll('[data-scramble]').forEach(el=>{ if(!el.dataset.done){ el.dataset.done=1; scramble(el);} });
    t.querySelectorAll('.num[data-val]').forEach(el=>{ if(!el.dataset.done){ el.dataset.done=1; countUp(el);} });
    t.querySelectorAll('.bar i').forEach(b=>{ if(!b.dataset.done){ b.dataset.done=1; b.style.width = b.dataset.level + '%'; } });
    io.unobserve(t);
  });
},{threshold:.18});
$$('[data-reveal], .sec-head, #hero').forEach(el=>io.observe(el));
$$('.sec-head').forEach(h=>{
  const o = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ h.querySelectorAll('[data-scramble]').forEach(el=>{ if(!el.dataset.done){el.dataset.done=1; scramble(el);} }); o.unobserve(h); }
  }),{threshold:.4});
  o.observe(h);
});

/* ---------- TABS DINDING BUKTI ---------- */
const tabs = $$('.tab');
tabs.forEach(btn=>btn.addEventListener('click', ()=>{
  tabs.forEach(b=>{
    const on = b === btn;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  $$('.panel').forEach(p=>{
    const show = p.id === 'panel-' + btn.dataset.tab;
    p.classList.toggle('active', show);
    if (show) p.removeAttribute('hidden'); else p.setAttribute('hidden','');
  });
}));

/* ---------- NAV ACTIVE + PROGRESS ---------- */
const navLinks = $$('.nav-links a');
const sections = navLinks.map(a=>$(a.getAttribute('href')));
addEventListener('scroll', ()=>{
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  $('#progress').style.width = (y/max*100) + '%';
  let cur = 0;
  sections.forEach((s,i)=>{ if (s && y >= s.offsetTop - 200) cur = i; });
  navLinks.forEach((a,i)=>a.classList.toggle('active', i===cur));
  if (window.scene3d) window.scene3d.scrollY = y;
},{passive:true});

/* ---------- KURSOR CROSSHAIR ---------- */
if (fine && !reduced){
  const xh = $('#xhair'), xc = $('#xcoords');
  let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
  addEventListener('mousemove', e=>{
    mx=e.clientX; my=e.clientY;
    xc.style.left = (mx+18)+'px'; xc.style.top = (my+18)+'px';
    xc.textContent = 'X:'+String(mx|0).padStart(4,'0')+' Y:'+String(my|0).padStart(4,'0');
  });
  document.addEventListener('mouseover', e=>{
    document.body.classList.toggle('hov', !!e.target.closest('a,button,.vec,.op,.cert-card,input,textarea'));
  });
  (function loop(){
    cx += (mx-cx)*.2; cy += (my-cy)*.2;
    xh.style.left = cx+'px'; xh.style.top = cy+'px';
    requestAnimationFrame(loop);
  })();
}

/* ---------- FORM ---------- */
$('#contact-form').addEventListener('submit', e=>{
  e.preventDefault();
  const btn = $('#send-btn');
  btn.disabled = true;
  if (reduced){ btn.style.display='none'; $('#form-ok').style.display='block'; return; }
  let dots = 0;
  const iv = setInterval(()=>{ btn.textContent = 'MENGENKRIPSI' + '.'.repeat(++dots % 4); }, 220);
  setTimeout(()=>{
    clearInterval(iv);
    btn.style.display='none';
    $('#form-ok').style.display='block';
  }, 1400);
});
})();