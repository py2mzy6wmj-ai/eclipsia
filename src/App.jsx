import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { HEROES, WP, AR, AC, TL, ALL_EQ, ENM, BSS, DG, EVT, BUP, EL, EM, RA, defER, PORTRAIT_BASE, STARTING_GOLD } from './data';

var uid=function(){return Math.random().toString(36).slice(2,10);};
var roll=function(p){return Math.random()<p;};
var pick=function(a){return a[Math.floor(Math.random()*a.length)];};
var clamp=function(v,lo,hi){return Math.max(lo,Math.min(hi,v));};
var variance=function(){return .8+Math.random()*.4;};
var lerp100=function(v1,v100,lv){return v1+(v100-v1)*((lv-1)/99);};
// Format +/- % for STR/MAG/PHV/MAV: value is multiplier (1.06 → +6%, 0.95 → -5%)
var fmtPM=function(v){var p=Math.round((v-1)*100);return(p>=0?"+":"")+p+"%";};
var fmtPct=function(v){return Math.round(v*100)+"%";};
// Elemental: also +/- % (1.10 → +10% vuln, 0.90 → -10% vuln)
var fmtEV=function(v){if(v===0)return"IMMUNITÉ";var p=Math.round((v-1)*100);return(p>=0?"+":"")+p+"%";};
// Format additive bonus: 0.02 → +2%, -0.03 → -3%
var fmtB=function(v){var p=Math.round(v*100);return(p>=0?"+":"")+p+"%";};

// Portraits: loaded from URL (Supabase). Emoji fallback on error.
function portrait(id) {
  if (PORTRAIT_BASE) return PORTRAIT_BASE + id + ".png";
  return null;
}

function cs(hero,bl){
  var t=HEROES.find(function(h){return h.id===hero.id;});
  if(!t)return{hp:1,mp:1,str:1,mag:1,crit:0,phv:1,mav:1,dodge:0,rgHp:0,rgMp:0,eco:0,er:defER(),_s:{}};
  var lv=hero.level||1;
  var bHp=Math.floor(lerp100(t.lv1.hp,t.lv100.hp,lv));
  var bMp=Math.floor(lerp100(t.lv1.mp,t.lv100.mp,lv));
  var bStr=lerp100(t.lv1.str,t.lv100.str,lv);
  var bMag=lerp100(t.lv1.mag,t.lv100.mag,lv);
  var bCrit=lerp100(t.lv1.crit,t.lv100.crit,lv);
  var bPhv=lerp100(t.lv1.phv,t.lv100.phv,lv);
  var bMav=lerp100(t.lv1.mav,t.lv100.mav,lv);
  var bDodge=lerp100(t.lv1.dodge,t.lv100.dodge,lv);
  var _s={hp:["Nv."+lv+": "+bHp],mp:["Nv."+lv+": "+bMp],str:["Nv."+lv+": "+fmtPM(bStr)],mag:["Nv."+lv+": "+fmtPM(bMag)],crit:["Nv."+lv+": "+fmtPct(bCrit)],phv:["Nv."+lv+": "+fmtPM(bPhv)],mav:["Nv."+lv+": "+fmtPM(bMav)],dodge:["Nv."+lv+": "+fmtPct(bDodge)],rgHp:[],rgMp:[],eco:[]};
  var s={hp:bHp,mp:bMp,str:bStr,mag:bMag,crit:bCrit,phv:bPhv,mav:bMav,dodge:bDodge,rgHp:0,rgMp:0,eco:0,er:Object.assign({},t.er||defER()),_s:_s};
  if(bl){
    if(bl.autel){var bv=Math.floor(s.hp*bl.autel*.02);s.hp+=bv;_s.hp.push("Autel Nv."+bl.autel+": +"+bv);}
    if(bl.forge){s.str+=bl.forge*.003;_s.str.push("Forge Nv."+bl.forge+": "+fmtB(bl.forge*.003));}
    if(bl.rempart){s.phv-=bl.rempart*.003;_s.phv.push("Rempart Nv."+bl.rempart+": "+fmtB(-bl.rempart*.003));}
    if(bl.tour){s.mag+=bl.tour*.003;_s.mag.push("Tour Nv."+bl.tour+": "+fmtB(bl.tour*.003));}
  }
  var eq=hero.equipment||{};
  var slots=["weapon","armor","accessory","talisman"];
  for(var si=0;si<slots.length;si++){var it=eq[slots[si]];if(!it||!it.bon)continue;var b=it.bon;
    if(b.hp){s.hp+=b.hp;_s.hp.push(it.name+": +"+b.hp);}
    if(b.mp){s.mp+=b.mp;_s.mp.push(it.name+": +"+b.mp);}
    if(b.str){s.str+=b.str;_s.str.push(it.name+": "+fmtB(b.str));}
    if(b.mag){s.mag+=b.mag;_s.mag.push(it.name+": "+fmtB(b.mag));}
    if(b.crit){s.crit+=b.crit;_s.crit.push(it.name+": +"+fmtPct(b.crit));}
    if(b.phv){s.phv+=b.phv;_s.phv.push(it.name+": "+fmtB(b.phv));}
    if(b.mav){s.mav+=b.mav;_s.mav.push(it.name+": "+fmtB(b.mav));}
    if(b.dodge){s.dodge+=b.dodge;_s.dodge.push(it.name+": +"+fmtPct(b.dodge));}
    if(b.rgHp){s.rgHp+=b.rgHp;_s.rgHp.push(it.name+": +"+fmtPct(b.rgHp));}
    if(b.rgMp){s.rgMp+=b.rgMp;_s.rgMp.push(it.name+": +"+fmtPct(b.rgMp));}
    if(b.eco){s.eco+=b.eco;_s.eco.push(it.name+": +"+fmtPct(b.eco));}
    if(b.er)for(var ek in b.er)s.er[ek]=(s.er[ek]||1)+b.er[ek];
  }
  s.crit=clamp(s.crit,0,.8);s.dodge=clamp(s.dodge,0,.5);s.eco=clamp(s.eco,0,.5);
  for(var ei=0;ei<EL.length;ei++){var ek2=EL[ei];s.er[ek2]=Math.max(0,s.er[ek2]||1);}
  return s;
}
function gw(h){var w=h.equipment&&h.equipment.weapon;return w||{name:"Poings",wt:"physical",dmg:5,el:"Neutre"};}
function xpN(lv,r){return 80+lv*30+r*15;}


// NEW DAMAGE FORMULA: dmg × (1 + strBonus + vulnBonus) then × variance × crit × elemRes
// strBonus = attacker.str - 1 (e.g. str 1.06 → +0.06)
// vulnBonus = target.phv - 1 (e.g. phv 0.95 → -0.05)
// Combined: 1 + 0.06 + (-0.05) = 1.01, so dmg × 1.01
function pDmg(a,d,bd,el){
  var prec=.95;
  if(!roll(prec))return{dmg:0,msg:"RATÉ",hit:false,st:{bd:bd,wt:"physical",el:el,res:"miss",prec:prec}};
  var dg=d.stats?d.stats.dodge:(d.dodge||0);
  if(roll(dg))return{dmg:0,msg:"ESQUIVÉ",hit:false,st:{bd:bd,wt:"physical",el:el,res:"dodged",dg:dg}};
  var strB=(a.stats?a.stats.str:1)-1;
  var phvB=(d.stats?d.stats.phv:(d.phv||1))-1;
  var mult=1+strB+phvB;
  var v=variance(),cr=roll(a.stats?a.stats.crit:0);
  var eRes=d.er?(d.er[el]!=null?d.er[el]:1):1;
  var raw=bd*mult*v*(cr?3:1)*eRes;
  var dmg=Math.max(1,Math.round(raw));
  var msgs=[];if(cr)msgs.push("CRIT");if(eRes>1.01)msgs.push("FAIBLE");if(eRes<.99&&eRes>0)msgs.push("RÉSIST");if(eRes===0)msgs.push("IMMUN");
  return{dmg:dmg,msg:msgs.join(", "),hit:true,st:{bd:bd,wt:"physical",el:el,res:"hit",strB:strB,phvB:phvB,mult:mult,v:v,cr:cr,eRes:eRes,dmg:dmg}};
}
function mDmg(a,d,bd,el){
  var magB=(a.stats?a.stats.mag:1)-1;
  var mavB=(d.stats?d.stats.mav:(d.mav||1))-1;
  var mult=1+magB+mavB;
  var eRes=d.er?(d.er[el]!=null?d.er[el]:1):1;
  var raw=bd*mult*eRes;
  var dmg=Math.max(1,Math.round(raw));
  var msgs=[];if(eRes>1.01)msgs.push("FAIBLE");if(eRes<.99&&eRes>0)msgs.push("RÉSIST");if(eRes===0)msgs.push("IMMUN");
  return{dmg:dmg,msg:msgs.join(", "),hit:true,st:{bd:bd,wt:"magical",el:el,res:"hit",magB:magB,mavB:mavB,mult:mult,eRes:eRes,dmg:dmg}};
}
function spawn(fl,ti){
  var d=DG[ti],m=d.m*(1+fl*.08),boss=(fl+1)%5===0;
  var src=boss?BSS:ENM,n=boss?1:1+Math.floor(Math.random()*2);
  var out=[];for(var i=0;i<n;i++){var t=pick(src);var hpM=Math.floor(t.hp*m);
    out.push({name:t.name,icon:t.icon,uid:uid(),hpMax:hpM,hp:hpM,dmg:Math.floor(t.dmg*m),at:t.at,xp:Math.floor(t.xp*m),gold:Math.floor(t.gold*m),boss:t.boss||false,stats:{str:t.str,mag:t.mag,crit:t.crit,phv:t.phv,dodge:t.dodge,mav:t.mav},er:Object.assign({},t.er)});}
  return out;
}

// Color: for +/- stats. Positive STR/MAG = green, negative = yellow. Positive PHV/MAV (more vulnerable) = yellow, negative (tougher) = green.
function scPM(v,inv){var p=Math.round((v-1)*100);if(inv)return p<0?"#4ade80":p>0?"#facc15":"#ddddf4";return p>0?"#4ade80":p<0?"#facc15":"#ddddf4";}
function scPct(v){return v>.001?"#4ade80":"#ddddf4";}
function erc(v){return v===0?"#60a5fa":v<.99?"#4ade80":v>1.01?"#facc15":"#ddddf4";}

function ItemInfo(props){
  var it=props.item;if(!it)return null;var rc=(RA[it.rarity]||{}).c||"#888";
  var parts=[];var b=it.bon||{};
  if(b.str)parts.push("STR "+fmtB(b.str));if(b.mag)parts.push("MAG "+fmtB(b.mag));
  if(b.crit)parts.push("CRT +"+fmtPct(b.crit));if(b.hp)parts.push("PV +"+b.hp);if(b.mp)parts.push("PM +"+b.mp);
  if(b.phv)parts.push("PHV "+fmtB(b.phv));if(b.mav)parts.push("MAV "+fmtB(b.mav));
  if(b.dodge)parts.push("ESQ +"+fmtPct(b.dodge));if(b.rgHp)parts.push("RPV +"+fmtPct(b.rgHp));
  if(b.rgMp)parts.push("RPM +"+fmtPct(b.rgMp));if(b.eco)parts.push("EPM +"+fmtPct(b.eco));
  if(b.er)for(var ek in b.er)parts.push("Vuln "+ek+" "+fmtEV(1+b.er[ek]));
  var line1=it.name;
  if(it.dmg!=null){line1+=" ("+it.dmg+" "+(it.wt==="magical"?"MAG":"PHY");if(it.el&&it.el!=="Neutre")line1+=", "+((EM[it.el]||{}).i||"")+" "+it.el;line1+=")";}
  return(<div><div style={{fontWeight:600,fontSize:props.fs||14,color:rc}}>{line1}</div>
    {parts.length>0&&<div style={{fontSize:(props.fs||14)-2,color:"#4ade80",marginTop:1}}>{parts.join(", ")}</div>}</div>);
}

function StatRow(props){
  var val=props.val,type=props.type,suf=props.suf||"",nv=props.nv,tip=props.tip,hov=props.hov,onE=props.onE,onL=props.onL;
  var display,col;
  if(type==="flat"){display=String(val);col="#ddddf4";}
  else if(type==="pm"){display=fmtPM(val);col=scPM(val,false);}
  else if(type==="pmInv"){display=fmtPM(val);col=scPM(val,true);} // inverted: lower=green (vuln)
  else if(type==="pct"){display=fmtPct(val);col=scPct(val);}
  else{display=String(val);col="#ddddf4";}
  var nxt=null;
  if(nv!=null&&Math.abs(nv-val)>.0001){
    var nd;if(type==="flat")nd=String(Math.floor(nv));else if(type==="pm"||type==="pmInv")nd=fmtPM(nv);else nd=fmtPct(nv);
    var better=type==="pmInv"?nv<val:nv>val;nxt=" → "+nd;var nc=better?"#4ade80":"#facc15";
  }
  return(
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #ffffff08",position:"relative",cursor:tip?"help":"default"}} onMouseEnter={onE} onMouseLeave={onL}>
      <span style={{color:"#8888bb",fontSize:14}}>{props.icon} {props.label}</span>
      <span style={{fontFamily:"monospace",fontWeight:600,fontSize:14,color:col}}>{display}{suf}{nxt&&<span style={{marginLeft:6,color:nc}}>{nxt}</span>}</span>
      {hov&&tip&&(<div style={{position:"absolute",top:0,left:0,background:"#1a1818f0",border:"1px solid #c0392b60",borderRadius:8,padding:10,fontSize:12,fontFamily:"monospace",color:"#ccc",zIndex:50,transform:"translateY(-100%)",whiteSpace:"pre-line",minWidth:220,maxWidth:350}}>{tip}</div>)}
    </div>
  );
}


var INIT={gold:STARTING_GOLD,floors:0,roster:[],team:[null,null,null,null],inv:[],bl:{forge:0,rempart:0,autel:0,tour:0,ecole:0,mine:0,oracle:0,taverne:0}};

export default function Game(){
  var _g=useState(function(){try{var x=localStorage.getItem("ecl8");return x?JSON.parse(x):INIT;}catch(e){return INIT;}});var g=_g[0],setG=_g[1];
  var _tab=useState("base");var tab=_tab[0],setTab=_tab[1];
  var _dun=useState(null);var dun=_dun[0],setDun=_dun[1];
  var _logs=useState([]);var logs=_logs[0],setLogs=_logs[1];
  var _gr=useState(null);var gr=_gr[0],setGr=_gr[1];
  var _ga=useState(false);var ga=_ga[0],setGa=_ga[1];
  var _sel=useState(null);var sel=_sel[0],setSel=_sel[1];
  var _sheet=useState(null);var sheet=_sheet[0],setSheet=_sheet[1];
  var _au=useState(false);var au=_au[0],setAu=_au[1];
  var _tgt=useState(null);var tgt=_tgt[0],setTgt=_tgt[1];
  var _hl=useState(null);var hl=_hl[0],setHl=_hl[1];
  var _slv=useState(false);var slv=_slv[0],setSlv=_slv[1];
  var _hs=useState(null);var hs=_hs[0],setHs=_hs[1];
  var _drag=useState(null);var drag=_drag[0],setDrag=_drag[1];
  var _floats=useState([]);var floats=_floats[0],setFloats=_floats[1];
  var lr=useRef(null);

  useEffect(function(){var t=setTimeout(function(){try{localStorage.setItem("ecl8",JSON.stringify(g));}catch(e){}},500);return function(){clearTimeout(t);};},[g]);
  useEffect(function(){if(lr.current)lr.current.scrollTop=lr.current.scrollHeight;},[logs]);

  var team=useMemo(function(){return g.team.map(function(u){return u?g.roster.find(function(h){return h.uid===u;}):null;}).filter(Boolean);},[g.team,g.roster]);
  var sR=useMemo(function(){return[].concat(g.roster).sort(function(a,b){return b.rarity-a.rarity||b.level-a.level;});},[g.roster]);

  var gc=Math.max(20,Math.floor(150*(1-(g.bl.taverne||0)*.02)));
  function doInvoc(n){
    if(g.gold<gc*n)return;setGa(true);setGr(null);
    setTimeout(function(){
      var res=[],ros=[].concat(g.roster);
      for(var i=0;i<n;i++){
        var bon=(g.bl.oracle||0)*.004;var r=Math.random(),cum=0,rr=1;
        for(var j=5;j>=1;j--){cum+=Math.max(.01,RA[j].r+(j>=3?bon/3:-bon/2));if(r<cum){rr=j;break;}}
        var pool=HEROES.filter(function(h){return h.rarity===rr;});
        if(!pool.length)pool=HEROES.filter(function(h){return h.rarity<=rr;});
        if(!pool.length)pool=HEROES;
        var t=pick(pool);var ex=ros.find(function(h){return h.id===t.id;});
        if(ex){var xpg=t.rarity*15;ros=ros.map(function(h){return h.uid===ex.uid?Object.assign({},h,{xp:h.xp+xpg}):h;});res.push({h:t,dup:true,xp:xpg});}
        else{var sw=WP.find(function(w){return w.id===t.sw;});var wp=sw?Object.assign({},sw,{uid:uid()}):null;
          ros.push({id:t.id,uid:uid(),name:t.name,icon:t.icon,rarity:t.rarity,level:1,xp:0,equipment:{weapon:wp,armor:null,accessory:null,talisman:null}});res.push({h:t,dup:false});}
      }
      setG(function(p){return Object.assign({},p,{gold:p.gold-gc*n,roster:ros});});setGr(n===1?res[0]:res);setGa(false);
    },n>1?1800:1000);
  }

  function doLvUp(u){setG(function(p){var h=p.roster.find(function(r){return r.uid===u;});if(!h)return p;var n=xpN(h.level,h.rarity);if(h.xp<n)return p;return Object.assign({},p,{roster:p.roster.map(function(r){return r.uid===u?Object.assign({},r,{level:r.level+1,xp:r.xp-n}):r;})});});}
  function doTogTeam(u){setG(function(p){var i=p.team.indexOf(u);if(i>=0){var t=[].concat(p.team);t[i]=null;return Object.assign({},p,{team:t});}var s=p.team.indexOf(null);if(s>=0){var t=[].concat(p.team);t[s]=u;return Object.assign({},p,{team:t});}return p;});}
  // Drop hero into team slot (drag-and-drop)
  function dropInSlot(slotIdx){
    if(!drag)return;
    setG(function(p){
      var t=[].concat(p.team);
      // Remove from old slot if present
      var oldIdx=t.indexOf(drag);if(oldIdx>=0)t[oldIdx]=null;
      // If slot occupied, swap or remove
      if(t[slotIdx])t[slotIdx]=null;
      t[slotIdx]=drag;
      return Object.assign({},p,{team:t});
    });
    setDrag(null);
  }
  function doEquip(hu,iu){setG(function(p){var it=p.inv.find(function(i){return i.uid===iu;});var h=p.roster.find(function(r){return r.uid===hu;});if(!it||!h)return p;var inv=p.inv.filter(function(i){return i.uid!==iu;});var eq=Object.assign({},h.equipment);if(eq[it.slot])inv.push(eq[it.slot]);eq[it.slot]=it;return Object.assign({},p,{inv:inv,roster:p.roster.map(function(r){return r.uid===hu?Object.assign({},r,{equipment:eq}):r;})});});}
  function doUneq(hu,sl){setG(function(p){var h=p.roster.find(function(r){return r.uid===hu;});if(!h||!h.equipment[sl])return p;var nEq=Object.assign({},h.equipment);var old=nEq[sl];nEq[sl]=null;return Object.assign({},p,{inv:[].concat(p.inv,[old]),roster:p.roster.map(function(r){return r.uid!==hu?r:Object.assign({},r,{equipment:nEq});})});});}
  function doUpg(id){var u=BUP.find(function(b){return b.id===id;});var lv=g.bl[id]||0;if(!u||lv>=u.mx)return;var c=Math.floor(u.c0*Math.pow(u.cm,lv));if(g.gold<c)return;setG(function(p){var bl=Object.assign({},p.bl);bl[id]=lv+1;return Object.assign({},p,{gold:p.gold-c,bl:bl});});}
  function navSheet(dir){if(!sheet||sR.length<=1)return;var idx=sR.findIndex(function(h){return h.uid===sheet;});setSheet(sR[(idx+dir+sR.length)%sR.length].uid);setSlv(false);}

  function startDun(ti){
    if(!team.length)return;
    var t=team.map(function(h){var s=cs(h,g.bl);return Object.assign({},h,{hp:s.hp,mp:s.mp,stats:{str:s.str,mag:s.mag,crit:s.crit,phv:s.phv,dodge:s.dodge,mav:s.mav},hpMax:s.hp,mpMax:s.mp,isHero:true,er:s.er,rgHp:s.rgHp,rgMp:s.rgMp});});
    setDun({ti:ti,fl:-1,ph:"explore",team:t,en:[],rG:0,rX:0,bX:0,rE:[],tI:0,tO:[]});
    setLogs([{t:"🏰 "+DG[ti].name}]);setTab("donjon");setAu(false);setTgt(null);
  }
  function nxtFl(){
    if(!dun)return;var nf=dun.fl+1;
    if(nf>=DG[dun.ti].fl){endDun(true);return;}
    var t=dun.team.map(function(h){if(h.hp<=0)return h;return Object.assign({},h,{hp:Math.min(h.hpMax,h.hp+Math.floor(h.hpMax*(h.rgHp||0))),mp:Math.min(h.mpMax||0,h.mp+Math.floor((h.mpMax||0)*(h.rgMp||0)))});});
    if(nf>0&&Math.random()<.25){
      var ev=pick(EVT);var ex={};
      if(ev.tp==="heal")t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{hp:Math.min(h.hpMax,h.hp+Math.floor(h.hpMax*.25)),mp:Math.min(h.mpMax||0,h.mp+Math.floor((h.mpMax||0)*.15))});});
      if(ev.tp==="mpFull")t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{mp:h.mpMax||0});});
      if(ev.tp==="trap")t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{hp:Math.max(1,h.hp-Math.floor(h.hpMax*.12))});});
      if(ev.tp==="buff")t=t.map(function(h){return Object.assign({},h,{stats:Object.assign({},h.stats,{str:(h.stats.str||1)+.03})});});
      if(ev.tp==="gold")ex.rG=(dun.rG||0)+15+Math.floor(Math.random()*35);
      if(ev.tp==="xp")ex.bX=(dun.bX||0)+12;
      setDun(function(d){return Object.assign({},d,ex,{fl:nf,ph:"event",team:t});});setLogs(function(l){return l.concat([{t:ev.t}]);});return;
    }
    var en=spawn(nf,dun.ti);
    var ord=[].concat(t.filter(function(h){return h.hp>0;}).map(function(h){return h.uid;}),en.map(function(e){return e.uid;})).sort(function(){return Math.random()-.5;});
    setDun(function(d){return Object.assign({},d,{fl:nf,ph:"combat",team:t,en:en,tO:ord,tI:0});});setTgt(null);
    setLogs(function(l){return l.concat([{t:"⚔️ Étage "+(nf+1)+" — "+en.map(function(e){return e.icon+e.name+(e.boss?" (BOSS)":"");}).join(", ")}]);});
  }

  function doTurn(){
    if(!dun||dun.ph!=="combat")return;
    setDun(function(d){
      var t=d.team.map(function(h){return Object.assign({},h);});
      var en=d.en.map(function(e){return Object.assign({},e);});
      var tO=d.tO,tI=d.tI,rG=d.rG,rX=d.rX,rE=d.rE;
      var unit=null,isH=false;
      for(var i=0;i<tO.length;i++){var idx=(tI+i)%tO.length;var id=tO[idx];
        var hm=t.find(function(h){return h.uid===id&&h.hp>0;});if(hm){unit=hm;isH=true;tI=(idx+1)%tO.length;break;}
        var em=en.find(function(e){return e.uid===id&&e.hp>0;});if(em){unit=em;isH=false;tI=(idx+1)%tO.length;break;}
      }
      if(!unit)return d;
      // Regen HP/MP when it's a hero's turn
      if(isH&&unit.rgHp){var rh=Math.floor(unit.hpMax*(unit.rgHp||0));if(rh>0&&unit.hp<unit.hpMax){unit.hp=Math.min(unit.hpMax,unit.hp+rh);t=t.map(function(h){return h.uid===unit.uid?Object.assign({},h,{hp:unit.hp}):h;});setLogs(function(l){return l.concat([{t:"  ♻️ "+unit.name+" récupère "+rh+" PV"}]);});}}
      if(isH&&unit.rgMp){var rm=Math.floor((unit.mpMax||0)*(unit.rgMp||0));if(rm>0&&unit.mp<(unit.mpMax||0)){unit.mp=Math.min(unit.mpMax||0,unit.mp+rm);t=t.map(function(h){return h.uid===unit.uid?Object.assign({},h,{mp:unit.mp}):h;});}}
      if(isH){
        var ae=en.filter(function(e){return e.hp>0;});if(!ae.length)return d;
        var target=ae.find(function(e){return e.uid===tgt&&e.hp>0;})||pick(ae);
        var w=gw(unit);
        var res=w.wt==="magical"?mDmg(unit,target,w.dmg,w.el):pDmg(unit,target,w.dmg,w.el);
        var ln="  "+unit.icon+unit.name+" → "+target.icon+target.name;
        if(res.hit){target.hp-=res.dmg;en=en.map(function(e){return e.uid===target.uid?Object.assign({},e,{hp:target.hp}):e;});ln+=" : -"+res.dmg+"PV";if(res.msg)ln+=" ("+res.msg+")";
          setFloats(function(f){return f.concat([{uid:target.uid,val:"-"+res.dmg,color:res.st.cr?"#fbbf24":"#ffffff",id:uid()}]);});}
        else{ln+=" : "+res.msg;}
        setLogs(function(l){return l.concat([{t:ln,st:res.st}]);});
        if(target.hp<=0){setLogs(function(l){return l.concat([{t:"  💥 "+target.name+" vaincu! +"+target.xp+"xp +"+target.gold+"g"}]);});rX+=target.xp;rG+=target.gold;}
      }else{
        var ah=t.filter(function(h){return h.hp>0;});if(!ah.length)return d;
        var target=pick(ah);
        var res=unit.at==="magical"?mDmg({stats:unit.stats},target,unit.dmg,"Neutre"):pDmg({stats:unit.stats},target,unit.dmg,"Neutre");
        var ln="  "+unit.icon+unit.name+" → "+target.icon+target.name;
        if(res.hit){target.hp-=res.dmg;t=t.map(function(h){return h.uid===target.uid?Object.assign({},h,{hp:target.hp}):h;});ln+=" : -"+res.dmg+"PV";if(res.msg)ln+=" ("+res.msg+")";
          setFloats(function(f){return f.concat([{uid:target.uid,val:"-"+res.dmg,color:"#ffffff",id:uid()}]);});}
        else{ln+=" : "+res.msg;}
        setLogs(function(l){return l.concat([{t:ln,st:res.st}]);});
        if(target.hp<=0)setLogs(function(l){return l.concat([{t:"  ☠️ "+target.name+" tombe!"}]);});
      }
      if(t.every(function(h){return h.hp<=0;})){setLogs(function(l){return l.concat([{t:"💀 Défaite..."}]);});return Object.assign({},d,{team:t,en:en,rG:rG,rX:rX,ph:"result",tI:tI});}
      if(en.every(function(e){return e.hp<=0;})){
        var bon=Math.floor(15*DG[d.ti].rw);setLogs(function(l){return l.concat([{t:"✨ Victoire! +"+bon+"g"}]);});
        var eq=[].concat(rE);if(Math.random()<.2){var dr=Object.assign({},pick(ALL_EQ),{uid:uid()});eq.push(dr);setLogs(function(l){return l.concat([{t:"  🎁 "+dr.name+"!"}]);});}
        return Object.assign({},d,{team:t,en:en,rG:rG+bon,rX:rX,rE:eq,ph:"victory",tI:tI});}
      return Object.assign({},d,{team:t,en:en,tI:tI,rG:rG,rX:rX,rE:rE});
    });
  }
  function endDun(won){
    if(!dun)return;var mm=1+(g.bl.mine||0)*.03,xm=1+(g.bl.ecole||0)*.03;
    var tg=Math.floor(dun.rG*mm),tx=Math.floor((dun.rX+(dun.bX||0))*xm),fl=dun.fl+1;
    setG(function(p){return Object.assign({},p,{gold:p.gold+tg,floors:p.floors+fl,roster:p.roster.map(function(h){return p.team.indexOf(h.uid)>=0?Object.assign({},h,{xp:h.xp+tx}):h;}),inv:[].concat(p.inv,dun.rE||[])});});
    setLogs(function(l){return l.concat([{t:"─────────────"},{t:won?"🎉 TERMINÉ":"💀 Fin"},{t:"Or:+"+tg+" XP:+"+tx+" Ét:"+fl}]);});
    setDun(null);setAu(false);
  }
  useEffect(function(){
    if(!dun||dun.ph!=="combat")return;
    if(au){var t=setInterval(doTurn,400);return function(){clearInterval(t);};}
    var nextId=dun.tO[dun.tI%dun.tO.length];
    var isEnemy=dun.en.find(function(e){return e.uid===nextId&&e.hp>0;});
    if(isEnemy){var t=setTimeout(doTurn,350);return function(){clearTimeout(t);};}
  },[au,dun&&dun.ph,dun&&dun.tI,dun&&dun.fl]);
  useEffect(function(){if(!dun)return;if((dun.ph==="victory"||dun.ph==="event"||dun.ph==="explore")&&au){var t=setTimeout(nxtFl,700);return function(){clearTimeout(t);};};},[au,dun&&dun.ph,dun&&dun.fl]);
  // Clean floating damage numbers after 1s
  useEffect(function(){if(!floats.length)return;var t=setTimeout(function(){setFloats(function(f){return f.slice(1);});},500);return function(){clearTimeout(t);};},[floats.length]);
  function reset(){localStorage.removeItem("ecl8");setG(INIT);setDun(null);setLogs([]);setTab("base");setAu(false);setSheet(null);setFloats([]);}

  var css='@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap");:root{--bg:#0e0d0d;--bg2:#141313;--card:#1c1a1a;--brd:#3a2828;--t:#e0d8d0;--td:#8a7e76;--acc:#c0392b;--red:#e74c3c;--gold:#d4a017}*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);background-image:url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'60\' height=\'60\' fill=\'%230e0d0d\'/%3E%3Crect x=\'0\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'12\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'36\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3C/svg%3E");color:var(--t);font-family:"DM Sans",sans-serif;font-size:14px}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--brd);border-radius:3px}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes gw{0%,100%{box-shadow:0 0 6px #c0392b20}50%{box-shadow:0 0 18px #c0392b50}}@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes glw{0%,100%{box-shadow:0 0 4px #22c55e40}50%{box-shadow:0 0 16px #22c55e90}}@keyframes arr{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.b{padding:8px 16px;border:1px solid var(--brd);border-radius:10px;cursor:pointer;font-family:inherit;font-weight:600;font-size:13px;transition:all .15s;background:var(--card);color:var(--t)}.b:hover{background:#2a2222;transform:translateY(-1px)}.b:active{transform:translateY(0)}.b:disabled{opacity:.3;cursor:not-allowed;transform:none}.bg{background:linear-gradient(135deg,#c0392b,#962d22);color:#fff;border:none;font-weight:700}.bg:hover{background:linear-gradient(135deg,#d44637,#b03426)}.br{background:linear-gradient(135deg,#8b1a1a,#6b1414);color:#fff;border:none}.bgr{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none}.ton{background:var(--acc)!important;color:#fff!important;border-color:var(--acc)!important}.glow{animation:glw 1.5s infinite}@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}';

  function Bar(props){var cur=props.cur,max=props.max,color=props.color||"#22c55e",h=props.h||10,label=props.label!==false;var p=clamp(cur/Math.max(1,max)*100,0,100);return(<div style={{position:"relative",width:"100%",height:h,background:"#0a0a18",borderRadius:h/2,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",borderRadius:h/2,background:"linear-gradient(90deg,"+color+"cc,"+color+")",transition:"width .3s"}}/>{label&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(9,h-2),fontWeight:700,color:"#fff",textShadow:"0 1px 1px #000a",fontFamily:"monospace"}}>{cur}/{max}</span>}</div>);}
  function turnPos(u){if(!dun||!dun.tO)return null;var alive=dun.tO.filter(function(id){return(dun.team.find(function(h){return h.uid===id&&h.hp>0;})||dun.en.find(function(e){return e.uid===id&&e.hp>0;}));});return alive.indexOf(u)+1||null;}
  function Unit(props){var u=props.u,isE=props.isE,act=props.act,isSel=props.sel,onClick=props.onClick;var hp=u.hp||0,hm=u.hpMax||1;var tp=turnPos(u.uid);
    var myFloats=floats.filter(function(f){return f.uid===u.uid;});
    var pSrc=!isE?portrait(u.id):null;
    return(<div onClick={onClick} style={{padding:10,borderRadius:12,minWidth:95,textAlign:"center",cursor:onClick?"pointer":"default",background:isSel?"#ffffff18":act?"#ffffff0c":"#ffffff05",border:isSel?"2px solid #fbbf24":act?"2px solid #c0392b60":"1px solid #ffffff0a",opacity:hp<=0?.2:1,transition:"all .2s",position:"relative"}}>{tp&&hp>0&&<div style={{position:"absolute",top:-6,right:-6,background:act?"#c0392b":"#444",color:act?"#fff":"#ddd",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{tp}</div>}
      {myFloats.map(function(f){return <div key={f.id} style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",color:f.color,fontSize:18,fontWeight:900,textShadow:"0 2px 4px #000",animation:"floatUp .7s forwards",pointerEvents:"none",zIndex:20}}>{f.val}</div>;})}
      <div style={{width:36,height:36,borderRadius:8,margin:"0 auto",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,background:"#111"}}>
        <span style={{position:"absolute",zIndex:1}}>{u.icon}</span>
        {pSrc&&<img src={pSrc} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:2}} alt="" onError={function(e){e.target.style.display="none";}}/>}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:isE?"#ff6b6b":"#6bffb8",marginTop:2}}>{u.name}</div>{u.boss&&<div style={{fontSize:10,color:"#c0392b",fontWeight:800}}>BOSS</div>}<div style={{marginTop:4}}><Bar cur={Math.max(0,hp)} max={hm} color={isE?"#ef4444":"#22c55e"} h={8}/></div></div>);}

  var inD=!!dun;var selH=sel?g.roster.find(function(r){return r.uid===sel;}):null;

  // Portrait helper — img with onError setting src to empty + showing emoji behind
  function Portrait(props){var id=props.id,size=props.size||64,fs=props.fs||36;var src=portrait(id);
    if(props.canLv)return <div style={{width:size,height:size,borderRadius:14,background:"#111",border:"2px solid #22c55e60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs,flexShrink:0,animation:"arr 1s infinite, glw 1.5s infinite"}}>⬆️</div>;
    return <div style={{width:size,height:size,borderRadius:14,background:"#111",border:"2px solid #ffffff20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs,flexShrink:0,position:"relative",overflow:"hidden"}}>
      <span style={{position:"absolute",zIndex:1}}>{props.icon||"?"}</span>
      {src&&<img src={src} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:2}} alt="" onError={function(e){e.target.style.display="none";}}/>}
    </div>;
  }

  /* ─── CHARACTER SHEET ─── */
  if(sheet&&!inD){
    var hero=g.roster.find(function(h){return h.uid===sheet;});
    if(!hero)setSheet(null);
    if(hero){
      var ht=HEROES.find(function(h){return h.id===hero.id;});
      var st=cs(hero,g.bl);var w=gw(hero);var rc=(RA[hero.rarity]||{}).c||"#888";
      var xn=xpN(hero.level,hero.rarity);var canLv=hero.xp>=xn;
      var inTeam=g.team.indexOf(hero.uid)>=0;
      var atkEl=w.el&&w.el!=="Neutre"?w.el:null;
      function mkTip(key){var arr=st._s[key];if(!arr||!arr.length)return null;var total=key==="hp"||key==="mp"?st[key]:fmtPM(st[key]);return arr.join("\n")+"\n= "+total;}

      if(slv&&canLv){
        var sN=cs(Object.assign({},hero,{level:hero.level+1}),g.bl);
        return(<div style={{minHeight:"100vh",background:"var(--bg)",padding:"16px 12px",maxWidth:540,margin:"0 auto"}}><style>{css}</style>
          <div style={{animation:"fi .3s ease",background:"var(--card)",borderRadius:14,padding:24,border:"2px solid #c0392b",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:8}}>⬆️</div>
            <div style={{fontFamily:"Cinzel",fontSize:22,fontWeight:800,color:"#c0392b"}}>Niveau {hero.level} → {hero.level+1}</div>
            <div style={{fontSize:15,color:"#8888bb",marginTop:4,marginBottom:16}}>{hero.name}</div>
            <div style={{textAlign:"left",maxWidth:360,margin:"0 auto"}}>
              <StatRow icon="❤️" label="PV Max (PVM)" val={st.hp} nv={sN.hp} type="flat"/>
              <StatRow icon="💧" label="PM Max (PMM)" val={st.mp} nv={sN.mp} type="flat"/>
              <StatRow icon="⚔️" label="Force (STR)" val={st.str} nv={sN.str} type="pm"/>
              <StatRow icon="🔮" label="Magie (MAG)" val={st.mag} nv={sN.mag} type="pm"/>
              <StatRow icon="💥" label="Critique (CRT)" val={st.crit} nv={sN.crit} type="pct"/>
              <StatRow icon="🛡️" label="Vuln. Physique (PHV)" val={st.phv} nv={sN.phv} type="pmInv"/>
              <StatRow icon="🔰" label="Vuln. Magique (MAV)" val={st.mav} nv={sN.mav} type="pmInv"/>
              <StatRow icon="💨" label="Esquive (ESQ)" val={st.dodge} nv={sN.dodge} type="pct"/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"center"}}>
              <button className="b bgr glow" onClick={function(){doLvUp(hero.uid);setSlv(false);}} style={{padding:"10px 28px",fontSize:15}}>✓ Confirmer</button>
              <button className="b" onClick={function(){setSlv(false);}} style={{fontSize:13}}>Annuler</button>
            </div>
          </div>
        </div>);
      }

      return(<div style={{minHeight:"100vh",background:"var(--bg)",padding:"16px 12px",maxWidth:540,margin:"0 auto"}}><style>{css}</style>
        <div style={{animation:"fi .3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <button className="b" onClick={function(){setSheet(null);setSlv(false);}} style={{fontSize:13}}>← Retour</button>
            <div style={{display:"flex",gap:6}}><button className="b" onClick={function(){navSheet(-1);}} disabled={sR.length<=1} style={{fontSize:15,padding:"6px 14px"}}>◀</button><button className="b" onClick={function(){navSheet(1);}} disabled={sR.length<=1} style={{fontSize:15,padding:"6px 14px"}}>▶</button></div>
          </div>
          <div style={{background:"linear-gradient(145deg,"+rc+"18,"+rc+"08)",border:"1px solid "+rc+"50",borderRadius:16,padding:18,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <Portrait id={hero.id} size={80} fs={40} icon={hero.icon}/>
              <div><div style={{fontSize:22,fontWeight:800,fontFamily:"Cinzel"}}>{hero.name}</div><div style={{fontSize:13,color:"#8888bb"}}>{ht?ht.title:""}</div><span style={{fontSize:13,color:rc,fontWeight:700}}>{(RA[hero.rarity]||{}).s} {(RA[hero.rarity]||{}).n}</span></div>
            </div>
            {ht&&ht.lore&&<div style={{fontSize:12,color:"#7777aa",marginTop:10,fontStyle:"italic",lineHeight:1.6}}>{ht.lore}</div>}
          </div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700,fontSize:16}}>Niveau {hero.level}</span><span style={{fontSize:13,color:"#8888bb",fontFamily:"monospace"}}>XP {hero.xp}/{xn}</span></div>
            <div style={{height:7,background:"#0a0a18",borderRadius:4,overflow:"hidden",marginBottom:8}}><div style={{width:clamp(hero.xp/xn*100,0,100)+"%",height:"100%",background:"#a855f7",transition:"width .3s"}}/></div>
            <div style={{display:"flex",gap:6}}>
              <button className={"b "+(canLv?"bgr glow":"")} disabled={!canLv} onClick={function(){setSlv(true);}} style={{flex:1,fontSize:14,fontWeight:canLv?800:600}}>⬆ Monter de niveau</button>
            </div>
          </div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"var(--acc)"}}>Caractéristiques</div>
            <StatRow icon="❤️" label="PV Max (PVM)" val={st.hp} type="flat" tip={mkTip("hp")} hov={hs==="hp"} onE={function(){setHs("hp");}} onL={function(){setHs(null);}}/>
            <StatRow icon="💧" label="PM Max (PMM)" val={st.mp} type="flat" tip={mkTip("mp")} hov={hs==="mp"} onE={function(){setHs("mp");}} onL={function(){setHs(null);}}/>
            <div style={{height:6}}/>
            <StatRow icon="⚔️" label="Force (STR)" val={st.str} type="pm" tip={mkTip("str")} hov={hs==="str"} onE={function(){setHs("str");}} onL={function(){setHs(null);}}/>
            <StatRow icon="🔮" label="Magie (MAG)" val={st.mag} type="pm" tip={mkTip("mag")} hov={hs==="mag"} onE={function(){setHs("mag");}} onL={function(){setHs(null);}}/>
            <StatRow icon="💥" label="Critique (CRT)" val={st.crit} type="pct" tip={mkTip("crit")} hov={hs==="crit"} onE={function(){setHs("crit");}} onL={function(){setHs(null);}}/>
            <div style={{height:6}}/>
            <StatRow icon="🛡️" label="Vuln. Physique (PHV)" val={st.phv} type="pmInv" tip={mkTip("phv")} hov={hs==="phv"} onE={function(){setHs("phv");}} onL={function(){setHs(null);}}/>
            <StatRow icon="🔰" label="Vuln. Magique (MAV)" val={st.mav} type="pmInv" tip={mkTip("mav")} hov={hs==="mav"} onE={function(){setHs("mav");}} onL={function(){setHs(null);}}/>
            <StatRow icon="💨" label="Esquive (ESQ)" val={st.dodge} type="pct" tip={mkTip("dodge")} hov={hs==="dodge"} onE={function(){setHs("dodge");}} onL={function(){setHs(null);}}/>
            <div style={{height:6}}/>
            <StatRow icon="♻️" label="Regen PV (RPV)" val={st.rgHp} type="pct" suf="/tour" tip={mkTip("rgHp")} hov={hs==="rgHp"} onE={function(){setHs("rgHp");}} onL={function(){setHs(null);}}/>
            <StatRow icon="♻️" label="Regen PM (RPM)" val={st.rgMp} type="pct" suf="/tour" tip={mkTip("rgMp")} hov={hs==="rgMp"} onE={function(){setHs("rgMp");}} onL={function(){setHs(null);}}/>
            <StatRow icon="📉" label="Économie PM (EPM)" val={st.eco} type="pct" tip={mkTip("eco")} hov={hs==="eco"} onE={function(){setHs("eco");}} onL={function(){setHs(null);}}/>
          </div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"var(--acc)"}}>Sensibilités Élémentaires</div>
            <div style={{fontSize:13,color:"#8888bb",fontWeight:600,marginBottom:4}}>🗡️ Attaque</div>
            <div style={{padding:"5px 0",fontSize:14,borderBottom:"1px solid #ffffff08",marginBottom:8}}>
              Élément : {atkEl?<span style={{color:(EM[atkEl]||{}).c,fontWeight:700}}>{(EM[atkEl]||{}).i} {atkEl}</span>:<span style={{color:"#666"}}>Neutre</span>}
              <span style={{fontSize:12,color:"#666",marginLeft:6}}>({w.name})</span>
            </div>
            <div style={{fontSize:13,color:"#8888bb",fontWeight:600,marginBottom:4}}>🛡️ Vulnérabilités</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 16px"}}>
              {EL.map(function(el){var v=st.er[el]!=null?st.er[el]:1;var c=erc(v);
                return <div key={el} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:14}}>
                  <span style={{color:"#8888bb"}}>{(EM[el]||{}).i} {el}</span>
                  <span style={{fontFamily:"monospace",fontWeight:600,color:c}}>{fmtEV(v)}</span>
                </div>;
              })}
            </div>
          </div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"var(--acc)"}}>Équipement</div>
            {["weapon","armor","accessory","talisman"].map(function(sl){var it=hero.equipment?hero.equipment[sl]:null;var lb=sl==="weapon"?"🗡️ Arme":sl==="armor"?"🛡️ Armure":sl==="accessory"?"💍 Accessoire":"🔮 Talisman";
              return <div key={sl} style={{padding:"5px 0",borderBottom:"1px solid #ffffff08"}}><span style={{fontSize:14,color:"#8888bb"}}>{lb}: </span>{it?<ItemInfo item={it} fs={14}/>:<span style={{fontSize:14,color:"#444"}}>— vide —</span>}</div>;
            })}
          </div>
        </div>
      </div>);
    }
  }

  var TM={base:"🏰 Base",roster:"👥 Héros",equip:"⚙️ Équip.",donjon:"⚔️ Donjon",invocation:"🎲 Invoc."};

  return(<div style={{minHeight:"100vh",background:"var(--bg)",padding:"12px 8px",maxWidth:900,margin:"0 auto"}}><style>{css}</style>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:14,marginBottom:10,border:"1px solid var(--brd)"}}>
      <h1 style={{fontFamily:"Cinzel",fontSize:20,fontWeight:900,color:"var(--acc)",textShadow:"0 0 12px #c0392b30"}}>⚔️ ECLIPSIA</h1>
      <div style={{display:"flex",gap:14,fontSize:15,fontWeight:600}}><span>💰 {g.gold.toLocaleString()}</span><span style={{fontSize:12,color:"var(--td)"}}>🏔️ {g.floors}</span></div>
    </div>
    <div style={{display:"flex",gap:4,marginBottom:10}}>{Object.keys(TM).map(function(k){return <button key={k} className={"b "+(tab===k?"ton":"")} onClick={function(){if(!inD||k==="donjon")setTab(k);}} style={{fontSize:13,flex:1,opacity:inD&&k!=="donjon"?.3:1}}>{TM[k]}</button>;})}
      <button className="b" onClick={reset} style={{fontSize:10,color:"var(--red)",minWidth:40}}>🔄</button>
    </div>

    {tab==="base"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:10}}>🏰 Base</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>{BUP.map(function(u){var lv=g.bl[u.id]||0,c=Math.floor(u.c0*Math.pow(u.cm,lv)),mx=lv>=u.mx;
        return <div key={u.id} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:22}}>{u.ic}</span><span style={{fontSize:13,color:"var(--acc)",fontWeight:700}}>Nv.{lv}/{u.mx}</span></div>
          <div style={{fontWeight:700,fontSize:14,marginTop:4}}>{u.name}</div><div style={{fontSize:12,color:"var(--td)",marginTop:2}}>{u.desc}</div>
          <div style={{height:3,background:"#080810",borderRadius:2,overflow:"hidden",marginTop:6}}><div style={{width:(lv/u.mx*100)+"%",height:"100%",background:"var(--acc)",transition:"width .3s"}}/></div>
          <button className="b bg" disabled={g.gold<c||mx} onClick={function(){doUpg(u.id);}} style={{width:"100%",marginTop:6,fontSize:13}}>{mx?"MAX":c.toLocaleString()+"g"}</button>
        </div>;})}</div>
    </div>}

    {tab==="roster"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:4}}>👥 Héros ({g.roster.length})</h2>
      <div style={{fontSize:13,color:"var(--td)",marginBottom:10}}>Glissez un héros dans un emplacement d'équipe</div>
      {/* TEAM SLOTS — large detailed cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:16}}>
        {[0,1,2,3].map(function(i){
          var h=g.team[i]?g.roster.find(function(r){return r.uid===g.team[i];}):null;
          var canL=h&&h.xp>=xpN(h.level,h.rarity);
          var hst=h?cs(h,g.bl):null;
          return <div key={i}
            draggable={!!h}
            onDragStart={function(){if(h)setDrag(h.uid);}}
            onDragOver={function(e){e.preventDefault();}}
            onDrop={function(){dropInSlot(i);}}
            onClick={function(){if(h)setSheet(h.uid);}}
            style={{minHeight:140,borderRadius:14,padding:10,background:h?(RA[h.rarity]||{}).c+"12":"#ffffff04",border:h?"2px solid "+(RA[h.rarity]||{}).c+"50":"2px dashed var(--brd)",cursor:h?"pointer":"default",transition:"all .2s"}}>
            {h&&hst?<div style={{position:"relative"}}>
              <div style={{position:"absolute",top:0,right:0,fontSize:26,fontWeight:900,color:(RA[h.rarity]||{}).c+"80",fontFamily:"Cinzel"}}>{h.level}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <Portrait id={h.id} size={48} fs={24} icon={h.icon} canLv={canL}/>
                <div><div style={{fontWeight:700,fontSize:14}}>{h.name}</div><div style={{fontSize:12,color:(RA[h.rarity]||{}).c,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
              </div>
              <div style={{fontSize:12,lineHeight:1.5}}>
                <div>❤️ {hst.hp} &nbsp; 💧 {hst.mp}</div>
                <div style={{color:scPM(hst.str,false)}}>⚔️ STR {fmtPM(hst.str)} &nbsp; <span style={{color:scPM(hst.mag,false)}}>🔮 MAG {fmtPM(hst.mag)}</span></div>
                <div style={{color:scPM(hst.phv,true)}}>🛡️ PHV {fmtPM(hst.phv)} &nbsp; <span style={{color:scPM(hst.mav,true)}}>🔰 MAV {fmtPM(hst.mav)}</span></div>
              </div>
            </div>:<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:120,color:"#444",fontSize:14}}>Emplacement vide</div>}
          </div>;
        })}
      </div>
      {/* RESERVE — smaller cards, draggable. Also drop zone to remove from team */}
      <div style={{fontSize:13,color:"var(--td)",marginBottom:6}}>Réserve (glissez ici pour retirer de l'équipe)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6,minHeight:50,border:"2px dashed #ffffff10",borderRadius:10,padding:6}}
        onDragOver={function(e){e.preventDefault();}}
        onDrop={function(){if(drag){setG(function(p){var idx=p.team.indexOf(drag);if(idx>=0){var t=[].concat(p.team);t[idx]=null;return Object.assign({},p,{team:t});}return p;});setDrag(null);}}}>
        {sR.filter(function(h){return g.team.indexOf(h.uid)<0;}).map(function(h){
          var rc=(RA[h.rarity]||{}).c;var canL=h.xp>=xpN(h.level,h.rarity);
          return <div key={h.uid} draggable
            onDragStart={function(){setDrag(h.uid);}}
            onClick={function(){setSheet(h.uid);}}
            style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:8,cursor:"grab"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:canL?16:22,animation:canL?"arr 1s infinite, glw 1.5s infinite":undefined}}>{canL?"⬆️":h.icon}</span>
              <div><div style={{fontWeight:700,fontSize:12}}>{h.name} <span style={{fontSize:10,color:"var(--td)"}}>Lv.{h.level}</span></div><div style={{fontSize:10,color:rc}}>{(RA[h.rarity]||{}).s}</div></div>
            </div>
          </div>;
        })}
      </div>
      {!g.roster.length&&<div style={{textAlign:"center",padding:40,color:"var(--td)",fontSize:14}}>Pas de héros — Invoc. !</div>}
    </div>}

    {tab==="equip"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:8}}>⚙️ Équipement</h2>
      {/* Team heroes as big cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:10}}>
        {[0,1,2,3].map(function(i){
          var h=g.team[i]?g.roster.find(function(r){return r.uid===g.team[i];}):null;
          if(!h)return <div key={i} style={{minHeight:60,borderRadius:12,border:"2px dashed var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",color:"#444",fontSize:12}}>Vide</div>;
          var hst=cs(h,g.bl);var rc=(RA[h.rarity]||{}).c;var isSel=sel===h.uid;
          return <div key={i} onClick={function(){setSel(sel===h.uid?null:h.uid);}} style={{borderRadius:14,padding:10,background:isSel?rc+"25":rc+"12",border:isSel?"2px solid "+rc:"2px solid "+rc+"50",cursor:"pointer",position:"relative"}}>
            <div style={{position:"absolute",top:6,right:10,fontSize:24,fontWeight:900,color:rc+"90",fontFamily:"Cinzel"}}>{h.level}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <Portrait id={h.id} size={42} fs={22} icon={h.icon}/>
              <div><div style={{fontWeight:700,fontSize:14}}>{h.name}</div><div style={{fontSize:11,color:rc,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
            </div>
            <div style={{fontSize:11,lineHeight:1.4}}>
              <span>❤️{hst.hp} 💧{hst.mp}</span>
              <span style={{marginLeft:8,color:scPM(hst.str,false)}}>STR {fmtPM(hst.str)}</span>
              <span style={{marginLeft:6,color:scPM(hst.phv,true)}}>PHV {fmtPM(hst.phv)}</span>
            </div>
          </div>;
        })}
      </div>
      {/* Reserve heroes as small buttons */}
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {sR.filter(function(h){return g.team.indexOf(h.uid)<0;}).map(function(h){
          return <button key={h.uid} className={"b "+(sel===h.uid?"ton":"")} onClick={function(){setSel(sel===h.uid?null:h.uid);}} style={{fontSize:11}}>{h.icon} {h.name}</button>;
        })}
      </div>
      {selH&&<div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:8,border:"1px solid var(--brd)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:14}}>{selH.icon} {selH.name}</div>
          <button className="b" onClick={function(){setSheet(selH.uid);}} style={{fontSize:11,padding:"4px 10px"}}>📋 Profil</button>
        </div>
        {["weapon","armor","accessory","talisman"].map(function(sl){var it=selH.equipment?selH.equipment[sl]:null;var lb=sl==="weapon"?"🗡️ Arme":sl==="armor"?"🛡️ Armure":sl==="accessory"?"💍 Acc.":"🔮 Talis.";
          return <div key={sl} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px",background:"#ffffff06",borderRadius:8,marginBottom:4}}>
            <div style={{flex:1}}><span style={{color:"var(--td)",fontSize:13}}>{lb}: </span>{it?<ItemInfo item={it} fs={13}/>:<span style={{color:"#444",fontSize:13}}>vide</span>}</div>
            {it&&<button className="b" style={{fontSize:10,padding:"3px 6px",marginLeft:8}} onClick={function(){doUneq(selH.uid,sl);}}>×</button>}</div>;
        })}
      </div>}
      <h3 style={{fontSize:14,color:"var(--td)",marginBottom:6}}>Inventaire ({g.inv.length})</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:6}}>
        {g.inv.sort(function(a,b){var so={weapon:0,armor:1,accessory:2,talisman:3};var sa=so[a.slot]||0,sb=so[b.slot]||0;return sa-sb||b.rarity-a.rarity;}).map(function(it){var slN=it.slot==="weapon"?"Arme":it.slot==="armor"?"Armure":it.slot==="accessory"?"Accessoire":"Talisman";
          return <div key={it.uid} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:10,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"var(--td)",marginBottom:2}}>{slN} · {(RA[it.rarity]||{}).s}</div><ItemInfo item={it} fs={13}/>
            </div>
            {sel&&<button className="b bgr" style={{fontSize:11,width:"100%",marginTop:8}} onClick={function(){doEquip(sel,it.uid);}}>Équiper</button>}</div>;
        })}
      </div>
      {!g.inv.length&&<div style={{textAlign:"center",padding:20,color:"var(--td)",fontSize:12}}>Vide !</div>}
    </div>}

    {tab==="donjon"&&<div style={{animation:"fi .3s ease"}}>
      {!dun&&<div><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:4}}>⚔️ Donjons</h2><div style={{fontSize:13,color:"var(--td)",marginBottom:8}}>Équipe: {team.length}/4</div>
        {DG.map(function(d,i){var lk=g.floors<d.ul;return <div key={i} style={{background:lk?"#08080e":"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:12,marginBottom:6,opacity:lk?.3:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:700,fontSize:15}}>{d.name}</div><div style={{fontSize:11,color:"var(--td)"}}>{d.fl} ét. · ×{d.m} · ×{d.rw} réc</div></div>
            <button className="b br" disabled={lk||!team.length} onClick={function(){startDun(i);}} style={{fontSize:13}}>{lk?"🔒 "+d.ul:"Explorer"}</button></div></div>;})}
      </div>}
      {dun&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div><h2 style={{fontFamily:"Cinzel",fontSize:16,color:"var(--acc)"}}>{DG[dun.ti].name}</h2><div style={{fontSize:12,color:"var(--td)"}}>Ét.{dun.fl+1}/{DG[dun.ti].fl} · 💰{dun.rG} · ⭐{dun.rX}</div></div>
          <button className="b br" onClick={function(){endDun(false);setAu(false);}} style={{fontSize:12}}>🚪 Fuir</button>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:12,padding:10,marginBottom:6,border:"1px solid var(--brd)",minHeight:200}}>
          {dun.ph==="combat"&&<div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>{dun.en.map(function(e){return <Unit key={e.uid} u={e} isE act={dun.tO[dun.tI%dun.tO.length]===e.uid} sel={tgt===e.uid} onClick={e.hp>0?function(){setTgt(e.uid);}:undefined}/>;})}</div>
            <div style={{textAlign:"center",fontSize:14,color:"#333",margin:"2px 0"}}>— VS —</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>{dun.team.map(function(h){return <Unit key={h.uid} u={h} act={dun.tO[dun.tI%dun.tO.length]===h.uid}/>;})}</div>
          </div>}
          {dun.ph==="result"&&<div style={{textAlign:"center",padding:20}}><div style={{fontSize:18,fontWeight:700,color:"var(--red)"}}>💀 Défaite</div><button className="b bg" onClick={function(){endDun(false);}} style={{marginTop:8}}>Retour</button></div>}
          {dun.ph==="event"&&<div style={{textAlign:"center",padding:20}}><div style={{fontSize:15}}>Événement !</div></div>}
          {dun.ph==="victory"&&<div style={{textAlign:"center",padding:20}}><div style={{fontSize:16,fontWeight:700,color:"#c0392b"}}>✨ Victoire !</div></div>}
          {dun.ph==="explore"&&<div style={{textAlign:"center",padding:20}}><div style={{fontSize:15,color:"var(--td)"}}>Prêt à explorer...</div></div>}
        </div>
        {dun.ph==="combat"&&<div style={{display:"flex",gap:4,marginBottom:6}}>
          <button className="b bg" onClick={doTurn} style={{flex:1,fontSize:14}}>⚔️ Attaque</button>
          <button className={"b "+(au?"br":"")} onClick={function(){setAu(!au);}} style={{flex:1,fontSize:14}}>{au?"⏸ Stop":"▶️ Auto"}</button>
        </div>}
        {(dun.ph==="victory"||dun.ph==="event"||dun.ph==="explore")&&<button className="b bg" onClick={nxtFl} style={{width:"100%",marginBottom:6,fontSize:14}}>➡️ {dun.ph==="explore"?"Commencer":"Continuer"}</button>}
        <div ref={lr} style={{background:"#050510",borderRadius:10,padding:8,maxHeight:200,overflowY:"auto",fontFamily:"monospace",fontSize:12,lineHeight:1.6,border:"1px solid var(--brd)",position:"relative"}}>
          {logs.map(function(l,i){var txt=l.t||"";
            var col;
            if(txt.indexOf("CRIT")>=0)col="#fbbf24"; // crit = yellow/gold
            else if(txt.indexOf("RATÉ")>=0||txt.indexOf("ESQUIVÉ")>=0||txt.indexOf("IMMUN")>=0||txt.indexOf(": -0")>=0)col="#ef4444"; // miss/dodge/0 = red
            else if(txt.indexOf("💥")>=0||txt.indexOf("☠️")>=0)col="#ff8888"; // kills
            else if(txt.indexOf("✨")>=0||txt.indexOf("🎉")>=0||txt.indexOf("🏕️")>=0||txt.indexOf("⛲")>=0||txt.indexOf("🔮")>=0||txt.indexOf("💰")>=0||txt.indexOf("📚")>=0||txt.indexOf("🎁")>=0)col="#4ade80"; // events = green
            else if(txt.indexOf("⚠️")>=0||txt.indexOf("💀")>=0)col="#ef4444"; // trap/defeat = red
            else col="#ddddf4"; // normal attacks = white (large)
            return <div key={i} style={{color:col,position:"relative",cursor:l.st?"help":"default",padding:"1px 0"}}
              onMouseEnter={function(){if(l.st)setHl(i);}} onMouseLeave={function(){setHl(null);}}>
              {txt}
              {hl===i&&l.st&&<div style={{position:"absolute",zIndex:100,background:"#1a1818f0",border:"1px solid #c0392b60",borderRadius:10,padding:10,fontSize:12,fontFamily:"monospace",color:"#ccc",width:360,pointerEvents:"none",top:0,left:0,transform:"translateY(-100%)",whiteSpace:"pre-line"}}>
                <div style={{fontWeight:700,color:"#c0392b",marginBottom:6,fontSize:13}}>Détail du calcul</div>
                {l.st.res==="miss"&&"Précision "+Math.round((l.st.prec||.95)*100)+"% → Raté !"}
                {l.st.res==="dodged"&&"Esquive "+Math.round((l.st.dg||0)*100)+"% → Esquivé !"}
                {l.st.res==="hit"&&<div>
                  {"Dégâts "+(l.st.wt==="magical"?"du sort":"de l'arme")+" : "+l.st.bd+" ("+(l.st.wt==="magical"?"magique":"physique")+")\n"}
                  {l.st.strB!=null&&"STR attaquant : "+fmtPM(l.st.strB+1)+"\n"}
                  {l.st.magB!=null&&"MAG attaquant : "+fmtPM(l.st.magB+1)+"\n"}
                  {l.st.phvB!=null&&"PHV cible : "+fmtPM(l.st.phvB+1)+"\n"}
                  {l.st.mavB!=null&&"MAV cible : "+fmtPM(l.st.mavB+1)+"\n"}
                  {"Multiplicateur combiné : "+fmtPM(l.st.mult)+"\n"}
                  {l.st.v!=null&&"Variance : "+Math.round(l.st.v*100)+"%\n"}
                  {l.st.cr&&"Critique : ×3\n"}
                  {l.st.eRes!=null&&l.st.eRes!==1&&("Vuln. élém. ("+l.st.el+") : "+fmtEV(l.st.eRes)+"\n")}
                  {"= "+l.st.dmg+" dégâts"}
                </div>}
              </div>}
            </div>;
          })}
        </div>
      </div>}
    </div>}

    {tab==="invocation"&&<div style={{animation:"fi .3s ease",textAlign:"center"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:4}}>🎲 Invocation</h2>
      <div style={{fontSize:13,color:"var(--td)",marginBottom:12}}>Coût: {gc}g · Oracle Nv.{g.bl.oracle||0}</div>
      <div style={{width:140,height:140,margin:"0 auto 16px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,background:"radial-gradient(circle,#c0392b12,transparent)",border:"2px solid var(--acc)",animation:ga?"sp .5s linear infinite":"gw 3s infinite"}}>{ga?"✨":"🎲"}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
        <button className="b bg" disabled={g.gold<gc||ga} onClick={function(){doInvoc(1);}} style={{padding:"8px 20px",fontSize:14}}>×1 ({gc}g)</button>
        <button className="b bg" disabled={g.gold<gc*10||ga} onClick={function(){doInvoc(10);}} style={{padding:"8px 20px",fontSize:14}}>×10 ({(gc*10).toLocaleString()}g)</button>
      </div>
      {gr&&!ga&&<div style={{background:"var(--card)",borderRadius:14,padding:14,maxWidth:440,margin:"0 auto",border:"1px solid var(--acc)",animation:"fi .4s ease"}}>
        {Array.isArray(gr)?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(85px,1fr))",gap:4}}>
          {gr.map(function(r,i){return <div key={i} style={{padding:6,borderRadius:8,textAlign:"center",background:r.dup?"#ffffff05":(RA[r.h.rarity]||{}).c+"12",border:"1px solid "+(RA[r.h.rarity]||{}).c+"30"}}>
            <div style={{fontSize:22}}>{r.h.icon}</div><div style={{fontSize:10,fontWeight:700}}>{r.h.name}</div><div style={{fontSize:9,color:(RA[r.h.rarity]||{}).c}}>{(RA[r.h.rarity]||{}).s}</div>
            {r.dup&&<div style={{fontSize:9,color:"var(--td)"}}>+{r.xp}XP</div>}</div>;})}
        </div>:<div>
          <div style={{fontSize:40}}>{gr.h.icon}</div><div style={{fontSize:18,fontWeight:700,color:(RA[gr.h.rarity]||{}).c,marginTop:4}}>{gr.h.name}</div>
          <div style={{fontSize:13,color:(RA[gr.h.rarity]||{}).c}}>{(RA[gr.h.rarity]||{}).s} {(RA[gr.h.rarity]||{}).n}</div>
          <div style={{fontSize:12,color:"var(--td)",marginTop:2,fontStyle:"italic"}}>{gr.h.title}</div>
          {gr.dup&&<div style={{fontSize:12,color:"var(--acc)",marginTop:4}}>Doublon → +{gr.xp}XP</div>}
          {!gr.dup&&<div style={{fontSize:12,color:"#4ade80",marginTop:4}}>NOUVEAU !</div>}
        </div>}
      </div>}
      <div style={{marginTop:14,fontSize:12,color:"var(--td)"}}>{Object.keys(RA).map(function(r){return <span key={r} style={{marginRight:10,color:RA[r].c}}>{RA[r].n}: {Math.round(RA[r].r*100)}%</span>;})}</div>
    </div>}
  </div>);
}
