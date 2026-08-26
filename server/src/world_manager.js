/**
 * DREXVIA - Authoritative World & Event Manager
 * Developer: Soumya Chunary Studios
 */

const { CONFIG, CREATURES, SECTORS, VEHICLES } = require('../../shared/constants');

class WorldManager {
  constructor(matchId) {
    this.matchId = matchId;
    this.sectors = SECTORS;
    this.monsters = new Map(); // monsterId -> MonsterEntity
    this.lootItems = new Map(); // lootId -> LootEntity
    this.vehicles = new Map(); // vehicleId -> VehicleEntity
    this.activeEvents = [];
    this.worldTime = 0; // 0 to 1 (Day/Night progress)
    this.weather = 'foggy'; // 'clear', 'rain', 'storm', 'foggy', 'toxic_fog'
    this.nextEventTime = Date.now() + 20000;
    this.initMonstersAndLoot();
    this.initVehicles();
  }

  initVehicles() {
    // Spawn 4 tactical vehicles across key sectors
    const vehicleSpawns = [
      { type: 'recon_buggy', pos: { x: 15, y: 0.6, z: 18 }, yaw: 0.4 },
      { type: 'recon_buggy', pos: { x: -75, y: 0.6, z: 45 }, yaw: 1.2 },
      { type: 'armored_rover', pos: { x: 85, y: 0.8, z: -40 }, yaw: 2.1 },
      { type: 'recon_buggy', pos: { x: 95, y: 0.6, z: 110 }, yaw: -0.8 }
    ];

    vehicleSpawns.forEach((v, index) => {
      const vId = `veh_${this.matchId}_${index + 1}`;
      const template = VEHICLES[v.type] || VEHICLES.recon_buggy;
      this.vehicles.set(vId, {
        id: vId,
        type: v.type,
        name: template.name,
        health: template.health,
        maxHealth: template.health,
        position: { x: v.pos.x, y: v.pos.y, z: v.pos.z },
        rotation: { yaw: v.yaw },
        velocity: { x: 0, z: 0 },
        speed: 0,
        driverId: null,
        passengers: [],
        headlights: true
      });
    });
  }

  initMonstersAndLoot() {
    // Spawn baseline infected across sectors
    let id = 1;
    for (const sector of this.sectors) {
      const numEnemies = sector.threat === 'CRITICAL' || sector.threat === 'EXTREME' ? 6 : 3;
      for (let i = 0; i < numEnemies; i++) {
        const typeKey = i === 0 && sector.threat === 'EXTREME' ? 'bio_goliath' : (i % 2 === 0 ? 'basic_hollow' : 'crawler');
        const template = CREATURES[typeKey];
        const mId = `mob_${this.matchId}_${id++}`;

        const mx = sector.bounds.minX + Math.random() * (sector.bounds.maxX - sector.bounds.minX);
        const mz = sector.bounds.minZ + Math.random() * (sector.bounds.maxZ - sector.bounds.minZ);

        this.monsters.set(mId, {
          id: mId,
          type: typeKey,
          name: template.name,
          health: template.health,
          maxHealth: template.health,
          damage: template.damage,
          speed: template.speed,
          isBoss: template.isBoss || false,
          isAlive: true,
          position: { x: mx, y: 0.8, z: mz },
          rotation: { yaw: Math.random() * Math.PI * 2 },
          state: 'PATROL',
          targetId: null,
          lastAttackTime: 0
        });
      }

      // Populate Loot Crates per sector
      for (let l = 0; l < 4; l++) {
        const lootId = `loot_${this.matchId}_${sector.id}_${l}`;
        const lx = sector.bounds.minX + Math.random() * (sector.bounds.maxX - sector.bounds.minX);
        const lz = sector.bounds.minZ + Math.random() * (sector.bounds.maxZ - sector.bounds.minZ);
        this.lootItems.set(lootId, {
          id: lootId,
          name: 'Military Munitions Crate',
          icon: '📦',
          position: { x: lx, y: 0.5, z: lz },
          sectorId: sector.id,
          contents: { ammo_rifle: 60, ammo_shotgun: 16, medkit: 1, battery: 1 }
        });
      }
    }
  }

  update(delta, allEntities) {
    // 1. Day / Night Progress
    this.worldTime = (this.worldTime + (delta / CONFIG.DAY_LENGTH_SECONDS)) % 1.0;

    // 2. Monster AI Tick
    this.updateMonsters(delta, allEntities);

    // 3. Dynamic Events Scheduler
    if (Date.now() > this.nextEventTime) {
      this.triggerRandomEvent();
      this.nextEventTime = Date.now() + 45000 + Math.random() * 30000;
    }
  }

  updateMonsters(delta, allEntities) {
    const now = Date.now();

    for (const mob of this.monsters.values()) {
      if (!mob.isAlive) continue;

      let closestTarget = null;
      let closestDist = mob.isBoss ? 55 : 30;

      for (const ent of allEntities) {
        if (!ent.isAlive) continue;
        const dx = ent.position.x - mob.position.x;
        const dz = ent.position.z - mob.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < closestDist) {
          closestDist = dist;
          closestTarget = ent;
        }
      }

      if (closestTarget) {
        mob.state = 'CHASE';
        const dx = closestTarget.position.x - mob.position.x;
        const dz = closestTarget.position.z - mob.position.z;
        const yaw = Math.atan2(dx, dz);
        mob.rotation.yaw = yaw;

        if (closestDist > 2.0) {
          mob.position.x += Math.sin(yaw) * mob.speed * delta;
          mob.position.z += Math.cos(yaw) * mob.speed * delta;
        } else if (now - mob.lastAttackTime > 1200) {
          // Attack target
          mob.lastAttackTime = now;
          if (typeof closestTarget.takeDamage === 'function') {
            closestTarget.takeDamage(mob.damage, mob.id);
          }
        }
      } else {
        mob.state = 'PATROL';
        mob.position.x += Math.sin(mob.rotation.yaw) * (mob.speed * 0.4) * delta;
        mob.position.z += Math.cos(mob.rotation.yaw) * (mob.speed * 0.4) * delta;
      }
    }
  }

  triggerRandomEvent() {
    const events = [
      { type: 'AIRDROP', name: 'EMERGENCY CARGO AIRDROP INBOUND', desc: 'Tactical supply payload dropping in Sector 06.' },
      { type: 'APEX_ROAR', name: 'CHIMERA APEX AWAKENED', desc: 'Seismic tremors detected in the Mainframe Sub-Levels.' },
      { type: 'POWER_FAILURE', name: 'GRID SURGE OVERLOAD', desc: 'Facility lighting offline. Night vision / thermal recommended.' },
      { type: 'TOXIC_STORM', name: 'BIO-CHEMICAL HAIL STORM', desc: 'Heavy radioactive precipitation sweeping the perimeter.' }
    ];

    const chosen = events[Math.floor(Math.random() * events.length)];
    this.activeEvents.push({ ...chosen, timestamp: Date.now() });

    if (chosen.type === 'TOXIC_STORM') {
      this.weather = 'storm';
    }

    return chosen;
  }

  enterVehicle(vehicleId, playerId) {
    const veh = this.vehicles.get(vehicleId);
    if (!veh) return { success: false, reason: 'Vehicle not found' };
    if (!veh.driverId) {
      veh.driverId = playerId;
      return { success: true, seat: 'driver', vehicle: veh };
    } else if (veh.passengers.length < 3) {
      veh.passengers.push(playerId);
      return { success: true, seat: 'passenger', vehicle: veh };
    }
    return { success: false, reason: 'Vehicle is full' };
  }

  exitVehicle(vehicleId, playerId) {
    const veh = this.vehicles.get(vehicleId);
    if (!veh) return false;
    if (veh.driverId === playerId) {
      veh.driverId = null;
      return true;
    }
    const pIndex = veh.passengers.indexOf(playerId);
    if (pIndex !== -1) {
      veh.passengers.splice(pIndex, 1);
      return true;
    }
    return false;
  }

  updateVehiclePhysics(vehicleId, input, delta) {
    const veh = this.vehicles.get(vehicleId);
    if (!veh) return;

    const template = VEHICLES[veh.type] || VEHICLES.recon_buggy;
    const accel = template.acceleration;
    const maxSpd = template.maxSpeed;
    const turnSpd = template.turnSpeed;

    if (input.throttle > 0) {
      veh.speed = Math.min(maxSpd, veh.speed + accel * delta);
    } else if (input.throttle < 0) {
      veh.speed = Math.max(-template.reverseSpeed, veh.speed - accel * delta);
    } else {
      // Natural deceleration / friction
      veh.speed *= Math.max(0, 1.0 - 2.5 * delta);
      if (Math.abs(veh.speed) < 0.05) veh.speed = 0;
    }

    if (input.steer && Math.abs(veh.speed) > 0.1) {
      const dir = veh.speed >= 0 ? 1 : -1;
      veh.rotation.yaw -= input.steer * turnSpd * delta * dir;
    }

    // Update position
    veh.position.x += -Math.sin(veh.rotation.yaw) * veh.speed * delta;
    veh.position.z += -Math.cos(veh.rotation.yaw) * veh.speed * delta;

    // Constrain to map bounds
    veh.position.x = Math.max(CONFIG.MAP_BOUNDS.minX, Math.min(CONFIG.MAP_BOUNDS.maxX, veh.position.x));
    veh.position.z = Math.max(CONFIG.MAP_BOUNDS.minZ, Math.min(CONFIG.MAP_BOUNDS.maxZ, veh.position.z));
  }

  getSpatialSnapshot(playerPos, radius = CONFIG.INTEREST_RADIUS) {
    const nearbyMonsters = [];
    const nearbyLoot = [];
    const nearbyVehicles = [];

    for (const mob of this.monsters.values()) {
      if (!mob.isAlive) continue;
      const dx = mob.position.x - playerPos.x;
      const dz = mob.position.z - playerPos.z;
      if (Math.sqrt(dx * dx + dz * dz) <= radius) {
        nearbyMonsters.push({
          id: mob.id,
          type: mob.type,
          health: mob.health,
          pos: mob.position,
          yaw: mob.rotation.yaw,
          state: mob.state
        });
      }
    }

    for (const loot of this.lootItems.values()) {
      const dx = loot.position.x - playerPos.x;
      const dz = loot.position.z - playerPos.z;
      if (Math.sqrt(dx * dx + dz * dz) <= radius) {
        nearbyLoot.push(loot);
      }
    }

    for (const veh of this.vehicles.values()) {
      const dx = veh.position.x - playerPos.x;
      const dz = veh.position.z - playerPos.z;
      if (Math.sqrt(dx * dx + dz * dz) <= radius) {
        nearbyVehicles.push({
          id: veh.id,
          type: veh.type,
          name: veh.name,
          health: veh.health,
          maxHealth: veh.maxHealth,
          pos: veh.position,
          yaw: veh.rotation.yaw,
          speed: veh.speed,
          driverId: veh.driverId,
          passengers: veh.passengers
        });
      }
    }

    return {
      monsters: nearbyMonsters,
      loot: nearbyLoot,
      vehicles: nearbyVehicles,
      worldTime: this.worldTime,
      weather: this.weather
    };
  }
}

module.exports = WorldManager;
