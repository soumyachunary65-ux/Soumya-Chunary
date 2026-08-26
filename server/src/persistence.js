/**
 * DREXVIA - Persistent Accounts & Progression Store
 * Developer: Soumya Chunary Studios
 */

const { GLOBAL_CLANS } = require('../../shared/constants');

class PersistenceManager {
  constructor() {
    this.profiles = new Map(); // username/id -> profile object
    this.clanLeaderboard = [...GLOBAL_CLANS];
  }

  getOrCreateProfile(username = 'Operative_Echo') {
    if (!this.profiles.has(username)) {
      this.profiles.set(username, {
        username: username,
        clanTag: '[SCS]',
        selectedClass: 'commando',
        level: 14,
        xp: 3200,
        nextLevelXp: 5000,
        matchesPlayed: 48,
        matchesWon: 31,
        kills: 184,
        monsterKills: 312,
        bossesDefeated: 9,
        survivedSeconds: 24800,
        highestHordeWave: 29,
        achievements: ['first_blood', 'titan_slayer', 'extraction_master'],
        discoveredLore: ['lore_01', 'lore_02', 'lore_03'],
        inventory: [
          { id: 'ammo_rifle', qty: 120 },
          { id: 'cloth', qty: 6 },
          { id: 'antiseptic', qty: 4 }
        ],
        settings: {
          masterVol: 0.8,
          sfxVol: 0.9,
          micGain: 1.0,
          fov: 75,
          mouseSensitivity: 1.2
        }
      });
    }
    return this.profiles.get(username);
  }

  getClanLeaderboard() {
    // Sort clans by highest horde wave then reputation
    return this.clanLeaderboard.sort((a, b) => b.highestHordeWave - a.highestHordeWave || b.reputationScore - a.reputationScore);
  }

  submitHordeWave(username, clanTag, waveReached, mutantsKilled) {
    const profile = this.getOrCreateProfile(username);
    if (waveReached > (profile.highestHordeWave || 0)) {
      profile.highestHordeWave = waveReached;
    }
    profile.monsterKills += mutantsKilled;

    // Update or find clan in leaderboard
    let clan = this.clanLeaderboard.find(c => c.tag === clanTag);
    if (!clan) {
      clan = {
        id: `clan_${Date.now()}`,
        tag: clanTag || '[RECON]',
        name: `${username}'s Squad`,
        region: 'GLOBAL',
        membersCount: 4,
        highestHordeWave: waveReached,
        totalMutantsPurged: mutantsKilled,
        apexTitansSlain: Math.floor(waveReached / 5),
        reputationScore: waveReached * 1200 + mutantsKilled * 15
      };
      this.clanLeaderboard.push(clan);
    } else {
      if (waveReached > clan.highestHordeWave) {
        clan.highestHordeWave = waveReached;
      }
      clan.totalMutantsPurged += mutantsKilled;
      clan.reputationScore += waveReached * 800 + mutantsKilled * 10;
    }

    return this.getClanLeaderboard();
  }

  awardMatchStats(username, matchData) {
    const p = this.getOrCreateProfile(username);
    p.matchesPlayed++;
    if (matchData.isWinner) p.matchesWon++;
    p.kills += matchData.kills || 0;
    p.monsterKills += matchData.monsterKills || 0;
    p.bossesDefeated += matchData.bossesDefeated || 0;
    p.survivedSeconds += matchData.survivalTime || 0;

    // XP calculation
    const earnedXp = (matchData.kills * 100) + (matchData.monsterKills * 50) + (matchData.bossesDefeated * 500) + (matchData.survivalTime * 2);
    p.xp += earnedXp;

    while (p.xp >= p.nextLevelXp) {
      p.xp -= p.nextLevelXp;
      p.level++;
      p.nextLevelXp = Math.floor(p.nextLevelXp * 1.35);
    }

    return { profile: p, earnedXp };
  }
}

module.exports = PersistenceManager;
