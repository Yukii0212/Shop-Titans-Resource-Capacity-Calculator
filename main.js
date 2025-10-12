class App {
    constructor() {
        this.initializeEventListeners();
        this.addBinRow('T1'); // Default tier
    }

    initializeEventListeners() {
        // Tier selection
        document.getElementById('tier').addEventListener('change', (e) => {
            this.onTierChange(e.target.value);
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

    onTierChange(tier) {
        // Update bin rows for new tier
        const binContainer = document.getElementById('bin-container');
        binContainer.innerHTML = '';
        this.addBinRow(tier);
        
        // Update talent max level
        this.updateTalentMaxLevel(tier);
    }

    addBinRow(tier) {
        const container = document.getElementById('bin-container');
        const row = document.createElement('div');
        row.className = 'bin-row';
        row.innerHTML = `
            <select class="bin-level">
                ${this.getLevelOptions(tier)}
            </select>
            <input type="number" class="bin-count" value="1" min="1" max="99">
            <button type="button" class="remove-bin">Remove</button>
        `;
        container.appendChild(row);

        // Add remove event listener
        row.querySelector('.remove-bin').addEventListener('click', () => {
            if (document.querySelectorAll('.bin-row').length > 1) {
                row.remove();
            }
        });
    }

    getLevelOptions(tier) {
        const maxLevel = ResourceCalculator.getMaxLevel(tier);
        let options = '';
        for (let i = 1; i <= maxLevel; i++) {
            options += `<option value="${i}">Level ${i}</option>`;
        }
        return options;
    }

    updateTalentMaxLevel(tier) {
        const talentSelect = document.getElementById('talent-level');
        const maxLevel = ResourceCalculator.getTalentMaxLevel(tier);
        
        talentSelect.innerHTML = '';
        for (let i = 1; i <= maxLevel; i++) {
            talentSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
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
            bins.push({ level, count });
        });

        const result = ResourceCalculator.calculate(tier, bins, guildLevel, cardLevel, talentLevel, dragonHoardLevel);
        this.displayResult(result);
    }

    displayResult(result) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <h3>Total Capacity: ${result.total}</h3>
            <div class="breakdown">
                <p>Base: ${result.breakdown.base}</p>
                <p>Guild Bonus: +${result.breakdown.guildBonus}</p>
                <p>Card Bonus: +${(result.breakdown.cardBonus * 100).toFixed(0)}%</p>
                <p>Talent Bonus: +${(result.breakdown.talentBonus * 100).toFixed(0)}%</p>
                <p>Dragon Hoard: +${result.breakdown.dragonHoard}</p>
                <p><strong>Subtotal: ${result.breakdown.subtotal}</strong></p>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});