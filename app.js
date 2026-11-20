const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isAr=s=>/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(s||'');
let customImg=null,Q=[],cur=0,token=0,
S={lang:'en',voice:'g:f1',bg:'blue',design:'circles',auto:'off',font:'default',
   ui:(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),
   smooth:true,musicOn:false,musicId:'',musicVol:20,musicDuck:true,duckLvl:25,musicLen:'0',musicSecs:20,musicFrom:0,musicLoop:true,introOn:false,outroOn:false,introText:'',outroText:'',introAnim:'type',outroAnim:'fade',qAnimOn:false,qAnim:'slide',
   bar:'#2979ff',style:'smooth',delay:6,rate:1,wm:'',wmOp:.25,wmSize:2.4,wmPos:'br'};
const K=['a','b','c','d'];

/* ---------- Languages (26) ---------- */
const LANGS={
 en:{n:"English",c:"en-US",t:"en",opt:"Option",ans:"The correct answer is"},
 ur:{n:"اردو (Urdu)",c:"ur-PK",t:"ur",opt:"آپشن",ans:"صحیح جواب ہے"},
 hi:{n:"हिन्दी (Hindi)",c:"hi-IN",t:"hi",opt:"विकल्प",ans:"सही जवाब है"},
 ar:{n:"العربية (Arabic)",c:"ar-SA",t:"ar",opt:"الخيار",ans:"الإجابة الصحيحة هي"},
 bn:{n:"বাংলা (Bengali)",c:"bn-IN",t:"bn",opt:"বিকল্প",ans:"সঠিক উত্তর হলো"},
 ta:{n:"தமிழ் (Tamil)",c:"ta-IN",t:"ta",opt:"விருப்பம்",ans:"சரியான பதில்"},
 te:{n:"తెలుగు (Telugu)",c:"te-IN",t:"te",opt:"ఎంపిక",ans:"సరైన సమాధానం"},
 mr:{n:"मराठी (Marathi)",c:"mr-IN",t:"mr",opt:"पर्याय",ans:"बरोबर उत्तर आहे"},
 gu:{n:"ગુજરાતી (Gujarati)",c:"gu-IN",t:"gu",opt:"વિકલ્પ",ans:"સાચો જવાબ છે"},
 kn:{n:"ಕನ್ನಡ (Kannada)",c:"kn-IN",t:"kn",opt:"ಆಯ್ಕೆ",ans:"ಸರಿಯಾದ ಉತ್ತರ"},
 ml:{n:"മലയാളം (Malayalam)",c:"ml-IN",t:"ml",opt:"ഓപ്ഷൻ",ans:"ശരിയായ ഉത്തരം"},
 ne:{n:"नेपाली (Nepali)",c:"ne-NP",t:"ne",opt:"विकल्प",ans:"सही उत्तर हो"},
 es:{n:"Español (Spanish)",c:"es-ES",t:"es",opt:"Opción",ans:"La respuesta correcta es"},
 fr:{n:"Français (French)",c:"fr-FR",t:"fr",opt:"Option",ans:"La bonne réponse est"},
 de:{n:"Deutsch (German)",c:"de-DE",t:"de",opt:"Option",ans:"Die richtige Antwort ist"},
 it:{n:"Italiano (Italian)",c:"it-IT",t:"it",opt:"Opzione",ans:"La risposta corretta è"},
 pt:{n:"Português (Portuguese)",c:"pt-BR",t:"pt",opt:"Opção",ans:"A resposta correta é"},
 ru:{n:"Русский (Russian)",c:"ru-RU",t:"ru",opt:"Вариант",ans:"Правильный ответ —"},
 tr:{n:"Türkçe (Turkish)",c:"tr-TR",t:"tr",opt:"Seçenek",ans:"Doğru cevap"},
 ja:{n:"日本語 (Japanese)",c:"ja-JP",t:"ja",opt:"選択肢",ans:"正解は"},
 ko:{n:"한국어 (Korean)",c:"ko-KR",t:"ko",opt:"보기",ans:"정답은"},
 zh:{n:"中文 (Chinese)",c:"zh-CN",t:"zh-CN",opt:"选项",ans:"正确答案是"},
 id:{n:"Bahasa Indonesia",c:"id-ID",t:"id",opt:"Opsi",ans:"Jawaban yang benar adalah"},
 th:{n:"ไทย (Thai)",c:"th-TH",t:"th",opt:"ตัวเลือก",ans:"คำตอบที่ถูกต้องคือ"},
 vi:{n:"Tiếng Việt (Vietnamese)",c:"vi-VN",t:"vi",opt:"Lựa chọn",ans:"Đáp án đúng là"},
 nl:{n:"Nederlands (Dutch)",c:"nl-NL",t:"nl",opt:"Optie",ans:"Het juiste antwoord is"},
 pl:{n:"Polski (Polish)",c:"pl-PL",t:"pl",opt:"Opcja",ans:"Prawidłowa odpowiedź to"}
};

/* ---------- Voice characters (5 per language: 3 female + 2 male) ---------- */
const CHARS=[
 {id:'f1',g:'F',n:'Sara',d:'Natural',r:1.00},
 {id:'f2',g:'F',n:'Noor',d:'Soft & warm',r:1.08},
 {id:'f3',g:'F',n:'Maya',d:'Bright / young',r:1.16},
 {id:'m1',g:'M',n:'Ali',d:'Natural',r:0.90},
 {id:'m2',g:'M',n:'Hamza',d:'Deep & calm',r:0.82}
];
const charOf=v=>CHARS.find(c=>'g:'+c.id===v)||CHARS[0];

/* ---------- Fonts ---------- */
const FB='"Nirmala UI","Noto Naskh Arabic","Noto Sans Devanagari","Leelawadee UI","Microsoft YaHei","Yu Gothic","Malgun Gothic","Segoe UI",Arial,sans-serif';
const FONTS=[
 {k:'default',n:'Segoe UI (Default)',f:'"Segoe UI"'},
 {k:'poppins',n:'Poppins – Bold Modern',f:'"Poppins"'},
 {k:'montserrat',n:'Montserrat – Clean Bold',f:'"Montserrat"'},
 {k:'oswald',n:'Oswald – Strong Condensed',f:'"Oswald"'},
 {k:'playfair',n:'Playfair – Elegant Serif',f:'"Playfair Display"'},
 {k:'bebas',n:'Bebas Neue – Tall Headline',f:'"Bebas Neue"'},
 {k:'baloo',n:'Baloo 2 – Friendly Rounded',f:'"Baloo 2"'},
 {k:'naskh',n:'Naskh – Urdu/Arabic Clean',f:'"Noto Naskh Arabic"'},
 {k:'nastaliq',n:'Nastaliq – Urdu Calligraphy',f:'"Noto Nastaliq Urdu"'},
 {k:'amiri',n:'Amiri – Classic Urdu/Arabic',f:'"Amiri"'},
 {k:'devanagari',n:'Devanagari – Hindi Bold',f:'"Noto Sans Devanagari"'}
];
let FF='"Segoe UI",Arial,sans-serif';
const fontStack=k=>{const f=FONTS.find(x=>x.k===k)||FONTS[0];return f.f+','+FB};
const fontOpts=FONTS.map(f=>`<option value="${f.k}">${f.n}</option>`).join('');

/* ---------- Backgrounds ---------- */
const THEME={blue:['#0a3fb5','#ffc916','Blue'],red:['#b71c1c','#ffd54f','Red'],green:['#1b5e20','#ffee58','Green'],purple:['#4a148c','#ffca28','Purple'],
 teal:['#00695c','#ffd54f','Teal'],orange:['#d84315','#ffffff','Orange'],pink:['#ad1457','#ffe082','Pink'],navy:['#0d1b3e','#4fc3f7','Navy'],black:['#111827','#fbbf24','Black']};
const DESIGNS=[['circles','Circles'],['rings','Rings'],['dots','Dots'],['stripes','Stripes'],['grid','Grid'],['waves','Waves'],['bokeh','Bokeh'],['spot','Spotlight'],['plain','Plain']];
const COLORS=Object.keys(THEME),DKEYS=DESIGNS.map(d=>d[0]);
function shade(h,f){const n=parseInt(h.slice(1),16);return'#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*(1-f)).toString(16).padStart(2,'0')).join('')}
function effBg(idx){ // current question ke liye color + design (auto-change ke saath)
  let c=THEME[S.bg]?S.bg:'blue',d=DKEYS.includes(S.design)?S.design:'circles';
  if(S.auto!=='off')c=COLORS[(COLORS.indexOf(c)+idx)%COLORS.length];
  if(S.auto==='both')d=DKEYS[(DKEYS.indexOf(d)+idx)%DKEYS.length];
  return{c,d};
}

const sample=[{q:"What is the capital of the United States?",a:"New York",b:"Washington, D.C.",c:"Los Angeles",d:"Chicago",ans:"B",font:""}];
const save=()=>chrome.storage.local.set({Q:Q.map(({unsure,...r})=>r),S});
const blank=()=>({q:"",a:"",b:"",c:"",d:"",ans:"A",font:""});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmt=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};

/* ---------- Dark / Light ---------- */
function applyUI(){document.documentElement.dataset.theme=S.ui;$('themeBtn').textContent=S.ui==='dark'?'☀️':'🌙';$('themeBtn').title=S.ui==='dark'?'Switch to Light mode':'Switch to Dark mode'}
$('themeBtn').onclick=()=>{S.ui=S.ui==='dark'?'light':'dark';applyUI();save()};

/* ---------- Editor ---------- */
function render(){
  $('count').textContent=Q.length+" questions";fillJump();
  $('rows').innerHTML="";
  const fo='<option value="">Default</option>'+fontOpts;
  Q.forEach((r,i)=>{
    r.ans=/^[ABCD]$/.test((r.ans||'').toUpperCase())?r.ans.toUpperCase():'A';
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td>`+['q','a','b','c','d'].map(k=>`<td><input data-k="${k}" dir="auto"></td>`).join('')+
    `<td><select data-k="ans">${'ABCD'.split('').map(x=>`<option>${x}</option>`).join('')}</select></td><td><select data-k="font">${fo}</select></td><td><button class="danger sm" title="Delete row">✕</button></td>`;
    const mark=()=>{
      K.forEach(k=>tr.querySelector(`input[data-k=${k}]`).classList.toggle('ok',k.toUpperCase()===r.ans));
      tr.classList.toggle('unsure',!!r.unsure);
    };
    tr.querySelectorAll('[data-k]').forEach(el=>{el.value=r[el.dataset.k]==null?'':r[el.dataset.k];el.oninput=el.onchange=()=>{r[el.dataset.k]=el.value;if(el.dataset.k==='ans')r.unsure=false;mark();save()}});
    tr.querySelector('button').onclick=()=>{Q.splice(i,1);save();render()};
    mark();$('rows').appendChild(tr);
  });
}
$('add1').onclick=()=>{Q.push(blank());save();render()};
$('add20').onclick=()=>{for(let i=0;i<20;i++)Q.push(blank());save();render()};
$('clr').onclick=()=>{if(confirm('Sab questions delete karne hain?')){Q=[];save();render()}};
$('imp').onclick=()=>$('impBox').hidden=!$('impBox').hidden;

/* ---------- Smart table import (Excel / Sheets / Word / Markdown / CSV / TXT) ---------- */
const clean=s=>(s||'').replace(/^\s*\d+\s*[\.\)\-:]\s+/,'').trim();
const LETTER_WORDS={'ए':'A','अ':'A','क':'A','बी':'B','ब':'B','ख':'B','सी':'C','स':'C','ग':'C','डी':'D','द':'D','घ':'D','اے':'A','بی':'B','سی':'C','ڈی':'D','الف':'A','ب':'B','ج':'C','د':'D'};
const norm=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
function splitQuoted(text,delim){ // quotes + multi-line cells support (Excel/CSV)
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){if(ch=='"'){if(text[i+1]=='"'){cell+='"';i++}else q=false}else cell+=ch}
    else if(ch=='"'&&cell==='')q=true;
    else if(ch===delim){row.push(cell);cell=''}
    else if(ch=='\n'){row.push(cell);rows.push(row);row=[];cell=''}
    else cell+=ch;
  }
  row.push(cell);rows.push(row);return rows;
}
function splitLines(text,delim){
  return text.split('\n').map(l=>l.split(delim));
}
function pickAnswer(cell,opts){
  let s=String(cell||'').trim();if(!s)return null;
  let t=s.replace(/^(?:correct\s*answer|answer|ans|correct|option|opt|सही\s*उत्तर|सही\s*जवाब|जवाब|उत्तर|विकल्प|صحیح\s*جواب|جواب|آپشن)\s*[:\-=]?\s*/i,'').trim();
  let m=t.match(/^[\(\[]?\s*([A-Da-d])\s*[\)\]\.:\-]?(?:\s|$)/);
  if(m&&(t.length<=3||/^[\(\[]?[A-Da-d][\)\]\.:\-]\s/.test(t)||/^[A-Da-d]\s/.test(t)))return m[1].toUpperCase();
  if(/^[1-4]$/.test(t))return 'ABCD'[+t-1];
  if(LETTER_WORDS[t.replace(/[\s\.\)\(]/g,'')])return LETTER_WORDS[t.replace(/[\s\.\)\(]/g,'')];
  const nt=norm(t.replace(/^[\(\[]?[A-Da-d][\)\]\.:]\s*/,''));
  if(nt){
    let i=opts.findIndex(o=>norm(o)===nt);if(i>=0)return 'ABCD'[i];
    i=opts.findIndex(o=>norm(o)&&(norm(o).includes(nt)||nt.includes(norm(o))));if(i>=0)return 'ABCD'[i];
  }
  return null;
}
function stripOptPrefix(o){
  if(o.every((x,i)=>new RegExp('^[\\(\\[]?'+'ABCD'[i]+'\\s*[\\)\\]\\.:\\-]\\s*','i').test(x)))
    return o.map((x,i)=>x.replace(new RegExp('^[\\(\\[]?'+'ABCD'[i]+'\\s*[\\)\\]\\.:\\-]\\s*','i'),''));
  return o;
}
function rowsToQ(rows,info){
  const out=[];
  for(let cells of rows){
    cells=cells.map(c=>String(c).replace(/\s*\n\s*/g,' ').trim());
    while(cells.length&&cells[cells.length-1]==='')cells.pop();
    while(cells.length&&cells[0]===''&&cells.length>6)cells.shift();
    if(!cells.length||cells.every(c=>/^[\s:\-\|]*$/.test(c)))continue;           // empty / markdown separator
    if(cells.some(c=>/^(answer|ans|correct( answer)?|सही उत्तर|उत्तर|जवाब|صحیح جواب|جواب)$/i.test(c))&&
       cells.some(c=>/^(question|questions|प्रश्न|सवाल|سوال)$/i.test(c)))continue; // header row
    if(cells.length>=7&&/^\d+[\.\)]?$/.test(cells[0]))cells.shift();                // serial-number column
    if(cells.length<6)continue;
    const opts=stripOptPrefix(cells.slice(1,5));
    let ans=pickAnswer(cells[5],opts);
    if(!ans&&cells.length>=7)ans=pickAnswer(cells[6],opts);
    if(!ans){info.unsure++;}
    out.push({q:clean(cells[0]),a:opts[0],b:opts[1],c:opts[2],d:opts[3],ans:ans||'A',unsure:!ans});
  }
  return out;
}
function parseFlat(text){ // sab kuch ek hi line mein: Q | A | B | C | D | B | Q2 | ...
  const out=[],t=text.split('|').map(s=>s.trim()).filter((s,i,a)=>s!==''||(i>0&&i<a.length-1));
  for(let i=0;i+5<t.length;i+=6){
    const o=stripOptPrefix(t.slice(i+1,i+5)),a=pickAnswer(t[i+5],o);
    out.push({q:clean(t[i]),a:o[0],b:o[1],c:o[2],d:o[3],ans:a||'A',unsure:!a});
  }
  return out;
}
function parseQ(text,info){
  info=info||{unsure:0};
  text=String(text||'').replace(/^\ufeff/,'').replace(/\r\n?/g,'\n').replace(/```[a-z]*/gi,'').replace(/[\u200b-\u200f\u202a-\u202e]/g,'').trim();
  if(!text)return [];
  let rows;
  const first=text.split('\n').slice(0,5).join('\n');
  const cnt=ch=>(first.split(ch).length-1);
  if(cnt('\t')>=5)rows=splitQuoted(text,'\t');
  else if(cnt('|')>=5)rows=text.includes('\n')?splitLines(text,'|'):[];
  else if(cnt(';')>=5)rows=splitLines(text,';');
  else if(cnt(',')>=5)rows=splitQuoted(text,',');
  else rows=[];
  let out=rowsToQ(rows,info);
  if(!out.length&&text.includes('|')){info.unsure=0;out=parseFlat(text);out.forEach(r=>r.unsure&&info.unsure++)}
  return out.filter(r=>r.q||r.a||r.b||r.c||r.d);
}
function importText(text){
  const info={unsure:0},r=parseQ(text,info);
  if(!r.length)return false;
  while(Q.length&&!(Q[Q.length-1].q||Q[Q.length-1].a||Q[Q.length-1].b||Q[Q.length-1].c||Q[Q.length-1].d))Q.pop(); // khali rows hata do
  const start=Q.length;
  Q.push(...r);save();render();
  $('impTxt').value="";$('impBox').hidden=true;
  const first=$('rows').children[start];if(first)first.scrollIntoView({block:'start'});
  alert("✅ "+r.length+" سوالات ٹیبل میں شامل ہو گئے۔ کل سوالات: "+Q.length+
    (info.unsure?"\n\n⚠ "+info.unsure+" سوالات کا جواب پہچانا نہیں گیا (پیلے رنگ میں نشان زد ہیں) — صرف انہی کو چیک کر لیں۔":""));
  return true;
}
$('impOk').onclick=()=>{
  if(!importText($('impTxt').value))alert("کوئی سوال نہیں ملا۔ ٹیبل میں کم از کم 6 کالم ہونے چاہئیں:\nسوال | A | B | C | D | جواب");
};
// Textbox mein paste karte hi khud import
$('impTxt').addEventListener('paste',e=>{
  const t=(e.clipboardData||window.clipboardData).getData('text');
  if(t){e.preventDefault();$('impTxt').value=t;importText(t)||alert("کوئی سوال نہیں ملا۔ ٹیبل میں کم از کم 6 کالم ہونے چاہئیں:\nسوال | A | B | C | D | جواب")}
});
// Page par kahin bhi (ya kisi cell mein) poori table paste karo to import ho jaye
document.addEventListener('paste',e=>{
  if($('edit').hidden||e.target===$('impTxt'))return;
  const t=(e.clipboardData||window.clipboardData).getData('text');
  if(!t||!(/\t|\n/.test(t)||(t.match(/\|/g)||[]).length>=5))return;
  if(parseQ(t).length){e.preventDefault();importText(t)}
});
function download(name,text,type){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();
}
$('dlAll').onclick=()=>{
  if(!Q.length)return alert('Koi question nahi.');
  const f=$('dlFmt').value,row=r=>[r.q,r.a,r.b,r.c,r.d,r.ans];
  if(f==='txt')download('gk-quiz.txt',Q.map(r=>row(r).join(' | ')).join('\n'),'text/plain;charset=utf-8');
  if(f==='csv'){const e=s=>'"'+String(s).replace(/"/g,'""')+'"';
    download('gk-quiz.csv','\ufeff'+['Question,A,B,C,D,Answer',...Q.map(r=>row(r).map(e).join(','))].join('\n'),'text/csv;charset=utf-8')}
  if(f==='json')download('gk-quiz.json',JSON.stringify(Q,null,2),'application/json');
};

function fillJump(){
  $('jump').innerHTML=Q.map((r,i)=>`<option value="${i}">${i+1}. ${esc((r.q||'').slice(0,28))}</option>`).join('');
  $('jump').value=cur;
}
$('jump').onchange=()=>{stop();cur=+$('jump').value;show()};

/* ---------- Tabs ---------- */
$('tabEdit').onclick=()=>{stop();$('admin').hidden=true;$('tabAdmin').classList.remove('on');$('edit').hidden=false;$('play').hidden=true;$('tabEdit').classList.add('on');$('tabPlay').classList.remove('on');render()};
$('tabPlay').onclick=()=>{$('admin').hidden=true;$('tabAdmin').classList.remove('on');$('edit').hidden=true;$('play').hidden=false;$('tabPlay').classList.add('on');$('tabEdit').classList.remove('on');cur=Math.min(cur,Math.max(Q.length-1,0));show()};

/* ---------- Settings ---------- */
$('lang').innerHTML=Object.entries(LANGS).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('');
$('bg').innerHTML=COLORS.map(k=>`<option value="${k}">${THEME[k][2]}</option>`).join('');
$('bgDesign').innerHTML=DESIGNS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
$('font').innerHTML=fontOpts;
$('qfont').innerHTML='<option value="">Same as global font</option>'+fontOpts;
let voices=[];
function guessGender(n){
  if(/female|woman|zira|hazel|susan|aria|jenny|samantha|karen|uzma|swara|neerja|heera|kalpana|salma|emma|ava\b|libby|sonia|natasha|xiaoxiao|nanami|sun-hi|katja|denise|elsa|isabella|francisca|svetlana|dariya|emel|hoda|zariyah|amala|tanishaa|yaqui|fiona|moira|tessa|victoria|alice|amelie|paulina|monica|lekha|kyoko|mei-jia|ting-ting|yuna|google .*female/i.test(n))return'F';
  if(/\bmale\b|david|mark\b|guy\b|asad|madhur|prabhat|ravi\b|hemant|salman|conrad|killian|stefan|diego|keita|injoon|henri|ryan|alvaro|jorge|dmitry|ahmet|hamed|shakir|bashkar|valluvar|mohan|daniel|thomas|alex\b|fred|oliver|yunxi|otoya|maged|pablo|luca|jorge/i.test(n))return'M';
  return'';
}
function loadVoices(){
  voices=speechSynthesis.getVoices();
  const pre=LANGS[S.lang].c.slice(0,2).toLowerCase();
  const sys=voices.map((v,i)=>({v,i})).filter(o=>o.v.lang.toLowerCase().replace('_','-').startsWith(pre));
  let h=`<optgroup label="Voice characters – ${LANGS[S.lang].n} (works for video + live)">`+
    CHARS.map(c=>`<option value="g:${c.id}">${c.g==='F'?'👩':'👨'} ${c.n} — ${c.g==='F'?'Female':'Male'} · ${c.d}</option>`).join('')+'</optgroup>';
  if(sys.length)h+='<optgroup label="System voices (live preview only)">'+sys.map(o=>{const g=guessGender(o.v.name);return`<option value="s:${o.i}">${g==='F'?'👩 ':g==='M'?'👨 ':'🔈 '}${esc(o.v.name)}</option>`}).join('')+'</optgroup>';
  $('voice').innerHTML=h;
  $('voice').value=[...$('voice').options].some(o=>o.value===S.voice)?S.voice:'g:f1';
  S.voice=$('voice').value;
}
speechSynthesis.onvoiceschanged=()=>loadVoices();
function applySettings(){
  $('lang').value=S.lang;$('bg').value=S.bg;$('bgDesign').value=S.design;$('bgAuto').value=S.auto;$('font').value=S.font;
  $('bar').value=S.bar;$('barStyle').value=S.style;$('delay').value=S.delay;$('rate').value=S.rate;$('rateV').textContent=(+S.rate).toFixed(1)+'×';
  $('lbar').style.setProperty('--bar',S.bar);$('lbar').className='lbar '+S.style;
  $('wm').value=S.wm;$('wmOp').value=S.wmOp;$('wmSize').value=S.wmSize;$('wmPos').value=S.wmPos;$('wmOpV').textContent=Math.round(S.wmOp*100)+'%';
  const w=$('wmEl');w.textContent=S.wm;w.style.opacity=S.wmOp;w.style.fontSize=S.wmSize+'cqw';
  w.style.cssText+=';top:auto;bottom:auto;left:auto;right:auto;transform:none';
  const P={br:'bottom:2cqw;right:3cqw',bl:'bottom:2cqw;left:3cqw',tr:'top:2cqw;right:3cqw',tl:'top:2cqw;left:3cqw',c:'top:50%;left:50%;transform:translate(-50%,-50%)'};
  w.style.cssText+=';'+P[S.wmPos];
  ['smooth','introOn','outroOn','qAnimOn'].forEach(k=>$(k).checked=!!S[k]);
  ['introText','outroText','introAnim','outroAnim','qAnim'].forEach(k=>$(k).value=S[k]);
  ['musicOn','musicDuck','musicLoop'].forEach(k=>$(k).checked=!!S[k]);
  ['musicVol','duckLvl','musicLen','musicSecs','musicFrom'].forEach(k=>$(k).value=S[k]);
  $('musicVolN').value=S.musicVol;$('duckLvlN').value=S.duckLvl;$('musicSecs').hidden=S.musicLen!=='custom';
  applyLook(cur);applyUI();
}
[['musicOn','c'],['musicDuck','c'],['musicLoop','c'],['musicLen','v'],['musicSecs','v'],['musicFrom','v']].forEach(([id,t])=>{
  $(id).onchange=$(id).oninput=()=>{S[id]=t==='c'?$(id).checked:$(id).value;$('musicSecs').hidden=S.musicLen!=='custom';save();liveMusic.update()};
});
/* volume / auto-lower level: slider + (−) (＋) buttons + number box, sab ek doosre ke sath sync, aur chalti music par foran asar */
function bindVol(id,minus,plus,num){
  const el=$(id),n=$(num);
  const set=(v,fromNum)=>{v=clampN(Math.round(+v||1),1,100);el.value=v;if(!fromNum)n.value=v;S[id]=String(v);save();liveMusic.update()};
  el.oninput=el.onchange=()=>set(el.value);
  n.oninput=()=>{if(n.value!=='')set(n.value,true)};
  n.onchange=()=>set(n.value||el.value);
  $(minus).onclick=()=>set((+el.value||1)-5);
  $(plus).onclick=()=>set((+el.value||1)+5);
}
bindVol('musicVol','musicVolMinus','musicVolPlus','musicVolN');
bindVol('duckLvl','duckMinus','duckPlus','duckLvlN');
[['smooth','c'],['introOn','c'],['outroOn','c'],['qAnimOn','c'],['introText','v'],['outroText','v'],['introAnim','v'],['outroAnim','v'],['qAnim','v']].forEach(([id,t])=>{
  $(id).onchange=$(id).oninput=()=>{S[id]=t==='c'?$(id).checked:$(id).value;save();if(id==='qAnimOn'||id==='qAnim')show()};
});
function applyLook(idx){
  const e=effBg(idx),[bg,ac]=THEME[e.c],sl=$('slide');
  sl.style.setProperty('--sbg',bg);sl.style.setProperty('--sbg2',shade(bg,.38));sl.style.setProperty('--ac',ac);sl.dataset.design=e.d;
}
['lang','voice','bg','bgDesign','bgAuto','font','bar','barStyle','delay','rate','wm','wmOp','wmSize','wmPos'].forEach(id=>$(id).onchange=$(id).oninput=()=>{
  S.lang=$('lang').value;S.voice=$('voice').value||S.voice;S.bg=$('bg').value;S.design=$('bgDesign').value;S.auto=$('bgAuto').value;S.font=$('font').value;
  S.bar=$('bar').value;S.style=$('barStyle').value;S.delay=+$('delay').value;S.rate=+$('rate').value;S.wm=$('wm').value;S.wmOp=+$('wmOp').value;S.wmSize=+$('wmSize').value;S.wmPos=$('wmPos').value;
  applySettings();save();if(['font','bg','bgDesign','bgAuto'].includes(id))show();
});
$('lang').addEventListener('change',()=>{loadVoices();show()});
['bg','bgDesign','bgAuto'].forEach(id=>$(id).addEventListener('change',()=>{$('slide').style.backgroundImage='';$('slide').classList.remove('img');customImg=null;$('bgFile').value=''}));
$('bgFile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=()=>{$('slide').style.backgroundImage=`url(${r.result})`;$('slide').classList.add('img');customImg=new Image();customImg.src=r.result};r.readAsDataURL(f);
};
$('bgReset').onclick=()=>{$('slide').style.backgroundImage='';$('slide').classList.remove('img');$('bgFile').value='';customImg=null};
$('qfont').onchange=()=>{if(Q[cur]){Q[cur].font=$('qfont').value;save();show()}};
$('applyFontAll').onclick=()=>{if(!Q.length)return;if(confirm('Har question ka alag font hata kar sab par global font lagana hai?')){Q.forEach(r=>r.font='');save();show()}};

/* ---------- Sound / Voice ---------- */
let AC;
function tick(hi){
  AC=AC||new AudioContext();
  const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;
  o.type='square';o.frequency.value=hi?1500:1000;
  g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.07);
}
let curPlay=null,warned=false;
function playBuf(buf,rate){
  return new Promise(res=>{
    AC=AC||new AudioContext();AC.resume();
    const s=AC.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(AC.destination);
    const p={s,res};curPlay=p;s.onended=()=>{if(curPlay===p)curPlay=null;liveMusic.duck(false);res()};s.start();liveMusic.duck(true);
  });
}
function speakSys(text,idx){
  return new Promise(res=>{
    const u=new SpeechSynthesisUtterance(text),v=voices[idx];
    if(v){u.voice=v;u.lang=v.lang}else u.lang=LANGS[S.lang].c;
    u.rate=S.rate;u.onstart=()=>liveMusic.duck(true);u.onend=u.onerror=()=>{liveMusic.duck(false);res()};speechSynthesis.speak(u);
  });
}
async function prepSpeech(text){ // awaaz pehle taiyar, phir text + awaaz ek sath
  const val=$('voice').value||S.voice,t=token;
  if(!val.startsWith('s:')){
    try{
      const buf=await ttsBuffer(text),rate=charOf(val).r*S.rate;
      return{dur:buf.duration/rate,play:()=>t===token?playBuf(buf,rate):Promise.resolve()};
    }catch(e){
      if(!warned){warned=true;alert('آن لائن آواز نہیں مل سکی ('+e.message+')\nانٹرنیٹ چیک کریں۔ فی الحال سسٹم آواز استعمال ہو رہی ہے۔')}
    }
  }
  const idx=val.startsWith('s:')?+val.slice(2):-1;
  return{dur:Math.max(1.5,text.length*.07),play:()=>t===token?speakSys(text,idx):Promise.resolve()};
}
const warm=i=>{const r=Q[i];if(!r||($('voice').value||S.voice).startsWith('s:'))return;ttsBuffer(qText(r)).catch(()=>{});ttsBuffer(aText(r)).catch(()=>{})};
async function speak(text){
  const t=token,val=$('voice').value||S.voice;
  if(val.startsWith('s:'))return speakSys(text,+val.slice(2));
  try{
    const buf=await ttsBuffer(text);
    if(t!==token)return;
    await playBuf(buf,charOf(val).r*S.rate);
  }catch(e){
    if(t!==token)return;
    if(!warned){warned=true;alert('آن لائن آواز نہیں مل سکی ('+e.message+')\nانٹرنیٹ چیک کریں۔ فی الحال سسٹم آواز استعمال ہو رہی ہے۔')}
    await speakSys(text,-1);
  }
}
function stop(){
  token++;speechSynthesis.cancel();liveMusic.stop(.3);
  if(curPlay){const p=curPlay;curPlay=null;p.s.onended=null;try{p.s.stop()}catch(e){}p.res()}
}

/* ---------- Background Music ---------- */
const mdb={db:null,
  async open(){if(this.db)return this.db;this.db=await new Promise((res,rej)=>{const r=indexedDB.open('ksb-music',1);r.onupgradeneeded=()=>r.result.createObjectStore('tracks',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return this.db},
  async all(){try{const db=await this.open();return await new Promise(res=>{const q=db.transaction('tracks').objectStore('tracks').getAll();q.onsuccess=()=>res((q.result||[]).sort((a,b)=>a.name.localeCompare(b.name)));q.onerror=()=>res([])})}catch(e){return[]}},
  async get(id){const db=await this.open();return await new Promise(res=>{const q=db.transaction('tracks').objectStore('tracks').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})},
  async put(rec){const db=await this.open();await new Promise((res,rej)=>{const t=db.transaction('tracks','readwrite');t.objectStore('tracks').put(rec);t.oncomplete=res;t.onerror=t.onabort=()=>rej(t.error)})},
  async del(id){const db=await this.open();await new Promise(res=>{const t=db.transaction('tracks','readwrite');t.objectStore('tracks').delete(id);t.oncomplete=t.onerror=t.onabort=()=>res()})}
};
const mcache=new Map(),clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
function musicCfg(){
  const len=S.musicLen==='custom'?(+S.musicSecs||0):(+S.musicLen||0);
  return{vol:clampN(+S.musicVol||20,1,100)/100,duck:!!S.musicDuck,lvl:clampN(+S.duckLvl||25,1,100)/100,len:Math.max(0,len),from:Math.max(0,+S.musicFrom||0),loop:S.musicLoop!==false};
}
async function getMusic(){
  if(!S.musicId)return null;
  if(mcache.has(S.musicId))return mcache.get(S.musicId);
  const rec=await mdb.get(S.musicId);if(!rec)return null;
  AC=AC||new AudioContext();
  const buf=await AC.decodeAudioData(rec.data.slice(0)),m={buf,name:rec.name};
  mcache.clear();mcache.set(S.musicId,m);return m;
}
async function loadMusicList(){
  const all=await mdb.all(),sel=$('musicSel');
  sel.innerHTML=all.length?all.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}  (${fmt(r.dur)} · ${(r.size/1048576).toFixed(1)} MB)</option>`).join(''):'<option value="">— koi music add nahi —</option>';
  if(!all.some(r=>r.id===S.musicId))S.musicId=all[0]?all[0].id:'';
  sel.value=S.musicId;save();
}
$('musicAdd').onclick=()=>$('musicFile').click();
$('musicFile').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  if(f.size>40*1048576)return alert('File 40 MB se bari hai. Chhoti mp3 chuno.');
  const data=await f.arrayBuffer();let buf;
  try{AC=AC||new AudioContext();buf=await AC.decodeAudioData(data.slice(0))}catch(err){return alert('Ye audio file nahi khul saki. mp3 / m4a / wav file chuno.')}
  const def=f.name.replace(/\.[^.]+$/,''),name=((prompt('Music ka naam likho (list mein isi naam se dikhega):',def)||def).trim())||def;
  const rec={id:Date.now().toString(36),name,size:f.size,dur:buf.duration,data};
  try{await mdb.put(rec)}catch(err){return alert('Music save nahi ho saki (jagah kam ho sakti hai).')}
  S.musicId=rec.id;await loadMusicList();
};
$('musicSel').onchange=()=>{S.musicId=$('musicSel').value;save()};
$('musicDel').onclick=async()=>{
  if(!S.musicId)return;
  if(!confirm('Ye music list se delete karni hai?'))return;
  await mdb.del(S.musicId);mcache.delete(S.musicId);S.musicId='';await loadMusicList();
};
$('musicPrev').onclick=async()=>{
  if(liveMusic.src){liveMusic.stop(.4);return}
  if(!S.musicId)return alert('Pehle music add karke select karo.');
  try{if(!await liveMusic.start(true))alert('Music nahi mili.')}catch(e){alert('Music chal nahi saki: '+e.message)}
};
const liveMusic={src:null,g:null,cfg:null,timer:null,ducked:false,
  async start(force){
    if(!force&&!S.musicOn)return false;
    this.stop(.1);
    const m=await getMusic();if(!m)return false;
    AC=AC||new AudioContext();await AC.resume();
    const cfg=musicCfg(),g=AC.createGain(),s=AC.createBufferSource(),t=AC.currentTime;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(cfg.vol,t+1.5);
    s.buffer=m.buf;if(cfg.loop){s.loop=true;s.loopStart=0;s.loopEnd=m.buf.duration}
    s.connect(g);g.connect(AC.destination);s.start(0,cfg.from%m.buf.duration);
    this.src=s;this.g=g;this.cfg=cfg;this.ducked=false;
    const secs=force?90:cfg.len;if(secs>0)this.timer=setTimeout(()=>this.stop(2),secs*1000);
    s.onended=()=>{if(this.src===s){this.src=null}};
    return true;
  },
  update(){ // slider / checkbox badalte hi chalti music par foran lagao
    if(!this.g)return;
    const c=this.cfg=musicCfg(),t=AC.currentTime,v=this.g.gain.value;
    this.g.gain.cancelScheduledValues(t);this.g.gain.setValueAtTime(v,t);
    this.g.gain.linearRampToValueAtTime(c.vol*(this.ducked&&c.duck?c.lvl:1),t+.12);
  },
  duck(on){
    this.ducked=on;
    if(!this.g||!this.cfg.duck)return;
    const t=AC.currentTime,v=this.g.gain.value;
    this.g.gain.cancelScheduledValues(t);this.g.gain.setValueAtTime(v,t);
    this.g.gain.linearRampToValueAtTime(this.cfg.vol*(on?this.cfg.lvl:1),t+(on?.3:.8));
  },
  stop(fade){
    clearTimeout(this.timer);
    const s=this.src,g=this.g;this.src=null;this.g=null;
    if(!s)return;
    try{const t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+(fade||.2));s.stop(t+(fade||.2)+.05)}catch(e){}
  }
};
/* video mein music: voice ke waqt (duck) aur fade in/out ka gain-curve */
function voiceIv(segs,rate){
  const v=[];segs.forEach(s=>{if(s.kind)v.push([s.qs,s.qs+s.dur]);else{v.push([s.qs,s.qs+s.qb.duration/rate]);v.push([s.as,s.as+s.ab.duration/rate])}});
  v.sort((a,b)=>a[0]-b[0]);const m=[];
  v.forEach(x=>{const l=m[m.length-1];if(l&&x[0]-l[1]<.8)l[1]=Math.max(l[1],x[1]);else m.push([x[0],x[1]])});
  return m;
}
function musicEnv(segs,rate,cfg,D){
  const iv=cfg.duck?voiceIv(segs,rate):[],T=cfg.len>0?Math.min(cfg.len,D):D;
  const env=t=>{
    if(t<0||t>=T)return 0;
    let m=1;
    for(const[a,b]of iv){
      if(t<a-.3)break;
      if(t<=b+.8){m=Math.min(m,t<a?1-(1-cfg.lvl)*((t-(a-.3))/.3):t<=b?cfg.lvl:cfg.lvl+(1-cfg.lvl)*((t-b)/.8))}
    }
    return cfg.vol*m*Math.max(0,Math.min(1,t/1.5,(T-t)/2));
  };
  env.T=T;return env;
}
function mkCurve(env,t0,t1){const n=Math.max(2,Math.ceil((t1-t0)*100)+1),a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=env(t0+i*(t1-t0)/(n-1));return a}
async function prepMusicForExport(segs,D,rate){
  if(!S.musicOn)return null;
  const m=await getMusic();if(!m)throw new Error('Background music file nahi mili – music dobara add karo ya OFF karo');
  const cfg=musicCfg();return{buf:m.buf,cfg,env:musicEnv(segs,rate,cfg,D)};
}
function addMusicChunk(oc,mus,w0,w1){
  const{buf,cfg,env}=mus,pos=cfg.from+w0;
  if(w0>=env.T||(!cfg.loop&&pos>=buf.duration))return;
  const g=oc.createGain(),s=oc.createBufferSource();
  g.gain.setValueCurveAtTime(mkCurve(env,w0,w1),0,w1-w0);
  s.buffer=buf;if(cfg.loop){s.loop=true;s.loopStart=0;s.loopEnd=buf.duration}
  s.connect(g);g.connect(oc.destination);s.start(0,cfg.loop?pos%buf.duration:pos);
}

/* ---------- Slide ---------- */
const lb=()=>LANGS[S.lang];
function show(reveal,dur){
  const r=Q[cur];
  $('lbar').style.visibility='hidden';$('fill').style.width='0';applyLook(cur);
  if(!r){$('qtext').textContent="No questions. Add in Editor.";$('qtext').dir='ltr';$('opts').innerHTML="";$('qnum').textContent="";$('ans').textContent="";return}
  $('slide').style.setProperty('--ff',fontStack(r.font||S.font));$('qfont').value=r.font||'';
  const sl=$('slide');
  sl.removeAttribute('data-qa');sl.removeAttribute('data-pulse');
  if(S.qAnimOn){if(reveal)sl.dataset.pulse='1';else{void sl.offsetWidth;sl.dataset.qa=S.qAnim||'fade'}}
  $('qnum').textContent=`${cur+1} / ${Q.length}`;$('jump').value=cur;
  $('qtext').textContent=r.q;$('qtext').dir=isAr(r.q)?'rtl':'ltr';
  $('qtext').style.fontSize=r.q.length>150?'2.5cqw':r.q.length>100?'3.1cqw':'';
  const fr=optFracs(r),dl=i=>dur?Math.max(0,fr[i]*dur-.1):.5+i*.45;
  $('opts').innerHTML=K.map((k,i)=>`<div class="opt ${reveal&&r.ans===k.toUpperCase()?'right':''}" style="--d:${dl(i).toFixed(2)}s" dir="${isAr(r[k])?'rtl':'ltr'}">${k.toUpperCase()}.&nbsp; ${esc(r[k])}</div>`).join('');
  const at=`✔ ${lb().ans} ${r.ans}: ${r[r.ans.toLowerCase()]}`;
  $('ans').textContent=reveal?at:'';$('ans').dir=isAr(at)?'rtl':'ltr';
}
const qText=r=>`${r.q}. ${lb().opt} A, ${r.a}. ${lb().opt} B, ${r.b}. ${lb().opt} C, ${r.c}. ${lb().opt} D, ${r.d}.`;
const aText=r=>`${lb().ans} ${r.ans}, ${r[r.ans.toLowerCase()]}.`;
async function waitBar(sec,t){
  $('lbar').style.visibility='visible';$('fill').style.width='0';
  const st=performance.now();let last=-1;
  while(true){
    if(t!==token)return false;
    const e=(performance.now()-st)/1000;
    $('fill').style.width=Math.min(100,e/sec*100)+'%';
    const k=Math.floor(e*2);if(k!==last){last=k;tick(k%2===0)}
    if(e>=sec)break;
    await sleep(40);
  }
  return true;
}
async function playIO(kind){ // Intro / Outro live preview (video wali hi animation)
  const text=(S[kind+'Text']||'').trim();
  if(!S[kind+'On']||!text)return true;
  const t=token,val=$('voice').value||S.voice,sys=val.startsWith('s:');
  let buf=null;
  if(!sys){try{buf=await ttsBuffer(text)}catch(e){}}
  if(t!==token)return false;
  const rate=buf?charOf(val).r*S.rate:1,dur=buf?buf.duration/rate:Math.max(2,text.split(/\s+/).length*.4);
  const cv=$('ioCv'),c=cv.getContext('2d');cv.hidden=false;
  const sp=buf?playBuf(buf,rate):speakSys(text,sys?+val.slice(2):-1);
  let fin=false;sp.then(()=>fin=true);
  const st0=performance.now(),idx=kind==='intro'?0:Math.max(Q.length-1,0);
  while(t===token){
    const el=(performance.now()-st0)/1000;
    drawIO(c,{text,anim:S[kind+'Anim'],idx,dur},el);
    if(fin&&el>dur+.8)break;
    await sleep(33);
  }
  cv.hidden=true;return t===token;
}
$('prevIntro').onclick=async()=>{stop();if(!$('introText').value.trim())return alert('پہلے Intro کا متن لکھیں۔');const o=S.introOn;S.introOn=true;await playIO('intro');S.introOn=o};
$('prevOutro').onclick=async()=>{stop();if(!$('outroText').value.trim())return alert('پہلے Outro کا متن لکھیں۔');const o=S.outroOn;S.outroOn=true;await playIO('outro');S.outroOn=o};
async function runAuto(t){
  await liveMusic.start();if(t!==token)return false;
  const end=Math.min(Q.length,+$('to').value||Q.length);
  if(cur===0||cur===Math.max((+$('from').value||1)-1,0)){if(!await playIO('intro'))return false;show()}
  for(;cur<end;cur++){
    if(t!==token)return false;
    const r=Q[cur],pq=await prepSpeech(qText(r));if(t!==token)return false;
    warm(cur+1);const pa=prepSpeech(aText(r));            // agla sawal aur jawab ki awaaz pehle se taiyar hoti rahe
    show(false,pq.dur);await pq.play();if(t!==token)return false;
    if(!await waitBar(S.delay,t))return false;
    const pA=await pa;if(t!==token)return false;
    show(true);await pA.play();if(t!==token)return false;
    await sleep(1800);
  }
  cur=Math.max(end-1,0);if(!await playIO('outro'))return false;show(true);liveMusic.stop(2.5);return true;
}
$('readQ').onclick=async()=>{stop();const t=token;if(!Q[cur])return show();const p=await prepSpeech(qText(Q[cur]));if(t!==token)return;show(false,p.dur);await p.play()};
$('showA').onclick=async()=>{stop();const t=token;if(!Q[cur])return show(true);const p=await prepSpeech(aText(Q[cur]));if(t!==token)return;show(true);await p.play()};
$('next').onclick=()=>{stop();if(cur<Q.length-1)cur++;show()};
$('prev').onclick=()=>{stop();if(cur>0)cur--;show()};
$('stop').onclick=stop;
$('auto').onclick=()=>{stop();runAuto(token)};

/* ---------- Record video ---------- */
$('rec').onclick=async()=>{
  if(!Q.length)return alert('Pehle questions add karo.');
  const vt=($('vtitle').value||'').trim();if(!vt){$('vtitle').focus();return alert(VT_MSG)}
  let stream;
  try{stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:true,preferCurrentTab:true})}
  catch(e){return alert('Recording permission nahi mili.')}
  if(!stream.getAudioTracks().length&&!confirm('Audio share nahi hua (Share tab audio ON nahi tha). Bina awaaz ke record karein?')){stream.getTracks().forEach(t=>t.stop());return}
  const lim=await KSB.consume(vt,Math.max(1,Math.min(Q.length,+$('to').value||Q.length)-Math.max((+$('from').value||1)-1,0)));if(!lim.ok){stream.getTracks().forEach(t=>t.stop());return lim.msg&&alert(lim.msg)}
  const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6e6});
  const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const done=new Promise(r=>rec.onstop=r);
  stop();const t=token;cur=Math.max((+$('from').value||1)-1,0);
  stream.getVideoTracks()[0].onended=()=>{if(t===token)stop()};
  document.body.classList.add('clean');
  const esc=e=>{if(e.key==='Escape')stop()};document.addEventListener('keydown',esc);
  show();await sleep(1200);const t0=performance.now();rec.start();
  await runAuto(t);await sleep(1000);
  rec.state!=='inactive'&&rec.stop();await done;
  stream.getTracks().forEach(x=>x.stop());
  document.removeEventListener('keydown',esc);document.body.classList.remove('clean');
  const blob=await VidFix.fix(new Blob(chunks,{type:'video/webm'}),'video/webm',(performance.now()-t0)/1000);
  KSB.done(lim.logId,(performance.now()-t0)/1000);
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gk-quiz-video.webm';a.click();
};


/* ---------- One-click video WITH voice (speaker par awaaz nahi chalti) ---------- */
const CW=1280,CH=720,U=CW/100;
const cache=new Map();let cancelMk=false;
function chunks(text){
  const out=[];let cur='';
  for(let p of text.split(/(?<=[.!?,;:،۔]\s)\s*|(?<=[，。！？；：、])/)){
    if(!p.trim())continue;p=p.trim();
    if(cur&&(cur+' '+p).length>180){out.push(cur);cur=p}else cur=cur?cur+' '+p:p;
    while(cur.length>180){out.push(cur.slice(0,180));cur=cur.slice(180)}
  }
  if(cur)out.push(cur);return out;
}
/* ---- Google voice server: dheere dheere, ruk ruk ke, aur yaad rakh ke (cache) ---- */
const idb={db:null,
  async open(){if(this.db)return this.db;this.db=await new Promise((res,rej)=>{const r=indexedDB.open('ksb-tts',1);r.onupgradeneeded=()=>r.result.createObjectStore('mp3');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return this.db},
  async get(k){try{const db=await this.open();return await new Promise(res=>{const q=db.transaction('mp3').objectStore('mp3').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}},
  async put(k,v){try{const db=await this.open();await new Promise(res=>{const t=db.transaction('mp3','readwrite');t.objectStore('mp3').put(v,k);t.oncomplete=t.onerror=t.onabort=()=>res()})}catch(e){}}
};
const note=m=>{const el=$('progTxt');if(el&&!$('prog').hidden)el.textContent=m};
let lastReq=0,gap=350;
async function pace(){const now=Date.now(),at=Math.max(now,lastReq+gap);lastReq=at;if(at>now)await sleep(at-now)}
const WAITS=[2,5,10,20,30,45,60];   // seconds: server ne roka ho to itna intezar, phir dobara
async function fetchTTS(c){
  const L=LANGS[S.lang],key=S.lang+'|'+c;
  const saved=await idb.get(key);
  if(saved){try{return await AC.decodeAudioData(saved.slice(0))}catch(e){}}
  const q=encodeURIComponent(c),common=`ie=UTF-8&q=${q}&tl=${L.t}&total=1&idx=0&textlen=${c.length}&prev=input`;
  const urls=[`https://translate.google.com/translate_tts?${common}&client=tw-ob`,
              `https://translate.googleapis.com/translate_tts?${common}&client=gtx`,
              `https://translate.google.com/translate_tts?${common}&client=gtx`];
  let last='network';
  for(let k=0;k<=WAITS.length;k++){
    if(typeof cancelMk!=='undefined'&&cancelMk)throw new Error('cancel');
    await pace();
    let res=null;
    try{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);res=await fetch(urls[k%urls.length],{signal:ac.signal});clearTimeout(tm)}catch(e){}
    if(res&&res.ok){
      try{const ab=await res.arrayBuffer(),copy=ab.slice(0),buf=await AC.decodeAudioData(ab);idb.put(key,copy);gap=Math.max(350,Math.round(gap*.8));return buf}catch(e){last='decode'}
    }else last=res?res.status:'network';
    if(k===WAITS.length)break;
    gap=Math.min(gap*2,1500);                       // ab se aur dheere request bhejo
    for(let s=WAITS[k];s>0;s--){
      if(typeof cancelMk!=='undefined'&&cancelMk)throw new Error('cancel');
      note(`Google voice server ne thori der roka hai – ${s} sec baad khud dobara koshish hogi (${k+1}/${WAITS.length})...`);
      await sleep(1000);
    }
  }
  const err=new Error('Voice server '+last+' – '+L.n);err.tts=true;throw err;
}
const pend=new Map();
function ttsBuffer(text){
  const key=S.lang+'|'+text;if(cache.has(key))return Promise.resolve(cache.get(key));
  if(pend.has(key))return pend.get(key);
  const p=ttsCore(text,key);pend.set(key,p);p.then(()=>pend.delete(key),()=>pend.delete(key));return p;
}
async function ttsCore(text,key){
  AC=AC||new AudioContext();
  const bufs=[];
  for(const c of chunks(text))bufs.push(await fetchTTS(c));
  if(!bufs.length)throw new Error('empty text');
  const out=AC.createBuffer(1,bufs.reduce((s,b)=>s+b.length,0),bufs[0].sampleRate);
  let o=0;bufs.forEach(b=>{out.getChannelData(0).set(b.getChannelData(0),o);o+=b.length});
  cache.set(key,out);return out;
}
function tickAt(w,hi,dest,ctx){
  const A=ctx||AC,o=A.createOscillator(),g=A.createGain();o.type='square';o.frequency.value=hi?1500:1000;
  g.gain.setValueAtTime(.18,w);g.gain.exponentialRampToValueAtTime(.001,w+.06);
  o.connect(g);g.connect(dest);o.start(w);o.stop(w+.07);
}
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,Math.min(r,h/2,w/2))};
function wrapT(c,text,maxW){
  const lines=[];let cur='';
  const words=String(text).split(/\s+/);
  for(const w of words){const t=cur?cur+' '+w:w;if(cur&&c.measureText(t).width>maxW){lines.push(cur);cur=w}else cur=t}
  if(cur)lines.push(cur);return lines;
}
const fitCache=new Map(),qCache=new Map(),ioCache=new Map();
function fit(c,text,maxW,px,style){
  const key=FF+'|'+style+'|'+px+'|'+maxW+'|'+text;let v=fitCache.get(key);
  if(v===undefined){let p=px;do{c.font=`${style} ${p}px ${FF}`;p-=1}while(c.measureText(text).width>maxW&&p>10);v=p+1;if(fitCache.size>3000)fitCache.clear();fitCache.set(key,v)}
  c.font=`${style} ${v}px ${FF}`;
}
const put=(c,text,x,y)=>{c.direction=isAr(text)?'rtl':'ltr';c.fillText(text,x,y);c.direction='ltr'};
function drawBar(c,x,fy,w,p,t){
  const col=S.bar,st=S.style;
  let y=fy+U,h=2.5*U;if(st==='thin'){y=fy+2*U;h=.5*U}
  c.save();rr(c,x,y,w,h,st==='thin'?U:2*U);c.fillStyle='rgba(0,0,0,.27)';c.fill();
  let ix=x,iy=y,iw=w,ih=h,rad=2*U;
  if(st==='round'){ix+=.4*U;iy+=.4*U;iw-=.8*U;ih-=.8*U;rad=3*U}
  const fw=Math.max(0,iw*p);
  if(st==='glow'){c.shadowColor=col;c.shadowBlur=2*U;c.fillStyle=col;rr(c,ix,iy,fw,ih,2*U);c.fill();c.shadowBlur=0}
  else{
    c.save();rr(c,ix,iy,iw,ih,rad);c.clip();c.fillStyle=col;
    if(st==='seg'){for(let sx=0;sx<fw;sx+=2.8*U)c.fillRect(ix+sx,iy,Math.min(2.2*U,fw-sx),ih)}
    else if(st==='stripes'){
      c.beginPath();c.rect(ix,iy,fw,ih);c.clip();c.fillRect(ix,iy,fw,ih);c.fillStyle='rgba(0,0,0,.28)';
      const off=(t*5.7*U)%(3.4*U);
      for(let sx=-ih+off-3.4*U;sx<fw;sx+=3.4*U){c.beginPath();c.moveTo(ix+sx,iy+ih);c.lineTo(ix+sx+1.7*U,iy+ih);c.lineTo(ix+sx+1.7*U+ih,iy);c.lineTo(ix+sx+ih,iy);c.fill()}
    }
    else if(st==='gradient'){c.fillRect(ix,iy,fw,ih);const g=c.createLinearGradient(ix,0,ix+Math.max(fw,1),0);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(ix,iy,fw,ih)}
    else if(st==='dots'){for(let sx=U;sx<fw;sx+=2*U){c.beginPath();c.arc(ix+sx,iy+ih/2,Math.min(ih*.4,.85*U),0,7);c.fill()}}
    else{if(st==='neon')c.globalAlpha=.8;c.fillRect(ix,iy,fw,ih)}
    c.restore();
  }
  if(st!=='thin'){
    c.lineWidth=.25*U;c.strokeStyle=st==='neon'?col:'#fff';
    if(st==='neon'){c.shadowColor=col;c.shadowBlur=1.5*U}
    rr(c,x,y,w,h,2*U);c.stroke();
  }
  c.restore();
}

/* ----- background design layers (cached) ----- */
const decoCache=new Map();
function decoLayer(d,bg,ac){
  const key=d+bg+ac;if(decoCache.has(key))return decoCache.get(key);
  const cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const c=cv.getContext('2d');
  const g=c.createLinearGradient(0,0,CW,CH);g.addColorStop(0,bg);g.addColorStop(1,shade(bg,.38));c.fillStyle=g;c.fillRect(0,0,CW,CH);
  c.lineCap='round';
  if(d==='circles'){
    c.strokeStyle=ac;c.lineWidth=3*U;
    [[CW-2*U,4*U],[U,CH-3*U]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7.5*U,0,7);c.stroke()});
  }else if(d==='rings'){
    c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=.35*U;
    for(let i=1;i<=7;i++){c.beginPath();c.arc(CW,0,i*6*U,0,7);c.stroke();c.beginPath();c.arc(0,CH,i*6*U,0,7);c.stroke()}
    c.strokeStyle=ac;c.globalAlpha=.55;c.lineWidth=.5*U;c.beginPath();c.arc(CW,0,24*U,0,7);c.stroke();c.beginPath();c.arc(0,CH,24*U,0,7);c.stroke();
  }else if(d==='dots'){
    c.fillStyle='rgba(255,255,255,.17)';
    for(let y=1.2*U;y<CH;y+=2.4*U)for(let x=1.2*U;x<CW;x+=2.4*U){c.beginPath();c.arc(x,y,.2*U,0,7);c.fill()}
  }else if(d==='stripes'){
    c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1.3*U;
    for(let x=-CH;x<CW;x+=4*U){c.beginPath();c.moveTo(x,CH);c.lineTo(x+CH,0);c.stroke()}
  }else if(d==='grid'){
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;
    for(let x=0;x<=CW;x+=5*U){c.beginPath();c.moveTo(x,0);c.lineTo(x,CH);c.stroke()}
    for(let y=0;y<=CH;y+=5*U){c.beginPath();c.moveTo(0,y);c.lineTo(CW,y);c.stroke()}
  }else if(d==='waves'){
    [[.78,'rgba(255,255,255,.08)',0],[.86,ac,.22]].forEach(([yy,col,al],i)=>{
      c.globalAlpha=al||1;c.fillStyle=col;c.beginPath();c.moveTo(0,CH);c.lineTo(0,CH*yy);
      for(let k=0;k<4;k++){const x0=k*CW/4;c.quadraticCurveTo(x0+CW/8,CH*(yy-(i?.07:.1)),x0+CW/4,CH*yy)}
      c.lineTo(CW,CH);c.closePath();c.fill();
    });
  }else if(d==='bokeh'){
    let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<18;i++){c.globalAlpha=.06+rnd()*.1;c.fillStyle=i%3?'#fff':ac;c.beginPath();c.arc(rnd()*CW,rnd()*CH,(2+rnd()*8)*U,0,7);c.fill()}
  }else if(d==='spot'){
    const rg=c.createRadialGradient(CW/2,CH*.4,0,CW/2,CH*.4,CW*.65);rg.addColorStop(0,'rgba(255,255,255,.26)');rg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=rg;c.fillRect(0,0,CW,CH);
  }
  decoCache.set(key,cv);return cv;
}

/* ----- animation helpers ----- */
const cl=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-x,3);
const back=x=>{const a=1.70158,b=a+1;return 1+b*Math.pow(x-1,3)+a*Math.pow(x-1,2)};
const bnc=x=>{const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375};
function xf(c,cx,cy,style,p){ // element ko "aane" wali animation lagao (p: 0..1)
  c.translate(cx,cy);
  if(style==='fade'){c.globalAlpha*=cl(p*1.4)}
  else if(style==='slide'){c.translate((1-ease(p))*-CW*.28,0);c.globalAlpha*=cl(p*2)}
  else if(style==='zoom'){const s=.55+.45*back(p);c.scale(s,s);c.globalAlpha*=cl(p*2.5)}
  else if(style==='bounce'){c.translate(0,-(1-bnc(p))*CH*.35);c.globalAlpha*=cl(p*3)}
  c.translate(-cx,-cy);
}
function optFracs(r){ // har option awaaz mein kab aata hai (0..1)
  let s=r.q+'. ';const f=[];
  K.forEach(k=>{f.push(s.length);s+=`${lb().opt} ${k.toUpperCase()}, ${r[k]}. `});
  return f.map(x=>x/s.length);
}

function drawFrame(c,st,t){
  const r=st.r,e=effBg(st.idx),[bg,ac]=THEME[e.c],x0=7*U,W=CW-14*U,L=LANGS[S.lang];
  const A=S.qAnimOn?(S.qAnim||'fade'):null;
  FF=fontStack(r.font||S.font);
  c.clearRect(0,0,CW,CH);
  if(customImg&&customImg.complete&&customImg.naturalWidth){
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    const k=Math.max(CW/customImg.naturalWidth,CH/customImg.naturalHeight),w=customImg.naturalWidth*k,h=customImg.naturalHeight*k;
    c.drawImage(customImg,(CW-w)/2,(CH-h)/2,w,h);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,CW,CH);
  }else c.drawImage(decoLayer(e.d,bg,ac),0,0);
  c.textAlign='center';c.textBaseline='middle';
  const qk=FF+'|'+r.q;let ql=qCache.get(qk);
  if(!ql){let qp=3.8*U,ls;for(;qp>2.3*U;qp-=.2*U){c.font=`800 ${qp}px ${FF}`;ls=wrapT(c,r.q,W-6*U);if(ls.length<=3)break}ql={qpx:qp,lines:ls.slice(0,3)};if(qCache.size>2000)qCache.clear();qCache.set(qk,ql)}
  const qpx=ql.qpx,lines=ql.lines;
  const lh=qpx*1.3,qh=2.3*U+lines.length*lh+2.3*U;let oh=7.2*U,g1=5*U,total=qh+g1+2*oh+3*U+3.5*U+4.5*U;
  if(total>47.2*U){oh=6.4*U;g1=3.4*U;total=qh+g1+2*oh+3*U+3.5*U+4.5*U}
  let y=Math.max((CH-total)/2,6.4*U);   // upar corner wale number ke liye jagah
  c.save();
  if(A)xf(c,CW/2,y+qh/2,A,cl((st.ta||0)/.8));
  rr(c,x0,y,W,qh,2.4*U);c.fillStyle='rgba(255,255,255,.1)';c.fill();c.lineWidth=.25*U;c.strokeStyle=ac;c.stroke();
  c.fillStyle='#fff';c.font=`800 ${qpx}px ${FF}`;
  lines.forEach((l,i)=>put(c,l,CW/2,y+2.3*U+(i+.5)*lh));
  c.restore();
  { // question number: video ke left-upar corner mein
    const bt=`${st.idx+1} / ${Q.length}`;c.save();c.font=`800 ${2*U}px ${FF}`;c.textAlign='center';c.textBaseline='middle';
    const bw=c.measureText(bt).width+3.4*U,bh=3.8*U,bx=3*U,by=1.6*U;
    rr(c,bx,by,bw,bh,bh/2);c.fillStyle='rgba(0,0,0,.32)';c.fill();c.lineWidth=.25*U;c.strokeStyle=ac;c.stroke();
    c.fillStyle=ac;c.fillText(bt,bx+bw/2,by+bh/2+.1*U);c.restore();
  }
  y+=qh+g1;const ow=(W-2*U)/2;
  K.forEach((k,i)=>{
    const ox=x0+(i%2)*(ow+2*U),oy=y+(i>>1)*(oh+3*U),ok=st.reveal&&r.ans===k.toUpperCase();
    c.save();
    if(A){
      if(st.reveal){
        const ra=st.ra||0;
        if(ok){const sc=1+.045*Math.sin(ra*7)*Math.max(0,1-ra/2.8);c.translate(ox+ow/2,oy+oh/2);c.scale(sc,sc);c.translate(-ox-ow/2,-oy-oh/2)}
        else c.globalAlpha=.45;
      }else xf(c,ox+ow/2,oy+oh/2,A,cl(((st.ta||0)-(st.ot?st.ot[i]:0))/.5));
    }
    rr(c,ox,oy,ow,oh,4*U);if(ok){c.fillStyle='#2e7d32';c.fill();if(A){c.shadowColor='#7dff7d';c.shadowBlur=2*U;c.fill();c.shadowBlur=0}}
    c.lineWidth=.25*U;c.strokeStyle=ok?'#99ff99':'#fff';c.stroke();
    const tx=`${k.toUpperCase()}.  ${r[k]}`,rtl=isAr(r[k]);
    fit(c,tx,ow-5*U,2.7*U,'700');
    c.fillStyle='#fff';c.textAlign=rtl?'right':'left';
    put(c,tx,rtl?ox+ow-2.4*U:ox+2.4*U,oy+oh/2);c.textAlign='center';
    c.restore();
  });
  y+=2*oh+3*U+3.5*U;
  if(st.reveal){
    const tx=`✔ ${L.ans} ${r.ans}: ${r[r.ans.toLowerCase()]}`;fit(c,tx,W,2.8*U,'800');c.fillStyle=ac;
    c.save();if(A)xf(c,CW/2,y+2.6*U,'zoom',cl((st.ra||0)/.5));put(c,tx,CW/2,y+2.6*U);c.restore();
  }
  else if(st.prog!==null)drawBar(c,x0,y,W,st.prog,t);
  if(S.wm){
    c.save();c.globalAlpha=S.wmOp;c.fillStyle='#fff';c.shadowColor='#000';c.shadowBlur=.3*U;c.font=`800 ${S.wmSize*U}px ${FF}`;
    const P={br:['right',CW-3*U,CH-3.2*U],bl:['left',3*U,CH-3.2*U],tr:['right',CW-3*U,3.2*U],tl:['left',3*U,3.2*U],c:['center',CW/2,CH/2]}[S.wmPos];
    c.textAlign=P[0];put(c,S.wm,P[1],P[2]);c.restore();
  }
}

/* ----- Intro / Outro frame (el = awaaz shuru hone ke baad ke seconds) ----- */
function ioLayout(c,text,maxW,maxH){
  const ck=FF+'|'+text;if(ioCache.has(ck))return ioCache.get(ck);
  const paras=String(text).trim().split(/\n+/);let px=7*U,lines=[];
  for(;px>2*U;px-=U/4){
    c.font=`800 ${px}px ${FF}`;lines=[];paras.forEach(p=>lines.push(...wrapT(c,p,maxW)));
    if(lines.length*px*1.4<=maxH)break;
  }
  c.font=`800 ${px}px ${FF}`;
  const lh=px*1.4,y0=CH/2-(lines.length*lh)/2+lh/2,sp=c.measureText(' ').width,items=[];
  lines.forEach((ln,li)=>{
    const ws=ln.split(/\s+/),wd=ws.map(w=>c.measureText(w).width),tot=wd.reduce((a,b)=>a+b,0)+sp*(ws.length-1),rtl=isAr(ln);
    let x=rtl?CW/2+tot/2:CW/2-tot/2;
    ws.forEach((w,i)=>{
      const cx=rtl?x-wd[i]/2:x+wd[i]/2;
      items.push({w,cx,cy:y0+li*lh,wd:wd[i],li,rtl:isAr(w)||rtl});
      x+=rtl?-(wd[i]+sp):wd[i]+sp;
    });
  });
  const res={items,px,lines:lines.length};ioCache.set(ck,res);return res;
}
function drawIO(c,st,el){
  const e=effBg(st.idx),[bg,ac]=THEME[e.c],A=st.anim||'none',dur=Math.max(st.dur,.5);
  FF=fontStack(S.font);
  c.clearRect(0,0,CW,CH);
  if(customImg&&customImg.complete&&customImg.naturalWidth){
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    const k=Math.max(CW/customImg.naturalWidth,CH/customImg.naturalHeight),w=customImg.naturalWidth*k,h=customImg.naturalHeight*k;
    c.drawImage(customImg,(CW-w)/2,(CH-h)/2,w,h);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,CW,CH);
  }else c.drawImage(decoLayer(e.d,bg,ac),0,0);
  c.textAlign='center';c.textBaseline='middle';
  const lay=ioLayout(c,st.text,CW-16*U,CH*.7),it=lay.items,n=it.length,px=lay.px;
  const top=it[0].cy-px*.95,bot=it[n-1].cy+px*.95;
  c.save();c.globalAlpha=A==='none'?1:cl(el/.5+.2);c.fillStyle=ac;
  rr(c,CW/2-7*U,top-1.2*U,14*U,.6*U,.3*U);c.fill();rr(c,CW/2-7*U,bot+.6*U,14*U,.6*U,.3*U);c.fill();c.restore();
  c.font=`800 ${px}px ${FF}`;
  const prog=cl(el/(dur*.95));
  const totalChars=it.reduce((a,o)=>a+o.w.length,0);let seen=0;
  it.forEach((o,i)=>{
    const ti=(i/n)*dur*.92,lp=cl((el-ti)/.45);
    c.save();c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=.5*U;
    let txt=o.w;
    if(A==='none'){}
    else if(A==='type'){
      if(o.rtl){if(el<ti){c.restore();return}}
      else{const vis=Math.floor(prog*totalChars)-seen;seen+=o.w.length;if(vis<=0){c.restore();return}txt=o.w.slice(0,vis)}
    }
    else if(A==='fade'){
      const ls=(o.li/lay.lines)*dur*.9,p=ease(cl((el-ls)/.7));
      c.globalAlpha=p;c.translate(0,(1-p)*3*U);
    }
    else if(A==='zoom'){
      if(lp<=0){c.restore();return}
      const s=back(lp);c.globalAlpha=cl(lp*3);c.translate(o.cx,o.cy);c.scale(s,s);c.translate(-o.cx,-o.cy);
    }
    else if(A==='highlight'){
      const cur=el>=ti&&el<ti+dur/n,past=el>=ti+dur/n;
      c.globalAlpha=past||cur?1:.3;
      if(cur){c.fillStyle=ac;c.translate(o.cx,o.cy);c.scale(1.12,1.12);c.translate(-o.cx,-o.cy);c.shadowColor=ac;c.shadowBlur=1.6*U}
    }
    else if(A==='glow'){
      if(lp<=0){c.restore();return}
      c.globalAlpha=cl(lp*3);c.translate(0,-Math.sin(lp*Math.PI)*1.8*U*(1-lp*.5));
      c.shadowColor=ac;c.shadowBlur=lp<1?2.6*U:.9*U;
    }
    if(A==='type'&&!o.rtl){c.textAlign='left';put(c,txt,o.cx-o.wd/2,o.cy)}
    else put(c,txt,o.cx,o.cy);
    c.restore();
  });
}
async function loadFonts(list){ // canvas ko fonts pehle se load chahiye
  const keys=new Set(list.map(r=>r.font||S.font));
  for(const k of keys){
    const txt=list.filter(r=>(r.font||S.font)===k).map(r=>[r.q,r.a,r.b,r.c,r.d].join(' ')).join(' ').slice(0,2500)+' ABCD 0123456789 '+S.wm;
    for(const w of ['600','700','800'])try{await Promise.race([document.fonts.load(`${w} 24px ${fontStack(k)}`,txt),sleep(6000)])}catch(e){}
  }
}
/* ---------- Smooth export: WebCodecs (tez, bina atke, awaaz aur video bilkul sync) ---------- */
const FPS=25;
const yieldUI=()=>new Promise(r=>{const ch=new MessageChannel();ch.port1.onmessage=()=>r();ch.port2.postMessage(0)});
async function pickCodecs(ch){
  if(typeof VideoEncoder==='undefined'||typeof AudioEncoder==='undefined'||typeof VideoFrame==='undefined'||typeof AudioData==='undefined'||typeof OfflineAudioContext==='undefined'||typeof Mp4Muxer==='undefined'||typeof WebMMuxer==='undefined')return null;
  const vb={width:CW,height:CH,bitrate:3e6,framerate:FPS,latencyMode:'realtime'};
  const tryV=async l=>{for(const c of l){try{const r=await VideoEncoder.isConfigSupported({...vb,...c});if(r.supported)return r.config}catch(e){}}return null};
  const tryA=async l=>{for(const c of l){try{const r=await AudioEncoder.isConfigSupported(c);if(r.supported)return r.config}catch(e){}}return null};
  const avc=await tryV([{codec:'avc1.64001f',avc:{format:'avc'}},{codec:'avc1.4d001f',avc:{format:'avc'}},{codec:'avc1.42001f',avc:{format:'avc'}}]);
  const aac=avc&&await tryA([{codec:'mp4a.40.2',sampleRate:48000,numberOfChannels:ch,bitrate:ch>1?128000:96000}]);
  if(avc&&aac)return{kind:'mp4',v:avc,a:aac};
  const vp=await tryV([{codec:'vp09.00.31.08'},{codec:'vp8'}]);
  const op=await tryA([{codec:'opus',sampleRate:48000,numberOfChannels:ch,bitrate:ch>1?96000:64000}]);
  if(vp&&op)return{kind:'webm',v:vp,a:op};
  return null;
}
function segAt(segs,t){const i=segs.findIndex(x=>t<x.end);return{i:i<0?segs.length-1:i,s:segs[i<0?segs.length-1:i]}}
function isDyn(segs,t){ // kya is waqt screen par kuch hil raha hai? (nahi to frame dobara encode karne ki zaroorat nahi)
  const s=segAt(segs,t).s;
  if(s.kind){const el=t-s.qs;return(s.anim!=='none'&&el>-.3&&el<s.dur+.6)||t-s.start<.6}
  const ta=t-s.start;
  if(t>=s.bs&&t<s.be+.06)return true;
  if(S.qAnimOn){
    if(ta<1)return true;
    if(s.ot.some(o=>ta>o-.06&&ta<o+.6))return true;
    if(t>=s.be&&t<s.be+3)return true;
  }
  return false;
}
const sigAt=(segs,t)=>{const{i,s}=segAt(segs,t);return i+'|'+(s.kind?'':(t>=s.be?1:0)+''+(t>=s.bs&&t<s.be?1:0))};
function frameAt(c,segs,t,d){
  const s=segs.find(x=>t<x.end)||segs[segs.length-1];
  if(s.kind)drawIO(c,{text:s.text,anim:s.anim,idx:s.idx,dur:s.dur},t-s.qs);
  else drawFrame(c,{r:s.r,idx:s.idx,reveal:t>=s.be,prog:t>=s.bs&&t<s.be?(t-s.bs)/d:null,ta:Math.max(0,t-s.start),ot:s.ot,ra:t-s.be},Math.max(t,0));
}
async function renderAudio(segs,w0,w1,d,rate,aenc,mus,ch){ // [w0,w1) seconds ki awaaz + tick, offline mix
  const SR=48000,oc=new OfflineAudioContext(ch,Math.ceil((w1-w0)*SR),SR);
  const put=(buf,at)=>{
    if(at>=w1||at+buf.duration/rate<=w0)return;
    const s=oc.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(oc.destination);
    at>=w0?s.start(at-w0):s.start(0,(w0-at)*rate);
  };
  segs.forEach(s=>{
    if(s.kind)return put(s.buf,s.qs);
    put(s.qb,s.qs);put(s.ab,s.as);
    for(let k=0;k<d*2;k++){const tk=s.bs+k/2;if(tk>=w0&&tk<w1)tickAt(tk-w0,k%2===0,oc.destination,oc)}
  });
  if(mus)addMusicChunk(oc,mus,w0,w1);
  const out=await oc.startRendering(),d0=out.getChannelData(0),d1=ch>1?out.getChannelData(1):null;
  for(let o=0;o<d0.length;o+=SR){
    const e=Math.min(o+SR,d0.length),n=e-o,part=new Float32Array(n*ch);
    part.set(d0.subarray(o,e),0);if(d1)part.set(d1.subarray(o,e),n);
    const ad=new AudioData({format:'f32-planar',sampleRate:SR,numberOfFrames:n,numberOfChannels:ch,timestamp:Math.round((w0+o/SR)*1e6),data:part});
    aenc.encode(ad);ad.close();
  }
}
async function exportSmooth(segs,D,d,rate,prog,cv,mus){
  const ch=mus?2:1,cd=await pickCodecs(ch);if(!cd)throw new Error('is browser mein WebCodecs nahi');
  const c=cv.getContext('2d'),mp4=cd.kind==='mp4';
  let err=null;
  const target=mp4?new Mp4Muxer.ArrayBufferTarget():new WebMMuxer.ArrayBufferTarget();
  const muxer=mp4
    ?new Mp4Muxer.Muxer({target,video:{codec:'avc',width:CW,height:CH,frameRate:FPS},audio:{codec:'aac',numberOfChannels:ch,sampleRate:48000},fastStart:'in-memory'})
    :new WebMMuxer.Muxer({target,video:{codec:/^vp8/.test(cd.v.codec)?'V_VP8':'V_VP9',width:CW,height:CH,frameRate:FPS},audio:{codec:'A_OPUS',numberOfChannels:ch,sampleRate:48000}});
  const venc=new VideoEncoder({output:(ch,m)=>muxer.addVideoChunk(ch,m),error:e=>{err=e}});
  const aenc=new AudioEncoder({output:(ch,m)=>muxer.addAudioChunk(ch,m),error:e=>{err=e}});
  venc.configure(cd.v);aenc.configure(cd.a);
  const total=D+.3,N=Math.ceil(total*FPS)+1,WIN=10,t0=performance.now();
  let frame=0,lastSub=-1e9,lastKey=-1e9,prevDyn=true,prevSig='';
  for(let w0=0;w0<N/FPS;w0+=WIN){
    if(cancelMk)throw new Error('cancel');
    const w1=Math.min(w0+WIN,total+.1);
    if(w1>w0)await renderAudio(segs,w0,w1,d,rate,aenc,mus,ch);
    const endIdx=Math.min(N,Math.ceil((w0+WIN)*FPS));
    for(;frame<endIdx;frame++){
      const tf=frame/FPS,dy=isDyn(segs,tf),sg=sigAt(segs,tf);
      if(dy||prevDyn||sg!==prevSig||frame-lastSub>=FPS||frame===N-1){   // sirf tab frame encode jab screen badli ho
        frameAt(c,segs,tf,d);
        const vf=new VideoFrame(cv,{timestamp:Math.round(frame*1e6/FPS),duration:Math.round(1e6/FPS)});
        const key=frame-lastKey>=FPS*2;if(key)lastKey=frame;
        venc.encode(vf,{keyFrame:key});vf.close();lastSub=frame;
        while(venc.encodeQueueSize>6){
          if(err)throw err;
          await Promise.race([new Promise(r=>venc.addEventListener('dequeue',r,{once:true})),sleep(1500)]);
        }
      }
      prevDyn=dy;prevSig=sg;
      if(frame%12===0){
        const t=frame/FPS,el=(performance.now()-t0)/1000;
        prog(`Video ban rahi hai: ${fmt(t)} / ${fmt(D)}  (${(t/Math.max(el,.1)).toFixed(1)}× tez)`,Math.min(1,t/D));
        await yieldUI();
        if(cancelMk)throw new Error('cancel');
        if(err)throw err;
      }
    }
  }
  prog('Video finalize ho rahi hai...',1);
  await venc.flush();await aenc.flush();
  if(err)throw err;
  venc.close();aenc.close();muxer.finalize();
  const buf=target.buffer;if(!buf||buf.byteLength<1000)throw new Error('khali file bani');
  return{blob:new Blob([buf],{type:mp4?'video/mp4':'video/webm'}),ext:mp4?'mp4':'webm',secs:D};
}

$('cancel').onclick=()=>{cancelMk=true};
const VT_MSG='Pehle "Video Title" likho (zaroori hai).\nپہلے ویڈیو کا ٹائٹل لکھیں، یہ ضروری ہے۔';
$('mk').onclick=async()=>{
  if(!Q.length)return alert('Pehle questions add karo.');
  const vt=($('vtitle').value||'').trim();if(!vt){$('vtitle').focus();return alert(VT_MSG)}
  stop();cancelMk=false;
  AC=AC||new AudioContext();await AC.resume();
  const from=Math.max((+$('from').value||1)-1,0),end=Math.min(Q.length,+$('to').value||Q.length),list=Q.slice(from,end);
  if(!list.length)return alert('Q# range sahi nahi hai.');
  if(S.musicOn&&!S.musicId)return alert('Background music ON hai magar koi music select nahi. Music add karo ya usay OFF karo.');
  const gate=await KSB.consume(vt,list.length);if(!gate.ok)return gate.msg&&alert(gate.msg);
  $('mk').disabled=true;$('cancel').hidden=false;$('prog').hidden=false;$('result').hidden=true;
  const prog=(txt,f)=>{$('progTxt').textContent=txt;$('pfill').style.width=(f*100)+'%'};
  const vc=charOf(S.voice.startsWith('g:')?S.voice:'g:f1'),rate=vc.r*S.rate;
  try{
    const useIn=S.introOn&&(S.introText||'').trim(),useOut=S.outroOn&&(S.outroText||'').trim();
    prog('Fonts load ho rahe hain...',0);
    await loadFonts([...list,...(useIn?[{q:S.introText}]:[]),...(useOut?[{q:S.outroText}]:[])]);
    const segs=[],d=S.delay,total=list.length+(useIn?1:0)+(useOut?1:0);let tt=.5,done=0;
    const addIO=async(kind,idx)=>{
      if(cancelMk)throw new Error('cancel');
      prog(`Awaaz ban rahi hai (${vc.n}): ${kind==='intro'?'Intro':'Outro'}`,done++/total);
      const text=S[kind+'Text'].trim(),buf=await ttsBuffer(text);
      const s={kind,text,anim:S[kind+'Anim'],idx,buf,start:tt};
      s.qs=tt+.4;s.dur=buf.duration/rate;s.end=s.qs+s.dur+1.4;tt=s.end;segs.push(s);
    };
    if(useIn)await addIO('intro',from);
    for(let i=0;i<list.length;i++){
      if(cancelMk)throw new Error('cancel');
      prog(`Awaaz ban rahi hai (${vc.n}): question ${i+1} / ${list.length}`,done++/total);
      const r=list[i],qb=await ttsBuffer(qText(r)),ab=await ttsBuffer(aText(r));
      const s={r,idx:from+i,qb,ab,start:tt};
      s.qs=tt+.3;s.bs=s.qs+qb.duration/rate+.4;s.be=s.bs+d;s.as=s.be+.2;s.end=s.as+ab.duration/rate+1.8;
      s.ot=optFracs(r).map(f=>s.qs-s.start+f*qb.duration/rate-.1);   // options awaaz ke sath aate hain
      tt=s.end;segs.push(s);
    }
    if(useOut)await addIO('outro',from+list.length-1);
    const D=tt;prog('Video ki length: '+fmt(D),0);
    if(S.musicOn)prog('Background music load ho rahi hai...',0);
    const mus=await prepMusicForExport(segs,D,rate);
    let result=null;
    if($('smooth').checked){
      try{
        $('cv').hidden=false;prog('Smooth engine shuru ho raha hai...',0);
        result=await exportSmooth(segs,D,d,rate,prog,$('cv'),mus);
      }catch(e){
        if(e.message==='cancel')throw e;
        console.warn('smooth export failed',e);result=null;
        prog('Smooth engine nahi chala ('+e.message+') – purane tareeqe se bana raha hoon...',0);await sleep(1200);
      }
    }
    if(!result){
    const dest=AC.createMediaStreamDestination(),base=AC.currentTime+.6;
    segs.forEach(s=>{
      (s.kind?[[s.buf,s.qs]]:[[s.qb,s.qs],[s.ab,s.as]]).forEach(([b,at])=>{const src=AC.createBufferSource();src.buffer=b;src.playbackRate.value=rate;src.connect(dest);src.start(base+at)});
      if(!s.kind)for(let k=0;k<d*2;k++)tickAt(base+s.bs+k/2,k%2===0,dest);
    });
    if(mus){
      const g=AC.createGain(),ms=AC.createBufferSource(),len=D+.3;
      g.gain.setValueCurveAtTime(mkCurve(mus.env,0,len),base,len);
      ms.buffer=mus.buf;if(mus.cfg.loop){ms.loop=true;ms.loopStart=0;ms.loopEnd=mus.buf.duration}
      ms.connect(g);g.connect(dest);ms.start(base,mus.cfg.loop?mus.cfg.from%mus.buf.duration:mus.cfg.from);
    }
    const cv=$('cv');cv.hidden=false;const c=cv.getContext('2d');
    const stream=new MediaStream([...cv.captureStream(30).getVideoTracks(),...dest.stream.getAudioTracks()]);
    const mime=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m))||'';
    const rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:5e6}:{});
    const parts=[];rec.ondataavailable=e=>e.data.size&&parts.push(e.data);
    const stopped=new Promise(r=>rec.onstop=r);
    const s0=segs[0];s0.kind?drawIO(c,{text:s0.text,anim:s0.anim,idx:s0.idx,dur:s0.dur},-1):drawFrame(c,{r:s0.r,idx:s0.idx,reveal:false,prog:null,ta:0,ot:s0.ot},0);
    const t0=performance.now();rec.start(500);
    await new Promise(res=>{(function loop(){
      const t=AC.currentTime-base,s=segs.find(x=>t<x.end)||segs[segs.length-1];
      if(s.kind)drawIO(c,{text:s.text,anim:s.anim,idx:s.idx,dur:s.dur},t-s.qs);
      else drawFrame(c,{r:s.r,idx:s.idx,reveal:t>=s.be,prog:t>=s.bs&&t<s.be?(t-s.bs)/d:null,ta:Math.max(0,t-s.start),ot:s.ot,ra:t-s.be},Math.max(t,0));
      prog(`Video ban rahi hai (tab khula rakho): ${fmt(t)} / ${fmt(D)}`,Math.min(1,Math.max(0,t/D)));
      if(cancelMk||t>=D+.3)return res();
      requestAnimationFrame(loop);
    })()});
    rec.stop();await stopped;stream.getTracks().forEach(x=>x.stop());
    if(cancelMk)throw new Error('cancel');
    const elapsed=(performance.now()-t0)/1000;
    prog('Video finalize ho rahi hai...',1);
    const vb=await VidFix.fix(new Blob(parts,{type:rec.mimeType.split(';')[0]}),rec.mimeType,elapsed);
    result={blob:vb,ext:rec.mimeType.includes('mp4')?'mp4':'webm',secs:elapsed};
    }
    const url=URL.createObjectURL(result.blob);
    $('out').src=url;$('dlv').href=url;$('dlv').download='ksb-quiz-video.'+result.ext;$('result').hidden=false;$('dlv').click();
    KSB.done(gate.logId,result.secs);
    prog('Video tayyar ✅ Length: '+fmt(result.secs)+' (download ho gayi, neeche chala ke bhi dekh sakte ho)',1);
  }catch(e){
    KSB.refund(gate.logId);
    if(e.message==='cancel')prog('Cancel ho gaya.',0);
    else if(e.tts){prog('Voice server ne roka – thori der baad dobara try karo (bani hui awaazein save hain).',0);alert('آواز کا سرور (Google) فی الحال ایک ساتھ بہت زیادہ درخواستوں کی وجہ سے رک گیا ہے۔ آپ کا انٹرنیٹ ٹھیک ہے۔\n\nکچھ منٹ بعد دوبارہ "Create Video" دبائیں۔ جو آوازیں بن چکی ہیں وہ محفوظ ہیں، دوبارہ نہیں مانگی جائیں گی، اس لیے کام وہیں سے آگے چلے گا۔')}
    else{prog('Error',0);alert('ویڈیو نہیں بن سکی: '+e.message)}
  }
  $('mk').disabled=false;$('cancel').hidden=true;$('cv').hidden=true;
};

chrome.storage.local.get(['Q','S'],d=>{
  Q=d.Q&&d.Q.length?d.Q:sample;if(d.S)S={...S,...d.S};
  Q.forEach(r=>{r.ans=/^[ABCD]$/i.test(r.ans||'')?r.ans.toUpperCase():'A'});
  if(!LANGS[S.lang])S.lang='en';
  applySettings();loadVoices();render();loadMusicList();
});
