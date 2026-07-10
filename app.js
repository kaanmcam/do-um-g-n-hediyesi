const $ = s => document.querySelector(s);
const screen = $('#screen');
const bgm = $('#bgm');
const song4 = $('#song4');
const soundBtn = $('#soundBtn');
const toast = $('#toast');
let soundOn = true, audioCtx, masterGain;
let collected = 0;
let cakeLit = false;
const photos = [
  {src:'assets/photos/photo1.jpg', title:'Mor çizgi', note:'Her güzel hikâye küçük bir çizgiyle başlar...'},
  {src:'assets/photos/photo2.jpg', title:'En huzurlu yer', note:'En huzurlu yer, senin yanındı.'},
  {src:'assets/photos/photo3.jpg', title:'Love Gamze', note:'Kalbimin en güzel köşesinde hep sen varsın.'},
  {src:'assets/photos/photo4.jpg', title:'Ölümsüz Kelebekler', note:'Bazı hisler hiç eskimez.'},
  {src:'assets/photos/photo5.jpg', title:'Yağmur', note:'Yağmurun altında bile yanın en sıcak yerdi.'},
  {src:'assets/photos/photo6.jpg', title:'Sıcak bir an', note:'Bazı günlerin sıcaklığı hiç geçmiyor.'},
  {src:'assets/photos/photo7.jpg', title:'Beraber gezmek', note:'Gittiğimiz yerlerin en güzel manzarası yine sendin.'},
  {src:'assets/photos/photo8.jpg', title:'Keşfetmek', note:'Birlikte keşfetmeyi hep sevdim.'},
  {src:'assets/photos/photo9.jpg', title:'Saatler yetmez', note:'Saatlerce oturup konuşsak bile yetmiyordu.'},
  {src:'assets/photos/photo10.jpg', title:'Çimende', note:'Keşke zaman o gün biraz daha yavaş aksaydı...'}
];
const miniTitles = ['Pastayı çiz','Beni tamamla','Eksik harfleri tamamla','Ölümsüz Kelebekler','Yağmurdan koru','Hadi biraz fotoğraf çekelim','Bugün nerdeyiz?','Parçaları tamamla','Mesai Bitiyor','Kurbağalar Nerede?'];
function initAudio(){ if(audioCtx) return; audioCtx = new (window.AudioContext||window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = .35; masterGain.connect(audioCtx.destination); }
function tone(freq=440,dur=.08,type='sine',vol=.15){ if(!soundOn) return; initAudio(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(masterGain); const t=audioCtx.currentTime; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.start(t); o.stop(t+dur); }
function clickS(){ tone(520,.05,'sine',.09); setTimeout(()=>tone(720,.05,'sine',.06),35); }
function successS(){ [540,720,920].forEach((f,i)=>setTimeout(()=>tone(f,.12,'sine',.11),i*70)); }
function boop(){ tone(180,.15,'triangle',.12); }
function flutter(){ [850,1050,760].forEach((f,i)=>setTimeout(()=>tone(f,.04,'sine',.045),i*35)); }
function heartbeat(strength=.12){ tone(90,.08,'sine',strength); setTimeout(()=>tone(70,.12,'sine',strength*.85),120); }
function setMusic(vol, ms=900){
  if(!soundOn){ bgm.volume=0; return; }
  const start=bgm.volume, delta=vol-start, steps=24;
  let i=0;
  clearInterval(setMusic._t);
  setMusic._t=setInterval(()=>{
    i++;
    bgm.volume=Math.max(0,Math.min(1,start+delta*(i/steps)));
    if(i>=steps) clearInterval(setMusic._t);
  },ms/steps);
}

function fadeAudio(el, target, ms=900){
  if(!el) return;
  const start = Number.isFinite(el.volume) ? el.volume : 0;
  const delta = target - start;
  const steps = 24;
  let i=0;
  clearInterval(el._fadeTimer);
  el._fadeTimer=setInterval(()=>{
    i++;
    el.volume=Math.max(0,Math.min(1,start+delta*(i/steps)));
    if(i>=steps) clearInterval(el._fadeTimer);
  },Math.max(16,ms/steps));
}

function hardStopAudio(el, reset=true){
  if(!el) return;
  try{
    clearInterval(el._fadeTimer);
    el.pause();
    if(reset) el.currentTime=0;
    el.volume=0;
  }catch(e){}
}

function stopAllMusic(except=null){
  const tracks=[
    bgm,
    song4,
    typeof sadAudio!=='undefined' ? sadAudio : null
  ];
  tracks.forEach(el=>{
    if(el && el!==except) hardStopAudio(el,true);
  });
}

function startMusic(){
  if(!soundOn) return;
  stopAllMusic(bgm);
  bgm.volume=0;
  bgm.play().then(()=>setMusic(.18,1300)).catch(()=>{});
}

soundBtn.onclick=()=>{
  soundOn=!soundOn;
  soundBtn.textContent=soundOn?'🔊':'🔇';

  if(soundOn){
    startMusic();
  }else{
    stopAllMusic();
    if(typeof stopSadPiano==='function') stopSadPiano(true);
  }

  clickS();
};

function stopSong4Then(cb){
  if(!song4){ cb&&cb(); return; }

  fadeAudio(song4,0,650);
  setTimeout(()=>{
    hardStopAudio(song4,true);

    if(soundOn){
      stopAllMusic(bgm);
      bgm.volume=0;
      bgm.play().then(()=>setMusic(.24,1200)).catch(()=>{});
    }

    cb&&cb();
  },700);
}

function startSong4(){
  if(!soundOn || !song4) return;

  stopAllMusic(song4);
  song4.currentTime=0;
  song4.volume=0;
  song4.play().then(()=>fadeAudio(song4,.22,1800)).catch(()=>{});
}

function showToast(msg){ toast.textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1700); }
function miniFX(parent, x=50, y=50, kind='spark'){ const wrap=document.createElement('div'); wrap.className='miniFX'; wrap.style.left=(typeof x==='number'?x+'px':x); wrap.style.top=(typeof y==='number'?y+'px':y); const bits=kind==='butter'?['🦋','✦','♡','🦋','✧']:['✦','♡','✧','•','✦']; bits.forEach((t,i)=>{ const b=document.createElement('span'); b.textContent=t; b.style.setProperty('--a', (i*72)+'deg'); b.style.setProperty('--d', (26+Math.random()*20)+'px'); wrap.appendChild(b); }); (parent||document.body).appendChild(wrap); setTimeout(()=>wrap.remove(),700); }
function butterflies(n=1){ const amb=$('#ambient'); for(let i=0;i<n;i++){ const b=document.createElement('div'); b.className='butter'; b.textContent='🦋'; b.style.left=(8+Math.random()*84)+'vw'; b.style.bottom=(-20-Math.random()*70)+'px'; b.style.animationDuration=(6+Math.random()*5)+'s'; b.style.animationDelay=(Math.random()*1.5)+'s'; amb.appendChild(b); setTimeout(()=>b.remove(),11000); } }
setInterval(()=>butterflies(1),2600);
function render(html){ screen.classList.add('fadeOut'); setTimeout(()=>{ screen.className=''; screen.innerHTML=html; },260); }
function jumpTo(kind, idx=0){ clickS(); document.querySelector('.devMenu')?.classList.remove('open'); if(kind==='intro'){ collected=0; cakeLit=false; transition('Test','Giriş',intro); return; } if(kind==='password'){ collected=0; cakeLit=false; transition('Test','Şifre',password); return; } if(kind==='cinema'){ collected=0; cakeLit=false; transition('Test','Sinema',cinema); return; } if(kind==='memory'){ collected=Math.max(0,idx); cakeLit=false; transition('Test',`Anı ${idx+1}`,()=>chapter3(idx)); return; } if(kind==='final'){ collected=10; cakeLit=false; transition('Test','Final',finalPrep); return; } }
function setupDevNav(){ const app=document.querySelector('#app'); if(!app || document.querySelector('#devNav')) return; const nav=document.createElement('div'); nav.id='devNav'; nav.className='devNav'; nav.innerHTML=`<button class="devToggle" title="Bölümler">☰</button><div class="devMenu"><b>Bölüm Testi</b><button data-k="intro">Giriş</button><button data-k="password">Şifre</button><button data-k="cinema">Sinema</button>${Array.from({length:10},(_,i)=>`<button data-k="memory" data-i="${i}">Anı ${i+1}</button>`).join('')}<button data-k="final">Final</button></div>`; app.appendChild(nav); nav.querySelector('.devToggle').onclick=()=>{ clickS(); nav.querySelector('.devMenu').classList.toggle('open'); }; nav.querySelectorAll('.devMenu button').forEach(b=>b.onclick=()=>jumpTo(b.dataset.k, Number(b.dataset.i||0))); }
setTimeout(setupDevNav,0);
function transition(title, sub, cb){ const d=document.createElement('div'); d.className='transition'; d.innerHTML=`<div><div style="font-size:42px">🦋</div><p>${title}</p><h2>${sub}</h2><p>Bir anı daha seni bekliyor...</p></div>`; document.body.appendChild(d); setTimeout(()=>{ d.style.animation='fadeOut .55s ease both'; },1500); setTimeout(()=>{ d.remove(); cb&&cb(); },2050); }
function typeText(el, text, done){ el.textContent=''; let i=0; const t=setInterval(()=>{ el.textContent=text.slice(0,++i); if(i%11===0) tone(760,.025,'sine',.025); if(i>=text.length){ clearInterval(t); done&&done(); } },33); }
function intro(){ setMusic(.18); render(`<section class="screen"><div class="panel center"><p class="eyebrow">07.07.2026</p><h1 class="title">Project Kuzum</h1><p class="muted">🎧 Kulaklık takmanı öneririm.</p><div id="type" class="type"></div><button id="start" class="btn">Keşfetmeye Başlayalım</button><button id="silent" class="btn secondary">Sessiz Devam Et</button></div></section>`); setTimeout(()=>{ typeText($('#type'), 'Merhaba Kuzum...\n\nBugün 21 yaşına girdin.\n\nSana anılarımızla geleceğimizi oluşturabileceğimiz küçük bir oyun hazırladım.', ()=>{}); $('#start').onclick=()=>{ clickS(); startMusic(); transition('1. Bölüm','Kilitli Hatıra',password); }; $('#silent').onclick=()=>{ soundOn=false; soundBtn.textContent='🔇'; clickS(); transition('1. Bölüm','Kilitli Hatıra',password); }; },330); }
function password(){ setMusic(.22); const clues=[['📅','28'],['🍂','09'],['💌','19'],['🎬','Sinemaya giden yol'],['🦋','Kelebekler bilir'],['❤️','Bizim günümüz']]; render(`<section class="screen"><div class="panel center"><p class="eyebrow">1. Bölüm</p><h2 class="subtitle">Kilitli Hatıra</h2><p class="muted">Kapıyı açmak için odadaki ipuçlarını topla.</p><div class="clues">${clues.map((c,i)=>`<button class="clue" data-n="${i}">${c[0]}<span>dokun</span></button>`).join('')}</div><div id="hint" class="muted">Henüz hiçbir ipucu bulunmadı.</div><div class="code">${Array.from({length:6},(_,i)=>`<input maxlength="1" inputmode="numeric" id="d${i}">`).join('')}</div><button id="open" class="btn">Kapıyı Aç</button></div></section>`); setTimeout(()=>{ const nums=['28','09','19']; let found=0; document.querySelectorAll('.clue').forEach((b,i)=>b.onclick=()=>{ clickS(); b.classList.add('found'); if(i<3){ found++; $('#hint').textContent=`İpucu: ${nums.slice(0,Math.min(3,found)).join(' · ')}`; } else $('#hint').textContent=clues[i][1]; }); document.querySelectorAll('.code input').forEach((inp,i)=>{inp.oninput=()=>{tone(680,.035,'sine',.04); if(inp.value && i<5) $('#d'+(i+1)).focus();}}); $('#open').onclick=()=>{ clickS(); const code=Array.from({length:6},(_,i)=>$('#d'+i).value).join(''); if(code==='280919'){successS(); showToast('Kapı açıldı ❤️'); transition('2. Bölüm','İlk Sinema',cinema);} else {boop(); showToast('Bu tarih biraz utanmış galiba... 280919');} }; },330); }
function cinema(){
  setMusic(.08,900);
  render(`<section class="cinemaVN">
    <div class="vnFrame" id="vnFrame">
      <div class="vnBadge">SALON 7</div>
      <div class="vnArt doorArt"><div class="ticket">G7 · G8</div></div>
      <div class="vnCaption"><b>Sinema kapısındayız.</b><span>İki bilet, orta sıralar ve içimde garip bir heyecan...</span></div>
      <button id="vnNext" class="btn vnBtn">🎟️ Bileti Göster</button>
    </div>
  </section>`);
  setTimeout(()=>setupCinemaVN(),330);
}
function setupCinemaVN(){
  const frames=[
    {cls:'corridorArt', badge:'SALON 7', title:'Kapı açılıyor...', text:'Dışarının sesi geride kalıyor. İçeride hafif bir projektör uğultusu var.', btn:'İçeri Gir', fx:'door'},
    {cls:'aisleArt', badge:'ORTA SIRALAR', title:'G7 ve G8.', text:'En arkada değiliz; tam ortalarda, perde ışığının yüzümüze vurduğu yerdeyiz.', btn:'Koltuklara Otur', fx:'step'},
    {cls:'screenArt', badge:'FİLM BAŞLADI', title:'Salon kararıyor.', text:'Perdedeki filmi değil, yanında oturan kişiyi fark ediyorum.', btn:'Devam Et', fx:'projector'},
    {cls:'handsIntroArt', badge:'O AN', title:'Filmi bugün hâlâ hatırlamıyorum...', text:'Ama oturduğumuz koltuğu çok iyi hatırlıyorum. Çünkü ilk kez elini orada tuttum.', btn:'Ellerimize Geç', fx:'heart'}
  ];
  let k=-1;
  const root=$('#vnFrame');
  const next=()=>{
    clickS(); k++;
    if(k>=frames.length){ showHandsGame(); return; }
    const f=frames[k];
    if(f.fx==='door') { tone(150,.18,'triangle',.08); setTimeout(()=>tone(230,.22,'sine',.05),130); }
    if(f.fx==='step') { tone(190,.05,'triangle',.05); setTimeout(()=>tone(190,.05,'triangle',.05),220); }
    if(f.fx==='projector') { tone(95,.08,'sawtooth',.035); setMusic(.06,700); }
    if(f.fx==='heart') heartbeat(.12);
    root.classList.add('swap');
    setTimeout(()=>{
      root.innerHTML=`<div class="vnBadge">${f.badge}</div><div class="vnArt ${f.cls}"></div><div class="vnCaption"><b>${f.title}</b><span>${f.text}</span></div><button id="vnNext" class="btn vnBtn">${f.btn}</button></div>`;
      root.classList.remove('swap');
      $('#vnNext').onclick=next;
    },260);
  };
  $('#vnNext').onclick=next;
}
function showHandsGame(){
  setMusic(.05,900);
  render(`<section class="cinema"><div class="theater midTheater"><div class="curtain"></div><div class="movieScreen"><div>Filmi hiç hatırlamıyorum.<br>Çünkü bütün dikkatim <b>sendeydi.</b><br>Elini tuttuğum an...<br>Kalbim yerinden çıkacak gibiydi.</div></div><div class="middleSeats"><span>G7</span><span>G8</span></div><div class="seats"></div></div><div id="hands" class="handsGame"><h2 class="stageTitle">Ellerimizi birbirine kavuşturmak için<br><span style="color:#a92d5c">basılı tut...</span></h2><div class="handsStage" id="handsStage"><div class="heartMid">♡</div><div class="hand left" id="lh">🤚<span class="cuff">◼</span></div><div class="hand right" id="rh">🤚</div></div><div class="timeRow"><span>0:00</span><span>0:07</span></div><div class="progress"><div class="bar" id="handBar"></div></div><p id="handMsg">7 saniye boyunca basılı tutmalısın...</p></div></section>`);
  setTimeout(setupHands,330);
}
function setupHands(){ const area=$('#hands'), bar=$('#handBar'), stage=$('#handsStage'); let p=0, down=false, last=performance.now(), done=false, hb=0; function tick(now){ const dt=(now-last)/1000; last=now; if(!done){ if(down){ p=Math.min(1,p+dt/7); hb+=dt; const interval=.9-(p*.55); if(hb>interval){ heartbeat(.08+p*.08); hb=0; } } else p=Math.max(0,p-dt/5); const eased=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2; stage.style.setProperty('--p',eased); bar.style.width=(p*100)+'%'; if(p>=1){ done=true; successS(); if(navigator.vibrate) navigator.vibrate([60,40,80]); setMusic(.18,1400); area.innerHTML=`<div class="joined"><div class="joinedInner"><div class="joinedHeart">♡</div><div class="joinedHands">🤝</div><h2>Birleştiniz...</h2><p class="muted joinedText">O an filmi tamamen unutmuştuk.<br>Çünkü kalplerimiz birbirine odaklanmıştı.</p><button id="toMem" class="btn joinedBtn">Anılarımıza Geç</button></div></div>`; const toMemBtn=$('#toMem'); ['pointerdown','pointerup','click'].forEach(ev=>toMemBtn.addEventListener(ev,e=>e.stopPropagation())); toMemBtn.addEventListener('click',()=>{ clickS(); transition('3. Bölüm','Anılarımız',()=>chapter3(0)); }); return; } }
 requestAnimationFrame(tick); } requestAnimationFrame(tick); area.addEventListener('pointerdown',e=>{down=true; clickS(); area.setPointerCapture?.(e.pointerId);}); area.addEventListener('pointerup',()=>down=false); area.addEventListener('pointercancel',()=>down=false); area.addEventListener('pointerleave',()=>down=false); }
function cakeHTML(){
  // Mumlar pastanın üst sınırları içinde kalsın diye sabit ve daha güvenli konumlar.
  const pos=[[20,50],[29,60],[38,52],[47,62],[56,52],[65,62],[74,50],[34,40],[50,38],[66,40]];
  return `<div class="cake">${pos.slice(0,collected).map((p,idx)=>`<div class="candle candle${idx+1}" style="left:${p[0]}%;bottom:${p[1]}px"><i class="flame ${cakeLit?'':'off'}"></i></div>`).join('')}<div class="cakeBase"></div></div>`;
}
function chapter3(idx){ if(idx===3){} else setMusic(.24,1200); if(idx>=10) return finalPrep(); render(`<section class="chapter3 ${idx===6?'chapter3Tbmm':''} ${idx===9?'frogChapter':''}"><div class="cakeCard"><div class="cakeTop"><div><p class="eyebrow">3. Bölüm</p><h2 class="stageTitle">Anılarımız</h2><div class="muted">Mumlar: ${collected}/10</div></div>${cakeHTML()}</div></div><div class="stageCard"><p class="eyebrow">Anı ${idx+1}/10</p><h2 class="stageTitle">${miniTitles[idx]}</h2><p class="muted">Mini oyunu tamamla, fotoğraf ve bir mum kazan.</p><div class="miniArea" id="mini"></div><div id="miniText" class="muted"></div></div></section>`); setTimeout(()=>setupMini(idx),330); }
function completeMini(idx){
  successS();
  collected++;
  if(idx===3){ transition('Mum eklendi','Pastamız biraz daha tamamlandı',()=>chapter3(idx+1)); return; }
  showPolaroid(idx,()=>{
    if(idx===9){ transition('Bütün Anılar','Hepsi aynı yerde buluşuyor...',memoriesOverview); }
    else { transition('Mum eklendi','Pastamız biraz daha tamamlandı',()=>chapter3(idx+1)); }
  });
}
function showPolaroid(idx, cb){ const p=photos[idx]; const el=document.createElement('div'); el.className='polaroid'; el.innerHTML=`<button class="close">×</button><img src="${p.src}"><p>${p.note}</p><button class="btn" style="color:white">Mumu Pastaya Ekle</button>`; document.body.appendChild(el); el.querySelector('.close').onclick=el.querySelector('.btn').onclick=()=>{ clickS(); el.remove(); cb&&cb(); }; }
function setupMini(i){
 const m=$('#mini'), text=$('#miniText');
 if(i===0){ setupTraceCake(i,m,text); }
 else if(i===1){ setupTraceHug(i,m,text); }
 else if(i===2){ m.innerHTML=`<div class="wordSlots"><span class="letter">L</span><span class="letter">O</span><span class="letter">V</span><span class="letter">E</span><span class="letter">G</span><input class="letter" id="miss" maxlength="1"><span class="letter">M</span><span class="letter">Z</span><span class="letter">E</span></div><button class="btn">Tamamla</button>`; $('#miss').focus(); m.querySelector('.btn').onclick=()=>{ clickS(); ($('#miss').value.toUpperCase()==='A')?completeMini(i):(boop(),showToast('Bir harf kaldı: A')); }; }
 else if(i===3){ setupSongMemory(i,m,text); }
 else if(i===4){ setupRainMemory(i,m,text); }
 else if(i===5){ setupPhotoMemory(i,m,text); }
 else if(i===6){ setupTbmmMemory(i,m,text); }
 else if(i===7){ setupAnitkabirPuzzle(i,m,text); }
 else if(i===8){ setupShiftMemory(i,m,text); }
 else if(i===9){ setupFrogMemory(i,m,text); }
 else { m.innerHTML=`<div class="gameGrid cards">${Array.from({length:9},(_,k)=>`<button class="card">⭐</button>`).join('')}</div>`; let c=0; m.querySelectorAll('.card').forEach(b=>b.onclick=()=>{flutter(); b.textContent='✨'; b.disabled=true; if(++c>=7) completeMini(i);}); }
}



function setupShiftMemory(i,m,text){
  text.textContent='O gün herhangi bir gündü. O günü, bitiminde özel kılan sendin.';
  const stage=m.closest('.stageCard'); if(stage) stage.classList.add('shiftStageCard');
  let introStep=0;
  m.innerHTML=`<div class="shiftIntro shiftIntroCute" id="shiftIntro">
    <div class="nightDots"></div>
    <div class="shiftMoon">☾</div>
    <div class="shiftGlow friesOnly">🍟</div>
    <div class="cloudText cloud1"><p class="shiftLine line1">O gün herhangi bir gündü.</p></div>
    <div class="cloudText cloud2"><p class="shiftLine line2">O günü, bitiminde özel kılan...</p></div>
    <p class="shiftLine sendin">sendin. ❤️</p>
    <button class="btn" id="startShift">Mesaiye Başla</button>
  </div>`;
  const intro=m.querySelector('#shiftIntro');
  setTimeout(()=>intro.classList.add('step1'),900);
  setTimeout(()=>intro.classList.add('step2'),4200);
  setTimeout(()=>intro.classList.add('step3'),6900);
  setTimeout(()=>intro.classList.add('ready'),9100);
  m.querySelector('#startShift').onclick=()=>{ clickS(); renderShiftGame(); };

  function renderShiftGame(){
    const ordersBase=[['🍔'],['🥤','🍟'],['🍔','🍟'],['🥤'],['🍔','🥤'],['🍟'],['🍔','🍟','🥤']];
    const orders=ordersBase.sort(()=>Math.random()-.5).slice(0,7);
    let orderIndex=0, remaining=7, minute=53, current=[], tray=[];
    const sweet=['Biraz daha sabır...','Biri seni bekliyor.','Az kaldı.','Son siparişler...','Çıkış saati yaklaşıyor.','Yorgunluk birazdan geçecek.','Bir adım daha, bebeğim.'];
    m.innerHTML=`<div class="shiftGame shiftGameCute" id="shiftGame">
      <div class="shiftHeader">
        <div><span>Çıkışa Kalan Sipariş</span><b id="orderLeft">7 / 7</b></div>
        <div class="shiftClock"><i></i><b id="clockText">21:53</b></div>
      </div>
      <div class="shiftHearts" id="shiftHearts">${Array.from({length:7},()=>`<span>♡</span>`).join('')}</div>
      <div class="shiftMessage" id="shiftMessage">Doğru ürünleri tepsiye koy.</div>
      <div class="orderPanel cuteOrder"><span>Sıradaki Sipariş</span><div id="orderItems" class="orderItems"></div></div>
      <div class="tray cuteTray" id="tray"><em>TEPSİ</em><div id="trayItems"></div><b class="traySmile">⌣</b></div>
      <div class="products cuteProducts" id="products">
        <button class="product" data-item="🍔">🍔<small>Burger</small></button>
        <button class="product" data-item="🍟">🍟<small>Patates</small></button>
        <button class="product" data-item="🥤">🥤<small>İçecek</small></button>
      </div>
    </div>`;
    const left=m.querySelector('#orderLeft'), clock=m.querySelector('#clockText'), orderItems=m.querySelector('#orderItems'), trayItems=m.querySelector('#trayItems'), trayEl=m.querySelector('#tray'), msg=m.querySelector('#shiftMessage'), game=m.querySelector('#shiftGame'), hearts=[...m.querySelectorAll('#shiftHearts span')];
    function drawOrder(){
      current=[...orders[orderIndex]]; tray=[];
      orderItems.innerHTML=current.map(x=>`<b>${x}</b>`).join('');
      trayItems.innerHTML=''; left.textContent=`${remaining} / 7`; clock.textContent=`21:${String(minute).padStart(2,'0')}`;
      msg.textContent='Doğru ürünleri tepsiye koy.';
      hearts.forEach((h,idx)=>{h.textContent=idx < (7-remaining) ? '♥' : '♡'; h.classList.toggle('filled', idx < (7-remaining));});
    }
    function pulseMsg(txt){ msg.textContent=txt; msg.classList.remove('pop'); void msg.offsetWidth; msg.classList.add('pop'); }
    function addItem(item, btn){
      if(!current.includes(item) || tray.filter(x=>x===item).length >= current.filter(x=>x===item).length){
        boop(); pulseMsg('Sanırım bu sipariş değildi 😊'); btn.classList.add('wrongProduct'); setTimeout(()=>btn.classList.remove('wrongProduct'),340); return;
      }
      clickS(); tray.push(item); const s=document.createElement('span'); s.textContent=item; trayItems.appendChild(s); miniFX(trayEl, trayEl.clientWidth/2, trayEl.clientHeight/2, 'spark');
      if(current.length===tray.length && current.every(x=>tray.includes(x))){
        successS(); trayEl.classList.add('served'); setTimeout(()=>trayEl.classList.remove('served'),380);
        remaining--; minute++;
        hearts.forEach((h,idx)=>{h.textContent=idx < (7-remaining) ? '♥' : '♡'; h.classList.toggle('filled', idx < (7-remaining));});
        miniFX(game, game.clientWidth*.50, game.clientHeight*.20, 'spark');
        pulseMsg(sweet[Math.floor(Math.random()*sweet.length)]);
        orderIndex++;
        if(remaining<=0){ finishShift(); }
        else setTimeout(drawOrder,850);
      }
    }
    m.querySelectorAll('.product').forEach(btn=>{
      btn.onclick=()=>addItem(btn.dataset.item,btn);
      btn.draggable=true;
      btn.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',btn.dataset.item));
    });
    trayEl.addEventListener('dragover',e=>e.preventDefault());
    trayEl.addEventListener('drop',e=>{e.preventDefault(); const item=e.dataTransfer.getData('text/plain'); const btn=[...m.querySelectorAll('.product')].find(b=>b.dataset.item===item); addItem(item,btn||m.querySelector('.product'));});
    function finishShift(){
      left.textContent='0 / 7'; clock.textContent='22:00';
      game.classList.add('shiftDone');
      msg.innerHTML='Mesai Bitti ❤️';
      setTimeout(()=>{
        m.innerHTML=`<div class="shiftFinish"><h3>Beklediğin için teşekkür ederim.</h3><p>O günü, bitiminde özel kılan sendin.</p><button class="btn" id="shiftPhoto">Anıyı Aç</button></div>`;
        m.querySelector('#shiftPhoto').onclick=()=>{ clickS(); completeMini(i); };
      },900);
    }
    drawOrder();
  }
}

function setupAnitkabirPuzzle(i,m,text){
  text.textContent='Numaralı karton parçaları aynı numaralı yapboz yuvalarına bırak. Her doğru hamlede fotoğrafımız biraz daha ortaya çıksın.';
  const stage=m.closest('.stageCard'); if(stage) stage.classList.add('puzzleStageCard'); const section=m.closest('.chapter3'); if(section) section.classList.add('anitkabirChapter');
  const nums=[1,2,3,4,5,6,7];
  const pieces=nums.map(n=>({id:'p'+n,num:n})).sort(()=>Math.random()-.5);
  const slotOrder=[5,2,7,1,6,3,4];
  m.innerHTML=`<div class="anitPuzzle" id="anitPuzzle">
    <div class="puzzleIntro">Bazı anılar parça parça ortaya çıkar.</div>
    <div class="puzzleProgress" id="puzzleProgress">0 / 7</div>
    <div class="puzzleBoard numberedPuzzle" id="puzzleBoard" style="--photo:url('${photos[7].src}')">
      <div class="photoUnder"></div>
      ${slotOrder.map((n,k)=>`<button class="puzzleSlot s${k+1}" data-id="p${n}" aria-label="${n} numaralı yapboz yuvası"><span>${n}</span></button>`).join('')}
    </div>
    <div class="puzzlePieces" id="puzzlePieces">${pieces.map(p=>`<button class="puzzlePiece numberedPiece" draggable="true" data-id="${p.id}"><span>${p.num}</span></button>`).join('')}</div>
    <div class="puzzleHint" id="puzzleHint">Bir karton parça seç, aynı numaralı yuvaya bırak.</div>
  </div>`;
  const game=m.querySelector('#anitPuzzle'), board=m.querySelector('#puzzleBoard'), hint=m.querySelector('#puzzleHint'), progress=m.querySelector('#puzzleProgress');
  const slots=[...m.querySelectorAll('.puzzleSlot')], pieceEls=[...m.querySelectorAll('.puzzlePiece')];
  let selected=null, placed=0, done=false;
  const softWrong=['Sanırım burası değil 😊','Biraz daha dikkatli bakalım.','Yaklaştın ama bu parça başka yere ait.','Bu numara başka yuvayı arıyor.'];
  function updatePhoto(){
    const r=Math.min(1, placed/7);
    board.style.setProperty('--reveal', r);
    progress.textContent = placed<7 ? `${placed} / 7` : '7 / 7 ❤️';
  }
  function selectPiece(piece){
    if(done || piece.classList.contains('placed')) return;
    selected=piece;
    pieceEls.forEach(p=>p.classList.toggle('selected',p===piece));
    hint.textContent=`${piece.querySelector('span').textContent} numaralı yuvayı bul.`;
    clickS();
  }
  function wrong(slot){
    boop();
    slot.classList.add('wrong'); setTimeout(()=>slot.classList.remove('wrong'),330);
    hint.textContent=softWrong[Math.floor(Math.random()*softWrong.length)];
  }
  function showCandlePrompt(){
    const card=document.createElement('div');
    card.className='candlePrompt';
    card.innerHTML=`<div class="candlePromptCard"><div class="bigCandle">🕯️</div><h3>Harika...</h3><p>Bir mum daha ekleme zamanı.</p><button class="btn">Mumu Ekle</button></div>`;
    document.body.appendChild(card);
    card.querySelector('button').onclick=()=>{
      clickS(); card.remove();
      collected++;
      transition('Mum eklendi','Pastamız biraz daha tamamlandı',()=>chapter3(i+1));
    };
  }
  function place(piece, slot){
    if(done || !piece || !slot || slot.classList.contains('filled')) return;
    if(piece.dataset.id !== slot.dataset.id){ wrong(slot); return; }
    slot.classList.add('filled'); piece.classList.add('placed'); piece.disabled=true;
    // Numara kalsın ama parça oturduğu anda yumuşakça fotoğraf parçası öne çıksın.
    placed++; updatePhoto();
    successS(); miniFX(board, slot.offsetLeft+slot.offsetWidth/2, slot.offsetTop+slot.offsetHeight/2, placed>=6?'butter':'spark');
    hint.textContent = placed<7 ? `${placed}/7 parça tamamlandı. Fotoğrafımız yavaş yavaş beliriyor...` : '7... Bizim uğurlu sayımız. ❤️';
    selected=null; pieceEls.forEach(p=>p.classList.remove('selected'));
    if(placed>=7){
      done=true; board.classList.add('completed');
      text.textContent='Bazı anılar eksik değildi... Sadece birlikte tamamlanmayı bekliyordu.';
      setTimeout(()=>{ if(navigator.vibrate) navigator.vibrate([45,30,45]); heartbeat(.16); },300);
      setTimeout(showCandlePrompt,1350);
    }
  }
  pieceEls.forEach(piece=>{
    piece.addEventListener('click',()=>selectPiece(piece));
    piece.addEventListener('dragstart',e=>{ selected=piece; e.dataTransfer.setData('text/plain', piece.dataset.id); piece.classList.add('selected'); });
    piece.addEventListener('dragend',()=>piece.classList.remove('selected'));
  });
  slots.forEach(slot=>{
    slot.addEventListener('click',()=>{ if(selected) place(selected,slot); else { hint.textContent='Önce alttan bir karton parça seç.'; boop(); } });
    slot.addEventListener('dragover',e=>{ e.preventDefault(); slot.classList.add('hover'); });
    slot.addEventListener('dragleave',()=>slot.classList.remove('hover'));
    slot.addEventListener('drop',e=>{ e.preventDefault(); slot.classList.remove('hover'); const id=e.dataTransfer.getData('text/plain'); const piece=pieceEls.find(p=>p.dataset.id===id); place(piece,slot); });
  });
  updatePhoto();
}

function setupPhotoMemory(i,m,text){
  text.textContent='O gün sürekli fotoğrafımız çekiliyordu. Doğru an yeşile dönünce 7 güzel kare yakala.';
  const stage=m.closest('.stageCard'); if(stage) stage.classList.add('photoStage');
  m.innerHTML=`<div class="photoGame timingPhoto" id="photoGame">
    <div class="cameraTop"><b id="shotCounter">0/7</b><span id="photoMood">Kamera sizi takip ediyor...</span></div>
    <div class="viewFinder timedFinder" id="viewFinder">
      <div class="sceneLayer" id="sceneLayer">
        <div class="sunBlob"></div><div class="warmHill h1"></div><div class="warmHill h2"></div>
        <div class="photoCouple" id="photoCouple"><span class="boy" id="poseBoy">🧑</span><span class="girl" id="poseGirl">👩</span><i id="poseHeart">♡</i></div>
      </div>
      <div class="focusRing" id="focusRing"><span id="focusCue">bekle</span></div>
      <div class="cameraFlash" id="cameraFlash"></div>
      <div class="sweetCaption" id="sweetCaption">İlk kare için doğru anı bekle...</div>
      <div class="autoFollow">otomatik takip</div>
    </div>
    <button class="btn shutter notReady" id="shutter">📸 Doğru Anı Bekle</button>
    <div class="filmStrip" id="filmStrip"></div>
    <p class="muted photoHint" id="photoHint">Vizör yeşile döndüğünde çek. Her karede poz değişecek.</p>
  </div>`;
  const game=m.querySelector('#photoGame'), vf=m.querySelector('#viewFinder'), couple=m.querySelector('#photoCouple'), ring=m.querySelector('#focusRing'), scene=m.querySelector('#sceneLayer'), flash=m.querySelector('#cameraFlash'), counter=m.querySelector('#shotCounter'), mood=m.querySelector('#photoMood'), strip=m.querySelector('#filmStrip'), hint=m.querySelector('#photoHint'), shutter=m.querySelector('#shutter'), heart=m.querySelector('#poseHeart'), cue=m.querySelector('#focusCue'), boy=m.querySelector('#poseBoy'), girl=m.querySelector('#poseGirl'), sweet=m.querySelector('#sweetCaption');
  const captions=['Gamze göz kırptı 😄','Ben başka yere baktım','Kadro biraz yamuk','Işık çok tatlı','Gülüş yakalandı','Bir tane daha...','İşte bu. ❤️'];
  const sweetTexts=['Biraz daha yaklaşın bakalım...','Bu gülüş saklanmalıydı.','Kamera bile sizi sevdi.','Sıcaklık kadraja sığmadı.','Bunu albüme koyuyoruz.','Son bir güzel kare daha...','İşte en güzel an.'];
  const poses=[
    ['🧑','👩','♡'], ['🙋‍♂️','😊','♡'], ['😌','😄','♡'], ['🧑‍🤝‍👩','', '♡'], ['🤵','💃','♡'], ['😳','🥰','♡'], ['🫶','🥹','❤️']
  ];
  let shots=0, done=false, start=performance.now(), followX=0, followY=0;
  let ready=false, readyStart=0, readyEnd=0, nextReady=performance.now()+1300;
  let poseSeed=Math.random()*10;
  function waitMs(){ return 850 + Math.random()*1750; }
  function windowMs(){ return 850 + Math.random()*520; }
  function scheduleNext(now){ ready=false; readyStart=now+waitMs(); readyEnd=readyStart+windowMs(); nextReady=readyStart; ring.classList.remove('ready'); shutter.classList.add('notReady'); shutter.textContent='📸 Doğru Anı Bekle'; cue.textContent='bekle'; }
  scheduleNext(performance.now());
  function setPose(n){
    const p=poses[Math.min(n,poses.length-1)]; boy.textContent=p[0]; girl.textContent=p[1]; heart.textContent=p[2];
    couple.classList.remove('posePop'); void couple.offsetWidth; couple.classList.add('posePop');
  }
  setPose(0);
  function addThumb(n, label){
    const t=document.createElement('div');
    t.className='shotThumb shotIn';
    t.innerHTML=`<span>${n}</span><em>${label}</em>`;
    strip.appendChild(t);
    setTimeout(()=>t.classList.remove('shotIn'),400);
  }
  function showSweet(txt){
    sweet.textContent=txt; sweet.classList.remove('sweetPop'); void sweet.offsetWidth; sweet.classList.add('sweetPop');
  }
  function badShot(){
    boop();
    vf.classList.add('missShot'); setTimeout(()=>vf.classList.remove('missShot'),260);
    mood.textContent='Biraz bekle... doğru an gelince vizör yeşil olacak.';
    hint.textContent='Henüz değil bebeğim; ışık tam oturunca çek.';
  }
  function takeShot(){
    if(done) return;
    if(!ready){ badShot(); return; }
    ready=false;
    clickS(); tone(880,.04,'sine',.08); setTimeout(()=>tone(1200,.04,'sine',.07),60);
    flash.classList.remove('flashNow'); void flash.offsetWidth; flash.classList.add('flashNow');
    vf.classList.add('snap'); setTimeout(()=>vf.classList.remove('snap'),260);
    miniFX(vf, vf.clientWidth*.5, vf.clientHeight*.48, shots>=5?'butter':'spark');
    const label=captions[shots]||'Güzel kare';
    showSweet(sweetTexts[shots]||'Çok güzel.');
    shots++; counter.textContent=shots+'/7'; mood.textContent=label;
    addThumb(shots,label);
    setPose(shots);
    if(shots>=7){
      done=true; shutter.disabled=true; shutter.textContent='📸 Albüme Ekleniyor'; hint.textContent='Son kare albüme yerleşiyor...';
      vf.classList.add('perfectShot'); successS();
      setTimeout(()=>{ text.textContent='O gün çekilen karelerden biri daha anılarımıza eklendi.'; completeMini(i); },1350);
    } else {
      hint.textContent='Sıradaki poz için yeşil anı bekle.';
      scheduleNext(performance.now());
    }
  }
  shutter.onclick=takeShot;
  vf.onclick=(e)=>{ if(e.target===vf || e.target===scene || e.target===couple || e.target===ring || e.target===cue) takeShot(); };
  function tick(now){
    if(done) return;
    const t=(now-start)/1000;
    const x=50 + Math.sin(t*.82+poseSeed)*24 + Math.sin(t*1.65)*4;
    const y=53 + Math.sin(t*1.05+1.2)*7;
    const rot=Math.sin(t*1.25)*2.3;
    couple.style.left=x+'%'; couple.style.top=y+'%'; couple.style.transform=`translate(-50%,-50%) rotate(${rot}deg)`;
    followX += (x-50-followX)*0.038; followY += (y-53-followY)*0.038;
    scene.style.transform=`translate(${-followX*.22}%, ${-followY*.16}%) scale(1.035)`;
    ring.style.left=x+'%'; ring.style.top=y+'%';
    const shouldReady = now>=readyStart && now<=readyEnd;
    if(shouldReady!==ready){
      ready=shouldReady;
      ring.classList.toggle('ready',ready); shutter.classList.toggle('notReady',!ready); shutter.classList.toggle('readyBtn',ready);
      if(ready){ mood.textContent='Tam şimdi!'; shutter.textContent='📸 Şimdi Çek'; cue.textContent='çek'; tone(1040,.055,'sine',.045); }
      else if(now>readyEnd){ mood.textContent='An kaçtı, yenisi geliyor...'; shutter.textContent='📸 Doğru Anı Bekle'; cue.textContent='bekle'; scheduleNext(now); }
    }
    if(!ready){
      const sec=Math.max(0,(readyStart-now)/1000);
      if(sec>0 && sec<2.8) cue.textContent=sec<.7?'hazır...':'bekle';
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function setupTbmmMemory(i,m,text){
  const stage=m.closest('.stageCard'); if(stage) stage.classList.add('tbmmStage');
  text.textContent='Feneri gezdir, simgelerin altında saklanan harfleri bul. Bugün nerdeyiz?';
  m.innerHTML=`<div class="tbmmGame" id="tbmmGame">
    <div class="tbmmTop"><span class="tbmmTag">Kayıp rozet</span><b id="tbmmStatus">Feneri hareket ettir ve simgelere dokun.</b></div>
    <div class="tbmmSlots" id="tbmmSlots">${['T','B','M','M'].map(()=>`<span>_</span>`).join('')}</div>
    <div class="searchScene" id="searchScene">
      <div class="tbmmSilhouette">TBMM</div>
      <div class="spotlight" id="spotlight"></div>
      <div class="itemLayer" id="itemLayer"></div>
      <div class="rozetBadge" id="rozetBadge">🪪</div>
    </div>
    <p class="muted tbmmHint" id="tbmmHint">İpucu: Harfler sırayla çıkacak. T · B · M · M</p>
  </div>`;
  const game=m.querySelector('#tbmmGame'), scene=m.querySelector('#searchScene'), layer=m.querySelector('#itemLayer'), slots=[...m.querySelectorAll('#tbmmSlots span')], status=m.querySelector('#tbmmStatus'), hint=m.querySelector('#tbmmHint'), badge=m.querySelector('#rozetBadge');
  const letters=['T','B','M','M'];
  const icons=['🏛️','🇹🇷','📜','🪪','🎟️','🖼️','🕰️','🔎','📌','🗂️'];
  const decoys=['Burada sadece Ankara heyecanı var.','Rozet değil ama güzel bir anı çıktı.','Buranın altında sana bakarken kaybolmuşum.','Burada harf yok, ama günün izi var.','Fener biraz daha dikkat istiyor.','Sanki yaklaştık ama bu değil.'];
  let step=0, locked=false, roundItems=[];
  function moveLight(clientX,clientY){
    const r=scene.getBoundingClientRect();
    const x=Math.max(0,Math.min(100,(clientX-r.left)/r.width*100));
    const y=Math.max(0,Math.min(100,(clientY-r.top)/r.height*100));
    scene.style.setProperty('--fx',x+'%'); scene.style.setProperty('--fy',y+'%');
  }
  scene.addEventListener('pointermove',e=>moveLight(e.clientX,e.clientY));
  scene.addEventListener('pointerdown',e=>{moveLight(e.clientX,e.clientY);});
  function itemHTML(icon, correct, letter, idx){
    const x=8+Math.random()*78, y=16+Math.random()*62;
    const dx=(Math.random()>.5?1:-1)*(8+Math.random()*18), dy=(Math.random()>.5?1:-1)*(5+Math.random()*12);
    const dur=3.6+Math.random()*2.8;
    return `<button class="searchItem" data-correct="${correct?'1':'0'}" data-letter="${letter||''}" style="left:${x}%;top:${y}%;--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;animation-delay:${Math.random()*-.9}s"><span>${icon}</span></button>`;
  }
  function spawnRound(){
    locked=false; layer.innerHTML='';
    const correctIndex=Math.floor(Math.random()*6);
    let html='';
    for(let k=0;k<6;k++){
      const isC=k===correctIndex;
      const ic=icons[Math.floor(Math.random()*icons.length)];
      html+=itemHTML(ic,isC,letters[step],k);
    }
    layer.innerHTML=html;
    layer.querySelectorAll('.searchItem').forEach(btn=>btn.addEventListener('click',()=>tapItem(btn)));
    status.textContent=step===0?'İlk harf saklandı...':'Sıradaki harfi ara.';
    hint.textContent=`Bulunan: ${letters.slice(0,step).join('') || 'henüz yok'}${'_'.repeat(4-step)}`;
  }
  function popLetter(btn, letter){
    const r=btn.getBoundingClientRect(), sr=scene.getBoundingClientRect();
    const p=document.createElement('div');
    p.className='letterPop'; p.textContent=letter;
    p.style.left=(r.left-sr.left+r.width/2)+'px'; p.style.top=(r.top-sr.top+r.height/2)+'px';
    scene.appendChild(p); setTimeout(()=>p.remove(),850);
  }
  function tapItem(btn){
    if(locked || btn.disabled) return;
    btn.disabled=true;
    const correct=btn.dataset.correct==='1';
    const r=btn.getBoundingClientRect(); const sr=scene.getBoundingClientRect();
    if(correct){
      locked=true; const letter=btn.dataset.letter;
      clickS(); successS(); flutter();
      btn.classList.add('foundItem');
      popLetter(btn,letter); miniFX(scene, r.left-sr.left+r.width/2, r.top-sr.top+r.height/2, 'butter');
      slots[step].textContent=letter; slots[step].classList.add('found');
      status.textContent=`${letter} bulundu!`;
      hint.textContent= step<3 ? 'Rozette bir harf daha parladı.' : 'Bütün harfler tamamlandı.';
      badge.classList.add('badgeGlow'); setTimeout(()=>badge.classList.remove('badgeGlow'),620);
      step++;
      if(step>=letters.length){
        setTimeout(()=>{
          game.classList.add('tbmmDone');
          status.textContent='Bugün nerdeyiz? TBMM.';
          hint.textContent='Kayıp rozet bulundu. Hatıra onaylandı ❤️';
          layer.innerHTML='';
          badge.textContent='TBMM'; badge.classList.add('badgeFinal');
          miniFX(scene, scene.clientWidth/2, scene.clientHeight/2, 'spark');
          setTimeout(()=>completeMini(i),1300);
        },700);
      } else {
        setTimeout(spawnRound,900);
      }
    } else {
      boop(); btn.classList.add('decoyItem');
      const msg=decoys[Math.floor(Math.random()*decoys.length)];
      status.textContent=msg; showToast(msg);
      miniFX(scene, r.left-sr.left+r.width/2, r.top-sr.top+r.height/2, 'spark');
      setTimeout(()=>{ btn.remove(); if(layer.querySelectorAll('.searchItem').length<=1 && !locked) spawnRound(); },360);
    }
  }
  spawnRound();
}

function setupRainMemory(i,m,text){
  text.textContent='Şemsiyeyi kızla erkeğin üstünde tut. 21 saniye koru; şimşeklerden 3 can hakkınız var.';
  m.innerHTML=`<div class="rainBox chaseRain" id="rain">
    <div class="rainHud"><b id="rainTimer">21.0</b><span> saniye</span><em id="lives">❤️❤️❤️</em></div>
    <div class="wind" id="wind">Rüzgar sakin</div>
    <div class="couple" id="couple">👫</div>
    <div class="umbrella chaseUmb" id="umb">☂️</div>
    <div class="lightning" id="lightning">⚡</div>
  </div><p class="muted rainStatus" id="rainStatus">Bizi yağmurdan koru bebeğim...</p>`;
  const rain=m.querySelector('#rain'), umb=m.querySelector('#umb'), couple=m.querySelector('#couple'), timer=m.querySelector('#rainTimer'), status=m.querySelector('#rainStatus'), wind=m.querySelector('#wind'), livesEl=m.querySelector('#lives'), lightning=m.querySelector('#lightning');
  for(let k=0;k<48;k++){ const d=document.createElement('span'); d.className='drop'; d.textContent='╲'; d.style.left=Math.random()*100+'%'; d.style.animationDelay=Math.random()*1.7+'s'; d.style.animationDuration=(.75+Math.random()*.65)+'s'; rain.appendChild(d); }
  let umbX=50, coupleX=50, targetX=50, remaining=21, lives=3, last=performance.now(), done=false;
  let windForce=0, nextWind=1.5, nextMove=0.6, nextLightning=3.2, lightningActive=false;
  function setUmb(x){ umbX=Math.max(8,Math.min(92,x)); umb.style.left=umbX+'%'; }
  function setCouple(x){ coupleX=Math.max(15,Math.min(85,x)); couple.style.left=coupleX+'%'; }
  setUmb(50); setCouple(50);
  function move(clientX){ const r=rain.getBoundingClientRect(); setUmb((clientX-r.left)/r.width*100); }
  rain.onpointerdown=e=>{ move(e.clientX); rain.setPointerCapture?.(e.pointerId); clickS(); };
  rain.onpointermove=e=>move(e.clientX);
  function strike(){
    if(done || lightningActive) return;
    lightningActive=true;
    const strikeX = coupleX + (Math.random()*16-8);
    lightning.style.left=strikeX+'%'; lightning.classList.add('active');
    tone(120,.08,'sawtooth',.08); setTimeout(()=>tone(80,.16,'triangle',.09),80);
    setTimeout(()=>{
      lightning.classList.remove('active');
      const protectedNow = Math.abs(umbX-coupleX)<12;
      if(!protectedNow){
        lives--; livesEl.textContent='❤️'.repeat(Math.max(0,lives))+'🤍'.repeat(Math.max(0,3-lives));
        boop(); status.textContent='Şimşek değdi... Biraz daha dikkat bebeğim.'; rain.classList.add('hit'); setTimeout(()=>rain.classList.remove('hit'),360);
        if(lives<=0){ failRain(); return; }
      } else { successS(); status.textContent='Şemsiyenin altında güvendeyiz ⚡❤️'; miniFX(rain, rain.clientWidth*umbX/100, rain.clientHeight*.36, 'spark'); }
      lightningActive=false;
    },580);
  }
  function failRain(){
    done=true; setMusic(.14,800);
    m.innerHTML=`<div class="retryBox"><h3>Biraz ıslandık galiba...</h3><p>Tekrar deneyelim bebeğim?</p><button class="btn" id="retryRain">Tekrar deneyelim bebeğim</button></div>`;
    m.querySelector('#retryRain').onclick=()=>{ clickS(); setupRainMemory(i,m,text); };
  }
  function tick(now){
    const dt=(now-last)/1000; last=now;
    if(done) return;
    nextMove-=dt; nextWind-=dt; nextLightning-=dt;
    if(nextMove<=0){ targetX=18+Math.random()*64; nextMove=1.3+Math.random()*1.1; }
    coupleX += (targetX-coupleX)*Math.min(1,dt*1.7); setCouple(coupleX);
    if(nextWind<=0){ windForce=(Math.random()>.5?1:-1)*(7+Math.random()*8); wind.textContent=windForce>0?'Rüzgar →':'← Rüzgar'; flutter(); nextWind=2.2+Math.random()*1.8; }
    if(Math.abs(windForce)>0.1){ setUmb(umbX+windForce*dt*.45); windForce*=Math.pow(.72,dt); }
    if(nextLightning<=0){ strike(); nextLightning=4+Math.random()*3; }
    const good=Math.abs(umbX-coupleX)<13;
    if(good && !lightningActive){ remaining=Math.max(0,remaining-dt); status.textContent='Tam üstümüzde, kuru kalıyoruz ❤️'; rain.classList.add('good'); }
    else if(!lightningActive){ remaining=Math.min(21,remaining+dt*.65); status.textContent='Şemsiye kaydı, süre geri dönüyor...'; rain.classList.remove('good'); }
    timer.textContent=remaining.toFixed(1);
    if(remaining<=0){ done=true; successS(); rain.classList.add('clearSky'); status.textContent='Yağmur dindi.'; setTimeout(()=>completeMini(i),1200); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setupTraceCake(i,m,text){
  text.textContent='Kesik çizgileri takip edip doğum günü pastasını tamamla.';
  m.innerHTML=`<div class="traceBox cakeTrace" id="traceBox"><svg viewBox="0 0 320 230" class="traceSvg">
    <path class="dash" d="M92 175 C118 196 202 196 228 175"/>
    <path class="dash" d="M78 160 C88 126 232 126 242 160 L226 203 L94 203 Z"/>
    <path class="dash" d="M92 137 C118 105 202 105 228 137"/>
    <path class="dash creamLine" d="M101 143 C118 162 138 124 157 144 S199 163 219 141"/>
    <path class="dash" d="M160 68 L160 115"/>
    <path class="dash" d="M150 66 C157 47 166 47 173 66"/>
    <path class="dash" d="M135 124 L135 151 M185 124 L185 151"/>
  </svg><canvas id="traceCanvas" width="320" height="230"></canvas><div class="pencil" id="pencil">🖍️</div></div><div class="miniProgress"><i id="traceBar"></i></div>`;
  traceInteraction(i,m,text,'🎂 Pasta tamamlandı.');
}
function setupTraceHug(i,m,text){
  text.textContent='Basılı tuttukça huzur dolsun.';
  m.innerHTML=`<div class="comfortGame" id="comfortGame"><div class="comfortScene"><div class="lap">♡</div><div class="head" id="comfortHead">😌</div><div class="comfortGlow" id="comfortGlow"></div></div><div class="comfortInfo"><b>HUZUR</b><span id="comfortPercent">0%</span></div><div class="miniProgress"><i id="comfortBar"></i></div><p class="comfortHint">%100 olana kadar basılı tut...</p></div>`;
  const box=m.querySelector('#comfortGame'), bar=m.querySelector('#comfortBar'), head=m.querySelector('#comfortHead'), pct=m.querySelector('#comfortPercent'), hint=m.querySelector('.comfortHint');
  let p=0, down=false, last=performance.now(), done=false;
  function tick(now){
    const dt=(now-last)/1000; last=now;
    if(!done){
      p = down ? Math.min(1,p+dt/4.5) : Math.max(0,p-dt/3.8);
      bar.style.width=(p*100)+'%';
      pct.textContent=Math.round(p*100)+'%';
      head.style.transform=`translateY(${(1-p)*18}px) scale(${1+p*.08})`;
      box.style.setProperty('--p',p);
      if(p>.35) hint.textContent='Biraz daha...';
      if(p>.7) hint.textContent='Huzura çok az kaldı...';
      if(p>=1){ done=true; successS(); if(navigator.vibrate) navigator.vibrate(40); text.textContent='Senin yanında... gerçekten huzurluydum.'; hint.textContent='Huzur.'; setTimeout(()=>completeMini(i),900); return; }
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
  box.onpointerdown=e=>{down=true; clickS(); miniFX(box, e.clientX-box.getBoundingClientRect().left, e.clientY-box.getBoundingClientRect().top); box.setPointerCapture?.(e.pointerId)};
  box.onpointerup=()=>down=false; box.onpointercancel=()=>down=false; box.onpointerleave=()=>down=false;
}
function traceInteraction(i,m,text,doneText){
  const box=m.querySelector('#traceBox'), canvas=m.querySelector('#traceCanvas'), ctx=canvas.getContext('2d'), bar=m.querySelector('#traceBar'), pencil=m.querySelector('#pencil');
  let drawing=false, progress=0, last=null, finished=false;
  ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=8; ctx.strokeStyle='#9d2e58';
  function pos(e){ const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*canvas.width/r.width, y:(e.clientY-r.top)*canvas.height/r.height, sx:e.clientX-r.left, sy:e.clientY-r.top}; }
  function add(e){ if(finished) return; const p=pos(e); pencil.style.left=p.sx+'px'; pencil.style.top=p.sy+'px'; if(last){ const dx=p.x-last.x, dy=p.y-last.y, dist=Math.hypot(dx,dy); if(dist>1){ ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); progress=Math.min(100,progress+dist/5.2); bar.style.width=progress+'%'; if(progress>99){ finished=true; text.textContent=doneText; successS(); setTimeout(()=>completeMini(i),650); } } } last=p; }
  box.onpointerdown=e=>{ drawing=true; clickS(); box.setPointerCapture?.(e.pointerId); last=null; add(e); };
  box.onpointermove=e=>{ if(drawing) add(e); };
  box.onpointerup=()=>{ drawing=false; last=null; };
  box.onpointercancel=()=>{ drawing=false; last=null; };
}
function setupSongMemory(i,m,text){
  text.textContent='Şarkıyla beraber kelimeleri tamamla.';
  startSong4();
  const blanks=[
    {line:'Hastalandım ama tedavisi ____', ans:'yok', choices:['var','yok','zor']},
    {line:'Nefesimi ____', ans:'kesiyo', choices:['kesiyo','duyuyo','büyütüyo']},
    {line:'Her bakışı tam kalbimi ____', ans:'vuruyo', choices:['sarıyo','vuruyo','arıyo']},
    {line:'Cümleleri beni kendine ____', ans:'büyülüyo', choices:['büyülüyo','çağırıyo','saklıyo']},
    {line:'Bunlar mutluluk ____', ans:'gözyaşlarım', choices:['gözyaşlarım','rüyalarım','şarkılarım']},
    {line:'Önümüzde uzun bir yol var ____', ans:'sevgilim', choices:['sevgilim','bebeğim','Gamzem']}
  ];
  let step=0;
  function renderBlank(){
    const b=blanks[step];
    const fill=Math.round((step/blanks.length)*100);
    m.innerHTML=`<div class="lyricsBook lyricBubble" style="--fill:${fill}%"><div class="songPrompt">🎵 Şarkıyla beraber kelimeleri tamamla</div><p class="lyricLine">${b.line.replace('____','<span class="blank">_____</span>')}</p><div class="wordChoices">${b.choices.map(c=>`<button class="choice wordChoice">${c}</button>`).join('')}</div><div class="songTime">Verse ${step+1}/${blanks.length}</div></div>`;
    m.querySelectorAll('.wordChoice').forEach(btn=>btn.onclick=(ev)=>{ clickS(); if(btn.textContent===b.ans){
      successS();
      const book=m.querySelector('.lyricsBook'); book.classList.add('correctPulse'); miniFX(book, ev.clientX-book.getBoundingClientRect().left, ev.clientY-book.getBoundingClientRect().top, 'butter');
      step++;
      setTimeout(()=>{ if(step>=blanks.length){ waitBridge(); } else { renderBlank(); } },360);
    } else { boop(); showToast('Sanki başka bir kelime arıyordum...'); } });
  }
  function waitBridge(){
    m.innerHTML=`<div class="lyricsBook lyricBubble" style="--fill:100%"><p class="lyricLine">Şimdi kelimeler kelebeğe dönüşecek...</p><div class="miniSpinner">🦋</div></div>`;
    const go=()=>bridgeGame();
    if(soundOn && song4 && song4.currentTime < 35.5){ setTimeout(go, Math.max(300,(35.5-song4.currentTime)*1000)); } else setTimeout(go,600);
  }
  function bridgeGame(){
    const words=['Ufuklara dek','Yarınlara dek','Sonsuza dek','Ölümüne dek','Bitmeyecek elbet','Yok nefret','Gülüşü bi şöhret','Sürecek sevgim ebediyen'];
    let wi=0, stored=0, revealStarted=false;
    m.innerHTML=`<div class="bridgeGame wideBridge"><div class="skyWords" id="skyWords"></div><div class="jar" id="jar"><span>0/${words.length}</span><div class="jarGlow"></div></div><p class="muted bridgeHint">Yukarı süzülen kelimelere dokun.</p></div>`;
    const sky=m.querySelector('#skyWords'), jar=m.querySelector('#jar');
    function spawn(){
      if(revealStarted) return;
      if(wi>=words.length){ if(stored>=words.length) waitChorus(); return; }
      const word=words[wi++];
      const w=document.createElement('button');
      w.className='riseWord'; w.textContent=word;
      w.style.left=(6+Math.random()*58)+'%';
      w.style.animationDuration=(4.8+Math.random()*1.2)+'s';
      sky.appendChild(w);
      w.onclick=(ev)=>{
        if(w.dataset.hit) return; w.dataset.hit='1'; flutter(); stored++; jar.querySelector('span').textContent=stored+'/'+words.length;
        miniFX(sky, ev.clientX-sky.getBoundingClientRect().left, ev.clientY-sky.getBoundingClientRect().top, 'butter');
        w.classList.add('toButterfly'); w.textContent='🦋';
        const b=document.createElement('i'); b.textContent='🦋'; b.style.left=(18+Math.random()*62)+'%'; b.style.bottom=(6+Math.random()*36)+'px'; jar.appendChild(b);
        jar.classList.add('jarHit'); setTimeout(()=>jar.classList.remove('jarHit'),260);
        if(stored>=words.length) setTimeout(waitChorus,700);
        setTimeout(()=>w.remove(),580);
      };
      setTimeout(()=>{ if(!w.dataset.hit && !revealStarted){ w.remove(); wi--; spawn(); } },6200);
      setTimeout(spawn,850);
    }
    spawn();
    function waitChorus(){
      if(revealStarted) return; revealStarted=true;
      jar.classList.add('charged');
      m.querySelector('.bridgeHint').textContent='Nakaratı bekle...';
      const reveal=()=>revealSongCover();
      if(soundOn && song4 && song4.currentTime < 47){ setTimeout(reveal, Math.max(300,(47-song4.currentTime)*1000)); } else setTimeout(reveal,900);
    }
  }
  function revealSongCover(){
    if(song4) fadeAudio(song4,.26,1200);
    heartbeat(.18);
    m.innerHTML=`<div class="songReveal dramaticReveal v15Reveal">
      <div class="centerJarBurst" id="centerJarBurst"><span class="bigJar">🫙</span><b class="jarHeart">❤️</b>${Array.from({length:30},()=>'<i>🦋</i>').join('')}</div>
      <img class="coverSlow" src="${photos[3].src}" alt="Ölümsüz Kelebekler">
      <h3>Bu şarkının sahibi sensin.</h3>
      <button class="btn secondary" id="skipSong">Atla</button>
      <p class="muted">İstersen şarkı bitene kadar burada kalabiliriz.</p>
    </div>`;
    const burst=m.querySelector('#centerJarBurst');
    let beats=0; const beatTimer=setInterval(()=>{ heartbeat(.16); burst.classList.add('beat'); setTimeout(()=>burst.classList.remove('beat'),180); if(++beats>=4){ clearInterval(beatTimer); burst.classList.add('explodeNow'); successS(); } },520);
    $('#skipSong').onclick=()=>{ clickS(); stopSong4Then(()=>completeMini(i)); };
    if(song4){ song4.onended=()=>{ stopSong4Then(()=>completeMini(i)); }; }
  }
  renderBlank();
}


function setupFrogMemory(i,m,text){
  setMusic(.18,1200);
  text.textContent='Kestaneyi çek, hedef halkasına denk getir. Kurbağalara değil, yanlarına...';
  m.innerHTML=`<div class="frogIntro" id="frogIntro">
    <div class="pondLogo">🐸🌰</div>
    <p>O gün sadece piknik yapmadık...</p>
    <p>Küçük kurbağalarla da arkadaş olmuştuk.</p>
    <button class="btn" id="startFrog">Kestaneleri Hazırla</button>
  </div>`;
  m.querySelector('#startFrog').onclick=()=>{ clickS(); renderFrogGame(); };
  function renderFrogGame(){
    let score=0, dragging=false, start={x:0,y:0}, cur={x:0,y:0}, chest=null, flight=false;
    const targets=[
      {x:.68,y:.40,r:34},{x:.34,y:.32,r:32},{x:.78,y:.57,r:28},{x:.48,y:.46,r:26},{x:.24,y:.56,r:25},{x:.62,y:.28,r:23},{x:.82,y:.34,r:22}
    ];
    m.innerHTML=`<div class="frogGame" id="frogGame">
      <div class="frogTop"><b>Kurbağalar</b><span id="frogScore">0 / 7</span></div>
      <div class="pond" id="pond">
        <div class="water"></div>
        <div class="frogTarget" id="frogTarget"><span>🐸</span><i></i></div>
        <div class="aimDots" id="aimDots"></div>
        <button class="chestnut" id="chestnut" aria-label="Kestane">🌰</button>
      </div>
      <p class="frogHint" id="frogHint">Kestaneyi geriye doğru çek ve bırak.</p>
    </div>`;
    const game=m.querySelector('#frogGame'), pond=m.querySelector('#pond'), target=m.querySelector('#frogTarget'), dots=m.querySelector('#aimDots'), scoreEl=m.querySelector('#frogScore'), hint=m.querySelector('#frogHint');
    function pondRect(){return pond.getBoundingClientRect();}
    function setTarget(){
      const t=targets[score]; const r=pondRect();
      target.style.left=(t.x*100)+'%'; target.style.top=(t.y*100)+'%'; target.style.setProperty('--r', t.r+'px');
      target.classList.remove('happy');
      resetChestnut();
    }
    function resetChestnut(){
      chest=m.querySelector('#chestnut'); if(!chest) return;
      chest.style.left='50%'; chest.style.top='78%'; chest.style.transform='translate(-50%,-50%)'; chest.style.transition='none'; chest.disabled=false; flight=false; dots.innerHTML='';
      chest.onpointerdown=(e)=>{ if(flight) return; dragging=true; chest.setPointerCapture?.(e.pointerId); const r=pondRect(); start={x:r.width*.5,y:r.height*.78}; cur={x:e.clientX-r.left,y:e.clientY-r.top}; chest.classList.add('dragging'); clickS(); updateDrag(e); };
      chest.onpointermove=(e)=>{ if(dragging) updateDrag(e); };
      chest.onpointerup=(e)=>{ if(dragging){ dragging=false; chest.classList.remove('dragging'); launch(); } };
      chest.onpointercancel=()=>{ dragging=false; resetChestnut(); };
    }
    function updateDrag(e){
      const r=pondRect(); cur={x:e.clientX-r.left,y:e.clientY-r.top};
      let dx=cur.x-start.x, dy=cur.y-start.y;
      const max=125, len=Math.hypot(dx,dy); if(len>max){ dx=dx/len*max; dy=dy/len*max; }
      chest.style.left=(start.x+dx)+'px'; chest.style.top=(start.y+dy)+'px'; chest.style.transform='translate(-50%,-50%) scale(1.08)';
      drawDots(-dx*3.05, -dy*3.05);
    }
    function drawDots(vx,vy){
      dots.innerHTML='';
      for(let k=1;k<=7;k++){
        const d=document.createElement('i'); const t=k/7;
        const x=start.x + vx*t; const y=start.y + vy*t + 90*t*t;
        d.style.left=x+'px'; d.style.top=y+'px'; dots.appendChild(d);
      }
    }
    function launch(){
      if(flight) return; flight=true; chest.disabled=true;
      let dx=(cur.x-start.x), dy=(cur.y-start.y); const max=125, len=Math.hypot(dx,dy)||1; if(len>max){ dx=dx/len*max; dy=dy/len*max; }
      const vx=-dx*3.05, vy=-dy*3.05;
      let st=performance.now(), dur=720; const r=pondRect(); const tdat=targets[score];
      function anim(now){
        const p=Math.min(1,(now-st)/dur); const ease=1-Math.pow(1-p,2);
        const x=start.x + vx*ease; const y=start.y + vy*ease + 90*ease*ease;
        chest.style.left=x+'px'; chest.style.top=y+'px'; chest.style.transform=`translate(-50%,-50%) rotate(${ease*480}deg)`;
        if(p<1) requestAnimationFrame(anim); else land(x,y,tdat);
      }
      requestAnimationFrame(anim);
    }
    function land(x,y,tdat){
      const r=pondRect(); const tx=tdat.x*r.width, ty=tdat.y*r.height; const dist=Math.hypot(x-tx,y-ty);
      ripple(x,y);
      if(dist<tdat.r){
        successS(); target.classList.add('happy'); miniFX(pond,x,y,'spark'); score++; scoreEl.textContent=score+' / 7'; hint.textContent= score>=7 ? 'Hepsi çok mutlu oldu.' : 'Harika! Bir kurbağa daha bekliyor.';
        if(score>=7){ setTimeout(()=>{ text.textContent='En güzel piknik, birlikte güldüğümüz piknikti.'; completeMini(i); },950); }
        else setTimeout(setTarget,900);
      } else {
        boop(); hint.textContent='Biraz daha yakınına...'; setTimeout(resetChestnut,650);
      }
    }
    function ripple(x,y){ const rip=document.createElement('b'); rip.className='ripple'; rip.style.left=x+'px'; rip.style.top=y+'px'; pond.appendChild(rip); setTimeout(()=>rip.remove(),700); }
    setTarget();
  }
}

function memoriesOverview(){
  setMusic(.20,1400);
  const memoryNotes = [
    'İlk çizgi...',
    'İlk huzur...',
    'İlk “Love Gamze”...',
    'İlk şarkı...',
    'İlk yağmur...',
    'İlk kare...',
    'İlk Ankara...',
    'İlk tamamlanan parça...',
    'İlk bekleyiş...',
    'İlk kurbağa kahkahası...'
  ];
  render(`<section class="screen memoriesOverview cinematicMemories"><div class="panel center memoryPanel">
    <p class="eyebrow">Bütün Anılar</p>
    <h2 class="subtitle">Birlikte bir sürü anı biriktirdik...</h2>
    <p class="muted memoryLead">Bazıları komikti. Bazıları heyecanlıydı. Bazıları sadece ikimize aitti.</p>
    <div class="memoryWall cinematicWall">${photos.map((p,i)=>`<div class="memoryMini cinematicMini" style="--d:${i*.18}s"><img src="${p.src}"><span>${i+1}</span><small>${memoryNotes[i]}</small></div>`).join('')}</div>
    <div class="memoryFinalText finalMemoryWords" id="memoryFinalWords">
      <p id="memoryChangingLine">İlk gülüş...</p>
      <h3>Meğer hepsi bugün için birikiyormuş. ❤️</h3>
    </div>
    <button class="btn" id="toCakeFinal">Pastaya Geç</button>
  </div></section>`);
  setTimeout(()=>{
    const lines=['İlk gülüş...','İlk heyecan...','İlk yolculuk...','İlk bekleyiş...','İlk “biz”...','Ve hepsinin ortak noktası... sendin.'];
    const lineEl=$('#memoryChangingLine');
    let k=0;
    const t=setInterval(()=>{ if(!lineEl){clearInterval(t);return;} lineEl.textContent=lines[k++%lines.length]; },900);
    $('#toCakeFinal').onclick=()=>{ clearInterval(t); clickS(); transition('Pastamız','Her mum bir anımız...',finalPrep); };
  },500);
}

function finalPrep(){
  setMusic(.22,1400);
  collected=10;
  cakeLit=false;
  render(`<section class="screen"><div class="panel center finalCakePanel"><p class="eyebrow">Pastamız tamamlandı</p><h2 class="subtitle">Birlikte nice anılar biriktirdik...</h2>${cakeHTML()}<p class="muted">Her mum bir anımız. Her anı biraz sen. Ama kutlama henüz başlamadı.</p><button class="btn" id="light">Mumları Yak</button></div></section>`);
  setTimeout(()=>{$('#light').onclick=()=>{clickS(); finalCandles();}},330);
}
function finalCandles(){
  setMusic(.30,1600);
  cakeLit=false;
  render(`<section class="screen"><div class="panel center finalCakePanel finalLitPanel"><p class="eyebrow">10 anı · 10 mum</p><h2 class="subtitle">Dileğini tut</h2>${cakeHTML()}<p class="muted" id="candleText">Mumlar tek tek yanıyor...</p><button class="btn hiddenWish" id="wish">🎂 Dileğini Tut</button></div></section>`);
  setTimeout(()=>{
    const flames=[...document.querySelectorAll('.finalLitPanel .flame')];
    flames.forEach((flame,idx)=>{
      setTimeout(()=>{ flame.classList.remove('off'); tone(720+idx*18,.08,'sine',.045); flame.closest('.candle')?.classList.add('justLit'); }, idx*220);
    });
    setTimeout(()=>{
      const ct=$('#candleText'); if(ct) ct.textContent='Mumlar yandı. Bir dilek tutma zamanı.';
      const wish=$('#wish'); if(wish){ wish.classList.remove('hiddenWish'); wish.classList.add('showWish'); wish.onclick=()=>{clickS(); setMusic(0,1800); finalText();}; }
    }, flames.length*220+500);
  },380);
}
let sadAudio=null, sadLoopTimer=null;

function startSadPiano(){
  try{
    clearInterval(sadLoopTimer);
    if(!soundOn) return;

    if(!sadAudio){
      sadAudio=new Audio('assets/music/sad_piano.mp3');
      sadAudio.preload='auto';
    }

    stopAllMusic(sadAudio);
    clearInterval(sadAudio._fadeTimer);

    sadAudio.pause();
    sadAudio.currentTime=0;
    sadAudio.volume=0;

    sadAudio.play()
      .then(()=>fadeAudio(sadAudio,.20,2400))
      .catch(()=>{});

    sadLoopTimer=setInterval(()=>{
      if(!sadAudio || sadAudio.paused || !soundOn) return;

      if(sadAudio.currentTime>=79){
        fadeAudio(sadAudio,0,700);

        setTimeout(()=>{
          if(!sadAudio || !soundOn) return;

          sadAudio.pause();
          sadAudio.currentTime=0;
          sadAudio.volume=0;

          sadAudio.play()
            .then(()=>fadeAudio(sadAudio,.20,1100))
            .catch(()=>{});
        },740);
      }
    },250);
  }catch(e){}
}

function stopSadPiano(immediate=false){
  clearInterval(sadLoopTimer);

  if(!sadAudio) return;

  if(immediate){
    hardStopAudio(sadAudio,true);
  }else{
    fadeAudio(sadAudio,0,900);
    setTimeout(()=>hardStopAudio(sadAudio,true),950);
  }
}
function finalText(){
  startSadPiano();
  cakeLit=true;
  const pages = [
    'Sana doğum gününde satırlar dolusu mesajlar yazıp hediyelere boğmak yerine beraber eğlenebileceğimiz bir oyun yapmak istedim.',
    'Eşsiz bebeğime...\n\nEşi benzeri olmayan; unutulamayacak bir oyun...',
    'Bizim hayatımız da bu oyunlar gibi bazen zorlayıcı, bazen eğlenceli, bazen düşündürücü ve bazen de duygusal olabiliyor.',
    'Bunların üstesinden yanımızda olmadığımız zamanlarda bile birbirimizin varlığını hissederek gelebiliyoruz.',
    'Seninle sıfırdan yeni anılar biriktirmek istiyorum.\n\nBu anılarımızın üstüne daha da koymak istiyorum.',
    'Biz neyiz değil...\n\nNe olacağızla ilgilenmek istiyorum.',
    'Seni ilk gördüğümde kalbime...\n\n“İşte bu.”\n\n...diye fısıldayan sendin.',
    'Göz hoşuna gideni sever,\n\nakıl kendisini anlayanı sever,\n\nama ruh kendine benzeyenden başkasını sevmez.',
    'Sen benim ruh eşimsin gadın.\n\nBu biz doğduğumuzda çoktan yazılmıştı.',
    'Ben burayı satırlarla daha da doldururum...\n\nAma hayatımızın satırları dolup taşsın istiyorum.',
    'Her bir yaşamda yine seni seçerdim.',
    'Çünkü hangi hayatta olursa olsun...\n\nBenim en güzel tesadüfüm hep sen olurdun.',
    'İyi ki doğdun Ruh Eşim. ❤️'
  ];

  render(`<section class="screen letterFinal stepLetterFinal">
    <div class="finalCandleGlow" id="finalCandleGlow">${cakeHTML()}</div>
    <div class="letterStepWrap">
      <div class="letterDate">07.07.2026</div>
      <div class="letterStepCounter" id="letterStepCounter">1 / ${pages.length}</div>
      <div class="letterStepText" id="letterStepText"></div>
      <button class="btn letterNextBtn" id="letterNextBtn">Sonraki</button>
      <div class="letterEndSign" id="letterEndSign">
        <span>— Kaan Mutlu</span>
        <em>(seninle daha da mutlu)</em>
        <b>ilysm (:</b>
        <p class="letterLastLine">Bu oyunun en güzel devamı, birlikte yaşayacağımız yeni anılar olacak.</p>
        <button class="btn" id="restartGame">Baştan Oyna</button>
      </div>
    </div>
  </section>`);

  // render() ekranı 260 ms gecikmeyle kurduğu için DOM elemanlarını burada, kurulduktan sonra bağlıyoruz.
  setTimeout(()=>{
    let page = 0;
    const textEl = $('#letterStepText');
    const btn = $('#letterNextBtn');
    const counter = $('#letterStepCounter');
    const glow = $('#finalCandleGlow');

    function showPage(){
      if(!textEl) return;
      const isLastPage = page === pages.length-1;
      if(glow) glow.classList.toggle('blowReady', isLastPage);
      textEl.classList.remove('show');
      setTimeout(()=>{
        textEl.innerHTML = pages[page].split('\n').map(line=> line.trim() ? `<p>${line}</p>` : '<br>').join('');
        if(counter) counter.textContent = `${page+1} / ${pages.length}`;
        if(btn) btn.textContent = isLastPage ? 'Mumları Üfle 🤍' : 'Sonraki';
        textEl.classList.add('show');
        heartbeat(.055);
      },180);
    }

    function finishLetter(){
      if(glow){
        glow.classList.add('candlesOut','blownFinal');
        miniFX(glow, glow.clientWidth/2, glow.clientHeight/2, 'spark');
      }
      tone(160,.18,'sine',.07);
      setTimeout(()=>tone(120,.24,'sine',.055),160);
      if(textEl) textEl.classList.remove('show');
      if(counter) counter.style.opacity='0';
      const date=$('.letterDate');
      if(date) date.style.opacity='0';
      if(btn) btn.classList.add('hideLetterBtn');
      setTimeout(()=>{
        const sign=$('#letterEndSign');
        if(sign) sign.classList.add('show');
      },1250);
    }

    if(btn){
      btn.onclick=()=>{
        clickS();
        if(page < pages.length-1){
          page++;
          showPage();
        } else {
          finishLetter();
        }
      };
    }

    const restart=$('#restartGame');
    if(restart) restart.onclick=()=>{
      stopAllMusic();
      stopSadPiano(true);

      collected=0;
      cakeLit=false;
      soundOn=true;
      soundBtn.textContent='🔊';

      intro();
    };

    showPage();
  },360);
}
intro();
