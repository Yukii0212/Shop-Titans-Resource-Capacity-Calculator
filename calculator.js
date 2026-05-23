class ResourceCalculator {
    static calculate(tier, bins, guildLevel, cardLevel, talentLevel, dragonHoardLevel) {
        // Apply guild perk limits
        let effectiveGuildLevel = Math.min(
            guildLevel,
            Data.guildLevelCaps[tier]
        );

        // Calculate total base capacity from regular bins (including guild perks)
        let totalBaseCapacity = 0;
        bins.forEach(bin => {
            const baseValue = Data.binBaseCapacities[tier][bin.level - 1];
            const guildBonus = Data.guildPerks[tier] * effectiveGuildLevel;
            const binTotal = baseValue + guildBonus;
            totalBaseCapacity += binTotal * bin.count;
        });

        // Calculate Dragon Hoard capacity (including guild perks)
        let dragonHoardCapacity = 0;
        if (tier !== 'Stardust' && dragonHoardLevel > 0) {
            const dhIndex = tier === 'T1' ? 0 : tier === 'T2' ? 1 : tier === 'T3' ? 2 : 3;
            const dragonHoardBase = Data.dragonHoardBase[dragonHoardLevel - 1]?.[dhIndex] || 0;
            const dragonHoardGuildBonus = Data.guildPerks[tier] * effectiveGuildLevel;
            dragonHoardCapacity = dragonHoardBase + dragonHoardGuildBonus;
        }

        // Get bonus multipliers
        const cardMultiplier =
            tier === 'Stardust'
                ? 0
                : Data.cards[cardLevel] || 0;
        const talentMultiplier = talentLevel === 0 ? 0 : Data.talents[tier][talentLevel - 1] || 0;

        // Apply formula sequentially: (All Base + Guild + DH) × (1 + Talent%) × (1 + Card%)
        const beforeBonuses = totalBaseCapacity + dragonHoardCapacity;
        const afterTalent = beforeBonuses * (1 + talentMultiplier);
        const afterCard = afterTalent * (1 + cardMultiplier);
        const totalCapacity = Math.floor(afterCard);

        return {
            total: totalCapacity,
            breakdown: {
                baseBins: totalBaseCapacity,
                dragonHoard: dragonHoardCapacity,
                beforeBonuses: beforeBonuses,
                afterTalent: afterTalent,
                afterCard: afterCard,
                cardBonus: cardMultiplier,
                talentBonus: talentMultiplier,
                effectiveGuildLevel: effectiveGuildLevel,
                guildBonusPerBin: Data.guildPerks[tier] * effectiveGuildLevel
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
        let effectiveLevel = Math.min(
            level,
            Data.guildLevelCaps[tier]
        );
        
        return Data.guildPerks[tier] * effectiveLevel;
    }

    static getDragonHoardBase(tier, level) {
        const dhIndex = tier === 'T1' ? 0 : tier === 'T2' ? 1 : tier === 'T3' ? 2 : 3;
        return Data.dragonHoardBase[level - 1]?.[dhIndex] || 0;
    }
}