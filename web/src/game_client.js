/**
 * DREXVIA - Standalone Browser Multiplayer Client Engine
 * Developer: Soumya Chunary Studios
 */

(function () {
  'use strict';

  class DrexviaGameClient {
    constructor() {
      this.isOnline = false;
      this.ws = null;
      this.playerId = null;
      this.matchId = null;
      this.squadId = null;
      this.ping = 0;
      this.lastPingTime = 0;

      // Entities
      this.remotePlayers = new Map(); // id -> { mesh, targetPos, currentPos, targetYaw, health, isBot, operativeClass }
      this.monsters = new Map(); // id -> { mesh, targetPos, health, isBoss }
      this.vehicles = new Map(); // id -> { mesh, targetPos, targetYaw, speed, data, lights }
      this.lootEntities = new Map();
      this.currentVehicle = null;
      this.inVehicle = false;
      this.vehicleInput = { throttle: 0, steer: 0 };
      this.selectedClass = 'commando';
      this.hordeWave = 1;
      this.hordeKills = 0;

      // Three.js Scene & Render Objects
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Local Player State
      this.player = {
        position: new THREE.Vector3(0, 0.9, 0),
        rotation: { yaw: 0, pitch: 0 },
        velocity: new THREE.Vector3(),
        health: 100,
        maxHealth: 100,
        armor: 50,
        stamina: 100,
        speed: 4.8,
        isSprinting: false,
        isCrouching: false,
        isAlive: true,
        currentWeapon: 'rifle',
        flashlight: null,
        weaponMesh: null
      };

      // Tactical Systems
      this.tactical = {
        nvgActive: false,
        thermalActive: false,
        gasMaskActive: false,
        isSuppressed: false,
        bulletTimeActive: false,
        bulletTimeTimer: 0,
        droneActive: false,
        dronePos: new THREE.Vector3(),
        sonarTimer: 0,
        serums: { reflex: 2, armor: 2, stim: 3 },
        barricades: [],
        airdropObj: null
      };

      // Input State
      this.keys = {};
      this.isPointerLocked = false;

      // Subsystems
      this.ui = new UIController(this);
      this.voiceClient = new VoiceClient(this);

      // Procedural Web Audio Engine
      this.initAudio();
      this.initScene();
      this.initInputs();
      this.initLoop();
    }

    initAudio() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio not available', e);
      }
    }

    playEngineSound(speed) {
      if (!this.audioCtx) return;
      if (!this.engineOsc) {
        this.engineOsc = this.audioCtx.createOscillator();
        this.engineGain = this.audioCtx.createGain();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime);
        this.engineGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.audioCtx.destination);
        this.engineOsc.start();
      }
      const pitch = 50 + Math.abs(speed) * 12;
      this.engineOsc.frequency.setTargetAtTime(pitch, this.audioCtx.currentTime, 0.05);
    }

    stopEngineSound() {
      if (this.engineOsc) {
        try {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
        } catch (e) {}
        this.engineOsc = null;
      }
    }

    playProceduralSound(type, freq = 440, dur = 0.1) {
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'gunshot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
      } else if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.08);
      } else if (type === 'sonar') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
      }
    }

    initScene() {
      const container = document.getElementById('canvas-container') || document.body;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x05070a);
      this.scene.fog = new THREE.FogExp2(0x05070a, 0.025);

      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
      this.camera.position.set(0, 1.7, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      // Lighting
      const ambient = new THREE.AmbientLight(0x1e293b, 0.4);
      this.scene.add(ambient);

      const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
      moonLight.position.set(50, 100, 50);
      this.scene.add(moonLight);

      // Flashlight attached to player camera
      this.player.flashlight = new THREE.SpotLight(0xffffff, 2.5, 35, Math.PI / 6, 0.3, 1.2);
      this.player.flashlight.position.set(0, 0, 0);
      this.camera.add(this.player.flashlight);
      this.camera.add(this.player.flashlight.target);
      this.player.flashlight.target.position.set(0, 0, -5);
      this.scene.add(this.camera);

      this.buildWorldTerrain();

      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    buildWorldTerrain() {
      // Ground plane
      const groundGeo = new THREE.PlaneGeometry(500, 500, 32, 32);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Sector landmark buildings and structures
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

      for (let i = 0; i < 40; i++) {
        const h = 4 + Math.random() * 8;
        const w = 6 + Math.random() * 10;
        const d = 6 + Math.random() * 10;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 180;
        b.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
        b.castShadow = true;
        b.receiveShadow = true;
        this.scene.add(b);
      }
    }

    initInputs() {
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (e.code === 'KeyF') this.toggleFlashlight();
        if (e.code === 'KeyN') this.toggleNVG();
        if (e.code === 'KeyH') this.toggleThermalVision();
        if (e.code === 'KeyG') this.toggleGasMask();
        if (e.code === 'KeyE') this.interactNearest();
        if (e.code === 'Digit1') this.player.currentWeapon = 'pistol';
        if (e.code === 'Digit2') this.player.currentWeapon = 'shotgun';
        if (e.code === 'Digit3') this.player.currentWeapon = 'rifle';
        if (e.code === 'Digit4') this.player.currentWeapon = 'mine';
        if (e.code === 'Digit5') this.player.currentWeapon = 'flamer';
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      window.addEventListener('mousedown', (e) => {
        if (!this.isPointerLocked && this.ui.currentScreen === 'game') {
          document.body.requestPointerLock();
        } else if (this.isPointerLocked && e.button === 0 && !this.inVehicle) {
          this.fireWeapon();
        }
      });

      document.addEventListener('pointerlockchange', () => {
        this.isPointerLocked = document.pointerLockElement === document.body;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isPointerLocked) return;
        const sens = 0.0022;
        this.player.rotation.yaw -= e.movementX * sens;
        this.player.rotation.pitch -= e.movementY * sens;
        this.player.rotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.player.rotation.pitch));
      });
    }

    createOperativeMesh(className = 'commando', isBot = false) {
      const group = new THREE.Group();

      const classColors = {
        commando: { armor: 0x1e3a8a, helmet: 0x172554, visor: 0x38bdf8, vest: 0x0f172a },
        infiltrator: { armor: 0x18181b, helmet: 0x09090b, visor: 0xa855f7, vest: 0x27272a },
        medic: { armor: 0x047857, helmet: 0x064e3b, visor: 0x34d399, vest: 0x065f46 },
        engineer: { armor: 0xb45309, helmet: 0x78350f, visor: 0xfbbf24, vest: 0x92400e }
      };

      const c = classColors[className] || classColors.commando;
      const armorMat = new THREE.MeshLambertMaterial({ color: isBot ? 0x475569 : c.armor });
      const vestMat = new THREE.MeshLambertMaterial({ color: c.vest });
      const helmetMat = new THREE.MeshLambertMaterial({ color: isBot ? 0x334155 : c.helmet });
      const visorMat = new THREE.MeshBasicMaterial({ color: c.visor });

      // Torso & Tactical Vest
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.35), vestMat);
      torso.position.y = 0.95;
      torso.castShadow = true;
      group.add(torso);

      // Chest armor plate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.12), armorMat);
      plate.position.set(0, 1.05, 0.16);
      group.add(plate);

      // Head & Tactical Helmet
      const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), helmetMat);
      helmet.position.y = 1.5;
      helmet.castShadow = true;
      group.add(helmet);

      // Glowing Tactical Visor
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), visorMat);
      visor.position.set(0, 1.5, 0.18);
      group.add(visor);

      // Tactical Backpack / Oxygen Filter Rig
      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.2), vestMat);
      backpack.position.set(0, 1.0, -0.25);
      group.add(backpack);

      // Arms
      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 6), armorMat);
      lArm.position.set(-0.38, 0.95, 0);
      group.add(lArm);

      const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 6), armorMat);
      rArm.position.set(0.38, 0.95, 0);
      group.add(rArm);

      // Legs
      const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.7, 6), armorMat);
      lLeg.position.set(-0.16, 0.35, 0);
      group.add(lLeg);

      const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.7, 6), armorMat);
      rLeg.position.set(0.16, 0.35, 0);
      group.add(rLeg);

      return group;
    }

    createVehicleMesh(type = 'recon_buggy') {
      const group = new THREE.Group();
      const isRover = type === 'armored_rover';

      const bodyMat = new THREE.MeshLambertMaterial({ color: isRover ? 0x1e293b : 0x334155 });
      const accentMat = new THREE.MeshLambertMaterial({ color: isRover ? 0xef4444 : 0x38bdf8 });
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

      // Chassis Body
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(isRover ? 2.4 : 1.8, isRover ? 0.9 : 0.6, isRover ? 4.2 : 3.2),
        bodyMat
      );
      chassis.position.y = isRover ? 0.8 : 0.55;
      chassis.castShadow = true;
      group.add(chassis);

      // Cabin / Rollcage
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(isRover ? 2.0 : 1.5, isRover ? 0.9 : 0.7, isRover ? 2.2 : 1.8),
        accentMat
      );
      cabin.position.set(0, isRover ? 1.5 : 1.1, -0.2);
      group.add(cabin);

      // Windshield
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(isRover ? 1.8 : 1.3, isRover ? 0.7 : 0.5, 0.1),
        glassMat
      );
      glass.position.set(0, isRover ? 1.5 : 1.1, (isRover ? 2.2 : 1.8) / 2 - 0.1);
      group.add(glass);

      // Wheels
      const wheelCount = isRover ? 6 : 4;
      const wheelZOffsets = isRover ? [-1.4, 0, 1.4] : [-1.1, 1.1];
      const wheelX = isRover ? 1.25 : 0.95;

      wheelZOffsets.forEach(z => {
        // Left wheel
        const lw = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12), wheelMat);
        lw.rotation.z = Math.PI / 2;
        lw.position.set(-wheelX, 0.45, z);
        lw.castShadow = true;
        group.add(lw);

        // Right wheel
        const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12), wheelMat);
        rw.rotation.z = Math.PI / 2;
        rw.position.set(wheelX, 0.45, z);
        rw.castShadow = true;
        group.add(rw);
      });

      // Dual High-Beam Headlights
      const leftLight = new THREE.SpotLight(0xffffff, 4.0, 65, Math.PI / 5, 0.3, 1.2);
      leftLight.position.set(-0.6, 0.8, 1.6);
      leftLight.target.position.set(-0.6, 0.2, 10);
      group.add(leftLight);
      group.add(leftLight.target);

      const rightLight = new THREE.SpotLight(0xffffff, 4.0, 65, Math.PI / 5, 0.3, 1.2);
      rightLight.position.set(0.6, 0.8, 1.6);
      rightLight.target.position.set(0.6, 0.2, 10);
      group.add(rightLight);
      group.add(rightLight.target);

      group.userData = { leftLight, rightLight };
      return group;
    }

    interactNearest() {
      if (this.inVehicle) {
        // Exit current vehicle
        if (this.ws && this.ws.readyState === 1 && this.currentVehicle) {
          this.ws.send(JSON.stringify({
            type: 'c_exit_vehicle',
            vehicleId: this.currentVehicle.id
          }));
        }
        this.inVehicle = false;
        this.currentVehicle = null;
        this.stopEngineSound();
        document.getElementById('vehicle-hud')?.classList.add('hidden');
        return;
      }

      // Check nearest vehicle to enter
      let closest = null;
      let minDist = 4.5;

      this.vehicles.forEach(v => {
        const dx = v.mesh.position.x - this.player.position.x;
        const dz = v.mesh.position.z - this.player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          closest = v;
        }
      });

      if (closest) {
        if (this.ws && this.ws.readyState === 1) {
          this.ws.send(JSON.stringify({
            type: 'c_enter_vehicle',
            vehicleId: closest.id
          }));
        }
        this.inVehicle = true;
        this.currentVehicle = closest;
        document.getElementById('vehicle-hud')?.classList.remove('hidden');
      }
    }

    connectToServer(username, mode = 'multiplayer') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:3000';
      const wsUrl = `${protocol}//${host}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isOnline = true;
          this.voiceClient.init();
          this.ws.send(JSON.stringify({
            type: 'c_join_queue',
            username: username,
            mode: mode
          }));
          this.startPingLoop();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleServerMessage(msg);
          } catch (e) {
            console.error('Packet parse error', e);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[DREXVIA NET] Server unreachable. Launching standalone local session.', err);
          this.fallbackToLocalSimulation();
        };

        this.ws.onclose = () => {
          this.isOnline = false;
        };
      } catch (err) {
        this.fallbackToLocalSimulation();
      }
    }

    fallbackToLocalSimulation() {
      this.isOnline = false;
      this.ui.updateLobbyStatus({ realPlayers: 1, botsPlanned: 149, countdown: 3 });
      setTimeout(() => {
        this.startMatch({
          matchId: 'local_sim_01',
          squadId: 'squad_alpha',
          totalParticipants: 150,
          botCount: 149
        });
      }, 3000);
    }

    startPingLoop() {
      setInterval(() => {
        if (this.ws && this.ws.readyState === 1) {
          this.lastPingTime = Date.now();
          this.ws.send(JSON.stringify({ type: 'c_ping', timestamp: this.lastPingTime }));
        }
      }, 3000);
    }

    handleServerMessage(msg) {
      switch (msg.type) {
        case 's_welcome':
          this.playerId = msg.playerId;
          break;
        case 's_lobby_update':
          this.ui.updateLobbyStatus(msg);
          break;
        case 's_match_start':
          this.startMatch(msg);
          break;
        case 's_spatial_entities':
          this.syncSpatialEntities(msg);
          break;
        case 's_vehicle_state':
          if (msg.action === 'exit_result') {
            this.inVehicle = false;
            this.currentVehicle = null;
            this.stopEngineSound();
            document.getElementById('vehicle-hud')?.classList.add('hidden');
          }
          break;
        case 's_clan_leaderboard':
          if (this.ui) this.ui.renderClanLeaderboard(msg.clans);
          break;
        case 's_player_damaged':
          this.player.health = msg.health;
          this.playProceduralSound('hit');
          break;
        case 's_voice_relay':
          if (this.voiceClient) this.voiceClient.handleIncomingSignal(msg);
          break;
        case 's_pong':
          this.ping = Date.now() - msg.timestamp;
          break;
      }
    }

    startMatch(data) {
      this.matchId = data.matchId;
      this.squadId = data.squadId;
      this.ui.showScreen('game');
      document.body.requestPointerLock?.();
    }

    sendVoiceSignal(targetId, signalType, signalData, mode) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({
          type: 'c_voice_signal',
          targetId: targetId,
          signalType: signalType,
          signalData: signalData,
          mode: mode
        }));
      }
    }

    fireWeapon() {
      this.playProceduralSound('gunshot');

      // Raycast shooting
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);

      // Check hit against remote bots or monsters
      const hitCandidates = [];
      this.remotePlayers.forEach((p, id) => { if (p.mesh) hitCandidates.push(p.mesh); });
      this.monsters.forEach((m, id) => { if (m.mesh) hitCandidates.push(m.mesh); });

      const hits = ray.intersectObjects(hitCandidates);
      let hitTargetId = null;
      let targetType = null;

      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        if (hitMesh.userData && hitMesh.userData.id) {
          hitTargetId = hitMesh.userData.id;
          targetType = hitMesh.userData.isBot ? 'bot' : 'monster';
          this.playProceduralSound('hit');
        }
      }

      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({
          type: 'c_weapon_fire',
          weaponId: this.player.currentWeapon,
          hitTargetId: hitTargetId,
          targetType: targetType
        }));
      }
    }

    syncSpatialEntities(data) {
      // Remote bots and players interpolation
      const allParticipants = [...(data.players || []), ...(data.bots || [])];

      allParticipants.forEach(p => {
        if (!this.remotePlayers.has(p.id)) {
          // Create 3D Operative character representation
          const mesh = this.createOperativeMesh(p.operativeClass || (p.isBot ? 'commando' : 'infiltrator'), p.isBot);
          mesh.userData = { id: p.id, isBot: p.isBot };
          this.scene.add(mesh);

          this.remotePlayers.set(p.id, {
            mesh: mesh,
            targetPos: new THREE.Vector3(p.pos.x, p.pos.y, p.pos.z),
            currentPos: new THREE.Vector3(p.pos.x, p.pos.y, p.pos.z),
            targetYaw: p.yaw || 0,
            health: p.health,
            isBot: p.isBot
          });
        } else {
          const ent = this.remotePlayers.get(p.id);
          ent.targetPos.set(p.pos.x, p.pos.y, p.pos.z);
          ent.targetYaw = p.yaw || 0;
          ent.health = p.health;
        }
      });

      // Vehicles synchronization
      (data.vehicles || []).forEach(v => {
        if (!this.vehicles.has(v.id)) {
          const vMesh = this.createVehicleMesh(v.type);
          vMesh.userData = { id: v.id, isVehicle: true };
          vMesh.position.set(v.pos.x, v.pos.y, v.pos.z);
          vMesh.rotation.y = v.yaw || 0;
          this.scene.add(vMesh);

          this.vehicles.set(v.id, {
            id: v.id,
            mesh: vMesh,
            targetPos: new THREE.Vector3(v.pos.x, v.pos.y, v.pos.z),
            targetYaw: v.yaw || 0,
            speed: v.speed || 0,
            data: v
          });
        } else {
          const veh = this.vehicles.get(v.id);
          veh.targetPos.set(v.pos.x, v.pos.y, v.pos.z);
          veh.targetYaw = v.yaw || 0;
          veh.speed = v.speed || 0;
          veh.data = v;
        }
      });

      // Monster synchronization
      (data.monsters || []).forEach(m => {
        if (!this.monsters.has(m.id)) {
          const geom = new THREE.BoxGeometry(0.8, 1.6, 0.8);
          const mat = new THREE.MeshLambertMaterial({ color: m.type === 'bio_goliath' ? 0xdc2626 : 0x9333ea });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.userData = { id: m.id, isMonster: true };
          this.scene.add(mesh);

          this.monsters.set(m.id, {
            mesh: mesh,
            targetPos: new THREE.Vector3(m.pos.x, m.pos.y, m.pos.z),
            health: m.health
          });
        } else {
          const mob = this.monsters.get(m.id);
          mob.targetPos.set(m.pos.x, m.pos.y, m.pos.z);
          mob.health = m.health;
        }
      });
    }

    toggleFlashlight() {
      if (this.player.flashlight) {
        this.player.flashlight.visible = !this.player.flashlight.visible;
      }
    }

    toggleNVG() {
      this.tactical.nvgActive = !this.tactical.nvgActive;
      document.getElementById('nvg-overlay')?.classList.toggle('hidden', !this.tactical.nvgActive);
    }

    toggleThermalVision() {
      this.tactical.thermalActive = !this.tactical.thermalActive;
      document.getElementById('thermal-overlay')?.classList.toggle('hidden', !this.tactical.thermalActive);
    }

    toggleGasMask() {
      this.tactical.gasMaskActive = !this.tactical.gasMaskActive;
    }

    initLoop() {
      const animate = () => {
        requestAnimationFrame(animate);
        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.ui.currentScreen === 'game') {
          this.updatePlayerMovement(delta);
          this.interpolateEntities(delta);
          this.updateCamera();
          this.updateTacticalHUD(delta);
        }

        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };
      animate();
    }

    updatePlayerMovement(delta) {
      if (this.inVehicle && this.currentVehicle) {
        // Vehicle driving physics
        let throttle = 0;
        let steer = 0;
        if (this.keys['KeyW']) throttle += 1;
        if (this.keys['KeyS']) throttle -= 1;
        if (this.keys['KeyA']) steer += 1;
        if (this.keys['KeyD']) steer -= 1;

        const maxSpd = this.currentVehicle.data?.type === 'armored_rover' ? 14 : 19;
        const accel = 12.0;
        const turnRate = 2.0;

        if (throttle > 0) {
          this.currentVehicle.speed = Math.min(maxSpd, this.currentVehicle.speed + accel * delta);
        } else if (throttle < 0) {
          this.currentVehicle.speed = Math.max(-8, this.currentVehicle.speed - accel * delta);
        } else {
          this.currentVehicle.speed *= Math.max(0, 1.0 - 2.0 * delta);
          if (Math.abs(this.currentVehicle.speed) < 0.05) this.currentVehicle.speed = 0;
        }

        if (steer !== 0 && Math.abs(this.currentVehicle.speed) > 0.1) {
          const dir = this.currentVehicle.speed >= 0 ? 1 : -1;
          this.currentVehicle.mesh.rotation.y += steer * turnRate * delta * dir;
        }

        // Forward vector
        const vyaw = this.currentVehicle.mesh.rotation.y;
        this.currentVehicle.mesh.position.x += -Math.sin(vyaw) * this.currentVehicle.speed * delta;
        this.currentVehicle.mesh.position.z += -Math.cos(vyaw) * this.currentVehicle.speed * delta;

        this.player.position.copy(this.currentVehicle.mesh.position);
        this.playEngineSound(this.currentVehicle.speed);

        // Update Vehicle HUD speedometer
        const spdEl = document.getElementById('vehicle-speed-val');
        if (spdEl) spdEl.textContent = Math.round(Math.abs(this.currentVehicle.speed) * 3.6);

        if (this.ws && this.ws.readyState === 1) {
          this.ws.send(JSON.stringify({
            type: 'c_input_vehicle',
            vehicleId: this.currentVehicle.id,
            input: { throttle, steer }
          }));
        }
        return;
      }

      // Standard Operative on-foot movement
      const move = new THREE.Vector3();
      const yaw = this.player.rotation.yaw;

      if (this.keys['KeyW']) move.z -= 1;
      if (this.keys['KeyS']) move.z += 1;
      if (this.keys['KeyA']) move.x -= 1;
      if (this.keys['KeyD']) move.x += 1;
      move.normalize();

      this.player.isSprinting = !!this.keys['ShiftLeft'];
      const speed = (this.player.isSprinting ? 7.2 : this.player.speed);

      // Rotate movement relative to player yaw
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

      const displacement = forward.multiplyScalar(-move.z * speed * delta).add(right.multiplyScalar(move.x * speed * delta));
      this.player.position.add(displacement);

      // Send movement to authoritative server
      if (this.ws && this.ws.readyState === 1 && (displacement.lengthSq() > 0 || this.keys['KeyW'] || this.keys['KeyS'])) {
        this.ws.send(JSON.stringify({
          type: 'c_input_move',
          position: { x: this.player.position.x, y: this.player.position.y, z: this.player.position.z },
          rotation: { yaw: this.player.rotation.yaw, pitch: this.player.rotation.pitch }
        }));
      }

      if (this.voiceClient) {
        this.voiceClient.updateListenerPosition(this.player.position, this.player.rotation.yaw);
      }
    }

    interpolateEntities(delta) {
      const lerpSpeed = 10.0 * delta;

      this.remotePlayers.forEach(ent => {
        if (ent.mesh && ent.targetPos) {
          ent.mesh.position.lerp(ent.targetPos, lerpSpeed);
          ent.mesh.rotation.y = ent.targetYaw;
        }
      });

      this.vehicles.forEach(veh => {
        if (veh.mesh && veh.targetPos && veh !== this.currentVehicle) {
          veh.mesh.position.lerp(veh.targetPos, lerpSpeed);
          veh.mesh.rotation.y = veh.targetYaw;
        }
      });

      this.monsters.forEach(mob => {
        if (mob.mesh && mob.targetPos) {
          mob.mesh.position.lerp(mob.targetPos, lerpSpeed);
        }
      });
    }

    updateCamera() {
      if (this.inVehicle && this.currentVehicle) {
        // Third-person vehicle chase camera
        const vyaw = this.currentVehicle.mesh.rotation.y;
        const camDist = 5.5;
        const camHeight = 2.4;
        const camX = this.currentVehicle.mesh.position.x + Math.sin(vyaw) * camDist;
        const camZ = this.currentVehicle.mesh.position.z + Math.cos(vyaw) * camDist;
        const camY = this.currentVehicle.mesh.position.y + camHeight;

        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(
          this.currentVehicle.mesh.position.x - Math.sin(vyaw) * 2,
          this.currentVehicle.mesh.position.y + 0.8,
          this.currentVehicle.mesh.position.z - Math.cos(vyaw) * 2
        );
      } else {
        // First-person operative camera
        this.camera.position.set(this.player.position.x, this.player.position.y + 0.8, this.player.position.z);
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.player.rotation.yaw;
        this.camera.rotation.x = this.player.rotation.pitch;
      }
    }

    updateTacticalHUD(delta) {
      // Sonar Radar Sweep
      this.tactical.sonarTimer += delta;
      if (this.tactical.sonarTimer >= 2.5) {
        this.tactical.sonarTimer = 0;
        this.playProceduralSound('sonar');

        const blipContainer = document.getElementById('radar-blips-container');
        if (blipContainer) {
          blipContainer.innerHTML = '';
          this.remotePlayers.forEach(p => {
            const dx = p.mesh.position.x - this.player.position.x;
            const dz = p.mesh.position.z - this.player.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 40) {
              const blip = document.createElement('div');
              blip.className = 'sonar-blip';
              blip.style.left = `${40 + (dx / 40) * 35}px`;
              blip.style.top = `${40 + (dz / 40) * 35}px`;
              blipContainer.appendChild(blip);
            }
          });
        }
      }

      // Update Debug Telemetry
      this.ui.updateDebugTelemetry({
        fps: 60,
        ping: this.ping,
        totalEntities: 1 + this.remotePlayers.size + this.monsters.size,
        botsCount: Array.from(this.remotePlayers.values()).filter(p => p.isBot).length,
        playersCount: Array.from(this.remotePlayers.values()).filter(p => !p.isBot).length,
        monstersCount: this.monsters.size
      });
    }

    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  }

  window.DrexviaGameClient = DrexviaGameClient;
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new DrexviaGameClient();
  });
})();
