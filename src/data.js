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
//  ÉQUIPEMENT STATIQUE (armures, accessoires, talismans)
//  Les armes sont générées aléatoirement (voir generateWeapon)
// ═══════════════════════════════════════════════════════════════

export var AR = [
  { id: "a01", name: "Cotte de Mailles", slot: "armor", rarity: 1, bon: { hp: 20, phv: -0.02 }, desc: "PV +20, PHV -2%" },
  { id: "a02", name: "Robe de Tissu", slot: "armor", rarity: 1, bon: { mp: 12, mav: -0.02 }, desc: "PM +12, MAV -2%" },
  { id: "a03", name: "Plastron Runique", slot: "armor", rarity: 2, bon: { hp: 45, phv: -0.03 }, desc: "PV +45, PHV -3%" },
  { id: "a04", name: "Tunique du Sage", slot: "armor", rarity: 2, bon: { mp: 25, mav: -0.03 }, desc: "PM +25, MAV -3%" },
  { id: "a05", name: "Armure Dragon", slot: "armor", rarity: 3, bon: { hp: 80, phv: -0.05, dodge: 0.01 }, desc: "Armure lourde" },
  { id: "a06", name: "Égide Céleste", slot: "armor", rarity: 4, bon: { hp: 120, phv: -0.07 }, desc: "Légendaire" },
];
export var AC = [
  { id: "x01", name: "Anneau Vigueur", slot: "accessory", rarity: 1, bon: { rgHp: 0.02 }, desc: "Régénération PV +2%/tour" },
  { id: "x02", name: "Pendentif Célérité", slot: "accessory", rarity: 1, bon: { rel: -1 }, desc: "Recharge -1 tour" },
  { id: "x03", name: "Collier Vivacité", slot: "accessory", rarity: 2, bon: { rel: -1, rgHp: 0.02 }, desc: "Recharge -1, Régénération PV +2%" },
  { id: "x04", name: "Broche Sang", slot: "accessory", rarity: 2, bon: { rgHp: 0.04 }, desc: "Régénération PV +4%" },
  { id: "x05", name: "Amulette Vitale", slot: "accessory", rarity: 3, bon: { rgHp: 0.04, rel: -2 }, desc: "Régénération PV +4%, Recharge -2" },
  { id: "x06", name: "Couronne Éternité", slot: "accessory", rarity: 4, bon: { rgHp: 0.05, rel: -2 }, desc: "Légendaire, Recharge -2" },
];
export var TL = [
  { id: "t01", name: "Charme Anti-Feu", slot: "talisman", rarity: 1, bon: { er: { Feu: -0.10 } }, desc: "Vulnérabilité Feu -10%" },
  { id: "t02", name: "Charme Anti-Foudre", slot: "talisman", rarity: 1, bon: { er: { Foudre: -0.10 } }, desc: "Vulnérabilité Foudre -10%" },
  { id: "t03", name: "Sceau Élémentaire", slot: "talisman", rarity: 2, bon: { er: { Feu: -0.08, Eau: -0.08, Terre: -0.08 } }, desc: "Vulnérabilité Feu/Eau/Terre -8%" },
  { id: "t04", name: "Amulette Sacrée", slot: "talisman", rarity: 3, bon: { er: { Sacré: -0.15, Ténèbres: -0.15 } }, desc: "Vulnérabilité Sacré/Ténèbres -15%" },
  { id: "t05", name: "Orbe Harmonie", slot: "talisman", rarity: 4, bon: { er: { Feu: -0.1, Terre: -0.1, Foudre: -0.1, Eau: -0.1, Sacré: -0.1, Ténèbres: -0.1 } }, desc: "Vulnérabilité toutes -10%" },
];
export var ALL_EQ = [].concat(AR, AC, TL);

// ═══════════════════════════════════════════════════════════════
//  GÉNÉRATION ALÉATOIRE D'ARMES
// ═══════════════════════════════════════════════════════════════

var WP_NAMES = ["Épée", "Poignard", "Arc", "Hallebarde", "Hache", "Arbalète"];
var WP_NAMES_MYTHIC = ["Faiseur-de-veuves", "Ultima", "Deuillegivre"];
var EL_SUFFIXES = { Feu: "de Feu", Terre: "de Terre", Foudre: "de Foudre", Eau: "d'Eau", Sacré: "Sacré(e)", Ténèbres: "des Ténèbres" };

var RARITY_BONUS = { 1: 1.0, 2: 1.50, 3: 2.10, 4: 3.0, 5: 5.0 };
var RARITY_TRAITS = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2 };

var RANK_BASE = {
  dmgMin: { r1: 15, r15: 2250 }, dmgMax: { r1: 30, r15: 3000 },
  strMin: { r1: 0.01, r15: 0.15 }, strMax: { r1: 0.02, r15: 0.20 },
  magMin: { r1: 0.01, r15: 0.15 }, magMax: { r1: 0.02, r15: 0.20 },
  crtMin: { r1: 0.01, r15: 0.10 }, crtMax: { r1: 0.01, r15: 0.10 },
};

function lerpRank(stat, rank) {
  var b = RANK_BASE[stat];
  var t = (rank - 1) / 14;
  var curve = t * t;
  return b.r1 + (b.r15 - b.r1) * curve;
}

function randBetween(min, max) { return min + Math.random() * (max - min); }

// forcedWt: optionnel, force "physical" ou "magical" (pour arme de départ)
export function generateWeapon(rank, rarity, forcedWt) {
  var rarMult = RARITY_BONUS[rarity] || 1;
  var numTraits = RARITY_TRAITS[rarity] || 1;
  var wt = forcedWt || (Math.random() < 0.5 ? "physical" : "magical");

  var dmgBase = Math.round(randBetween(lerpRank("dmgMin", rank), lerpRank("dmgMax", rank)));
  var dmg = Math.round(dmgBase * rarMult);

  var traitPool = ["str", "mag", "crt"];
  var traits = {};
  for (var i = 0; i < numTraits && traitPool.length > 0; i++) {
    var idx = Math.floor(Math.random() * traitPool.length);
    var trait = traitPool.splice(idx, 1)[0];
    var val;
    if (trait === "str") val = randBetween(lerpRank("strMin", rank), lerpRank("strMax", rank));
    else if (trait === "mag") val = randBetween(lerpRank("magMin", rank), lerpRank("magMax", rank));
    else val = randBetween(lerpRank("crtMin", rank), lerpRank("crtMax", rank));
    traits[trait] = Math.round(val * rarMult * 100) / 100;
  }

  var el = "Neutre";
  if (rarity >= 3) {
    if (Math.random() < 0.60) {
      el = EL[Math.floor(Math.random() * EL.length)];
    }
  }

  var name;
  if (rarity === 5) {
    name = WP_NAMES_MYTHIC[Math.floor(Math.random() * WP_NAMES_MYTHIC.length)];
  } else {
    name = WP_NAMES[Math.floor(Math.random() * WP_NAMES.length)];
  }
  if (wt === "magical") name = name + " magique";
  if (el !== "Neutre") name = name + " " + (EL_SUFFIXES[el] || el);

  var descParts = [];
  if (traits.str) descParts.push("STR +" + Math.round(traits.str * 100) + "%");
  if (traits.mag) descParts.push("MAG +" + Math.round(traits.mag * 100) + "%");
  if (traits.crt) descParts.push("CRT +" + Math.round(traits.crt * 100) + "%");
  if (el !== "Neutre") descParts.push((EM[el] || {}).i + " " + el);

  return {
    id: "wg_" + Math.random().toString(36).slice(2, 8),
    name: name, slot: "weapon", wt: wt, rarity: rarity, rank: rank,
    dmg: dmg, el: el, bon: traits,
    desc: descParts.join(", ") || "Arme ordinaire",
    generated: true,
  };
}


// ═══════════════════════════════════════════════════════════════
//  ENNEMIS — tous sur la même échelle de base
//  La puissance réelle vient du multi caché du donjon
// ═══════════════════════════════════════════════════════════════

export var ENM = [
  // Vallée Venteuse
  { id: "e_loup", name: "Loup", icon: "🐺", hp: 40, dmg: 10, at: "physical", str: 1.04, mag: 0.20, crit: 0.08, phv: 0.97, dodge: 0.08, mav: 1.02, xp: 5, gold: 4, er: defER() },
  { id: "e_vautour", name: "Vautour", icon: "🦅", hp: 28, dmg: 8, at: "physical", str: 1.02, mag: 0.20, crit: 0.12, phv: 1.02, dodge: 0.14, mav: 1.04, xp: 4, gold: 3, er: { Feu: 1.1, Terre: 1, Foudre: 1.1, Eau: 1, Sacré: 1, Ténèbres: 1 } },
  // Sombre Forêt
  { id: "e_sanglier", name: "Sanglier", icon: "🐗", hp: 55, dmg: 12, at: "physical", str: 1.06, mag: 0.15, crit: 0.04, phv: 0.93, dodge: 0.03, mav: 1.05, xp: 6, gold: 5, er: defER() },
  { id: "e_chasseur", name: "Chasseur", icon: "🏹", hp: 35, dmg: 11, at: "physical", str: 1.05, mag: 0.25, crit: 0.10, phv: 0.98, dodge: 0.06, mav: 1.0, xp: 5, gold: 6, er: defER() },
  // Mer Souterraine
  { id: "e_slime_bleu", name: "Slime bleu", icon: "🫧", hp: 50, dmg: 7, at: "magical", str: 0.20, mag: 1.02, crit: 0.02, phv: 0.94, dodge: 0.02, mav: 0.94, xp: 4, gold: 3, er: { Feu: 1.15, Terre: 1, Foudre: 1.1, Eau: 0.50, Sacré: 1, Ténèbres: 1 } },
  { id: "e_crabe", name: "Crabe géant", icon: "🦀", hp: 60, dmg: 13, at: "physical", str: 1.05, mag: 0.15, crit: 0.03, phv: 0.88, dodge: 0.01, mav: 1.05, xp: 6, gold: 5, er: { Feu: 1, Terre: 0.9, Foudre: 1.1, Eau: 0.85, Sacré: 1, Ténèbres: 1 } },
  // Désert Aride
  { id: "e_saurien", name: "Guerrier saurien", icon: "🦎", hp: 48, dmg: 12, at: "physical", str: 1.06, mag: 0.25, crit: 0.06, phv: 0.94, dodge: 0.05, mav: 0.98, xp: 6, gold: 6, er: { Feu: 0.9, Terre: 0.9, Foudre: 1, Eau: 1.1, Sacré: 1, Ténèbres: 1 } },
  { id: "e_scorpion", name: "Scorpion", icon: "🦂", hp: 38, dmg: 14, at: "physical", str: 1.08, mag: 0.15, crit: 0.10, phv: 0.96, dodge: 0.06, mav: 1.04, xp: 5, gold: 5, er: { Feu: 1.1, Terre: 0.85, Foudre: 1, Eau: 1.1, Sacré: 1, Ténèbres: 1 } },
  { id: "e_cactuaire", name: "Cactuaire", icon: "🌵", hp: 30, dmg: 9, at: "physical", str: 1.03, mag: 0.30, crit: 0.15, phv: 0.98, dodge: 0.12, mav: 1.0, xp: 4, gold: 4, er: { Feu: 1.2, Terre: 0.8, Foudre: 1, Eau: 0.7, Sacré: 1, Ténèbres: 1 } },
  // Temple Abandonné
  { id: "e_slime_jaune", name: "Slime jaune", icon: "💛", hp: 52, dmg: 8, at: "magical", str: 0.20, mag: 1.04, crit: 0.02, phv: 0.95, dodge: 0.02, mav: 0.92, xp: 4, gold: 3, er: { Feu: 1.1, Terre: 1, Foudre: 0.50, Eau: 1.1, Sacré: 1, Ténèbres: 1 } },
  { id: "e_mage_noir", name: "Mage noir", icon: "🧙", hp: 32, dmg: 14, at: "magical", str: 0.15, mag: 1.08, crit: 0.06, phv: 1.04, dodge: 0.04, mav: 0.93, xp: 7, gold: 7, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.8 } },
  { id: "e_esprit", name: "Esprit farouche", icon: "👻", hp: 30, dmg: 11, at: "magical", str: 0.10, mag: 1.06, crit: 0.04, phv: 1.08, dodge: 0.15, mav: 0.95, xp: 5, gold: 5, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.25, Ténèbres: 0.70 } },
  // Cité Maudite
  { id: "e_coupe_jarret", name: "Coupe-jarret", icon: "🗡️", hp: 36, dmg: 13, at: "physical", str: 1.07, mag: 0.20, crit: 0.12, phv: 0.99, dodge: 0.10, mav: 1.02, xp: 5, gold: 8, er: defER() },
  { id: "e_soldat_corrompu", name: "Soldat corrompu", icon: "⚔️", hp: 52, dmg: 11, at: "physical", str: 1.05, mag: 0.20, crit: 0.05, phv: 0.92, dodge: 0.03, mav: 0.98, xp: 6, gold: 6, er: defER() },
  { id: "e_homme_serpent", name: "Homme-serpent", icon: "🐍", hp: 42, dmg: 12, at: "physical", str: 1.05, mag: 0.35, crit: 0.08, phv: 0.96, dodge: 0.08, mav: 0.96, xp: 6, gold: 6, er: { Feu: 1, Terre: 0.9, Foudre: 1, Eau: 1, Sacré: 1.1, Ténèbres: 0.9 } },
  // Palais du Roi Déchu
  { id: "e_garde_royal", name: "Garde royal", icon: "🛡️", hp: 58, dmg: 11, at: "physical", str: 1.04, mag: 0.20, crit: 0.04, phv: 0.88, dodge: 0.02, mav: 0.96, xp: 6, gold: 5, er: defER() },
  { id: "e_statue_animee", name: "Statue animée", icon: "🗿", hp: 70, dmg: 13, at: "physical", str: 1.06, mag: 0.10, crit: 0.02, phv: 0.84, dodge: 0, mav: 1.06, xp: 7, gold: 5, er: { Feu: 0.9, Terre: 0.7, Foudre: 0.9, Eau: 1, Sacré: 1.1, Ténèbres: 1 } },
  { id: "e_assassin", name: "Assassin", icon: "🥷", hp: 30, dmg: 15, at: "physical", str: 1.10, mag: 0.20, crit: 0.15, phv: 1.02, dodge: 0.14, mav: 1.02, xp: 6, gold: 8, er: defER() },
  // Catacombes Royales
  { id: "e_squelette", name: "Squelette", icon: "💀", hp: 38, dmg: 10, at: "physical", str: 1.02, mag: 0.20, crit: 0.04, phv: 0.96, dodge: 0.02, mav: 1.0, xp: 4, gold: 3, er: { Feu: 1.15, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.8 } },
  { id: "e_zombie", name: "Zombie", icon: "🧟", hp: 65, dmg: 9, at: "physical", str: 1.03, mag: 0.10, crit: 0.01, phv: 0.92, dodge: 0, mav: 1.04, xp: 5, gold: 3, er: { Feu: 1.2, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.7 } },
  { id: "e_slime_noir", name: "Slime noir", icon: "🖤", hp: 55, dmg: 8, at: "magical", str: 0.20, mag: 1.04, crit: 0.02, phv: 0.94, dodge: 0.02, mav: 0.92, xp: 4, gold: 3, er: { Feu: 1.1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.40 } },
  // Couloirs Infernaux
  { id: "e_slime_rouge", name: "Slime rouge", icon: "❤️‍🔥", hp: 50, dmg: 9, at: "magical", str: 0.20, mag: 1.05, crit: 0.03, phv: 0.94, dodge: 0.02, mav: 0.92, xp: 5, gold: 4, er: { Feu: 0, Terre: 1, Foudre: 1, Eau: 1.3, Sacré: 1, Ténèbres: 1 } },
  { id: "e_demon_inf", name: "Démon inférieur", icon: "😈", hp: 45, dmg: 13, at: "physical", str: 1.07, mag: 0.30, crit: 0.08, phv: 0.95, dodge: 0.05, mav: 0.95, xp: 6, gold: 6, er: { Feu: 0.7, Terre: 1, Foudre: 1, Eau: 1.15, Sacré: 1.2, Ténèbres: 0.8 } },
  { id: "e_armure", name: "Armure possédée", icon: "🛡️", hp: 68, dmg: 12, at: "physical", str: 1.05, mag: 0.15, crit: 0.03, phv: 0.85, dodge: 0, mav: 1.0, xp: 6, gold: 5, er: { Feu: 1, Terre: 0.9, Foudre: 1, Eau: 1, Sacré: 1.15, Ténèbres: 0.85 } },
  { id: "e_diablotin", name: "Diablotin", icon: "👿", hp: 25, dmg: 10, at: "magical", str: 0.20, mag: 1.06, crit: 0.10, phv: 1.04, dodge: 0.12, mav: 0.98, xp: 4, gold: 5, er: { Feu: 0.6, Terre: 1, Foudre: 1, Eau: 1.2, Sacré: 1.15, Ténèbres: 0.7 } },
  // Forteresse du Seigneur des Enfers
  { id: "e_demon_sup", name: "Démon supérieur", icon: "👹", hp: 55, dmg: 15, at: "physical", str: 1.10, mag: 0.35, crit: 0.08, phv: 0.92, dodge: 0.05, mav: 0.92, xp: 8, gold: 8, er: { Feu: 0.5, Terre: 1, Foudre: 1, Eau: 1.2, Sacré: 1.25, Ténèbres: 0.7 } },
  { id: "e_chien_infernal", name: "Chien infernal", icon: "🐕‍🦺", hp: 40, dmg: 14, at: "physical", str: 1.08, mag: 0.20, crit: 0.10, phv: 0.96, dodge: 0.08, mav: 1.02, xp: 6, gold: 6, er: { Feu: 0, Terre: 1, Foudre: 1, Eau: 1.3, Sacré: 1.1, Ténèbres: 0.8 } },
  { id: "e_mage_noir2", name: "Mage noir", icon: "🧙‍♂️", hp: 32, dmg: 15, at: "magical", str: 0.15, mag: 1.10, crit: 0.06, phv: 1.04, dodge: 0.04, mav: 0.90, xp: 7, gold: 7, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.7 } },
  { id: "e_slime_chroma", name: "Slime chromatique", icon: "🌈", hp: 60, dmg: 10, at: "magical", str: 0.25, mag: 1.06, crit: 0.04, phv: 0.92, dodge: 0.03, mav: 0.90, xp: 6, gold: 5, er: { Feu: 0.85, Terre: 0.85, Foudre: 0.85, Eau: 0.85, Sacré: 0.85, Ténèbres: 0.85 } },
];

// ═══════════════════════════════════════════════════════════════
//  BOSS — même échelle de base, plus de HP/dégâts que les monstres
// ═══════════════════════════════════════════════════════════════

export var BSS = [
  { id: "b_loup_garou", name: "Loup-Garou", icon: "🐺", hp: 180, dmg: 16, at: "physical", str: 1.10, mag: 0.20, crit: 0.10, phv: 0.92, dodge: 0.08, mav: 1.04, xp: 30, gold: 25, boss: true, er: { Feu: 1.1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.15, Ténèbres: 1 } },
  { id: "b_ours_noir", name: "Ours Noir", icon: "🐻", hp: 250, dmg: 18, at: "physical", str: 1.12, mag: 0.15, crit: 0.06, phv: 0.86, dodge: 0.02, mav: 1.02, xp: 40, gold: 35, boss: true, er: { Feu: 1.2, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 } },
  { id: "b_kraken", name: "Kraken", icon: "🦑", hp: 220, dmg: 16, at: "magical", str: 0.25, mag: 1.10, crit: 0.04, phv: 0.90, dodge: 0.04, mav: 0.88, xp: 45, gold: 40, boss: true, er: { Feu: 1, Terre: 1, Foudre: 1.25, Eau: 0, Sacré: 1, Ténèbres: 1 } },
  { id: "b_ver_sables", name: "Ver des sables", icon: "🪱", hp: 200, dmg: 20, at: "physical", str: 1.08, mag: 0.20, crit: 0.06, phv: 0.94, dodge: 0.18, mav: 1.0, xp: 50, gold: 45, boss: true, er: { Feu: 1, Terre: 0.7, Foudre: 1, Eau: 1.3, Sacré: 1, Ténèbres: 1 } },
  { id: "b_banshee", name: "Banshee", icon: "👻", hp: 180, dmg: 18, at: "magical", str: 0.15, mag: 1.12, crit: 0.06, phv: 0.96, dodge: 0.10, mav: 0.90, xp: 55, gold: 50, boss: true, er: { Feu: 0.9, Terre: 0.9, Foudre: 0.9, Eau: 0.9, Sacré: 1.4, Ténèbres: 0.85 } },
  // Cité Maudite — 3 boss
  { id: "b_pegre_mage", name: "Parrain Mage", icon: "🧙", hp: 150, dmg: 17, at: "magical", str: 0.20, mag: 1.12, crit: 0.06, phv: 1.02, dodge: 0.06, mav: 0.88, xp: 30, gold: 30, boss: true, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.15, Ténèbres: 0.85 } },
  { id: "b_pegre_tank", name: "Parrain Tank", icon: "🛡️", hp: 280, dmg: 12, at: "physical", str: 1.04, mag: 0.15, crit: 0.02, phv: 0.82, dodge: 0.01, mav: 0.94, xp: 30, gold: 30, boss: true, er: defER() },
  { id: "b_pegre_assassin", name: "Parrain Assassin", icon: "🥷", hp: 130, dmg: 20, at: "physical", str: 1.14, mag: 0.20, crit: 0.18, phv: 1.0, dodge: 0.14, mav: 1.02, xp: 30, gold: 30, boss: true, er: defER() },
  { id: "b_heritier", name: "Héritier pestiféré", icon: "👑", hp: 240, dmg: 17, at: "magical", str: 0.20, mag: 1.10, crit: 0.06, phv: 0.80, dodge: 0.10, mav: 0.88, xp: 65, gold: 55, boss: true, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.2, Ténèbres: 0.80 } },
  { id: "b_necromancien", name: "Nécromancien", icon: "💀", hp: 200, dmg: 16, at: "magical", str: 0.15, mag: 1.14, crit: 0.05, phv: 0.98, dodge: 0.04, mav: 0.86, xp: 70, gold: 60, boss: true, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.35, Ténèbres: 0 } },
  // Couloirs Infernaux — 2 boss jumeaux
  { id: "b_phobos", name: "Phobos", icon: "🔥", hp: 200, dmg: 18, at: "physical", str: 1.12, mag: 0.20, crit: 0.08, phv: 0.90, dodge: 0.06, mav: 0, xp: 50, gold: 45, boss: true, er: { Feu: 0.5, Terre: 0.5, Foudre: 0, Eau: 0, Sacré: 1, Ténèbres: 1 } },
  { id: "b_deimos", name: "Deimos", icon: "🌊", hp: 200, dmg: 18, at: "magical", str: 0.20, mag: 1.12, crit: 0.08, phv: 0, dodge: 0.06, mav: 0.90, xp: 50, gold: 45, boss: true, er: { Feu: 0, Terre: 0, Foudre: 0.5, Eau: 0.5, Sacré: 1, Ténèbres: 1 } },
  { id: "b_myhrra", name: "Myhrra", icon: "😈", hp: 350, dmg: 22, at: "physical", str: 1.16, mag: 0.30, crit: 0.12, phv: 0.86, dodge: 0.06, mav: 0.88, xp: 100, gold: 80, boss: true, er: { Feu: 0, Terre: 0.85, Foudre: 0.85, Eau: 1.15, Sacré: 1.2, Ténèbres: 0.6 } },
  // Donjon secret
  { id: "b_oblivium", name: "Oblivium", icon: "🌀", hp: 800, dmg: 30, at: "magical", str: 0.30, mag: 1.20, crit: 0.10, phv: 0.85, dodge: 0.08, mav: 0.85, xp: 500, gold: 500, boss: true, er: { Feu: 0.80, Terre: 0.80, Foudre: 0.80, Eau: 0.80, Sacré: 0.80, Ténèbres: 0.80 } },
  { id: "b_pierre_eau", name: "Pierre de lien (Eau)", icon: "💧", hp: 150, dmg: 10, at: "magical", str: 0.10, mag: 1.0, crit: 0, phv: 0, dodge: 0, mav: 1.0, xp: 20, gold: 20, boss: true, er: { Feu: 0, Terre: 0, Foudre: 0, Eau: 1.5, Sacré: 0, Ténèbres: 0 } },
  { id: "b_pierre_foudre", name: "Pierre de lien (Foudre)", icon: "⚡", hp: 150, dmg: 10, at: "magical", str: 0.10, mag: 1.0, crit: 0, phv: 0, dodge: 0, mav: 1.0, xp: 20, gold: 20, boss: true, er: { Feu: 0, Terre: 0, Foudre: 1.5, Eau: 0, Sacré: 0, Ténèbres: 0 } },
  { id: "b_pierre_terre", name: "Pierre de lien (Terre)", icon: "🪨", hp: 150, dmg: 10, at: "physical", str: 1.0, mag: 0.10, crit: 0, phv: 1.0, dodge: 0, mav: 0, xp: 20, gold: 20, boss: true, er: { Feu: 0, Terre: 1.5, Eau: 0, Foudre: 0, Sacré: 0, Ténèbres: 0 } },
  { id: "b_pierre_feu", name: "Pierre de lien (Feu)", icon: "🔥", hp: 150, dmg: 10, at: "physical", str: 1.0, mag: 0.10, crit: 0, phv: 1.0, dodge: 0, mav: 0, xp: 20, gold: 20, boss: true, er: { Feu: 1.5, Terre: 0, Foudre: 0, Eau: 0, Sacré: 0, Ténèbres: 0 } },
];

// ═══════════════════════════════════════════════════════════════
//  DONJONS — 10 donjons × 3 difficultés + 1 secret
//  m: multiplicateur caché (non affiché), appliqué aux stats des ennemis
//  diff: 0=Normal, 1=Difficile, 2=Cauchemar
//  ul: déblocage séquentiel (index du donjon précédent à battre, -1 = premier)
//  firstBonus: { gold, xp, scrolls } — récompense de première victoire
// ═══════════════════════════════════════════════════════════════

export var DG = [
  {
    name: "Vallée Venteuse", m: 1, rw: 1.0, diff: 0, ul: -1,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "boss" }
    ],
    enemies: ["e_loup", "e_vautour"],
    bosses: ["b_loup_garou"],
    loot: { ranks: [1, 1], rarW: { 1: 1.0 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 100 },
    firstBonus: { gold: 100, xp: 100, scrolls: 1 },
    desc: "Une vallée balayée par les vents, territoire des loups et des charognards.",
  },
  {
    name: "Sombre Forêt", m: 1.5, rw: 1.0, diff: 0, ul: 0,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_sanglier", "e_chasseur"],
    bosses: ["b_ours_noir"],
    loot: { ranks: [1, 1], rarW: { 1: 0.9, 2: 0.1 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 150 },
    firstBonus: { gold: 150, xp: 150, scrolls: 2 },
    desc: "La forêt est dense et hostile. L'Ours Noir règne sur ces bois.",
  },
  {
    name: "Mer Souterraine", m: 2.1, rw: 1.0, diff: 0, ul: 1,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 1] },
      { type: "combat", count: [2, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_slime_bleu", "e_crabe"],
    bosses: ["b_kraken"],
    loot: { ranks: [1, 2], rarW: { 1: 0.8, 2: 0.2 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 210 },
    firstBonus: { gold: 210, xp: 210, scrolls: 2 },
    desc: "Un lac souterrain grouillant de créatures marines.",
  },
  {
    name: "Désert Aride", m: 3, rw: 1.0, diff: 0, ul: 2,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_saurien", "e_scorpion", "e_cactuaire"],
    bosses: ["b_ver_sables"],
    loot: { ranks: [1, 2], rarW: { 1: 0.7, 2: 0.3 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 300 },
    firstBonus: { gold: 300, xp: 300, scrolls: 3 },
    desc: "Le sable brûlant cache des prédateurs impitoyables.",
  },
  {
    name: "Temple Abandonné", m: 4, rw: 1.0, diff: 0, ul: 3,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_slime_jaune", "e_mage_noir", "e_esprit"],
    bosses: ["b_banshee"],
    loot: { ranks: [2, 2], rarW: { 2: 0.6, 3: 0.35, 4: 0.05 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 400 },
    firstBonus: { gold: 400, xp: 400, scrolls: 4 },
    desc: "Un temple oublié des dieux, hanté par les esprits.",
  },
  {
    name: "Cité Maudite", m: 5.5, rw: 1.0, diff: 0, ul: 4,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_coupe_jarret", "e_soldat_corrompu", "e_homme_serpent"],
    bosses: ["b_pegre_mage", "b_pegre_tank", "b_pegre_assassin"],
    loot: { ranks: [2, 2], rarW: { 2: 0.55, 3: 0.38, 4: 0.07 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 550 },
    firstBonus: { gold: 550, xp: 550, scrolls: 6 },
    desc: "Les rues sont le domaine de la pègre et de la corruption.",
  },
  {
    name: "Palais du Roi Déchu", m: 8, rw: 1.0, diff: 0, ul: 5,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_garde_royal", "e_statue_animee", "e_assassin"],
    bosses: ["b_heritier"],
    loot: { ranks: [2, 3], rarW: { 2: 0.53, 3: 0.39, 4: 0.08 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 800 },
    firstBonus: { gold: 800, xp: 800, scrolls: 8 },
    desc: "Le palais tombe en ruines, gardé par ses derniers serviteurs.",
  },
  {
    name: "Catacombes Royales", m: 10, rw: 1.0, diff: 0, ul: 6,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "boss" }
    ],
    enemies: ["e_squelette", "e_zombie", "e_slime_noir"],
    bosses: ["b_necromancien"],
    loot: { ranks: [2, 3], rarW: { 2: 0.5, 3: 0.4, 4: 0.1 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 1000 },
    firstBonus: { gold: 1000, xp: 1000, scrolls: 10 },
    desc: "Les morts ne reposent pas en paix dans ces catacombes.",
  },
  {
    name: "Couloirs Infernaux", m: 12, rw: 1.0, diff: 0, ul: 7,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_slime_rouge", "e_demon_inf", "e_armure", "e_diablotin"],
    bosses: ["b_phobos", "b_deimos"],
    loot: { ranks: [3, 3], rarW: { 3: 0.47, 4: 0.42, 5: 0.11 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 1200 },
    firstBonus: { gold: 1200, xp: 1200, scrolls: 12 },
    desc: "Les flammes de l'enfer illuminent ces couloirs maudits.",
  },
  {
    name: "Forteresse du Seigneur des Enfers", m: 15, rw: 1.0, diff: 0, ul: 8,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_demon_sup", "e_chien_infernal", "e_mage_noir2", "e_slime_chroma"],
    bosses: ["b_myhrra"],
    loot: { ranks: [3, 3], rarW: { 3: 0.45, 4: 0.4, 5: 0.15 }, dropRate: 0.20, nbLoot: 4 },
    reward: { gold: 1500 },
    firstBonus: { gold: 1500, xp: 1500, scrolls: 15 },
    desc: "Le cœur des enfers. Myhrra attend au sommet.",
  },
  {
    name: "Vallée Venteuse (Difficile)", m: 30, rw: 1.6, diff: 1, ul: 9,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "boss" }
    ],
    enemies: ["e_loup", "e_vautour"],
    bosses: ["b_loup_garou"],
    loot: { ranks: [3, 4], rarW: { 3: 0.7, 4: 0.3 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 3000 },
    firstBonus: { gold: 2100, xp: 2100, scrolls: 21 },
    desc: "Une vallée balayée par les vents, territoire des loups et des charognards.",
  },
  {
    name: "Sombre Forêt (Difficile)", m: 35, rw: 1.6, diff: 1, ul: 10,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_sanglier", "e_chasseur"],
    bosses: ["b_ours_noir"],
    loot: { ranks: [3, 4], rarW: { 3: 0.6, 4: 0.35, 5: 0.05 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 3500 },
    firstBonus: { gold: 2450, xp: 2450, scrolls: 24 },
    desc: "La forêt est dense et hostile. L'Ours Noir règne sur ces bois.",
  },
  {
    name: "Mer Souterraine (Difficile)", m: 41, rw: 1.6, diff: 1, ul: 11,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 1] },
      { type: "combat", count: [2, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_slime_bleu", "e_crabe"],
    bosses: ["b_kraken"],
    loot: { ranks: [4, 4], rarW: { 4: 0.55, 5: 0.38, 6: 0.07 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 4100 },
    firstBonus: { gold: 2870, xp: 2870, scrolls: 29 },
    desc: "Un lac souterrain grouillant de créatures marines.",
  },
  {
    name: "Désert Aride (Difficile)", m: 48, rw: 1.6, diff: 1, ul: 12,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_saurien", "e_scorpion", "e_cactuaire"],
    bosses: ["b_ver_sables"],
    loot: { ranks: [4, 4], rarW: { 4: 0.53, 5: 0.39, 6: 0.08 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 4800 },
    firstBonus: { gold: 3360, xp: 3360, scrolls: 34 },
    desc: "Le sable brûlant cache des prédateurs impitoyables.",
  },
  {
    name: "Temple Abandonné (Difficile)", m: 56, rw: 1.6, diff: 1, ul: 13,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_slime_jaune", "e_mage_noir", "e_esprit"],
    bosses: ["b_banshee"],
    loot: { ranks: [4, 5], rarW: { 4: 0.5, 5: 0.4, 6: 0.1 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 5600 },
    firstBonus: { gold: 3920, xp: 3920, scrolls: 39 },
    desc: "Un temple oublié des dieux, hanté par les esprits.",
  },
  {
    name: "Cité Maudite (Difficile)", m: 64, rw: 1.6, diff: 1, ul: 14,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_coupe_jarret", "e_soldat_corrompu", "e_homme_serpent"],
    bosses: ["b_pegre_mage", "b_pegre_tank", "b_pegre_assassin"],
    loot: { ranks: [4, 5], rarW: { 4: 0.47, 5: 0.42, 6: 0.11 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 6400 },
    firstBonus: { gold: 4480, xp: 4480, scrolls: 45 },
    desc: "Les rues sont le domaine de la pègre et de la corruption.",
  },
  {
    name: "Palais du Roi Déchu (Difficile)", m: 72, rw: 1.6, diff: 1, ul: 15,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_garde_royal", "e_statue_animee", "e_assassin"],
    bosses: ["b_heritier"],
    loot: { ranks: [5, 5], rarW: { 5: 0.45, 6: 0.4, 7: 0.15 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 7200 },
    firstBonus: { gold: 5040, xp: 5040, scrolls: 50 },
    desc: "Le palais tombe en ruines, gardé par ses derniers serviteurs.",
  },
  {
    name: "Catacombes Royales (Difficile)", m: 81, rw: 1.6, diff: 1, ul: 16,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "boss" }
    ],
    enemies: ["e_squelette", "e_zombie", "e_slime_noir"],
    bosses: ["b_necromancien"],
    loot: { ranks: [5, 5], rarW: { 5: 0.4, 6: 0.4, 7: 0.2 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 8100 },
    firstBonus: { gold: 5670, xp: 5670, scrolls: 57 },
    desc: "Les morts ne reposent pas en paix dans ces catacombes.",
  },
  {
    name: "Couloirs Infernaux (Difficile)", m: 90, rw: 1.6, diff: 1, ul: 17,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_slime_rouge", "e_demon_inf", "e_armure", "e_diablotin"],
    bosses: ["b_phobos", "b_deimos"],
    loot: { ranks: [5, 6], rarW: { 5: 0.39, 6: 0.39, 7: 0.22 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 9000 },
    firstBonus: { gold: 6300, xp: 6300, scrolls: 63 },
    desc: "Les flammes de l'enfer illuminent ces couloirs maudits.",
  },
  {
    name: "Forteresse du Seigneur des Enfers (Difficile)", m: 100, rw: 1.6, diff: 1, ul: 18,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_demon_sup", "e_chien_infernal", "e_mage_noir2", "e_slime_chroma"],
    bosses: ["b_myhrra"],
    loot: { ranks: [5, 6], rarW: { 5: 0.37, 6: 0.38, 7: 0.25 }, dropRate: 0.20, nbLoot: 4 },
    reward: { gold: 10000 },
    firstBonus: { gold: 7000, xp: 7000, scrolls: 70 },
    desc: "Le cœur des enfers. Myhrra attend au sommet.",
  },
  {
    name: "Vallée Venteuse (Cauchemar)", m: 200, rw: 2.5, diff: 2, ul: 19,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "boss" }
    ],
    enemies: ["e_loup", "e_vautour"],
    bosses: ["b_loup_garou"],
    loot: { ranks: [6, 6], rarW: { 6: 0.53, 7: 0.39, 8: 0.08 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 20000 },
    firstBonus: { gold: 8000, xp: 8000, scrolls: 80 },
    desc: "Une vallée balayée par les vents, territoire des loups et des charognards.",
  },
  {
    name: "Sombre Forêt (Cauchemar)", m: 230, rw: 2.5, diff: 2, ul: 20,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_sanglier", "e_chasseur"],
    bosses: ["b_ours_noir"],
    loot: { ranks: [6, 6], rarW: { 6: 0.5, 7: 0.4, 8: 0.1 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 23000 },
    firstBonus: { gold: 9200, xp: 9200, scrolls: 92 },
    desc: "La forêt est dense et hostile. L'Ours Noir règne sur ces bois.",
  },
  {
    name: "Mer Souterraine (Cauchemar)", m: 260, rw: 2.5, diff: 2, ul: 21,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 1] },
      { type: "combat", count: [2, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "boss" }
    ],
    enemies: ["e_slime_bleu", "e_crabe"],
    bosses: ["b_kraken"],
    loot: { ranks: [6, 7], rarW: { 6: 0.47, 7: 0.42, 8: 0.11 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 26000 },
    firstBonus: { gold: 10400, xp: 10400, scrolls: 104 },
    desc: "Un lac souterrain grouillant de créatures marines.",
  },
  {
    name: "Désert Aride (Cauchemar)", m: 300, rw: 2.5, diff: 2, ul: 22,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_saurien", "e_scorpion", "e_cactuaire"],
    bosses: ["b_ver_sables"],
    loot: { ranks: [6, 7], rarW: { 6: 0.45, 7: 0.4, 8: 0.15 }, dropRate: 0.20, nbLoot: 1 },
    reward: { gold: 30000 },
    firstBonus: { gold: 12000, xp: 12000, scrolls: 120 },
    desc: "Le sable brûlant cache des prédateurs impitoyables.",
  },
  {
    name: "Temple Abandonné (Cauchemar)", m: 350, rw: 2.5, diff: 2, ul: 23,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_slime_jaune", "e_mage_noir", "e_esprit"],
    bosses: ["b_banshee"],
    loot: { ranks: [7, 7], rarW: { 7: 0.4, 8: 0.4, 9: 0.2 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 35000 },
    firstBonus: { gold: 14000, xp: 14000, scrolls: 140 },
    desc: "Un temple oublié des dieux, hanté par les esprits.",
  },
  {
    name: "Cité Maudite (Cauchemar)", m: 400, rw: 2.5, diff: 2, ul: 24,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "boss" }
    ],
    enemies: ["e_coupe_jarret", "e_soldat_corrompu", "e_homme_serpent"],
    bosses: ["b_pegre_mage", "b_pegre_tank", "b_pegre_assassin"],
    loot: { ranks: [7, 7], rarW: { 7: 0.39, 8: 0.39, 9: 0.22 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 40000 },
    firstBonus: { gold: 16000, xp: 16000, scrolls: 160 },
    desc: "Les rues sont le domaine de la pègre et de la corruption.",
  },
  {
    name: "Palais du Roi Déchu (Cauchemar)", m: 450, rw: 2.5, diff: 2, ul: 25,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "boss" }
    ],
    enemies: ["e_garde_royal", "e_statue_animee", "e_assassin"],
    bosses: ["b_heritier"],
    loot: { ranks: [7, 8], rarW: { 7: 0.37, 8: 0.38, 9: 0.25 }, dropRate: 0.20, nbLoot: 2 },
    reward: { gold: 45000 },
    firstBonus: { gold: 18000, xp: 18000, scrolls: 180 },
    desc: "Le palais tombe en ruines, gardé par ses derniers serviteurs.",
  },
  {
    name: "Catacombes Royales (Cauchemar)", m: 500, rw: 2.5, diff: 2, ul: 26,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "boss" }
    ],
    enemies: ["e_squelette", "e_zombie", "e_slime_noir"],
    bosses: ["b_necromancien"],
    loot: { ranks: [7, 8], rarW: { 7: 0.34, 8: 0.35, 9: 0.29, 10: 0.02 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 50000 },
    firstBonus: { gold: 20000, xp: 20000, scrolls: 200 },
    desc: "Les morts ne reposent pas en paix dans ces catacombes.",
  },
  {
    name: "Couloirs Infernaux (Cauchemar)", m: 550, rw: 2.5, diff: 2, ul: 27,
    structure: [
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_slime_rouge", "e_demon_inf", "e_armure", "e_diablotin"],
    bosses: ["b_phobos", "b_deimos"],
    loot: { ranks: [8, 8], rarW: { 8: 0.33, 9: 0.34, 10: 0.3, 11: 0.03 }, dropRate: 0.20, nbLoot: 3 },
    reward: { gold: 55000 },
    firstBonus: { gold: 22000, xp: 22000, scrolls: 220 },
    desc: "Les flammes de l'enfer illuminent ces couloirs maudits.",
  },
  {
    name: "Forteresse du Seigneur des Enfers (Cauchemar)", m: 600, rw: 2.5, diff: 2, ul: 28,
    structure: [
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "combat", count: [1, 1] },
      { type: "event" },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "combat", count: [2, 2] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "combat", count: [3, 3] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" }
    ],
    enemies: ["e_demon_sup", "e_chien_infernal", "e_mage_noir2", "e_slime_chroma"],
    bosses: ["b_myhrra"],
    loot: { ranks: [8, 8], rarW: { 8: 0.31, 9: 0.31, 10: 0.33, 11: 0.05 }, dropRate: 0.20, nbLoot: 4 },
    reward: { gold: 60000 },
    firstBonus: { gold: 24000, xp: 24000, scrolls: 240 },
    desc: "Le cœur des enfers. Myhrra attend au sommet.",
  },
  {
    name: "Pinnacle du Mal Absolu", m: 1000, rw: 10, diff: 3, ul: 29, secret: true, once: true,
    structure: [
      { type: "boss" }
    ],
    enemies: [],
    bosses: ["b_oblivium", "b_pierre_eau", "b_pierre_foudre", "b_pierre_terre", "b_pierre_feu"],
    loot: { ranks: [10, 10], rarW: { 5: 1.0 }, dropRate: 1.0, nbLoot: 1 },
    reward: { gold: 0 },
    firstBonus: { gold: 100000, xp: 100000, scrolls: 100 },
    desc: "Le mal absolu attend. Un seul combat. Pas de retour possible.",
  },
];

// Génère un drop d'arme pour un donjon
export function rollWeaponDrop(dungeonIdx) {
  var d = DG[dungeonIdx];
  if (!d || !d.loot) return null;
  if (Math.random() > d.loot.dropRate) return null;
  var rank = d.loot.ranks[0] + Math.floor(Math.random() * (d.loot.ranks[1] - d.loot.ranks[0] + 1));
  var rw = d.loot.rarW;
  var roll = Math.random(), cum = 0, rarity = 1;
  for (var r in rw) { cum += rw[r]; if (roll < cum) { rarity = parseInt(r); break; } }
  return generateWeapon(rank, rarity);
}

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
