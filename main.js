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
        binContainer.innerHTML = '';
        this.addBinRow(tier);
        
        // Update talent max level
        this.updateTalentMaxLevel(tier);
        
        // Update guild perk display
        this.updateGuildPerkDisplay();
    }

    addBinRow(tier) {
        const container = document.getElementById('bin-container');
        const row = document.createElement('div');
        row.className = 'bin-row';
        
        const maxLevel = ResourceCalculator.getMaxLevel(tier);
        const guildPerk = ResourceCalculator.getGuildPerkValue(tier, document.getElementById('guild-level').value);
        const baseValue = Data.binBaseCapacities[tier][0]; // Level 1 base
        
        row.innerHTML = `
            <select class="bin-level">
                ${this.getLevelOptions(tier)}
            </select>
            <input type="number" class="bin-count" value="1" min="1" max="99">
            <span class="bin-preview">→ ${baseValue + guildPerk} capacity</span>
            <button type="button" class="remove-bin">Remove</button>
        `;
        container.appendChild(row);

        // Add event listeners
        row.querySelector('.bin-level').addEventListener('change', (e) => {
            this.updateBinPreview(row, tier);
        });
        
        row.querySelector('.remove-bin').addEventListener('click', () => {
            if (document.querySelectorAll('.bin-row').length > 1) {
                row.remove();
            }
        });

        this.updateBinPreview(row, tier);
    }

    getLevelOptions(tier) {
        const maxLevel = ResourceCalculator.getMaxLevel(tier);
        let options = '';
        for (let i = 1; i <= maxLevel; i++) {
            const baseValue = Data.binBaseCapacities[tier][i - 1];
            options += `<option value="${i}">Level ${i} (Base: ${baseValue})</option>`;
        }
        return options;
    }

    updateBinPreview(row, tier) {
        const level = parseInt(row.querySelector('.bin-level').value);
        const guildLevel = parseInt(document.getElementById('guild-level').value);
        const baseValue = Data.binBaseCapacities[tier][level - 1];
        const guildPerk = ResourceCalculator.getGuildPerkValue(tier, guildLevel);
        const total = baseValue + guildPerk;
        
        row.querySelector('.bin-preview').textContent = `→ ${total} capacity`;
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
        
        // Update all bin previews
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
        const resultDiv = document.getElementById('result');
        const cardPercent = (result.breakdown.cardBonus * 100).toFixed(0);
        const talentPercent = (result.breakdown.talentBonus * 100).toFixed(0);
        const totalPercent = (result.breakdown.totalMultiplier * 100 - 100).toFixed(0);

        let guildInfo = '';
        if (tier === 'T4' && result.breakdown.effectiveGuildLevel < parseInt(document.getElementById('guild-level').value)) {
            guildInfo = `<p class="warning"><strong>Note:</strong> T4 Guild Perk capped at level 4</p>`;
        } else if (tier !== 'T4' && result.breakdown.effectiveGuildLevel < parseInt(document.getElementById('guild-level').value)) {
            guildInfo = `<p class="warning"><strong>Note:</strong> T1-T3 Guild Perk capped at level 8</p>`;
        }

        resultDiv.innerHTML = `
            <h3>Total Capacity: ${result.total}</h3>
            <div class="breakdown">
                <p><strong>Regular Bins:</strong> ${result.breakdown.baseBins.toFixed(1)}</p>
                <p><strong>Dragon Hoard:</strong> +${result.breakdown.dragonHoard.toFixed(1)}</p>
                <p><strong>Before Bonuses:</strong> ${result.breakdown.beforeBonuses.toFixed(1)}</p>
                <p><strong>Guild Bonus per Bin:</strong> +${result.breakdown.guildBonusPerBin}</p>
                <p><strong>Card Bonus:</strong> +${cardPercent}%</p>
                <p><strong>Talent Bonus:</strong> +${talentPercent}%</p>
                <p><strong>Total Multiplier:</strong> ×${result.breakdown.totalMultiplier.toFixed(2)} (+${totalPercent}%)</p>
                ${guildInfo}
            </div>
            <div class="formula-note">
                <strong>Formula:</strong> (Regular Bins + Dragon Hoard) × (1 + Card% + Talent%)<br>
                <em>Note: Guild perks are already included in the bin values shown above</em>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});