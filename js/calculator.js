/* calculator.js
   Pure logic and capacity tables. Exposes functions used by main.js.
*/

const CapacityTables = (function(){
  // Arrays index 0 => level 1, ... index 24 => level 25
  const T1 = [
    35,41,47,53,59,65,77,89,101,113,125,145,165,185,205,225,250,275,300,325,350,380,410,440,470
  ];
  const T2 = [
    15,18,21,24,27,30,36,42,48,54,60,68,76,84,92,100,110,120,130,140,150,162,174,186,198
  ];
  const T3 = [
    8,10,12,14,16,18,21,24,27,30,33,37,41,45,49,53,58,63,68,73,78,84,90,96,102
  ];
  const T4 = [
    5,6,7,8,9,10,12,14,16,18,20,23,26,29,32,35,40,45,50,55,60,66,72,78,84
  ];

  // Dragon Hoard entries produce values for T1/T2/T3/T4 at each level.
  // Level 1..25 mapping taken from user's data.
  const DH = [
    // L1..L25: [T1, T2, T3, T4]
    [10,  0,  0,  0], //1
    [12,  0,  0,  0], //2
    [14,  0,  0,  0], //3
    [16,  0,  0,  0], //4
    [18,  0,  0,  0], //5
    [20, 10,  0,  0], //6
    [24, 12,  0,  0], //7
    [28, 14,  0,  0], //8
    [32, 16,  0,  0], //9
    [36, 18,  0,  0], //10
    [40, 20, 10,  0], //11
    [46, 22, 11,  0], //12
    [52, 24, 12,  0], //13
    [58, 26, 13,  0], //14
    [64, 28, 14,  0], //15
    [70, 30, 15,  1], //16
    [78, 33, 17,  2], //17
    [86, 36, 19,  3], //18
    [94, 39, 21,  4], //19
    [102,42, 23,  5], //20
    [110,45, 25,  6], //21
    [120,49, 28,  8], //22
    [130,53, 31, 10], //23
    [140,57, 34, 12], //24
    [150,61, 37, 14]  //25
  ];

  return {T1, T2, T3, T4, DH};
})();

// Utility accessors
function getBaseCapacity(tier, level){
  if(level < 1) return 0;
  const idx = Math.min(Math.max(level,1),25) - 1;
  switch(tier){
    case 'T1': return CapacityTables.T1[idx];
    case 'T2': return CapacityTables.T2[idx];
    case 'T3': return CapacityTables.T3[idx];
    case 'T4': return CapacityTables.T4[idx];
    default: return 0;
  }
}

function getDHCapacity(tier, dhLevel){
  if(dhLevel < 1) return 0;
  const idx = Math.min(Math.max(dhLevel,1),25) - 1;
  const row = CapacityTables.DH[idx];
  switch(tier){
    case 'T1': return row[0];
    case 'T2': return row[1];
    case 'T3': return row[2];
    case 'T4': return row[3];
    default: return 0;
  }
}

// guildperlevel mapping (per-tier)
function guildPerLevel(tier){
  switch(tier){
    case 'T1': return 3.0;   // +3 per level
    case 'T2': return 1.5;   // +1.5 per level
    case 'T3': return 1.0;   // +1 per level
    case 'T4': return 1.0;   // +1 per level
    default: return 0;
  }
}

// card pct map
function cardPctFromLevel(cardLevel){
  switch(Number(cardLevel)){
    case 1: return 0.05;
    case 2: return 0.10;
    case 3: return 0.20;
    default: return 0;
  }
}

// talent mapping by tier
const TalentMap = {
  T1: [0.05,0.10,0.20],           // levels 1..3
  T2: [0.04,0.08,0.12,0.16,0.20],// levels 1..5
  T3: [0.04,0.08,0.12,0.16,0.20],// levels 1..5
  T4: [0.05,0.10,0.25]           // levels 1..3
};

function talentPct(tier, talentLevel){
  const lvl = Number(talentLevel);
  if(lvl <= 0) return 0;
  const arr = TalentMap[tier] || [];
  const idx = Math.min(Math.max(lvl,1),arr.length) - 1;
  return arr[idx] || 0;
}

// rounding function factory
function getRoundingFn(mode){
  switch(mode){
    case 'round': return Math.round;
    case 'ceil': return Math.ceil;
    case 'floor':
    default: return Math.floor;
  }
}

/* perBinCapacity:
   base (number), guildFlat (number), cardPct (decimal), talentPct (decimal), roundingFn
   returns integer capacity for a single bin
*/
function perBinCapacity(base, guildFlat, cardPct, talentPct, roundingFn){
  const multiplier = (1 + cardPct) * (1 + talentPct);
  const raw = (base + guildFlat) * multiplier;
  return roundingFn(raw);
}

/*
  totalCapacity(config)
  config: {
    tier: 'T1'|'T2'|'T3'|'T4',
    bins: [ { level: number (1-25), count: number >=1 }, ... ],
    guildLevel: number (0..8),
    cardLevel: number (0..3),
    talentLevel: number (0..5 maybe),
    includeDH: boolean,
    dhLevel: number (0..25),
    roundingMode: 'floor'|'round'|'ceil',
    applyGuildToDH: boolean
  }
  returns: {
    total: number,
    breakdown: { rows: [ {label, perUnit, count, subtotal} ], dhRow?: {label, perUnit, count(=1), subtotal} }
  }
*/
function totalCapacity(config){
  const roundingFn = getRoundingFn(config.roundingMode || 'floor');
  const tier = config.tier || 'T1';
  const card = cardPctFromLevel(config.cardLevel || 0);
  const talent = talentPct(tier, config.talentLevel || 0);
  const gPerLevel = guildPerLevel(tier);
  const guildFlatPerBin = gPerLevel * (config.guildLevel || 0);

  const rows = [];

  let total = 0;

  (config.bins || []).forEach((b, idx) => {
    const level = Number(b.level) || 1;
    const count = Math.max(0, Math.floor(Number(b.count) || 0));
    if(count <= 0) return;
    const base = getBaseCapacity(tier, level);
    const perUnit = perBinCapacity(base, guildFlatPerBin, card, talent, roundingFn);
    const subtotal = perUnit * count;
    rows.push({
      label: `Bin L${level}`,
      base,
      guildFlat: guildFlatPerBin,
      cardPct: card,
      talentPct: talent,
      perUnit,
      count,
      subtotal
    });
    total += subtotal;
  });

  // Dragon Hoard
  let dhRow = null;
  if(config.includeDH){
    const dhLevel = Number(config.dhLevel) || 0;
    const baseDH = getDHCapacity(tier, dhLevel);
    // apply guild on DH only if toggle says so
    const guildForDH = config.applyGuildToDH ? guildFlatPerBin : 0;
    const perUnitDH = perBinCapacity(baseDH, guildForDH, card, talent, roundingFn);
    const subtotalDH = perUnitDH; // only one DH bin possible
    dhRow = {
      label: `Dragon Hoard L${dhLevel}`,
      base: baseDH,
      guildFlat: guildForDH,
      cardPct: card,
      talentPct: talent,
      perUnit: perUnitDH,
      count: 1,
      subtotal: subtotalDH
    };
    total += subtotalDH;
  }

  return { total, breakdown: { rows, dh: dhRow } };
}


// Export for main.js
window.ResourceCalc = {
  getBaseCapacity,
  getDHCapacity,
  cardPctFromLevel,
  talentPct,
  guildPerLevel,
  totalCapacity,
  TalentMap
};
