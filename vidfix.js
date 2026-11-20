/* MediaRecorder se bani video mein total duration (length) nahi hoti, is liye player sirf
   chand seconds dikhata hai. Ye file header mein poori duration likh deti hai (WebM aur MP4). */
(function(g){
  const f64=v=>{const b=new Uint8Array(8);new DataView(b.buffer).setFloat64(0,v);return b};
  function vint(b,p){let l=1,m=0x80;while(l<=8&&!(b[p]&m)){l++;m>>=1}
    let v=b[p]&(m-1),unk=(b[p]&(m-1))===(m-1);
    for(let i=1;i<l;i++){v=v*256+b[p+i];if(b[p+i]!==255)unk=false}
    return{size:unk?-1:v,len:l}}
  function eid(b,p){let l=1,m=0x80;while(l<=4&&!(b[p]&m)){l++;m>>=1}
    let id=0;for(let i=0;i<l;i++)id=id*256+b[p+i];return{id,len:l}}
  function webm(head,sec){
    let p=0;const e=eid(head,p);if(e.id!==0x1A45DFA3)return null;
    let s=vint(head,p+e.len);p+=e.len+s.len+s.size;                       // EBML header skip
    const seg=eid(head,p);if(seg.id!==0x18538067)return null;
    const segSz=vint(head,p+seg.len);if(segSz.size!==-1)return null;       // sirf unknown-size segment (MediaRecorder)
    p+=seg.len+segSz.len;
    while(p<head.length-12){
      const id=eid(head,p),sz=vint(head,p+id.len),cs=p+id.len+sz.len;
      if(id.id===0x1F43B675||sz.size<0)return null;                        // Cluster tak Info nahi mili
      if(id.id===0x1549A966){                                              // Info
        const ce=cs+sz.size;let q=cs,scale=1e6,hasDur=false;
        while(q<ce){
          const cid=eid(head,q),csz=vint(head,q+cid.len),cst=q+cid.len+csz.len;
          if(cid.id===0x2AD7B1){scale=0;for(let i=0;i<csz.size;i++)scale=scale*256+head[cst+i]}
          if(cid.id===0x4489){
            hasDur=true;const val=sec*1e9/scale,dv=new DataView(head.buffer,head.byteOffset);
            if(csz.size===8)dv.setFloat64(cst,val);else if(csz.size===4)dv.setFloat32(cst,val);
            return head;                                                   // pehle se tha: in-place theek kiya
          }
          q=cst+csz.size;
        }
        const dur=new Uint8Array(11);dur.set([0x44,0x89,0x88]);dur.set(f64(sec*1e9/scale),3);
        const ns=sz.size+11,size8=new Uint8Array([1,0,0,0,0,0,0,0]);
        for(let i=7,v=ns;i>=1;i--){size8[i]=v%256;v=Math.floor(v/256)}
        const out=new Uint8Array(head.length+11+(8-sz.len));
        let o=0;const put=a=>{out.set(a,o);o+=a.length};
        put(head.subarray(0,p+id.len));put(size8);put(head.subarray(cs,ce));put(dur);put(head.subarray(ce));
        return out;
      }
      p=cs+sz.size;
    }
    return null;
  }
  function mp4(head,sec){
    const dv=new DataView(head.buffer,head.byteOffset),tp=(p)=>String.fromCharCode(head[p],head[p+1],head[p+2],head[p+3]);
    const kids=(s,e)=>{const r=[];let p=s;while(p+8<=e){let sz=dv.getUint32(p),hs=8;if(sz===1){sz=dv.getUint32(p+8)*4294967296+dv.getUint32(p+12);hs=16}else if(sz===0)sz=e-p;if(sz<hs)break;r.push({t:tp(p+4),s:p+hs,e:p+sz});p+=sz}return r};
    const moov=kids(0,head.length).find(b=>b.t==='moov');if(!moov||moov.e>head.length)return null;
    let mvTs=1000,done=0;
    const setD=(p,tsPos,durPos,ver,ts)=>{const t=ts||dv.getUint32(tsPos),v=Math.round(sec*t);ver?(dv.setUint32(durPos,Math.floor(v/4294967296)),dv.setUint32(durPos+4,v>>>0)):dv.setUint32(durPos,Math.min(v,0xFFFFFFFF));done++};
    kids(moov.s,moov.e).forEach(b=>{
      if(b.t==='mvhd'){const v=head[b.s];mvTs=dv.getUint32(b.s+(v?20:12));setD(b.s,b.s+(v?20:12),b.s+(v?24:16),v)}
      if(b.t==='trak')kids(b.s,b.e).forEach(c=>{
        if(c.t==='tkhd'){const v=head[c.s];setD(c.s,0,c.s+(v?28:20),v,mvTs)}
        if(c.t==='mdia')kids(c.s,c.e).forEach(d=>{if(d.t==='mdhd'){const v=head[d.s];setD(d.s,d.s+(v?20:12),d.s+(v?24:16),v)}});
      });
    });
    return done?head:null;
  }
  g.VidFix={async fix(blob,mime,sec){
    try{
      const N=Math.min(blob.size,262144),head=new Uint8Array(await blob.slice(0,N).arrayBuffer());
      const out=/mp4/i.test(mime)?mp4(head,sec):webm(head,sec);
      if(!out)return blob;
      return new Blob([out,blob.slice(N)],{type:blob.type});
    }catch(e){return blob}
  }};
})(typeof window!=='undefined'?window:globalThis);
