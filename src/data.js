// ═══════════════════════════════════════════════════════════════
//  ECLIPSIA — data.js — Base de données du jeu
//  Modifier ce fichier pour ajouter/éditer du contenu.
//  Import dans App.jsx via: import { HEROES, WP, AR, ... } from './data'
// ═══════════════════════════════════════════════════════════════

// ─── CONFIGURATION ───────────────────────────────────────────
// ↓↓↓ STARTING GOLD — modifier cette valeur ↓↓↓
export var STARTING_GOLD = 10000;

// ↓↓↓ PORTRAIT URL BASE ↓↓↓
// Les portraits sont chargés depuis: PORTRAIT_BASE + hero.id + ".png"
// Ex: https://xyz.supabase.co/storage/v1/object/public/portraits/syrio.png
export var PORTRAIT_BASE = "https://bigxhzfotfwfdwdpecyj.supabase.co/storage/v1/object/public/portraits/";

// ─── ÉLÉMENTS ────────────────────────────────────────────────
export var EL = ["Feu", "Terre", "Foudre", "Eau", "Sacré", "Ténèbres"];

export var EM = {
  Feu:      { i: "🔥", c: "#ef4444" },
  Terre:    { i: "🪨", c: "#a3a042" },
  Foudre:   { i: "⚡", c: "#facc15" },
  Eau:      { i: "💧", c: "#60a5fa" },
  Sacré:    { i: "☀️", c: "#fde68a" },
  Ténèbres: { i: "🌑", c: "#a78bfa" },
};

export var defER = function () {
  return { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 };
};

// ─── RARETÉS & CHANCES D'INVOCATION ─────────────────────────
export var RA = {
  1: { n: "Commun",     s: "★",       c: "#8899aa", r: 0.75  },
  2: { n: "Rare",       s: "★★",      c: "#5dade2", r: 0.20  },
  3: { n: "Épique",     s: "★★★",     c: "#a855f7", r: 0.03  },
  4: { n: "Légendaire", s: "★★★★",    c: "#f59e0b", r: 0.015 },
  5: { n: "Mythique",   s: "★★★★★",   c: "#ef4444", r: 0.005 },
};

// ═══════════════════════════════════════════════════════════════
//  HÉROS
// ═══════════════════════════════════════════════════════════════
// Stats: les multiplicateurs sont centrés sur 1.0 (1.0 = 0%, 1.06 = +6%)
// phv = vulnérabilité physique, mav = vulnérabilité magique
// er = vulnérabilités élémentaires (1.0 = neutre, <1 = résistant, >1 = vulnérable, 0 = immunité)
// sw = id de l'arme de départ

export var HEROES = [
  {
    id: "syrio", name: "Syrio", title: "Vétéran Déserteur",
    rarity: 2, icon: "⚔️", color: "#c0392b", sw: "w01",
    lore: "Après des années au service d'un roi tyran, sa lame sert désormais des causes plus justes.",
    lv1:   { hp: 75,   mp: 12,  str: 1.06, mag: 0.24, crit: 0.03, phv: 0.95, mav: 1.12, dodge: 0.04 },
    lv100: { hp: 4500, mp: 180, str: 1.87, mag: 0.65, crit: 0.05, phv: 0.76, mav: 1.01, dodge: 0.04 },
    er: { Feu: 0.9, Terre: 0.9, Foudre: 0.9, Eau: 0.9, Sacré: 1.1, Ténèbres: 1.1 },
  },
  {
    id: "kael", name: "Kael", title: "Lame Brisée",
    rarity: 1, icon: "🗡️", color: "#e74c3c", sw: "w01",
    lore: "Ancien mercenaire. Sa lame brisée est tout ce qui lui reste.",
    lv1:   { hp: 90,   mp: 10,  str: 1.08, mag: 0.30, crit: 0.05, phv: 0.93, mav: 1.08, dodge: 0.03 },
    lv100: { hp: 5200, mp: 120, str: 1.95, mag: 0.60, crit: 0.08, phv: 0.72, mav: 0.98, dodge: 0.03 },
    er: defER(),
  },
  {
    id: "lyra", name: "Lyra", title: "Voix d'Argent",
    rarity: 1, icon: "🏹", color: "#3498db", sw: "w05",
    lore: "Chasseuse des steppes.",
    lv1:   { hp: 60,   mp: 18,  str: 1.04, mag: 0.40, crit: 0.12, phv: 0.97, mav: 1.05, dodge: 0.08 },
    lv100: { hp: 3200, mp: 250, str: 1.70, mag: 0.80, crit: 0.18, phv: 0.80, mav: 0.95, dodge: 0.08 },
    er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 0.80, Sacré: 1, Ténèbres: 1 },
  },
  {
    id: "mira", name: "Mira", title: "Flamme Errante",
    rarity: 2, icon: "🔥", color: "#e67e22", sw: "w03",
    lore: "Le feu est sa seule amie.",
    lv1:   { hp: 50,   mp: 35,  str: 0.30, mag: 1.12, crit: 0.02, phv: 1.02, mav: 0.92, dodge: 0.03 },
    lv100: { hp: 2800, mp: 500, str: 0.55, mag: 2.10, crit: 0.04, phv: 0.88, mav: 0.70, dodge: 0.03 },
    er: { Feu: 0, Terre: 1, Foudre: 1, Eau: 1.15, Sacré: 1, Ténèbres: 1 },
  },
  {
    id: "ragnar", name: "Ragnar", title: "Poing Tonnerre",
    rarity: 3, icon: "⚡", color: "#e84393", sw: "w04",
    lore: "Il canalise la tempête.",
    lv1:   { hp: 95,   mp: 15,  str: 1.15, mag: 0.35, crit: 0.10, phv: 0.94, mav: 1.06, dodge: 0.03 },
    lv100: { hp: 5800, mp: 200, str: 2.20, mag: 0.70, crit: 0.16, phv: 0.70, mav: 0.95, dodge: 0.03 },
    er: { Feu: 1, Terre: 1.10, Foudre: 0, Eau: 0.90, Sacré: 1, Ténèbres: 1 },
  },
  {
    id: "aria", name: "Aria", title: "Impératrice Céleste",
    rarity: 5, icon: "👑", color: "#ffeaa7", sw: "w06",
    lore: "Dernière héritière d'un empire déchu.",
    lv1:   { hp: 80,   mp: 35,  str: 1.08, mag: 1.15, crit: 0.08, phv: 0.92, mav: 0.90, dodge: 0.05 },
    lv100: { hp: 5000, mp: 500, str: 2.00, mag: 2.20, crit: 0.14, phv: 0.68, mav: 0.65, dodge: 0.05 },
    er: { Feu: 0.90, Terre: 0.90, Foudre: 0.90, Eau: 0.90, Sacré: 0, Ténèbres: 1.15 },
  },
  {
    id: "nihil", name: "Nihil", title: "Le Néant",
    rarity: 5, icon: "💀", color: "#dfe6e9", sw: "w10",
    lore: "Le Néant incarné — absolu.",
    lv1:   { hp: 55,   mp: 25,  str: 1.20, mag: 1.10, crit: 0.15, phv: 1.00, mav: 1.00, dodge: 0.12 },
    lv100: { hp: 3000, mp: 350, str: 2.40, mag: 2.00, crit: 0.25, phv: 0.82, mav: 0.85, dodge: 0.12 },
    er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.25, Ténèbres: 0 },
  },
];

// ═══════════════════════════════════════════════════════════════
//  ÉQUIPEMENT
// ═══════════════════════════════════════════════════════════════
// Armes: dmg = dégâts de base, wt = physical/magical, el = élément, bon = bonus stats
// Armures: bon.hp, bon.phv, bon.mav, bon.dodge
// Accessoires: bon.rgHp (regen PV), bon.rgMp (regen PM), bon.eco (économie PM)
// Talismans: bon.er = { Feu: -0.10, ... } (réduction de vulnérabilité)

export var WP = [
  { id: "w01", name: "Épée Rouillée",   slot: "weapon", wt: "physical", rarity: 1, dmg: 15, el: "Neutre",   bon: {},                    desc: "Lame fatiguée." },
  { id: "w02", name: "Dague d'Ombre",   slot: "weapon", wt: "physical", rarity: 1, dmg: 11, el: "Ténèbres", bon: { crit: 0.04 },         desc: "CRT +4%" },
  { id: "w03", name: "Bâton d'Apprenti", slot: "weapon", wt: "magical",  rarity: 1, dmg: 13, el: "Neutre",   bon: {},                    desc: "Arme magique." },
  { id: "w04", name: "Lame d'Acier",    slot: "weapon", wt: "physical", rarity: 2, dmg: 24, el: "Neutre",   bon: { str: 0.02 },          desc: "STR +2%" },
  { id: "w05", name: "Arc Composite",   slot: "weapon", wt: "physical", rarity: 2, dmg: 20, el: "Neutre",   bon: { crit: 0.06 },         desc: "CRT +6%" },
  { id: "w06", name: "Sceptre de Feu",  slot: "weapon", wt: "magical",  rarity: 2, dmg: 22, el: "Feu",      bon: { mag: 0.04 },          desc: "MAG +4%, Feu" },
  { id: "w07", name: "Grimoire d'Eau",  slot: "weapon", wt: "magical",  rarity: 2, dmg: 20, el: "Eau",      bon: {},                     desc: "Trait Eau" },
  { id: "w08", name: "Flamberge",       slot: "weapon", wt: "physical", rarity: 3, dmg: 38, el: "Feu",      bon: { str: 0.05, crit: 0.04 }, desc: "STR +5%, CRT +4%, Feu" },
  { id: "w09", name: "Orbe du Néant",   slot: "weapon", wt: "magical",  rarity: 3, dmg: 34, el: "Ténèbres", bon: { mag: 0.08 },          desc: "MAG +8%" },
  { id: "w10", name: "Faux Spectrale",  slot: "weapon", wt: "physical", rarity: 3, dmg: 42, el: "Ténèbres", bon: { crit: 0.10 },         desc: "CRT +10%" },
  { id: "w11", name: "Excalibur",       slot: "weapon", wt: "physical", rarity: 4, dmg: 55, el: "Sacré",    bon: { str: 0.08, crit: 0.06 }, desc: "Légendaire, Sacré" },
  { id: "w12", name: "Codex Céleste",   slot: "weapon", wt: "magical",  rarity: 4, dmg: 50, el: "Sacré",    bon: { mag: 0.12 },          desc: "Légendaire, Sacré" },
];

export var AR = [
  { id: "a01", name: "Cotte de Mailles",  slot: "armor", rarity: 1, bon: { hp: 20,  phv: -0.02 },          desc: "PV +20, PHV -2%" },
  { id: "a02", name: "Robe de Tissu",     slot: "armor", rarity: 1, bon: { mp: 12,  mav: -0.02 },          desc: "PM +12, MAV -2%" },
  { id: "a03", name: "Plastron Runique",   slot: "armor", rarity: 2, bon: { hp: 45,  phv: -0.03 },          desc: "PV +45, PHV -3%" },
  { id: "a04", name: "Tunique du Sage",    slot: "armor", rarity: 2, bon: { mp: 25,  mav: -0.03 },          desc: "PM +25, MAV -3%" },
  { id: "a05", name: "Armure Dragon",      slot: "armor", rarity: 3, bon: { hp: 80,  phv: -0.05, dodge: 0.01 }, desc: "Armure lourde" },
  { id: "a06", name: "Égide Céleste",      slot: "armor", rarity: 4, bon: { hp: 120, phv: -0.07 },          desc: "Légendaire" },
];

export var AC = [
  { id: "x01", name: "Anneau Vigueur",    slot: "accessory", rarity: 1, bon: { rgHp: 0.02 },                        desc: "RPV +2%/tour" },
  { id: "x02", name: "Pendentif Arcane",   slot: "accessory", rarity: 1, bon: { rgMp: 0.03 },                        desc: "RPM +3%/tour" },
  { id: "x03", name: "Collier Mana",       slot: "accessory", rarity: 2, bon: { rgMp: 0.04, eco: 0.04 },             desc: "RPM & EPM +4%" },
  { id: "x04", name: "Broche Sang",        slot: "accessory", rarity: 2, bon: { rgHp: 0.03, rgMp: 0.02 },            desc: "RPV +3%, RPM +2%" },
  { id: "x05", name: "Amulette Vitale",    slot: "accessory", rarity: 3, bon: { rgHp: 0.04, rgMp: 0.03, eco: 0.05 }, desc: "Reg & Éco" },
  { id: "x06", name: "Couronne Éternité",  slot: "accessory", rarity: 4, bon: { rgHp: 0.05, rgMp: 0.05, eco: 0.08 }, desc: "Légendaire" },
];

export var TL = [
  { id: "t01", name: "Charme Anti-Feu",    slot: "talisman", rarity: 1, bon: { er: { Feu: -0.10 } },                                   desc: "Vuln Feu -10%" },
  { id: "t02", name: "Charme Anti-Foudre", slot: "talisman", rarity: 1, bon: { er: { Foudre: -0.10 } },                                desc: "Vuln Foudre -10%" },
  { id: "t03", name: "Sceau Élémentaire",  slot: "talisman", rarity: 2, bon: { er: { Feu: -0.08, Eau: -0.08, Terre: -0.08 } },         desc: "Vuln Feu/Eau/Terre -8%" },
  { id: "t04", name: "Amulette Sacrée",    slot: "talisman", rarity: 3, bon: { er: { Sacré: -0.15, Ténèbres: -0.15 } },                desc: "Vuln Sacré/Ténèbres -15%" },
  { id: "t05", name: "Orbe Harmonie",      slot: "talisman", rarity: 4, bon: { er: { Feu: -0.1, Terre: -0.1, Foudre: -0.1, Eau: -0.1, Sacré: -0.1, Ténèbres: -0.1 } }, desc: "Vuln toutes -10%" },
];

export var ALL_EQ = [].concat(WP, AR, AC, TL);

// ═══════════════════════════════════════════════════════════════
//  ENNEMIS & BOSS
// ═══════════════════════════════════════════════════════════════

export var ENM = [
  { id: "e01", name: "Squelette", icon: "💀", hp: 50,  dmg: 10, at: "physical", str: 1.00, mag: 0.90, crit: 0.04, phv: 0.96, dodge: 0.02, mav: 0.98, xp: 5,  gold: 4,  er: { Feu: 1.15, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.20, Ténèbres: 0.80 } },
  { id: "e02", name: "Gobelin",   icon: "👺", hp: 35,  dmg: 8,  at: "physical", str: 1.03, mag: 0.90, crit: 0.08, phv: 0.97, dodge: 0.08, mav: 0.98, xp: 4,  gold: 6,  er: { Feu: 1.10, Terre: 0.90, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 1 } },
  { id: "e03", name: "Slime",     icon: "🟢", hp: 65,  dmg: 6,  at: "physical", str: 0.95, mag: 0.90, crit: 0.01, phv: 0.92, dodge: 0.01, mav: 0.95, xp: 3,  gold: 3,  er: { Feu: 1.15, Terre: 1, Foudre: 1.10, Eau: 0.80, Sacré: 1, Ténèbres: 1 } },
  { id: "e04", name: "Loup",      icon: "🐺", hp: 42,  dmg: 12, at: "physical", str: 1.06, mag: 0.90, crit: 0.10, phv: 0.95, dodge: 0.10, mav: 0.98, xp: 6,  gold: 5,  er: { Feu: 1.10, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1, Ténèbres: 0.90 } },
  { id: "e05", name: "Golem",     icon: "🗿", hp: 110, dmg: 14, at: "physical", str: 1.04, mag: 0.85, crit: 0.02, phv: 0.84, dodge: 0,    mav: 0.94, xp: 10, gold: 8,  er: { Feu: 0.90, Terre: 0, Foudre: 0.90, Eau: 1.10, Sacré: 1, Ténèbres: 1 } },
  { id: "e06", name: "Spectre",   icon: "👻", hp: 38,  dmg: 14, at: "magical",  str: 0.90, mag: 1.08, crit: 0,    phv: 0.98, dodge: 0.12, mav: 0.92, xp: 8,  gold: 7,  er: { Feu: 1, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.25, Ténèbres: 0 } },
  { id: "e07", name: "Démon",     icon: "😈", hp: 75,  dmg: 18, at: "physical", str: 1.10, mag: 1.03, crit: 0.08, phv: 0.93, dodge: 0.06, mav: 0.93, xp: 12, gold: 10, er: { Feu: 0.80, Terre: 1, Foudre: 1, Eau: 1.10, Sacré: 1.20, Ténèbres: 0.80 } },
];

export var BSS = [
  { id: "b01", name: "Roi Liche",   icon: "🧟", hp: 320, dmg: 24, at: "magical",  str: 1.08, mag: 1.12, crit: 0.06, phv: 0.90, dodge: 0.04, mav: 0.87, xp: 50, gold: 40, boss: true, er: { Feu: 1.10, Terre: 1, Foudre: 1, Eau: 1, Sacré: 1.30, Ténèbres: 0 } },
  { id: "b02", name: "Hydre",       icon: "🐍", hp: 450, dmg: 20, at: "physical", str: 1.12, mag: 0.95, crit: 0.05, phv: 0.86, dodge: 0.02, mav: 0.92, xp: 60, gold: 50, boss: true, er: { Feu: 1.15, Terre: 1, Foudre: 1.10, Eau: 0.80, Sacré: 1, Ténèbres: 1 } },
  { id: "b03", name: "Archidémon",  icon: "👿", hp: 380, dmg: 28, at: "physical", str: 1.18, mag: 1.10, crit: 0.10, phv: 0.89, dodge: 0.06, mav: 0.89, xp: 70, gold: 60, boss: true, er: { Feu: 0.70, Terre: 1, Foudre: 1, Eau: 1.15, Sacré: 1.30, Ténèbres: 0 } },
  { id: "b04", name: "Titan",       icon: "⛰️", hp: 550, dmg: 22, at: "physical", str: 1.06, mag: 0.80, crit: 0.02, phv: 0.78, dodge: 0,    mav: 0.94, xp: 80, gold: 70, boss: true, er: { Feu: 0.90, Terre: 0, Foudre: 0.90, Eau: 1.10, Sacré: 1, Ténèbres: 1 } },
];

// ═══════════════════════════════════════════════════════════════
//  DONJONS
// ═══════════════════════════════════════════════════════════════
// fl = nombre d'étages, m = multiplicateur difficulté, rw = multiplicateur récompense, ul = étages requis pour débloquer

export var DG = [
  { name: "Crypte Oubliée",    fl: 5,  m: 1.0, rw: 1.0, ul: 0  },
  { name: "Forêt Corrompue",   fl: 8,  m: 1.4, rw: 1.6, ul: 5  },
  { name: "Abîme de Feu",      fl: 10, m: 2.0, rw: 2.5, ul: 15 },
  { name: "Citadelle Céleste",  fl: 12, m: 3.0, rw: 4.0, ul: 30 },
  { name: "Le Néant Éternel",   fl: 15, m: 4.5, rw: 6.0, ul: 50 },
];

// ═══════════════════════════════════════════════════════════════
//  ÉVÉNEMENTS DE DONJON
// ═══════════════════════════════════════════════════════════════

export var EVT = [
  { t: "🏕️ Campement — repos.",          tp: "heal"   },
  { t: "⛲ Fontaine — PM restaurés.",     tp: "mpFull" },
  { t: "⚠️ Piège !",                     tp: "trap"   },
  { t: "🔮 Autel — Force accrue !",      tp: "buff"   },
  { t: "💰 Coffre !",                    tp: "gold"   },
  { t: "📚 Grimoire — XP bonus !",       tp: "xp"     },
];

// ═══════════════════════════════════════════════════════════════
//  AMÉLIORATIONS DE BASE
// ═══════════════════════════════════════════════════════════════
// mx = niveau max, c0 = coût initial, cm = multiplicateur de coût par niveau

export var BUP = [
  { id: "forge",   name: "Forge",       desc: "STR +0.3%/nv",   mx: 50, c0: 100, cm: 1.5, ic: "🔨" },
  { id: "rempart", name: "Rempart",     desc: "PHV -0.3%/nv",   mx: 50, c0: 100, cm: 1.5, ic: "🏰" },
  { id: "autel",   name: "Autel",       desc: "PV max +2%/nv",  mx: 50, c0: 120, cm: 1.5, ic: "❤️" },
  { id: "tour",    name: "Tour Arcane", desc: "MAG +0.3%/nv",   mx: 50, c0: 120, cm: 1.5, ic: "🗼" },
  { id: "ecole",   name: "École",       desc: "XP +3%/nv",      mx: 30, c0: 200, cm: 1.6, ic: "📖" },
  { id: "mine",    name: "Mine",        desc: "Or +3%/nv",      mx: 30, c0: 250, cm: 1.6, ic: "⛏️" },
  { id: "oracle",  name: "Oracle",      desc: "Invoc. +0.4%/nv", mx: 20, c0: 500, cm: 1.8, ic: "🔮" },
  { id: "taverne", name: "Taverne",     desc: "Invoc. -2%/nv",  mx: 25, c0: 300, cm: 1.7, ic: "🍺" },
];
