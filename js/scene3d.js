/* ===== SCENE 3D v3 — roket malware vs tembok WAF: cinematik, scroll-driven ===== */
(function(){
"use strict";
if (!window.THREE){ window.scene3d = null; return; }

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine    = matchMedia('(pointer: fine)').matches;
const mobile  = innerWidth < 700;
const canvas  = document.getElementById('gl');
const hero    = document.getElementById('hero');
const tag     = document.getElementById('waf-tag');
if (!canvas || !hero){ window.scene3d = null; return; }

window.scene3d = { scrollY:0, tx:0, ty:0 };

const renderer = new THREE.WebGLRenderer({canvas, antialias:!mobile, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .1, 160);
let baseZ = 13.5;

/* ---------- PENCAHAYAAN ---------- */
scene.add(new THREE.AmbientLight(0x2a4034, 1.15));
const key = new THREE.DirectionalLight(0xbfffd9, 1.05); key.position.set(4, 6, 8);  scene.add(key);
const rim = new THREE.DirectionalLight(0x2f7a52, .85);  rim.position.set(-6,-3,-5); scene.add(rim);
const flameLight = new THREE.PointLight(0xffc36b, 0, 14); scene.add(flameLight);
const flashLight = new THREE.PointLight(0xffffff, 0, 45); flashLight.position.set(0,0,1.5); scene.add(flashLight);

/* ---------- LANTAI GRID ---------- */
const floor = new THREE.GridHelper(70, 34, 0x1d3a2c, 0x0f1f18);
floor.position.y = -4.4;
floor.material.transparent = true; floor.material.opacity = .32;
scene.add(floor);

/* ---------- DEBU RUANG (kecepatan relatif) ---------- */
const D = mobile ? 120 : 240;
const dustPos = new Float32Array(D*3), dustSpd = new Float32Array(D);
for (let i=0;i<D;i++){
  dustPos[i*3]   = (Math.random()-.5)*34;
  dustPos[i*3+1] = (Math.random()-.5)*20;
  dustPos[i*3+2] = -30 + Math.random()*45;
  dustSpd[i] = .5 + Math.random();
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color:0x5cf59a, size:.045, transparent:true, opacity:.4, blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(dust);

/* ---------- TEMBOK WAF ---------- */
const wall = new THREE.Group(); scene.add(wall);
const cols = mobile ? 8 : 11, rows = mobile ? 6 : 7, step = 1.08;
const wallW = cols*step, wallH = rows*step;
const boxGeo  = new THREE.BoxGeometry(.95,.95,.35);
const edgeGeo = new THREE.EdgesGeometry(boxGeo);
const panelMat = new THREE.MeshStandardMaterial({color:0x0b1512, metalness:.25, roughness:.8, transparent:true});
const edgeMat  = new THREE.LineBasicMaterial({color:0x2f7a52, transparent:true, opacity:.55});
const blocks = [];
for (let ix=0; ix<cols; ix++) for (let iy=0; iy<rows; iy++){
  const x = (ix-(cols-1)/2)*step, y = (iy-(rows-1)/2)*step;
  const m = new THREE.Mesh(boxGeo, panelMat);
  m.position.set(x, y, 0);
  m.add(new THREE.LineSegments(edgeGeo, edgeMat));
  const c = Math.hypot(x, y);
  blocks.push({
    m, base:new THREE.Vector3(x,y,0),
    dir:new THREE.Vector3(
      x*.35+(Math.random()-.5)*1.2,
      y*.35+(Math.random()-.5)*1.2,
      (Math.random()*.9+.35)*(Math.random()<.75?1:-1)).normalize(),
    speed: 2.2+Math.random()*3.4+(c<1.6?2.6:0),
    rot:new THREE.Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5).multiplyScalar(3),
    spin: .6+Math.random()
  });
  wall.add(m);
}
/* shimmer shield + scan-bar */
const shimmer = new THREE.Mesh(
  new THREE.PlaneGeometry(wallW+2, wallH+2),
  new THREE.MeshBasicMaterial({color:0x5cf59a, transparent:true, opacity:.05, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthWrite:false}));
shimmer.position.z = -.45; scene.add(shimmer);
const scanbar = new THREE.Mesh(
  new THREE.BoxGeometry(wallW, .09, .09),
  new THREE.MeshBasicMaterial({color:0x5cf59a, transparent:true, opacity:.5, blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(scanbar);

/* ---------- ROKET DETAIL ---------- */
const rocket = new THREE.Group(); scene.add(rocket);
const mBody  = new THREE.MeshStandardMaterial({color:0xdfe8e2, metalness:.65, roughness:.32});
const mBand  = new THREE.MeshStandardMaterial({color:0x2f7a52, metalness:.45, roughness:.5});
const mNose  = new THREE.MeshStandardMaterial({color:0xff5648, metalness:.5,  roughness:.38});
const mDark  = new THREE.MeshStandardMaterial({color:0x16241d, metalness:.8,  roughness:.55});
const mGlow  = new THREE.MeshBasicMaterial({color:0x5cf59a});

const body = new THREE.Mesh(new THREE.CylinderGeometry(.24,.3,1.5,16), mBody);
body.rotation.x = Math.PI/2; rocket.add(body);
const band = new THREE.Mesh(new THREE.CylinderGeometry(.305,.305,.16,16), mBand);
band.rotation.x = Math.PI/2; band.position.z = .12; rocket.add(band);
const nose = new THREE.Mesh(new THREE.ConeGeometry(.24,.9,16), mNose);
nose.rotation.x = -Math.PI/2; nose.position.z = -1.2; rocket.add(nose);
const cockpit = new THREE.Mesh(new THREE.TorusGeometry(.245,.03,8,24), mGlow);
cockpit.position.z = -.42; rocket.add(cockpit);
const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(.2,.29,.38,16,1,true), mDark);
nozzle.rotation.x = Math.PI/2; nozzle.position.z = .95; rocket.add(nozzle);
for (let i=0;i<4;i++){                                   /* sirip swept */
  const a = i*Math.PI/2 + Math.PI/4;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(.04,.66,.72), mDark);
  fin.position.set(Math.cos(a)*.3, Math.sin(a)*.3, .62);
  fin.rotation.z = a; fin.rotation.y = .28;
  const tip = new THREE.Mesh(new THREE.BoxGeometry(.05,.14,.3), mBand);
  tip.position.set(Math.cos(a)*.6, Math.sin(a)*.6, .5);
  tip.rotation.z = a; tip.rotation.y = .28;
  rocket.add(fin, tip);
}
const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.55,6), mGlow);
ant.position.set(0,.42,.35); rocket.add(ant);
const payload = [];                                      /* kubus malware orbit */
for (let i=0;i<3;i++){
  const c = new THREE.Mesh(new THREE.BoxGeometry(.14,.14,.14),
    new THREE.MeshBasicMaterial({color:0xffc36b, wireframe:true, transparent:true, opacity:.85}));
  payload.push(c); rocket.add(c);
}
/* api 3 lapis */
const fOut = new THREE.Mesh(new THREE.ConeGeometry(.2,1.25,12), new THREE.MeshBasicMaterial({color:0xff9a3d, transparent:true, opacity:.5,  blending:THREE.AdditiveBlending, depthWrite:false}));
const fMid = new THREE.Mesh(new THREE.ConeGeometry(.14,.95,12), new THREE.MeshBasicMaterial({color:0xffc36b, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false}));
const fIn  = new THREE.Mesh(new THREE.ConeGeometry(.07,.6,10),  new THREE.MeshBasicMaterial({color:0xfff3d6, transparent:true, opacity:.95, blending:THREE.AdditiveBlending, depthWrite:false}));
[fOut,fMid,fIn].forEach(f=>{ f.rotation.x = Math.PI/2; f.position.z = 1.55; rocket.add(f); });

/* ---------- EXHAUST TRAIL (particle pool) ---------- */
const TR = mobile ? 70 : 150;
const trPos  = new Float32Array(TR*3);
const trVel  = new Float32Array(TR*3);
const trLife = new Float32Array(TR);
for (let i=0;i<TR;i++){ trPos[i*3+1] = 1e4; }
const trGeo = new THREE.BufferGeometry();
trGeo.setAttribute('position', new THREE.BufferAttribute(trPos, 3));
const trail = new THREE.Points(trGeo, new THREE.PointsMaterial({
  color:0xffb454, size:.09, transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(trail);
let trCursor = 0;
function emitTrail(n, throttle, rz){
  for (let k=0;k<n;k++){
    const i = trCursor = (trCursor+1) % TR;
    trPos[i*3]   = rocket.position.x + (Math.random()-.5)*.14;
    trPos[i*3+1] = rocket.position.y + (Math.random()-.5)*.14;
    trPos[i*3+2] = rz + 1.35;
    trVel[i*3]   = (Math.random()-.5)*1.4;
    trVel[i*3+1] = (Math.random()-.5)*1.4;
    trVel[i*3+2] = 3.5 + Math.random()*4.5*throttle;
    trLife[i]    = .45 + Math.random()*.5;
  }
}

/* ---------- RETICLE LOCK-ON ---------- */
const reticle = new THREE.Group(); scene.add(reticle);
const rMat = new THREE.LineBasicMaterial({color:0xffc36b, transparent:true, opacity:.9});
const rp = [];
const B = 1;
[[1,1],[-1,1],[-1,-1],[1,-1]].forEach(([sx,sy])=>{
  rp.push(sx*B, sy*B, 0,  sx*B*.55, sy*B, 0,   sx*B, sy*B, 0,  sx*B, sy*B*.55, 0);
});
const retLines = new THREE.LineSegments(
  new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)), rMat);
const retRing = new THREE.Mesh(new THREE.TorusGeometry(.85,.012,6,40),
  new THREE.MeshBasicMaterial({color:0xffc36b, transparent:true, opacity:.5}));
reticle.add(retLines, retRing);

/* ---------- SHOCKWAVE + SPARKS ---------- */
const ringA = new THREE.Mesh(new THREE.TorusGeometry(1,.035,6,48), new THREE.MeshBasicMaterial({color:0xff5648, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
const ringB = new THREE.Mesh(new THREE.TorusGeometry(1,.02,6,48),  new THREE.MeshBasicMaterial({color:0x5cf59a, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(ringA, ringB);
const SP = mobile ? 60 : 120;
const spPos = new Float32Array(SP*3);
const spGeo = new THREE.BufferGeometry();
spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({color:0x9dffC4, size:.08, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(sparks);

/* ---------- STATE & PROGRESS ---------- */
const P0 = .45;
const easeOut = q => 1 - Math.pow(1-q, 3);
const clamp01 = v => Math.min(1, Math.max(0, v));
let breached = false, prevRocketZ = 12;

function fitCamera(){
  const a = camera.aspect;
  baseZ = a < .75 ? 18.5 : a < 1 ? 16.5 : a < 1.3 ? 14.5 : 13.5;
}
function progress(){
  const range = Math.max(300, innerHeight * .95);
  return clamp01(window.scene3d.scrollY / range);
}

function frame(t, dt, p){
  const q    = easeOut(clamp01((p - P0) / (1 - P0)));
  const app  = clamp01(p / P0);                    // 0..1 fase pendekatan
  const bell = Math.exp(-Math.pow((p - P0)*14, 2)); // pulsa dampak
  const tremble = clamp01((p - (P0-.14)) / .14) * (1-q); // getar pra-tabrakan

  /* --- roket: akselerasi ease-in, lalu tembus --- */
  const rz = p <= P0 ? 12 * (1 - Math.pow(app, 1.6)) : -q*10;
  rocket.position.z = rz;
  rocket.position.x = Math.sin(t*1.7)*.1*(1-q);
  rocket.position.y = Math.cos(t*1.3)*.08*(1-q);
  rocket.rotation.z = Math.sin(t*.9)*.06*(1-q);
  const rocketSpeed = Math.abs(prevRocketZ - rz) / Math.max(dt, 1e-4);
  prevRocketZ = rz;
  const throttle = clamp01(.35 + app*.9 - q*.8);

  /* api flicker 3 lapis + cahaya */
  const f1 = 1+Math.sin(t*31)*.22+Math.sin(t*53)*.12;
  const f2 = 1+Math.sin(t*41+1.7)*.26;
  const f3 = 1+Math.sin(t*61+ .9)*.3;
  fOut.scale.set(f1, f1*(.7+throttle*.6), f1); fOut.material.opacity = .5*throttle;
  fMid.scale.set(f2, f2*(.6+throttle*.7), f2); fMid.material.opacity = .85*throttle;
  fIn.scale.set(f3, f3*(.5+throttle*.8), f3);  fIn.material.opacity  = .95*throttle;
  flameLight.position.set(rocket.position.x, rocket.position.y, rz+1.6);
  flameLight.intensity = (1.4+Math.sin(t*37)*.5) * throttle * 2.2;

  /* payload orbit + trail */
  payload.forEach((c,i)=>{
    const a = t*1.6 + i*Math.PI*2/3;
    c.position.set(Math.cos(a)*.55, Math.sin(a)*.55, -.1);
    c.rotation.set(t*2+i, t*1.4, 0);
  });
  if (!reduced && throttle > .05) emitTrail(mobile?2:4, throttle, rz);
  for (let i=0;i<TR;i++){
    if (trLife[i] <= 0){ trPos[i*3+1] = 1e4; continue; }
    trLife[i] -= dt;
    trPos[i*3]   += trVel[i*3]*dt;
    trPos[i*3+1] += trVel[i*3+1]*dt;
    trPos[i*3+2] += trVel[i*3+2]*dt;
  }
  trGeo.attributes.position.needsUpdate = true;
  trail.material.opacity = .75*clamp01(throttle+.2);

  /* --- tembok: getar → pecah → fade --- */
  for (const b of blocks){
    if (q > 0){
      b.m.position.copy(b.base).addScaledVector(b.dir, q*b.speed);
      b.m.rotation.set(b.rot.x*q*b.spin, b.rot.y*q*b.spin, b.rot.z*q*b.spin);
    } else {
      b.m.position.copy(b.base);
      if (tremble > 0) b.m.position.add(new THREE.Vector3((Math.random()-.5), (Math.random()-.5), (Math.random()-.5)).multiplyScalar(tremble*.06));
      b.m.rotation.set(0,0,0);
    }
  }
  panelMat.opacity = 1 - q*.78;
  edgeMat.opacity  = Math.max(.08, .55 + Math.sin(t*2.2)*.1 - q*.5 + tremble*.25);
  shimmer.material.opacity = Math.max(0, .05 + Math.sin(t*1.8)*.02 + tremble*.06 - q*.08);
  scanbar.position.y = Math.sin(t*.9) * wallH*.5;
  scanbar.material.opacity = .5 * (1-q) * (.6+Math.sin(t*6)*.4);

  /* --- dampak: flash, ring, sparks, shake --- */
  flashLight.intensity = bell * 7;
  ringA.scale.setScalar(1 + q*8);      ringA.material.opacity = bell*.95;
  ringB.scale.setScalar(1 + q*5.2);    ringB.material.opacity = bell*.7;
  sparks.material.opacity = q > 0 ? Math.max(0, 1 - q*1.1) : 0;
  for (let i=0;i<SP;i++){
    const th = i*2.399963, ph = Math.acos(1 - 2*((i+.5)/SP));
    const r = q * (3 + (i%5)*1.2);
    spPos[i*3]   = Math.sin(ph)*Math.cos(th)*r;
    spPos[i*3+1] = Math.sin(ph)*Math.sin(th)*r;
    spPos[i*3+2] = Math.cos(ph)*r*.6;
  }
  spGeo.attributes.position.needsUpdate = true;

  /* --- reticle lock-on --- */
  const lock = clamp01((app - .15) / .8);
  reticle.position.set(rocket.position.x, rocket.position.y, rz - 3.2);
  reticle.scale.setScalar(2.3 - lock*1.35 + q*3);
  reticle.rotation.z = t*.8;
  rMat.color.setHex(lock > .85 ? 0xff5648 : 0xffc36b);
  retRing.material.color.copy(rMat.color);
  const retOp = (p < P0 ? .35 + lock*.6 : Math.max(0, .9 - q*3));
  rMat.opacity = retOp; retRing.material.opacity = retOp*.55;

  /* --- debu: ngebut sesuai kecepatan roket --- */
  const flow = .6 + rocketSpeed*.22;
  for (let i=0;i<D;i++){
    dustPos[i*3+2] += flow * dustSpd[i] * dt * 6;
    if (dustPos[i*3+2] > camera.position.z + 6){
      dustPos[i*3+2] = -32;
      dustPos[i*3]   = (Math.random()-.5)*34;
      dustPos[i*3+1] = (Math.random()-.5)*20;
    }
  }
  dustGeo.attributes.position.needsUpdate = true;

  /* --- kamera: dolly + parallax + shake + roll --- */
  const shake = bell*.5;
  const tx = window.scene3d.tx, ty = window.scene3d.ty;
  const targetZ = baseZ - app*1.4 + q*2.2;
  camera.position.x += ((tx*1.5 + (Math.random()-.5)*shake) - camera.position.x)*.08;
  camera.position.y += ((1.1 + ty*1.0 + (Math.random()-.5)*shake) - camera.position.y)*.08;
  camera.position.z += (targetZ - camera.position.z)*.06;
  camera.lookAt(0, 0, -2.5);
  camera.rotation.z += q*.12 + Math.sin(t*57)*shake*.05;

  /* --- status WAF --- */
  const br = p > P0;
  if (br !== breached && tag){
    breached = br;
    tag.classList.toggle('breached', br);
    tag.innerHTML = br ? 'WAF: <b>BREACHED ●</b>' : 'WAF: <b>INTACT</b>';
  }

  renderer.render(scene, camera);
}

/* ---------- RESIZE / INPUT / LOOP ---------- */
function resize(){
  const w = hero.offsetWidth, h = hero.offsetHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  fitCamera();
}
resize();
addEventListener('resize', resize);
addEventListener('orientationchange', ()=>setTimeout(resize, 120));

if (fine) hero.addEventListener('mousemove', e=>{
  const r = hero.getBoundingClientRect();
  window.scene3d.tx = (e.clientX - r.left)/r.width  - .5;
  window.scene3d.ty = (e.clientY - r.top)/r.height - .5;
});

if (reduced){
  frame(0, .016, .62);
} else {
  let last = performance.now();
  (function loop(now){
    const dt = Math.min(.05, (now - last)/1000); last = now;
    frame(now/1000, dt, progress());
    requestAnimationFrame(loop);
  })(last);
}
})();