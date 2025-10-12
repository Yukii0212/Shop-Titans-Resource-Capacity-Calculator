// --- Base bin capacities ---
const baseCapacities = {
  T1: [35,41,47,53,59,65,77,89,101,113,125,145,165,185,205,225,250,275,300,325,350,380,410,440,470],
  T2: [15,18,21,24,27,30,36,42,48,54,60,68,76,84,92,100,110,120,130,140,150,162,174,186,198],
  T3: [8,10,12,14,16,18,21,24,27,30,33,37,41,45,49,53,58,63,68,73,78,84,90,96,102],
  T4: [5,6,7,8,9,10,12,14,16,18,20,23,26,29,32,35,40,45,50,55,60,66,72,78,84]
};

// --- Dragon Hoard capacities per tier ---
const dragonHoard = [
  [10,12,14,16,18,20,24,28,32,36,40,46,52,58,64,70,78,86,94,102,110,120,130,140,150], // T1
  [0,0,0,0,0,10,12,14,16,18,20,22,24,26,28,30,33,36,39,42,45,49,53,57,61], // T2
  [0,0,0,0,0,0,0,0,0,0,10,11,12,13,14,15,17,19,21,23,25,28,31,34,37], // T3
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,8,10,12,14] // T4
];

// --- Guild perks flat bonus ---
const guildFlat = { T1: 3, T2: 1.5, T3: 1, T4: 1 };

// --- Card % boosts ---
const cardBoosts = { 0: 0, 1: 0.05, 2: 0.10, 3: 0.20 };

// --- Talent % boosts per tier ---
const talentBoosts = {
  T1: [0, 0.05, 0.10, 0.20],
  T2: [0, 0.04, 0.08, 0.12, 0.16, 0.20],
  T3: [0, 0.04, 0.08, 0.12, 0.16, 0.20],
  T4: [0, 0.05, 0.10, 0.25]
};

// --- Calculation function ---
function calculateBin(tier, level, guildLevel, cardLevel, talentLevel, roundingMode) {
  const base = baseCapacities[tier][level - 1];
  const guildBonus = guildLevel * guildFlat[tier];
  const cardMultiplier = 1 + cardBoosts[cardLevel];
  const talentMultiplier = 1 + talentBoosts[tier][talentLevel];

  let result = (base + guildBonus) * cardMultiplier * talentMultiplier;

  if (roundingMode === "floor") result = Math.floor(result);
  if (roundingMode === "ceil") result = Math.ceil(result);
  if (roundingMode === "round") result = Math.round(result);

  return result;
}

function calculateDH(tier, level, guildLevel, cardLevel, talentLevel, roundingMode, applyGuild) {
  const dhBase = dragonHoard[tier][level - 1];
  const guildBonus = applyGuild ? guildLevel * guildFlat[`T${tier + 1}`] : 0;
  const cardMultiplier = 1 + cardBoosts[cardLevel];
  const talentMultiplier = 1 + talentBoosts[`T${tier + 1}`][talentLevel];

  let result = (dhBase + guildBonus) * cardMultiplier * talentMultiplier;

  if (roundingMode === "floor") result = Math.floor(result);
  if (roundingMode === "ceil") result = Math.ceil(result);
  if (roundingMode === "round") result = Math.round(result);

  return result;
}

export { calculateBin, calculateDH };
