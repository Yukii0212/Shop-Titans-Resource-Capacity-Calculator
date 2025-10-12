class ResourceCalculator {
    static calculate(tier, bins, guildLevel, cardLevel, talentLevel, dragonHoardLevel) {
        // Calculate total base capacity from regular bins (including guild perks)
        let totalBaseCapacity = 0;
        bins.forEach(bin => {
            const baseValue = Data.binBaseCapacities[tier][bin.level - 1];
            const guildBonus = Data.guildPerks[tier] * guildLevel;
            const binTotal = baseValue + guildBonus;
            totalBaseCapacity += binTotal * bin.count;
        });

        // Calculate Dragon Hoard capacity (including guild perks)
        const dhIndex = tier === 'T1' ? 0 : tier === 'T2' ? 1 : tier === 'T3' ? 2 : 3;
        const dragonHoardBase = Data.dragonHoardBase[dragonHoardLevel - 1]?.[dhIndex] || 0;
        const dragonHoardGuildBonus = Data.guildPerks[tier] * guildLevel;
        const dragonHoardCapacity = dragonHoardBase + dragonHoardGuildBonus;

        // Get bonus multipliers
        const cardMultiplier = Data.cards[cardLevel] || 0;
        const talentMultiplier = Data.talents[tier][talentLevel - 1] || 0;
        const totalMultiplier = 1 + cardMultiplier + talentMultiplier;

        // Apply formula: (All visible values) × (1 + Card% + Talent%)
        const totalCapacity = Math.floor((totalBaseCapacity + dragonHoardCapacity) * totalMultiplier);

        return {
            total: totalCapacity,
            breakdown: {
                baseBins: totalBaseCapacity,
                dragonHoard: dragonHoardCapacity,
                cardBonus: cardMultiplier,
                talentBonus: talentMultiplier,
                totalMultiplier: totalMultiplier,
                beforeBonuses: totalBaseCapacity + dragonHoardCapacity
            }
        };
    }

    static getMaxLevel(tier) {
        return Data.binBaseCapacities[tier].length;
    }

    static getTalentMaxLevel(tier) {
        return Data.talents[tier].length;
    }

    static getGuildPerkValue(tier, level) {
        return Data.guildPerks[tier] * level;
    }

    static getDragonHoardBase(tier, level) {
        const dhIndex = tier === 'T1' ? 0 : tier === 'T2' ? 1 : tier === 'T3' ? 2 : 3;
        return Data.dragonHoardBase[level - 1]?.[dhIndex] || 0;
    }
}