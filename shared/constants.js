/**
 * DREXVIA - Shared Constants & Network Protocols
 * Developer: Soumya Chunary Studios
 * Architecture: Client / Server / Shared
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DrexviaShared = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONFIG = {
    GAME_NAME: 'DREXVIA',
    VERSION: '2.4.0',
    DEVELOPER: 'Soumya Chunary Studios',
    MAX_PLAYERS: 150,
    MATCHMAKING_TIME: 45, // Seconds countdown
    SQUAD_SIZE: 4,
    SERVER_TICK_RATE: 20, // 20 Hz tick
    CLIENT_INTERP_MS: 100, // 100ms interpolation buffer
    INTEREST_RADIUS: 140, // Distance within which players receive updates
    SECTOR_SIZE: 120, // Spatial grid cell size
    DAY_LENGTH_SECONDS: 360, // 6 minutes full cycle
    NIGHT_LENGTH_SECONDS: 240, // 4 minutes night cycle
    BOT_FILL_ENABLED: true,
    VOICE_ENABLED: true,
    DEBUG_MODE: true,
    MAP_BOUNDS: { minX: -250, maxX: 250, minZ: -250, maxZ: 250 }
  };

  const NET_MESSAGES = {
    // Client -> Server
    C_CONNECT: 'c_connect',
    C_JOIN_QUEUE: 'c_join_queue',
    C_SET_READY: 'c_set_ready',
    C_INPUT_MOVE: 'c_input_move',
    C_WEAPON_FIRE: 'c_weapon_fire',
    C_WEAPON_RELOAD: 'c_weapon_reload',
    C_WEAPON_SWITCH: 'c_weapon_switch',
    C_MELEE_STRIKE: 'c_melee_strike',
    C_INTERACT_LOOT: 'c_interact_loot',
    C_CRAFT_ITEM: 'c_craft_item',
    C_USE_ITEM: 'c_use_item',
    C_DROP_ITEM: 'c_drop_item',
    C_ATTACH_MOD: 'c_attach_mod',
    C_DEPLOY_EQUIPMENT: 'c_deploy_equipment',
    C_VOICE_SIGNAL: 'c_voice_signal',
    C_RADIO_MESSAGE: 'c_radio_message',
    C_SELECT_CLASS: 'c_select_class',
    C_TRIGGER_HACK: 'c_trigger_hack',
    C_PING: 'c_ping',
    C_ENTER_VEHICLE: 'c_enter_vehicle',
    C_EXIT_VEHICLE: 'c_exit_vehicle',
    C_INPUT_VEHICLE: 'c_input_vehicle',
    C_GET_CLAN_LEADERBOARD: 'c_get_clan_leaderboard',
    C_SUBMIT_HORDE_SCORE: 'c_submit_horde_score',

    // Server -> Client
    S_WELCOME: 's_welcome',
    S_LOBBY_UPDATE: 's_lobby_update',
    S_MATCH_START: 's_match_start',
    S_WORLD_STATE: 's_world_state',
    S_SPATIAL_ENTITIES: 's_spatial_entities',
    S_VEHICLE_STATE: 's_vehicle_state',
    S_CLAN_LEADERBOARD: 's_clan_leaderboard',
    S_PLAYER_SPAWNED: 's_player_spawned',
    S_PLAYER_DAMAGED: 's_player_damaged',
    S_PLAYER_DIED: 's_player_died',
    S_PLAYER_REVIVED: 's_player_revived',
    S_WEAPON_EFFECT: 's_weapon_effect',
    S_LOOT_SPAWNED: 's_loot_spawned',
    S_LOOT_REMOVED: 's_loot_removed',
    S_EVENT_TRIGGER: 's_event_trigger',
    S_WEATHER_SYNC: 's_weather_sync',
    S_TIME_SYNC: 's_time_sync',
    S_VOICE_RELAY: 's_voice_relay',
    S_ACHIEVEMENT_UNLOCKED: 's_achievement_unlocked',
    S_MATCH_RESULTS: 's_match_results',
    S_ERROR: 's_error',
    S_PONG: 's_pong'
  };

  const WEAPONS = {
    pistol: {
      id: 'pistol',
      name: 'M9 TACTICAL SIDEARM',
      type: 'handgun',
      damage: 28,
      headshotMultiplier: 2.2,
      fireRate: 0.22,
      clipSize: 15,
      reloadTime: 1.4,
      range: 45,
      spread: 0.015,
      recoil: 0.02,
      bulletSpeed: 160,
      suppressible: true,
      allowedMods: ['suppressor', 'laser', 'extended_mag']
    },
    shotgun: {
      id: 'shotgun',
      name: 'REMINGTON 870 ENFORCER',
      type: 'shotgun',
      damage: 18, // per pellet
      pellets: 8,
      headshotMultiplier: 1.8,
      fireRate: 0.85,
      clipSize: 8,
      reloadTime: 2.4,
      range: 25,
      spread: 0.065,
      recoil: 0.09,
      bulletSpeed: 120,
      suppressible: false,
      allowedMods: ['red_dot', 'laser', 'grip']
    },
    rifle: {
      id: 'rifle',
      name: 'AK-47 HYBRID CARBINE',
      type: 'rifle',
      damage: 32,
      headshotMultiplier: 2.0,
      fireRate: 0.11,
      clipSize: 30,
      reloadTime: 2.1,
      range: 85,
      spread: 0.025,
      recoil: 0.045,
      bulletSpeed: 210,
      suppressible: true,
      allowedMods: ['suppressor', 'red_dot', 'extended_mag', 'grip', 'stock']
    },
    sniper: {
      id: 'sniper',
      name: 'DREXVIA AP-50 PRECISION RIFLE',
      type: 'sniper',
      damage: 135,
      headshotMultiplier: 3.5,
      fireRate: 1.4,
      clipSize: 5,
      reloadTime: 3.0,
      range: 220,
      spread: 0.002,
      recoil: 0.14,
      bulletSpeed: 340,
      suppressible: true,
      allowedMods: ['suppressor', 'scope_8x', 'extended_mag', 'stock']
    },
    flamer: {
      id: 'flamer',
      name: 'PYRE-X HEAVY INCINERATOR',
      type: 'flamethrower',
      damage: 16, // tick damage
      headshotMultiplier: 1.0,
      fireRate: 0.06,
      clipSize: 100,
      reloadTime: 2.8,
      range: 18,
      spread: 0.09,
      recoil: 0.015,
      bulletSpeed: 45,
      suppressible: false,
      allowedMods: ['extended_mag']
    },
    mine: {
      id: 'mine',
      name: 'M26 PROXIMITY LASER MINE',
      type: 'explosive',
      damage: 280,
      radius: 7.5,
      clipSize: 3,
      deployTime: 0.8
    },
    knife: {
      id: 'knife',
      name: 'TITANIUM COMBAT BLADE',
      type: 'melee',
      damage: 55,
      range: 2.6,
      attackRate: 0.4
    }
  };

  const ATTACHMENTS = {
    suppressor: { id: 'suppressor', name: 'Tactical Silencer', desc: 'Reduces firing sound radius by 80% and flash', recoilMod: -0.1 },
    red_dot: { id: 'red_dot', name: 'Reflex Holographic Sight', desc: '+15% Aim accuracy, faster ADS target acquisition', spreadMod: -0.25 },
    scope_8x: { id: 'scope_8x', name: '8x Thermal Precision Scope', desc: 'High-magnification scope with optical zoom', zoomLevel: 8.0 },
    extended_mag: { id: 'extended_mag', name: 'Extended Drum Magazine', desc: '+50% clip capacity', clipMod: 1.5 },
    grip: { id: 'grip', name: 'Ergonomic Angled Foregrip', desc: '-30% Vertical recoil stabilization', recoilMod: -0.3 },
    stock: { id: 'stock', name: 'Tactical Recoil Stock', desc: '-20% Weapon sway and spread penalty', spreadMod: -0.2 },
    laser: { id: 'laser', name: 'Green Beam Targeting Laser', desc: 'Pinpoint hip-fire accuracy enhancement', spreadMod: -0.35 }
  };

  const BOT_PERSONALITIES = {
    AGGRESSIVE: {
      name: 'Aggressive Breacher',
      reactionDelay: 180, // ms
      accuracyVariance: 0.035,
      pushDistance: 12,
      coverChance: 0.25,
      lootPriority: 0.4,
      targetPreference: 'nearest'
    },
    CAUTIOUS: {
      name: 'Cautious Survivor',
      reactionDelay: 320,
      accuracyVariance: 0.045,
      pushDistance: 28,
      coverChance: 0.85,
      lootPriority: 0.8,
      targetPreference: 'flanking'
    },
    EXPLORER: {
      name: 'Sector Scavenger',
      reactionDelay: 250,
      accuracyVariance: 0.04,
      pushDistance: 20,
      coverChance: 0.5,
      lootPriority: 0.95,
      targetPreference: 'loot_first'
    },
    SUPPORT: {
      name: 'Combat Medic Bot',
      reactionDelay: 220,
      accuracyVariance: 0.038,
      pushDistance: 18,
      coverChance: 0.7,
      lootPriority: 0.6,
      targetPreference: 'squad_protector'
    },
    TACTICAL: {
      name: 'Ghost Infiltrator',
      reactionDelay: 140,
      accuracyVariance: 0.02,
      pushDistance: 15,
      coverChance: 0.8,
      lootPriority: 0.5,
      targetPreference: 'weakest'
    }
  };

  const CREATURES = {
    basic_hollow: {
      id: 'basic_hollow',
      name: 'The Hollow (Stage 1)',
      health: 80,
      speed: 4.8,
      damage: 18,
      attackRange: 2.2,
      detectRadius: 28,
      xpReward: 35,
      color: 0x991b1b
    },
    crawler: {
      id: 'crawler',
      name: 'Venomous Duct Crawler',
      health: 60,
      speed: 7.2,
      damage: 22,
      attackRange: 1.8,
      detectRadius: 35,
      xpReward: 50,
      color: 0xd97706
    },
    screamer: {
      id: 'screamer',
      name: 'Quarantine Screamer',
      health: 120,
      speed: 5.2,
      damage: 12,
      screechRadius: 40,
      detectRadius: 32,
      xpReward: 80,
      color: 0x9333ea
    },
    bio_goliath: {
      id: 'bio_goliath',
      name: 'THE BIO-GOLIATH (TITAN)',
      health: 900,
      speed: 3.8,
      damage: 48,
      attackRange: 4.5,
      detectRadius: 45,
      xpReward: 500,
      isBoss: true,
      color: 0xdc2626
    },
    the_veil: {
      id: 'the_veil',
      name: 'THE VEIL (OPTICAL STALKER)',
      health: 750,
      speed: 6.4,
      damage: 38,
      attackRange: 3.2,
      detectRadius: 50,
      xpReward: 450,
      isBoss: true,
      color: 0x38bdf8
    },
    chimera_prime: {
      id: 'chimera_prime',
      name: 'CHIMERA APEX OVERLORD',
      health: 1800,
      speed: 5.0,
      damage: 65,
      attackRange: 5.5,
      detectRadius: 65,
      xpReward: 1200,
      isBoss: true,
      color: 0xec4899
    }
  };

  const SECTORS = [
    { id: 'sector_01', name: 'Abandoned Outpost Gates', bounds: { minX: -60, maxX: 60, minZ: -60, maxZ: 60 }, threat: 'MODERATE' },
    { id: 'sector_02', name: 'Substation & Power Relay Alpha', bounds: { minX: 60, maxX: 180, minZ: -60, maxZ: 60 }, threat: 'HIGH' },
    { id: 'sector_03', name: 'Omega Mainframe Science Complex', bounds: { minX: -180, maxX: -60, minZ: -60, maxZ: 60 }, threat: 'CRITICAL' },
    { id: 'sector_04', name: 'Sub-Level 2 Toxic Bio-Dome', bounds: { minX: -80, maxX: 80, minZ: 60, maxZ: 180 }, threat: 'EXTREME', biohazard: true },
    { id: 'sector_05', name: 'Vault Alpha Secure Quarantine', bounds: { minX: -180, maxX: -60, minZ: 60, maxZ: 180 }, threat: 'EXTREME' },
    { id: 'sector_06', name: 'Extraction Helipad & Radar Tower', bounds: { minX: 60, maxX: 180, minZ: 60, maxZ: 180 }, threat: 'APEX HAZARD' }
  ];

  const CLASSES = {
    commando: {
      id: 'commando',
      name: 'Vanguard Commando',
      role: 'Assault & Heavy Firepower',
      armorBonus: 25,
      speedBonus: 0.2,
      primaryWeapon: 'rifle',
      colors: { armor: 0x1e3a8a, helmet: 0x172554, visor: 0x38bdf8, vest: 0x0f172a },
      perk: '+20% Magazine Capacity and +15% Recoil Stabilization'
    },
    infiltrator: {
      id: 'infiltrator',
      name: 'Shadow Infiltrator',
      role: 'Stealth, Recon & Sniping',
      armorBonus: 0,
      speedBonus: 0.8,
      primaryWeapon: 'sniper',
      colors: { armor: 0x18181b, helmet: 0x09090b, visor: 0xa855f7, vest: 0x27272a },
      perk: 'Silent Footsteps, Enhanced Night Vision and FLIR Thermal Range'
    },
    medic: {
      id: 'medic',
      name: 'Combat Bio-Medic',
      role: 'Squad Healing & Revive',
      armorBonus: 10,
      speedBonus: 0.4,
      primaryWeapon: 'shotgun',
      colors: { armor: 0x047857, helmet: 0x064e3b, visor: 0x34d399, vest: 0x065f46 },
      perk: 'Self-Regenerating Health & 2x Faster Squad Revive / Stims'
    },
    engineer: {
      id: 'engineer',
      name: 'Fortification Engineer',
      role: 'Defenses, Turrets & Mines',
      armorBonus: 35,
      speedBonus: -0.2,
      primaryWeapon: 'flamer',
      colors: { armor: 0xb45309, helmet: 0x78350f, visor: 0xfbbf24, vest: 0x92400e },
      perk: 'Extra Barricades & Double Explosive Laser Mine Capacity'
    }
  };

  const VEHICLES = {
    recon_buggy: {
      id: 'recon_buggy',
      name: 'DREXVIA MK-IV TACTICAL BUGGY',
      maxSpeed: 18.0,
      acceleration: 9.5,
      reverseSpeed: 7.0,
      turnSpeed: 1.8,
      health: 400,
      seats: 2,
      headlightIntensity: 4.5,
      headlightDistance: 60,
      color: 0x334155,
      accentColor: 0x38bdf8
    },
    armored_rover: {
      id: 'armored_rover',
      name: 'TITAN 6x6 ARMORED SCOUT ROVER',
      maxSpeed: 13.5,
      acceleration: 6.5,
      reverseSpeed: 5.0,
      turnSpeed: 1.3,
      health: 850,
      seats: 4,
      headlightIntensity: 5.5,
      headlightDistance: 75,
      color: 0x1e293b,
      accentColor: 0xef4444
    }
  };

  const GLOBAL_CLANS = [
    {
      id: 'clan_omega_valkyrie',
      tag: '[VALK]',
      name: 'Valkyrie Vanguard',
      region: 'GLOBAL / US-EAST',
      membersCount: 48,
      highestHordeWave: 74,
      totalMutantsPurged: 18450,
      apexTitansSlain: 142,
      reputationScore: 98500
    },
    {
      id: 'clan_shadow_syndicate',
      tag: '[SHDW]',
      name: 'Shadow Syndicate',
      region: 'EU-CENTRAL',
      membersCount: 42,
      highestHordeWave: 68,
      totalMutantsPurged: 16200,
      apexTitansSlain: 119,
      reputationScore: 89400
    },
    {
      id: 'clan_biohazard_hazmat',
      tag: '[HZMT]',
      name: 'Sector 04 Cleaners',
      region: 'ASIA-PACIFIC',
      membersCount: 39,
      highestHordeWave: 61,
      totalMutantsPurged: 14100,
      apexTitansSlain: 98,
      reputationScore: 78200
    },
    {
      id: 'clan_apex_predators',
      tag: '[APEX]',
      name: 'Apex Extinction Unit',
      region: 'GLOBAL',
      membersCount: 50,
      highestHordeWave: 82,
      totalMutantsPurged: 24900,
      apexTitansSlain: 215,
      reputationScore: 125000
    },
    {
      id: 'clan_ghost_recon_soumya',
      tag: '[SCS]',
      name: 'Soumya Elite Operatives',
      region: 'GLOBAL / ASIA-SOUTH',
      membersCount: 45,
      highestHordeWave: 88,
      totalMutantsPurged: 29800,
      apexTitansSlain: 260,
      reputationScore: 154000
    }
  ];

  return {
    CONFIG,
    NET_MESSAGES,
    WEAPONS,
    ATTACHMENTS,
    BOT_PERSONALITIES,
    CREATURES,
    SECTORS,
    CLASSES,
    VEHICLES,
    GLOBAL_CLANS
  };
}));
