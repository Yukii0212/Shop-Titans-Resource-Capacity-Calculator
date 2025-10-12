import { calcTotal } from './calculator.js';

const tierInput = document.getElementById('tier');
const binLevelInput = document.getElementById('binLevel');
const binAmountInput = document.getElementById('binAmount');
const guildLevelInput = document.getElementById('guildLevel');
const cardLevelInput = document.getElementById('cardLevel');
const talentLevelInput = document.getElementById('talentLevel');
const includeDHInput = document.getElementById('includeDH');
const dhLevelInput = document.getElementById('dhLevel');
const dhLevelGroup = document.getElementById('dhLevelGroup');

const calculateBtn = document.getElementById('calculateBtn');
const totalOutput = document.getElementById('totalOutput');

// Show/hide DH level input
includeDHInput.addEventListener('change', () => {
  dhLevelGroup.style.display = includeDHInput.checked ? 'flex' : 'none';
});

calculateBtn.addEventListener('click', () => {
  const tier = tierInput.value;
  const binLevel = parseInt(binLevelInput.value);
  const binAmount = parseInt(binAmountInput.value);
  const guildLevel = parseInt(guildLevelInput.value);
  const cardLevel = parseInt(cardLevelInput.value);
  const talentLevel = parseInt(talentLevelInput.value);
  const includeDH = includeDHInput.checked;
  const dhLevel = parseInt(dhLevelInput.value);

  const total = calcTotal(tier, binLevel, binAmount, guildLevel, cardLevel, talentLevel, includeDH, dhLevel);
  totalOutput.textContent = total;
});
