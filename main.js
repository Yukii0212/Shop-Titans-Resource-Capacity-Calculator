import { calculateBin, calculateDH } from "./calculator.js";

const tierSelect = document.getElementById("tierSelect");
const cardLevel = document.getElementById("cardLevel");
const guildLevel = document.getElementById("guildLevel");
const guildValue = document.getElementById("guildValue");
const talentLevel = document.getElementById("talentLevel");
const talentValue = document.getElementById("talentValue");
const roundingMode = document.getElementById("roundingMode");
const applyGuildToDH = document.getElementById("applyGuildToDH");
const binsContainer = document.getElementById("binsContainer");
const addBinBtn = document.getElementById("addBinBtn");
const clearBinsBtn = document.getElementById("clearBinsBtn");
const includeDH = document.getElementById("includeDH");
const dhSection = document.getElementById("dhSection");
const dhLevel = document.getElementById("dhLevel");
const dhValue = document.getElementById("dhValue");
const totalResource = document.getElementById("totalResource");
const toggleBreakdown = document.getElementById("toggleBreakdown");
const breakdownDiv = document.getElementById("breakdown");

let bins = [];

function updateTalentMax() {
  const tier = tierSelect.value;
  const max = tier === "T1" || tier === "T4" ? 3 : 5;
  talentLevel.max = max;
  if (parseInt(talentLevel.value) > max) {
    talentLevel.value = max;
    talentValue.textContent = max;
  }
}

function addBin(level = 1, count = 1) {
  const bin = document.createElement("div");
  bin.className = "bin";

  const levelLabel = document.createElement("label");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 1;
  slider.max = 25;
  slider.value = level;
  const levelSpan = document.createElement("span");
  levelSpan.textContent = level;

  slider.addEventListener("input", () => {
    levelSpan.textContent = slider.value;
    calculate();
  });

  const countInput = document.createElement("input");
  countInput.type = "number";
  countInput.min = 1;
  countInput.value = count;
  countInput.addEventListener("input", calculate);

  levelLabel.textContent = "Level: ";
  bin.append(levelLabel, slider, levelSpan, document.createTextNode("  Count:"), countInput);

  binsContainer.appendChild(bin);
  bins.push({ slider, countInput });
  calculate();
}

function clearBins() {
  bins = [];
  binsContainer.innerHTML = "";
  calculate();
}

function calculate() {
  const tier = tierSelect.value;
  const guild = parseInt(guildLevel.value);
  const card = parseInt(cardLevel.value);
  const talent = parseInt(talentLevel.value);
  const rounding = roundingMode.value;
  const applyGuild = applyGuildToDH.checked;

  let total = 0;
  let breakdown = [];

  bins.forEach((binObj, i) => {
    const lvl = parseInt(binObj.slider.value);
    const cnt = parseInt(binObj.countInput.value);
    const perBin = calculateBin(tier, lvl, guild, card, talent, rounding);
    const subtotal = perBin * cnt;
    breakdown.push(`Bin ${i+1}: level ${lvl}, count ${cnt}, per bin ${perBin}, subtotal ${subtotal}`);
    total += subtotal;
  });

  if (includeDH.checked && parseInt(dhLevel.value) > 0) {
    const dhLvl = parseInt(dhLevel.value);
    const dhAmount = [0,1,2,3,4].map((t,i)=>calculateDH(i,dhLvl,guild,card,talent,rounding,applyGuild));
    const tierIndex = parseInt(tier.substring(1)) - 1;
    total += dhAmount[tierIndex];
    breakdown.push(`Dragon Hoard: level ${dhLvl}, adds ${dhAmount[tierIndex]} to ${tier}`);
  }

  totalResource.textContent = total;
  breakdownDiv.innerHTML = breakdown.join("<br>");
}

guildLevel.addEventListener("input", () => {
  guildValue.textContent = guildLevel.value;
  calculate();
});

talentLevel.addEventListener("input", () => {
  talentValue.textContent = talentLevel.value;
  calculate();
});

tierSelect.addEventListener("change", () => {
  updateTalentMax();
  calculate();
});

includeDH.addEventListener("change", () => {
  dhSection.classList.toggle("hidden", !includeDH.checked);
  calculate();
});

dhLevel.addEventListener("input", () => {
  dhValue.textContent = dhLevel.value;
  calculate();
});

addBinBtn.addEventListener("click", () => addBin());
clearBinsBtn.addEventListener("click", clearBins);
toggleBreakdown.addEventListener("click", () => breakdownDiv.classList.toggle("hidden"));

updateTalentMax();
calculate();
