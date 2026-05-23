class App {
    constructor() {
        this.initializeEventListeners();
        this.initializeDragonHoardOptions();
        this.addBinRow('T1');
        this.updateTalentMaxLevel('T1');
        this.updateGuildPerkDisplay();
    }

    initializeEventListeners() {
        // Tier selection
        document.getElementById('tier').addEventListener('change', (e) => {
            this.onTierChange(e.target.value);
        });

        // Guild level selection
        document.getElementById('guild-level').addEventListener('change', (e) => {
            this.updateGuildPerkDisplay();
        });

        // Form submission
        document.getElementById('calculator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });

        // Add bin button
        document.getElementById('add-bin').addEventListener('click', () => {
            this.addBinRow(document.getElementById('tier').value);
        });
    }

    initializeDragonHoardOptions() {
        const select = document.getElementById('dragon-level');
        select.innerHTML = '<option value="0">No Dragon Hoard</option>';
        for (let i = 1; i <= 25; i++) {
            const selected = i === 18 ? 'selected' : '';
            select.innerHTML += `<option value="${i}" ${selected}>Level ${i}</option>`;
        }
    }

    onTierChange(tier) {
        // Update bin rows for new tier
        const binContainer = document.getElementById('bin-container');
        const dragonSelect = document.getElementById('dragon-level');
        const addButton = document.getElementById('add-bin');
        const cardGroup = document.getElementById('card-level').parentElement;

        if (tier === 'Stardust') {
            dragonSelect.value = '0';
            dragonSelect.disabled = true;
            addButton.style.display = 'none';
            cardGroup.style.display = 'none';
        } else {
            dragonSelect.disabled = false;
            addButton.style.display = 'block';
            cardGroup.style.display = 'block';
        }

        binContainer.innerHTML = '';
        this.addBinRow(tier);
        
        // Update talent max level
        this.updateTalentMaxLevel(tier);
        
        // Update guild perk options based on tier
        this.updateGuildPerkOptions(tier);
        
        // Update guild perk display
        this.updateGuildPerkDisplay();
    }

    updateGuildPerkOptions(tier) {
        const guildSelect = document.getElementById('guild-level');
        const currentValue = parseInt(guildSelect.value);

        // Get max level from data.js
        const maxLevel = Data.guildLevelCaps[tier];

        // Start with level 0
        guildSelect.innerHTML =
            '<option value="0">0 (+0)</option>';

        // Generate levels automatically
        for (let i = 1; i <= maxLevel; i++) {
            const selected =
                (currentValue === i) ||
                (currentValue > maxLevel && i === maxLevel);

            guildSelect.innerHTML += `
                <option value="${i}" ${selected ? 'selected' : ''}>
                    ${i}${i === maxLevel ? ' (Max)' : ''}
                </option>
            `;
        }

        // Clamp value if current exceeds cap
        if (currentValue > maxLevel) {
            guildSelect.value = maxLevel;
        }
    }

    addBinRow(tier) {
        const container = document.getElementById('bin-container');

        // Count only bins inside container
        const existingBins =
            container.querySelectorAll('.bin-row').length;

        // Stardust only allows one bin
        if (
            tier === 'Stardust' &&
            existingBins >= 1
        ) {
            return;
        }

        const row = document.createElement('div');
        row.className = 'bin-row';

        const maxLevel = ResourceCalculator.getMaxLevel(tier);

        row.innerHTML = `
            <div class="bin-controls">
                <div class="bin-level-group">
                    <label>Bin Level:</label>
                    <select class="bin-level">
                        ${this.getLevelOptions(tier)}
                    </select>
                </div>

                <div class="bin-count-group">
                    <label>Quantity:</label>

                    <input
                        type="number"
                        class="bin-count"
                        value="1"
                        min="1"
                        max="${tier === 'Stardust' ? '1' : '99'}"
                        ${tier === 'Stardust' ? 'readonly' : ''}
                    >
                </div>

                <button type="button" class="remove-bin">
                    Remove
                </button>
            </div>
        `;

        container.appendChild(row);

        // Bin level changes
        row.querySelector('.bin-level').addEventListener(
            'change',
            () => {
                this.updateBinPreview(row, tier);
            }
        );

        // Remove button
        row.querySelector('.remove-bin').addEventListener(
            'click',
            () => {
                const totalBins =
                    container.querySelectorAll('.bin-row').length;

                // Never allow removing the last bin
                if (totalBins > 1) {
                    row.remove();
                }
            }
        );

        this.updateBinPreview(row, tier);
    }

    getLevelOptions(tier) {
        const maxLevel = ResourceCalculator.getMaxLevel(tier);
        let options = '';
        for (let i = 1; i <= maxLevel; i++) {
            const baseValue = Data.binBaseCapacities[tier][i - 1];
            const guildPerk = ResourceCalculator.getGuildPerkValue(tier, document.getElementById('guild-level').value);
            const totalCapacity = baseValue + guildPerk;
            options += `<option value="${i}">Level ${i} (Capacity: ${totalCapacity})</option>`;
        }
        return options;
    }

    updateBinPreview(row, tier) {
        const level = parseInt(row.querySelector('.bin-level').value);
        const guildLevel = parseInt(document.getElementById('guild-level').value);
        const baseValue = Data.binBaseCapacities[tier][level - 1];
        const guildPerk = ResourceCalculator.getGuildPerkValue(tier, guildLevel);
        const total = baseValue + guildPerk;
        
        // Update the option text to show current capacity
        const select = row.querySelector('.bin-level');
        const currentOption = select.options[select.selectedIndex];
        currentOption.text = `Level ${level} (Capacity: ${total})`;
    }

    updateTalentMaxLevel(tier) {
        const talentSelect = document.getElementById('talent-level');
        const maxLevel = ResourceCalculator.getTalentMaxLevel(tier);
        
        talentSelect.innerHTML = '<option value="0">Level 0 (+0%)</option>';
        for (let i = 1; i <= maxLevel; i++) {
            const bonus = Data.talents[tier][i - 1] * 100;
            talentSelect.innerHTML += `<option value="${i}" ${i === maxLevel ? 'selected' : ''}>Level ${i} (+${bonus}%)</option>`;
        }
    }

    updateGuildPerkDisplay() {
        const tier = document.getElementById('tier').value;
        const guildLevel = parseInt(document.getElementById('guild-level').value);
        const guildPerk = ResourceCalculator.getGuildPerkValue(tier, guildLevel);
        
        // Update all bin level dropdowns to show current capacities
        document.querySelectorAll('.bin-row').forEach(row => {
            this.updateBinPreview(row, tier);
        });
    }

    calculate() {
        const tier = document.getElementById('tier').value;
        const guildLevel = parseInt(document.getElementById('guild-level').value);
        const cardLevel = parseInt(document.getElementById('card-level').value);
        const talentLevel = parseInt(document.getElementById('talent-level').value);
        const dragonHoardLevel = parseInt(document.getElementById('dragon-level').value);

        // Collect bin data
        const bins = [];
        document.querySelectorAll('.bin-row').forEach(row => {
            const level = parseInt(row.querySelector('.bin-level').value);
            const count = parseInt(row.querySelector('.bin-count').value);
            if (count > 0) {
                bins.push({ level, count });
            }
        });

        if (bins.length === 0) {
            alert('Please add at least one bin');
            return;
        }

        const result = ResourceCalculator.calculate(tier, bins, guildLevel, cardLevel, talentLevel, dragonHoardLevel);
        this.displayResult(result, tier);
    }

    displayResult(result, tier) {
        const threshold25 = result.total / 4;
        const preThreshold25 = result.total - threshold25;
        const resultDiv = document.getElementById('result');
        const cardPercent = (result.breakdown.cardBonus * 100).toFixed(0);
        const talentPercent = (result.breakdown.talentBonus * 100).toFixed(0);

        let guildInfo = '';
        if (tier === 'T4' && result.breakdown.effectiveGuildLevel < parseInt(document.getElementById('guild-level').value)) {
            guildInfo = `<p class="warning"><strong>Note:</strong> T4 Guild Perk capped at level 4</p>`;
        } else if (tier !== 'T4' && result.breakdown.effectiveGuildLevel < parseInt(document.getElementById('guild-level').value)) {
            guildInfo = `<p class="warning"><strong>Note:</strong> T1-T3 Guild Perk capped at level 8</p>`;
        }

        resultDiv.innerHTML = `
            <h3>Total Capacity: ${result.total}</h3>
            ${tier !== 'Stardust' ? `
            <h2>Usable Resource (Without triggering worker refills):
            <span style="color: #7fd49a;">${preThreshold25}</span></h2>

            <h2>May trigger worker refills if you go below this amount:
            <span style="color: #b0002a;">${threshold25}</span></h2>
            ` : ''}
            <div class="breakdown">
                <p><strong>Regular Bins:</strong> ${result.breakdown.baseBins.toFixed(1)}</p>
                <p><strong>Dragon Hoard:</strong> +${result.breakdown.dragonHoard.toFixed(1)}</p>
                <p><strong>Before Bonuses:</strong> ${result.breakdown.beforeBonuses.toFixed(1)}</p>
                <p><strong>After Talent +${talentPercent}%:</strong> ${result.breakdown.afterTalent.toFixed(1)}</p>
                ${tier !== 'Stardust'
                ? `<p><strong>After Card +${cardPercent}%:</strong>
                ${result.breakdown.afterCard.toFixed(1)}</p>`
                : ''}
                <p><strong>Guild Bonus per Bin:</strong> +${result.breakdown.guildBonusPerBin}</p>
                ${guildInfo}
            </div>
            <div class="formula-note">
                <strong>Formula:</strong> [ (Base Bins + Guild Perks) + (Dragon Hoard Base + Guild Perks) ] × (1 + Talent%) × (1 + Card%)<br>
                <em>Guild perks are applied to both regular bins and Dragon Hoard separately, then talent bonus applied first, then card bonus</em>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});