// Base capacities for tiers
export const baseCaps = {
  T1: [35,41,47,53,59,65,77,89,101,113,125,145,165,185,205,225,250,275,300,325,350,380,410,440,470],
  T2: [15,18,21,24,27,30,36,42,48,54,60,68,76,84,92,100,110,120,130,140,150,162,174,186,198],
  T3: [8,10,12,14,16,18,21,24,27,30,33,37,41,45,49,53,58,63,68,73,78,84,90,96,102],
  T4: [5,6,7,8,9,10,12,14,16,18,20,23,26,29,32,35,40,45,50,55,60,66,72,78,84]
};

// Guild perk boosts per tier (per level)
export const guildBoosts = {
  T1: 3,
  T2: 1.5,
  T3: 1,
  T4: 1
};

// TCG card %
export const cardPct = [0,0.05,0.10,0.20];

// Crafting talent %
export const talentPct = {
  T1: [0,0.05,0.10,0.20],
  T2: [0,0.04,0.08,0.12,0.16,0.20],
  T3: [0,0.04,0.08,0.12,0.16,0.20],
  T4: [0,0.05,0.10,0.25]
};

// Dragon Hoard table by tier [T1,T2,T3,T4] per level
export const dragonHoard = [
  [10,0,0,0],
  [12,0,0,0],
  [14,0,0,0],
  [16,0,0,0],
  [18,0,0,0],
  [20,10,0,0],
  [24,12,0,0],
  [28,14,0,0],
  [32,16,0,0],
  [36,18,0,0],
  [40,20,10,0],
  [46,22,12,0],
  [52,24,12,0],
  [58,26,13,0],
  [64,28,14,0],
  [70,30,15,1],
  [78,33,17,2],
  [86,36,19,3],
  [94,39,21,4],
  [102,42,23,5],
  [110,45,25,6],
  [120,49,28,8],
  [130,53,31,10],
  [140,57,34,12],
  [150,61,37,14]
];

// Calculate total resource
export function calcTotal(tier, binLevel, binAmount, guildLevel, cardLevel, talentLevel, includeDH=false, dhLevel=1) {
  const base = baseCaps[tier][binLevel-1] * binAmount;
  const guild = guildBoosts[tier] * guildLevel * binAmount;
  const totalBase = base + guild;

  const card = cardPct[cardLevel];
  const talent = talentPct[tier][talentLevel];

  let total = totalBase * (1 + card + talent);

  if(includeDH){
    const dhIndex = dhLevel -1;
    const dhContribution = dragonHoard[dhIndex][["T1","T2","T3","T4"].indexOf(tier)];
    total += dhContribution * (1 + card + talent);
  }

  return Math.round(total);
}
