/* KSB LABS – Admin Statement PDF
   Canvas par page banta hai (is liye Urdu / Arabic / Hindi / English sab sahi dikhte hain),
   phir JPEG ko PDF mein pack kar diya jata hai. Koi bahari library nahi chahiye. */
(function(g){
const W=1240,H=1754,M=70,CWD=W-2*M;           // A4 @150dpi
const FAM='Inter,"Noto Naskh Arabic","Noto Sans Devanagari","Nirmala UI","Segoe UI",Arial,sans-serif';
const AR=/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const PK=(d,o)=>new Date(d).toLocaleString('en-GB',Object.assign({timeZone:'Asia/Karachi'},o));
const fDT=d=>d?PK(d,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}):'—';
const fD=d=>d?PK(d,{day:'2-digit',month:'short',year:'numeric'}):'—';
const fDur=s=>{if(s==null||isNaN(s))return'—';s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`};
const STATUS={done:['Completed','#15803d'],failed:['Failed (refunded)','#b91c1c'],started:['Not finished','#b45309']};

function setFont(c,px,wt){c.font=`${wt||400} ${px}px ${FAM}`}
function wrap(c,s,maxW){
  const words=String(s==null?'':s).split(/\s+/).filter(Boolean),lines=[];let cur='';
  const put=w=>{ // bahut lamba lafz ho to tukde kar do
    while(c.measureText(w).width>maxW&&w.length>1){let k=w.length;while(k>1&&c.measureText(w.slice(0,k)).width>maxW)k--;lines.push(w.slice(0,k));w=w.slice(k)}
    return w};
  for(const w of words){
    const t=cur?cur+' '+w:w;
    if(c.measureText(t).width<=maxW)cur=t;
    else{if(cur)lines.push(cur);cur=put(w)}
  }
  if(cur)lines.push(cur);
  return lines.length?lines:[''];
}
/* text likho: o={w,align,color,px,wt,maxLines}; y = upar ka kinara; wapas height */
function text(c,s,x,y,o){
  o=o||{};const px=o.px||22,w=o.w||CWD;s=String(s==null||s===''?'—':s);
  setFont(c,px,o.wt);c.fillStyle=o.color||'#0f172a';c.textBaseline='top';
  const rtl=AR.test(s),lh=Math.round(px*(rtl?1.75:1.4));
  let lines=wrap(c,s,w);
  if(o.maxLines&&lines.length>o.maxLines){lines=lines.slice(0,o.maxLines);lines[o.maxLines-1]=lines[o.maxLines-1].replace(/.{0,2}$/,'…')}
  c.direction=rtl?'rtl':'ltr';
  const al=o.align||'left';
  lines.forEach((ln,i)=>{
    let ax=x,a='left';
    if(al==='center'){a='center';ax=x+w/2}
    else if(al==='right'||(rtl&&al==='left'&&!o.noFlip)){a='right';ax=x+w}
    c.textAlign=a;c.fillText(ln,ax,y+i*lh);
  });
  c.direction='ltr';c.textAlign='left';
  return lines.length*lh;
}
function measure(c,s,px,wt,w,maxLines){
  s=String(s==null||s===''?'—':s);setFont(c,px,wt);
  let n=wrap(c,s,w).length;if(maxLines)n=Math.min(n,maxLines);
  return n*Math.round(px*(AR.test(s)?1.75:1.4));
}
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)};

async function loadFonts(strs){
  const all=strs.join(' ');
  const jobs=[];
  ['Inter','Noto Naskh Arabic','Noto Sans Devanagari'].forEach(f=>[400,600,700,800].forEach(w=>jobs.push(document.fonts.load(`${w} 20px "${f}"`,all).catch(()=>{}))));
  await Promise.all(jobs);
}

function newPage(pages){
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;
  const c=cv.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,W,H);
  pages.push(cv);return c;
}
function bigHeader(c,ctx){
  const gr=c.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#0a3fb5');gr.addColorStop(1,'#12307a');
  c.fillStyle=gr;c.fillRect(0,0,W,200);c.fillStyle='#ffc916';c.fillRect(0,200,W,8);
  text(c,'KSB LABS',M,40,{px:58,wt:800,color:'#fff',w:600});
  c.letterSpacing='5px';text(c,'VIDEO STUDIO  ·  USER STATEMENT',M,118,{px:20,wt:600,color:'#ffc916',w:760});c.letterSpacing='0px';
  text(c,'Statement date',W-M-420,42,{px:16,wt:600,color:'#bcd0ff',w:420,align:'right'});
  text(c,ctx.now,W-M-420,64,{px:24,wt:700,color:'#fff',w:420,align:'right'});
  text(c,'Prepared by (Admin)',W-M-420,108,{px:16,wt:600,color:'#bcd0ff',w:420,align:'right'});
  text(c,ctx.admin,W-M-420,130,{px:24,wt:700,color:'#fff',w:420,align:'right',maxLines:1});
  return 244;
}
function slimHeader(c,ctx){
  c.fillStyle='#12307a';c.fillRect(0,0,W,76);c.fillStyle='#ffc916';c.fillRect(0,76,W,5);
  text(c,'KSB LABS',M,22,{px:30,wt:800,color:'#fff',w:300});
  text(c,'Statement — '+ctx.uname,M+260,28,{px:22,wt:600,color:'#dbe6ff',w:CWD-260,align:'right',maxLines:1});
  return 118;
}
function section(c,title,y){
  text(c,title,M,y,{px:21,wt:800,color:'#12307a',w:CWD});
  c.fillStyle='#ffc916';c.fillRect(M,y+34,70,4);c.fillStyle='#e2e8f0';c.fillRect(M+70,y+35,CWD-70,2);
  return y+58;
}
function tableHead(c,y,cols){
  c.fillStyle='#12307a';rr(c,M,y,CWD,54,10);c.fill();
  let x=M;cols.forEach(k=>{text(c,k.h,x+12,y+15,{px:17,wt:700,color:'#fff',w:k.w-24,align:k.al||'left'});x+=k.w});
  return y+54;
}

async function build({user,logs,admin}){
  user=user||{};logs=logs||[];
  const uname=user.full_name||user.email||'User',aname=(admin&&(admin.full_name||admin.email))||'Admin';
  const now=fDT(new Date())+' (PKT)';
  const done=logs.filter(l=>l.status==='done'),failed=logs.filter(l=>l.status==='failed'),open=logs.filter(l=>l.status==='started');
  const sumQ=done.reduce((a,l)=>a+(l.q_count||0),0),sumDur=done.reduce((a,l)=>a+(l.duration_sec||0),0);
  const todayPK=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'});
  const usedToday=user.used_date===todayPK?user.used_today:0;
  const lim=user.is_admin?'Unlimited (Admin)':(user.limit_mode==='daily'?`${user.limit_value} per day`:`${user.limit_value} in total`);
  const stTxt=user.status?user.status.charAt(0).toUpperCase()+user.status.slice(1):'—';
  await loadFonts([uname,aname,user.email||'',now,...logs.map(l=>l.title||''),'0123456789 KSB LABS Statement Completed Failed refunded Not finished']);

  const pages=[],ctx={now,admin:aname,uname};
  let c=newPage(pages),y=bigHeader(c,ctx);

  /* ---- User details ---- */
  y=section(c,'USER DETAILS',y);
  const cells=[
    ['Full name',uname,null],['Gmail',user.email||'—',null],
    ['Account status',stTxt,user.status==='active'?'#15803d':user.status==='blocked'?'#b91c1c':'#b45309'],['Joined',fD(user.created_at),null],
    ['Last active',fDT(user.last_active),null],['Video limit',lim,null],
    ['Videos used (counter)',String(user.used_total!=null?user.used_total:'—'),null],['Videos used today',String(usedToday),null]
  ];
  const cw=(CWD-60)/2,rowH=96,boxH=rowH*4+24;
  c.fillStyle='#f3f6ff';rr(c,M,y,CWD,boxH,18);c.fill();c.strokeStyle='#dbe4ff';c.lineWidth=2;rr(c,M,y,CWD,boxH,18);c.stroke();
  cells.forEach((k,i)=>{
    const col=i%2,row=Math.floor(i/2),x=M+30+col*(cw+0),yy=y+16+row*rowH;
    text(c,k[0].toUpperCase(),x,yy,{px:14,wt:700,color:'#64748b',w:cw-20});
    text(c,k[1],x,yy+26,{px:25,wt:700,color:k[2]||'#0f172a',w:cw-24,maxLines:2,noFlip:true});
  });
  y+=boxH+34;

  /* ---- Summary ---- */
  y=section(c,'SUMMARY',y);
  const cards=[
    [String(done.length),'Videos created','#15803d','#e8f8ee'],
    [String(sumQ),'Total questions','#12307a','#eaf0ff'],
    [fDur(sumDur),'Total video time','#6d28d9','#f1eaff'],
    [String(failed.length+open.length),'Failed / not finished','#b45309','#fff3e0']
  ],gap=20,cwid=(CWD-3*gap)/4;
  cards.forEach((k,i)=>{
    const x=M+i*(cwid+gap);c.fillStyle=k[3];rr(c,x,y,cwid,128,16);c.fill();
    text(c,k[0],x,y+20,{px:46,wt:800,color:k[2],w:cwid,align:'center'});
    text(c,k[1],x,y+88,{px:17,wt:600,color:'#475569',w:cwid,align:'center'});
  });
  y+=128+22;
  const noLog=Math.max(0,(user.used_total||0)-logs.filter(l=>l.status!=='failed').length);
  if(noLog>0&&user.used_total!=null){
    y+=text(c,`Note: the user's counter shows ${user.used_total} video(s) used, but only ${logs.filter(l=>l.status!=='failed').length} have a saved title record (older videos were made before title tracking was added, or the counter was reset by admin).`,M,y,{px:15,color:'#64748b',w:CWD});
    y+=8;
  }
  y+=22;

  /* ---- Table ---- */
  y=section(c,'VIDEO DETAILS ('+logs.length+')',y);
  const cols=[{h:'#',w:64,al:'center'},{h:'Date & time (PKT)',w:250},{h:'Video title',w:CWD-64-250-96-120-170},{h:'Qs',w:96,al:'center'},{h:'Length',w:120,al:'center'},{h:'Status',w:170}];
  const foot=96;
  const ensure=need=>{if(y+need>H-foot){c=newPage(pages);y=slimHeader(c,ctx);y=tableHead(c,y,cols)}};
  if(y+54+60>H-foot){c=newPage(pages);y=slimHeader(c,ctx)}
  y=tableHead(c,y,cols);
  if(!logs.length){
    c.fillStyle='#f8faff';c.fillRect(M,y,CWD,90);
    text(c,'No videos recorded for this user yet.',M,y+28,{px:21,color:'#64748b',w:CWD,align:'center'});y+=90;
  }
  logs.forEach((l,i)=>{
    const tw=cols[2].w-24,th=measure(c,l.title||'(no title)',21,500,tw,4),rh=Math.max(60,th+28);
    ensure(rh);
    if(i%2===0){c.fillStyle='#f6f8fe';c.fillRect(M,y,CWD,rh)}
    c.fillStyle='#e5eaf5';c.fillRect(M,y+rh-1,CWD,1);
    let x=M;const st=STATUS[l.status]||['—','#64748b'];
    const vals=[
      [String(i+1),{color:'#64748b',wt:700}],
      [fDT(l.created_at),{px:18}],
      [l.title||'(no title)',{px:21,wt:500,maxLines:4,color:l.title?'#0f172a':'#94a3b8'}],
      [l.q_count!=null?String(l.q_count):'—',{}],
      [fDur(l.duration_sec),{}],
      [st[0],{color:st[1],wt:700,px:18}]
    ];
    vals.forEach((v,k)=>{text(c,v[0],x+12,y+14,Object.assign({px:20,w:cols[k].w-24,align:cols[k].al||'left'},v[1]));x+=cols[k].w});
    y+=rh;
  });

  /* ---- Footer (har page par) ---- */
  const wa=(g.KSB_WA_TEXT&&g.KSB_WA_TEXT())||'';
  pages.forEach((p,i)=>{
    const f=p.getContext('2d');
    f.fillStyle='#e2e8f0';f.fillRect(M,H-78,CWD,2);
    text(f,'KSB LABS Video Studio  ·  Admin statement — confidential, for admin use only'+(wa?'   ·   WhatsApp (chat only): '+wa:''),M,H-60,{px:14,color:'#64748b',w:CWD-160,maxLines:2});
    text(f,`Page ${i+1} / ${pages.length}`,W-M-160,H-60,{px:15,wt:700,color:'#12307a',w:160,align:'right'});
  });
  return toPdf(pages);
}

async function toPdf(canvases){
  const enc=new TextEncoder(),jpgs=[];
  for(const cv of canvases){
    const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',.92));
    jpgs.push(new Uint8Array(await b.arrayBuffer()));
  }
  const parts=[],offs=[];let pos=0;
  const push=u=>{parts.push(u);pos+=u.length},str=s=>push(enc.encode(s));
  str('%PDF-1.4\n');push(new Uint8Array([0x25,0xE2,0xE3,0xCF,0xD3,10]));
  const obj=(id,fn)=>{offs[id]=pos;str(id+' 0 obj\n');fn();str('\nendobj\n')};
  const n=jpgs.length;
  obj(1,()=>str('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>str('<< /Type /Pages /Kids ['+jpgs.map((_,i)=>(3+3*i)+' 0 R').join(' ')+'] /Count '+n+' >>'));
  jpgs.forEach((j,i)=>{
    const p=3+3*i,ct=p+1,im=p+2,cs='q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
    obj(p,()=>str(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
    obj(ct,()=>str(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(im,()=>{str(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>\nstream\n`);push(j);str('\nendstream')});
  });
  const xr=pos,total=3+3*n;
  str(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)str(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  str(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'});
}

const safeName=s=>String(s||'user').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,60)||'user';
g.KSBStatement={build,fileName:u=>safeName(u.full_name||(u.email||'').split('@')[0])+' - Statement - '+new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'})+'.pdf'};
})(typeof window!=='undefined'?window:globalThis);
