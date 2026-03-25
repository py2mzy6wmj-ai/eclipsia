import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { HEROES, ENM, BSS, DG, EVT, BUP, EL, EM, RA, defER, PORTRAIT_BASE, STARTING_GOLD, rollLoot, rollWeaponDrop, generateWeapon, generateArmor, generateAccessory, generateTalisman, SKILLS, TOMES, FRAGMENTS } from './data';

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
  if(!t)return{hp:1,rel:8,str:1,mag:1,crit:0,phv:1,mav:1,dodge:0,rgHp:0,relBonus:0,er:defER(),_s:{}};
  var lv=hero.level||1;
  function L(k){var v1=t.lv1[k],v100=t.lv100[k];if(v1==null)return 0;if(v100==null)return v1;return lerp100(v1,v100,lv);}
  var bHp=Math.floor(L("hp"));
  var bRel=Math.round(L("rel"));
  var bStr=L("str");var bMag=L("mag");var bCrit=L("crit");
  var bPhv=L("phv");var bMav=L("mav");var bDodge=L("dodge");var bRgHp=L("rgHp");
  var _s={hp:["Nv."+lv+": "+bHp],rel:["Base: "+bRel+" tours"],str:["Nv."+lv+": "+fmtPM(bStr)],mag:["Nv."+lv+": "+fmtPM(bMag)],crit:["Nv."+lv+": "+fmtPct(bCrit)],phv:["Nv."+lv+": "+fmtPM(bPhv)],mav:["Nv."+lv+": "+fmtPM(bMav)],dodge:["Nv."+lv+": "+fmtPct(bDodge)],rgHp:[]};
  var s={hp:bHp,rel:bRel,str:bStr,mag:bMag,crit:bCrit,phv:bPhv,mav:bMav,dodge:bDodge,rgHp:bRgHp,relBonus:0,er:Object.assign({},t.er||defER()),_s:_s};
  if(bRgHp>0)_s.rgHp.push("Nv."+lv+": "+fmtPct(bRgHp));
  if(bl){
    // Old passive bonuses removed — buildings now have different functions
  }
  var eq=hero.equipment||{};
  var slots=["weapon","armor","accessory","talisman"];
  for(var si=0;si<slots.length;si++){var it=eq[slots[si]];if(!it||!it.bon)continue;var b=it.bon;
    if(b.hp){s.hp+=b.hp;_s.hp.push(it.name+": +"+b.hp);}
    if(b.pvPct){var pvB=Math.floor(s.hp*b.pvPct);s.hp+=pvB;_s.hp.push(it.name+": +"+fmtPct(b.pvPct)+" (+"+pvB+")");}
    if(b.str){s.str+=b.str;_s.str.push(it.name+": "+fmtB(b.str));}
    if(b.mag){s.mag+=b.mag;_s.mag.push(it.name+": "+fmtB(b.mag));}
    if(b.crit){s.crit+=b.crit;_s.crit.push(it.name+": +"+fmtPct(b.crit));}
    if(b.crt){s.crit+=b.crt;_s.crit.push(it.name+": "+fmtB(b.crt));}
    if(b.phv){s.phv+=b.phv;_s.phv.push(it.name+": "+fmtB(b.phv));}
    if(b.mav){s.mav+=b.mav;_s.mav.push(it.name+": "+fmtB(b.mav));}
    if(b.dodge){s.dodge+=b.dodge;_s.dodge.push(it.name+": +"+fmtPct(b.dodge));}
    if(b.rgHp){s.rgHp+=b.rgHp;_s.rgHp.push(it.name+": +"+fmtPct(b.rgHp));}
    if(b.rel){s.relBonus+=b.rel;_s.rel.push(it.name+": "+b.rel+" tours");}
    if(b.er)for(var ek in b.er)s.er[ek]=(s.er[ek]||1)+b.er[ek];
  }
  s.rel=Math.max(1,s.rel+s.relBonus);
  s.crit=clamp(s.crit,0,.8);s.dodge=clamp(s.dodge,0,.5);
  for(var ei=0;ei<EL.length;ei++){var ek2=EL[ei];s.er[ek2]=Math.max(0,s.er[ek2]||1);}
  return s;
}
function gw(h){var w=h.equipment&&h.equipment.weapon;return w||{name:"Poings",wt:"physical",dmg:5,el:"Neutre"};}
function xpN(lv,r){var base=50+r*10;var mult=2+6*((lv-1)/98);return Math.floor(base*lv*mult);}


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
  var prec=.95;
  if(!roll(prec))return{dmg:0,msg:"RATÉ",hit:false,st:{bd:bd,wt:"magical",el:el,res:"miss",prec:prec}};
  var dg=d.stats?d.stats.dodge:(d.dodge||0);
  if(roll(dg))return{dmg:0,msg:"ESQUIVÉ",hit:false,st:{bd:bd,wt:"magical",el:el,res:"dodged",dg:dg}};
  var magB=(a.stats?a.stats.mag:1)-1;
  var mavB=(d.stats?d.stats.mav:(d.mav||1))-1;
  var mult=1+magB+mavB;
  var v=variance(),cr=roll(a.stats?a.stats.crit:0);
  var eRes=d.er?(d.er[el]!=null?d.er[el]:1):1;
  var raw=bd*mult*v*(cr?3:1)*eRes;
  var dmg=Math.max(1,Math.round(raw));
  var msgs=[];if(cr)msgs.push("CRIT");if(eRes>1.01)msgs.push("FAIBLE");if(eRes<.99&&eRes>0)msgs.push("RÉSIST");if(eRes===0)msgs.push("IMMUN");
  return{dmg:dmg,msg:msgs.join(", "),hit:true,st:{bd:bd,wt:"magical",el:el,res:"hit",magB:magB,mavB:mavB,mult:mult,v:v,cr:cr,eRes:eRes,dmg:dmg}};
}
function spawn(fl,ti,isBoss,cnt){
  var d=DG[ti],m=d.m*(1+fl*0.05);
  var pool;
  if(isBoss){
    pool=(d.bosses||[]).map(function(id){return BSS.find(function(b){return b.id===id;});}).filter(Boolean);
    if(!pool.length)pool=BSS;
  }else{
    pool=(d.enemies||[]).map(function(id){return ENM.find(function(e){return e.id===id;});}).filter(Boolean);
    if(!pool.length)pool=ENM;
  }
  var n=isBoss?1:(cnt?cnt[0]+Math.floor(Math.random()*(cnt[1]-cnt[0]+1)):1+Math.floor(Math.random()*2));
  var out=[];for(var i=0;i<n;i++){var t=pick(pool);var hpM=Math.floor(t.hp*m);
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
  if(b.str)parts.push("Force "+fmtB(b.str));if(b.mag)parts.push("Magie "+fmtB(b.mag));
  if(b.crt)parts.push("Critique "+fmtB(b.crt));if(b.crit)parts.push("Critique +"+fmtPct(b.crit));
  if(b.pvPct)parts.push("Points de vie +"+fmtPct(b.pvPct));
  if(b.rel)parts.push("Recharge "+b.rel+" tour"+(Math.abs(b.rel)>1?"s":""));
  if(b.phv)parts.push("Vuln. Physique "+fmtB(b.phv));if(b.mav)parts.push("Vuln. Magique "+fmtB(b.mav));
  if(b.dodge)parts.push("Esquive +"+fmtPct(b.dodge));if(b.rgHp)parts.push("Récupération +"+fmtPct(b.rgHp));
  if(b.er){for(var ek in b.er){var rv=b.er[ek];var pct=Math.round(Math.abs(rv)*100);parts.push("Vuln. "+((EM[ek]||{}).i||"")+" "+ek+" "+(rv<0?"-":"+")+pct+"%");}}
  // Header line: slot · Rang X · ★★
  var slotName=it.slot==="weapon"?"Arme":it.slot==="armor"?"Armure":it.slot==="accessory"?"Accessoire":"Talisman";
  var header=slotName;
  if(it.rank)header+=" · Rang "+it.rank;
  // Name line with damage for weapons, HP for armor
  var line2=it.name;
  if(it.slot==="weapon"&&it.dmg!=null){line2+=" ("+it.dmg+" "+(it.wt==="magical"?"Magique":"Physique");if(it.el&&it.el!=="Neutre")line2+=", "+((EM[it.el]||{}).i||"")+" "+it.el;line2+=")";}
  if(it.slot==="armor"&&b.hp){line2+=" ("+b.hp+" points de vie)";}
  var fs=props.fs||14;
  return(<div>
    <div style={{fontSize:fs-2,color:rc}}>{header} · {(RA[it.rarity]||{}).s}</div>
    <div style={{fontWeight:600,fontSize:fs,color:rc}}>{line2}</div>
    {parts.length>0&&<div style={{fontSize:fs-2,color:"#4ade80",marginTop:1}}>{parts.join(", ")}</div>}
  </div>);
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


var INIT={gold:STARTING_GOLD,scrolls:5,floors:0,beaten:[],roster:[],team:[null,null,null,null],inv:[],mat:{},conso:{},bl:{forge:1,rempart:0,autel:0,tour:0,ecole:0,mine:0,oracle:0,taverne:0,marche:1}};

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
  var _dExp=useState(null);var dExp=_dExp[0],setDExp=_dExp[1];
  var _tgt=useState(null);var tgt=_tgt[0],setTgt=_tgt[1];
  var _hl=useState(null);var hl=_hl[0],setHl=_hl[1];
  var _slv=useState(false);var slv=_slv[0],setSlv=_slv[1];
  var _hs=useState(null);var hs=_hs[0],setHs=_hs[1];
  var _infoPopup=useState(null);var infoPopup=_infoPopup[0],setInfoPopup=_infoPopup[1];
  var _tomePanel=useState(null);var tomePanel=_tomePanel[0],setTomePanel=_tomePanel[1];
  var _tomeQty=useState({});var tomeQty=_tomeQty[0],setTomeQty=_tomeQty[1];
  var _menuOpen=useState(false);var menuOpen=_menuOpen[0],setMenuOpen=_menuOpen[1];
  var _patchNotes=useState(false);var patchNotes=_patchNotes[0],setPatchNotes=_patchNotes[1];
  var _cp=useState({carac:true,elem:false,degats:false,equip:false,skill:false});var cp=_cp[0],setCp=_cp[1];
  var _drag=useState(null);var drag=_drag[0],setDrag=_drag[1];
  var _floats=useState([]);var floats=_floats[0],setFloats=_floats[1];
  var _vp=useState("none");var vp=_vp[0],setVp=_vp[1];
  var _fs=useState({slot:"weapon",rank:1,rar:1});var fs=_fs[0],setFs=_fs[1];
  var _fResult=useState(null);var fResult=_fResult[0],setFResult=_fResult[1];
  var lr=useRef(null);

  useEffect(function(){var t=setTimeout(function(){try{localStorage.setItem("ecl8",JSON.stringify(g));}catch(e){}},500);return function(){clearTimeout(t);};},[g]);
  useEffect(function(){if(lr.current)lr.current.scrollTop=lr.current.scrollHeight;},[logs]);

  var team=useMemo(function(){return g.team.map(function(u){return u?g.roster.find(function(h){return h.uid===u;}):null;}).filter(Boolean);},[g.team,g.roster]);
  var sR=useMemo(function(){return[].concat(g.roster).sort(function(a,b){return b.rarity-a.rarity||b.level-a.level;});},[g.roster]);

  var sc=g.scrolls||0;
  function doInvoc(n){
    if(sc<n)return;setGa(true);setGr(null);
    setTimeout(function(){
      var res=[],ros=[].concat(g.roster),dupItems=[];
      for(var i=0;i<n;i++){
        var bon=(g.bl.oracle||0)*.004;var r=Math.random(),cum=0,rr=1;
        for(var j=5;j>=1;j--){cum+=Math.max(.01,RA[j].r+(j>=3?bon/3:-bon/2));if(r<cum){rr=j;break;}}
        var pool=HEROES.filter(function(h){return h.rarity===rr;});
        if(!pool.length)pool=HEROES.filter(function(h){return h.rarity<=rr;});
        if(!pool.length)pool=HEROES;
        var t=pick(pool);var ex=ros.find(function(h){return h.id===t.id;});
        if(ex){
          var frag=FRAGMENTS.find(function(f){return f.heroId===t.id;});
          var tome=TOMES.find(function(tm){return tm.rarity===t.rarity;});
          res.push({h:t,dup:true,frag:frag,tome:tome});
          if(frag)dupItems.push(frag.id);
          if(tome)dupItems.push(tome.id);
        }
        else{var wp=generateWeapon(1,1,t.wt||"physical");wp.uid=uid();
          ros.push({id:t.id,uid:uid(),name:t.name,icon:t.icon,rarity:t.rarity,level:1,xp:0,equipment:{weapon:wp,armor:null,accessory:null,talisman:null}});res.push({h:t,dup:false});}
      }
      setG(function(p){
        var nc=Object.assign({},p.conso||{});
        for(var di=0;di<dupItems.length;di++){nc[dupItems[di]]=(nc[dupItems[di]]||0)+1;}
        return Object.assign({},p,{scrolls:(p.scrolls||0)-n,roster:ros,conso:nc});
      });setGr(n===1?res[0]:res);setGa(false);
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
  function sellPrice(it){if(it.slot==="weapon")return Math.max(1,Math.floor((it.dmg||10)*(it.rank||1)*(it.rarity||1)/2));return Math.max(1,Math.floor(20*(it.rank||1)*(it.rarity||1)/2));}
  function doSell(iu,e){var it=g.inv.find(function(i){return i.uid===iu;});if(!it)return;var price=sellPrice(it);
    var mx=e?e.clientX:200,my=e?e.clientY:100;
    setFloats(function(f){return f.concat([{uid:"ui",val:"+"+price+"g",color:"#fbbf24",id:uid(),x:mx,y:my}]);});
    setG(function(p){return Object.assign({},p,{gold:p.gold+price,inv:p.inv.filter(function(i){return i.uid!==iu;})});});}
  function doRecycle(iu,e){var it=g.inv.find(function(i){return i.uid===iu;});if(!it)return;
    var mx=e?e.clientX:200,my=e?e.clientY:100;
    var gains=[];
    var inerteKey=it.slot+"_inerte";
    var gotInerte=Math.random()<0.75;if(gotInerte)gains.push(it.slot.charAt(0).toUpperCase()+it.slot.slice(1)+" inerte");
    var gCount=Math.random()<0.60?1:0;
    if(gCount>0)gains.push("Gabarit Rang "+(it.rank||1));
    var gotCata=Math.random()<0.45;
    if(gotCata)gains.push("Catalyseur "+(RA[it.rarity]||{}).s);
    setFloats(function(f){return f.concat([{uid:"ui",val:"♻️ "+gains.join(", "),color:"#4ade80",id:uid(),x:mx,y:my}]);});
    setG(function(p){
      var nm=Object.assign({},p.mat||{});if(gotInerte)nm[inerteKey]=(nm[inerteKey]||0)+1;
      if(gCount>0){var gk="gabarit_"+(it.rank||1);nm[gk]=(nm[gk]||0)+gCount;}
      if(gotCata){var ck="catalyseur_"+(it.rarity||1);nm[ck]=(nm[ck]||0)+1;}
      return Object.assign({},p,{mat:nm,inv:p.inv.filter(function(i){return i.uid!==iu;})});
    });}
  function doUneq(hu,sl){setG(function(p){var h=p.roster.find(function(r){return r.uid===hu;});if(!h||!h.equipment[sl])return p;var nEq=Object.assign({},h.equipment);var old=nEq[sl];nEq[sl]=null;return Object.assign({},p,{inv:[].concat(p.inv,[old]),roster:p.roster.map(function(r){return r.uid!==hu?r:Object.assign({},r,{equipment:nEq});})});});}
  function doUpg(id){var u=BUP.find(function(b){return b.id===id;});var lv=g.bl[id]||0;if(!u||lv>=u.mx)return;var c=Math.floor(u.c0*Math.pow(u.cm,lv));if(g.gold<c)return;setG(function(p){var bl=Object.assign({},p.bl);bl[id]=lv+1;return Object.assign({},p,{gold:p.gold-c,bl:bl});});}
  function navSheet(dir){if(!sheet||sR.length<=1)return;var idx=sR.findIndex(function(h){return h.uid===sheet;});setSheet(sR[(idx+dir+sR.length)%sR.length].uid);setSlv(false);}

  function startDun(ti){
    if(!team.length)return;
    var t=team.map(function(h){var s=cs(h,g.bl);return Object.assign({},h,{hp:s.hp,stats:{str:s.str,mag:s.mag,crit:s.crit,phv:s.phv,dodge:s.dodge,mav:s.mav},hpMax:s.hp,isHero:true,er:s.er,rgHp:s.rgHp,rel:s.rel,cd:s.rel});});
    setDun({ti:ti,fl:-1,ph:"explore",team:t,en:[],rG:0,rX:0,bX:0,rE:[],tI:0,tO:[]});
    setLogs([{t:"--- "+DG[ti].name+" ---",tp:"info"}]);setTab("donjon");setAu(false);setTgt(null);
  }
  function nxtFl(){
    if(!dun)return;var nf=dun.fl+1;
    var dgDef=DG[dun.ti];
    if(nf>=dgDef.structure.length){endDun(true);return;}
    var t=dun.team.map(function(h){if(h.hp<=0)return h;return Object.assign({},h,{hp:Math.min(h.hpMax,h.hp+Math.floor(h.hpMax*(h.rgHp||0)))});});
    var step=dgDef.structure[nf];
    var stepType=step.type||step;
    if(stepType==="event"){
      var ev=pick(EVT);var ex={};var detail="";
      if(ev.tp==="heal"){t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{hp:Math.min(h.hpMax,h.hp+Math.floor(h.hpMax*.25))});});detail="L'équipe récupère 25% de ses points de vie.";}
      if(ev.tp==="mpFull"){t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{cd:0});});detail="Toutes les compétences sont rechargées !";}
      if(ev.tp==="trap"){t=t.map(function(h){return h.hp<=0?h:Object.assign({},h,{hp:Math.max(1,h.hp-Math.floor(h.hpMax*.12))});});detail="L'équipe perd 12% de ses points de vie !";}
      if(ev.tp==="buff"){t=t.map(function(h){return Object.assign({},h,{stats:Object.assign({},h.stats,{str:(h.stats.str||1)+.05})});});detail="Force de l'équipe augmentée (+5%) !";ex.buffs=(dun.buffs||0)+1;}
      if(ev.tp==="gold"){var gv=15+Math.floor(Math.random()*35);ex.rG=(dun.rG||0)+gv;detail="L'équipe trouve "+gv+" pièces d'or !";}
      if(ev.tp==="xp"){ex.bX=(dun.bX||0)+12;detail="L'équipe gagne 12 XP bonus !";}
      setDun(function(d){return Object.assign({},d,ex,{fl:nf,ph:"event",team:t,evtText:ev.t,evtDetail:detail});});setLogs(function(l){return l.concat([{t:"───────────────"},{t:ev.t,tp:"event"}]);});return;
    }
    var isBoss=stepType==="boss";
    var cnt=step.count||null;
    var en=spawn(nf,dun.ti,isBoss,cnt);
    var ord=[].concat(t.filter(function(h){return h.hp>0;}).map(function(h){return h.uid;}),en.map(function(e){return e.uid;})).sort(function(){return Math.random()-.5;});
    setDun(function(d){return Object.assign({},d,{fl:nf,ph:"combat",team:t,en:en,tO:ord,tI:0});});setTgt(null);
    setLogs(function(l){return l.concat([{t:"───────────────"},{t:"Étage "+(nf+1)+" — "+en.map(function(e){return e.name+(e.boss?" (BOSS)":"");}).join(", "),tp:"info"}]);});
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
      // Regen HP when it's a hero's turn
      if(isH&&unit.rgHp){var rh=Math.floor(unit.hpMax*(unit.rgHp||0));if(rh>0&&unit.hp<unit.hpMax){unit.hp=Math.min(unit.hpMax,unit.hp+rh);t=t.map(function(h){return h.uid===unit.uid?Object.assign({},h,{hp:unit.hp}):h;});setLogs(function(l){return l.concat([{t:"  "+unit.name+" récupère "+rh+" points de vie",tp:"info"}]);});}}
      if(isH){
        var ae=en.filter(function(e){return e.hp>0;});if(!ae.length)return d;
        var target=ae.find(function(e){return e.uid===tgt&&e.hp>0;})||pick(ae);
        var w=gw(unit);
        var sk=SKILLS[unit.id];
        var useSkill=sk&&unit.cd<=0;
        var baseDmg=useSkill?w.dmg*sk.mult:w.dmg;
        var skWt=useSkill&&sk.type==="mAtk"?"magical":w.wt;
        var res=skWt==="magical"?mDmg(unit,target,baseDmg,w.el):pDmg(unit,target,baseDmg,w.el);
        var ln=useSkill?("  "+unit.name+" — "+sk.name+" → "+target.name):("  "+unit.name+" → "+target.name);
        var logTp=useSkill?"skill":"heroAtk";
        if(res.hit){target.hp-=res.dmg;en=en.map(function(e){return e.uid===target.uid?Object.assign({},e,{hp:target.hp}):e;});ln+=" : "+res.dmg+" dégâts";if(res.msg)ln+=" ("+res.msg+")";if(res.st.cr)logTp="skill";
          setFloats(function(f){return f.concat([{uid:target.uid,val:"-"+res.dmg,color:res.st.cr?"#fbbf24":useSkill?"#c0392b":"#ffffff",id:uid()}]);});}
        else{ln+=" : "+res.msg;logTp="miss";}
        setLogs(function(l){return l.concat([{t:ln,st:res.st,tp:logTp}]);});
        // Cooldown management
        if(useSkill){t=t.map(function(h){return h.uid===unit.uid?Object.assign({},h,{cd:unit.rel||8}):h;});}
        else{t=t.map(function(h){return h.uid===unit.uid?Object.assign({},h,{cd:Math.max(0,(h.cd||0)-1)}):h;});}
        if(target.hp<=0){setLogs(function(l){return l.concat([{t:"  "+target.name+" vaincu! +"+target.xp+"xp +"+target.gold+"g",tp:"kill"}]);});rX+=target.xp;rG+=target.gold;}
      }else{
        var ah=t.filter(function(h){return h.hp>0;});if(!ah.length)return d;
        var target=pick(ah);
        var res=unit.at==="magical"?mDmg({stats:unit.stats},target,unit.dmg,"Neutre"):pDmg({stats:unit.stats},target,unit.dmg,"Neutre");
        var ln="  "+unit.name+" → "+target.name;
        var logTp2="enemyAtk";
        if(res.hit){target.hp-=res.dmg;t=t.map(function(h){return h.uid===target.uid?Object.assign({},h,{hp:target.hp}):h;});ln+=" : "+res.dmg+" dégâts";if(res.msg)ln+=" ("+res.msg+")";
          setFloats(function(f){return f.concat([{uid:target.uid,val:"-"+res.dmg,color:"#ffffff",id:uid()}]);});}
        else{ln+=" : "+res.msg;logTp2="miss";}
        setLogs(function(l){return l.concat([{t:ln,st:res.st,tp:logTp2}]);});
        if(target.hp<=0)setLogs(function(l){return l.concat([{t:"  "+target.name+" tombe!",tp:"heroDeath"}]);});
      }
      if(t.every(function(h){return h.hp<=0;})){setLogs(function(l){return l.concat([{t:"Défaite...",tp:"heroDeath"}]);});return Object.assign({},d,{team:t,en:en,rG:rG,rX:rX,ph:"result",tI:tI});}
      if(en.every(function(e){return e.hp<=0;})){
        var bon=Math.floor(15*DG[d.ti].rw);setLogs(function(l){return l.concat([{t:"Victoire! +"+bon+"g",tp:"kill"}]);});
        var eq=[].concat(rE);var dr=rollLoot(d.ti);if(dr){dr.uid=uid();eq.push(dr);setLogs(function(l){return l.concat([{t:"  Loot: "+dr.name+" (Rang "+dr.rank+" "+(RA[dr.rarity]||{}).s+") !",tp:"info"}]);});}
        return Object.assign({},d,{team:t,en:en,rG:rG+bon,rX:rX,rE:eq,ph:"victory",tI:tI});}
      return Object.assign({},d,{team:t,en:en,tI:tI,rG:rG,rX:rX,rE:rE});
    });
  }
  function endDun(won){
    if(!dun)return;
    if(won&&dun.ph!=="done"){
      var rE=[].concat(dun.rE||[]);
      var dgDef=DG[dun.ti];
      // Generate GUARANTEED loot drops based on nbLoot
      var nbL=dgDef.loot&&dgDef.loot.nbLoot?dgDef.loot.nbLoot:1;
      for(var li=0;li<nbL;li++){
        var lk=dgDef.loot.ranks;var rank2=lk[0]+Math.floor(Math.random()*(lk[1]-lk[0]+1));
        var rw2=dgDef.loot.rarW;var rl2=Math.random(),cm2=0,rar2=1;for(var rk in rw2){cm2+=rw2[rk];if(rl2<cm2){rar2=parseInt(rk);break;}}
        var typeRoll2=Math.random();var dr;
        if(typeRoll2<0.30)dr=generateWeapon(rank2,rar2);else if(typeRoll2<0.60)dr=generateArmor(rank2,rar2);else if(typeRoll2<0.80)dr=generateAccessory(rank2,rar2);else dr=generateTalisman(rank2,rar2);
        dr.uid=uid();rE.push(dr);
      }
      // Generate first bonus equip if first victory
      var bt0=g.beaten||[];
      if(bt0.indexOf(dun.ti)<0){
        var fb0=dgDef.firstBonus;
        if(fb0&&fb0.equip){for(var eqi=0;eqi<fb0.equip;eqi++){var lk3=dgDef.loot?dgDef.loot.ranks:[1,1];var rk3=lk3[0]+Math.floor(Math.random()*(lk3[1]-lk3[0]+1));var rw3=dgDef.loot?dgDef.loot.rarW:{1:1};var rl3=Math.random(),cm3=0,rar3=1;for(var rkk in rw3){cm3+=rw3[rkk];if(rl3<cm3){rar3=parseInt(rkk);break;}}var tr3=Math.random();var fbItem;if(tr3<0.30)fbItem=generateWeapon(rk3,rar3);else if(tr3<0.60)fbItem=generateArmor(rk3,rar3);else if(tr3<0.80)fbItem=generateAccessory(rk3,rar3);else fbItem=generateTalisman(rk3,rar3);fbItem.uid=uid();rE.push(fbItem);}}
      }
      var mm=1+(g.bl.mine||0)*.03,xm=1+(g.bl.ecole||0)*.03;
      var tg=Math.floor((dun.rG+(dgDef.reward?dgDef.reward.gold:0))*mm),tx=Math.floor((dun.rX+(dun.bX||0)+(dgDef.reward?dgDef.reward.xp||0:0))*xm);
      setDun(function(d){return Object.assign({},d,{ph:"done",rE:rE,rG:tg,rX:tx});});
      var logMsgs=[{t:"───────────────"},{t:"DONJON TERMINÉ !",tp:"kill"},{t:"Or: +"+tg+" · XP: +"+tx+" · Loot: "+rE.length+" objets",tp:"info"}];
      if(bt0.indexOf(dun.ti)<0){
        var fb0Log=dgDef.firstBonus;
        if(fb0Log){
          var fbParts=[];
          if(fb0Log.gold)fbParts.push("💰 "+fb0Log.gold.toLocaleString()+" or");
          if(fb0Log.xp)fbParts.push("⭐ "+fb0Log.xp.toLocaleString()+" XP");
          if(fb0Log.scrolls)fbParts.push("📜 "+fb0Log.scrolls+" parchemins");
          if(fb0Log.equip)fbParts.push("🎁 "+fb0Log.equip+" équipement"+(fb0Log.equip>1?"s":""));
          if(fb0Log.tomes){for(var tlk in fb0Log.tomes){var tlm=TOMES.find(function(t){return t.id===tlk;});fbParts.push("📖 "+fb0Log.tomes[tlk]+"× "+(tlm?tlm.name:tlk));}}
          logMsgs.push({t:"Bonus de 1ère victoire : "+fbParts.join(" · "),tp:"event"});
        }
      }
      setLogs(function(l){return l.concat(logMsgs);});
      return;
    }
    var mm2=1+(g.bl.mine||0)*.03,xm2=1+(g.bl.ecole||0)*.03;
    var tg2=won?dun.rG:Math.floor(dun.rG*mm2);
    var tx2=won?dun.rX:Math.floor((dun.rX+(dun.bX||0))*xm2);
    var fl=dun.fl+1;
    var ti=dun.ti;
    setG(function(p){
      var bt=[].concat(p.beaten||[]);
      var extraG=0,extraX=0,extraS=0;
      if(won&&bt.indexOf(ti)<0){
        bt.push(ti);
        var fb=DG[ti].firstBonus;
        if(fb){extraG=fb.gold||0;extraX=fb.xp||0;extraS=fb.scrolls||0;
          // First bonus tomes
          if(fb.tomes){var nc2=Object.assign({},p.conso||{});for(var tk in fb.tomes){nc2[tk]=(nc2[tk]||0)+fb.tomes[tk];}p=Object.assign({},p,{conso:nc2});}
        }
      }
      return Object.assign({},p,{gold:p.gold+tg2+extraG,scrolls:(p.scrolls||0)+extraS,beaten:bt,roster:p.roster.map(function(h){return p.team.indexOf(h.uid)>=0?Object.assign({},h,{xp:h.xp+tx2+extraX}):h;}),inv:[].concat(p.inv,dun.rE||[])});
    });
    if(!won)setLogs(function(l){return l.concat([{t:"───────────────"},{t:"Fin",tp:"heroDeath"},{t:"Or: +"+tg2+" · XP: +"+tx2+" · Étapes: "+fl,tp:"info"}]);});
    setDun(null);setAu(false);
  }
  useEffect(function(){
    if(!dun||dun.ph!=="combat")return;
    if(au){var t=setInterval(doTurn,400);return function(){clearInterval(t);};}
    var nextId=dun.tO[dun.tI%dun.tO.length];
    var isEnemy=dun.en.find(function(e){return e.uid===nextId&&e.hp>0;});
    var isDead=!dun.team.find(function(h){return h.uid===nextId&&h.hp>0;})&&!dun.en.find(function(e){return e.uid===nextId&&e.hp>0;});
    if(isEnemy||isDead){var t=setTimeout(doTurn,isDead?50:350);return function(){clearTimeout(t);};}
  },[au,dun&&dun.ph,dun&&dun.tI,dun&&dun.fl]);
  useEffect(function(){if(!dun||!au)return;if(dun.ph==="result"||dun.ph==="done"){setAu(false);return;}if(dun.ph==="victory"||dun.ph==="event"||dun.ph==="explore"){var t=setTimeout(nxtFl,3000);return function(){clearTimeout(t);};};},[au,dun&&dun.ph,dun&&dun.fl]);
  // Clean floating damage numbers after 1s
  useEffect(function(){if(!floats.length)return;var t=setTimeout(function(){setFloats([]);},400);return function(){clearTimeout(t);};},[floats.length]);
  function reset(){localStorage.removeItem("ecl8");setG(INIT);setDun(null);setLogs([]);setTab("base");setAu(false);setSheet(null);setFloats([]);}

  var css='@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap");:root{--bg:#0e0d0d;--bg2:#141313;--card:#1c1a1a;--brd:#3a2828;--t:#e0d8d0;--td:#8a7e76;--acc:#c0392b;--red:#e74c3c;--gold:#d4a017}*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);background-image:url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'60\' height=\'60\' fill=\'%230e0d0d\'/%3E%3Crect x=\'0\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'12\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'36\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3C/svg%3E");color:var(--t);font-family:"DM Sans",sans-serif;font-size:14px}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--brd);border-radius:3px}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes gw{0%,100%{box-shadow:0 0 6px #c0392b20}50%{box-shadow:0 0 18px #c0392b50}}@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes glw{0%,100%{box-shadow:0 0 4px #22c55e40}50%{box-shadow:0 0 16px #22c55e90}}@keyframes arr{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.b{padding:8px 16px;border:1px solid var(--brd);border-radius:10px;cursor:pointer;font-family:inherit;font-weight:600;font-size:13px;transition:all .15s;background:var(--card);color:var(--t)}.b:hover{background:#2a2222;transform:translateY(-1px)}.b:active{transform:translateY(0)}.b:disabled{opacity:.3;cursor:not-allowed;transform:none}.bg{background:linear-gradient(135deg,#c0392b,#962d22);color:#fff;border:none;font-weight:700}.bg:hover{background:linear-gradient(135deg,#d44637,#b03426)}.br{background:linear-gradient(135deg,#8b1a1a,#6b1414);color:#fff;border:none}.bgr{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none}.ton{background:var(--acc)!important;color:#fff!important;border-color:var(--acc)!important}.glow{animation:glw 1.5s infinite}@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}';

  function Bar(props){var cur=props.cur,max=props.max,color=props.color||"#22c55e",h=props.h||10,label=props.label!==false;var p=clamp(cur/Math.max(1,max)*100,0,100);return(<div style={{position:"relative",width:"100%",height:h,background:"#0a0a18",borderRadius:h/2,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",borderRadius:h/2,background:"linear-gradient(90deg,"+color+"cc,"+color+")",transition:"width .3s"}}/>{label&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(9,h-2),fontWeight:700,color:"#fff",textShadow:"0 1px 1px #000a",fontFamily:"monospace"}}>{cur}/{max}</span>}</div>);}
  function turnPos(u){if(!dun||!dun.tO)return null;var alive=dun.tO.filter(function(id){return(dun.team.find(function(h){return h.uid===id&&h.hp>0;})||dun.en.find(function(e){return e.uid===id&&e.hp>0;}));});return alive.indexOf(u)+1||null;}
  function Unit(props){var u=props.u,isE=props.isE,act=props.act,isSel=props.sel,onClick=props.onClick;var hp=u.hp||0,hm=u.hpMax||1;var tp=turnPos(u.uid);
    var myFloats=floats.filter(function(f){return f.uid===u.uid;});
    var pSrc=!isE?portrait(u.id):null;
    return(<div onClick={onClick} style={{padding:12,borderRadius:12,minWidth:110,textAlign:"center",cursor:onClick?"pointer":"default",background:isSel?"#ffffff18":act?"#ffffff0c":"#ffffff05",border:isSel?"2px solid #fbbf24":act?"2px solid #c0392b60":"1px solid #ffffff0a",opacity:hp<=0?.2:1,transition:"all .2s",position:"relative"}}>{tp&&hp>0&&<div style={{position:"absolute",top:-6,right:-6,background:act?"#c0392b":"#444",color:act?"#fff":"#ddd",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{tp}</div>}
      {myFloats.map(function(f){return <div key={f.id} style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",color:f.color,fontSize:18,fontWeight:900,textShadow:"0 2px 4px #000",animation:"floatUp .7s forwards",pointerEvents:"none",zIndex:20}}>{f.val}</div>;})}
      <div style={{width:44,height:44,borderRadius:10,margin:"0 auto",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,background:"#111"}}>
        <span style={{position:"absolute",zIndex:1}}>{u.icon}</span>
        {pSrc&&<img src={pSrc} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:2}} alt="" onError={function(e){e.target.style.display="none";}}/>}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:isE?"#ff6b6b":"#6bffb8",marginTop:2}}>{u.name}</div>{u.boss&&<div style={{fontSize:10,color:"#c0392b",fontWeight:800}}>BOSS</div>}<div style={{marginTop:4}}><Bar cur={Math.max(0,hp)} max={hm} color={isE?"#ef4444":"#22c55e"} h={8}/></div>
      {!isE&&u.isHero&&<div style={{fontSize:10,marginTop:2,color:u.cd<=0?"#fbbf24":"#666",fontWeight:u.cd<=0?800:400}}>{u.cd<=0?"⚡ PRÊT":"⏳ "+u.cd}</div>}
      </div>);}

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
      function mkTip(key){var arr=st._s[key];if(!arr||!arr.length)return null;var total;if(key==="hp"||key==="rel")total=st[key];else if(key==="crit"||key==="dodge"||key==="rgHp")total=fmtPct(st[key]);else total=fmtPM(st[key]);return arr.join("\n")+"\n= "+total;}

      /* level up is now a popup, rendered at end of sheet */

      return(<div onClick={function(e){if(e.target===e.currentTarget){setSheet(null);setSlv(false);}}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,overflowY:"auto",padding:"16px 12px"}}><style>{css}</style>
        <div style={{maxWidth:540,margin:"0 auto",animation:"fi .3s ease"}} onClick={function(e){e.stopPropagation();}}>
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
              <button className={"b "+(canLv?"bgr glow":"")} disabled={!canLv} onClick={function(){setSlv(true);}} style={{flex:1,fontSize:13,fontWeight:canLv?800:600}}>⬆ Niveau</button>
              <button className="b" onClick={function(){setTomePanel(hero.uid);setTomeQty({});}} style={{flex:1,fontSize:13}}>📖 Entraînement</button>
              <button className="b" disabled style={{flex:1,fontSize:13,opacity:0.3}}>🔒 Maîtrise</button>
              {(function(){var teamFull=g.team.indexOf(null)<0&&!inTeam;
                if(teamFull)return <button className="b" disabled style={{flex:1,fontSize:14,fontWeight:700,opacity:0.3}}>Équipe complète</button>;
                return <button className={"b "+(inTeam?"br":"bgr")} onClick={function(){doTogTeam(hero.uid);setSheet(null);}} style={{flex:1,fontSize:14,fontWeight:700}}>{inTeam?"▼ Retirer":"▲ Ajouter"}</button>;
              })()}
            </div>
          </div>
          {(function(){
            function togP(k){setCp(function(p){var o=Object.assign({},p);o[k]=!o[k];return o;});}
            function PH(props){return <div style={{marginBottom:props.open?0:0}}>
              <div onClick={function(){togP(props.k);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",padding:"2px 0"}}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--acc)"}}>{props.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {props.info&&<div onClick={function(e){e.stopPropagation();setInfoPopup(props.k);}} style={{width:22,height:22,borderRadius:"50%",border:"1px solid var(--td)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--td)",cursor:"pointer",fontWeight:700,fontStyle:"italic"}}>i</div>}
                  <span style={{fontSize:14,color:"var(--td)",transition:"transform .2s",transform:props.open?"rotate(180deg)":"rotate(0)"}}>▼</span>
                </div>
              </div>
              {props.open&&<div style={{height:1,background:"var(--brd)",marginTop:6,marginBottom:8}}/>}
            </div>;}
            var ww=gw(hero);var isMag=ht&&ht.wt==="magical";var mainStat=isMag?st.mag:st.str;
            var dmgMin=Math.round(ww.dmg*Math.max(0.1,mainStat)*0.8);var dmgMax=Math.round(ww.dmg*Math.max(0.1,mainStat)*1.2);
            var dmgCrit=Math.round(dmgMax*3);
            var sk=SKILLS[hero.id];var skDmgMin=sk?Math.round(dmgMin*sk.mult):0;var skDmgMax=sk?Math.round(dmgMax*sk.mult):0;
            return <div>
              <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
                <PH k="carac" label="Caractéristiques" open={cp.carac} info="carac"/>
                {cp.carac&&<div>
                  <StatRow icon="🩸" label="Points de vie" val={st.hp} type="flat" tip={mkTip("hp")}/>
                  <div style={{height:6}}/>
                  {!isMag&&<StatRow icon="⚔️" label="Force" val={st.str} type="pm" tip={mkTip("str")}/>}
                  {isMag&&<StatRow icon="🔮" label="Magie" val={st.mag} type="pm" tip={mkTip("mag")}/>}
                  <StatRow icon="💥" label="Critique" val={st.crit} type="pct" tip={mkTip("crit")}/>
                  <div style={{height:6}}/>
                  <StatRow icon="🛡️" label="Vulnérabilité Physique" val={st.phv} type="pmInv" tip={mkTip("phv")}/>
                  <StatRow icon="🔰" label="Vulnérabilité Magique" val={st.mav} type="pmInv" tip={mkTip("mav")}/>
                  <StatRow icon="💨" label="Esquive" val={st.dodge} type="pct" tip={mkTip("dodge")}/>
                  <div style={{height:6}}/>
                  <StatRow icon="♻️" label="Récupération" val={st.rgHp} type="pct" suf="/tour" tip={mkTip("rgHp")}/>
                </div>}
              </div>
              <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
                <PH k="elem" label="Sensibilités Élémentaires" open={cp.elem}/>
                {cp.elem&&<div>
                  <div style={{fontSize:13,color:"#8888bb",fontWeight:600,marginBottom:4}}>🗡️ Attaque</div>
                  <div style={{padding:"5px 0",fontSize:14,borderBottom:"1px solid #ffffff08",marginBottom:8}}>
                    Élément : {atkEl?<span style={{color:(EM[atkEl]||{}).c,fontWeight:700}}>{(EM[atkEl]||{}).i} {atkEl}</span>:<span style={{color:"#666"}}>Neutre</span>}
                    <span style={{fontSize:12,color:"#666",marginLeft:6}}>({ww.name})</span>
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
                </div>}
              </div>
              <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
                <PH k="degats" label="Dégâts" open={cp.degats}/>
                {cp.degats&&<div>
                  <div style={{fontSize:13,marginBottom:6}}>
                    <span style={{color:"#8888bb"}}>Arme :</span> <span style={{fontWeight:600}}>{ww.name}</span> <span style={{color:"var(--td)"}}>({ww.dmg} {isMag?"Magique":"Physique"})</span>
                  </div>
                  <div style={{fontSize:13,marginBottom:4}}>
                    <span style={{color:"#8888bb"}}>{isMag?"Magie":"Force"} :</span> <span style={{fontWeight:600,color:mainStat>=1?"#4ade80":"#facc15"}}>{fmtPM(mainStat)}</span>
                  </div>
                  <div style={{fontSize:13,marginBottom:4}}>
                    <span style={{color:"#8888bb"}}>Formule :</span> <span style={{color:"var(--td)"}}>Arme × {isMag?"Magie":"Force"} × variance(0.8-1.2)</span>
                  </div>
                  <div style={{background:"#ffffff06",borderRadius:8,padding:10,marginTop:6}}>
                    <div style={{fontSize:15,fontWeight:700}}><span style={{color:dmgMin>0?"#4ade80":"#facc15"}}>{dmgMin} — {dmgMax}</span> <span style={{color:"var(--t)"}}>{isMag?"Magique":"Physique"}</span></div>
                  </div>
                </div>}
              </div>
              <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
                <PH k="equip" label="Équipement" open={cp.equip}/>
                {cp.equip&&<div>
                  {["weapon","armor","accessory","talisman"].map(function(sl){var it=hero.equipment?hero.equipment[sl]:null;var lb=sl==="weapon"?"🗡️ Arme":sl==="armor"?"🛡️ Armure":sl==="accessory"?"💍 Accessoire":"🔮 Talisman";
                    return <div key={sl} style={{padding:"5px 0",borderBottom:"1px solid #ffffff08"}}><span style={{fontSize:14,color:"#8888bb"}}>{lb}: </span>{it?<ItemInfo item={it} fs={14}/>:<span style={{fontSize:14,color:"#444"}}>— vide —</span>}</div>;
                  })}
                </div>}
              </div>
              {sk&&<div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
                <PH k="skill" label="Compétence" open={cp.skill}/>
                {cp.skill&&<div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#c0392b,#8b1a1a)",border:"2px solid #fbbf24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚡</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#fbbf24"}}>{sk.name} <span style={{fontSize:11,color:"var(--td)",fontWeight:400}}>Niveau {sk.lvl}</span></div>
                      <div style={{fontSize:12,color:"var(--td)"}}>{sk.desc}</div>
                    </div>
                  </div>
                  <StatRow icon="⏳" label="Recharge" val={st.rel} type="flat" suf=" tours" tip={mkTip("rel")}/>
                </div>}
              </div>}
            </div>;
          })()}
        </div>
      {infoPopup==="carac"&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:440,width:"100%",maxHeight:"80vh",overflowY:"auto",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Cinzel",color:"var(--acc)",marginBottom:12,fontSize:16}}>Détail des caractéristiques</h3>
          <div style={{fontSize:12,lineHeight:1.8,fontFamily:"monospace",color:"#ccc"}}>
            {["hp","str","mag","crit","phv","mav","dodge","rgHp","rel"].map(function(key){
              var arr=st._s[key];if(!arr||!arr.length)return null;
              var total;if(key==="hp"||key==="rel")total=st[key];else if(key==="crit"||key==="dodge"||key==="rgHp")total=fmtPct(st[key]);else total=fmtPM(st[key]);
              var labels={hp:"🩸 Points de vie",str:"⚔️ Force",mag:"🔮 Magie",crit:"💥 Critique",phv:"🛡️ Vuln. Physique",mav:"🔰 Vuln. Magique",dodge:"💨 Esquive",rgHp:"♻️ Récupération",rel:"⏳ Recharge"};
              return <div key={key} style={{marginBottom:10,padding:8,background:"#ffffff04",borderRadius:6}}>
                <div style={{fontWeight:700,color:"var(--acc)",fontSize:13,marginBottom:4}}>{labels[key]||key}</div>
                {arr.map(function(line,li){return <div key={li} style={{color:"#aaa"}}>{line}</div>;})}
                <div style={{fontWeight:700,color:"var(--t)",marginTop:2}}>= {total}</div>
              </div>;
            }).filter(Boolean)}
          </div>
          <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:8,width:"100%"}}>Fermer</button>
        </div>
      </div>}
      {slv&&canLv&&(function(){var sN=cs(Object.assign({},hero,{level:hero.level+1}),g.bl);return <div onClick={function(){setSlv(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Cinzel",color:"var(--acc)",marginBottom:4,fontSize:16,textAlign:"center"}}>⬆️ Niveau {hero.level} → {hero.level+1}</h3>
          <div style={{fontSize:13,color:"var(--td)",textAlign:"center",marginBottom:12}}>{hero.name}</div>
          <div style={{textAlign:"left"}}>
            {(function(){var rows=[];
              function addIf(icon,label,v,nv,type){var dA,dB;if(type==="flat"){dA=String(Math.floor(v));dB=String(Math.floor(nv));if(dA===dB)return;}else if(type==="pm"||type==="pmInv"){dA=fmtPM(v);dB=fmtPM(nv);if(dA===dB)return;}else{dA=fmtPct(v);dB=fmtPct(nv);if(dA===dB)return;}rows.push({icon:icon,label:label,val:v,nv:nv,type:type});}
              addIf("🩸","Points de vie",st.hp,sN.hp,"flat");addIf("⚔️","Force",st.str,sN.str,"pm");addIf("🔮","Magie",st.mag,sN.mag,"pm");addIf("💥","Critique",st.crit,sN.crit,"pct");addIf("🛡️","Vuln. Physique",st.phv,sN.phv,"pmInv");addIf("🔰","Vuln. Magique",st.mav,sN.mav,"pmInv");addIf("💨","Esquive",st.dodge,sN.dodge,"pct");
              return rows.map(function(r,i){return <StatRow key={i} icon={r.icon} label={r.label} val={r.val} nv={r.nv} type={r.type}/>;});})()}
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="b bgr glow" onClick={function(){doLvUp(hero.uid);setSlv(false);}} style={{flex:1,fontSize:14}}>✓ Confirmer</button>
            <button className="b" onClick={function(){setSlv(false);}} style={{flex:1,fontSize:14}}>Annuler</button>
          </div>
        </div>
      </div>;})()}
      {tomePanel===hero.uid&&<div onClick={function(){setTomePanel(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Cinzel",color:"var(--acc)",marginBottom:12,fontSize:16}}>📖 Utiliser des Tomes</h3>
          <div style={{fontSize:13,color:"var(--td)",marginBottom:12}}>Sélectionnez les tomes à utiliser pour {hero.name}</div>
          {(function(){var co=g.conso||{};var totalXp=0;var rows=TOMES.map(function(tm){var qty=tomeQty[tm.id]||0;var have=co[tm.id]||0;if(have<=0&&qty<=0)return null;totalXp+=qty*tm.xp;var trc=(RA[tm.rarity]||{}).c;return <div key={tm.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #ffffff08"}}>
            <div><span style={{color:trc,fontWeight:600,fontSize:13}}>{tm.icon} {tm.name}</span><span style={{fontSize:11,color:"var(--td)",marginLeft:6}}>({have} dispo · +{tm.xp} xp)</span></div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <button className="b" style={{padding:"2px 8px",fontSize:14}} disabled={qty<=0} onClick={function(){setTomeQty(function(p){var o=Object.assign({},p);o[tm.id]=Math.max(0,(o[tm.id]||0)-1);return o;});}}>-</button>
              <span style={{minWidth:24,textAlign:"center",fontWeight:700,fontSize:14}}>{qty}</span>
              <button className="b" style={{padding:"2px 8px",fontSize:14}} disabled={qty>=have} onClick={function(){setTomeQty(function(p){var o=Object.assign({},p);o[tm.id]=Math.min(have,(o[tm.id]||0)+1);return o;});}}>+</button>
            </div>
          </div>;}).filter(Boolean);
          return <div>{rows.length?rows:<div style={{color:"var(--td)",fontSize:13,padding:10}}>Aucun tome disponible</div>}
            {totalXp>0&&<div style={{textAlign:"center",marginTop:10,fontSize:16,fontWeight:700,color:"#a855f7"}}>+{totalXp} XP</div>}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="b bgr" disabled={totalXp<=0} onClick={function(){setG(function(p){var nc=Object.assign({},p.conso||{});for(var tk in tomeQty){if(tomeQty[tk]>0)nc[tk]=(nc[tk]||0)-tomeQty[tk];}return Object.assign({},p,{conso:nc,roster:p.roster.map(function(r){return r.uid===hero.uid?Object.assign({},r,{xp:r.xp+totalXp}):r;})});});setTomePanel(null);}} style={{flex:1,fontSize:14}}>Valider</button>
              <button className="b" onClick={function(){setTomePanel(null);}} style={{flex:1,fontSize:14}}>Annuler</button>
            </div>
          </div>;})()}
        </div>
      </div>}
      </div>);
    }
  }

  var TM={base:"🏰 Ville",roster:"👥 Héros",equip:"⚙️ Équipement",inventaire:"📦 Inventaire",donjon:"⚔️ Donjon",invocation:"🎲 Invocation"};

  return(<div style={{minHeight:"100vh",background:"var(--bg)",padding:"12px 8px",maxWidth:900,margin:"0 auto"}}><style>{css}</style>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:14,marginBottom:10,border:"1px solid var(--brd)"}}>
      <h1 style={{fontFamily:"Cinzel",fontSize:20,fontWeight:900,color:"var(--acc)",textShadow:"0 0 12px #c0392b30"}}>⚔️ ECLIPSIA</h1>
      <div style={{display:"flex",gap:14,fontSize:15,fontWeight:600,alignItems:"center"}}>
        <span>💰 {g.gold.toLocaleString()}</span><span>📜 {g.scrolls||0}</span>
        <div style={{position:"relative"}}>
          <button onClick={function(){setMenuOpen(!menuOpen);}} style={{background:"none",border:"none",color:"var(--t)",fontSize:20,cursor:"pointer",padding:"0 4px"}}>☰</button>
          {menuOpen&&<div style={{position:"absolute",right:0,top:30,background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:6,minWidth:200,zIndex:100,animation:"fi .2s ease"}}>
            <div onClick={function(){setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"var(--td)"}}>📖 Tutoriel</div>
            <div onClick={function(){setPatchNotes(true);setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6}}>📋 Notes de mise à jour</div>
            <div onClick={function(){reset();setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"var(--red)"}}>🔄 Réinitialiser</div>
            <div onClick={function(){setG(function(p){var nc=Object.assign({},p.conso||{});nc.tome_5=(nc.tome_5||0)+100;return Object.assign({},p,{gold:p.gold+100000,scrolls:(p.scrolls||0)+1000,conso:nc});});setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"#fbbf24"}}>🎮 Cheat</div>
          </div>}
        </div>
      </div>
    </div>
    {patchNotes&&<div onClick={function(){setPatchNotes(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:500,maxHeight:"80vh",overflowY:"auto",border:"1px solid var(--brd)"}}>
      <h3 style={{fontFamily:"Cinzel",color:"var(--acc)",marginBottom:12}}>Notes de mise à jour</h3>
      <div style={{fontSize:13,color:"var(--td)",lineHeight:1.8}}>
        <div style={{fontWeight:700,color:"var(--t)",marginBottom:4}}>v0.5</div>
        <div>• Refonte complète de l'affichage : termes complets au lieu des abréviations</div>
        <div>• Tomes d'expérience : obtenables via invocation (doublons) et marché</div>
        <div>• Fragments d'âme : obtenables via doublons d'invocation</div>
        <div>• Forgeron : nouvelle interface avec tutoriel et prévisualisation</div>
        <div>• Marché : articles classés par catégorie, nouveaux items</div>
        <div>• Donjons : loot garanti à la victoire, bonus XP de victoire</div>
        <div>• Équilibrage : vulnérabilités élémentaires plus marquées</div>
        <div>• Correction du bug d'accessoires (traits manquants)</div>
        <div>• Statistique non pertinente masquée dans le profil</div>
        <div>• Indicateur visuel si arme du mauvais type équipée</div>
        <div>• Scaling d'étape réduit (5%)</div>
        <div>• Chances de forge ajustées (courbe exponentielle)</div>
        <div>• Recyclage : 75% inerte, 60% gabarit, 45% catalyseur</div>
      </div>
      <button className="b" onClick={function(){setPatchNotes(false);}} style={{marginTop:12,width:"100%"}}>Fermer</button>
    </div></div>}
    <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>{Object.keys(TM).map(function(k){return <button key={k} className={"b "+(tab===k?"ton":"")} onClick={function(){if(!inD||k==="donjon")setTab(k);}} style={{fontSize:11,flex:"1 1 auto",minWidth:70,opacity:inD&&k!=="donjon"?.3:1}}>{TM[k]}</button>;})}
    </div>
    {floats.filter(function(f){return f.uid==="ui";}).length>0&&<div style={{position:"fixed",top:(floats.find(function(f){return f.uid==="ui";}).y||100)-30,left:(floats.find(function(f){return f.uid==="ui";}).x||200),zIndex:200,pointerEvents:"none"}}>
      {floats.filter(function(f){return f.uid==="ui";}).map(function(f){return <div key={f.id} style={{color:f.color,fontSize:16,fontWeight:800,textShadow:"0 2px 6px #000",animation:"floatUp 1.2s forwards",textAlign:"center",whiteSpace:"nowrap"}}>{f.val}</div>;})}
    </div>}

    {tab==="base"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:10}}>🏰 Ville</h2>
      {(function(){
        var m=g.mat||{};var flv=g.bl.forge||1;
        function forgeChance(rank,rarity,fLv){var diff=Math.max(0,(rank-2)*12+Math.max(0,(rarity-2))*20+Math.max(0,(rank-3))*(rarity-1)*5);var skill=fLv*10;var ch=100-diff+skill;return Math.max(2,Math.min(100,Math.round(ch)));}
        var inerteKey=fs.slot+"_inerte";var gabKey="gabarit_"+fs.rank;var cataKey="catalyseur_"+fs.rar;
        var hasInerte=(m[inerteKey]||0)>0;var hasGab=(m[gabKey]||0)>0;var hasCata=(m[cataKey]||0)>0;
        var canForge=hasInerte&&hasGab&&hasCata;
        var fChance=forgeChance(fs.rank,fs.rar,flv);
        var GABARIT_NAMES=["","Gabarit sommaire","Gabarit imprécis","Gabarit approximatif","Gabarit brouillon","Gabarit rudimentaire","Gabarit basique","Gabarit correct","Gabarit soigné","Gabarit précis","Gabarit rigoureux","Gabarit abouti","Gabarit maîtrisé","Gabarit élaboré","Gabarit expert","Gabarit exceptionnel"];
        var CATA_NAMES=["","Catalyseur commun","Catalyseur inhabituel","Catalyseur rare","Catalyseur épique","Catalyseur légendaire"];
        var SLOT_NAMES={weapon:"Arme",armor:"Armure",accessory:"Accessoire",talisman:"Talisman"};
        var SLOT_KEYS=["weapon","armor","accessory","talisman"];
        function doForge(){
          if(!canForge)return;
          setG(function(p){
            var nm=Object.assign({},p.mat||{});nm[inerteKey]=(nm[inerteKey]||0)-1;nm[gabKey]=(nm[gabKey]||0)-1;nm[cataKey]=(nm[cataKey]||0)-1;
            return Object.assign({},p,{mat:nm});
          });
          if(Math.random()*100<fChance){
            var item;
            if(fs.slot==="weapon")item=generateWeapon(fs.rank,fs.rar);
            else if(fs.slot==="armor")item=generateArmor(fs.rank,fs.rar);
            else if(fs.slot==="accessory")item=generateAccessory(fs.rank,fs.rar);
            else item=generateTalisman(fs.rank,fs.rar);
            item.uid=uid();
            setG(function(p){return Object.assign({},p,{inv:[].concat(p.inv,[item])});});
            setFResult({ok:true,item:item});
          }else{setFResult({ok:false});}
        }
        var FORGE_COSTS={2:500,3:1000,4:2500,5:10000,6:25000,7:50000,8:100000,9:250000,10:500000};
        var fNextCost=flv<10?FORGE_COSTS[flv+1]||null:null;
        // Market
        var mlv=g.bl.marche||1;
        var MARCHE_COSTS={2:2000,3:8000,4:25000,5:75000};
        var mNextCost=mlv<5?MARCHE_COSTS[mlv+1]||null:null;
        // Shop items categorized
        var shopConso=[];var shopGab=[];var shopCata=[];
        if(mlv>=1){shopConso.push({id:"scroll",name:"Parchemin d'invocation",cost:1000,rar:1,icon:"📜"});shopConso.push({id:"scroll_10",name:"Parchemin d'invocation ×10",cost:9500,rar:1,icon:"📜",qty:10});shopGab.push({id:"gabarit_1",name:GABARIT_NAMES[1]+" (Rang 1)",cost:100,rar:1,icon:"📐"});shopCata.push({id:"catalyseur_1",name:CATA_NAMES[1],cost:250,rar:1,icon:"💎"});}
        if(mlv>=2){shopConso.push({id:"tome_1",name:"Tome d'expérience mineur",cost:150,rar:1,icon:"📖"});shopGab.push({id:"gabarit_2",name:GABARIT_NAMES[2]+" (Rang 2)",cost:250,rar:1,icon:"📐"});shopCata.push({id:"catalyseur_2",name:CATA_NAMES[2],cost:750,rar:2,icon:"💎"});}
        if(mlv>=3){shopGab.push({id:"gabarit_3",name:GABARIT_NAMES[3]+" (Rang 3)",cost:600,rar:1,icon:"📐"});}
        if(mlv>=4){shopConso.push({id:"tome_2",name:"Tome d'expérience",cost:2000,rar:2,icon:"📖"});}
        function doBuy(item){
          if(g.gold<item.cost)return;
          setFloats(function(f){return f.concat([{uid:"ui",val:"+1 "+item.name,color:"#4ade80",id:uid()}]);});
          setG(function(p){
            var np=Object.assign({},p,{gold:p.gold-item.cost});
            if(item.id==="scroll"){np.scrolls=(np.scrolls||0)+1;}
            else if(item.id==="scroll_10"){np.scrolls=(np.scrolls||0)+10;}
            else if(item.id.indexOf("tome_")===0){var nc=Object.assign({},np.conso||{});nc[item.id]=(nc[item.id]||0)+1;np.conso=nc;}
            else{var nm=Object.assign({},np.mat||{});nm[item.id]=(nm[item.id]||0)+1;np.mat=nm;}
            return np;
          });
        }
        function ShopCard(props){var si=props.item;var rc=(RA[si.rar]||{}).c||"#888";return <div style={{background:rc+"08",border:"1px solid "+rc+"30",borderRadius:10,padding:10}}>
          <div style={{fontWeight:700,fontSize:13,color:rc}}>{si.icon} {si.name}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <span style={{fontSize:13,color:"#fbbf24",fontWeight:600}}>{si.cost.toLocaleString()}g</span>
            <button className="b bg" disabled={g.gold<si.cost} onClick={function(){doBuy(si);}} style={{fontSize:12,padding:"4px 12px"}}>Acheter</button>
          </div>
        </div>;}
        var BUILDING_INFO={forge:"Le forgeron permet de créer de l'équipement à partir de divers composants. La base inerte définit le type d'équipement créé, le gabarit son rang, et le catalyseur sa rareté. Les chances de réussite sont proportionnelles à la complexité de l'équipement désiré. Augmenter le niveau d'expertise du forgeron permet d'augmenter les chances de succès. Il est possible d'acquérir des composants supplémentaires en recyclant de l'équipement ou en les achetant au marché.",marche:"Le marché propose divers composants et consommables à l'achat. Améliorer le marché débloque de nouveaux articles.",alchimiste:"L'alchimiste pourra transformer et améliorer vos consommables et matériaux. (Bientôt disponible)"};
        function PnlH(props){var isOpen=vp===props.k;return <div style={{marginBottom:isOpen?0:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,cursor:"pointer",background:"var(--card)",border:"1px solid var(--brd)",borderRadius:isOpen?"12px 12px 0 0":"12px"}} onClick={props.onClick}>
            <div><span style={{fontSize:20,marginRight:8}}>{props.icon}</span><span style={{fontWeight:700,fontSize:14}}>{props.name}</span>{props.lv!=null&&<span style={{fontSize:11,color:"var(--acc)",marginLeft:6}}>Nv.{props.lv}</span>}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {BUILDING_INFO[props.k]&&<div onClick={function(e){e.stopPropagation();setInfoPopup("bld_"+props.k);}} style={{width:22,height:22,borderRadius:"50%",border:"1px solid var(--td)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--td)",cursor:"pointer",fontWeight:700,fontStyle:"italic"}}>i</div>}
              <span style={{fontSize:14,color:"var(--td)",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
            </div>
          </div>
        </div>;}
        return <div>
          {/* FORGERON */}
          <PnlH k="forge" name="Forgeron" icon="🔨" lv={flv} onClick={function(){setVp(vp==="forge"?"none":"forge");}}/>
          {vp==="forge"&&<div style={{background:"var(--card)",borderRadius:"0 0 12px 12px",padding:14,marginBottom:6,border:"1px solid var(--brd)",borderTop:"none"}}>

            {/* 3 lines: Type, Rang, Rareté — show item names */}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #ffffff08"}}>
                <span style={{fontSize:13,color:"var(--td)",minWidth:60}}>Type</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){var i=SLOT_KEYS.indexOf(fs.slot);setFs(Object.assign({},fs,{slot:SLOT_KEYS[(i-1+4)%4]}));setFResult(null);}}>◀</button>
                  <div style={{minWidth:130,textAlign:"center",fontSize:13,fontWeight:600}}>{SLOT_NAMES[fs.slot]+" inerte"}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){var i=SLOT_KEYS.indexOf(fs.slot);setFs(Object.assign({},fs,{slot:SLOT_KEYS[(i+1)%4]}));setFResult(null);}}>▶</button>
                </div>
                <span style={{fontSize:11,color:hasInerte?"#4ade80":"#ef4444",minWidth:80,textAlign:"right"}}>{m[inerteKey]||0} en stock</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #ffffff08"}}>
                <span style={{fontSize:13,color:"var(--td)",minWidth:60}}>Rang</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rank:Math.max(1,fs.rank-1)}));setFResult(null);}}>◀</button>
                  <div style={{minWidth:130,textAlign:"center",fontSize:13,fontWeight:600}}>{GABARIT_NAMES[fs.rank]+" (Rang "+fs.rank+")"}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rank:Math.min(15,fs.rank+1)}));setFResult(null);}}>▶</button>
                </div>
                <span style={{fontSize:11,color:hasGab?"#4ade80":"#ef4444",minWidth:80,textAlign:"right"}}>{m[gabKey]||0} en stock</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
                <span style={{fontSize:13,color:"var(--td)",minWidth:60}}>Rareté</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rar:Math.max(1,fs.rar-1)}));setFResult(null);}}>◀</button>
                  <div style={{minWidth:130,textAlign:"center",fontSize:13,fontWeight:600,color:(RA[fs.rar]||{}).c}}>{CATA_NAMES[fs.rar]}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rar:Math.min(5,fs.rar+1)}));setFResult(null);}}>▶</button>
                </div>
                <span style={{fontSize:11,color:hasCata?"#4ade80":"#ef4444",minWidth:80,textAlign:"right"}}>{m[cataKey]||0} en stock</span>
              </div>
            </div>
            {/* Live preview */}
            <div style={{background:"#ffffff06",borderRadius:8,padding:10,marginBottom:10,textAlign:"center"}}>
              <div style={{fontSize:12,color:"var(--td)",marginBottom:4}}>Résultat attendu</div>
              <div style={{fontSize:15,fontWeight:700,color:(RA[fs.rar]||{}).c}}>{SLOT_NAMES[fs.slot]} · Rang {fs.rank} · {(RA[fs.rar]||{}).s}</div>
            </div>
            {/* Chance + button */}
            <div style={{textAlign:"center",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:700,color:fChance>=80?"#4ade80":fChance>=50?"#fbbf24":fChance>0?"#ef8855":"#ef4444"}}>Chance de réussite : {fChance}%</div>
            </div>
            <button className="b bg" disabled={!canForge||fChance<=0} onClick={doForge} style={{width:"100%",fontSize:14,marginBottom:8}}>🔨 Forger</button>
            {fResult&&<div style={{textAlign:"center",padding:10,background:"#ffffff06",borderRadius:8}}>
              {fResult.ok?<div><div style={{color:"#4ade80",fontWeight:700,fontSize:15,marginBottom:4}}>Succès !</div><ItemInfo item={fResult.item}/></div>
              :<div style={{color:"#ef4444",fontWeight:700,fontSize:15}}>Échec... Les matériaux sont perdus.</div>}
            </div>}
            {/* Bottom upgrade bandeau */}
            {fNextCost!=null&&<div style={{background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:8,padding:10,marginTop:10,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>Améliorer le Forgeron au niveau {flv+1}</span>
              <button className="b bg" disabled={g.gold<fNextCost} onClick={function(){if(g.gold<fNextCost)return;setG(function(p){var bl=Object.assign({},p.bl);bl.forge=(bl.forge||1)+1;return Object.assign({},p,{gold:p.gold-fNextCost,bl:bl});});}} style={{fontSize:13,padding:"6px 14px"}}>{fNextCost.toLocaleString()} or</button>
            </div>}
          </div>}

          {/* MARCHÉ */}
          <PnlH k="marche" name="Marché" icon="🏪" lv={mlv} onClick={function(){setVp(vp==="marche"?"none":"marche");}}/>
          {vp==="marche"&&<div style={{background:"var(--card)",borderRadius:"0 0 12px 12px",padding:14,marginTop:-6,marginBottom:10,border:"1px solid var(--brd)",borderTop:"none"}}>
            <div>
              {shopConso.length>0&&<div>
                <div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Consommables</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>
                  {shopConso.map(function(si){return <ShopCard key={si.id} item={si}/>;})}
                </div>
              </div>}
              {shopGab.length>0&&<div>
                <div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Gabarits</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>
                  {shopGab.map(function(si){return <ShopCard key={si.id} item={si}/>;})}
                </div>
              </div>}
              {shopCata.length>0&&<div>
                <div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Catalyseurs</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>
                  {shopCata.map(function(si){return <ShopCard key={si.id} item={si}/>;})}
                </div>
              </div>}
              {/* Bottom upgrade bandeau */}
              {mNextCost!=null&&mlv<5&&<div style={{background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:8,padding:10,marginTop:4,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>Améliorer le Marché au niveau {mlv+1}</span>
                <button className="b bg" disabled={g.gold<mNextCost} onClick={function(){setG(function(p){var bl=Object.assign({},p.bl);bl.marche=(bl.marche||1)+1;return Object.assign({},p,{gold:p.gold-mNextCost,bl:bl});});}} style={{fontSize:13,padding:"6px 14px"}}>{mNextCost.toLocaleString()} or</button>
              </div>}
            </div>
          </div>}

          {/* ALCHIMISTE */}
          <PnlH k="alchimiste" name="Alchimiste" icon="⚗️" onClick={function(){}}/>

          {/* Building info popup */}
          {infoPopup&&infoPopup.indexOf("bld_")===0&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:440,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
              <h3 style={{fontFamily:"Cinzel",color:"var(--acc)",marginBottom:12,fontSize:16}}>{(function(){var k=infoPopup.slice(4);return k==="forge"?"🔨 Forgeron":k==="marche"?"🏪 Marché":k==="alchimiste"?"⚗️ Alchimiste":"Info";})()}</h3>
              <div style={{fontSize:13,color:"var(--td)",lineHeight:1.8,fontStyle:"italic"}}>{BUILDING_INFO[infoPopup.slice(4)]||"Informations à venir."}</div>
              <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:12,width:"100%"}}>Fermer</button>
            </div>
          </div>}

          {/* Other buildings - greyed out */}
          {[{k:"rempart",n:"Rempart",ic:"🏰"},{k:"autel",n:"Autel",ic:"🩸"},{k:"tour",n:"Tour Arcane",ic:"🗼"},{k:"ecole",n:"École",ic:"📖"},{k:"mine",n:"Mine",ic:"⛏️"},{k:"oracle",n:"Oracle",ic:"🔮"},{k:"taverne",n:"Taverne",ic:"🍺"}].map(function(b){
            return <div key={b.k} style={{display:"flex",alignItems:"center",padding:12,background:"#0e0d0d",border:"1px solid #1a1515",borderRadius:12,marginBottom:6,opacity:0.3}}>
              <span style={{fontSize:20,marginRight:8}}>{b.ic}</span><span style={{fontWeight:700,fontSize:14,color:"#555"}}>{b.n}</span><span style={{marginLeft:"auto",fontSize:11,color:"#444"}}>Bientôt</span>
            </div>;
          })}
        </div>;
      })()}
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
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <Portrait id={h.id} size={48} fs={24} icon={h.icon} canLv={canL}/>
                <div><div style={{fontWeight:700,fontSize:14}}>{h.name}</div><div style={{fontSize:12,color:(RA[h.rarity]||{}).c,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
              </div>
              <div style={{fontSize:16,fontWeight:700,lineHeight:1.8}}>
                <div>🩸 {hst.hp}</div>
                {(function(){var ww=gw(h);var ht2=HEROES.find(function(hh){return hh.id===h.id;});var heroMag=ht2&&ht2.wt==="magical";var iM=ww.wt==="magical";var wrongType=heroMag!==iM;var ms=iM?hst.mag:hst.str;var avg=Math.round(ww.dmg*Math.max(0.1,ms));var dmgCol=wrongType?"#ef4444":ms>=1?"#4ade80":"#facc15";return <div>{iM?"🔮":"⚔️"} <span style={{color:dmgCol}}>~{avg}</span> <span style={{color:wrongType?"#ef4444":"var(--t)"}}>({iM?"Magique":"Physique"}){wrongType?" ⚠":"" }</span></div>;})()}
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
            style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:8,cursor:"grab",position:"relative"}}>
            {canL&&<div style={{position:"absolute",top:4,left:4,fontSize:14,animation:"arr 1s infinite, glw 1.5s infinite"}}>⬆️</div>}
            <div style={{position:"absolute",top:4,right:8,fontSize:20,fontWeight:900,color:rc+"80",fontFamily:"Cinzel"}}>{h.level}</div>
            <div style={{paddingRight:30}}><div style={{fontWeight:700,fontSize:12}}>{h.name}</div><div style={{fontSize:10,color:rc,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
          </div>;
        })}
      </div>
      {!g.roster.length&&<div style={{textAlign:"center",padding:40,color:"var(--td)",fontSize:14}}>Pas de héros — Invoc. !</div>}
    </div>}

    {tab==="equip"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:8}}>⚙️ Équipement</h2>
      {/* Team heroes — same as roster */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:10}}>
        {[0,1,2,3].map(function(i){
          var h=g.team[i]?g.roster.find(function(r){return r.uid===g.team[i];}):null;
          if(!h)return <div key={i} style={{minHeight:140,borderRadius:14,border:"2px dashed var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",color:"#444",fontSize:12}}>Vide</div>;
          var hst=cs(h,g.bl);var rc=(RA[h.rarity]||{}).c;var isSel=sel===h.uid;
          return <div key={i} onClick={function(){setSel(sel===h.uid?null:h.uid);}} style={{minHeight:140,borderRadius:14,padding:10,background:isSel?rc+"25":rc+"12",border:isSel?"2px solid "+rc:"2px solid "+rc+"50",cursor:"pointer",position:"relative"}}>
            <div style={{position:"absolute",top:0,right:8,fontSize:26,fontWeight:900,color:rc+"80",fontFamily:"Cinzel"}}>{h.level}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Portrait id={h.id} size={48} fs={24} icon={h.icon}/>
              <div><div style={{fontWeight:700,fontSize:14}}>{h.name}</div><div style={{fontSize:12,color:rc,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
            </div>
            <div style={{fontSize:16,fontWeight:700,lineHeight:1.8}}>
              <div>🩸 {hst.hp}</div>
              {(function(){var ww=gw(h);var ht2=HEROES.find(function(hh){return hh.id===h.id;});var heroMag=ht2&&ht2.wt==="magical";var iM=ww.wt==="magical";var wrongType=heroMag!==iM;var ms=iM?hst.mag:hst.str;var avg=Math.round(ww.dmg*Math.max(0.1,ms));var dmgCol=wrongType?"#ef4444":ms>=1?"#4ade80":"#facc15";return <div>{iM?"🔮":"⚔️"} <span style={{color:dmgCol}}>~{avg}</span> <span style={{color:wrongType?"#ef4444":"var(--t)"}}>({iM?"Magique":"Physique"}){wrongType?" ⚠":"" }</span></div>;})()}
            </div>
          </div>;
        })}
      </div>
      {/* Reserve heroes — same format as roster reserve */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6,marginBottom:10}}>
        {sR.filter(function(h){return g.team.indexOf(h.uid)<0;}).map(function(h){
          var rc=(RA[h.rarity]||{}).c;var isSel=sel===h.uid;
          return <div key={h.uid} onClick={function(){setSel(sel===h.uid?null:h.uid);}}
            style={{background:isSel?rc+"20":"var(--card)",border:isSel?"2px solid "+rc:"1px solid var(--brd)",borderRadius:10,padding:8,cursor:"pointer",position:"relative"}}>
            <div style={{position:"absolute",top:4,right:8,fontSize:20,fontWeight:900,color:rc+"80",fontFamily:"Cinzel"}}>{h.level}</div>
            <div style={{paddingRight:30}}><div style={{fontWeight:700,fontSize:12}}>{h.name}</div><div style={{fontSize:10,color:rc,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div></div>
          </div>;
        })}
      </div>
      {selH&&<div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:8,border:"1px solid var(--brd)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:14}}>{selH.name}</div>
          <button className="b" onClick={function(){setSheet(selH.uid);}} style={{fontSize:11,padding:"4px 10px"}}>📋 Profil</button>
        </div>
        {["weapon","armor","accessory","talisman"].map(function(sl){var it=selH.equipment?selH.equipment[sl]:null;var lb=sl==="weapon"?"🗡️ Arme":sl==="armor"?"🛡️ Armure":sl==="accessory"?"💍 Accessoire":"🔮 Talisman";
          return <div key={sl} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px",background:"#ffffff06",borderRadius:8,marginBottom:4}}>
            <div style={{flex:1}}><span style={{color:"var(--td)",fontSize:13}}>{lb}: </span>{it?<ItemInfo item={it} fs={13}/>:<span style={{color:"#444",fontSize:13}}>vide</span>}</div>
            {it&&<button className="b" style={{fontSize:10,padding:"3px 6px",marginLeft:8}} onClick={function(){doUneq(selH.uid,sl);}}>×</button>}</div>;
        })}
      </div>}
      <h3 style={{fontSize:14,color:"var(--td)",marginBottom:6}}>Armurerie ({g.inv.length})</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:6}}>
        {g.inv.sort(function(a,b){var so={weapon:0,armor:1,accessory:2,talisman:3};var sa=so[a.slot]||0,sb=so[b.slot]||0;return sa-sb||b.rarity-a.rarity;}).map(function(it){
          return <div key={it.uid} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:10,display:"flex",flexDirection:"column",position:"relative"}}>
            <div style={{position:"absolute",top:4,right:4,display:"flex",gap:3}}>
              <button onClick={function(e){doRecycle(it.uid,e);}} style={{fontSize:9,padding:"2px 6px",borderRadius:6,border:"1px solid var(--brd)",background:"#152a15",color:"#4ade80",cursor:"pointer",fontWeight:700}} title="Recycler">♻️</button>
              <button onClick={function(e){doSell(it.uid,e);}} style={{fontSize:9,padding:"2px 6px",borderRadius:6,border:"1px solid var(--brd)",background:"#2a1515",color:"#ef4444",cursor:"pointer",fontWeight:700}} title={"Vendre ("+sellPrice(it)+"g)"}>💰</button>
            </div>
            <div style={{flex:1,paddingRight:50}}><ItemInfo item={it} fs={13}/></div>
            {sel&&<button className="b bgr" style={{fontSize:11,width:"100%",marginTop:8}} onClick={function(){doEquip(sel,it.uid);}}>Équiper</button>}</div>;
        })}
      </div>
      {!g.inv.length&&<div style={{textAlign:"center",padding:20,color:"var(--td)",fontSize:12}}>Vide !</div>}
    </div>}

    {tab==="inventaire"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:10}}>📦 Inventaire</h2>
      {(function(){
        var m=g.mat||{};var co=g.conso||{};
        var GABARIT_NAMES=["","Gabarit sommaire","Gabarit imprécis","Gabarit approximatif","Gabarit brouillon","Gabarit rudimentaire","Gabarit basique","Gabarit correct","Gabarit soigné","Gabarit précis","Gabarit rigoureux","Gabarit abouti","Gabarit maîtrisé","Gabarit élaboré","Gabarit expert","Gabarit exceptionnel"];
        var CATA_NAMES=["","Catalyseur commun","Catalyseur inhabituel","Catalyseur rare","Catalyseur épique","Catalyseur légendaire"];
        function matRow(key,name,qty,rar,icon){var rc=rar===1?"var(--t)":(RA[rar]||{}).c||"var(--t)";return <div key={key} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #ffffff08"}}><span style={{color:rc,fontSize:14}}>{icon?icon+" ":""}{name}</span><span style={{fontFamily:"monospace",fontWeight:600,fontSize:14,color:"var(--t)"}}>{qty}</span></div>;}
        // Monnaies
        var monnaies=[{n:"Pièces d'or",v:g.gold,r:1,ic:"💰"}];
        // Consommables: scrolls + tomes + fragments
        var consoList=[];
        consoList.push({k:"scrolls",n:"Parchemins d'invocation",v:g.scrolls||0,r:1,ic:"📜"});
        for(var ti=0;ti<TOMES.length;ti++){var tm=TOMES[ti];if((co[tm.id]||0)>0)consoList.push({k:tm.id,n:tm.name,v:co[tm.id],r:tm.rarity,ic:tm.icon});}
        var fragList=[];
        for(var fi=0;fi<FRAGMENTS.length;fi++){var fr=FRAGMENTS[fi];if((co[fr.id]||0)>0)fragList.push({k:fr.id,n:fr.name,v:co[fr.id],r:fr.rarity,ic:fr.icon});}
        // Matériaux: inertes, gabarits by rank, catalyseurs by rarity
        var inertes=[];
        var inerteSlots=[["weapon_inerte","Arme inerte",1,"🔩"],["armor_inerte","Armure inerte",1,"🔩"],["accessory_inerte","Accessoire inerte",1,"🔩"],["talisman_inerte","Talisman inerte",1,"🔩"]];
        for(var ii=0;ii<inerteSlots.length;ii++){var ik=inerteSlots[ii];if(m[ik[0]]>0)inertes.push({k:ik[0],n:ik[1],v:m[ik[0]],r:ik[2],ic:ik[3]});}
        var gabarits=[];
        for(var gi=1;gi<=15;gi++){var gk="gabarit_"+gi;var gabRarity=gi<=3?1:gi<=6?2:gi<=9?3:gi<=12?4:5;if(m[gk]>0)gabarits.push({k:gk,n:GABARIT_NAMES[gi]+" (Rang "+gi+")",v:m[gk],r:gabRarity,ic:"📐"});}
        var catalyseurs=[];
        for(var ci=1;ci<=5;ci++){var ck="catalyseur_"+ci;if(m[ck]>0)catalyseurs.push({k:ck,n:CATA_NAMES[ci],v:m[ck],r:ci,ic:"💎"});}
        return <div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--acc)",marginBottom:8}}>Monnaies</div>
            {monnaies.map(function(x){return matRow(x.n,x.n,x.v.toLocaleString(),x.r,x.ic);})}
          </div>
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--acc)",marginBottom:8}}>Consommables</div>
            {consoList.map(function(x){return matRow(x.k,x.n,x.v,x.r,x.ic);})}
          </div>
          {fragList.length>0&&<div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--acc)",marginBottom:8}}>Fragments d'âme</div>
            {fragList.map(function(x){return matRow(x.k,x.n,x.v,x.r,x.ic);})}
          </div>}
          <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:10,border:"1px solid var(--brd)"}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--acc)",marginBottom:8}}>Matériaux de forge</div>
            {inertes.length>0&&<div style={{fontSize:12,color:"var(--td)",fontWeight:600,marginBottom:4,marginTop:4}}>Bases inertes</div>}
            {inertes.map(function(x){return matRow(x.k,x.n,x.v,x.r,x.ic);})}
            {gabarits.length>0&&<div style={{fontSize:12,color:"var(--td)",fontWeight:600,marginBottom:4,marginTop:8}}>Gabarits</div>}
            {gabarits.map(function(x){return matRow(x.k,x.n,x.v,x.r,x.ic);})}
            {catalyseurs.length>0&&<div style={{fontSize:12,color:"var(--td)",fontWeight:600,marginBottom:4,marginTop:8}}>Catalyseurs</div>}
            {catalyseurs.map(function(x){return matRow(x.k,x.n,x.v,x.r,x.ic);})}
            {!inertes.length&&!gabarits.length&&!catalyseurs.length&&<div style={{color:"var(--td)",fontSize:13}}>Aucun matériau. Recyclez de l'équipement !</div>}
          </div>
        </div>;
      })()}
    </div>}

    {tab==="donjon"&&<div style={{animation:"fi .3s ease"}}>
      {!dun&&<div><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:4}}>⚔️ Donjons</h2><div style={{fontSize:13,color:"var(--td)",marginBottom:8}}>Équipe: {team.length}/4</div>
        {DG.map(function(d,i){var bt=g.beaten||[];var lk=d.ul>=0&&bt.indexOf(d.ul)<0;if(d.secret&&bt.indexOf(29)<0)lk=true;if(lk)return null;var isOpen=dExp===i;var beaten=bt.indexOf(i)>=0;
          var enmPool=(d.enemies||[]).map(function(eid){return ENM.find(function(e){return e.id===eid;});}).filter(Boolean);
          var bssPool=(d.bosses||[]).map(function(bid){return BSS.find(function(b){return b.id===bid;});}).filter(Boolean);
          var lootInfo=d.loot?("Rang "+d.loot.ranks[0]+"-"+d.loot.ranks[1]+", "+Object.keys(d.loot.rarW).map(function(r){return (RA[parseInt(r)]||{}).n+" "+Math.round(d.loot.rarW[r]*100)+"%";}).join(", ")):"";
          return <div key={i} style={{background:"var(--card)",border:beaten?"1px solid #4ade8040":"1px solid var(--brd)",borderRadius:12,marginBottom:6,overflow:"hidden"}}>
          <div onClick={function(){setDExp(isOpen?null:i);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,cursor:"pointer"}}>
            <div><div style={{fontWeight:700,fontSize:15}}>{beaten?"✅ ":""}{d.name}</div><div style={{fontSize:11,color:"var(--td)"}}>{d.structure.length} étapes</div></div>
            <span style={{fontSize:18,color:"var(--td)",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
          </div>
          {isOpen&&<div style={{padding:"0 12px 12px",borderTop:"1px solid var(--brd)"}}>
            {d.desc&&<div style={{fontSize:12,color:"var(--td)",fontStyle:"italic",marginTop:8,marginBottom:8}}>{d.desc}</div>}
            <div style={{fontSize:12,marginBottom:4}}><span style={{color:"var(--td)"}}>Monstres :</span> {enmPool.map(function(e){return e.icon+" "+e.name;}).join(", ")}</div>
            <div style={{fontSize:12,marginBottom:4}}><span style={{color:"var(--td)"}}>Boss :</span> {bssPool.map(function(b){return b.icon+" "+b.name;}).join(", ")}</div>
            <div style={{fontSize:12,marginBottom:4}}><span style={{color:"var(--td)"}}>Loot :</span> {lootInfo}</div>
            {d.reward&&<div style={{fontSize:12,marginBottom:4}}><span style={{color:"var(--td)"}}>Récompenses par victoire :</span> 💰 {d.reward.gold} or · ⭐ {d.reward.xp||0} xp · 🎁 {d.loot?d.loot.nbLoot:0} équipement{d.loot&&d.loot.nbLoot>1?"s":""}</div>}
            {d.firstBonus&&!beaten&&<div style={{fontSize:12,marginBottom:8,padding:6,background:"#fbbf2410",borderRadius:6,border:"1px solid #fbbf2430"}}><span style={{color:"#fbbf24",fontWeight:700}}>Bonus de 1ère victoire :</span> 💰 {d.firstBonus.gold.toLocaleString()} or · ⭐ {d.firstBonus.xp.toLocaleString()} XP · 📜 {d.firstBonus.scrolls} parchemins{d.firstBonus.equip?" · 🎁 "+d.firstBonus.equip+" équipement"+(d.firstBonus.equip>1?"s":""):""}{d.firstBonus.tomes?" · 📖 "+Object.keys(d.firstBonus.tomes).map(function(tk){var tm=TOMES.find(function(t){return t.id===tk;});return (d.firstBonus.tomes[tk])+"× "+(tm?tm.name:tk);}).join(", "):""}</div>}
            {d.firstBonus&&beaten&&<div style={{fontSize:11,marginBottom:8,color:"#4ade80"}}>✅ Bonus de première victoire réclamé</div>}
            <button className="b bg" disabled={!team.length} onClick={function(){startDun(i);}} style={{fontSize:14,width:"100%",padding:"10px 0"}}>⚔️ Explorer</button>
          </div>}
        </div>;})}
      </div>}
      {dun&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div><h2 style={{fontFamily:"Cinzel",fontSize:16,color:"var(--acc)"}}>{DG[dun.ti].name}</h2><div style={{fontSize:12,color:"var(--td)"}}>Étape {dun.fl+1}/{DG[dun.ti].structure.length} · 💰{dun.rG} · ⭐{dun.rX}{dun.buffs>0?" · 🔮×"+dun.buffs:""}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {au&&<div style={{padding:"6px 12px",borderRadius:10,background:"#c0392b",color:"#fff",fontSize:12,fontWeight:800,opacity:1,animation:"blink 2s ease-in-out infinite"}}>AUTO</div>}
            <button className="b br" onClick={function(){endDun(false);setAu(false);}} style={{fontSize:12}}>🏳️ Fuir</button>
          </div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:12,padding:14,marginBottom:6,border:"1px solid var(--brd)",minHeight:360,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {dun.ph==="combat"&&<div style={{width:"100%"}}>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>{dun.en.map(function(e){return <Unit key={e.uid} u={e} isE act={dun.tO[dun.tI%dun.tO.length]===e.uid} sel={tgt===e.uid} onClick={e.hp>0?function(){setTgt(e.uid);}:undefined}/>;})}</div>
            <div style={{textAlign:"center",fontSize:14,color:"#555",margin:"2px 0"}}>— VS —</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>{dun.team.map(function(h){return <Unit key={h.uid} u={h} act={dun.tO[dun.tI%dun.tO.length]===h.uid}/>;})}</div>
          </div>}
          {dun.ph==="result"&&<div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"var(--red)",marginBottom:8}}>💀 Défaite</div><div style={{fontSize:13,color:"var(--td)",marginBottom:8}}>💰 {dun.rG} or · ⭐ {dun.rX} XP · 🎁 {(dun.rE||[]).length} objets récupérés</div><button className="b bg" onClick={function(){endDun(false);setAu(false);}} style={{marginTop:4}}>Retour</button></div>}
          {dun.ph==="event"&&<div style={{textAlign:"center"}}><div style={{fontSize:22,marginBottom:8}}>{dun.evtText||"Événement !"}</div><div style={{fontSize:14,color:"var(--td)"}}>{dun.evtDetail||""}</div></div>}
          {dun.ph==="victory"&&<div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#c0392b"}}>✨ Victoire !</div></div>}
          {dun.ph==="explore"&&<div style={{textAlign:"center"}}><div style={{fontSize:15,color:"var(--td)"}}>Prêt à explorer...</div></div>}
          {dun.ph==="done"&&<div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"#4ade80",marginBottom:8}}>Donjon terminé !</div><div style={{fontSize:13,color:"var(--td)"}}>💰 {dun.rG} or · ⭐ {dun.rX} XP · 🎁 {dun.rE.length} objets</div>
            {(function(){var bt=g.beaten||[];var fb=DG[dun.ti]&&DG[dun.ti].firstBonus;if(fb&&bt.indexOf(dun.ti)<0)return <div style={{fontSize:13,color:"#fbbf24",fontWeight:700,marginTop:6,padding:6,background:"#fbbf2410",borderRadius:6}}>Bonus de 1ère victoire : 💰 {fb.gold.toLocaleString()} · ⭐ {fb.xp.toLocaleString()} · 📜 {fb.scrolls}{fb.equip?" · 🎁 "+fb.equip:""}{fb.tomes?" · 📖 "+Object.keys(fb.tomes).map(function(tk){var tm=TOMES.find(function(t){return t.id===tk;});return fb.tomes[tk]+"× "+(tm?tm.name:tk);}).join(", "):""}</div>;return null;})()}
            <button className="b bg" onClick={function(){endDun(true);setAu(false);}} style={{marginTop:12}}>Réclamer les récompenses</button></div>}
        </div>
        {dun.ph==="combat"&&<div style={{display:"flex",gap:4,marginBottom:6}}>
          {(function(){var cur=dun.tO[dun.tI%dun.tO.length];var ch=dun.team.find(function(h){return h.uid===cur&&h.hp>0&&h.isHero;});var sk=ch?SKILLS[ch.id]:null;var ready=sk&&ch&&ch.cd<=0;
            if(au)return <button className="b" disabled style={{flex:1,fontSize:14,opacity:0.3}}>⚔️ Attaque (auto)</button>;
            if(ready)return <button className="b" onClick={doTurn} style={{flex:1,fontSize:15,fontWeight:900,background:"linear-gradient(135deg,#c0392b,#8b1a1a)",color:"#fff",border:"2px solid #fbbf24",animation:"gw 1.5s infinite",textShadow:"0 0 8px #fbbf2480"}}>⚡ {sk.name}</button>;
            return <button className="b bg" onClick={doTurn} style={{flex:1,fontSize:14}}>⚔️ Attaque</button>;
          })()}
          <button className={"b "+(au?"br":"")} onClick={function(){setAu(!au);}} style={{flex:1,fontSize:14}}>{au?"⏸ Stop":"▶️ Auto"}</button>
        </div>}
        {(dun.ph==="victory"||dun.ph==="event"||dun.ph==="explore")&&!au&&<button className="b bg" onClick={nxtFl} style={{width:"100%",marginBottom:6,fontSize:14}}>➡️ {dun.ph==="explore"?"Commencer":"Continuer"}</button>}
        <div ref={lr} style={{background:"#050510",borderRadius:10,padding:8,maxHeight:200,overflowY:"auto",fontFamily:"monospace",fontSize:12,lineHeight:1.6,border:"1px solid var(--brd)",position:"relative"}}>
          {logs.map(function(l,i){var txt=l.t||"";var tp=l.tp||"";
            var col;
            if(tp==="heroAtk")col="#90ee90"; // hero attack = light green
            else if(tp==="enemyAtk")col="#ff8888"; // enemy attack = light red
            else if(tp==="kill")col="#22ff22"; // enemy killed = flash green
            else if(tp==="heroDeath")col="#ef2020"; // hero killed = intense red
            else if(tp==="skill")col="#fbbf24"; // crit/skill = yellow
            else if(tp==="miss")col="#ff8888"; // miss/dodge = light red
            else if(tp==="event")col="#60a5fa"; // events = blue
            else if(tp==="info")col="#ddddf4"; // info = white
            else if(txt.indexOf("───")>=0)col="#444"; // separator
            else col="#ddddf4";
            return <div key={i} style={{color:col,position:"relative",cursor:l.st?"help":"default",padding:"1px 0"}}
              onMouseEnter={function(){if(l.st)setHl(i);}} onMouseLeave={function(){setHl(null);}}>
              {txt}
            </div>;
          })}
        </div>
        {hl!=null&&logs[hl]&&logs[hl].st&&<div style={{background:"#1a1818f8",border:"1px solid #c0392b60",borderRadius:10,padding:10,fontSize:12,fontFamily:"monospace",color:"#ccc",whiteSpace:"pre-line",boxShadow:"0 4px 20px rgba(0,0,0,0.8)",marginTop:4}}>
          <div style={{fontWeight:700,color:"#c0392b",marginBottom:6,fontSize:13}}>Détail du calcul</div>
          {logs[hl].st.res==="miss"&&"Précision "+Math.round((logs[hl].st.prec||.95)*100)+"% → Raté !"}
          {logs[hl].st.res==="dodged"&&"Esquive "+Math.round((logs[hl].st.dg||0)*100)+"% → Esquivé !"}
          {logs[hl].st.res==="hit"&&<div>
            {"Dégâts "+(logs[hl].st.wt==="magical"?"du sort":"de l'arme")+" : "+logs[hl].st.bd+" ("+(logs[hl].st.wt==="magical"?"magique":"physique")+")\n"}
            {logs[hl].st.strB!=null&&"Force attaquant : "+fmtPM(logs[hl].st.strB+1)+"\n"}
            {logs[hl].st.magB!=null&&"Magie attaquant : "+fmtPM(logs[hl].st.magB+1)+"\n"}
            {logs[hl].st.phvB!=null&&"Vuln. Physique cible : "+fmtPM(logs[hl].st.phvB+1)+"\n"}
            {logs[hl].st.mavB!=null&&"Vuln. Magique cible : "+fmtPM(logs[hl].st.mavB+1)+"\n"}
            {"Multiplicateur combiné : "+fmtPM(logs[hl].st.mult)+"\n"}
            {logs[hl].st.v!=null&&"Variance : "+Math.round(logs[hl].st.v*100)+"%\n"}
            {logs[hl].st.cr&&"Critique : ×3\n"}
            {logs[hl].st.eRes!=null&&logs[hl].st.eRes!==1&&("Vuln. élém. ("+logs[hl].st.el+") : "+fmtEV(logs[hl].st.eRes)+"\n")}
            {"= "+logs[hl].st.dmg+" dégâts"}
          </div>}
        </div>}
      </div>}
    </div>}

    {tab==="invocation"&&<div style={{animation:"fi .3s ease",textAlign:"center"}}><h2 style={{fontFamily:"Cinzel",fontSize:18,color:"var(--acc)",marginBottom:4}}>🎲 Invocation</h2>
      <div style={{fontSize:13,color:"var(--td)",marginBottom:12}}>Coût: 1 📜 par invocation · Stock: {sc} parchemins</div>
      <div style={{width:140,height:140,margin:"0 auto 16px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,background:"radial-gradient(circle,#c0392b12,transparent)",border:"2px solid var(--acc)",animation:ga?"sp .5s linear infinite":"gw 3s infinite"}}>{ga?"✨":"🎲"}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
        <button className="b bg" disabled={sc<1||ga} onClick={function(){doInvoc(1);}} style={{padding:"8px 20px",fontSize:14}}>×1 (1📜)</button>
        <button className="b bg" disabled={sc<10||ga} onClick={function(){doInvoc(10);}} style={{padding:"8px 20px",fontSize:14}}>×10 (10📜)</button>
      </div>
      {gr&&!ga&&<div style={{background:"var(--card)",borderRadius:14,padding:14,maxWidth:440,margin:"0 auto",border:"1px solid var(--acc)",animation:"fi .4s ease"}}>
        {Array.isArray(gr)?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(85px,1fr))",gap:4}}>
          {gr.map(function(r,i){return <div key={i} style={{padding:6,borderRadius:8,textAlign:"center",background:r.dup?"#ffffff05":(RA[r.h.rarity]||{}).c+"12",border:"1px solid "+(RA[r.h.rarity]||{}).c+"30"}}>
            <Portrait id={r.h.id} size={48} fs={20} icon={r.h.icon}/><div style={{fontSize:10,fontWeight:700,marginTop:2}}>{r.h.name}</div><div style={{fontSize:9,color:(RA[r.h.rarity]||{}).c}}>{(RA[r.h.rarity]||{}).s}</div>
            {r.dup&&<div style={{fontSize:9,color:"#d4a017"}}>{r.frag?"🧩":""}+{r.tome?"📖":""}</div>}
            {!r.dup&&<div style={{fontSize:9,color:"#4ade80",fontWeight:700}}>NOUVEAU</div>}</div>;})}
        </div>:<div>
          <div style={{margin:"0 auto 8px",width:"fit-content"}}><Portrait id={gr.h.id} size={120} fs={60} icon={gr.h.icon}/></div>
          <div style={{fontSize:20,fontWeight:700,color:(RA[gr.h.rarity]||{}).c,marginTop:4}}>{gr.h.name}</div>
          <div style={{fontSize:14,color:(RA[gr.h.rarity]||{}).c}}>{(RA[gr.h.rarity]||{}).s} {(RA[gr.h.rarity]||{}).n}</div>
          <div style={{fontSize:12,color:"var(--td)",marginTop:2,fontStyle:"italic"}}>{gr.h.title}</div>
          {gr.dup&&<div style={{fontSize:13,color:"#d4a017",marginTop:6}}>Doublon → 🧩 {gr.frag?gr.frag.name:""} + 📖 {gr.tome?gr.tome.name:""}</div>}
          {!gr.dup&&<div style={{fontSize:14,color:"#4ade80",marginTop:6,fontWeight:700}}>✨ NOUVEAU !</div>}
        </div>}
      </div>}
      <div style={{marginTop:14,fontSize:12,color:"var(--td)"}}>{Object.keys(RA).map(function(r){var pct=RA[r].r*100;return <span key={r} style={{marginRight:10,color:RA[r].c}}>{RA[r].n}: {pct%1===0?pct:pct.toFixed(1)}%</span>;})}</div>
    </div>}
  </div>);
}
