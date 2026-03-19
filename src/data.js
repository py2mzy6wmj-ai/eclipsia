// ═══════════════════════════════════════════════════════════════
//  ECLIPSIA — data.js — Base de données du jeu
//  Modifier ce fichier pour ajouter/éditer du contenu.
// ═══════════════════════════════════════════════════════════════

// ↓↓↓ OR DE DÉPART — modifier cette valeur ↓↓↓
export var STARTING_GOLD = 1500;

export var EL=["Feu","Terre","Foudre","Eau","Sacré","Ténèbres"];
export var EM={Feu:{i:"🔥",c:"#ef4444"},Terre:{i:"🪨",c:"#a3a042"},Foudre:{i:"⚡",c:"#facc15"},Eau:{i:"💧",c:"#60a5fa"},Sacré:{i:"☀️",c:"#fde68a"},Ténèbres:{i:"🌑",c:"#a78bfa"}};
export var defER=function(){return{Feu:1,Terre:1,Foudre:1,Eau:1,Sacré:1,Ténèbres:1};};
export var RA={1:{n:"Commun",s:"★",c:"#8899aa",r:.75},2:{n:"Rare",s:"★★",c:"#5dade2",r:.20},3:{n:"Épique",s:"★★★",c:"#a855f7",r:.03},4:{n:"Légendaire",s:"★★★★",c:"#f59e0b",r:.015},5:{n:"Mythique",s:"★★★★★",c:"#ef4444",r:.005}};

/* ↓↓↓ PORTRAIT URL BASE — change when Supabase is ready ↓↓↓
   Set to your Supabase public bucket URL, e.g.:
   var PORTRAIT_BASE = "https://xyz.supabase.co/storage/v1/object/public/portraits/";
   Then name files: syrio.png, kael.png, etc.
   Set to "" to use embedded fallback (SYRIO_IMG) or black placeholder */
export var PORTRAIT_BASE = "https://bigxhzfotfwfdwdpecyj.supabase.co/storage/v1/object/public/portraits/";

export var HEROES=[
  {id:"syrio",name:"Syrio",title:"Vétéran Déserteur",rarity:2,icon:"⚔️",color:"#c0392b",sw:"w01",lore:"Après des années au service d'un roi tyran, sa lame sert désormais des causes plus justes.",lv1:{hp:75,mp:12,str:1.06,mag:.24,crit:.03,phv:.95,mav:1.12,dodge:.04},lv100:{hp:4500,mp:180,str:1.87,mag:.65,crit:.05,phv:.76,mav:1.01,dodge:.04},er:{Feu:.9,Terre:.9,Foudre:.9,Eau:.9,Sacré:1.1,Ténèbres:1.1}},
  {id:"kael",name:"Kael",title:"Lame Brisée",rarity:1,icon:"🗡️",color:"#e74c3c",sw:"w01",lore:"Ancien mercenaire. Sa lame brisée est tout ce qui lui reste.",lv1:{hp:90,mp:10,str:1.08,mag:.3,crit:.05,phv:.93,mav:1.08,dodge:.03},lv100:{hp:5200,mp:120,str:1.95,mag:.6,crit:.08,phv:.72,mav:.98,dodge:.03},er:defER()},
  {id:"lyra",name:"Lyra",title:"Voix d'Argent",rarity:1,icon:"🏹",color:"#3498db",sw:"w05",lore:"Chasseuse des steppes.",lv1:{hp:60,mp:18,str:1.04,mag:.4,crit:.12,phv:.97,mav:1.05,dodge:.08},lv100:{hp:3200,mp:250,str:1.7,mag:.8,crit:.18,phv:.8,mav:.95,dodge:.08},er:{Feu:1,Terre:1,Foudre:1,Eau:.8,Sacré:1,Ténèbres:1}},
  {id:"mira",name:"Mira",title:"Flamme Errante",rarity:2,icon:"🔥",color:"#e67e22",sw:"w03",lore:"Le feu est sa seule amie.",lv1:{hp:50,mp:35,str:.3,mag:1.12,crit:.02,phv:1.02,mav:.92,dodge:.03},lv100:{hp:2800,mp:500,str:.55,mag:2.1,crit:.04,phv:.88,mav:.7,dodge:.03},er:{Feu:0,Terre:1,Foudre:1,Eau:1.15,Sacré:1,Ténèbres:1}},
  {id:"ragnar",name:"Ragnar",title:"Poing Tonnerre",rarity:3,icon:"⚡",color:"#e84393",sw:"w04",lore:"Il canalise la tempête.",lv1:{hp:95,mp:15,str:1.15,mag:.35,crit:.1,phv:.94,mav:1.06,dodge:.03},lv100:{hp:5800,mp:200,str:2.2,mag:.7,crit:.16,phv:.7,mav:.95,dodge:.03},er:{Feu:1,Terre:1.1,Foudre:0,Eau:.9,Sacré:1,Ténèbres:1}},
  {id:"aria",name:"Aria",title:"Impératrice Céleste",rarity:5,icon:"👑",color:"#ffeaa7",sw:"w06",lore:"Dernière héritière d'un empire déchu.",lv1:{hp:80,mp:35,str:1.08,mag:1.15,crit:.08,phv:.92,mav:.9,dodge:.05},lv100:{hp:5000,mp:500,str:2,mag:2.2,crit:.14,phv:.68,mav:.65,dodge:.05},er:{Feu:.9,Terre:.9,Foudre:.9,Eau:.9,Sacré:0,Ténèbres:1.15}},
  {id:"nihil",name:"Nihil",title:"Le Néant",rarity:5,icon:"💀",color:"#dfe6e9",sw:"w10",lore:"Le Néant incarné — absolu.",lv1:{hp:55,mp:25,str:1.2,mag:1.1,crit:.15,phv:1,mav:1,dodge:.12},lv100:{hp:3000,mp:350,str:2.4,mag:2,crit:.25,phv:.82,mav:.85,dodge:.12},er:{Feu:1,Terre:1,Foudre:1,Eau:1,Sacré:1.25,Ténèbres:0}},
];

export var AR=[
  {id:"a01",name:"Cotte de Mailles",slot:"armor",rarity:1,bon:{hp:20,phv:-.02},desc:"PV +20, PHV -2%"},
  {id:"a02",name:"Robe de Tissu",slot:"armor",rarity:1,bon:{mp:12,mav:-.02},desc:"PM +12, MAV -2%"},
  {id:"a03",name:"Plastron Runique",slot:"armor",rarity:2,bon:{hp:45,phv:-.03},desc:"PV +45, PHV -3%"},
  {id:"a04",name:"Tunique du Sage",slot:"armor",rarity:2,bon:{mp:25,mav:-.03},desc:"PM +25, MAV -3%"},
  {id:"a05",name:"Armure Dragon",slot:"armor",rarity:3,bon:{hp:80,phv:-.05,dodge:.01},desc:"Armure lourde"},
  {id:"a06",name:"Égide Céleste",slot:"armor",rarity:4,bon:{hp:120,phv:-.07},desc:"Légendaire"},
];
export var AC=[
  {id:"x01",name:"Anneau Vigueur",slot:"accessory",rarity:1,bon:{rgHp:.02},desc:"RPV +2%/tour"},
  {id:"x02",name:"Pendentif Arcane",slot:"accessory",rarity:1,bon:{rgMp:.03},desc:"RPM +3%/tour"},
  {id:"x03",name:"Collier Mana",slot:"accessory",rarity:2,bon:{rgMp:.04,eco:.04},desc:"RPM & EPM +4%"},
  {id:"x04",name:"Broche Sang",slot:"accessory",rarity:2,bon:{rgHp:.03,rgMp:.02},desc:"RPV +3%, RPM +2%"},
  {id:"x05",name:"Amulette Vitale",slot:"accessory",rarity:3,bon:{rgHp:.04,rgMp:.03,eco:.05},desc:"Reg & Éco"},
  {id:"x06",name:"Couronne Éternité",slot:"accessory",rarity:4,bon:{rgHp:.05,rgMp:.05,eco:.08},desc:"Légendaire"},
];
export var TL=[
  {id:"t01",name:"Charme Anti-Feu",slot:"talisman",rarity:1,bon:{er:{Feu:-.1}},desc:"Vuln Feu -10%"},
  {id:"t02",name:"Charme Anti-Foudre",slot:"talisman",rarity:1,bon:{er:{Foudre:-.1}},desc:"Vuln Foudre -10%"},
  {id:"t03",name:"Sceau Élémentaire",slot:"talisman",rarity:2,bon:{er:{Feu:-.08,Eau:-.08,Terre:-.08}},desc:"Vuln Feu/Eau/Terre -8%"},
  {id:"t04",name:"Amulette Sacrée",slot:"talisman",rarity:3,bon:{er:{Sacré:-.15,Ténèbres:-.15}},desc:"Vuln Sacré/Ténèbres -15%"},
  {id:"t05",name:"Orbe Harmonie",slot:"talisman",rarity:4,bon:{er:{Feu:-.1,Terre:-.1,Foudre:-.1,Eau:-.1,Sacré:-.1,Ténèbres:-.1}},desc:"Vuln toutes -10%"},
];
export var ALL_EQ=[].concat(WP,AR,AC,TL);

// ═══════════════════════════════════════════════════════════════
//  GÉNÉRATION ALÉATOIRE D'ARMES
// ═══════════════════════════════════════════════════════════════
// Rang 1-15, interpolation linéaire entre rang 1 et 15.
// Rareté applique un bonus % sur les stats de base.
// Traits: 1 pour Normal/Rare/Épique, 2 pour Légendaire/Mythique.
// Élément: possible à partir d'Épique (10% par élément, 40% neutre).

var WP_NAMES = ["Épée", "Poignard", "Arc", "Hallebarde", "Hache", "Arbalète"];
var WP_NAMES_MYTHIC = ["Faiseur-de-veuves", "Ultima", "Deuillegivre"];
var EL_SUFFIXES = { Feu: "de Feu", Terre: "de Terre", Foudre: "de Foudre", Eau: "d'Eau", Sacré: "Sacré(e)", Ténèbres: "des Ténèbres" };

// Bonus de rareté: multiplicateur sur les stats de base
var RARITY_BONUS = { 1: 1.0, 2: 1.10, 3: 1.25, 4: 2.0, 5: 3.0 };
// Nombre de traits par rareté
var RARITY_TRAITS = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2 };

// Valeurs de base par rang (interpolation linéaire rang 1 → rang 15)
// dmgMin, dmgMax, strMin, strMax, magMin, magMax, crtFixed
var RANK_BASE = {
  dmgMin:  { r1: 15,   r15: 2250 },
  dmgMax:  { r1: 30,   r15: 3000 },
  strMin:  { r1: 0.01, r15: 0.15 },
  strMax:  { r1: 0.02, r15: 0.20 },
  magMin:  { r1: 0.01, r15: 0.15 },
  magMax:  { r1: 0.02, r15: 0.20 },
  crtMin:  { r1: 0.01, r15: 0.10 },
  crtMax:  { r1: 0.01, r15: 0.10 },
};

function lerpRank(stat, rank) {
  var b = RANK_BASE[stat];
  // Courbe exponentielle: progression douce en bas, forte en haut
  var t = (rank - 1) / 14;
  var curve = t * t; // quadratique: rang 2 = (1/14)² ≈ 0.5% au lieu de 7%
  return b.r1 + (b.r15 - b.r1) * curve;
}

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Génère une arme aléatoire
// rank: 1-15, rarity: 1-5
export function generateWeapon(rank, rarity) {
  var rarMult = RARITY_BONUS[rarity] || 1;
  var numTraits = RARITY_TRAITS[rarity] || 1;

  // Type PHY ou MAG (50/50)
  var wt = Math.random() < 0.5 ? "physical" : "magical";

  // Dégâts de base
  var dmgBase = Math.round(randBetween(lerpRank("dmgMin", rank), lerpRank("dmgMax", rank)));
  var dmg = Math.round(dmgBase * rarMult);

  // Traits aléatoires (piocher parmi STR, MAG, CRT sans doublon)
  var traitPool = ["str", "mag", "crt"];
  var traits = {};
  for (var i = 0; i < numTraits && traitPool.length > 0; i++) {
    var idx = Math.floor(Math.random() * traitPool.length);
    var trait = traitPool.splice(idx, 1)[0];
    var val;
    if (trait === "str") {
      val = randBetween(lerpRank("strMin", rank), lerpRank("strMax", rank));
    } else if (trait === "mag") {
      val = randBetween(lerpRank("magMin", rank), lerpRank("magMax", rank));
    } else {
      val = randBetween(lerpRank("crtMin", rank), lerpRank("crtMax", rank));
    }
    traits[trait] = Math.round(val * rarMult * 100) / 100;
  }

  // Élément (Épique+ seulement : 10% par élément, 40% neutre)
  var el = "Neutre";
  if (rarity >= 3) {
    var roll = Math.random();
    if (roll < 0.60) {
      var elIdx = Math.floor(Math.random() * EL.length);
      el = EL[elIdx];
    }
  }

  // Nom
  var name;
  if (rarity === 5) {
    name = WP_NAMES_MYTHIC[Math.floor(Math.random() * WP_NAMES_MYTHIC.length)];
  } else {
    name = WP_NAMES[Math.floor(Math.random() * WP_NAMES.length)];
  }
  if (wt === "magical") name = name + " magique";
  if (el !== "Neutre") {
    name = name + " " + (EL_SUFFIXES[el] || el);
  }

  // Construire la description
  var descParts = [];
  if (traits.str) descParts.push("STR +" + Math.round(traits.str * 100) + "%");
  if (traits.mag) descParts.push("MAG +" + Math.round(traits.mag * 100) + "%");
  if (traits.crt) descParts.push("CRT +" + Math.round(traits.crt * 100) + "%");
  if (el !== "Neutre") descParts.push((EM[el] || {}).i + " " + el);

  return {
    id: "wg_" + Math.random().toString(36).slice(2, 8),
    name: name,
    slot: "weapon",
    wt: wt,
    rarity: rarity,
    rank: rank,
    dmg: dmg,
    el: el,
    bon: traits,
    desc: descParts.join(", ") || "Arme ordinaire",
    generated: true,
  };
}

// ═══════════════════════════════════════════════════════════════
//  TABLES DE DROP PAR DONJON
// ═══════════════════════════════════════════════════════════════
// ranks: rangs possibles [min, max]
// rarityWeights: { 1: 0.80, 2: 0.20 } = 80% normal, 20% rare
// dropRate: chance de drop d'arme par combat gagné

export var DG=[
  { name: "Crypte Oubliée",    fl: 5,  m: 1,   rw: 1,   ul: 0,
    loot: { ranks: [1, 2],  rarW: { 1: 0.80, 2: 0.20 }, dropRate: 0.20 } },
  { name: "Forêt Corrompue",   fl: 8,  m: 1.4, rw: 1.6, ul: 5,
    loot: { ranks: [2, 4],  rarW: { 1: 0.60, 2: 0.30, 3: 0.10 }, dropRate: 0.20 } },
  { name: "Abîme de Feu",      fl: 10, m: 2,   rw: 2.5, ul: 15,
    loot: { ranks: [4, 7],  rarW: { 1: 0.40, 2: 0.35, 3: 0.20, 4: 0.05 }, dropRate: 0.25 } },
  { name: "Citadelle Céleste",  fl: 12, m: 3,   rw: 4,   ul: 30,
    loot: { ranks: [7, 11], rarW: { 2: 0.40, 3: 0.35, 4: 0.20, 5: 0.05 }, dropRate: 0.25 } },
  { name: "Le Néant Éternel",   fl: 15, m: 4.5, rw: 6,   ul: 50,
    loot: { ranks: [10, 15], rarW: { 2: 0.30, 3: 0.35, 4: 0.25, 5: 0.10 }, dropRate: 0.30 } },
];

// Génère un drop d'arme pour un donjon donné (index)
export function rollWeaponDrop(dungeonIdx) {
  var d = DG[dungeonIdx];
  if (!d || !d.loot) return null;
  if (Math.random() > d.loot.dropRate) return null;

  // Tirer le rang
  var rank = d.loot.ranks[0] + Math.floor(Math.random() * (d.loot.ranks[1] - d.loot.ranks[0] + 1));

  // Tirer la rareté selon les poids
  var rw = d.loot.rarW;
  var roll = Math.random();
  var cum = 0;
  var rarity = 1;
  for (var r in rw) {
    cum += rw[r];
    if (roll < cum) { rarity = parseInt(r); break; }
  }

  return generateWeapon(rank, rarity);
}

// ═══════════════════════════════════════════════════════════════
//  ENNEMIS & BOSS
// ═══════════════════════════════════════════════════════════════

export var ENM=[
  {id:"e01",name:"Squelette",icon:"💀",hp:50,dmg:10,at:"physical",str:1,mag:.9,crit:.04,phv:.96,dodge:.02,mav:.98,xp:5,gold:4,er:{Feu:1.15,Terre:1,Foudre:1,Eau:1,Sacré:1.2,Ténèbres:.8}},
  {id:"e02",name:"Gobelin",icon:"👺",hp:35,dmg:8,at:"physical",str:1.03,mag:.9,crit:.08,phv:.97,dodge:.08,mav:.98,xp:4,gold:6,er:{Feu:1.1,Terre:.9,Foudre:1,Eau:1,Sacré:1,Ténèbres:1}},
  {id:"e03",name:"Slime",icon:"🟢",hp:65,dmg:6,at:"physical",str:.95,mag:.9,crit:.01,phv:.92,dodge:.01,mav:.95,xp:3,gold:3,er:{Feu:1.15,Terre:1,Foudre:1.1,Eau:.8,Sacré:1,Ténèbres:1}},
  {id:"e04",name:"Loup",icon:"🐺",hp:42,dmg:12,at:"physical",str:1.06,mag:.9,crit:.1,phv:.95,dodge:.1,mav:.98,xp:6,gold:5,er:{Feu:1.1,Terre:1,Foudre:1,Eau:1,Sacré:1,Ténèbres:.9}},
  {id:"e05",name:"Golem",icon:"🗿",hp:110,dmg:14,at:"physical",str:1.04,mag:.85,crit:.02,phv:.84,dodge:0,mav:.94,xp:10,gold:8,er:{Feu:.9,Terre:0,Foudre:.9,Eau:1.1,Sacré:1,Ténèbres:1}},
  {id:"e06",name:"Spectre",icon:"👻",hp:38,dmg:14,at:"magical",str:.9,mag:1.08,crit:0,phv:.98,dodge:.12,mav:.92,xp:8,gold:7,er:{Feu:1,Terre:1,Foudre:1,Eau:1,Sacré:1.25,Ténèbres:0}},
  {id:"e07",name:"Démon",icon:"😈",hp:75,dmg:18,at:"physical",str:1.1,mag:1.03,crit:.08,phv:.93,dodge:.06,mav:.93,xp:12,gold:10,er:{Feu:.8,Terre:1,Foudre:1,Eau:1.1,Sacré:1.2,Ténèbres:.8}},
];
export var BSS=[
  {id:"b01",name:"Roi Liche",icon:"🧟",hp:320,dmg:24,at:"magical",str:1.08,mag:1.12,crit:.06,phv:.9,dodge:.04,mav:.87,xp:50,gold:40,boss:true,er:{Feu:1.1,Terre:1,Foudre:1,Eau:1,Sacré:1.3,Ténèbres:0}},
  {id:"b02",name:"Hydre",icon:"🐍",hp:450,dmg:20,at:"physical",str:1.12,mag:.95,crit:.05,phv:.86,dodge:.02,mav:.92,xp:60,gold:50,boss:true,er:{Feu:1.15,Terre:1,Foudre:1.1,Eau:.8,Sacré:1,Ténèbres:1}},
  {id:"b03",name:"Archidémon",icon:"👿",hp:380,dmg:28,at:"physical",str:1.18,mag:1.1,crit:.1,phv:.89,dodge:.06,mav:.89,xp:70,gold:60,boss:true,er:{Feu:.7,Terre:1,Foudre:1,Eau:1.15,Sacré:1.3,Ténèbres:0}},
  {id:"b04",name:"Titan",icon:"⛰️",hp:550,dmg:22,at:"physical",str:1.06,mag:.8,crit:.02,phv:.78,dodge:0,mav:.94,xp:80,gold:70,boss:true,er:{Feu:.9,Terre:0,Foudre:.9,Eau:1.1,Sacré:1,Ténèbres:1}},
];

export var EVT=[{t:"🏕️ Campement — repos.",tp:"heal"},{t:"⛲ Fontaine — PM restaurés.",tp:"mpFull"},{t:"⚠️ Piège !",tp:"trap"},{t:"🔮 Autel — Force accrue !",tp:"buff"},{t:"💰 Coffre !",tp:"gold"},{t:"📚 Grimoire — XP bonus !",tp:"xp"}];
export var BUP=[{id:"forge",name:"Forge",desc:"STR +0.3%/nv",mx:50,c0:100,cm:1.5,ic:"🔨"},{id:"rempart",name:"Rempart",desc:"PHV -0.3%/nv",mx:50,c0:100,cm:1.5,ic:"🏰"},{id:"autel",name:"Autel",desc:"PV max +2%/nv",mx:50,c0:120,cm:1.5,ic:"❤️"},{id:"tour",name:"Tour Arcane",desc:"MAG +0.3%/nv",mx:50,c0:120,cm:1.5,ic:"🗼"},{id:"ecole",name:"École",desc:"XP +3%/nv",mx:30,c0:200,cm:1.6,ic:"📖"},{id:"mine",name:"Mine",desc:"Or +3%/nv",mx:30,c0:250,cm:1.6,ic:"⛏️"},{id:"oracle",name:"Oracle",desc:"Invoc. +0.4%/nv",mx:20,c0:500,cm:1.8,ic:"🔮"},{id:"taverne",name:"Taverne",desc:"Invoc. -2%/nv",mx:25,c0:300,cm:1.7,ic:"🍺"}];

/* ─── ENGINE ─── */
