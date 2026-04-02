import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

var supabase = createClient("https://xidrfbtcgvnbnrtyjquc.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZHJmYnRjZ3ZuYm5ydHlqcXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTA1NjEsImV4cCI6MjA5MDAyNjU2MX0.-7dAj-wesiY8SgEQbDrT4MbKmoTB8EXSgBYrN491gFI");
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
  var mast=hero.mastery||0;
  var rar=hero.rarity||1;
  // Rarity bonus: 10% per rank (commun=10%, inhabituel=20%, etc.)
  // Mastery bonus: 5% per mastery level (0-10, so 0%-50%)
  // Combined: max 50%+50% = 100%
  var rmBonus=rar*0.10+mast*0.05;
  var bHp=Math.floor(L("hp"));
  var bRel=Math.round(L("rel"));
  var bStr=L("str");var bMag=L("mag");var bCrit=L("crit");
  var bPhv=L("phv");var bMav=L("mav");var bDodge=L("dodge");var bRgHp=L("rgHp");
  var _s={hp:["Nv."+lv+": "+bHp],rel:["Base: "+bRel+" tours"],str:["Nv."+lv+": "+fmtPM(bStr)],mag:["Nv."+lv+": "+fmtPM(bMag)],crit:["Nv."+lv+": "+fmtPct(bCrit)],phv:["Nv."+lv+": "+fmtPM(bPhv)],mav:["Nv."+lv+": "+fmtPM(bMav)],dodge:["Nv."+lv+": "+fmtPct(bDodge)],rgHp:[]};
  if(bRgHp>0)_s.rgHp.push("Nv."+lv+": "+fmtPct(bRgHp));
  // Step 1: accumulate equipment bonuses (additive on deviation)
  var eqStr=0,eqMag=0,eqCrit=0,eqPhv=0,eqMav=0,eqDodge=0,eqRgHp=0,eqHp=0,eqPvPct=0,eqRel=0;
  var eq=hero.equipment||{};
  var slots=["weapon","armor","accessory","talisman"];
  var s={er:Object.assign({},t.er||defER()),_s:_s};
  for(var si=0;si<slots.length;si++){var it=eq[slots[si]];if(!it||!it.bon)continue;var b=it.bon;
    if(b.hp){eqHp+=b.hp;_s.hp.push(it.name+": +"+b.hp);}
    if(b.pvPct){eqPvPct+=b.pvPct;_s.hp.push(it.name+": +"+fmtPct(b.pvPct));}
    if(b.str){eqStr+=b.str;_s.str.push(it.name+": "+fmtB(b.str));}
    if(b.mag){eqMag+=b.mag;_s.mag.push(it.name+": "+fmtB(b.mag));}
    if(b.crit){eqCrit+=b.crit;_s.crit.push(it.name+": +"+fmtPct(b.crit));}
    if(b.crt){eqCrit+=b.crt;_s.crit.push(it.name+": "+fmtB(b.crt));}
    if(b.phv){eqPhv+=b.phv;_s.phv.push(it.name+": "+fmtB(b.phv));}
    if(b.mav){eqMav+=b.mav;_s.mav.push(it.name+": "+fmtB(b.mav));}
    if(b.dodge){eqDodge+=b.dodge;_s.dodge.push(it.name+": +"+fmtPct(b.dodge));}
    if(b.rgHp){eqRgHp+=b.rgHp;_s.rgHp.push(it.name+": +"+fmtPct(b.rgHp));}
    if(b.rel){eqRel+=b.rel;_s.rel.push(it.name+": "+b.rel+" tours");}
    if(b.er)for(var ek in b.er)s.er[ek]=(s.er[ek]||1)+b.er[ek];
  }
  // Step 2: apply formula (base + equip) × (1 + rarity_bonus + mastery_bonus)
  // Non-pertinent stat (mag for PHY, str for MAG) stays fixed at base (0.10), not multiplied
  var isMagHero=t.wt==="magical";
  var rmMult=1+rmBonus;
  function applyRM(base,eqB){var dev=(base-1)+eqB;return 1+dev*rmMult;}
  s.hp=Math.floor((bHp+eqHp)*(1+rmBonus));if(eqPvPct>0){var pvB=Math.floor(s.hp*eqPvPct);s.hp+=pvB;}
  s.str=isMagHero?0.10:applyRM(bStr,eqStr);
  s.mag=isMagHero?applyRM(bMag,eqMag):0.10;
  s.crit=bCrit+eqCrit;
  s.phv=applyRM(bPhv,eqPhv);
  s.mav=applyRM(bMav,eqMav);
  s.dodge=bDodge+eqDodge;
  s.rgHp=bRgHp+eqRgHp;
  s.rel=Math.max(1,bRel+eqRel);
  s.relBonus=eqRel;
  // Add multiplier info to tooltips (exclude non-pertinent stat)
  if(rmBonus>0){
    var rmLabel="";if(rar>=1)rmLabel+="Rareté +"+Math.round(rar*10)+"%";if(mast>0)rmLabel+=(rmLabel?" + ":"")+"Maîtrise +"+Math.round(mast*5)+"%";
    rmLabel+=" \u2192 \u00d7"+rmMult.toFixed(2);
    _s.hp.push(rmLabel);if(!isMagHero)_s.str.push(rmLabel);if(isMagHero)_s.mag.push(rmLabel);_s.phv.push(rmLabel);_s.mav.push(rmLabel);
  }
  // Final values in tooltips (exclude non-pertinent stat)
  var _sub={};function subPM(b,e){return 1+(b-1)+e;}_sub.hp=bHp+eqHp;_sub.str=subPM(bStr,eqStr);_sub.mag=subPM(bMag,eqMag);_sub.crit=bCrit+eqCrit;_sub.phv=subPM(bPhv,eqPhv);_sub.mav=subPM(bMav,eqMav);_sub.dodge=bDodge+eqDodge;_sub.rgHp=bRgHp+eqRgHp;s._sub=_sub;
  for(var ei=0;ei<EL.length;ei++){var ek2=EL[ei];s.er[ek2]=Math.max(0,s.er[ek2]||1);}
  return s;
}
function gw(h){var w=h.equipment&&h.equipment.weapon;return w||{name:"Poings",wt:"physical",dmg:5,el:"Neutre"};}
function xpN(lv){var base=65;var mult=2+6*((lv-1)/98);return Math.floor(base*lv*mult);}


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
  var b=it.bon||{};
  var stats=[];
  if(b.str)stats.push("Force "+fmtB(b.str));if(b.mag)stats.push("Magie "+fmtB(b.mag));
  if(b.crt)stats.push("Crit "+fmtB(b.crt));if(b.crit)stats.push("Crit +"+fmtPct(b.crit));
  if(b.pvPct)stats.push("PV +"+fmtPct(b.pvPct));
  if(b.rel)stats.push("Recharge "+b.rel);
  if(b.phv)stats.push("V.Phy "+fmtB(b.phv));if(b.mav)stats.push("V.Mag "+fmtB(b.mav));
  if(b.dodge)stats.push("Esquive +"+fmtPct(b.dodge));if(b.rgHp)stats.push("Récup +"+fmtPct(b.rgHp));
  if(it.slot==="weapon"&&it.el&&it.el!=="Neutre")stats.push("Attaque "+((EM[it.el]||{}).i||"")+it.el);
  if(b.er){for(var ek in b.er){var rv=b.er[ek];var pct=Math.round(Math.abs(rv)*100);stats.push(((EM[ek]||{}).i||"")+ek+" "+(rv<0?"-":"+")+pct+"%");}}
  var slotName=it.slot==="weapon"?"Arme":it.slot==="armor"?"Armure":it.slot==="accessory"?"Accessoire":"Talisman";
  var header=slotName;if(it.rank)header+=" · Rang "+it.rank;
  var fs=props.fs||14;
  return(<div>
    <div style={{fontSize:fs-2,color:rc}}>{header} · {(RA[it.rarity]||{}).s}</div>
    <div style={{fontWeight:600,fontSize:fs,color:rc}}>{it.name}</div>
    {it.slot==="weapon"&&it.dmg!=null&&<div style={{fontSize:fs,fontWeight:700}}>{it.wt==="magical"?"💫":"⚔️"} {it.dmg} {it.wt==="magical"?"Magique":"Physique"}</div>}
    {it.slot==="armor"&&b.hp&&<div style={{fontSize:fs,fontWeight:700}}>🩸 +{b.hp} points de vie</div>}
    {stats.length>0&&<div style={{fontSize:fs-3,color:"#4ade80",marginTop:1}}>{stats.join(", ")}</div>}
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
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #ffffff08",position:"relative",cursor:"default"}} onMouseEnter={onE} onMouseLeave={onL}>
      <span style={{color:"#8888bb",fontSize:14}}>{props.icon} {props.label}</span>
      <span style={{fontFamily:"monospace",fontWeight:600,fontSize:14,color:col}}>{display}{suf}{nxt&&<span style={{marginLeft:6,color:nc}}>{nxt}</span>}</span>
      {hov&&tip&&(<div style={{position:"absolute",top:0,left:0,background:"#1a1818f0",border:"1px solid #9b7ec860",borderRadius:8,padding:10,fontSize:12,fontFamily:"monospace",color:"#ccc",zIndex:50,transform:"translateY(-100%)",whiteSpace:"pre-line",minWidth:220,maxWidth:350}}>{tip}</div>)}
    </div>
  );
}


var INIT={gold:STARTING_GOLD,scrolls:5,floors:0,beaten:[],roster:[],team:[null,null,null,null],inv:[],mat:{},conso:{},bl:{forge:1,rempart:0,autel:0,tour:0,ecole:0,mine:0,oracle:0,taverne:0,marche:1,alchimiste:1}};

function AuthScreen(props){
  var _m=useState("login");var mode=_m[0],setMode=_m[1];
  var _e=useState("");var email=_e[0],setEmail=_e[1];
  var _p=useState("");var pw=_p[0],setPw=_p[1];
  var _err=useState(null);var err=_err[0],setErr=_err[1];
  var _ld=useState(false);var ld=_ld[0],setLd=_ld[1];
  // OLD THEME: --bg:#0e0d0d;--bg2:#141313;--card:#1c1a1a;--brd:#3a2828;--t:#e0d8d0;--td:#8a7e76;--acc:#c0392b;--red:#e74c3c;--gold:#d4a017
  var css='@import url("https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=DM+Sans:wght@400;500;600;700&display=swap");:root{--bg:#111114;--bg2:#1a1a1e;--card:#222228;--brd:#3a3a44;--t:#d8d8e0;--td:#8888a0;--acc:#9b7ec8;--red:#e74c3c;--gold:#d4a017}*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--t);font-family:"DM Sans",sans-serif}';
  function doAuth(){
    setErr(null);setLd(true);
    if(mode==="login"){
      supabase.auth.signInWithPassword({email:email,password:pw}).then(function(res){
        setLd(false);if(res.error)setErr(res.error.message);
      });
    }else{
      supabase.auth.signUp({email:email,password:pw}).then(function(res){
        setLd(false);
        if(res.error)setErr(res.error.message);
        else if(res.data&&res.data.user&&!res.data.session)setErr("Vérifiez votre email pour confirmer votre compte.");
      });
    }
  }
  return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><style>{css}</style>
    <div style={{maxWidth:380,width:"100%",animation:"fi .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <h1 style={{fontFamily:"Uncial Antiqua",fontSize:32,fontWeight:900,color:"var(--acc)",textShadow:"0 0 20px #9b7ec840"}}>ECLIPSIA</h1>
        <div style={{fontSize:13,color:"var(--td)",marginTop:4}}>JRPG Roguelite</div>
      </div>
      <div style={{background:"var(--card)",borderRadius:14,padding:24,border:"1px solid var(--brd)"}}>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={function(){setMode("login");setErr(null);}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:mode==="login"?"var(--acc)":"transparent",color:mode==="login"?"#fff":"var(--td)"}}>Connexion</button>
          <button onClick={function(){setMode("register");setErr(null);}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:mode==="register"?"var(--acc)":"transparent",color:mode==="register"?"#fff":"var(--td)"}}>Inscription</button>
        </div>
        <input value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="Email" type="email" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid var(--brd)",background:"var(--bg)",color:"var(--t)",fontFamily:"inherit",fontSize:14,marginBottom:8,outline:"none"}}/>
        <input value={pw} onChange={function(e){setPw(e.target.value);}} placeholder="Mot de passe" type="password" onKeyDown={function(e){if(e.key==="Enter")doAuth();}} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid var(--brd)",background:"var(--bg)",color:"var(--t)",fontFamily:"inherit",fontSize:14,marginBottom:12,outline:"none"}}/>
        {err&&<div style={{fontSize:12,color:err.indexOf("rifi")>=0?"#4ade80":"var(--red)",marginBottom:8,padding:8,background:"#ffffff06",borderRadius:6}}>{err}</div>}
        <button disabled={ld||!email||!pw} onClick={doAuth} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"none",cursor:ld?"wait":"pointer",fontFamily:"inherit",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#9b7ec8,#7b5ea8)",color:"#fff",opacity:ld?.5:1}}>{ld?"...":(mode==="login"?"Se connecter":"Créer un compte")}</button>
      </div>
    </div>
  </div>);
}



export default function Game(){
  var _user=useState(null);var user=_user[0],setUser=_user[1];
  var _authReady=useState(false);var authReady=_authReady[0],setAuthReady=_authReady[1];
  var _saving=useState(false);var saving=_saving[0],setSaving=_saving[1];

  // Auth listener
  useEffect(function(){
    supabase.auth.getSession().then(function(res){
      if(res.data.session)setUser(res.data.session.user);
      setAuthReady(true);
    });
    var sub=supabase.auth.onAuthStateChange(function(ev,session){
      setUser(session?session.user:null);
    });
    return function(){sub.data.subscription.unsubscribe();};
  },[]);

  var _g=useState(INIT);var g=_g[0],setG=_g[1];
  var _loaded=useState(false);var loaded=_loaded[0],setLoaded=_loaded[1];

  // Load save from Supabase when user logs in
  useEffect(function(){
    if(!user)return;
    supabase.from("saves").select("game_state").eq("user_id",user.id).single().then(function(res){
      if(res.data&&res.data.game_state){
        setG(res.data.game_state);
      }
      setLoaded(true);
    }).catch(function(){setLoaded(true);});
  },[user]);
  var _tab=useState("base");var tab=_tab[0],setTab=_tab[1];
  var _dun=useState(null);var dun=_dun[0],setDun=_dun[1];
  var _logs=useState([]);var logs=_logs[0],setLogs=_logs[1];
  var _gr=useState(null);var gr=_gr[0],setGr=_gr[1];
  var _ga=useState(false);var ga=_ga[0],setGa=_ga[1];
  var _sel=useState(null);var sel=_sel[0],setSel=_sel[1];
  var _heroSort=useState('rarity');var heroSort=_heroSort[0],setHeroSort=_heroSort[1];
  var _statPage=useState(0);var statPage=_statPage[0],setStatPage=_statPage[1];
  var _teamPick=useState(null);var teamPick=_teamPick[0],setTeamPick=_teamPick[1];
  var _bldPopup=useState(null);var bldPopup=_bldPopup[0],setBldPopup=_bldPopup[1];
  var _showCamp=useState(false);var showCamp=_showCamp[0],setShowCamp=_showCamp[1];
  var _grIdx=useState(0);var grIdx=_grIdx[0],setGrIdx=_grIdx[1];
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

  // Save to Supabase (debounced 2s) + localStorage backup
  useEffect(function(){
    if(!user||!loaded)return;
    localStorage.setItem("ecl8",JSON.stringify(g));
    var t=setTimeout(function(){
      setSaving(true);
      supabase.from("saves").upsert({user_id:user.id,game_state:g},{onConflict:"user_id"}).then(function(){setSaving(false);});
    },2000);
    return function(){clearTimeout(t);};
  },[g,user,loaded]);
  useEffect(function(){if(lr.current)lr.current.scrollTop=lr.current.scrollHeight;},[logs]);

  var team=useMemo(function(){return g.team.map(function(u){return u?g.roster.find(function(h){return h.uid===u;}):null;}).filter(Boolean);},[g.team,g.roster]);
  var sR=useMemo(function(){return[].concat(g.roster).sort(function(a,b){return b.rarity-a.rarity||b.level-a.level;});},[g.roster]);

  var sc=g.scrolls||0;
  function doInvoc(n){
    if(sc<n)return;setGa(true);setGr(null);setGrIdx(0);
    setTimeout(function(){
      var res=[],ros=[].concat(g.roster),dupItems=[];
      var pity10=(g.pity10||0);var pity50=(g.pity50||0);
      for(var i=0;i<n;i++){
        pity10++;pity50++;
        var bon=(g.bl.oracle||0)*.004;var r=Math.random(),cum=0,rr=1;
        for(var j=5;j>=1;j--){cum+=Math.max(.01,RA[j].r+(j>=3?bon/3:-bon/2));if(r<cum){rr=j;break;}}
        if(pity50>=50&&rr<3){rr=3;pity50=0;pity10=0;}
        else if(pity10>=10&&rr<2){rr=2;pity10=0;}
        if(rr>=3)pity50=0;if(rr>=3)pity10=0;
        if(rr>=2)pity10=0;
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
        return Object.assign({},p,{scrolls:(p.scrolls||0)-n,roster:ros,conso:nc,pity10:pity10,pity50:pity50});
      });setGr(n===1?res[0]:res);setGa(false);
    },n>1?1800:1000);
  }

  function doLvUp(u){setG(function(p){var h=p.roster.find(function(r){return r.uid===u;});if(!h)return p;var n=xpN(h.level);if(h.xp<n)return p;return Object.assign({},p,{roster:p.roster.map(function(r){return r.uid===u?Object.assign({},r,{level:r.level+1,xp:r.xp-n}):r;})});});}
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
          setFloats(function(f){return f.concat([{uid:target.uid,val:"-"+res.dmg,color:res.st.cr?"#fbbf24":useSkill?"#9b7ec8":"#ffffff",id:uid()}]);});}
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
      var isFirst=bt0.indexOf(dun.ti)<0;
      var fb1=isFirst&&dgDef.firstBonus?dgDef.firstBonus:null;
      if(fb1){tg+=fb1.gold||0;tx+=fb1.xp||0;}
      setDun(function(d){return Object.assign({},d,{ph:"done",rE:rE,rG:tg,rX:tx,isFirst:isFirst,fb:fb1});});
      var logMsgs=[{t:"───────────────"},{t:"DONJON TERMINÉ !",tp:"kill"},{t:"Récompenses totales : "+tg+" or, "+tx+" xp, "+rE.length+" équipement"+(rE.length>1?"s":""),tp:"info"}];
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
  function reset(){localStorage.removeItem("ecl8");setG(INIT);setDun(null);setLogs([]);setTab("base");setAu(false);setSheet(null);setFloats([]);if(user)supabase.from("saves").upsert({user_id:user.id,game_state:INIT},{onConflict:"user_id"});}

  // OLD THEME: --bg:#0e0d0d;--bg2:#141313;--card:#1c1a1a;--brd:#3a2828;--t:#e0d8d0;--td:#8a7e76;--acc:#c0392b;--red:#e74c3c;--gold:#d4a017
  var css='@import url("https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=DM+Sans:wght@400;500;600;700&display=swap");:root{--bg:#111114;--bg2:#1a1a1e;--card:#222228;--brd:#3a3a44;--t:#d8d8e0;--td:#8888a0;--acc:#9b7ec8;--red:#e74c3c;--gold:#d4a017}*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);background-image:url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'60\' height=\'60\' fill=\'%230e0d0d\'/%3E%3Crect x=\'0\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'0\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'12\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'12\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'24\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'15\' y=\'36\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'45\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'36\' width=\'15\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'0\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23141210\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3Crect x=\'30\' y=\'48\' width=\'30\' height=\'12\' rx=\'1\' fill=\'%23131110\' stroke=\'%231a1715\' stroke-width=\'.5\'/%3E%3C/svg%3E");color:var(--t);font-family:"DM Sans",sans-serif;font-size:14px}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--brd);border-radius:3px}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes gw{0%,100%{box-shadow:0 0 6px #9b7ec820}50%{box-shadow:0 0 18px #9b7ec850}}@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes glw{0%,100%{box-shadow:0 0 4px #22c55e40}50%{box-shadow:0 0 16px #22c55e90}}@keyframes arr{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.b{padding:8px 16px;border:1px solid var(--brd);border-radius:10px;cursor:pointer;font-family:inherit;font-weight:600;font-size:13px;transition:all .15s;background:var(--card);color:var(--t)}.b:hover{background:#2a2a32;transform:translateY(-1px)}.b:active{transform:translateY(0)}.b:disabled{opacity:.3;cursor:not-allowed;transform:none}.bg{background:linear-gradient(135deg,#9b7ec8,#7b5ea8);color:#fff;border:none;font-weight:700}.bg:hover{background:linear-gradient(135deg,#b091d4,#8b6eb8)}.br{background:linear-gradient(135deg,#6b4e98,#4e3880);color:#fff;border:none}.bgr{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none}.ton{background:var(--acc)!important;color:#fff!important;border-color:var(--acc)!important}.glow{animation:glw 1.5s infinite}@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}@keyframes veilShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes veilFast{0%{background-position:0% 50%;filter:hue-rotate(0deg)}25%{filter:hue-rotate(90deg)}50%{background-position:100% 50%;filter:hue-rotate(180deg)}75%{filter:hue-rotate(270deg)}100%{background-position:0% 50%;filter:hue-rotate(360deg)}}';

  function Bar(props){var cur=props.cur,max=props.max,color=props.color||"#22c55e",h=props.h||10,label=props.label!==false;var p=clamp(cur/Math.max(1,max)*100,0,100);return(<div style={{position:"relative",width:"100%",height:h,background:"#0a0a18",borderRadius:h/2,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",borderRadius:h/2,background:"linear-gradient(90deg,"+color+"cc,"+color+")",transition:"width .3s"}}/>{label&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(9,h-2),fontWeight:700,color:"#fff",textShadow:"0 1px 1px #000a",fontFamily:"monospace"}}>{cur}/{max}</span>}</div>);}
  function turnPos(u){if(!dun||!dun.tO)return null;var alive=dun.tO.filter(function(id){return(dun.team.find(function(h){return h.uid===id&&h.hp>0;})||dun.en.find(function(e){return e.uid===id&&e.hp>0;}));});return alive.indexOf(u)+1||null;}
  function Unit(props){var u=props.u,isE=props.isE,act=props.act,isSel=props.sel,onClick=props.onClick;var hp=u.hp||0,hm=u.hpMax||1;var tp=turnPos(u.uid);
    var myFloats=floats.filter(function(f){return f.uid===u.uid;});
    var pSrc=!isE?portrait(u.id):null;
    return(<div onClick={onClick} style={{padding:8,borderRadius:10,minWidth:72,textAlign:"center",cursor:onClick?"pointer":"default",background:isSel?"#ffffff18":act?"#ffffff0c":"#ffffff05",border:isSel?"2px solid #fbbf24":act?"2px solid #9b7ec860":"1px solid #ffffff0a",opacity:hp<=0?.2:1,transition:"all .2s",position:"relative"}}>{tp&&hp>0&&<div style={{position:"absolute",top:-6,right:-6,background:act?"#9b7ec8":"#444",color:act?"#fff":"#ddd",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{tp}</div>}
      {myFloats.map(function(f){return <div key={f.id} style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",color:f.color,fontSize:18,fontWeight:900,textShadow:"0 2px 4px #000",animation:"floatUp .7s forwards",pointerEvents:"none",zIndex:20}}>{f.val}</div>;})}
      <div style={{width:36,height:36,borderRadius:8,margin:"0 auto",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,background:"#111"}}>
        <span style={{position:"absolute",zIndex:1}}>{u.icon}</span>
        {pSrc&&<img src={pSrc} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:2}} alt="" onError={function(e){e.target.style.display="none";}}/>}
      </div>
      <div style={{fontSize:11,fontWeight:700,color:isE?"#ff6b6b":"#6bffb8",marginTop:1}}>{u.name}</div>{u.boss&&<div style={{fontSize:10,color:"#9b7ec8",fontWeight:800}}>BOSS</div>}<div style={{marginTop:4}}><Bar cur={Math.max(0,hp)} max={hm} color={isE?"#ef4444":"#22c55e"} h={8}/></div>
      {!isE&&u.isHero&&<div style={{fontSize:10,marginTop:2,color:u.cd<=0?"#fbbf24":"#666",fontWeight:u.cd<=0?800:400}}>{u.cd<=0?"⚡ PRÊT":"⏳ "+u.cd}</div>}
      </div>);}

  var inD=!!dun;var grRarCol=gr&&!Array.isArray(gr)?(RA[gr.h.rarity]||{}).c:gr&&Array.isArray(gr)&&gr.length>0?(RA[Math.max.apply(null,gr.map(function(r){return r.h.rarity;}))]||{}).c:null;var selH=sel?g.roster.find(function(r){return r.uid===sel;}):null;

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
      var xn=xpN(hero.level);var canLv=hero.xp>=xn;
      var inTeam=g.team.indexOf(hero.uid)>=0;
      var atkEl=w.el&&w.el!=="Neutre"?w.el:null;
      function mkTip(key){var arr=st._s[key];if(!arr||!arr.length)return null;var total;if(key==="hp"||key==="rel")total=st[key];else if(key==="crit"||key==="dodge"||key==="rgHp")total=fmtPct(st[key]);else total=fmtPM(st[key]);return arr.join("\n")+"\n= "+total;}

      /* level up is now a popup, rendered at end of sheet */

      return(<div style={{position:"fixed",inset:0,background:"var(--bg)",zIndex:100,display:"flex",flexDirection:"column"}}><style>{css}</style>
        <div style={{flex:1,overflowY:"auto",maxWidth:540,margin:"0 auto",width:"100%",padding:"10px 12px 16px",display:"flex",flexDirection:"column"}}>
          <div style={{background:"linear-gradient(145deg,"+rc+"18,"+rc+"08)",border:"1px solid "+rc+"50",borderRadius:16,padding:14,marginBottom:8,position:"relative"}}>
            <div style={{position:"absolute",top:12,right:16,fontSize:28,fontWeight:900,color:rc+"80",fontFamily:"Uncial Antiqua"}}>{hero.level}</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Portrait id={hero.id} size={64} fs={32} icon={hero.icon}/>
              <div style={{flex:1}}><div style={{fontSize:18,fontWeight:800,fontFamily:"Uncial Antiqua"}}>{hero.name}</div><div style={{fontSize:11,color:"#8888bb"}}>{ht?ht.title:""}</div><div style={{fontSize:12,color:rc,fontWeight:700}}>{(RA[hero.rarity]||{}).s} {(RA[hero.rarity]||{}).n}</div><div style={{fontSize:11,color:"var(--td)",marginTop:2}}>Maîtrise {hero.mastery||0}/10</div></div>
            </div>
            <div style={{height:4,background:"#0a0a18",borderRadius:4,overflow:"hidden",marginTop:8}}><div style={{width:clamp(hero.xp/xn*100,0,100)+"%",height:"100%",background:"var(--acc)",transition:"width .3s"}}/></div>
            <div style={{fontSize:10,color:"var(--td)",marginTop:3,textAlign:"right"}}>XP {hero.xp}/{xn}</div>
          </div>
          {(function(){var wIsMag=w.wt==="magical";var heroIsMag=ht&&ht.wt==="magical";var ms2=wIsMag?st.mag:st.str;var dmgAvg=Math.round(w.dmg*Math.max(0.1,ms2));var wrongType2=heroIsMag!==wIsMag;var dmgCol=wrongType2?"#ef4444":ms2>=1?"#4ade80":"#facc15";
            return <div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:8,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800}}>🩸 {st.hp}</div><div style={{fontSize:10,color:"var(--td)"}}>Points de vie</div></div>
              <div style={{width:1,height:36,background:"var(--brd)"}}/>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:dmgCol}}>{wIsMag?"💫":"⚔️"} ~{dmgAvg}</div><div style={{fontSize:10,color:"var(--td)"}}>Dégâts {wIsMag?"magiques":"physiques"}{wrongType2?" ⚠":""}</div></div>
            </div>;})()}
          {(function(){
            var isMag3=ht&&ht.wt==="magical";
            function SR2(p){return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}>
              <span style={{color:"var(--td)"}}>{p.icon} {p.label}</span>
              <span style={{fontWeight:600,color:p.col||"var(--t)"}}>{p.val}</span>
            </div>;}
            var _tsxVal=null;
            function onTS(e){_tsxVal=e.touches[0].clientX;}
            function onTE(e){if(_tsxVal===null)return;var dx=e.changedTouches[0].clientX-_tsxVal;if(Math.abs(dx)>40){setStatPage(dx<0?1:0);}_tsxVal=null;}
            return <div style={{background:"var(--card)",borderRadius:12,marginBottom:8,border:"1px solid var(--brd)",overflow:"hidden"}} onTouchStart={onTS} onTouchEnd={onTE}>
              <div style={{display:"flex",borderBottom:"1px solid var(--brd)"}}>
                <div onClick={function(){setStatPage(0);}} style={{flex:1,padding:"6px 0",textAlign:"center",fontSize:11,fontWeight:statPage===0?700:400,color:statPage===0?"var(--acc)":"var(--td)",borderBottom:statPage===0?"2px solid var(--acc)":"2px solid transparent",cursor:"pointer"}}>Caractéristiques</div>
                <div onClick={function(){setStatPage(1);}} style={{flex:1,padding:"6px 0",textAlign:"center",fontSize:11,fontWeight:statPage===1?700:400,color:statPage===1?"var(--acc)":"var(--td)",borderBottom:statPage===1?"2px solid var(--acc)":"2px solid transparent",cursor:"pointer"}}>Éléments</div>
              </div>
              <div style={{padding:10}}>
                {statPage===0&&<div>
                  {!isMag3&&<SR2 icon="💪" label="Force" val={fmtPM(st.str)} col={st.str>=1?"#4ade80":"#facc15"}/>}
                  {isMag3&&<SR2 icon="🔮" label="Magie" val={fmtPM(st.mag)} col={st.mag>=1?"#4ade80":"#facc15"}/>}
                  <SR2 icon="💥" label="Critique" val={fmtPct(st.crit)}/>
                  <SR2 icon="🛡️" label="Vuln. Physique" val={fmtPM(st.phv)} col={st.phv<1?"#4ade80":st.phv>1?"#facc15":"var(--t)"}/>
                  <SR2 icon="🛡️" label="Vuln. Magique" val={fmtPM(st.mav)} col={st.mav<1?"#4ade80":st.mav>1?"#facc15":"var(--t)"}/>
                  <SR2 icon="💨" label="Esquive" val={fmtPct(st.dodge)}/>
                  <SR2 icon="♻️" label="Récupération" val={fmtPct(st.rgHp)} col={st.rgHp>0?"#4ade80":"var(--t)"}/>
                </div>}
                {statPage===1&&<div>
                  {EL.map(function(el){var v=st.er[el]!=null?st.er[el]:1;var c=erc(v);
                    return <div key={el} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12}}>
                      <span style={{color:"var(--td)"}}>{(EM[el]||{}).i} {el}</span>
                      <span style={{fontWeight:600,color:c}}>{fmtEV(v)}</span>
                    </div>;
                  })}
                </div>}
              </div>
            </div>;
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:4,marginBottom:8}}>
            {["weapon","armor","accessory","talisman"].map(function(sl){var it2=hero.equipment?hero.equipment[sl]:null;var slNames={weapon:"🗡️ Arme",armor:"🛡️ Armure",accessory:"💍 Accessoire",talisman:"📿 Talisman"};
              return <div key={sl} onClick={function(){setInfoPopup("equip_"+sl);}} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:8,padding:"8px 10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <span style={{fontSize:11,color:"var(--td)",fontWeight:600,whiteSpace:"nowrap"}}>{slNames[sl]}</span>
                  {it2?<span style={{fontSize:12,color:(RA[it2.rarity]||{}).c||"var(--t)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it2.name}</span>
                  :<span style={{fontSize:11,color:"#555",fontStyle:"italic"}}>Vide</span>}
                </div>
                <span style={{color:"var(--td)",fontSize:11,marginLeft:6}}>►</span>
              </div>;})}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
            <button className={"b "+(canLv?"bgr glow":"")} disabled={!canLv} onClick={function(){setSlv(true);}} style={{padding:"12px 0",fontSize:12,fontWeight:canLv?800:600}}>Gain de niveau</button>
            <button className="b" onClick={function(){setTomePanel(hero.uid);setTomeQty({});}} style={{padding:"12px 0",fontSize:12}}>Entraînement</button>
            {(function(){var _frag=FRAGMENTS.find(function(f){return f.heroId===hero.id;});var _fragC=_frag?(g.conso||{})[_frag.id]||0:0;var _canM=_fragC>=10&&(hero.mastery||0)<10;return <button className={"b "+(_canM?"bgr glow":"")} onClick={function(){setInfoPopup("maitrise");}} style={{padding:"12px 0",fontSize:12,fontWeight:_canM?800:600}}>Maîtrise</button>;})()}            <button className="b" onClick={function(){setInfoPopup("carac");}} style={{padding:"12px 0",fontSize:12}}>Détails</button>
            <button className="b" onClick={function(){setInfoPopup("skill");}} style={{padding:"12px 0",fontSize:12}}>Compétences</button>
            <button className="b" disabled style={{padding:"12px 0",fontSize:12,opacity:0.3}}>Bientôt</button>
          </div>

          <div style={{flex:1}}/>
          <div style={{height:1,background:"var(--brd)",marginBottom:8}}/>
          <div style={{display:"flex",gap:6}}>
            <button className="b" onClick={function(){navSheet(-1);}} disabled={sR.length<=1} style={{flex:1,fontSize:22,padding:"14px 0",fontWeight:900}}>◄</button>
            <button className="b" onClick={function(){setSheet(null);setSlv(false);}} style={{flex:1,fontSize:13,padding:"14px 0"}}>Retour</button>
            <button className="b" onClick={function(){navSheet(1);}} disabled={sR.length<=1} style={{flex:1,fontSize:22,padding:"14px 0",fontWeight:900}}>►</button>
          </div>
        </div>
      {infoPopup==="carac"&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:440,width:"100%",maxHeight:"80vh",overflowY:"auto",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,fontSize:16}}>Détails</h3>
          <div style={{fontSize:12,lineHeight:1.8,fontFamily:"monospace",color:"#ccc"}}>
            {(function(){
              var heroWt=ht?ht.wt:"physical";
              var rar2=hero.rarity||1;var mast2=hero.mastery||0;
              var rmBonus2=rar2*0.10+mast2*0.05;var rmMult2=1+rmBonus2;
              var hasRM=rmBonus2>0;
              var affectedByRM={hp:true,str:heroWt==="physical",mag:heroWt==="magical",phv:true,mav:true};
              return ["hp","str","mag","crit","phv","mav","dodge","rgHp","rel"].filter(function(k){
                if(k==="str"&&heroWt==="magical")return false;
                if(k==="mag"&&heroWt==="physical")return false;
                return true;
              }).map(function(key){
                var arr=st._s[key];if(!arr||!arr.length)return null;
                var total;if(key==="hp"||key==="rel")total=st[key];else if(key==="crit"||key==="dodge"||key==="rgHp")total=fmtPct(st[key]);else total=fmtPM(st[key]);
                var totalCol=(key==="phv"||key==="mav")?(st[key]<1?"#4ade80":st[key]>1?"#facc15":"#ddddf4"):(key==="hp"||key==="rel"?"#ddddf4":(st[key]>0.001?"#4ade80":"#ddddf4"));
                var labels={hp:"🩸 Points de vie",str:"💪 Force",mag:"💫 Magie",crit:"💥 Critique",phv:"🛡️ Vuln. Physique",mav:"🔰 Vuln. Magique",dodge:"💨 Esquive",rgHp:"♻️ Récupération",rel:"⏳ Recharge"};
                // Filter out any "= " or "Rareté" lines from arr (legacy cleanup)
                var cleanArr=arr.filter(function(line){return line.indexOf("= ")<0&&line.indexOf("Rareté")<0&&line.indexOf("Maîtrise")<0;});
                var showRM=hasRM&&affectedByRM[key];
                return <div key={key} style={{marginBottom:10,padding:8,background:"#ffffff04",borderRadius:6}}>
                  <div style={{fontWeight:700,color:"var(--acc)",fontSize:13,marginBottom:4}}>{labels[key]||key}</div>
                  {cleanArr.map(function(line,li){return <div key={li} style={{color:"#aaa"}}>{line}</div>;})}
                  {showRM&&cleanArr.length>1&&<div style={{color:"#8888bb",marginTop:2}}>Sous-total = {key==="hp"?st._sub[key]:(key==="crit"||key==="dodge"||key==="rgHp"?fmtPct(st._sub[key]):fmtPM(st._sub[key]))}</div>}
                  {showRM&&<div style={{color:"#8888bb"}}>{rar2>=1?"Bonus de rareté : ×"+(1+rar2*0.10).toFixed(2):"" }{mast2>0?" + Bonus de maîtrise : ×"+(1+mast2*0.05).toFixed(2):""}{(rar2>=1||mast2>0)?" = ×"+rmMult2.toFixed(2):""}</div>}
                  <div style={{fontWeight:700,color:totalCol,marginTop:4,fontSize:13}}>Total = {total}</div>
                </div>;
              }).filter(Boolean);
            })()}
          </div>
          
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,marginTop:16,fontSize:16}}>Vulnérabilités Élémentaires</h3>
          <div style={{fontSize:12,lineHeight:1.8,fontFamily:"monospace",color:"#ccc"}}>
            {EL.map(function(el){
              var baseV=ht&&ht.er&&ht.er[el]!=null?ht.er[el]:1;
              var eqLines=[];var eqTotal=0;
              var eq2=hero.equipment||{};
              ["weapon","armor","accessory","talisman"].forEach(function(sl){
                var it3=eq2[sl];if(it3&&it3.bon&&it3.bon.er&&it3.bon.er[el]!=null){
                  var v2=it3.bon.er[el];eqTotal+=v2;
                  eqLines.push({name:it3.name,val:v2});
                }
              });
              var finalV=Math.max(0,baseV+eqTotal);
              var c=erc(finalV);
              return <div key={el} style={{marginBottom:8,padding:8,background:"#ffffff04",borderRadius:6}}>
                <div style={{fontWeight:700,color:(EM[el]||{}).c||"#ccc",fontSize:13,marginBottom:4}}>{(EM[el]||{}).i||""} {el}</div>
                <div style={{color:"#aaa"}}>Base : {fmtEV(baseV)}</div>
                {eqLines.map(function(d,i){return <div key={i} style={{color:"#aaa"}}>{d.name} : {(d.val>0?"+":"")+Math.round(d.val*100)+"%"}</div>;})}
                <div style={{fontWeight:700,color:c,marginTop:2}}>= {fmtEV(finalV)}</div>
              </div>;
            })}
          </div>

          <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:8,width:"100%"}}>Fermer</button>
        </div>
      </div>}
      {infoPopup==="maitrise"&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:4,fontSize:16,textAlign:"center"}}>⭐ Maîtrise</h3>
          <div style={{fontSize:13,color:"var(--td)",textAlign:"center",marginBottom:12}}>{hero.name}</div>
          {(function(){
            var mLv=hero.mastery||0;
            var frag=FRAGMENTS.find(function(f){return f.heroId===hero.id;});
            var fragCount=frag?(g.conso||{})[frag.id]||0:0;
            var canUp=mLv<10&&fragCount>=10;
            var bonusPct=mLv*5;
            return <div>
              <div style={{fontSize:18,fontWeight:700,color:"var(--t)",textAlign:"center",marginBottom:4}}>Niveau de maîtrise {mLv}</div><div style={{fontSize:13,color:"var(--td)",textAlign:"center",marginBottom:4}}>Caractéristiques de base augmentées de {bonusPct}%</div><div style={{fontSize:13,color:"#fbbf24",textAlign:"center",marginBottom:8}}>Niveau de compétence +{mLv}</div>
              <div style={{position:"relative",height:20,background:"#0a0a18",borderRadius:4,overflow:"hidden",marginBottom:12}}>
                <div style={{width:(mLv*10)+"%",height:"100%",background:"linear-gradient(90deg,#9b7ec8,#e67e22)",borderRadius:4,transition:"width .3s"}}/>
                <div style={{position:"absolute",inset:0,display:"flex"}}>{[1,2,3,4,5,6,7,8,9].map(function(i){return <div key={i} style={{position:"absolute",left:(i*10)+"%",top:0,bottom:0,width:1,background:"#ffffff20"}}/>;})}</div>
                
              </div>
              {frag&&<div style={{textAlign:"center",marginBottom:8}}>
                <div style={{fontSize:13}}>{frag.icon} {frag.name}</div>
                <div style={{fontSize:12,color:"var(--td)"}}>{fragCount} en stock · Coût : 10 fragments</div>
              </div>}
              {mLv>=10&&<div style={{textAlign:"center",color:"#4ade80",fontWeight:700,fontSize:14,marginBottom:8}}>Maîtrise maximale atteinte !</div>}
              <div style={{display:"flex",gap:8}}>
                <button className="b bgr" disabled={!canUp} onClick={function(){if(!canUp||!frag)return;setG(function(p){var nc=Object.assign({},p.conso||{});nc[frag.id]=(nc[frag.id]||0)-10;return Object.assign({},p,{conso:nc,roster:p.roster.map(function(r){return r.uid===hero.uid?Object.assign({},r,{mastery:(r.mastery||0)+1}):r;})});});}} style={{flex:1,fontSize:14}}>Augmenter</button>
                <button className="b" onClick={function(){setInfoPopup(null);}} style={{flex:1,fontSize:14}}>Fermer</button>
              </div>
            </div>;
          })()}
        </div>
      </div>}
      {infoPopup&&infoPopup.indexOf("equip_")===0&&(function(){
        var eqSlot=infoPopup.slice(6);
        var slotLabel={weapon:"Arme",armor:"Armure",accessory:"Accessoire",talisman:"Talisman"}[eqSlot]||eqSlot;
        var curItem=hero.equipment?hero.equipment[eqSlot]:null;
        var compatible=g.inv.filter(function(it){if(it.slot!==eqSlot)return false;if(eqSlot==="weapon"&&ht){var heroWt=ht.wt||"physical";if(it.wt!==heroWt)return false;}return true;}).sort(function(a,b){return b.rarity-a.rarity||b.rank-a.rank;});
        // Preview: compute stats with a hypothetical equip
        function previewWith(item){
          var testHero=Object.assign({},hero,{equipment:Object.assign({},hero.equipment||{})});
          if(item)testHero.equipment[eqSlot]=item;else delete testHero.equipment[eqSlot];
          return cs(testHero,g.bl);
        }
        var curSt=cs(hero,g.bl);
        return <div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,overflowY:"auto",padding:16}}>
          <div onClick={function(e){e.stopPropagation();}} style={{maxWidth:440,margin:"0 auto",background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:15}}>{slotLabel} — {hero.name}</h3>
              <button className="b" onClick={function(){setInfoPopup(null);}} style={{fontSize:11,padding:"4px 10px"}}>✕</button>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:16,padding:8,background:"#ffffff04",borderRadius:8,marginBottom:10,fontSize:14,fontWeight:700}}>
              <span>🩸 {curSt.hp}</span>
              <span>{(function(){var ww=gw(hero);var iM2=ht&&ht.wt==="magical";var ms2=iM2?curSt.mag:curSt.str;return (iM2?"💫":"⚔️")+" ~"+Math.round(ww.dmg*Math.max(0.1,ms2));})()}</span>
            </div>
            {curItem&&<div style={{padding:10,background:"#ffffff06",border:"1px solid var(--brd)",borderRadius:10,marginBottom:6}}>
              <div style={{fontSize:11,color:"var(--acc)",fontWeight:700,marginBottom:4}}>Équipé actuellement</div>
              <ItemInfo item={curItem} fs={13}/>
              <button className="b" style={{fontSize:11,padding:"6px 0",marginTop:6,width:"100%"}} onClick={function(){doUneq(hero.uid,eqSlot);}}>Retirer</button>
            </div>}
            {!curItem&&<div style={{padding:8,textAlign:"center",color:"#444",fontSize:12,marginBottom:6}}>Aucun {slotLabel.toLowerCase()} équipé</div>}
            {compatible.length>0&&<div style={{fontSize:12,color:"var(--td)",fontWeight:600,marginBottom:6}}>Disponibles ({compatible.length})</div>}
            {compatible.map(function(it){
              var pSt=previewWith(it);var ww2=gw(Object.assign({},hero,{equipment:Object.assign({},hero.equipment||{},function(){var o={};o[eqSlot]=it;return o;}())}));
              var iM3=ht&&ht.wt==="magical";var ms3=iM3?pSt.mag:pSt.str;var pDmg=Math.round(ww2.dmg*Math.max(0.1,ms3));
              var hpDiff=pSt.hp-curSt.hp;var wCur=gw(hero);var msCur=iM3?curSt.mag:curSt.str;var curDmg=Math.round(wCur.dmg*Math.max(0.1,msCur));var dmgDiff=pDmg-curDmg;
              return <div key={it.uid} style={{padding:8,background:"#ffffff04",border:"1px solid var(--brd)",borderRadius:8,marginBottom:4}}>
                <ItemInfo item={it} fs={12}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                  <div style={{fontSize:11,display:"flex",gap:8,alignItems:"center"}}>
                    {(hpDiff!==0||dmgDiff!==0)&&<span style={{color:"var(--td)",fontSize:10}}>Si équipé :</span>}
                    {hpDiff!==0&&<span style={{color:hpDiff>0?"#4ade80":"#ef4444"}}>🩸{hpDiff>0?"+":""}{hpDiff}</span>}
                    {dmgDiff!==0&&<span style={{color:dmgDiff>0?"#4ade80":"#ef4444"}}>{iM3?"💫":"⚔️"}{dmgDiff>0?"+":""}{dmgDiff}</span>}
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button className="b bgr" style={{fontSize:11,padding:"5px 10px"}} onClick={function(){doEquip(hero.uid,it.uid);setInfoPopup(null);}}>Équiper</button>
                    <button style={{fontSize:14,padding:"4px 8px",borderRadius:6,border:"1px solid var(--brd)",background:"#152a15",color:"#4ade80",cursor:"pointer"}} onClick={function(e){doRecycle(it.uid,e);}}>♻️</button>
                    <button style={{fontSize:14,padding:"4px 8px",borderRadius:6,border:"1px solid var(--brd)",background:"var(--card)",color:"#ef4444",cursor:"pointer"}} onClick={function(e){doSell(it.uid,e);}}>💰</button>
                  </div>
                </div>
              </div>;
            })}
            {!compatible.length&&<div style={{textAlign:"center",padding:16,color:"#444",fontSize:12}}>Aucun {slotLabel.toLowerCase()} disponible</div>}
          </div>
        </div>;
      })()}
            {infoPopup==="skill"&&(function(){var sk3=SKILLS[hero.id];if(!sk3){setInfoPopup(null);return null;}return <div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,fontSize:16}}>Compétences</h3>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:10,background:"linear-gradient(135deg,#9b7ec8,#6b4e98)",border:"2px solid #fbbf24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚡</div>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:"#fbbf24"}}>{sk3.name}</div>
              <div style={{fontSize:12,color:"var(--td)"}}>Niveau {sk3.lvl+(hero.mastery||0)}</div>
            </div>
          </div>
          <div style={{fontSize:13,color:"var(--td)",marginBottom:8,lineHeight:1.6}}>{sk3.desc}</div>
          <div style={{fontSize:13,padding:8,background:"#ffffff04",borderRadius:8}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--td)"}}>⏳ Recharge</span><span style={{fontWeight:600}}>{st.rel} tours</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{color:"var(--td)"}}>Multiplicateur</span><span style={{fontWeight:600,color:"#4ade80"}}>×{sk3.mult}</span></div>
          </div>
          <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:12,width:"100%"}}>Fermer</button>
        </div>
      </div>;})()}
            {infoPopup==="elem"&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:440,width:"100%",maxHeight:"80vh",overflowY:"auto",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,fontSize:16}}>Détail des vulnérabilités</h3>
          <div style={{fontSize:12,lineHeight:1.8,fontFamily:"monospace",color:"#ccc"}}>
            {EL.map(function(el){
              var baseV=ht&&ht.er&&ht.er[el]!=null?ht.er[el]:1;
              var eqLines=[];var eqTotal=0;
              var eq2=hero.equipment||{};
              ["weapon","armor","accessory","talisman"].forEach(function(sl){
                var it2=eq2[sl];if(it2&&it2.bon&&it2.bon.er&&it2.bon.er[el]!=null){
                  var v=it2.bon.er[el];eqTotal+=v;
                  eqLines.push({name:it2.name,val:v});
                }
              });
              var finalV=Math.max(0,baseV+eqTotal);
              var c=erc(finalV);
              return <div key={el} style={{marginBottom:8,padding:8,background:"#ffffff04",borderRadius:6}}>
                <div style={{fontWeight:700,color:(EM[el]||{}).c||"#ccc",fontSize:13,marginBottom:4}}>{(EM[el]||{}).i||""} {el}</div>
                <div style={{color:"#aaa"}}>Base : {fmtEV(baseV)}</div>
                {eqLines.map(function(d,i){return <div key={i} style={{color:"#aaa"}}>{d.name} : {(d.val>0?"+":"")+Math.round(d.val*100)+"%"}</div>;})}
                <div style={{fontWeight:700,color:c,marginTop:2}}>= {fmtEV(finalV)}</div>
              </div>;
            })}
          </div>
          <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:8,width:"100%"}}>Fermer</button>
        </div>
      </div>}
      {slv&&canLv&&(function(){var sN=cs(Object.assign({},hero,{level:hero.level+1}),g.bl);return <div onClick={function(){setSlv(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:4,fontSize:16,textAlign:"center"}}>⬆️ Niveau {hero.level} → {hero.level+1}</h3>
          <div style={{fontSize:13,color:"var(--td)",textAlign:"center",marginBottom:12}}>{hero.name}</div>
          <div style={{textAlign:"left"}}>
            {(function(){var rows=[];
              function addIf(icon,label,v,nv,type){var dA,dB;if(type==="flat"){dA=String(Math.floor(v));dB=String(Math.floor(nv));if(dA===dB)return;}else if(type==="pm"||type==="pmInv"){dA=fmtPM(v);dB=fmtPM(nv);if(dA===dB)return;}else{dA=fmtPct(v);dB=fmtPct(nv);if(dA===dB)return;}rows.push({icon:icon,label:label,val:v,nv:nv,type:type});}
              addIf("🩸","Points de vie",st.hp,sN.hp,"flat");addIf("⚔️","Force",st.str,sN.str,"pm");addIf("🔮","Magie",st.mag,sN.mag,"pm");addIf("💥","Critique",st.crit,sN.crit,"pct");addIf("🛡️","Vuln. Physique",st.phv,sN.phv,"pmInv");addIf("🔰","Vuln. Magique",st.mav,sN.mav,"pmInv");addIf("💨","Esquive",st.dodge,sN.dodge,"pct");
              return rows.map(function(r,i){return <StatRow key={i} icon={r.icon} label={r.label} val={r.val} nv={r.nv} type={r.type}/>;});})()}
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="b bgr glow" onClick={function(){doLvUp(hero.uid);}} style={{flex:1,fontSize:14}}>✓ Confirmer</button>
            <button className="b" onClick={function(){setSlv(false);}} style={{flex:1,fontSize:14}}>Annuler</button>
          </div>
        </div>
      </div>;})()}
      {tomePanel===hero.uid&&<div onClick={function(){setTomePanel(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:400,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,fontSize:16}}>📖 Utiliser des Tomes</h3>
          <div style={{fontSize:13,color:"var(--td)",marginBottom:12}}>Sélectionnez les tomes à utiliser pour {hero.name}</div>
          {(function(){var co=g.conso||{};var totalXp=0;var rows=TOMES.map(function(tm){var qty=tomeQty[tm.id]||0;var have=co[tm.id]||0;if(have<=0&&qty<=0)return null;totalXp+=qty*tm.xp;var trc=(RA[tm.rarity]||{}).c;return <div key={tm.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #ffffff08"}}>
            <div><div style={{color:trc,fontWeight:600,fontSize:13}}>{tm.icon} {tm.name}</div><div style={{fontSize:11,color:"var(--td)"}}>+{tm.xp} points d'expérience · {have} en stock</div></div>
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

  var TM={base:{l:"Ville",i:"🏰"},roster:{l:"Héros",i:"👥"},donjon:{l:"Aventure",i:"⚔️"},inventaire:{l:"Inventaire",i:"📦"},invocation:{l:"Invocation",i:"📯"}};

  // Auth guard
  if(!authReady)return <div style={{minHeight:"100vh",background:"#0e0d0d",display:"flex",alignItems:"center",justifyContent:"center",color:"#9b7ec8",fontFamily:"Uncial Antiqua",fontSize:20}}>Chargement...</div>;
  if(!user)return <AuthScreen/>;
  if(!loaded)return <div style={{minHeight:"100vh",background:"#0e0d0d",display:"flex",alignItems:"center",justifyContent:"center",color:"#9b7ec8",fontFamily:"Uncial Antiqua",fontSize:16}}>Chargement de la sauvegarde...</div>;

  return(<div style={{minHeight:"100vh",background:"var(--bg)",padding:"44px 8px 70px 8px",maxWidth:900,margin:"0 auto"}}><style>{css}</style>
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:80,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px",background:"var(--bg)",borderBottom:"1px solid var(--brd)"}}>
      <h1 style={{fontFamily:"Uncial Antiqua",fontSize:16,fontWeight:900,color:"var(--acc)"}}>ECLIPSIA</h1>
      <div style={{display:"flex",gap:14,fontSize:15,fontWeight:600,alignItems:"center"}}>
        <span>💰 {g.gold.toLocaleString()}</span><span>📜 {g.scrolls||0}</span>
        <div style={{position:"relative"}}>
          <button onClick={function(){setMenuOpen(!menuOpen);}} style={{background:"none",border:"none",color:"var(--t)",fontSize:20,cursor:"pointer",padding:"0 4px"}}>☰</button>
          {menuOpen&&<div style={{position:"absolute",right:0,top:30,background:"var(--card)",border:"1px solid var(--brd)",borderRadius:10,padding:6,minWidth:200,zIndex:100,animation:"fi .2s ease"}}>
            <div onClick={function(){setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"var(--td)"}}>📖 Tutoriel</div>
            <div onClick={function(){setPatchNotes(true);setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6}}>📋 Notes de mise à jour</div>
            <div onClick={function(){reset();setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"var(--red)"}}>🔄 Réinitialiser</div>
            <div onClick={function(){setG(function(p){var nc=Object.assign({},p.conso||{});nc.tome_5=(nc.tome_5||0)+100;return Object.assign({},p,{gold:p.gold+100000,scrolls:(p.scrolls||0)+1000,conso:nc});});setMenuOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"#fbbf24"}}>🎮 Cheat</div>
            <div style={{borderTop:"1px solid var(--brd)",marginTop:4,paddingTop:4}}>
              <div style={{padding:"6px 12px",fontSize:11,color:"var(--td)"}}>{user?user.email:""}</div>
              {saving&&<div style={{padding:"4px 12px",fontSize:11,color:"#fbbf24"}}>💾 Sauvegarde...</div>}
              <div onClick={function(){supabase.auth.signOut();setMenuOpen(false);setLoaded(false);setG(INIT);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,borderRadius:6,color:"var(--td)"}}>🚪 Déconnexion</div>
            </div>
          </div>}
        </div>
      </div>
    </div>
    {patchNotes&&<div onClick={function(){setPatchNotes(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:500,maxHeight:"80vh",overflowY:"auto",border:"1px solid var(--brd)"}}>
      <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12}}>Notes de mise à jour</h3>
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

    {floats.filter(function(f){return f.uid==="ui";}).length>0&&<div style={{position:"fixed",top:(floats.find(function(f){return f.uid==="ui";}).y||100)-30,left:(floats.find(function(f){return f.uid==="ui";}).x||200),zIndex:200,pointerEvents:"none"}}>
      {floats.filter(function(f){return f.uid==="ui";}).map(function(f){return <div key={f.id} style={{color:f.color,fontSize:16,fontWeight:800,textShadow:"0 2px 6px #000",animation:"floatUp 1.2s forwards",textAlign:"center",whiteSpace:"nowrap"}}>{f.val}</div>;})}
    </div>}

    {tab==="base"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)",marginBottom:10}}>🏰 Ville</h2>
      {(function(){
        var m=g.mat||{};var flv=g.bl.forge||1;var alv=g.bl.alchimiste||1;
        function forgeChance(rank,rarity,fLv){var diff=Math.max(0,(rank-2)*8+Math.max(0,(rarity-2))*12+Math.max(0,(rank-3))*(rarity-1)*3);var skill=fLv*12;var ch=100-diff+skill;return Math.max(5,Math.min(100,Math.round(ch)));}
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
        var MARCHE_COSTS={2:1000,3:5000,4:20000,5:50000};
        var mNextCost=mlv<5?MARCHE_COSTS[mlv+1]||null:null;
        // Shop items categorized
        var shopConso=[];var shopGab=[];var shopCata=[];
        if(mlv>=1){shopConso.push({id:"scroll",name:"Parchemin d'invocation",cost:1000,rar:1,icon:"📜"});shopConso.push({id:"scroll_10",name:"Parchemin d'invocation ×10",cost:9500,rar:1,icon:"📜",qty:10});shopGab.push({id:"gabarit_1",name:GABARIT_NAMES[1]+" (Rang 1)",cost:50,rar:1,icon:"📐"});shopGab.push({id:"gabarit_2",name:GABARIT_NAMES[2]+" (Rang 2)",cost:250,rar:1,icon:"📐"});shopCata.push({id:"catalyseur_1",name:CATA_NAMES[1],cost:100,rar:1,icon:"💎"});shopConso.push({id:"tome_1",name:"Tome d'expérience mineur",cost:150,rar:1,icon:"📖"});}
        if(mlv>=2){shopGab.push({id:"gabarit_3",name:GABARIT_NAMES[3]+" (Rang 3)",cost:1250,rar:1,icon:"📐"});}
        if(mlv>=3){shopGab.push({id:"gabarit_4",name:GABARIT_NAMES[4]+" (Rang 4)",cost:6250,rar:2,icon:"📐"});shopCata.push({id:"catalyseur_2",name:CATA_NAMES[2],cost:1000,rar:2,icon:"💎"});shopConso.push({id:"tome_2",name:"Tome d'expérience",cost:650,rar:2,icon:"📖"});}
        if(mlv>=4){shopGab.push({id:"gabarit_5",name:GABARIT_NAMES[5]+" (Rang 5)",cost:31250,rar:2,icon:"📐"});}
        if(mlv>=5){shopCata.push({id:"catalyseur_3",name:CATA_NAMES[3],cost:10000,rar:3,icon:"💎"});shopConso.push({id:"tome_3",name:"Tome d'expérience majeur",cost:3250,rar:3,icon:"📖"});}
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
        function ShopCard(props){var si=props.item;var rc=(RA[si.rar]||{}).c||"#888";return <div style={{background:rc+"08",border:"1px solid "+rc+"30",borderRadius:8,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:rc,fontWeight:600,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{si.icon} {si.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:12,color:"#fbbf24",fontWeight:600}}>{si.cost.toLocaleString()}g</span>
            <button className="b bg" disabled={g.gold<si.cost} onClick={function(){doBuy(si);}} style={{fontSize:11,padding:"4px 10px"}}>Acheter</button>
          </div>
        </div>;}
        var BUILDING_INFO={forge:"Le forgeron permet de créer de l'équipement à partir de divers composants. La base inerte définit le type d'équipement créé, le gabarit son rang, et le catalyseur sa rareté. Les chances de réussite sont proportionnelles à la complexité de l'équipement désiré. Augmenter le niveau d'expertise du forgeron permet d'augmenter les chances de succès. Il est possible d'acquérir des composants supplémentaires en recyclant de l'équipement ou en les achetant au marché.",marche:"Le marché propose divers composants et consommables à l'achat. Améliorer le marché débloque de nouveaux articles.",alchimiste:"L'alchimiste permet de transmuter des matériaux en composants de rang ou de rareté supérieur. 10 composants du même type sont nécessaires pour obtenir 1 composant du rang suivant. Améliorer l'alchimiste débloque des recettes de rang supérieur."};
        function PnlH(props){var isOpen=vp===props.k;return <div style={{marginBottom:isOpen?0:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,cursor:"pointer",background:"var(--card)",border:"1px solid var(--brd)",borderRadius:isOpen?"12px 12px 0 0":"12px"}} onClick={props.onClick}>
            <div><span style={{fontSize:20,marginRight:8}}>{props.icon}</span><span style={{fontWeight:700,fontSize:14}}>{props.name}</span>{props.lv!=null&&<span style={{fontSize:11,color:"var(--acc)",marginLeft:6}}>Nv.{props.lv}</span>}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {BUILDING_INFO[props.k]&&<button onClick={function(e){e.stopPropagation();setInfoPopup("bld_"+props.k);}} className="b" style={{fontSize:10,padding:"2px 8px",color:"var(--td)"}}>INFO</button>}
              <span style={{fontSize:14,color:"var(--td)",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
            </div>
          </div>
        </div>;}
        return <div>
          {/* FORGERON */}
          
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {[{k:"forge",n:"Forgeron",ic:"🔨",lv:flv},{k:"marche",n:"Marché",ic:"🏪",lv:mlv},{k:"alchimiste",n:"Alchimiste",ic:"⚗️",lv:alv},{k:"rempart",n:"Rempart",ic:"🏰",dis:true},{k:"autel",n:"Autel",ic:"🩸",dis:true},{k:"tour",n:"Tour Arcane",ic:"🗼",dis:true}].map(function(b){
            return <div key={b.k} onClick={function(){if(!b.dis)setBldPopup(b.k);}} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:12,textAlign:"center",cursor:b.dis?"default":"pointer",opacity:b.dis?0.3:1,minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:26}}>{b.ic}</div>
              <div style={{fontWeight:700,fontSize:12,marginTop:4}}>{b.n}</div>
              {b.lv!=null&&<div style={{fontSize:10,color:"var(--acc)"}}>Nv.{b.lv}</div>}
              {b.dis&&<div style={{fontSize:9,color:"#555"}}>Bientôt</div>}
            </div>;
          })}
        </div>

          {bldPopup==="forge"&&<div onClick={function(){setBldPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,overflowY:"auto",padding:16}}><div onClick={function(e){e.stopPropagation();}} style={{maxWidth:480,margin:"0 auto",background:"var(--card)",borderRadius:14,padding:14,marginBottom:6,border:"1px solid var(--brd)",borderTop:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:16}}>🔨 Forgeron Nv.{flv}</h3><button onClick={function(e){e.stopPropagation();setInfoPopup("bld_"+bldPopup);}} className="b" style={{fontSize:10,padding:"2px 8px",color:"var(--td)"}}>INFO</button></div>


            {/* 3 lines: Type, Rang, Rareté — show item names */}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #ffffff08"}}>
                <span style={{fontSize:12,color:"var(--td)",minWidth:45}}>Type</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){var i=SLOT_KEYS.indexOf(fs.slot);setFs(Object.assign({},fs,{slot:SLOT_KEYS[(i-1+4)%4]}));setFResult(null);}}>◄</button>
                  <div style={{minWidth:80,textAlign:"center",fontSize:12,fontWeight:600}}>{SLOT_NAMES[fs.slot]+" inerte"}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){var i=SLOT_KEYS.indexOf(fs.slot);setFs(Object.assign({},fs,{slot:SLOT_KEYS[(i+1)%4]}));setFResult(null);}}>►</button>
                </div>
                <span style={{fontSize:11,color:hasInerte?"#4ade80":"#ef4444",minWidth:50,textAlign:"right",fontSize:10}}>{m[inerteKey]||0}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #ffffff08"}}>
                <span style={{fontSize:12,color:"var(--td)",minWidth:45}}>Rang</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rank:Math.max(1,fs.rank-1)}));setFResult(null);}}>◄</button>
                  <div style={{minWidth:80,textAlign:"center",fontSize:11,fontWeight:600}}>{GABARIT_NAMES[fs.rank]}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rank:Math.min(15,fs.rank+1)}));setFResult(null);}}>►</button>
                </div>
                <span style={{fontSize:11,color:hasGab?"#4ade80":"#ef4444",minWidth:50,textAlign:"right",fontSize:10}}>{m[gabKey]||0}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
                <span style={{fontSize:12,color:"var(--td)",minWidth:45}}>Rareté</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rar:Math.max(1,fs.rar-1)}));setFResult(null);}}>◄</button>
                  <div style={{minWidth:80,textAlign:"center",fontSize:12,fontWeight:600,color:(RA[fs.rar]||{}).c}}>{(RA[fs.rar]||{}).s}</div>
                  <button className="b" style={{padding:"4px 10px",fontSize:14}} onClick={function(){setFs(Object.assign({},fs,{rar:Math.min(5,fs.rar+1)}));setFResult(null);}}>►</button>
                </div>
                <span style={{fontSize:11,color:hasCata?"#4ade80":"#ef4444",minWidth:50,textAlign:"right",fontSize:10}}>{m[cataKey]||0}</span>
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
            {fNextCost!=null&&<><div style={{height:1,background:"var(--brd)",margin:"10px 0"}}/><div style={{background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:8,padding:10,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>Améliorer le Forgeron au niveau {flv+1}</span>
              <button className="b bg" disabled={g.gold<fNextCost} onClick={function(){if(g.gold<fNextCost)return;setG(function(p){var bl=Object.assign({},p.bl);bl.forge=(bl.forge||1)+1;return Object.assign({},p,{gold:p.gold-fNextCost,bl:bl});});}} style={{fontSize:13,padding:"6px 14px"}}>{fNextCost.toLocaleString()} or</button>
            </div></>}
          <div style={{position:"sticky",bottom:0,padding:"8px 0",background:"var(--card)",borderTop:"1px solid var(--brd)",marginTop:8}}><button className="b" onClick={function(){setBldPopup(null);}} style={{width:"100%",fontSize:13,padding:"10px 0"}}>Fermer</button></div></div></div>}

          {/* MARCHÉ */}
          
          {bldPopup==="marche"&&<div onClick={function(){setBldPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,overflowY:"auto",padding:16}}><div onClick={function(e){e.stopPropagation();}} style={{maxWidth:480,margin:"0 auto",background:"var(--card)",borderRadius:14,padding:14,marginTop:-6,marginBottom:10,border:"1px solid var(--brd)",borderTop:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:16}}>🏪 Marché Nv.{mlv}</h3><button onClick={function(e){e.stopPropagation();setInfoPopup("bld_"+bldPopup);}} className="b" style={{fontSize:10,padding:"2px 8px",color:"var(--td)"}}>INFO</button></div>

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
              {mNextCost!=null&&mlv<5&&<><div style={{height:1,background:"var(--brd)",margin:"10px 0"}}/><div style={{background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:8,padding:10,marginTop:4,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>Améliorer le Marché au niveau {mlv+1}</span>
                <button className="b bg" disabled={g.gold<mNextCost} onClick={function(){setG(function(p){var bl=Object.assign({},p.bl);bl.marche=(bl.marche||1)+1;return Object.assign({},p,{gold:p.gold-mNextCost,bl:bl});});}} style={{fontSize:13,padding:"6px 14px"}}>{mNextCost.toLocaleString()} or</button>
              </div></>}
            </div>
          <div style={{position:"sticky",bottom:0,padding:"8px 0",background:"var(--card)",borderTop:"1px solid var(--brd)",marginTop:8}}><button className="b" onClick={function(){setBldPopup(null);}} style={{width:"100%",fontSize:13,padding:"10px 0"}}>Fermer</button></div></div></div>}

          {/* ALCHIMISTE */}
          {bldPopup==="alchimiste"&&<div onClick={function(){setBldPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,overflowY:"auto",padding:16}}><div onClick={function(e){e.stopPropagation();}} style={{maxWidth:480,margin:"0 auto",background:"var(--card)",borderRadius:14,padding:14,marginTop:-6,marginBottom:6,border:"1px solid var(--brd)",borderTop:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:16}}>⚗️ Alchimiste Nv.{alv}</h3><button onClick={function(e){e.stopPropagation();setInfoPopup("bld_"+bldPopup);}} className="b" style={{fontSize:10,padding:"2px 8px",color:"var(--td)"}}>INFO</button></div>

            {(function(){var alv=g.bl.alchimiste||1;
              var ALCH_COSTS={2:1000,3:5000,4:20000,5:50000};
              var aNextCost=alv<5?ALCH_COSTS[alv+1]||null:null;
              function doTransmute(fromKey,toKey,qty){setG(function(p){var nm=Object.assign({},p.mat||{});if((nm[fromKey]||0)<qty)return p;nm[fromKey]=(nm[fromKey]||0)-qty;nm[toKey]=(nm[toKey]||0)+1;return Object.assign({},p,{mat:nm});});}
              function RecipeCard(rp){var have=m[rp.from]||0;var canDo=have>=rp.qty;var fcol=(RA[rp.fr]||{}).c||"#888";var tcol=(RA[rp.tr]||{}).c||"#888";return <div style={{background:"#ffffff04",border:"1px solid var(--brd)",borderRadius:8,padding:8}}>
                <div style={{fontSize:11}}>{rp.qty}× <span style={{color:fcol,fontWeight:600}}>{rp.fromName}</span></div>
                <div style={{fontSize:11}}>→ 1× <span style={{color:tcol,fontWeight:600}}>{rp.toName}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                  <span style={{fontSize:10,color:canDo?"#4ade80":"#ef4444"}}>{have} en stock</span>
                  <button className="b bg" disabled={!canDo} onClick={function(){doTransmute(rp.from,rp.to,rp.qty);}} style={{fontSize:10,padding:"3px 8px"}}>Transmuter</button>
                </div>
              </div>;}
              var cataRecipes=[];var gabRecipes=[];var tomeRecipes=[];
              function gabRar(r){return r<=3?1:r<=6?2:r<=9?3:r<=12?4:5;}
              // Gabarits: 10x RN > 1x RN+1
              if(alv>=1){for(var gi=1;gi<=3;gi++)gabRecipes.push({from:"gabarit_"+gi,to:"gabarit_"+(gi+1),qty:10,fromName:GABARIT_NAMES[gi]+" (Rang "+gi+")",toName:GABARIT_NAMES[gi+1]+" (Rang "+(gi+1)+")",fr:gabRar(gi),tr:gabRar(gi+1)});}
              if(alv>=2){for(var gi=4;gi<=6;gi++)gabRecipes.push({from:"gabarit_"+gi,to:"gabarit_"+(gi+1),qty:10,fromName:GABARIT_NAMES[gi]+" (Rang "+gi+")",toName:GABARIT_NAMES[gi+1]+" (Rang "+(gi+1)+")",fr:gabRar(gi),tr:gabRar(gi+1)});cataRecipes.push({from:"catalyseur_1",to:"catalyseur_2",qty:10,fromName:CATA_NAMES[1],toName:CATA_NAMES[2],fr:1,tr:2});tomeRecipes.push({from:"tome_1",to:"tome_2",qty:5,fromName:"Tome mineur",toName:"Tome normal",fr:1,tr:2});}
              if(alv>=3){for(var gi=7;gi<=9;gi++)gabRecipes.push({from:"gabarit_"+gi,to:"gabarit_"+(gi+1),qty:10,fromName:GABARIT_NAMES[gi]+" (Rang "+gi+")",toName:GABARIT_NAMES[gi+1]+" (Rang "+(gi+1)+")",fr:gabRar(gi),tr:gabRar(gi+1)});cataRecipes.push({from:"catalyseur_2",to:"catalyseur_3",qty:10,fromName:CATA_NAMES[2],toName:CATA_NAMES[3],fr:2,tr:3});tomeRecipes.push({from:"tome_2",to:"tome_3",qty:5,fromName:"Tome normal",toName:"Tome majeur",fr:2,tr:3});}
              if(alv>=4){for(var gi=10;gi<=12;gi++)gabRecipes.push({from:"gabarit_"+gi,to:"gabarit_"+(gi+1),qty:12,fromName:GABARIT_NAMES[gi]+" (Rang "+gi+")",toName:GABARIT_NAMES[gi+1]+" (Rang "+(gi+1)+")",fr:gabRar(gi),tr:gabRar(gi+1)});cataRecipes.push({from:"catalyseur_3",to:"catalyseur_4",qty:10,fromName:CATA_NAMES[3],toName:CATA_NAMES[4],fr:3,tr:4});tomeRecipes.push({from:"tome_3",to:"tome_4",qty:5,fromName:"Tome majeur",toName:"Tome considérable",fr:3,tr:4});}
              if(alv>=5){for(var gi=13;gi<=14;gi++)gabRecipes.push({from:"gabarit_"+gi,to:"gabarit_"+(gi+1),qty:15,fromName:GABARIT_NAMES[gi]+" (Rang "+gi+")",toName:GABARIT_NAMES[gi+1]+" (Rang "+(gi+1)+")",fr:gabRar(gi),tr:gabRar(gi+1)});cataRecipes.push({from:"catalyseur_4",to:"catalyseur_5",qty:10,fromName:CATA_NAMES[4],toName:CATA_NAMES[5],fr:4,tr:5});tomeRecipes.push({from:"tome_4",to:"tome_5",qty:5,fromName:"Tome considérable",toName:"Tome extraordinaire",fr:4,tr:5});}

              function TomeRecipeCard(tp){var co2=g.conso||{};var have2=co2[tp.from]||0;var can2=have2>=tp.qty;var fcol2=(RA[tp.fr]||{}).c||"#888";var tcol2=(RA[tp.tr]||{}).c||"#888";
              return <div style={{background:"#ffffff04",border:"1px solid var(--brd)",borderRadius:8,padding:8}}>
                <div style={{fontSize:11}}>{tp.qty}× <span style={{color:fcol2,fontWeight:600}}>{tp.fromName}</span></div>
                <div style={{fontSize:11}}>→ 1× <span style={{color:tcol2,fontWeight:600}}>{tp.toName}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                  <span style={{fontSize:10,color:can2?"#4ade80":"#ef4444"}}>{have2} en stock</span>
                  <button className="b bg" disabled={!can2} onClick={function(){setG(function(p){var nc=Object.assign({},p.conso||{});nc[tp.from]=(nc[tp.from]||0)-tp.qty;nc[tp.to]=(nc[tp.to]||0)+1;return Object.assign({},p,{conso:nc});});}} style={{fontSize:10,padding:"3px 8px"}}>Transmuter</button>
                </div>
              </div>;}
              return <div>
                {cataRecipes.length>0&&<div><div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Catalyseurs</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>{cataRecipes.map(function(r){return <RecipeCard key={r.name||r.from} from={r.from} to={r.to} qty={r.qty} fromName={r.fromName} toName={r.toName} fr={r.fr} tr={r.tr}/>;})}</div></div>}
                {gabRecipes.length>0&&<div><div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Gabarits</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>{gabRecipes.map(function(r){return <RecipeCard key={r.name||r.from} from={r.from} to={r.to} qty={r.qty} fromName={r.fromName} toName={r.toName} fr={r.fr} tr={r.tr}/>;})}</div></div>}
                {tomeRecipes.length>0&&<div><div style={{fontSize:13,color:"var(--td)",fontWeight:600,marginBottom:6}}>Tomes d'expérience</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:12}}>{tomeRecipes.map(function(r){return <TomeRecipeCard key={r.name||r.from} from={r.from} to={r.to} qty={r.qty} fromName={r.fromName} toName={r.toName} fr={r.fr} tr={r.tr}/>;})}</div></div>}
                {aNextCost!=null&&<><div style={{height:1,background:"var(--brd)",margin:"10px 0"}}/><div style={{background:"linear-gradient(135deg,#1c1a1a,#241e1e)",borderRadius:8,padding:10,marginTop:4,border:"1px solid var(--brd)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>Améliorer l'Alchimiste au niveau {alv+1}</span><button className="b bg" disabled={g.gold<aNextCost} onClick={function(){setG(function(p){var bl=Object.assign({},p.bl);bl.alchimiste=(bl.alchimiste||1)+1;return Object.assign({},p,{gold:p.gold-aNextCost,bl:bl});});}} style={{fontSize:13,padding:"6px 14px"}}>{aNextCost.toLocaleString()} or</button></div></>}
              </div>;
            })()}
          <div style={{position:"sticky",bottom:0,padding:"8px 0",background:"var(--card)",borderTop:"1px solid var(--brd)",marginTop:8}}><button className="b" onClick={function(){setBldPopup(null);}} style={{width:"100%",fontSize:13,padding:"10px 0"}}>Fermer</button></div></div></div>}

          {/* Building info popup */}
          {infoPopup&&infoPopup.indexOf("bld_")===0&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:440,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
              <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",marginBottom:12,fontSize:16}}>{(function(){var k=infoPopup.slice(4);return k==="forge"?"🔨 Forgeron":k==="marche"?"🏪 Marché":k==="alchimiste"?"⚗️ Alchimiste":"Info";})()}</h3>
              <div style={{fontSize:13,color:"var(--td)",lineHeight:1.8,fontStyle:"italic"}}>{BUILDING_INFO[infoPopup.slice(4)]||"Informations à venir."}</div>
              <button className="b" onClick={function(){setInfoPopup(null);}} style={{marginTop:12,width:"100%"}}>Fermer</button>
            </div>
          </div>}


        </div>;
      })()}
    </div>}

    {tab==="roster"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)",marginBottom:8}}>Héros ({g.roster.length})</h2>
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        {[["team","Équipe"],["rarity","Rareté"],["level","Niveau"],["dmg","Dégâts"]].map(function(s){return <button key={s[0]} className={"b "+(heroSort===s[0]?"ton":"")} onClick={function(){setHeroSort(s[0]);}} style={{flex:1,fontSize:11}}>{s[1]}</button>;})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6}}>
        {(function(){
          var sorted=[].concat(g.roster);
          if(heroSort==="rarity")sorted.sort(function(a,b){return b.rarity-a.rarity||b.level-a.level;});
          else if(heroSort==="level")sorted.sort(function(a,b){return b.level-a.level;});
          else if(heroSort==="dmg"){sorted.sort(function(a,b){var wa=gw(a),wb=gw(b);var sa=cs(a,g.bl),sb=cs(b,g.bl);var htA=HEROES.find(function(h){return h.id===a.id;}),htB=HEROES.find(function(h){return h.id===b.id;});var mA=htA&&htA.wt==="magical"?sa.mag:sa.str;var mB=htB&&htB.wt==="magical"?sb.mag:sb.str;return Math.round(wb.dmg*Math.max(0.1,mB))-Math.round(wa.dmg*Math.max(0.1,mA));});}
          else if(heroSort==="team"){sorted.sort(function(a,b){var aT=g.team.indexOf(a.uid)>=0?0:1;var bT=g.team.indexOf(b.uid)>=0?0:1;return aT-bT||b.rarity-a.rarity||b.level-a.level;});}
          return sorted.map(function(h){
            var hst=cs(h,g.bl);var rc=(RA[h.rarity]||{}).c||"#888";
            var ww=gw(h);var ht2=HEROES.find(function(hh){return hh.id===h.id;});
            var ww2=gw(h);var iM=ww2.wt==="magical";var ms=iM?hst.mag:hst.str;
            var avg=Math.round(ww.dmg*Math.max(0.1,ms));
            var canLv=h.xp>=xpN(h.level);
            return <div key={h.uid} onClick={function(){setSheet(h.uid);}} style={{padding:8,background:"linear-gradient(145deg,"+rc+"15,"+rc+"08)",border:"1px solid "+rc+"40",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <Portrait id={h.id} size={44} fs={22} icon={h.icon} canLv={canLv}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13}}>{h.name}{g.team.indexOf(h.uid)>=0?" ✅":""}</div>
                <div style={{fontSize:10,color:rc,fontWeight:700}}>{(RA[h.rarity]||{}).s}</div>
                <div style={{fontSize:11,color:"var(--td)",marginTop:2}}>🩸 {hst.hp}  {iM?"💫":"⚔️"} ~{avg}</div>
              </div>
              <div style={{fontSize:18,fontWeight:900,color:rc+"70",fontFamily:"Uncial Antiqua",flexShrink:0}}>{h.level}</div>
            </div>;
          });
        })()}
      </div>
      {!g.roster.length&&<div style={{textAlign:"center",padding:40,color:"var(--td)",fontSize:14}}>Pas de héros — Invoc. !</div>}
    </div>}

    {tab==="inventaire"&&<div style={{animation:"fi .3s ease"}}><h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)",marginBottom:10}}>📦 Inventaire</h2>
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
        fragList.sort(function(a,b){return a.r-b.r;});
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
      {!dun&&!showCamp&&<div><h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)",marginBottom:10}}>Aventure</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:8}}>
          <div onClick={function(){setShowCamp(true);}} style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:14,textAlign:"center",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",minHeight:80}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"url(./backgrounds/campaign.png)",backgroundSize:"cover",backgroundPosition:"center",opacity:0.15}}/>
            <div style={{fontWeight:700,fontSize:15,fontFamily:"Uncial Antiqua",color:"var(--acc)",zIndex:1}}>Campagne Principale</div>
            <div style={{fontSize:10,color:"var(--td)",marginTop:2,zIndex:1}}>Parcourez des plaines venteuses, des déserts arides, des cavernes lugubres...Bref, vivez la grande aventure !</div>
          </div>
          <div style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:14,textAlign:"center",opacity:0.3,minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"url(./backgrounds/labyrinth.png)",backgroundSize:"cover",backgroundPosition:"center",opacity:0.15}}/>
            <div style={{fontWeight:700,fontSize:15,fontFamily:"Uncial Antiqua",color:"var(--acc)",zIndex:1}}>Labyrinthe Mécanique</div>
            <div style={{fontSize:9,color:"#555",zIndex:1}}>Un labyrinthe fait d'acier et de rouages, créé par un inventeur fou et dont il a peuplé les couloirs de ses dangeureuses créations.</div>
          </div>
          <div style={{background:"var(--card)",border:"1px solid var(--brd)",borderRadius:12,padding:14,textAlign:"center",opacity:0.3,minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"url(./backgrounds/rift.png)",backgroundSize:"cover",backgroundPosition:"center",opacity:0.15}}/>
            <div style={{fontWeight:700,fontSize:15,fontFamily:"Uncial Antiqua",color:"var(--acc)",zIndex:1}}>Faille Infernale</div>
            <div style={{fontSize:9,color:"#555",zIndex:1}}>Une poche interdimensionnelle habitée par un messager du mal.</div>
          </div>
        </div>
      </div>}

      {!dun&&showCamp&&<div style={{position:"fixed",inset:0,background:"var(--bg)",zIndex:100,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,maxWidth:540,margin:"0 auto",width:"100%",padding:"10px 12px 16px",display:"flex",flexDirection:"column"}}>
          <div style={{marginBottom:8}}><button className="b" onClick={function(){setShowCamp(false);}} style={{fontSize:13}}>← Retour</button></div>
          <h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)",marginBottom:8}}>Campagne</h2>
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
            <button className="b bg" onClick={function(){setTeamPick(i);}} style={{fontSize:14,width:"100%",padding:"10px 0"}}>⚔️ Explorer</button>
          </div>}
        </div>;})}
      </div>
        </div>}

      {teamPick!=null&&!dun&&<div onClick={function(){setTeamPick(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,overflowY:"auto",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{maxWidth:440,margin:"0 auto",background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:15,marginBottom:10}}>Sélection d'équipe</h3>
          <div style={{fontSize:13,color:"var(--td)",marginBottom:8}}>Équipe : {team.length}/4 — {DG[teamPick]?DG[teamPick].name:""}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6,marginBottom:10}}>
            {[0,1,2,3].map(function(i){
              var h=g.team[i]?g.roster.find(function(r){return r.uid===g.team[i];}):null;
              if(!h)return <div key={i} style={{padding:12,borderRadius:10,border:"2px dashed #ffffff15",textAlign:"center",color:"#444",fontSize:12}}>Slot {i+1}</div>;
              var hst=cs(h,g.bl);var rc=(RA[h.rarity]||{}).c;
              var ww2=gw(h);var ht3=HEROES.find(function(hh){return hh.id===h.id;});var iM3=ww2.wt==="magical";var ms3=iM3?hst.mag:hst.str;var avg3=Math.round(ww2.dmg*Math.max(0.1,ms3));
              return <div key={i} style={{padding:10,borderRadius:12,background:rc+"12",border:"1px solid "+rc+"40",position:"relative"}}>

                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Portrait id={h.id} size={44} fs={22} icon={h.icon}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12}}>{h.name} <span style={{color:"var(--td)",fontSize:10}}>Nv.{h.level}</span></div>
                    <div style={{fontSize:9,color:rc}}>{(RA[h.rarity]||{}).s}</div>
                    <div style={{fontSize:10,color:"var(--td)",marginTop:1}}>🩸 {hst.hp}  {iM3?"💫":"⚔️"} ~{avg3}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                    <button onClick={function(){doTogTeam(h.uid);}} className="b" style={{fontSize:10,padding:"5px 8px",background:"#ef444420",color:"#ef4444",border:"1px solid #ef444440"}}>Retirer</button>
                    <button onClick={function(e){e.stopPropagation();setTeamPick(null);setSheet(h.uid);}} className="b" style={{fontSize:10,padding:"5px 8px"}}>Profil</button>
                  </div>
                </div>
              </div>;
            })}
          </div>
          <div style={{fontSize:12,color:"var(--td)",fontWeight:600,marginBottom:6}}>Réserve</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6,marginBottom:12}}>
            {g.roster.filter(function(h){return g.team.indexOf(h.uid)<0;}).sort(function(a,b){return b.rarity-a.rarity||b.level-a.level;}).map(function(h){
              var rc=(RA[h.rarity]||{}).c;var full=g.team.indexOf(null)<0;
              var hst4=cs(h,g.bl);var ww4=gw(h);var ht4=HEROES.find(function(hh){return hh.id===h.id;});var iM4=ww4.wt==="magical";var ms4=iM4?hst4.mag:hst4.str;var avg4=Math.round(ww4.dmg*Math.max(0.1,ms4));
              return <div key={h.uid} style={{padding:8,borderRadius:10,background:"linear-gradient(145deg,"+rc+"18,"+rc+"08)",border:"1px solid "+rc+"40",opacity:full?0.4:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Portrait id={h.id} size={44} fs={22} icon={h.icon}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12}}>{h.name} <span style={{color:"var(--td)",fontSize:10}}>Nv.{h.level}</span></div>
                    <div style={{fontSize:9,color:rc}}>{(RA[h.rarity]||{}).s}</div>
                    <div style={{fontSize:10,color:"var(--td)",marginTop:1}}>🩸 {hst4.hp}  {iM4?"💫":"⚔️"} ~{avg4}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
                    <button className="b" disabled={full} onClick={function(){if(!full)doTogTeam(h.uid);}} style={{fontSize:10,padding:"5px 8px",background:"#4ade8020",color:"#4ade80",border:"1px solid #4ade8040"}}>Ajouter</button>
                    <button className="b" onClick={function(e){e.stopPropagation();setTeamPick(null);setSheet(h.uid);}} style={{fontSize:10,padding:"5px 8px"}}>Profil</button>
                  </div>
                </div>
              </div>;
            })}
          </div>
          <div style={{position:"sticky",bottom:0,background:"var(--card)",padding:"8px 0",display:"flex",gap:8,zIndex:10,borderTop:"1px solid var(--brd)"}}>
            <button className="b bg" disabled={!team.length} onClick={function(){startDun(teamPick);setTeamPick(null);}} style={{flex:1,fontSize:14,padding:"12px 0"}}>Lancer !</button>
            <button className="b" onClick={function(){setTeamPick(null);}} style={{flex:1,fontSize:14,padding:"12px 0"}}>Annuler</button>
          </div>
        </div>
      </div>}
            {dun&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div><h2 style={{fontFamily:"Uncial Antiqua",fontSize:16,color:"var(--acc)"}}>{DG[dun.ti].name}</h2><div style={{fontSize:12,color:"var(--td)"}}>Étape {dun.fl+1}/{DG[dun.ti].structure.length} · 💰{dun.rG} · ⭐{dun.rX} · 🎁{(dun.rE||[]).length}{dun.buffs>0?" · 🔮×"+dun.buffs:""}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {au&&<div style={{padding:"6px 12px",borderRadius:10,background:"#9b7ec8",color:"#fff",fontSize:12,fontWeight:800,opacity:1,animation:"blink 2s ease-in-out infinite"}}>AUTO</div>}
            <button className="b br" onClick={function(){endDun(false);setAu(false);}} style={{fontSize:12}}>🏳️ Fuir</button>
          </div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:12,padding:14,marginBottom:6,border:"1px solid var(--brd)",minHeight:340,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>{dun&&DG[dun.ti]&&DG[dun.ti].bg&&<div style={{position:"absolute",inset:0,backgroundImage:"url("+DG[dun.ti].bg+")",backgroundSize:"cover",backgroundPosition:"center",opacity:0.15,pointerEvents:"none"}}/>}
          {dun.ph==="combat"&&<div style={{width:"100%",position:"relative",zIndex:1}}>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>{dun.en.map(function(e){return <Unit key={e.uid} u={e} isE act={dun.tO[dun.tI%dun.tO.length]===e.uid} sel={tgt===e.uid} onClick={e.hp>0?function(){setTgt(e.uid);}:undefined}/>;})}</div>
            <div style={{textAlign:"center",fontSize:14,color:"#555",margin:"2px 0"}}>— VS —</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginTop:8}}>{dun.team.map(function(h){return <Unit key={h.uid} u={h} act={dun.tO[dun.tI%dun.tO.length]===h.uid}/>;})}</div>
          </div>}
          {dun.ph==="result"&&<div style={{textAlign:"center",position:"relative",zIndex:1,background:"var(--bg2)",borderRadius:10,padding:16}}><div style={{fontSize:18,fontWeight:700,color:"var(--red)",marginBottom:8}}>💀 Défaite</div><div style={{fontSize:13,color:"var(--td)",marginBottom:8}}>💰 {dun.rG} or · ⭐ {dun.rX} XP · 🎁 {(dun.rE||[]).length} objets récupérés</div><button className="b bg" onClick={function(){endDun(false);setAu(false);}} style={{marginTop:4}}>Retour</button></div>}
          {dun.ph==="event"&&<div style={{textAlign:"center",position:"relative",zIndex:1,background:"var(--bg2)",borderRadius:10,padding:16}}><div style={{fontSize:22,marginBottom:8}}>{dun.evtText||"Événement !"}</div><div style={{fontSize:14,color:"var(--td)"}}>{dun.evtDetail||""}</div></div>}
          {dun.ph==="victory"&&<div style={{textAlign:"center",position:"relative",zIndex:1,background:"var(--bg2)",borderRadius:10,padding:16}}><div style={{fontSize:16,fontWeight:700,color:"#9b7ec8"}}>✨ Victoire !</div></div>}
          {dun.ph==="explore"&&<div style={{textAlign:"center",position:"relative",zIndex:1,background:"var(--bg2)",borderRadius:10,padding:16}}><div style={{fontSize:15,color:"var(--td)"}}>Prêt à explorer...</div></div>}
          {dun.ph==="done"&&<div style={{textAlign:"center",position:"relative",zIndex:1,background:"var(--bg2)",borderRadius:10,padding:16}}>
            <div style={{fontSize:18,fontWeight:700,color:"#4ade80",marginBottom:10}}>Donjon terminé !</div>
            {dun.isFirst&&dun.fb&&<div style={{padding:10,background:"#fbbf2410",borderRadius:8,border:"1px solid #fbbf2430",marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fbbf24",marginBottom:6}}>Bonus de première victoire !</div>
              <div style={{fontSize:12,color:"#fbbf24",display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
                {dun.fb.gold&&<span>💰 {dun.fb.gold.toLocaleString()} or</span>}
                {dun.fb.xp&&<span>⭐ {dun.fb.xp.toLocaleString()} XP</span>}
                {dun.fb.scrolls&&<span>📜 {dun.fb.scrolls} parchemins</span>}
                {dun.fb.equip&&<span>🎁 {dun.fb.equip} équipement{dun.fb.equip>1?"s":""}</span>}
                {dun.fb.tomes&&Object.keys(dun.fb.tomes).map(function(tk){var tm3=TOMES.find(function(t){return t.id===tk;});return <span key={tk}>📖 {dun.fb.tomes[tk]}× {tm3?tm3.name:tk}</span>;})}
              </div>
            </div>}
            <div style={{fontSize:13,color:"var(--t)",padding:10,background:"#ffffff06",borderRadius:8,textAlign:"left"}}>
              <div style={{fontWeight:700,marginBottom:6,textAlign:"center",fontSize:14}}>Récompenses totales</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <div>💰 {dun.rG.toLocaleString()} pièces d'or</div>
                <div>⭐ {dun.rX.toLocaleString()} points d'expérience</div>
                <div>🎁 {dun.rE.length} pièce{dun.rE.length>1?"s":""} d'équipement</div>
                {dun.isFirst&&dun.fb&&dun.fb.scrolls&&<div>📜 {dun.fb.scrolls} parchemin{dun.fb.scrolls>1?"s":""} d'invocation</div>}
                {dun.isFirst&&dun.fb&&dun.fb.tomes&&Object.keys(dun.fb.tomes).map(function(tk){var tm4=TOMES.find(function(t){return t.id===tk;});return <div key={tk}>📖 {dun.fb.tomes[tk]}× {tm4?tm4.name:tk}</div>;})}
              </div>
            </div>
            <button className="b bg" onClick={function(){endDun(true);setAu(false);}} style={{marginTop:12,width:"100%"}}>Réclamer les récompenses</button>
          </div>}
        </div>
        {dun.ph==="combat"&&<div style={{display:"flex",gap:4,marginBottom:6}}>
          {(function(){var cur=dun.tO[dun.tI%dun.tO.length];var ch=dun.team.find(function(h){return h.uid===cur&&h.hp>0&&h.isHero;});var sk=ch?SKILLS[ch.id]:null;var ready=sk&&ch&&ch.cd<=0;
            if(au)return <button className="b" disabled style={{flex:1,fontSize:14,opacity:0.3}}>⚔️ Attaque (auto)</button>;
            if(ready)return <button className="b" onClick={doTurn} style={{flex:1,fontSize:15,fontWeight:900,background:"linear-gradient(135deg,#9b7ec8,#6b4e98)",color:"#fff",border:"2px solid #fbbf24",animation:"gw 1.5s infinite",textShadow:"0 0 8px #fbbf2480"}}>⚡ {sk.name}</button>;
            return <button className="b bg" onClick={doTurn} style={{flex:1,fontSize:14}}>⚔️ Attaque</button>;
          })()}
          <button className={"b "+(au?"br":"")} onClick={function(){setAu(!au);}} style={{flex:1,fontSize:14}}>{au?"⏸ Stop":"►️ Auto"}</button>
        </div>}
        {(dun.ph==="victory"||dun.ph==="event"||dun.ph==="explore")&&<button className="b" disabled={au} onClick={nxtFl} style={{width:"100%",marginBottom:6,fontSize:14,opacity:au?0.3:1}}>➡️ {dun.ph==="explore"?"Commencer":"Continuer"}</button>}
        <div ref={lr} style={{background:"#050510",borderRadius:10,padding:8,maxHeight:"min(200px, calc(100vh - 580px))",overflowY:"auto",fontFamily:"monospace",fontSize:12,lineHeight:1.6,border:"1px solid var(--brd)",position:"relative"}}>
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
            return <div key={i} style={{color:col,position:"relative",cursor:l.st?"pointer":"default",padding:"1px 0"}}
              onClick={function(){if(l.st)setHl(hl===i?null:i);}}>
              {txt}
            </div>;
          })}
        </div>
        {hl!=null&&logs[hl]&&logs[hl].st&&<div onClick={function(){setHl(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:380,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
            <div style={{fontWeight:700,color:"#9b7ec8",marginBottom:8,fontSize:14,fontFamily:"Uncial Antiqua"}}>Détail du calcul</div>
            <div style={{fontSize:13,fontFamily:"monospace",color:"#ccc",lineHeight:2}}>
              {logs[hl].st.res==="miss"&&<div>Précision {Math.round((logs[hl].st.prec||.95)*100)}% \u2192 Raté !</div>}
              {logs[hl].st.res==="dodged"&&<div>Esquive {Math.round((logs[hl].st.dg||0)*100)}% \u2192 Esquivé !</div>}
              {logs[hl].st.res==="hit"&&<div>
                <div>Dégâts de base : {logs[hl].st.bd} ({logs[hl].st.wt==="magical"?"magique":"physique"})</div>
                {logs[hl].st.strB!=null&&Math.abs(logs[hl].st.strB)>0.005&&<div>Force attaquant : {fmtPM(logs[hl].st.strB+1)}</div>}
                {logs[hl].st.magB!=null&&Math.abs(logs[hl].st.magB)>0.005&&<div>Magie attaquant : {fmtPM(logs[hl].st.magB+1)}</div>}
                {logs[hl].st.phvB!=null&&Math.abs(logs[hl].st.phvB)>0.005&&<div>Vuln. Physique cible : {fmtPM(logs[hl].st.phvB+1)}</div>}
                {logs[hl].st.mavB!=null&&Math.abs(logs[hl].st.mavB)>0.005&&<div>Vuln. Magique cible : {fmtPM(logs[hl].st.mavB+1)}</div>}
                <div>Multiplicateur : {fmtPM(logs[hl].st.mult)}</div>
                {logs[hl].st.v!=null&&<div>Variance : {Math.round(logs[hl].st.v*100)}%</div>}
                {logs[hl].st.cr&&<div style={{color:"#fbbf24"}}>Critique : \u00d73</div>}
                {logs[hl].st.eRes!=null&&logs[hl].st.eRes!==1&&<div>Vuln. élém. ({logs[hl].st.el}) : {fmtEV(logs[hl].st.eRes)}</div>}
                <div style={{fontWeight:700,marginTop:4,color:"var(--t)"}}>= {logs[hl].st.dmg} dégâts</div>
              </div>}
            </div>
            <button className="b" onClick={function(){setHl(null);}} style={{marginTop:10,width:"100%",fontSize:13}}>Fermer</button>
          </div>
        </div>}
      </div>}
    </div>}

        {tab==="invocation"&&<div style={{animation:"fi .3s ease"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontFamily:"Uncial Antiqua",fontSize:18,color:"var(--acc)"}}>Invocation</h2>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--td)"}}>📜 {sc}</span>
            <button className="b" onClick={function(){setInfoPopup("invoc_rates");}} style={{fontSize:10,padding:"2px 8px"}}>INFO</button>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button className="b bg" disabled={sc<1||ga} onClick={function(){doInvoc(1);}} style={{flex:1,padding:"22px 0",fontSize:18,fontWeight:700,borderRadius:14}}>Invoquer ×1</button>
          <button className="b bg" disabled={sc<10||ga} onClick={function(){doInvoc(10);}} style={{flex:1,padding:"22px 0",fontSize:18,fontWeight:700,borderRadius:14}}>Invoquer ×10</button>
        </div>

        <div style={{height:ga?100:20,display:"flex",alignItems:"center",justifyContent:"center",transition:"height 0.5s"}}>
          {ga&&<div style={{fontSize:14,color:"var(--acc)",animation:"pulse 1s ease-in-out infinite",fontFamily:"Uncial Antiqua"}}>Invocation en cours...</div>}
        </div>

        <div style={{background:"var(--card)",borderRadius:12,padding:12,border:"1px solid var(--brd)"}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--t)",marginBottom:8}}>Garanties</div>
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--td)",marginBottom:4}}><span style={{color:(RA[2]||{}).c,fontWeight:600}}>Héros ★★ garanti dans {10-(g.pity10||0)} invocations</span><span>{(g.pity10||0)}/10</span></div>
            <div style={{height:10,background:"#0a0a18",borderRadius:6,overflow:"hidden"}}>
              <div style={{width:((g.pity10||0)/10*100)+"%",height:"100%",background:(RA[2]||{}).c,transition:"width .3s",borderRadius:6}}/>
            </div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--td)",marginBottom:4}}><span style={{color:(RA[3]||{}).c,fontWeight:600}}>Héros ★★★ garanti dans {50-(g.pity50||0)} invocations</span><span>{(g.pity50||0)}/50</span></div>
            <div style={{height:10,background:"#0a0a18",borderRadius:6,overflow:"hidden"}}>
              <div style={{width:((g.pity50||0)/50*100)+"%",height:"100%",background:(RA[3]||{}).c,transition:"width .3s",borderRadius:6}}/>
            </div>
          </div>
        </div>

      {gr&&!ga&&(function(){
        var results=Array.isArray(gr)?gr:[gr];
        var idx=Array.isArray(gr)?grIdx:0;
        var r=results[idx];if(!r)return null;
        var hrc=(RA[r.h.rarity]||{}).c||"#888";
        var ht3=HEROES.find(function(h){return h.id===r.h.id;});
        var intensity=r.h.rarity<=1?0.15:r.h.rarity===2?0.25:r.h.rarity===3?0.4:r.h.rarity===4?0.6:0.9;
        var glowSize=r.h.rarity<=1?"40%":r.h.rarity===2?"50%":r.h.rarity===3?"60%":r.h.rarity===4?"70%":"90%";
        return <div onClick={function(){if(!Array.isArray(gr))setGr(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={function(e){e.stopPropagation();}} style={{maxWidth:380,width:"100%",background:"var(--card)",borderRadius:16,padding:20,position:"relative",overflow:"hidden",border:"1px solid "+hrc+"60"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(135deg,"+hrc+"80,"+hrc+"10,"+hrc+"60,"+hrc+"05,"+hrc+"40)",backgroundSize:"400% 400%",animation:"veilShift "+(12-r.h.rarity*2)+"s ease infinite",opacity:0.08+r.h.rarity*0.08,pointerEvents:"none",borderRadius:16}}/>
            {r.h.rarity>=3&&<div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(135deg,"+hrc+"90,transparent,"+hrc+"60,transparent,"+hrc+"40)",backgroundSize:"300% 300%",animation:"veilFast "+(5-r.h.rarity*0.5)+"s linear infinite",opacity:0.05+r.h.rarity*0.05,pointerEvents:"none",borderRadius:16}}/>}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 30%,"+hrc+Math.round(intensity*99).toString(16).padStart(2,"0")+",transparent "+glowSize+")",pointerEvents:"none"}}/>
            {r.h.rarity>=3&&<div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 30%,"+hrc+"20,transparent 60%)",animation:"pulse 1.5s ease-in-out infinite",pointerEvents:"none"}}/>}

            <div style={{textAlign:"center",position:"relative",zIndex:1}}>
              {Array.isArray(gr)&&<div style={{fontSize:11,color:"var(--td)",marginBottom:8}}>{idx+1} / {results.length}</div>}
              <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Portrait id={r.h.id} size={80} fs={40} icon={r.h.icon}/></div>
              <div style={{fontSize:22,fontWeight:800,fontFamily:"Uncial Antiqua",color:hrc}}>{r.h.name}</div>
              <div style={{fontSize:14,color:hrc,fontWeight:700,marginTop:4}}>{(RA[r.h.rarity]||{}).s} {(RA[r.h.rarity]||{}).n}</div>
              {ht3&&<div style={{fontSize:12,color:"var(--td)",marginTop:4,fontStyle:"italic"}}>{ht3.title}</div>}
              {r.dup&&<div style={{padding:10,background:"#d4a01710",borderRadius:10,border:"1px solid #d4a01730",fontSize:12,marginTop:12,textAlign:"left"}}>
                <div style={{fontWeight:700,color:"#d4a017",marginBottom:4}}>Héros déjà obtenu</div>
                {r.frag&&<div>🧩 <span style={{color:(RA[r.h.rarity]||{}).c}}>{r.frag.name}</span></div>}
                {r.tome&&<div>📖 <span style={{color:(RA[r.tome.rarity]||{}).c}}>{r.tome.name}</span></div>}
              </div>}
              {!r.dup&&<div style={{padding:10,background:"#4ade8010",borderRadius:10,border:"1px solid #4ade8030",fontSize:12,marginTop:12,textAlign:"center"}}><div style={{fontWeight:700,color:"#4ade80"}}>Nouveau héros !</div></div>}
            </div>
            <div style={{marginTop:16,position:"relative",zIndex:1}}>
              {Array.isArray(gr)?<div style={{display:"flex",gap:8}}>
                {idx>0&&<button className="b" onClick={function(){setGrIdx(function(p){return p-1;});}} style={{flex:1,padding:"10px 0",fontSize:13}}>Précédent</button>}
                {idx<results.length-1?<button className="b bg" onClick={function(){setGrIdx(function(p){return p+1;});}} style={{flex:1,padding:"10px 0",fontSize:13}}>Suivant</button>
                :<button className="b" onClick={function(){setGr(null);setGrIdx(0);}} style={{flex:1,padding:"10px 0",fontSize:13}}>Fermer</button>}
              </div>
              :<button className="b" onClick={function(){setGr(null);}} style={{width:"100%",padding:"10px 0",fontSize:13}}>Fermer</button>}
            </div>
          </div>
        </div>;
      })()}

      {infoPopup==="invoc_rates"&&<div onClick={function(){setInfoPopup(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"var(--card)",borderRadius:14,padding:20,maxWidth:380,width:"100%",border:"1px solid var(--brd)",animation:"fi .2s ease"}}>
          <h3 style={{fontFamily:"Uncial Antiqua",color:"var(--acc)",fontSize:16,marginBottom:12}}>Taux d'invocation</h3>
          {[1,2,3,4,5].map(function(r){return <div key={r} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:"1px solid #ffffff08"}}>
            <span style={{color:(RA[r]||{}).c,fontWeight:600}}>{(RA[r]||{}).s} {(RA[r]||{}).n}</span>
            <span style={{color:"var(--td)"}}>{((RA[r]||{}).r*100).toFixed(1)}%</span>
          </div>;})}
          <div style={{fontSize:11,color:"var(--td)",marginTop:10,lineHeight:1.6}}>
            <div>★★ garanti toutes les 10 invocations</div>
            <div>★★★ garanti toutes les 50 invocations</div>
          </div>
          <button className="b" onClick={function(){setInfoPopup(null);}} style={{width:"100%",marginTop:12,padding:"10px 0",fontSize:13}}>Fermer</button>
        </div>
      </div>}
    </div>}
    {!inD&&<div style={{position:"fixed",bottom:0,left:0,right:0,background:"var(--bg)",borderTop:"1px solid var(--brd)",display:"flex",zIndex:90,padding:"10px 0 env(safe-area-inset-bottom, 10px) 0"}}>
      {Object.keys(TM).map(function(k){return <button key={k} onClick={function(){setTab(k);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"6px 0",color:tab===k?"var(--acc)":"var(--td)",fontFamily:"inherit",fontSize:10,fontWeight:tab===k?700:400}}>
        <span style={{fontSize:18}}>{TM[k].i}</span><span>{TM[k].l}</span>
      </button>;})}
    </div>}

  </div>);
}
