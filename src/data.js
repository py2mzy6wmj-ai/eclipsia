// ═══════════════════════════════════════════════════════════════
//  ECLIPSIA — data.js — Base de données du jeu
// ═══════════════════════════════════════════════════════════════

// ↓↓↓ OR DE DÉPART ↓↓↓
export var STARTING_GOLD = 10000;

export var EL = ["Feu", "Terre", "Foudre", "Eau", "Sacré", "Ténèbres"];
export var EM = { Feu: { i: "🔥", c: "#ef4444" }, Terre: { i: "🪨", c: "#a3a042" }, Foudre: { i: "⚡", c: "#facc15" }, Eau: { i: "💧", c: "#60a5fa" }, Sacré: { i: "☀️", c: "#fde68a" }, Ténèbres: { i: "🌑", c: "#a78bfa" } };
export var defER = function () { return { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 }; };
export var RA = { 1: { n: "Commun", s: "★", c: "#8899aa", r: 0.75 }, 2: { n: "Rare", s: "★★", c: "#5dade2", r: 0.20 }, 3: { n: "Épique", s: "★★★", c: "#a855f7", r: 0.03 }, 4: { n: "Légendaire", s: "★★★★", c: "#f59e0b", r: 0.015 }, 5: { n: "Mythique", s: "★★★★★", c: "#ef4444", r: 0.005 } };

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
  syrio:   { name: "Coup fulgurant",    type: "pAtk", mult: 3,   cd: 8, desc: "Attaque physique ×3", lvl: 1 },
  kael:    { name: "Frappe sanglante",   type: "pAtk", mult: 2.5, cd: 7, desc: "Attaque physique ×2.5", lvl: 1 },
  lyra:    { name: "Tir perçant",        type: "pAtk", mult: 2,   cd: 6, desc: "Attaque physique ×2", lvl: 1 },
  mira:    { name: "Nova ardente",       type: "mAtk", mult: 3,   cd: 8, desc: "Attaque magique ×3", lvl: 1 },
  ragnar:  { name: "Tonnerre divin",     type: "pAtk", mult: 2.5, cd: 7, desc: "Attaque physique ×2.5", lvl: 1 },
  aria:    { name: "Jugement céleste",   type: "mAtk", mult: 3,   cd: 9, desc: "Attaque magique ×3", lvl: 1 },
  nihil:   { name: "Souffle du néant",   type: "pAtk", mult: 3.5, cd: 10, desc: "Attaque physique ×3.5", lvl: 1 },
};

// ═══════════════════════════════════════════════════════════════
//  HÉROS
// ═══════════════════════════════════════════════════════════════
// wt: "physical"/"magical" — type d'arme de départ
// rel: recharge de base de la compétence (en tours). Peut être réduit par équipement.
// mp supprimé, remplacé par rel

export var HEROES = [
  { id: "syrio", name: "Syrio", title: "Vétéran Déserteur", rarity: 2, icon: "⚔️", color: "#c0392b", wt: "physical",
    lore: "Après des années au service d'un roi tyran, sa lame sert désormais des causes plus justes.",
    lv1: { hp: 75, rel: 8, str: 1.06, mag: 0.24, crit: 0.03, phv: 0.95, mav: 1.12, dodge: 0.04 },
    lv100: { hp: 4500, rel: 8, str: 1.87, mag: 0.65, crit: 0.05, phv: 0.76, mav: 1.01, dodge: 0.04 },
    er: { Feu: 0.9, Terre: 0.9, Foudre: 0.9, Eau: 0.9, Sacré: 1.1, Ténèbres: 1.1 } },
  { id: "kael", name: "Kael", title: "Lame Brisée", rarity: 1, icon: "🗡️", color: "#e74c3c", wt: "physical",
    lore: "Ancien mercenaire. Sa lame brisée est tout ce qui lui reste.",
    lv1: { hp: 90, rel: 7, str: 1.08, mag: 0.30, crit: 0.05, phv: 0.93, mav: 1.08, dodge: 0.03 },
    lv100: { hp: 5200, rel: 7, str: 1.95, mag: 0.60, crit: 0.08, phv: 0.72, mav: 0.98, dodge: 0.03 },
    er: defER() },
  { id: "lyra", name: "Lyra", title: "Voix d'Argent", rarity: 1, icon: "🏹", color: "#3498db", wt: "physical",
    lore: "Chasseuse des steppes.",
    lv1: { hp: 60, rel: 6, str: 1.04, mag: 0.40, crit: 0.12, phv: 0.97, mav: 1.05, dodge: 0.08 },
    lv100: { hp: 3200, rel: 6, str: 1.70, mag: 0.80, crit: 0.18, phv: 0.80, mav: 0.95, dodge: 0.08 },
    er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 0.80, Sacré: 1, Ténèbres: 1 } },
  { id: "mira", name: "Mira", title: "Flamme Errante", rarity: 2, icon: "🔥", color: "#e67e22", wt: "magical",
    lore: "Le feu est sa seule amie.",
    lv1: { hp: 50, rel: 8, str: 0.30, mag: 1.12, crit: 0.02, phv: 1.02, mav: 0.92, dodge: 0.03 },
    lv100: { hp: 2800, rel: 8, str: 0.55, mag: 2.10, crit: 0.04, phv: 0.88, mav: 0.70, dodge: 0.03 },
    er: { Feu: 0, Terre: 1, Foudre: 1, Eau: 1.15, Sacré: 1, Ténèbres: 1 } },
  { id: "ragnar", name: "Ragnar", title: "Poing Tonnerre", rarity: 3, icon: "⚡", color: "#e84393", wt: "physical",
    lore: "Il canalise la tempête.",
    lv1: { hp: 95, rel: 7, str: 1.15, mag: 0.35, crit: 0.10, phv: 0.94, mav: 1.06, dodge: 0.03 },
    lv100: { hp: 5800, rel: 7, str: 2.20, mag: 0.70, crit: 0.16, phv: 0.70, mav: 0.95, dodge: 0.03 },
    er: { Feu: 1, Terre: 1.10, Foudre: 0, Eau: 0.90, Sacré: 1, Ténèbres: 1 } },
  { id: "aria", name: "Aria", title: "Impératrice Céleste", rarity: 5, icon: "👑", color: "#ffeaa7", wt: "magical",
    lore: "Dernière héritière d'un empire déchu.",
    lv1: { hp: 80, rel: 9, str: 1.08, mag: 1.15, crit: 0.08, phv: 0.92, mav: 0.90, dodge: 0.05 },
    lv100: { hp: 5000, rel: 9, str: 2.00, mag: 2.20, crit: 0.14, phv: 0.68, mav: 0.65, dodge: 0.05 },
    er: { Feu: 0.90, Terre: 0.90, Foudre: 0.90, Eau: 0.90, Sacré: 0, Ténèbres: 1.15 } },
  { id: "nihil", name: "Nihil", title: "Le Néant", rarity: 5, icon: "💀", color: "#dfe6e9", wt: "physical",
    lore: "Le Néant incarné — absolu.",
    lv1: { hp: 55, rel: 10, str: 1.20, mag: 1.10, crit: 0.15, phv: 1.00, mav: 1.00, dodge: 0.12 },
    lv100: { hp: 3000, rel: 10, str: 2.40, mag: 2.00, crit: 0.25, phv: 0.82, mav: 0.85, dodge: 0.12 },
    er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.25, Ténèbres: 0 } },
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

var RARITY_BONUS = { 1: 1.0, 2: 1.10, 3: 1.25, 4: 2.0, 5: 3.0 };
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
//  ENNEMIS & BOSS
// ═══════════════════════════════════════════════════════════════

export var ENM = [
  // Forêt Maudite
  { id: "e_loup", name: "Loup", icon: "🐺", hp: 42, dmg: 12, at: "physical", str: 1.06, mag: 0.90, crit: 0.10, phv: 0.95, dodge: 0.10, mav: 0.98, xp: 6, gold: 5, er: defER() },
  { id: "e_bandit", name: "Bandit", icon: "🗡️", hp: 50, dmg: 10, at: "physical", str: 1.04, mag: 0.90, crit: 0.06, phv: 0.96, dodge: 0.05, mav: 1.0, xp: 5, gold: 8, er: defER() },
  // Autres donjons
  { id: "e_squelette", name: "Squelette", icon: "💀", hp: 50, dmg: 10, at: "physical", str: 1.00, mag: 0.90, crit: 0.04, phv: 0.96, dodge: 0.02, mav: 0.98, xp: 5, gold: 4, er: { Feu: 1.15, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.20, Ténèbres: 0.80 } },
  { id: "e_gobelin", name: "Gobelin", icon: "👺", hp: 35, dmg: 8, at: "physical", str: 1.03, mag: 0.90, crit: 0.08, phv: 0.97, dodge: 0.08, mav: 0.98, xp: 4, gold: 6, er: { Feu: 1.10, Terre: 0.90, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 } },
  { id: "e_slime", name: "Slime", icon: "🟢", hp: 65, dmg: 6, at: "physical", str: 0.95, mag: 0.90, crit: 0.01, phv: 0.92, dodge: 0.01, mav: 0.95, xp: 3, gold: 3, er: { Feu: 1.15, Terre: 1, Foudre: 1.10, Eau: 0.80, Sacré: 1, Ténèbres: 1 } },
  { id: "e_golem", name: "Golem", icon: "🗿", hp: 110, dmg: 14, at: "physical", str: 1.04, mag: 0.85, crit: 0.02, phv: 0.84, dodge: 0, mav: 0.94, xp: 10, gold: 8, er: { Feu: 0.90, Terre: 0, Foudre: 0.90, Eau: 1.10, Sacré: 1, Ténèbres: 1 } },
  { id: "e_spectre", name: "Spectre", icon: "👻", hp: 38, dmg: 14, at: "magical", str: 0.90, mag: 1.08, crit: 0, phv: 0.98, dodge: 0.12, mav: 0.92, xp: 8, gold: 7, er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.25, Ténèbres: 0 } },
  { id: "e_demon", name: "Démon", icon: "😈", hp: 75, dmg: 18, at: "physical", str: 1.10, mag: 1.03, crit: 0.08, phv: 0.93, dodge: 0.06, mav: 0.93, xp: 12, gold: 10, er: { Feu: 0.80, Terre: 1, Foudre: 1, Eau: 1.10, Sacré: 1.20, Ténèbres: 0.80 } },
];

export var BSS = [
  // Forêt Maudite
  { id: "b_ogre", name: "Ogre", icon: "👹", hp: 280, dmg: 20, at: "physical", str: 1.10, mag: 0.80, crit: 0.04, phv: 0.82, dodge: 0.02, mav: 1.10, xp: 40, gold: 30, boss: true, er: { Feu: 1.10, Terre: 0.90, Foudre: 1, Eau: 1, Sacré: 1.10, Ténèbres: 1 } },
  // Autres donjons
  { id: "b_liche", name: "Roi Liche", icon: "🧟", hp: 320, dmg: 24, at: "magical", str: 1.08, mag: 1.12, crit: 0.06, phv: 0.90, dodge: 0.04, mav: 0.87, xp: 50, gold: 40, boss: true, er: { Feu: 1.10, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.30, Ténèbres: 0 } },
  { id: "b_hydre", name: "Hydre", icon: "🐍", hp: 450, dmg: 20, at: "physical", str: 1.12, mag: 0.95, crit: 0.05, phv: 0.86, dodge: 0.02, mav: 0.92, xp: 60, gold: 50, boss: true, er: { Feu: 1.15, Terre: 1, Foudre: 1.10, Eau: 0.80, Sacré: 1, Ténèbres: 1 } },
  { id: "b_archidemon", name: "Archidémon", icon: "👿", hp: 380, dmg: 28, at: "physical", str: 1.18, mag: 1.10, crit: 0.10, phv: 0.89, dodge: 0.06, mav: 0.89, xp: 70, gold: 60, boss: true, er: { Feu: 0.70, Terre: 1, Foudre: 1, Eau: 1.15, Sacré: 1.30, Ténèbres: 0 } },
  { id: "b_titan", name: "Titan", icon: "⛰️", hp: 550, dmg: 22, at: "physical", str: 1.06, mag: 0.80, crit: 0.02, phv: 0.78, dodge: 0, mav: 0.94, xp: 80, gold: 70, boss: true, er: { Feu: 0.90, Terre: 0, Foudre: 0.90, Eau: 1.10, Sacré: 1, Ténèbres: 1 } },
];

// ═══════════════════════════════════════════════════════════════
//  DONJONS
// ═══════════════════════════════════════════════════════════════
// structure: tableau d'étapes du donjon
//   "combat" = combat aléatoire parmi le pool du donjon
//   "event" = événement aléatoire
//   "boss" = combat de boss
// enemies: ids des monstres possibles
// bosses: ids des boss possibles
// loot: table de drop d'armes
// reward: or de fin + drop garanti

export var DG = [
  {
    name: "Forêt Maudite", fl: 6, m: 1, rw: 1, ul: 0,
    structure: [
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "event" },
      { type: "combat", count: [1, 2] },
      { type: "combat", count: [1, 2] },
      { type: "boss" },
    ],
    enemies: ["e_loup", "e_bandit"],
    bosses: ["b_ogre"],
    loot: { ranks: [1, 2], rarW: { 1: 0.80, 2: 0.20 }, dropRate: 0.15 },
    reward: { gold: 100, guaranteedDrop: true },
    desc: "Loups et bandits rôdent. L'Ogre règne en maître.",
  },
  {
    name: "Crypte Oubliée", fl: 8, m: 1.4, rw: 1.6, ul: 5,
    structure: [
      { type: "combat", count: [1, 3] },
      { type: "combat", count: [1, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [1, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "boss" },
    ],
    enemies: ["e_squelette", "e_gobelin", "e_slime"],
    bosses: ["b_liche"],
    loot: { ranks: [2, 4], rarW: { 1: 0.60, 2: 0.30, 3: 0.10 }, dropRate: 0.20 },
    reward: { gold: 200, guaranteedDrop: true },
    desc: "Morts-vivants et créatures rampantes. Le Roi Liche attend.",
  },
  {
    name: "Abîme de Feu", fl: 10, m: 2, rw: 2.5, ul: 15,
    structure: [
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 4] },
      { type: "event" },
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 4] },
      { type: "event" },
      { type: "boss" },
    ],
    enemies: ["e_golem", "e_demon", "e_spectre"],
    bosses: ["b_hydre"],
    loot: { ranks: [4, 7], rarW: { 1: 0.40, 2: 0.35, 3: 0.20, 4: 0.05 }, dropRate: 0.25 },
    reward: { gold: 400, guaranteedDrop: true },
    desc: "Golems et démons dans les profondeurs. L'Hydre guette.",
  },
  {
    name: "Citadelle Céleste", fl: 12, m: 3, rw: 4, ul: 30,
    structure: [
      { type: "combat", count: [2, 3] },
      { type: "combat", count: [2, 3] },
      { type: "event" },
      { type: "combat", count: [2, 4] },
      { type: "combat", count: [2, 4] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [2, 4] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "boss" },
    ],
    enemies: ["e_spectre", "e_demon", "e_golem"],
    bosses: ["b_archidemon"],
    loot: { ranks: [7, 11], rarW: { 2: 0.40, 3: 0.35, 4: 0.20, 5: 0.05 }, dropRate: 0.25 },
    reward: { gold: 800, guaranteedDrop: true },
    desc: "L'Archidémon corrompt les cieux.",
  },
  {
    name: "Le Néant Éternel", fl: 15, m: 4.5, rw: 6, ul: 50,
    structure: [
      { type: "combat", count: [2, 4] },
      { type: "combat", count: [3, 4] },
      { type: "event" },
      { type: "combat", count: [3, 4] },
      { type: "combat", count: [3, 4] },
      { type: "event" },
      { type: "combat", count: [3, 5] },
      { type: "combat", count: [3, 4] },
      { type: "event" },
      { type: "combat", count: [3, 5] },
      { type: "combat", count: [3, 5] },
      { type: "event" },
      { type: "combat", count: [3, 5] },
      { type: "combat", count: [3, 5] },
      { type: "boss" },
    ],
    enemies: ["e_demon", "e_spectre", "e_golem", "e_squelette"],
    bosses: ["b_titan"],
    loot: { ranks: [10, 15], rarW: { 2: 0.30, 3: 0.35, 4: 0.25, 5: 0.10 }, dropRate: 0.30 },
    reward: { gold: 1500, guaranteedDrop: true },
    desc: "Le Titan de Pierre attend au bout du néant.",
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
  { t: "🏕️ Campement — repos.", tp: "heal" },
  { t: "⛲ Fontaine — compétences rechargées.", tp: "mpFull" },
  { t: "⚠️ Piège !", tp: "trap" },
  { t: "🔮 Autel — Force accrue !", tp: "buff" },
  { t: "💰 Coffre !", tp: "gold" },
  { t: "📚 Grimoire — XP bonus !", tp: "xp" },
];

// ═══════════════════════════════════════════════════════════════
//  AMÉLIORATIONS DE BASE
// ═══════════════════════════════════════════════════════════════

export var BUP = [
  { id: "forge", name: "Forge", desc: "STR +0.3%/niveau", mx: 50, c0: 100, cm: 1.5, ic: "🔨" },
  { id: "rempart", name: "Rempart", desc: "PHV -0.3%/niveau", mx: 50, c0: 100, cm: 1.5, ic: "🏰" },
  { id: "autel", name: "Autel", desc: "PV max +2%/niveau", mx: 50, c0: 120, cm: 1.5, ic: "❤️" },
  { id: "tour", name: "Tour Arcane", desc: "MAG +0.3%/niveau", mx: 50, c0: 120, cm: 1.5, ic: "🗼" },
  { id: "ecole", name: "École", desc: "XP +3%/niveau", mx: 30, c0: 200, cm: 1.6, ic: "📖" },
  { id: "mine", name: "Mine", desc: "Or +3%/niveau", mx: 30, c0: 250, cm: 1.6, ic: "⛏️" },
  { id: "oracle", name: "Oracle", desc: "Invocation +0.4%/niveau", mx: 20, c0: 500, cm: 1.8, ic: "🔮" },
  { id: "taverne", name: "Taverne", desc: "Invocation -2%/niveau", mx: 25, c0: 300, cm: 1.7, ic: "🍺" },
];
