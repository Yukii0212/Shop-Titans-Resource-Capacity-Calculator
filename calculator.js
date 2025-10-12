class ResourceCalculator {
    static calculate(tier, bins, guildLevel, cardLevel, talentLevel, dragonHoardLevel) {
        // Sum base capacities of all bins
        let totalBase = 0;
        bins.forEach(bin => {
            totalBase += Data.binCapacities[tier][bin.level - 1] * bin.count;
        });

        // Calculate guild bonus
        const guildBonus = Data.guildPerks[tier] * guildLevel * bins.reduce((sum, bin) => sum + bin.count, 0);

        // Get card multiplier
        const cardMultiplier = Data.cards[cardLevel] || 0;

        // Get talent multiplier  
        const talentMultiplier = Data.talents[tier][talentLevel - 1] || 0;

        // Get dragon hoard bonus
        const dhIndex = tier === 'T1' ? 0 : tier === 'T2' ? 1 : tier === 'T3' ? 2 : 3;
        const dragonHoardBonus = Data.dragonHoard[dragonHoardLevel - 1]?.[dhIndex] || 0;

        // Apply formula (we'll use the most common pattern for now)
        const subtotal = Math.floor((totalBase + guildBonus) * (1 + cardMultiplier + talentMultiplier));
        
        return {
            total: subtotal + dragonHoardBonus,
            breakdown: {
                base: totalBase,
                guildBonus: guildBonus,
                cardBonus: cardMultiplier,
                talentBonus: talentMultiplier,
                dragonHoard: dragonHoardBonus,
                subtotal: subtotal
            }
        };
    }

    static getMaxLevel(tier) {
        return Data.binCapacities[tier].length;
    }

    static getTalentMaxLevel(tier) {
        return Data.talents[tier].length;
    }
}