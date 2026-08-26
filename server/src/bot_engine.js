/**
 * DREXVIA - High Performance AI Bot Engine
 * Developer: Soumya Chunary Studios
 */

const { BOT_PERSONALITIES, WEAPONS, CONFIG } = require('../../shared/constants');

const BOT_NAMES = [
  'Vanguard_01', 'Wraith_Echo', 'Spectre_9', 'Ghost_Stalker', 'Raven_K',
  'Titan_Bravo', 'Recon_Fox', 'Shadow_Lynx', 'Apex_Sentry', 'Cyber_Hound',
  'Iron_Wolf', 'Valkyrie_7', 'Havoc_Zero', 'Frost_Bite', 'Night_Hawk',
  'Omega_Ranger', 'Cobra_Unit', 'Phantom_Six', 'Bio_Enforcer', 'Vector_Nine'
];

class BotEngine {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.bots = new Map(); // botId -> BotEntity
    this.personalityKeys = Object.keys(BOT_PERSONALITIES);
  }

  spawnBots(count, matchId) {
    const spawned = [];
    for (let i = 0; i < count; i++) {
      const botId = `bot_${matchId}_${i + 1}`;
      const nameIndex = i % BOT_NAMES.length;
      const personalityKey = this.personalityKeys[i % this.personalityKeys.length];
      const personality = BOT_PERSONALITIES[personalityKey];

      // Spawn in perimeter zones
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const radius = 60 + (Math.random() * 120);
      const posX = Math.cos(angle) * radius;
      const posZ = Math.sin(angle) * radius;

      const bot = {
        id: botId,
        isBot: true,
        name: `${BOT_NAMES[nameIndex]}_#${i + 1}`,
        personalityType: personalityKey,
        personality: personality,
        matchId: matchId,
        health: 100,
        maxHealth: 100,
        armor: 50,
        isAlive: true,
        position: { x: posX, y: 0.9, z: posZ },
        rotation: { yaw: Math.random() * Math.PI * 2, pitch: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        state: 'EXPLORING', // 'EXPLORING', 'COMBAT', 'LOOTING', 'COVER', 'REVIVING', 'RETREATING'
        currentWeapon: Math.random() > 0.5 ? 'rifle' : 'shotgun',
        ammo: { pistol: 60, shotgun: 24, rifle: 90, sniper: 15, flamer: 100 },
        clip: 30,
        target: null, // target entity { id, type, position }
        targetLastSeen: 0,
        lastFireTime: 0,
        actionTimer: 0,
        waypoint: { x: (Math.random() * 200 - 100), z: (Math.random() * 200 - 100) },
        kills: 0,
        damageDealt: 0,
        squadId: `squad_bot_${Math.floor(i / CONFIG.SQUAD_SIZE) + 1}`
      };

      this.bots.set(botId, bot);
      spawned.push(bot);
    }
    return spawned;
  }

  update(delta, allPlayers, allMonsters) {
    const now = Date.now();

    for (const bot of this.bots.values()) {
      if (!bot.isAlive) continue;

      bot.actionTimer += delta;

      // 1. Perception: Detect nearby threats (players or monsters)
      this.evaluateSensoryPerception(bot, allPlayers, allMonsters, now);

      // 2. Decision Tree State Machine
      switch (bot.state) {
        case 'COMBAT':
          this.executeCombatBehavior(bot, delta, now);
          break;
        case 'LOOTING':
          this.executeLootingBehavior(bot, delta);
          break;
        case 'COVER':
          this.executeCoverBehavior(bot, delta);
          break;
        case 'EXPLORING':
        default:
          this.executeExplorationBehavior(bot, delta);
          break;
      }
    }
  }

  evaluateSensoryPerception(bot, allPlayers, allMonsters, now) {
    let closestThreat = null;
    let closestDist = 45; // Sight range

    // Check player threats
    for (const player of allPlayers) {
      if (!player.isAlive || player.id === bot.id || player.squadId === bot.squadId) continue;
      const dx = player.position.x - bot.position.x;
      const dz = player.position.z - bot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < closestDist) {
        closestDist = dist;
        closestThreat = { id: player.id, type: 'player', position: player.position, entity: player };
      }
    }

    // Check monster threats
    if (!closestThreat) {
      for (const monster of allMonsters) {
        if (!monster.isAlive) continue;
        const dx = monster.position.x - bot.position.x;
        const dz = monster.position.z - bot.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 35) {
          closestDist = dist;
          closestThreat = { id: monster.id, type: 'monster', position: monster.position, entity: monster };
        }
      }
    }

    if (closestThreat) {
      bot.target = closestThreat;
      bot.targetLastSeen = now;
      bot.state = 'COMBAT';
    } else if (now - bot.targetLastSeen > 6000) {
      bot.target = null;
      bot.state = 'EXPLORING';
    }
  }

  executeCombatBehavior(bot, delta, now) {
    if (!bot.target || !bot.target.position) {
      bot.state = 'EXPLORING';
      return;
    }

    const tPos = bot.target.position;
    const dx = tPos.x - bot.position.x;
    const dz = tPos.z - bot.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Aim calculation with personality variance
    const desiredYaw = Math.atan2(dx, dz) + (Math.random() * 2 - 1) * bot.personality.accuracyVariance;
    bot.rotation.yaw = desiredYaw;

    // Movement: maintain optimal combat distance
    const optimalDist = bot.personality.pushDistance;
    const moveSpeed = 4.2;

    if (dist > optimalDist + 2) {
      // Advance towards target
      bot.position.x += Math.sin(desiredYaw) * moveSpeed * delta;
      bot.position.z += Math.cos(desiredYaw) * moveSpeed * delta;
    } else if (dist < optimalDist - 4) {
      // Backpedal while firing
      bot.position.x -= Math.sin(desiredYaw) * (moveSpeed * 0.7) * delta;
      bot.position.z -= Math.cos(desiredYaw) * (moveSpeed * 0.7) * delta;
    }

    // Shooting logic
    const wep = WEAPONS[bot.currentWeapon] || WEAPONS.rifle;
    if (now - bot.lastFireTime >= wep.fireRate * 1000 + bot.personality.reactionDelay) {
      bot.lastFireTime = now;
      bot.clip--;

      // Hit resolution
      if (Math.random() > 0.35) { // 65% hit rate adjusted for skill
        const dmg = wep.damage;
        if (bot.target.entity && typeof bot.target.entity.takeDamage === 'function') {
          bot.target.entity.takeDamage(dmg, bot.id);
          bot.damageDealt += dmg;
        }
      }

      if (bot.clip <= 0) {
        bot.clip = wep.clipSize;
        bot.lastFireTime = now + (wep.reloadTime * 1000);
      }
    }
  }

  executeExplorationBehavior(bot, delta) {
    const dx = bot.waypoint.x - bot.position.x;
    const dz = bot.waypoint.z - bot.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 3 || bot.actionTimer > 15) {
      bot.actionTimer = 0;
      bot.waypoint = {
        x: bot.position.x + (Math.random() * 80 - 40),
        z: bot.position.z + (Math.random() * 80 - 40)
      };
      // Keep within map boundaries
      bot.waypoint.x = Math.max(CONFIG.MAP_BOUNDS.minX, Math.min(CONFIG.MAP_BOUNDS.maxX, bot.waypoint.x));
      bot.waypoint.z = Math.max(CONFIG.MAP_BOUNDS.minZ, Math.min(CONFIG.MAP_BOUNDS.maxZ, bot.waypoint.z));
    }

    const yaw = Math.atan2(dx, dz);
    bot.rotation.yaw = yaw;
    const speed = 3.6;
    bot.position.x += Math.sin(yaw) * speed * delta;
    bot.position.z += Math.cos(yaw) * speed * delta;
  }

  executeLootingBehavior(bot, delta) {
    this.executeExplorationBehavior(bot, delta);
  }

  executeCoverBehavior(bot, delta) {
    this.executeExplorationBehavior(bot, delta);
  }

  damageBot(botId, amount, attackerId) {
    const bot = this.bots.get(botId);
    if (!bot || !bot.isAlive) return false;

    if (bot.armor > 0) {
      const absorbed = Math.min(bot.armor, amount * 0.6);
      bot.armor -= absorbed;
      amount -= absorbed;
    }

    bot.health -= amount;
    if (bot.health <= 0) {
      bot.health = 0;
      bot.isAlive = false;
      bot.state = 'DEAD';
      return true; // Bot died
    }
    return false;
  }
}

module.exports = BotEngine;
