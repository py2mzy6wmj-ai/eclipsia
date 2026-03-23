// ═══════════════════════════════════════════════════════════════
//  ECLIPSIA — data.js — Base de données du jeu
// ═══════════════════════════════════════════════════════════════

// ↓↓↓ OR DE DÉPART ↓↓↓
export var STARTING_GOLD = 300;

export var EL = ["Feu", "Terre", "Foudre", "Eau", "Sacré", "Ténèbres"];
export var EM = { Feu: { i: "🔥", c: "#ef4444" }, Terre: { i: "🪨", c: "#a3a042" }, Foudre: { i: "⚡", c: "#facc15" }, Eau: { i: "💧", c: "#60a5fa" }, Sacré: { i: "☀️", c: "#fde68a" }, Ténèbres: { i: "🌑", c: "#a78bfa" } };
export var defER = function () { return { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 }; };
export var RA = { 1: { n: "Commun", s: "★", c: "#888888", r: 0.80 }, 2: { n: "Inhabituel", s: "★★", c: "#2ecc71", r: 0.17 }, 3: { n: "Rare", s: "★★★", c: "#2980f0", r: 0.02 }, 4: { n: "Épique", s: "★★★★", c: "#9b59b6", r: 0.009 }, 5: { n: "Légendaire", s: "★★★★★", c: "#e67e22", r: 0.001 } };

// ↓↓↓ URL DES PORTRAITS (dossier public/portraits/ du repo) ↓↓↓
export var PORTRAIT_BASE = "./portraits/";

// ═══════════════════════════════════════════════════════════════
//  COMPÉTENCES
// ═══════════════════════════════════════════════════════════════
// type: "pAtk" = attaque physique, "mAtk" = attaque magique, "heal", "buff", etc.
// mult: multiplicateur de dégâts de base
// cd: cooldown de base (en tours)
// Chaque compétence a un niveau (lvl), les effets peuvent scale avec le niveau plus tard.

export var SKILLS = {
  enzi:      { name: "Embuscade",          type: "pAtk", mult: 2.5, cd: 7, desc: "Attaque physique furtive ×2.5", lvl: 1 },
  kiara:     { name: "Lame du désert",     type: "pAtk", mult: 2.5, cd: 8, desc: "Attaque physique ×2.5", lvl: 1 },
  marken:    { name: "Charge héroïque",    type: "pAtk", mult: 3,   cd: 8, desc: "Attaque physique ×3", lvl: 1 },
  mira:      { name: "Éclair arcanique",   type: "mAtk", mult: 2.5, cd: 7, desc: "Attaque magique ×2.5", lvl: 1 },
  constello: { name: "Danse mortelle",     type: "pAtk", mult: 2.5, cd: 7, desc: "Attaque physique ×2.5", lvl: 1 },
  sahad:     { name: "Raz-de-marée",       type: "mAtk", mult: 3,   cd: 8, desc: "Attaque magique ×3", lvl: 1 },
  syrio:     { name: "Coup fulgurant",     type: "pAtk", mult: 3,   cd: 8, desc: "Coup puissant qui inflige 300% de dégâts de base", lvl: 1 },
  cerys:     { name: "Nova ténébreuse",    type: "mAtk", mult: 3,   cd: 7, desc: "Attaque magique ×3", lvl: 1 },
  keros:     { name: "Morsure primale",    type: "pAtk", mult: 2.5, cd: 8, desc: "Attaque physique ×2.5", lvl: 1 },
  orion:     { name: "Griffe dimensionnelle", type: "mAtk", mult: 3, cd: 7, desc: "Attaque magique ×3", lvl: 1 },
};

// ═══════════════════════════════════════════════════════════════
//  HÉROS
// ═══════════════════════════════════════════════════════════════
// wt: "physical"/"magical" — type d'arme de départ
// rel: recharge de base de la compétence (en tours). Peut être réduit par équipement.
// mp supprimé, remplacé par rel

export var HEROES = [
  { id: "enzi", name: "Enzi", title: "Aventurier solitaire", rarity: 1, icon: "🗡️", color: "#7f8c8d", wt: "physical",
    lore: "Discret comme une ombre et rapide comme un loup, la forêt est son terrain de jeu.",
    lv1: { hp: 31, rel: 7, str: 1.0, mag: 0.28, crit: 0.03, phv: 1.0, mav: 1.04, dodge: 0.05 },
    lv100: { hp: 2000, rel: 7, str: 1.19, mag: 0.4, crit: 0.06, phv: 0.91, mav: 0.97, dodge: 0.05 },
    er: { Feu: 1.1, Terre: 0.9, Foudre: 1.0, Eau: 0.95, Sacré: 1.0, Ténèbres: 1.0 } },
  { id: "kiara", name: "Kiara", title: "Nomade du désert", rarity: 1, icon: "⚔️", color: "#d4a017", wt: "physical",
    lore: "Des années de pérégrination dans le désert l'ont rendue insensible à la chaleur et à la soif.",
    lv1: { hp: 35, rel: 8, str: 1.01, mag: 0.27, crit: 0.03, phv: 0.99, mav: 1.01, dodge: 0.04 },
    lv100: { hp: 2100, rel: 8, str: 1.22, mag: 0.38, crit: 0.05, phv: 0.9, mav: 0.95, dodge: 0.04 },
    er: { Feu: 0.9, Terre: 0.9, Foudre: 1.0, Eau: 1.1, Sacré: 1.0, Ténèbres: 1.0 } },
  { id: "marken", name: "Marken", title: "Preux chevalier", rarity: 1, icon: "🛡️", color: "#2c3e50", wt: "physical",
    lore: "Valeureux chevalier et gendre idéal. Que demander de plus ?",
    lv1: { hp: 37, rel: 8, str: 1.02, mag: 0.25, crit: 0.02, phv: 0.98, mav: 1.08, dodge: 0.03 },
    lv100: { hp: 2250, rel: 8, str: 1.25, mag: 0.35, crit: 0.04, phv: 0.87, mav: 1.02, dodge: 0.03 },
    er: { Feu: 1.0, Terre: 1.0, Foudre: 1.0, Eau: 1.0, Sacré: 0.9, Ténèbres: 0.9 } },
  { id: "mira", name: "Mira", title: "Apprentie sorcière", rarity: 1, icon: "🔮", color: "#e67e22", wt: "magical",
    lore: "En première année de magie à l'académie de Havrequignon.",
    lv1: { hp: 24, rel: 7, str: 0.12, mag: 1.01, crit: 0.02, phv: 1.1, mav: 0.99, dodge: 0.04 },
    lv100: { hp: 1300, rel: 7, str: 0.19, mag: 1.22, crit: 0.05, phv: 1.02, mav: 0.92, dodge: 0.04 },
    er: { Feu: 0.98, Terre: 0.98, Foudre: 0.98, Eau: 0.98, Sacré: 1.0, Ténèbres: 1.05 } },
  { id: "constello", name: "Constello", title: "Saltimbanque survolté", rarity: 2, icon: "🎭", color: "#e84393", wt: "physical",
    lore: "Sa souplesse et son élégance n'ont d'égal que sa peur maladive de la magie.",
    lv1: { hp: 34, rel: 7, str: 1.063, mag: 0.2875, crit: 0.04, phv: 0.958, mav: 1.095, dodge: 0.04 },
    lv100: { hp: 2100, rel: 7, str: 1.315, mag: 0.392, crit: 0.06, phv: 0.8425, mav: 1.038, dodge: 0.04 },
    er: { Feu: 1.05, Terre: 1.05, Foudre: 1.05, Eau: 1.05, Sacré: 1.05, Ténèbres: 1.05 } },
  { id: "sahad", name: "Sahad", title: "Aquamage", rarity: 2, icon: "💧", color: "#3498db", wt: "magical",
    lore: "Sorcier adepte de la magie de l'eau. Disqualifié du concours régional d'apnée pour cause de triche.",
    lv1: { hp: 28, rel: 8, str: 0.2875, mag: 1.021, crit: 0.03, phv: 1.038, mav: 0.9685, dodge: 0.04 },
    lv100: { hp: 1522, rel: 8, str: 0.373, mag: 1.2625, crit: 0.05, phv: 0.9685, mav: 0.8845, dodge: 0.04 },
    er: { Feu: 0.85, Terre: 1.0, Foudre: 1.25, Eau: 0.85, Sacré: 1.0, Ténèbres: 1.0 } },
  { id: "syrio", name: "Syrio", title: "Défenseur inébranlable", rarity: 2, icon: "🏰", color: "#c0392b", wt: "physical",
    lore: "Haut gradé de la garde royale. A une armure de plaques en guise de pyjama.",
    lv1: { hp: 48, rel: 8, str: 1.0, mag: 0.164, crit: 0.02, phv: 0.9055, mav: 0.9895, dodge: 0.03 },
    lv100: { hp: 3045, rel: 8, str: 1.168, mag: 0.202, crit: 0.04, phv: 0.811, mav: 0.9055, dodge: 0.03 },
    er: { Feu: 0.95, Terre: 0.95, Foudre: 0.95, Eau: 0.95, Sacré: 1.0, Ténèbres: 1.0 } },
  { id: "cerys", name: "Cerys", title: "Sombre inquisitrice", rarity: 3, icon: "🌑", color: "#6c3483", wt: "magical",
    lore: "Utilise la magie des ténèbres pour parvenir à ses fins.",
    lv1: { hp: 26, rel: 7, str: 0.208, mag: 1.055, crit: 0.03, phv: 1.036, mav: 1.0, dodge: 0.04 },
    lv100: { hp: 1430, rel: 7, str: 0.262, mag: 1.385, crit: 0.05, phv: 0.967, mav: 0.912, dodge: 0.04 },
    er: { Feu: 1.0, Terre: 1.0, Foudre: 1.0, Eau: 1.0, Sacré: 1.15, Ténèbres: 0.5 } },
  { id: "keros", name: "Keros", title: "Saurien mystérieux", rarity: 3, icon: "🦎", color: "#27ae60", wt: "physical",
    lore: "Sa peau écaillée possède des capacités de régénération.",
    lv1: { hp: 35, rel: 8, str: 1.011, mag: 0.325, crit: 0.03, phv: 0.989, mav: 0.989, dodge: 0.04, rgHp: 0.01 },
    lv100: { hp: 2310, rel: 8, str: 1.242, mag: 0.424, crit: 0.04, phv: 0.901, mav: 0.901, dodge: 0.04, rgHp: 0.03 },
    er: { Feu: 1.0, Terre: 1.0, Foudre: 1.0, Eau: 1.0, Sacré: 1.0, Ténèbres: 1.0 } }, // rgHp: 1-3%
  { id: "orion", name: "Orion", title: "Félin malicieux", rarity: 4, icon: "🐱", color: "#f39c12", wt: "magical",
    lore: "C'est juste un chat…mais est-ce juste un chat ?",
    lv1: { hp: 26, rel: 7, str: 0.4475, mag: 1.046, crit: 0.04, phv: 1.102, mav: 0.9655, dodge: 0.06 },
    lv100: { hp: 1380, rel: 7, str: 0.507, mag: 1.345, crit: 0.05, phv: 1.034, mav: 0.8505, dodge: 0.06 },
    er: { Feu: 0.95, Terre: 0.95, Foudre: 0.95, Eau: 1.1, Sacré: 0.95, Ténèbres: 0.95 } },
];

// ═══════════════════════════════════════════════════════════════
//  GÉNÉRATION ALÉATOIRE D'ÉQUIPEMENT (armes, armures, accessoires, talismans)
// ═══════════════════════════════════════════════════════════════

var RARITY_BONUS = { 1: 1.0, 2: 1.50, 3: 2.10, 4: 3.0, 5: 5.0 };
function randBetween(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Quadratic interpolation rank 1→15
var RANK_LERP = {};
function addRL(key, r1, r15) { RANK_LERP[key] = { r1: r1, r15: r15 }; }
function lR(key, rank) { var b = RANK_LERP[key]; var t = (rank - 1) / 14; return b.r1 + (b.r15 - b.r1) * t * t; }

// ── WEAPON STATS ──
addRL("wDmgMin", 15, 2250); addRL("wDmgMax", 30, 3000);
addRL("wStrMin", 0.01, 0.15); addRL("wStrMax", 0.02, 0.20);
addRL("wMagMin", 0.01, 0.15); addRL("wMagMax", 0.02, 0.20);
addRL("wCrtMin", 0.01, 0.10); addRL("wCrtMax", 0.01, 0.10);

// ── ARMOR STATS ──
addRL("aPvMin", 10, 1500); addRL("aPvMax", 20, 2000);
addRL("aPvPctMin", 0.02, 0.20); addRL("aPvPctMax", 0.04, 0.35);
addRL("aVphMin", 0.01, 0.12); addRL("aVphMax", 0.03, 0.25);
addRL("aVmaMin", 0.01, 0.12); addRL("aVmaMax", 0.03, 0.25);
addRL("aEvaMin", 0.01, 0.10); addRL("aEvaMax", 0.01, 0.10);
addRL("aRecMin", 0.01, 0.06); addRL("aRecMax", 0.01, 0.06);

// ── ACCESSORY STATS ──
addRL("xPvPctMin", 0.01, 0.12); addRL("xPvPctMax", 0.03, 0.25);
addRL("xStrMin", 0.01, 0.10); addRL("xStrMax", 0.02, 0.13);
addRL("xMagMin", 0.01, 0.10); addRL("xMagMax", 0.02, 0.13);
addRL("xVphMin", 0.01, 0.10); addRL("xVphMax", 0.02, 0.13);
addRL("xVmaMin", 0.01, 0.10); addRL("xVmaMax", 0.02, 0.13);
addRL("xCrtMin", 0.01, 0.05); addRL("xCrtMax", 0.01, 0.05);
addRL("xEvaMin", 0.01, 0.05); addRL("xEvaMax", 0.01, 0.05);
addRL("xRecMin", 0.01, 0.03); addRL("xRecMax", 0.01, 0.03);

// ── TALISMAN STATS ──
addRL("tResMin", 0.01, 0.25); addRL("tResMax", 0.01, 0.25);

// ── NAMES ──
var WP_R1 = ["Épée","Hache","Sabre","Dague","Arc","Arbalète","Masse"];
var WP_R6 = ["Épée longue","Hache de guerre","Cimeterre","Coutelas","Arc long","Arbalète lourde","Masse d'armes"];
var WP_R11 = ["Flamberge","Francisque","Fauchon","Kriss","Arc composite","Arbalète à poulies","Fléau"];
var WP_R15 = ["Zweihänder","Bardiche","Falcata","Miséricorde","Yumi","Arbalète à répétition","Étoile du matin"];
var WP_LEG = ["Estripaille","Main-De-Dieu","Destin Brisé","Croc du Grand Loup","Dies Irae","Volonté du Panthéon","Fin-De-L'entraînement","Mémento Mori","Le Débiteur","Orage"];
var ARM_R1 = ["Armure de cuir","Armure légère","Broigne"];
var ARM_R6 = ["Brigandine","Haubert","Cotte de mailles"];
var ARM_R11 = ["Cuirasse","Armure de lames","Lorica"];
var ARM_R15 = ["Armure de plaques","Harnois"];
var ACC_NM = ["Anneau","Bague","Jonc","Pendentif","Médaillon","Collier","Chaîne","Broche","Diadème","Tiare"];
var TLS_NM = ["Amulette","Fétiche","Idole","Sceau","Sigil","Totem","Relique","Fragment","Grigri","Charme","Insigne","Emblème","Reliquaire"];

var EL_SUF = { Feu: "de Feu", Terre: "de Terre", Foudre: "de Foudre", Eau: "d'Eau", Sacré: "Sacré(e)", Ténèbres: "des Ténèbres" };
var WP_SUF = { str: "de puissance", mag: "d'intelligence", crt: "de rage", rel: "de concentration" };
var ARM_SUF = { pvPct: "de vitalité", vph: "de robustesse", vma: "de résilience", eva: "de souplesse", rec: "de soins" };
var ACC_PSUF = { pvPct: "de vitalité", str: "de puissance", mag: "d'intelligence", vph: "de robustesse", vma: "de résilience" };
var ACC_SSUF = { crt: "de rage", eva: "de souplesse", rec: "de soins", rel: "de concentration" };
var TLS_SUF1 = { Feu:"ignifuge", Eau:"hydrophobe", Foudre:"paratonnerre", Terre:"aérien(ne)", Sacré:"sacré(e)", Ténèbres:"maudit(e)" };
var TLS_SUF2 = {"Feu+Eau":"vaporeux(se)","Feu+Foudre":"cataclysmique","Feu+Terre":"volcanique","Feu+Sacré":"de foi","Feu+Ténèbres":"infernal(e)","Eau+Foudre":"de conduction","Eau+Terre":"de vie","Eau+Sacré":"béni(e)","Eau+Ténèbres":"pesteux(se)","Foudre+Terre":"tellurique","Foudre+Sacré":"divin(e)","Foudre+Ténèbres":"abyssal(e)","Terre+Sacré":"consacré(e)","Terre+Ténèbres":"rampant(e)","Sacré+Ténèbres":"d'humanité"};

function nameByRank(r, lists) {
  if (lists.length === 4) { if (r >= 15) return pick(lists[3]); if (r >= 11) return pick(lists[2]); if (r >= 6) return pick(lists[1]); return pick(lists[0]); }
  if (lists.length === 3) { if (r >= 11) return pick(lists[2]); if (r >= 6) return pick(lists[1]); return pick(lists[0]); }
  return pick(lists[0]);
}

function uid4() { return Math.random().toString(36).slice(2, 8); }

// ════════════════════════════════════════
//  GENERATE WEAPON
// ════════════════════════════════════════
export function generateWeapon(rank, rarity, forcedWt) {
  var rm = RARITY_BONUS[rarity] || 1;
  var nT = { 1:1, 2:1, 3:2, 4:2, 5:3 }[rarity] || 1;
  var wt = forcedWt || (Math.random() < 0.5 ? "physical" : "magical");
  var dmg = Math.round(randBetween(lR("wDmgMin",rank), lR("wDmgMax",rank)) * rm);
  var traitPool = ["str","mag","crt","rel"];
  var bon = {};
  for (var i = 0; i < nT && traitPool.length > 0; i++) {
    var idx = Math.floor(Math.random() * traitPool.length);
    var t = traitPool.splice(idx, 1)[0];
    if (t === "rel") { bon.rel = -1; }
    else {
      var lo = lR("w" + t.charAt(0).toUpperCase() + t.slice(1) + "Min", rank);
      var hi = lR("w" + t.charAt(0).toUpperCase() + t.slice(1) + "Max", rank);
      bon[t] = Math.round(randBetween(lo, hi) * rm * 100) / 100;
    }
  }
  var el = "Neutre";
  if (rarity >= 3 && Math.random() < 0.60) el = pick(EL);
  var name;
  if (rarity === 5) name = pick(WP_LEG);
  else name = nameByRank(rank, [WP_R1, WP_R6, WP_R11, WP_R15]);
  if (wt === "magical") name += " magique";
  var firstTrait = Object.keys(bon)[0];
  if (firstTrait && WP_SUF[firstTrait]) name += " " + WP_SUF[firstTrait];
  if (el !== "Neutre") name += " " + (EL_SUF[el] || el);
  return { id: "wg_" + uid4(), name: name, slot: "weapon", wt: wt, rarity: rarity, rank: rank, dmg: dmg, el: el, bon: bon, generated: true };
}

// ════════════════════════════════════════
//  GENERATE ARMOR
// ════════════════════════════════════════
export function generateArmor(rank, rarity) {
  var rm = RARITY_BONUS[rarity] || 1;
  var nT = { 1:1, 2:1, 3:2, 4:3, 5:4 }[rarity] || 1;
  var hp = Math.round(randBetween(lR("aPvMin",rank), lR("aPvMax",rank)) * rm);
  var traitPool = ["pvPct","vph","vma","eva","rec"];
  var bon = { hp: hp };
  for (var i = 0; i < nT && traitPool.length > 0; i++) {
    var idx = Math.floor(Math.random() * traitPool.length);
    var t = traitPool.splice(idx, 1)[0];
    var lo = lR("a" + t.charAt(0).toUpperCase() + t.slice(1) + "Min", rank);
    var hi = lR("a" + t.charAt(0).toUpperCase() + t.slice(1) + "Max", rank);
    var val = Math.round(randBetween(lo, hi) * rm * 100) / 100;
    if (t === "pvPct") bon.pvPct = val;
    else if (t === "vph") bon.phv = -val;
    else if (t === "vma") bon.mav = -val;
    else if (t === "eva") bon.dodge = val;
    else if (t === "rec") bon.rgHp = val;
  }
  var name = nameByRank(rank, [ARM_R1, ARM_R6, ARM_R11, ARM_R15]);
  var firstTrait = Object.keys(bon).filter(function(k){return k!=="hp";})[0];
  var traitKey = firstTrait === "phv" ? "vph" : firstTrait === "mav" ? "vma" : firstTrait === "dodge" ? "eva" : firstTrait === "rgHp" ? "rec" : firstTrait;
  if (traitKey && ARM_SUF[traitKey]) name += " " + ARM_SUF[traitKey];
  return { id: "ag_" + uid4(), name: name, slot: "armor", rarity: rarity, rank: rank, bon: bon, generated: true };
}

// ════════════════════════════════════════
//  GENERATE ACCESSORY
// ════════════════════════════════════════
export function generateAccessory(rank, rarity) {
  var rm = RARITY_BONUS[rarity] || 1;
  var nP = { 1:1, 2:1, 3:2, 4:2, 5:3 }[rarity] || 1;
  var nS = { 1:1, 2:1, 3:1, 4:2, 5:2 }[rarity] || 1;
  var priPool = ["pvPct","str","mag","vph","vma"];
  var secPool = ["crt","eva","rec","rel"];
  var bon = {};
  var firstName = "";
  for (var i = 0; i < nP && priPool.length > 0; i++) {
    var idx = Math.floor(Math.random() * priPool.length);
    var t = priPool.splice(idx, 1)[0];
    var lo = lR("x" + t.charAt(0).toUpperCase() + t.slice(1) + "Min", rank);
    var hi = lR("x" + t.charAt(0).toUpperCase() + t.slice(1) + "Max", rank);
    var val = Math.round(randBetween(lo, hi) * rm * 100) / 100;
    if (t === "vph") bon.phv = -val;
    else if (t === "vma") bon.mav = -val;
    else bon[t] = val;
    if (i === 0) firstName = t;
  }
  for (var j = 0; j < nS && secPool.length > 0; j++) {
    var idx2 = Math.floor(Math.random() * secPool.length);
    var t2 = secPool.splice(idx2, 1)[0];
    if (t2 === "rel") { bon.rel = -1; }
    else {
      var lo2 = lR("x" + t2.charAt(0).toUpperCase() + t2.slice(1) + "Min", rank);
      var hi2 = lR("x" + t2.charAt(0).toUpperCase() + t2.slice(1) + "Max", rank);
      bon[t2] = Math.round(randBetween(lo2, hi2) * rm * 100) / 100;
    }
  }
  var name = pick(ACC_NM);
  if (firstName && ACC_PSUF[firstName]) name += " " + ACC_PSUF[firstName];
  var firstSec = Object.keys(bon).filter(function(k){return ACC_SSUF[k];})[0];
  if (firstSec && ACC_SSUF[firstSec]) name += " " + ACC_SSUF[firstSec];
  return { id: "xg_" + uid4(), name: name, slot: "accessory", rarity: rarity, rank: rank, bon: bon, generated: true };
}

// ════════════════════════════════════════
//  GENERATE TALISMAN
// ════════════════════════════════════════
export function generateTalisman(rank, rarity) {
  var rm = RARITY_BONUS[rarity] || 1;
  var nT = { 1:1, 2:1, 3:2, 4:3, 5:4 }[rarity] || 1;
  var pool = [].concat(EL);
  var bon = { er: {} };
  var elems = [];
  for (var i = 0; i < nT && pool.length > 0; i++) {
    var idx = Math.floor(Math.random() * pool.length);
    var el = pool.splice(idx, 1)[0];
    var val = Math.round(randBetween(lR("tResMin",rank), lR("tResMax",rank)) * rm * 100) / 100;
    bon.er[el] = -val;
    elems.push(el);
  }
  var name = pick(TLS_NM);
  if (elems.length >= 4) name += " chromatique";
  else if (elems.length === 3) name += " amalgamé(e)";
  else if (elems.length === 2) {
    var key = elems.sort().join("+");
    name += " " + (TLS_SUF2[key] || TLS_SUF1[elems[0]] || "");
  } else if (elems.length === 1) {
    name += " " + (TLS_SUF1[elems[0]] || "");
  }
  return { id: "tg_" + uid4(), name: name, slot: "talisman", rarity: rarity, rank: rank, bon: bon, generated: true };
}

// ════════════════════════════════════════
//  ROLL LOOT — 20% per combat, 30% weapon, 30% armor, 20% accessory, 20% talisman
// ════════════════════════════════════════
export function rollLoot(dungeonIdx) {
  var d = DG[dungeonIdx];
  if (!d || !d.loot) return null;
  if (Math.random() > d.loot.dropRate) return null;
  var rank = d.loot.ranks[0] + Math.floor(Math.random() * (d.loot.ranks[1] - d.loot.ranks[0] + 1));
  var rw = d.loot.rarW;
  var roll = Math.random(), cum = 0, rarity = 1;
  for (var r in rw) { cum += rw[r]; if (roll < cum) { rarity = parseInt(r); break; } }
  var typeRoll = Math.random();
  if (typeRoll < 0.30) return generateWeapon(rank, rarity);
  if (typeRoll < 0.60) return generateArmor(rank, rarity);
  if (typeRoll < 0.80) return generateAccessory(rank, rarity);
  return generateTalisman(rank, rarity);
}

// Keep old rollWeaponDrop for backward compatibility
export function rollWeaponDrop(dungeonIdx) { return rollLoot(dungeonIdx); }

// ═══════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════════════

export var EVT = [
  { t: "Campement — repos.", tp: "heal" },
  { t: "Fontaine — compétences rechargées.", tp: "mpFull" },
  { t: "Piège !", tp: "trap" },
  { t: "Autel — Force accrue !", tp: "buff" },
  { t: "Coffre !", tp: "gold" },
  { t: "Grimoire — XP bonus !", tp: "xp" },
];

// ═══════════════════════════════════════════════════════════════
//  AMÉLIORATIONS DE BASE
// ═══════════════════════════════════════════════════════════════

export var BUP = [
  { id: "forge", name: "Forge", desc: "STR +0.3%/niveau", mx: 50, c0: 100, cm: 1.5, ic: "🔨" },
  { id: "rempart", name: "Rempart", desc: "VPH -0.3%/niveau", mx: 50, c0: 100, cm: 1.5, ic: "🏰" },
  { id: "autel", name: "Autel", desc: "PV max +2%/niveau", mx: 50, c0: 120, cm: 1.5, ic: "🩸" },
  { id: "tour", name: "Tour Arcane", desc: "MAG +0.3%/niveau", mx: 50, c0: 120, cm: 1.5, ic: "🗼" },
  { id: "ecole", name: "École", desc: "XP +3%/niveau", mx: 30, c0: 200, cm: 1.6, ic: "📖" },
  { id: "mine", name: "Mine", desc: "Or +3%/niveau", mx: 30, c0: 250, cm: 1.6, ic: "⛏️" },
  { id: "oracle", name: "Oracle", desc: "Invocation +0.4%/niveau", mx: 20, c0: 500, cm: 1.8, ic: "🔮" },
  { id: "taverne", name: "Taverne", desc: "Invocation -2%/niveau", mx: 25, c0: 300, cm: 1.7, ic: "🍺" },
];
