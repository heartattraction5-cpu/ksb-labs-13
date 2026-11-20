/* KSB LABS – Login / Signup / Admin / Video limit (Supabase REST, no external library) */
(()=>{
const G=id=>document.getElementById(id);
const CFG=window.KSB_CONFIG||{};
const configured=!!(CFG.URL&&CFG.ANON_KEY&&!/YOUR[-_]/i.test(CFG.URL+CFG.ANON_KEY));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayPK=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'});
let profile=null,pollT=null,users=[],legacyDb=false;

/* ---------- Admin WhatsApp (sirf chat) ---------- */
const WA_LIST=(CFG.WHATSAPP&&CFG.WHATSAPP.length?CFG.WHATSAPP:['03208299719','03160468982']);
const waIntl=n=>{n=String(n).replace(/\D/g,'');return n.startsWith('0')?'92'+n.slice(1):n};
const waShow=n=>String(n).replace(/\D/g,'').replace(/^(\d{4})(\d+)$/,'$1 $2');
window.KSB_WA_TEXT=()=>WA_LIST.map(waShow).join(' / ');
const WA_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
document.querySelectorAll('[data-wa]').forEach(el=>{
  el.innerHTML='<div class="wa-t">💬 Admin se rabta · ایڈمن سے رابطہ</div><div class="wa-links">'+
    WA_LIST.map(n=>`<a class="wa-btn" href="https://wa.me/${waIntl(n)}" target="_blank" rel="noopener">${WA_ICON}${waShow(n)}</a>`).join('')+
    '</div><div class="wa-n">ONLY WhatsApp chat (call nahi) · صرف واٹس ایپ چیٹ</div>';
});
const WA_MSG='\nWhatsApp (chat only): '+WA_LIST.map(waShow).join(' / ');

/* ---------- tiny REST client ---------- */
async function api(path,{method='GET',body,token}={}){
  const res=await fetch(CFG.URL+path,{method,headers:{apikey:CFG.ANON_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  let data=null;try{data=await res.json()}catch(e){}
  if(!res.ok){
    const err=new Error((data&&(data.msg||data.error_description||data.message||data.error))||('HTTP '+res.status));
    err.status=res.status;err.code=data&&(data.error_code||data.code);throw err;
  }
  return data;
}
/* ---------- session ---------- */
const area=()=>chrome.storage.session||chrome.storage.local;
async function loadSession(){
  const a=await chrome.storage.local.get('ksb_session');
  if(a.ksb_session)return a.ksb_session;
  try{const b=await chrome.storage.session.get('ksb_session');return b.ksb_session||null}catch(e){return null}
}
async function saveSession(sess,remember){
  await chrome.storage.local.remove('ksb_session');
  try{await chrome.storage.session.remove('ksb_session')}catch(e){}
  if(sess)await (remember?chrome.storage.local:area()).set({ksb_session:sess});
}
const mkSess=(d,old)=>({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||Math.floor(Date.now()/1000)+(d.expires_in||3600),user:d.user||(old&&old.user)});
async function getToken(){
  let s=await loadSession();if(!s)throw new Error('Session expired');
  if(s.expires_at-60<Date.now()/1000){
    try{
      const d=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}});
      const remember=!!(await chrome.storage.local.get('ksb_session')).ksb_session;
      s=mkSess(d,s);await saveSession(s,remember);
    }catch(e){if(e.status&&e.status<500){await saveSession(null);throw new Error('Session expired')}throw e}
  }
  return s.access_token;
}
const rpc=async(fn,args)=>api('/rest/v1/rpc/'+fn,{method:'POST',body:args||{},token:await getToken()});

/* ---------- screens ---------- */
function show(which){ // 'auth' | 'gate' | 'app'
  G('auth').hidden=which!=='auth';G('gate').hidden=which!=='gate';
  document.body.classList.toggle('locked',which!=='app');
}
function msg(el,type,text){el.hidden=!text;el.className='a-msg '+(type||'');el.textContent=text||''}
let mode='login';
function setMode(m){
  mode=m;const su=m==='signup';
  G('aTabLogin').classList.toggle('on',!su);G('aTabSignup').classList.toggle('on',su);
  G('aTitle').textContent=su?'Create your account':'Welcome back';
  G('aSub').textContent=su?'Create a free KSB LABS account — your first video is free.':'Sign in to open your video studio dashboard.';
  G('fName').hidden=su?false:true;G('forgot').hidden=su;
  G('aSubmitTxt').textContent=su?'Create free account':'Log in to KSB LABS';
  G('aSubmitIcon').hidden=su;G('aPass').autocomplete=su?'new-password':'current-password';
  msg(G('aMsg'),'','');
}
G('aTabLogin').onclick=()=>setMode('login');G('aTabSignup').onclick=()=>setMode('signup');
G('eye').onclick=()=>{const p=G('aPass');p.type=p.type==='password'?'text':'password'};
const friendly=e=>{
  const m=(e.message||'').toLowerCase();
  if(e instanceof TypeError||m.includes('failed to fetch'))return'Server se connection nahi ho saka. Internet check karo.';
  if(m.includes('invalid login'))return'Gmail ya password ghalat hai.';
  if(m.includes('not confirmed'))return'Pehle apni Gmail mein aayi confirmation email par click karo.';
  if(m.includes('already registered')||m.includes('already been registered'))return'Ye Gmail pehle se registered hai. Log in karo.';
  if(m.includes('gmail'))return'Sirf Gmail address allowed hai.';
  if(m.includes('rate limit')||e.status===429)return'Bohat zyada koshish. Thori der baad dobara try karo.';
  if(m.includes('database error'))return'Sirf @gmail.com address se account ban sakta hai.';
  return e.message||'Kuch ghalat ho gaya.';
};
G('aForm').onsubmit=async ev=>{
  ev.preventDefault();
  const name=G('aName').value.trim(),email=G('aEmail').value.trim().toLowerCase(),pass=G('aPass').value,remember=G('aRemember').checked,box=G('aMsg');
  if(!configured)return msg(box,'err','Supabase keys set nahi hain. config.js kholo aur URL + anon key paste karo.');
  if(mode==='signup'&&name.length<2)return msg(box,'err','Apna poora naam likho.');
  if(!/^[^\s@]+@gmail\.com$/i.test(email))return msg(box,'err','Sirf valid Gmail address allowed hai (you@gmail.com).');
  if(pass.length<8)return msg(box,'err','Password kam az kam 8 characters ka hona chahiye.');
  const btn=G('aSubmit');btn.disabled=true;G('aSubmitTxt').textContent='Please wait...';msg(box,'','');
  try{
    if(mode==='signup'){
      const d=await api('/auth/v1/signup',{method:'POST',body:{email,password:pass,data:{full_name:name}}});
      if(d.access_token){await saveSession(mkSess(d),remember);window.__ksbNew=1;await enter();return}
      setMode('login');G('aEmail').value=email;
      msg(box,'ok','Account ban gaya! Agar email confirmation on hai to Gmail check karo, phir Log in karo. Aapko 1 video free milegi.');
    }else{
      const d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:pass}});
      await saveSession(mkSess(d),remember);await enter();
    }
  }catch(e){msg(box,'err',friendly(e))}
  btn.disabled=false;G('aSubmitTxt').textContent=mode==='signup'?'Create free account':'Log in to KSB LABS';
};
G('forgot').onclick=async ev=>{
  ev.preventDefault();const email=G('aEmail').value.trim().toLowerCase(),box=G('aMsg');
  if(!/^[^\s@]+@gmail\.com$/i.test(email))return msg(box,'err','Pehle upar apna Gmail address likho.');
  try{await api('/auth/v1/recover',{method:'POST',body:{email}});msg(box,'ok','Password reset ka link aapki Gmail par bhej diya gaya hai.')}
  catch(e){msg(box,'err',friendly(e))}
};

/* ---------- gate (pending / blocked / error) ---------- */
function gate(kind,title,text){
  show('gate');clearInterval(pollT);
  G('gIcon').textContent=kind==='pending'?'⏳':kind==='blocked'?'⛔':'⚠️';
  G('gTitle').textContent=title;G('gText').textContent=text;
  if(kind==='pending')pollT=setInterval(()=>enter(true),8000);
}
G('gRetry').onclick=()=>enter();
async function logout(){
  clearInterval(pollT);
  try{const t=await getToken();await api('/auth/v1/logout',{method:'POST',token:t})}catch(e){}
  await saveSession(null);profile=null;G('aPass').value='';setMode('login');show('auth');
}
G('gLogout').onclick=logout;G('logoutBtn').onclick=logout;

/* ---------- profile + quota ---------- */
async function fetchProfile(){
  const t=await getToken(),s=await loadSession();
  const rows=await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(s.user.id)}&select=*`,{token:t});
  return rows&&rows[0]||null;
}
function left(p){
  if(p.is_admin)return null;
  if(p.limit_mode==='daily')return Math.max(0,p.limit_value-(p.used_date===todayPK()?p.used_today:0));
  return Math.max(0,p.limit_value-p.used_total);
}
function chip(){
  const p=profile;if(!p)return;
  G('uchip').hidden=false;G('uname').textContent=p.full_name||p.email;G('uav').textContent=(p.full_name||p.email||'?')[0].toUpperCase();
  const l=left(p);
  const free=!p.is_admin&&p.limit_mode==='total'&&p.limit_value===1&&p.used_total===0;
  G('uquota').textContent=p.is_admin?'Admin · unlimited':(free?'🎁 1 free video':l+' video'+(l===1?'':'s')+' left'+(p.limit_mode==='daily'?' today':''));
  G('plansBtn').hidden=!!p.is_admin;
  G('uquota').classList.toggle('low',l!==null&&l===0);
  G('tabAdmin').hidden=!p.is_admin;
}
async function enter(silent){
  try{
    const p=await fetchProfile();profile=p;
    if(!p)return gate('error','Profile nahi mili','Account ka profile nahi bana. Logout karke dobara sign up karo, ya admin se rabta karo.');
    if(p.status==='pending')return gate('pending','Waiting for admin approval','Aapka account ban gaya hai. Admin approve karega to studio khul jayegi. Ye page khud check karta rehta hai.');
    if(p.status==='blocked')return gate('blocked','Account blocked','Aapka account admin ne block kar diya hai. Rabta karne ke liye admin se baat karo.');
    clearInterval(pollT);chip();
    if(document.body.classList.contains('locked'))show('app');
    if(window.__ksbNew&&!p.is_admin){window.__ksbNew=0;toast('🎁 Welcome! Aapko 1 video free mili hai. اپنی پہلی ویڈیو مفت بنائیں۔',5000)}
    if(!window.__ksbFocus){window.__ksbFocus=1;window.addEventListener('focus',()=>profile&&enter(true))}
  }catch(e){
    if(e.message==='Session expired')return silent?null:(show('auth'),msg(G('aMsg'),'err','Session khatam ho gaya. Dobara log in karo.'));
    if(!silent)gate('error','Connection problem',friendly(e));
  }
}


/* ---------- Subscription plans (button -> admin ka PEHLA WhatsApp number) ---------- */
const PLANS=[
  {id:'starter',theme:'starter',badge:'STARTER',off:'33% OFF',title:'30 VIDEOS / MONTH',videos:30,price:1500,priceTxt:'Rs 1,500 / mo',sub:'Rs 50 per video',desc:'Great for starting GK & Grammar channels',
   feats:['Auto Voiceover & Background Music','Animations & Loading Bars','Changing Backgrounds Per Question','No Watermark'],cta:'Get 30 Videos'},
  {id:'popular',theme:'popular',badge:'MOST POPULAR',off:'40% OFF',title:'90 VIDEOS / MONTH',videos:90,price:3000,priceTxt:'Rs 3,000 / mo',sub:'Rs 33 per video \u2014 Save Rs 1,500 vs Starter',desc:'Best for daily GK & Grammar creators',
   feats:['Auto Voiceover & Background Music','Dynamic Animations & Timer Loading Bars','New Background & Animation Every Question','Priority Support'],cta:'Get 90 Videos'},
  {id:'pro',theme:'pro',badge:'PRO AGENCY',off:'45% OFF',title:'150 VIDEOS / MONTH',videos:150,price:4500,priceTxt:'Rs 4,500 / mo',sub:'Lowest rate: Rs 30 per video',desc:'Built for multiple GK & Grammar channels',
   feats:['Auto Voiceover & Background Music','Dynamic Animations & Timer Loading Bars','Changing Backgrounds & Animations Per Question','Fastest Rendering & Priority Support'],cta:'Get 150 Videos'}
];
const waLink=pl=>{
  const who=(profile&&profile.email)||'';
  const text=`Assalam o Alaikum! Mujhe KSB LABS Video Studio ka ${pl.badge} plan chahiye (${pl.videos} videos / month - Rs ${pl.price.toLocaleString('en-US')}).\nMera account: ${who}`;
  return 'https://wa.me/'+waIntl(WA_LIST[0])+'?text='+encodeURIComponent(text);   // WA_LIST[0] = pehla admin number
};
function buildPlans(){
  G('pmGrid').innerHTML=PLANS.map(pl=>`<div class="pc ${pl.theme}">
    <div class="pc-badges"><span class="pc-b">${esc(pl.badge)}</span><span class="pc-off">${esc(pl.off)}</span></div>
    <h3 class="pc-t">${esc(pl.title)}</h3>
    <div class="pc-p">${esc(pl.priceTxt)}</div>
    <div class="pc-s">${esc(pl.sub)}</div>
    <p class="pc-d">${esc(pl.desc)}</p>
    <ul class="pc-f">${pl.feats.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
    <a class="pc-cta" href="${waLink(pl)}" target="_blank" rel="noopener">${esc(pl.cta)} <span aria-hidden="true">\u2192</span></a>
  </div>`).join('');
}
function openPlans(reason){
  buildPlans();
  G('pmSub').textContent=reason||'Apna plan chunein — admin se WhatsApp par rabta ho jayega.';
  G('plansModal').hidden=false;document.body.classList.add('pm-open');
}
function closePlans(){G('plansModal').hidden=true;document.body.classList.remove('pm-open')}
G('plansBtn').onclick=()=>openPlans('');
G('pmClose').onclick=closePlans;
G('plansModal').addEventListener('click',e=>{if(e.target===G('plansModal'))closePlans()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!G('plansModal').hidden)closePlans()});
G('pmRefresh').onclick=async()=>{
  await enter(true);
  const l=profile&&left(profile);
  if(profile&&(profile.is_admin||l>0)){closePlans();toast('✔ '+(profile.is_admin?'Admin':l+' video'+(l===1?'':'s')+' available'),2500)}
  else toast('Abhi admin ne videos add nahi kin. Payment ke baad dobara check karo.',3000);
};

/* ---------- video limit (server decides) ---------- */
const REASONS={
  pending:'Your account is waiting for admin approval.\nآپ کا اکاؤنٹ ایڈمن کی منظوری کا منتظر ہے۔'+WA_MSG,
  blocked:'Your account is blocked. Contact the admin.\nآپ کا اکاؤنٹ بلاک ہے، ایڈمن سے رابطہ کریں۔'+WA_MSG,
  no_profile:'Profile not found. Please log out and log in again.'
};
window.KSB={
  async consume(title,qn){
    try{
      legacyDb=false;let r;
      try{r=await rpc('consume_video',{p_title:String(title||'').trim().slice(0,200),p_qcount:qn|0})}
      catch(e){if(e.status===404){legacyDb=true;r=await rpc('consume_video')}else throw e}   // purana database (update SQL abhi run nahi hua)
      if(r&&r.ok){await enter(true);return{ok:true,logId:r.log_id||null}}
      if(r&&(r.reason==='limit_total'||r.reason==='limit_daily')){await enter(true);openPlans(r.reason==='limit_daily'?'Aaj ki video limit poori ho gayi hai.\nآج کی لِمٹ پوری ہو گئی ہے۔':'Aapki free video istemal ho chuki hai (ya limit poori ho gayi). Aage videos banane ke liye neeche se plan chunein.\nآپ کی مفت ویڈیو استعمال ہو چکی ہے، آگے بنانے کے لیے پلان چنیں۔');return{ok:false,msg:''}}
      let m=REASONS[r&&r.reason]||'Not allowed.';
      if(r&&r.reason==='limit_total')m=`Your video limit is finished (${r.limit} total). Contact the admin to get more.\nآپ کی ویڈیو لِمٹ پوری ہو گئی ہے، ایڈمن سے رابطہ کریں۔`+WA_MSG;
      if(r&&r.reason==='limit_daily')m=`Today's limit is finished (${r.limit} per day). Try again tomorrow or contact the admin.\nآج کی لِمٹ پوری ہو گئی ہے، کل دوبارہ کوشش کریں یا ایڈمن سے رابطہ کریں۔`+WA_MSG;
      await enter(true);return{ok:false,msg:m};
    }catch(e){return{ok:false,msg:'Limit check nahi ho saka: '+friendly(e)}}
  },
  async refund(logId){try{await rpc('refund_video',legacyDb||!logId?{}:{p_log_id:logId});await enter(true)}catch(e){}},
  async done(logId,secs){if(!logId||legacyDb)return;try{await rpc('log_video_done',{p_log_id:logId,p_secs:Math.round(secs||0)})}catch(e){}},
  get isAdmin(){return !!(profile&&profile.is_admin)}
};

/* ---------- admin panel ---------- */
const toast=(t,ms)=>{const el=G('toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),ms||1800)};
G('tabAdmin').onclick=()=>{
  if(typeof stop==='function')stop();
  G('edit').hidden=true;G('play').hidden=true;G('admin').hidden=false;
  ['tabEdit','tabPlay'].forEach(i=>G(i).classList.remove('on'));G('tabAdmin').classList.add('on');loadUsers();
};
async function loadUsers(){
  try{users=await rpc('admin_list_users');renderUsers()}catch(e){toast('Users load nahi hue: '+friendly(e))}
}
function renderUsers(){
  const q=G('admSearch').value.trim().toLowerCase(),f=G('admFilter').value;
  const cnt=s=>users.filter(u=>u.status===s).length;
  G('stTotal').textContent=users.length;G('stPending').textContent=cnt('pending');G('stActive').textContent=cnt('active');G('stBlocked').textContent=cnt('blocked');
  G('admCount').textContent=users.length+' users';
  const list=users.filter(u=>(f==='all'||u.status===f)&&(!q||(u.email+' '+(u.full_name||'')).toLowerCase().includes(q)));
  G('admRows').innerHTML=list.length?'':'<tr><td colspan="6" class="empty">Koi user nahi mila.</td></tr>';
  list.forEach(u=>{
    const tr=document.createElement('tr'),self=u.id===(profile&&profile.id);
    const today=u.used_date===todayPK()?u.used_today:0;
    tr.innerHTML=`<td><div class="u-name">${esc(u.full_name||'—')}${u.is_admin?' <span class="tag">ADMIN</span>':''}</div><div class="u-mail">${esc(u.email)}</div></td>
    <td>${new Date(u.created_at).toLocaleDateString('en-GB')}</td>
    <td><span class="st ${u.status}">${u.status}</span></td>
    <td><div class="lim"><select class="m"><option value="total">Total</option><option value="daily">Per day</option></select>
      <button class="mi">−</button><input class="v" type="number" min="0" max="9999"><button class="pl">+</button></div></td>
    <td><div class="u-use"><b>${u.used_total}</b> total · <b>${today}</b> today</div></td>
    <td><div class="acts"></div></td>`;
    const sel=tr.querySelector('.m'),inp=tr.querySelector('.v');sel.value=u.limit_mode;inp.value=u.limit_value;
    const save=async(status,note)=>{
      try{await rpc('admin_update_user',{p_id:u.id,p_status:status||u.status,p_mode:sel.value,p_limit:Math.max(0,Math.min(9999,+inp.value||0))});toast(note||'Saved ✔');await loadUsers()}
      catch(e){toast(friendly(e))}
    };
    sel.onchange=()=>save();inp.onchange=()=>save();
    tr.querySelector('.mi').onclick=()=>{inp.value=Math.max(0,(+inp.value||0)-1);save()};
    tr.querySelector('.pl').onclick=()=>{inp.value=Math.min(9999,(+inp.value||0)+1);save()};
    const acts=tr.querySelector('.acts'),add=(txt,cls,fn)=>{const b=document.createElement('button');b.textContent=txt;b.className='sm '+cls;b.onclick=fn;acts.appendChild(b)};
    if(u.status==='pending')add('✔ Approve','go',()=>save('active','User approved ✔'));
    if(!u.is_admin)[['+30','Starter',30],['+90','Popular',90],['+150','Pro',150]].forEach(([t,n,v])=>add(t+' '+n,'go',()=>{
      sel.value='total';inp.value=Math.min(9999,(+inp.value||0)+v);save('active',v+' videos added ✔ ('+n+' plan)');
    }));
    if(!self&&u.status==='active')add('Block','danger',()=>save('blocked','User blocked'));
    if(!self&&u.status==='blocked')add('Unblock','go',()=>save('active','User unblocked'));
    add('📄 Statement PDF','primary',async()=>{
      toast('Statement ban rahi hai...');
      try{
        const logs=await rpc('admin_user_videos',{p_id:u.id});
        const blob=await KSBStatement.build({user:u,logs:logs||[],admin:profile});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=KSBStatement.fileName(u);
        document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
        toast('Statement download ho gayi ✔');
      }catch(e){toast('Statement nahi ban saki: '+friendly(e))}
    });
    add('Reset used','',async()=>{try{await rpc('admin_reset_used',{p_id:u.id});toast('Usage reset ✔');loadUsers()}catch(e){toast(friendly(e))}});
    if(!self)add('Delete','danger',async()=>{if(!confirm(`${u.email} ko hamesha ke liye delete karna hai?`))return;try{await rpc('admin_delete_user',{p_id:u.id});toast('User deleted');loadUsers()}catch(e){toast(friendly(e))}});
    G('admRows').appendChild(tr);
  });
}
G('admSearch').oninput=renderUsers;G('admFilter').onchange=renderUsers;G('admRefresh').onclick=loadUsers;

/* ---------- boot ---------- */
(async()=>{
  setMode('login');
  if(!configured){show('auth');msg(G('aMsg'),'err','Setup baqi hai: config.js mein Supabase URL aur anon key paste karo.');return}
  const s=await loadSession();
  if(!s){show('auth');return}
  show('gate');G('gIcon').textContent='⏳';G('gTitle').textContent='Loading...';G('gText').textContent='';
  await enter();
})();
})();
