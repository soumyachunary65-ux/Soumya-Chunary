/**
 * DREXVIA - Survival Horror 3D Master Game Engine (Phases 1-10 Integrated)
 * Multi-Sector Open World & Subterranean Bio-Dome, 6 Bestiary Creatures & Apex Bosses,
 * Tactical Arsenal with Attachments & Sentry Turret, NVG & Gas Mask Systems,
 * Weather & Thunderstorm Simulation, CCTV Network, Multi-Branching Endings & Endless Horde Mode.
 * Developed for Soumya Chunary Studios.
 */

(function() {
  'use strict';

  // --- 1. PROCEDURAL AUDIO SYNTHESIZER ENGINE ---
  class DrexviaAudioEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.droneGain = null;
      this.breathingGain = null;
      this.breathingTimer = null;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.startAtmosphericDrone();
      } catch (e) {
        console.warn('Web Audio not supported:', e);
      }
    }

    startAtmosphericDrone() {
      if (!this.ctx || this.isMuted) return;
      try {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(38, this.ctx.currentTime); // Deep horror sub-bass

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(38.8, this.ctx.currentTime); // Binaural horror pulse

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        this.droneGain = gain;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
      } catch (e) {}
    }

    playGunshot(type = 'pistol', isSuppressed = false) {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        if (isSuppressed) {
          // Suppressed stealth pop
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now); osc.stop(now + 0.08);
          return;
        }

        if (type === 'shotgun') {
          // Heavy explosive shotgun blast
          const bufferSize = this.ctx.sampleRate * 0.35;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const out = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.06));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now);
          filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(1.0, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

          const sub = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          sub.type = 'triangle';
          sub.frequency.setValueAtTime(120, now);
          sub.frequency.exponentialRampToValueAtTime(35, now + 0.25);
          subGain.gain.setValueAtTime(1.0, now);
          subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
          sub.connect(subGain); subGain.connect(this.ctx.destination);

          noise.start(now);
          sub.start(now); sub.stop(now + 0.26);

          setTimeout(() => {
            this.playMechanicalClick(this.ctx.currentTime, 750, 0.4);
            this.playMechanicalClick(this.ctx.currentTime + 0.15, 950, 0.4);
          }, 350);

        } else if (type === 'rifle') {
          // Fast tactical rifle crack
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.09);
          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now); osc.stop(now + 0.1);

        } else {
          // 9mm Pistol
          const bufferSize = this.ctx.sampleRate * 0.2;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const out = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.035));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1300, now);
          filter.frequency.exponentialRampToValueAtTime(350, now + 0.15);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.85, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
          noise.start(now);
        }
      } catch (e) {}
    }

    playKnifeSlice() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
      } catch (e) {}
    }

    playTurretFire() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
      } catch (e) {}
    }

    playThunder() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 2.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

        osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 2.6);
      } catch (e) {}
    }

    playNVGBeep() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.linearRampToValueAtTime(3200, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.22);
      } catch (e) {}
    }

    playRadioBeep() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.09);
      } catch (e) {}
    }

    playGasMaskBreath() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        osc.frequency.linearRampToValueAtTime(60, now + 0.8);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.95);
      } catch (e) {}
    }

    playExplosion() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.7);
      } catch (e) {}
    }

    playScreamerScreech() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1600, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(350, now + 1.2);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(45, now);
        modGain.gain.setValueAtTime(300, now);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        mod.start(now); osc.start(now);
        mod.stop(now + 1.3); osc.stop(now + 1.3);
      } catch (e) {}
    }

    playGoliathRoar() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.linearRampToValueAtTime(85, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 1.6);
      } catch (e) {}
    }

    playReload() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        this.playMechanicalClick(now, 800, 0.3);
        this.playMechanicalClick(now + 0.6, 1100, 0.4);
        this.playMechanicalClick(now + 1.1, 600, 0.5);
      } catch (e) {}
    }

    playMechanicalClick(time, freq, gainVal) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(time); osc.stop(time + 0.06);
    }

    playFlamethrower() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const out = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start(now);
      } catch (e) {}
    }

    playEMPBlast() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.52);
      } catch (e) {}
    }

    playThermalHum() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.22);
      } catch (e) {}
    }

    playDroneMotor() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.11);
      } catch (e) {}
    }

    playSonarPing() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.32);
      } catch (e) {}
    }

    playBarricadeHammer() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.09);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.11);
      } catch (e) {}
    }

    playAirdropSiren() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);
        osc.frequency.linearRampToValueAtTime(600, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.72);
      } catch (e) {}
    }

    playFlashbangTinnitus() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3600, now);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 2.1);
      } catch (e) {}
    }

    playWaterSplash() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const out = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start(now);
      } catch (e) {}
    }

    playHackBeep() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1440, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.06);
      } catch (e) {}
    }

    playHackSuccess() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.3, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.22);
        });
      } catch (e) {}
    }

    playSerumInject() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.32);
      } catch (e) {}
    }

    playChimeraRoar() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.8);
        mod.type = 'sine';
        mod.frequency.setValueAtTime(28, now);
        modGain.gain.setValueAtTime(60, now);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.9);
        mod.connect(modGain); modGain.connect(osc.frequency);
        osc.connect(gain); gain.connect(this.ctx.destination);
        mod.start(now); osc.start(now);
        mod.stop(now + 1.9); osc.stop(now + 1.9);
      } catch (e) {}
    }

    playFootstep(surface = 'dirt') {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(surface === 'metal' ? 240 : 85, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.09);
      } catch (e) {}
    }

    playHeartbeat() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        this.playHeartbeatThud(now, 70, 0.4);
        this.playHeartbeatThud(now + 0.14, 60, 0.3);
      } catch (e) {}
    }

    playHeartbeatThud(time, freq, gainVal) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(time); osc.stop(time + 0.13);
    }

    playLootPickup() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.22);
      } catch (e) {}
    }

    playObjectiveSuccess() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.25, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1); osc.stop(now + idx * 0.1 + 0.28);
        });
      } catch (e) {}
    }
  }

  // --- 2. GAME STATE & SINGLETON ---
  const Game = {
    audio: new DrexviaAudioEngine(),
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    isPaused: false,
    isGameOver: false,
    isFirstPerson: true,
    startTime: Date.now(),
    kills: 0,
    score: 0,
    gameMode: 'campaign', // 'campaign' | 'horde'
    currentSector: 'SECTOR 01: PERIMETER FOREST',

    // Environmental & Weather State
    weather: {
      isRaining: true,
      lightningTimer: 8.0,
      rainParticles: null,
      lightningLight: null
    },

    // Tactical Gear State (Phase 4 to 24)
    tactical: {
      nvgActive: false,
      thermalActive: false,
      gasMaskActive: false,
      gasFilter: 100, // %
      isSuppressed: false,
      hasSentryInInventory: true,
      isAimingADS: false,
      droneActive: false,
      dronePos: { x: 0, y: 15, z: 20 },
      droneYaw: 0,
      droneBattery: 100,
      serums: { reflex: 2, armor: 2, stim: 3 },
      bulletTimeActive: false,
      bulletTimeTimer: 0,
      armorSerumActive: false,
      armorSerumTimer: 0,
      barricades: [],
      shockTraps: [],
      airdropState: 'ready', // 'ready' | 'incoming' | 'landed'
      airdropObj: null,
      operativeClass: 'commando', // 'commando', 'infiltrator', 'medic', 'engineer'
      achievementsUnlocked: new Set(),
      sonarTimer: 0,
      dayNightProgress: 0.1 // 0.0 to 1.0 (2am to 6am blood moon eclipse)
    },

    player: {
      position: { x: 0, y: 1.6, z: 22 },
      rotation: { yaw: 0, pitch: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      isGrounded: true,
      speed: 4.8,
      sprintMultiplier: 1.75,
      crouchMultiplier: 0.55,
      isSprinting: false,
      isCrouching: false,
      flashlightOn: true,
      flashlightBattery: 95,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      hunger: 88,
      thirst: 82,
      fear: 10,
      infection: 0,
      isBleeding: false,
      adrenalineActive: false,
      adrenalineTimer: 0,
      mesh: null,
      weaponMesh: null,
      flashlightLight: null,
      flashlightTarget: null,
      stepTimer: 0,
      breathTimer: 0
    },

    weapons: {
      current: 'pistol',
      pistol: {
        name: 'M9 TACTICAL 9MM',
        clip: 15,
        maxClip: 15,
        reserve: 45,
        damage: 36,
        fireRate: 0.22,
        lastFireTime: 0,
        reloadTime: 1.4,
        isReloading: false,
        recoil: 0.04,
        range: 65,
        isAuto: false
      },
      shotgun: {
        name: 'REMINGTON 870 TACTICAL',
        clip: 8,
        maxClip: 8,
        reserve: 24,
        damage: 90,
        fireRate: 0.85,
        lastFireTime: 0,
        reloadTime: 2.2,
        isReloading: false,
        recoil: 0.12,
        range: 35,
        isAuto: false
      },
      rifle: {
        name: 'AK-47 HYBRID ASSAULT',
        clip: 30,
        maxClip: 30,
        reserve: 90,
        damage: 28,
        fireRate: 0.11,
        lastFireTime: 0,
        reloadTime: 1.9,
        isReloading: false,
        recoil: 0.06,
        range: 90,
        isAuto: true
      },
      mine: {
        name: 'M26 PROXIMITY LASER MINE',
        clip: 3,
        maxClip: 3,
        reserve: 0,
        damage: 280,
        fireRate: 1.0,
        lastFireTime: 0,
        reloadTime: 0.5,
        isReloading: false,
        recoil: 0.01,
        range: 5,
        isAuto: false
      },
      flamer: {
        name: 'PYRE-X HEAVY INCINERATOR',
        clip: 100,
        maxClip: 100,
        reserve: 200,
        damage: 22,
        fireRate: 0.06,
        lastFireTime: 0,
        reloadTime: 2.5,
        isReloading: false,
        recoil: 0.02,
        range: 18,
        isAuto: true
      }
    },

    inventory: [
      { id: 'medkit', name: 'Field Medkit', type: 'med', qty: 2, icon: '🩹', desc: 'Restores +50 Health & stops moderate bleeding.' },
      { id: 'ammo_pistol', name: '9mm Ammo Box', type: 'ammo', qty: 30, icon: '📦', desc: 'Standard 9mm hollow point rounds.' },
      { id: 'ammo_shotgun', name: '12G Buckshot', type: 'ammo', qty: 16, icon: '💥', desc: 'Heavy close-quarters shotgun shells.' },
      { id: 'ammo_rifle', name: '7.62mm Rifle Mag', type: 'ammo', qty: 60, icon: '🎯', desc: 'High-penetration assault carbine cartridges.' },
      { id: 'ammo_flamer', name: 'Pyre-X Napalm Canister', type: 'ammo', qty: 150, icon: '🔥', desc: 'Volatile fuel for the Pyre-X Incinerator.' },
      { id: 'battery', name: 'Lithium Cell', type: 'item', qty: 3, icon: '🔋', desc: 'Recharges flashlight battery by +50%.' },
      { id: 'cloth', name: 'Sterile Cloth', type: 'mat', qty: 4, icon: '🧶', desc: 'Scavenged medical bandage cloth.' },
      { id: 'antiseptic', name: 'Antiseptic Solution', type: 'mat', qty: 3, icon: '🧪', desc: 'Disinfectant compound.' },
      { id: 'scrap_metal', name: 'Scrap Metal', type: 'mat', qty: 6, icon: '🔩', desc: 'Machined steel plating.' },
      { id: 'gunpowder', name: 'Explosive Gunpowder', type: 'mat', qty: 4, icon: '💣', desc: 'Volatile propellant.' },
      { id: 'gas_filter', name: 'Hazmat Gas Filter', type: 'item', qty: 2, icon: '☣️', desc: 'Restores Gas Mask filter to 100% in bio-zones.' },
      { id: 'datapad_1', name: 'Incident Record #01', type: 'lore', qty: 1, icon: '💾', desc: 'Dr. Vance frequency recording #01.' }
    ],
    selectedInvIndex: 0,
    selectedRecipeIndex: 0,

    craftingRecipes: [
      {
        id: 'craft_medkit_adv',
        name: 'Advanced Trauma Kit',
        icon: '🩹',
        desc: 'Heals +75 Health & eliminates all biological infection and bleeding.',
        reqs: [{ id: 'cloth', name: 'Sterile Cloth', qty: 2 }, { id: 'antiseptic', name: 'Antiseptic Solution', qty: 1 }],
        result: { id: 'medkit_adv', name: 'Advanced Trauma Kit', type: 'med', qty: 1, icon: '🩹', desc: 'Heals +75 Health & clears infection.' }
      },
      {
        id: 'craft_adrenaline',
        name: 'Adrenaline Syringe',
        icon: '💉',
        desc: 'Provides +30% Sprint Speed and Infinite Stamina for 25 seconds.',
        reqs: [{ id: 'antiseptic', name: 'Antiseptic Solution', qty: 1 }, { id: 'scrap_metal', name: 'Scrap Metal', qty: 1 }],
        result: { id: 'adrenaline', name: 'Adrenaline Syringe', type: 'buff', qty: 1, icon: '💉', desc: 'Grants +30% Speed & Infinite Stamina.' }
      },
      {
        id: 'craft_reflex_serum',
        name: 'Focus Euphoria (Bullet-Time)',
        icon: '💉',
        desc: 'Slows down mutant perception time by 50% for 8 seconds.',
        reqs: [{ id: 'antiseptic', name: 'Antiseptic Solution', qty: 2 }, { id: 'battery', name: 'Lithium Cell', qty: 1 }],
        result: { id: 'serum_reflex', name: 'Focus Reflex Syringe', type: 'serum_reflex', qty: 1, icon: '💉', desc: 'Activates reflex bullet time.' }
      },
      {
        id: 'craft_armor_serum',
        name: 'Iron-Skin Bio-Serum',
        icon: '🧪',
        desc: 'Hardens skin keratin, granting 60% damage reduction for 20 seconds.',
        reqs: [{ id: 'scrap_metal', name: 'Scrap Metal', qty: 2 }, { id: 'antiseptic', name: 'Antiseptic Solution', qty: 1 }],
        result: { id: 'serum_armor', name: 'Iron-Skin Bio-Serum', type: 'serum_armor', qty: 1, icon: '🧪', desc: '+60% Damage resistance.' }
      },
      {
        id: 'craft_flamer_fuel',
        name: 'Pyre-X Napalm Refill',
        icon: '🔥',
        desc: 'Synthesizes 80 canisters of high-temperature incendiary fuel.',
        reqs: [{ id: 'gunpowder', name: 'Explosive Gunpowder', qty: 2 }, { id: 'antiseptic', name: 'Antiseptic Solution', qty: 1 }],
        result: { id: 'ammo_flamer', name: 'Pyre-X Napalm Canister', type: 'ammo', qty: 80, icon: '🔥', desc: 'Flamethrower ammo.' }
      },
      {
        id: 'craft_prox_mine',
        name: 'Proximity Laser Mine',
        icon: '💣',
        desc: 'Deployable laser-triggered ground mine. Deals 280 AoE damage.',
        reqs: [{ id: 'scrap_metal', name: 'Scrap Metal', qty: 2 }, { id: 'gunpowder', name: 'Explosive Gunpowder', qty: 1 }, { id: 'battery', name: 'Lithium Cell', qty: 1 }],
        result: { id: 'prox_mine', name: 'Proximity Laser Mine', type: 'mine', qty: 1, icon: '💣', desc: 'Placeable explosive trap.' }
      },
      {
        id: 'craft_sentry',
        name: 'Auto-Defense Sentry Turret',
        icon: '🛡️',
        desc: 'Autonomous robotic turret that targets and neutralizes approaching mutants.',
        reqs: [{ id: 'scrap_metal', name: 'Scrap Metal', qty: 3 }, { id: 'gunpowder', name: 'Explosive Gunpowder', qty: 2 }, { id: 'battery', name: 'Lithium Cell', qty: 2 }],
        result: { id: 'sentry_item', name: 'Auto-Defense Sentry Turret', type: 'sentry', qty: 1, icon: '🛡️', desc: 'Deployable AI turret.' }
      },
      {
        id: 'craft_filter',
        name: 'Hazmat Respirator Filter',
        icon: '☣️',
        desc: 'Restores Gas Mask Filter to 100% integrity.',
        reqs: [{ id: 'cloth', name: 'Sterile Cloth', qty: 2 }, { id: 'antiseptic', name: 'Antiseptic Solution', qty: 1 }],
        result: { id: 'gas_filter', name: 'Hazmat Gas Filter', type: 'item', qty: 1, icon: '☣️', desc: 'Restores gas filter.' }
      }
    ],

    // Campaign & Endless Horde System
    mission: {
      chapter: 1,
      title: 'PROLOGUE: Signal in the Mist',
      desc: 'Locate the Diesel Fuel Canister & Blue Keycard to restore Station Omega-9 Power Substation.',
      task: 'Find Diesel Fuel Canister & Blue Keycard in perimeter sheds',
      hasBlueKeycard: false,
      hasRedKeycard: false,
      hasFuel: false,
      hasBioDomeKey: false,
      generatorRunning: false,
      dataDownloaded: false,
      screamerEliminated: false,
      goliathEliminated: false,
      veilEliminated: false,
      extractionActive: false,
      extractionTimeLeft: 45
    },

    horde: {
      wave: 1,
      maxWaves: 15,
      enemiesRemaining: 0,
      waveActive: false,
      timeBetweenWaves: 10,
      nextWaveTimer: 0
    },

    activeBoss: null, // Holds current boss enemy object
    activeEnding: null,
    worldObjects: [],
    enemies: [],
    lootBoxes: [],
    deployedMines: [],
    deployedTurrets: [],
    particles: [],
    stationLights: [],

    input: {
      forward: 0,
      right: 0,
      touchLookDeltaX: 0,
      touchLookDeltaY: 0,
      keys: {}
    }
  };

  // --- 3. THREE.JS 3D WORLD BUILDER ---
  function init3D() {
    if (typeof THREE === 'undefined') {
      console.error('THREE.js library not loaded!');
      return;
    }

    const canvas = document.getElementById('game-canvas');

    // 1. Scene & Horror Fog
    Game.scene = new THREE.Scene();
    Game.scene.background = new THREE.Color(0x030508);
    Game.scene.fog = new THREE.FogExp2(0x05080e, 0.026);

    // 2. Camera
    Game.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 300);
    Game.camera.position.set(Game.player.position.x, Game.player.position.y, Game.player.position.z);

    // 3. Renderer
    try {
      Game.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        powerPreference: 'default',
        precision: 'mediump',
        failIfMajorPerformanceCaveat: false,
        alpha: false,
        depth: true
      });
    } catch (err) {
      Game.renderer = new THREE.WebGLRenderer({ canvas: canvas });
    }

    Game.renderer.setSize(window.innerWidth, window.innerHeight);
    Game.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    Game.renderer.shadowMap.enabled = true;
    Game.renderer.shadowMap.type = THREE.BasicShadowMap;

    Game.clock = new THREE.Clock();

    // 4. Lighting Rig & Weather
    const ambientLight = new THREE.AmbientLight(0x0e1726, 0.8);
    Game.scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    moonLight.position.set(50, 90, -40);
    Game.scene.add(moonLight);

    // Lightning Flash Light
    const lightning = new THREE.PointLight(0xffffff, 0, 300);
    lightning.position.set(0, 70, 0);
    Game.scene.add(lightning);
    Game.weather.lightningLight = lightning;

    // 5. Flashlight Setup (Mounted to Camera)
    const flashlight = new THREE.SpotLight(0xfff7ed, 3.4, 50, Math.PI / 6.5, 0.4, 1.2);
    flashlight.position.set(0, 0, 0);
    const flashTarget = new THREE.Object3D();
    flashTarget.position.set(0, 0, -10);
    Game.camera.add(flashlight);
    Game.camera.add(flashTarget);
    flashlight.target = flashTarget;
    Game.player.flashlightLight = flashlight;
    Game.scene.add(Game.camera);

    // 6. Rain Weather Simulation (Phase 4)
    buildRainWeather();

    // 7. Build Expanded Multi-Sector & Subterranean Complex
    buildCompoundWorld();

    // 8. Spawn Initial Bestiaries & Loot
    spawnInitialEnemies();
    spawnWorldLoot();

    // 9. Build 3D Weapon Models (First Person)
    buildFirstPersonWeapons();
  }

  // --- 4. WORLD CONSTRUCTION & SUBTERRANEAN BIO-DOME ---
  function buildRainWeather() {
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = Math.random() * 40;
      positions[i + 2] = (Math.random() - 0.5) * 120;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.25,
      transparent: true,
      opacity: 0.5
    });

    const rain = new THREE.Points(rainGeo, rainMat);
    Game.scene.add(rain);
    Game.weather.rainParticles = rain;
  }

  function buildCompoundWorld() {
    // Terrain Ground Mesh
    const groundGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x0f141c });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    Game.scene.add(ground);

    // SECTOR 1: Perimeter Pine Trees & Forest
    const treeGeoCone = new THREE.ConeGeometry(2.4, 6, 6);
    const treeGeoTrunk = new THREE.CylinderGeometry(0.3, 0.4, 2.2, 5);
    const pineMat = new THREE.MeshLambertMaterial({ color: 0x071a10 });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x22150e });

    for (let i = 0; i < 65; i++) {
      const x = (Math.random() - 0.5) * 260;
      const z = (Math.random() - 0.5) * 260;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeGeoTrunk, trunkMat);
      trunk.position.y = 1.1;
      const foliage = new THREE.Mesh(treeGeoCone, pineMat);
      foliage.position.y = 4.2;
      tree.add(trunk);
      tree.add(foliage);
      tree.position.set(x, 0, z);
      tree.scale.setScalar(0.8 + Math.random() * 0.6);
      Game.scene.add(tree);
    }

    // SECTOR 2: Power Substation (West, x: -38, z: 12)
    buildSubstation(-38, 12);

    // SECTOR 3: Station Omega-9 Main Research Complex (Center, x: 0, z: -32)
    buildMainResearchFacility(0, -32);

    // SECTOR 4: Medical Quarantine Bay (East, x: 42, z: -22)
    buildMedicalQuarantineBay(42, -22);

    // SECTOR 5: Subterranean Vault Alpha (South-East, x: 32, z: 48)
    buildVaultAlpha(32, 48);

    // SECTOR 6: Sub-Level 2 Bio-Dome Complex (South-West, x: -45, z: 50) - Phase 6
    buildSubterraneanBioDome(-45, 50);

    // SECTOR 7: Northern Ridge Extraction Helipad (North, x: 0, z: -95)
    buildExtractionHelipad(0, -95);

    // Watchtowers & Perimeter Fences
    buildWatchtower(-50, -50);
    buildWatchtower(50, -50);
    buildWatchtower(-50, 50);
  }

  function buildSubstation(x, z) {
    const group = new THREE.Group();
    const genMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    genMesh.position.y = 1.3;
    group.add(genMesh);

    const coil1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.6, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    coil1.position.set(-3, 1.8, -2);
    const coil2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.6, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    coil2.position.set(3, 1.8, -2);
    group.add(coil1); group.add(coil2);

    const switchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
    switchMesh.position.set(0, 1.6, 1.6);
    group.add(switchMesh);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'generator',
      position: { x: x, y: 1.5, z: z + 2 },
      radius: 3.5,
      prompt: 'ACTIVATE EMERGENCY POWER GENERATOR',
      action: () => triggerGeneratorActivation()
    });
  }

  function buildMainResearchFacility(x, z) {
    const group = new THREE.Group();
    const bldg = new THREE.Mesh(new THREE.BoxGeometry(30, 7.5, 26), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    bldg.position.y = 3.75;
    group.add(bldg);

    const terminal = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.2), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
    terminal.position.set(0, 1.1, 0);
    group.add(terminal);

    const floodlight = new THREE.PointLight(0x38bdf8, 0, 40);
    floodlight.position.set(0, 7, 14);
    group.add(floodlight);
    Game.stationLights.push(floodlight);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'terminal',
      position: { x: x, y: 1.5, z: z },
      radius: 3.5,
      prompt: 'DECRYPT RESEARCH MAINFRAME TERMINAL',
      action: () => triggerMainframeDecrypt()
    });
  }

  function buildMedicalQuarantineBay(x, z) {
    const group = new THREE.Group();
    const medBldg = new THREE.Mesh(new THREE.BoxGeometry(18, 5.5, 16), new THREE.MeshLambertMaterial({ color: 0x181e2b }));
    medBldg.position.y = 2.75;
    group.add(medBldg);

    const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 12), new THREE.MeshLambertMaterial({ color: 0x10b981, transparent: true, opacity: 0.75 }));
    pod.position.set(0, 1.6, 0);
    group.add(pod);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'med_cabinet',
      position: { x: x, y: 1.2, z: z + 3 },
      radius: 2.8,
      prompt: 'OPEN MEDICAL SUPPLIES RACK',
      action: () => {
        addInventoryItem({ id: 'medkit_adv', name: 'Advanced Trauma Kit', type: 'med', qty: 1, icon: '🩹', desc: 'Heals +75 Health & clears infection.' });
        addInventoryItem({ id: 'antiseptic', name: 'Antiseptic Solution', type: 'mat', qty: 2, icon: '🧪', desc: 'Disinfectant compound.' });
        showCombatLog('Acquired Advanced Medical Supplies!', '#10b981');
        Game.audio.playLootPickup();
      }
    });
  }

  function buildVaultAlpha(x, z) {
    const group = new THREE.Group();
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(18, 4.5, 16), new THREE.MeshLambertMaterial({ color: 0x0b1120 }));
    bunker.position.y = 2.25;
    group.add(bunker);

    const blastDoor = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.5, 1), new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
    blastDoor.position.set(0, 1.75, 8.1);
    group.add(blastDoor);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'vault_door',
      position: { x: x, y: 1.5, z: z + 8.5 },
      radius: 3.8,
      prompt: 'UNLOCK CONTAINMENT VAULT ALPHA (REQUIRES RED KEYCARD)',
      action: () => triggerVaultUnlock()
    });
  }

  // Phase 6: Subterranean Bio-Dome Complex
  function buildSubterraneanBioDome(x, z) {
    const group = new THREE.Group();
    // Glass Geodesic Bio-Dome
    const domeGeo = new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshLambertMaterial({ color: 0x059669, transparent: true, opacity: 0.45, wireframe: false });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0;
    group.add(dome);

    // Bioluminescent Cryo Pods inside
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const cryo = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.8, 8), new THREE.MeshLambertMaterial({ color: 0x06b6d4 }));
      cryo.position.set(Math.cos(angle) * 6, 1.4, Math.sin(angle) * 6);
      group.add(cryo);
    }

    // Bio-Hazard Toxic Mist Light
    const bioLight = new THREE.PointLight(0x10b981, 1.5, 25);
    bioLight.position.set(0, 3, 0);
    group.add(bioLight);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'biodome_terminal',
      position: { x: x, y: 1.5, z: z },
      radius: 4.5,
      prompt: 'OVERRIDE SUB-LEVEL 2 CRYO-STASIS TERMINAL',
      action: () => triggerBioDomeTerminal()
    });
  }

  function buildExtractionHelipad(x, z) {
    const group = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.6, 24), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    pad.position.y = 0.3;
    group.add(pad);

    const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    hBar1.position.set(-2.5, 0.65, 0);
    const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    hBar2.position.set(2.5, 0.65, 0);
    const hBar3 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.05, 1.2), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    hBar3.position.set(0, 0.65, 0);
    group.add(hBar1); group.add(hBar2); group.add(hBar3);

    const stand = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 1), new THREE.MeshLambertMaterial({ color: 0xf97316 }));
    stand.position.set(0, 0.9, 10);
    group.add(stand);

    group.position.set(x, 0, z);
    Game.scene.add(group);

    Game.worldObjects.push({
      type: 'helipad_flare',
      position: { x: x, y: 1.5, z: z + 10 },
      radius: 4.0,
      prompt: 'LAUNCH EXTRACTION FLARE & CALL VANGUARD-01 CHOPPER',
      action: () => triggerExtractionFlare()
    });
  }

  function buildWatchtower(x, z) {
    const group = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 9, 6);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const l1 = new THREE.Mesh(legGeo, legMat); l1.position.set(-2, 4.5, -2);
    const l2 = new THREE.Mesh(legGeo, legMat); l2.position.set(2, 4.5, -2);
    const l3 = new THREE.Mesh(legGeo, legMat); l3.position.set(-2, 4.5, 2);
    const l4 = new THREE.Mesh(legGeo, legMat); l4.position.set(2, 4.5, 2);
    group.add(l1); group.add(l2); group.add(l3); group.add(l4);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 5), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    cabin.position.y = 10;
    group.add(cabin);

    group.position.set(x, 0, z);
    Game.scene.add(group);
  }

  // --- 5. EXPANDED BESTIARY & BOSS CREATURES (6 DISTINCT SPECIES) ---
  function spawnInitialEnemies() {
    // 1. The Hollows (Standard Bipedal Swarmers)
    createEnemy('hollow', 12, -15, 100, 1.8);
    createEnemy('hollow', -20, 25, 100, 1.8);
    createEnemy('hollow', 28, 10, 100, 1.8);

    // 2. The Crawler (Agile Fast Quadruped)
    createEnemy('crawler', -30, -35, 75, 2.7);
    createEnemy('crawler', 35, -45, 75, 2.7);

    // 3. The Screamer (Elite Sonic Disrupter)
    createEnemy('screamer', 42, -22, 160, 1.4);

    // 4. The Veil (Apex Camouflaged Stalker Boss)
    createEnemy('veil', 32, 50, 340, 2.2);

    // 5. The Bio-Goliath (Titan Boss in Subterranean Bio-Dome) - Phase 7
    createEnemy('goliath', -45, 50, 500, 1.3);
  }

  function createEnemy(type, x, z, health, speed) {
    const group = new THREE.Group();
    let meshColor = 0x854d0e;
    let scale = 1.0;

    if (type === 'crawler') {
      meshColor = 0x475569;
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 2.2), new THREE.MeshLambertMaterial({ color: meshColor }));
      body.position.y = 0.5;
      group.add(body);
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      eyeL.position.set(-0.35, 0.6, -1.0);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      eyeR.position.set(0.35, 0.6, -1.0);
      group.add(eyeL); group.add(eyeR);
      scale = 0.9;

    } else if (type === 'screamer') {
      meshColor = 0x7e22ce;
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 2.4, 8), new THREE.MeshLambertMaterial({ color: meshColor }));
      torso.position.y = 1.6;
      group.add(torso);
      const vocalSack = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
      vocalSack.position.set(0, 2.3, 0.3);
      group.add(vocalSack);
      scale = 1.2;

    } else if (type === 'veil') {
      meshColor = 0x09090b;
      const shroud = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 8), new THREE.MeshLambertMaterial({
        color: meshColor,
        transparent: true,
        opacity: 0.75
      }));
      shroud.position.y = 1.6;
      group.add(shroud);
      const coreL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      coreL.position.set(-0.3, 2.4, 0.4);
      const coreR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      coreR.position.set(0.3, 2.4, 0.4);
      group.add(coreL); group.add(coreR);
      scale = 1.35;

    } else if (type === 'goliath') {
      // Phase 7: Bio-Goliath Titan Juggernaut
      meshColor = 0x450a0a; // Deep crimson muscle
      const goliathBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 2.2), new THREE.MeshLambertMaterial({ color: meshColor }));
      goliathBody.position.y = 2.0;
      group.add(goliathBody);

      const armoredPlate = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 1.2), new THREE.MeshLambertMaterial({ color: 0x1f2937 }));
      armoredPlate.position.set(0, 2.4, 1.0);
      group.add(armoredPlate);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      eye.position.set(0, 3.2, 0.9);
      group.add(eye);
      scale = 1.6;

    } else {
      // Standard Hollow
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.6), new THREE.MeshLambertMaterial({ color: 0x581c87 }));
      body.position.y = 1.2;
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshLambertMaterial({ color: 0x9333ea }));
      head.position.y = 2.2;
      group.add(head);
    }

    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    Game.scene.add(group);

    const enemyObj = {
      type: type,
      mesh: group,
      health: health,
      maxHealth: health,
      speed: speed,
      state: 'patrol',
      patrolOrigin: { x: x, z: z },
      attackCooldown: 0,
      specialCooldown: 0,
      burnTicks: 0,
      isAlive: true
    };

    Game.enemies.push(enemyObj);
    return enemyObj;
  }

  function spawnWorldLoot() {
    spawnLootItem('fuel_canister', 'Diesel Fuel Canister', '⛽', -30, 16, () => {
      Game.mission.hasFuel = true;
      showCombatLog('Recovered Diesel Fuel Canister!', '#38bdf8');
      updateMissionHUD();
    });

    spawnLootItem('keycard_blue', 'Blue Station Keycard', '💳', 22, 20, () => {
      Game.mission.hasBlueKeycard = true;
      showCombatLog('Acquired Blue Security Keycard!', '#38bdf8');
      updateMissionHUD();
    });

    spawnLootItem('ammo_shotgun', 'Shotgun Ammo Cache', '💥', -48, -48, () => {
      Game.weapons.shotgun.reserve += 16;
      showCombatLog('Found 16x 12-Gauge Buckshot Shells!', '#eab308');
      updateWeaponHUD();
    });

    spawnLootItem('sentry_kit', 'Sentry Turret Kit', '🛡️', -42, 45, () => {
      addInventoryItem({ id: 'sentry_item', name: 'Auto-Defense Sentry Turret', type: 'sentry', qty: 1, icon: '🛡️', desc: 'Deployable AI turret.' });
      showCombatLog('Acquired Auto-Defense Sentry Turret!', '#10b981');
    });
  }

  function spawnLootItem(id, name, icon, x, z, onPickup) {
    const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const mat = new THREE.MeshLambertMaterial({ color: 0xeab308 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.4, z);
    Game.scene.add(mesh);

    Game.lootBoxes.push({
      id: id,
      name: name,
      icon: icon,
      mesh: mesh,
      position: { x: x, y: 0.4, z: z },
      isCollected: false,
      onPickup: onPickup
    });
  }

  // --- 6. FIRST PERSON WEAPONS, ATTACHMENTS & MELEE SYSTEM ---
  function buildFirstPersonWeapons() {
    const gunGroup = new THREE.Group();

    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.6), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    barrel.position.set(0.28, -0.22, -0.6);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.16), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    grip.position.set(0.28, -0.38, -0.42);
    grip.rotation.x = 0.3;

    // Suppressor attachment cylinder (Toggleable)
    const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }));
    suppressor.rotation.x = Math.PI / 2;
    suppressor.position.set(0.28, -0.22, -0.95);
    suppressor.visible = false;
    gunGroup.add(suppressor);
    gunGroup.suppressorMesh = suppressor;

    gunGroup.add(barrel);
    gunGroup.add(grip);

    Game.camera.add(gunGroup);
    Game.player.weaponMesh = gunGroup;
  }

  function fireCurrentWeapon() {
    if (Game.isGameOver || Game.isPaused) return;
    const wep = Game.weapons[Game.weapons.current];

    if (wep.isReloading) return;

    if (Game.weapons.current === 'mine') {
      deployProximityMine();
      return;
    }

    if (wep.clip <= 0) {
      Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 300, 0.3);
      reloadCurrentWeapon();
      return;
    }

    const now = Game.clock.getElapsedTime();
    if (now - wep.lastFireTime < wep.fireRate) return;

    wep.lastFireTime = now;
    wep.clip--;

    // Audio & Screen Muzzle Flash
    if (Game.weapons.current === 'flamer') {
      Game.audio.playFlamethrower();
    } else {
      Game.audio.playGunshot(Game.weapons.current, Game.tactical.isSuppressed);
    }
    applyRecoil(wep.recoil);
    triggerMuzzleFlash();
    updateWeaponHUD();

    // Alert creatures within radius if not suppressed
    if (!Game.tactical.isSuppressed) {
      alertNearbyEnemies(32);
    }

    // Raycast Projectile
    if (Game.weapons.current === 'shotgun') {
      for (let i = 0; i < 8; i++) {
        castBulletRay(wep.damage / 8, 0.06, wep.range);
      }
    } else if (Game.weapons.current === 'flamer') {
      for (let i = 0; i < 4; i++) {
        castBulletRay(wep.damage / 4, 0.08, wep.range);
      }
      unlockAchievement('pyro_tech', 'Purifying Flames', 'Ignited bio-mutants with the Pyre-X Incinerator', '🔥');
    } else {
      castBulletRay(wep.damage, 0.015, wep.range);
    }
  }

  function castBulletRay(damage, spreadAngle, maxDist) {
    const raycaster = new THREE.Raycaster();
    const spreadX = (Math.random() - 0.5) * spreadAngle;
    const spreadY = (Math.random() - 0.5) * spreadAngle;
    raycaster.setFromCamera(new THREE.Vector2(spreadX, spreadY), Game.camera);

    const hitTargets = [];
    Game.enemies.forEach(e => {
      if (e.isAlive) hitTargets.push(e.mesh);
    });

    const intersects = raycaster.intersectObjects(hitTargets, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      let targetEnemy = null;
      Game.enemies.forEach(e => {
        if (e.mesh === hit.object || e.mesh.children.includes(hit.object) || e.mesh.getObjectById(hit.object.id)) {
          targetEnemy = e;
        }
      });

      if (targetEnemy && targetEnemy.isAlive) {
        damageEnemy(targetEnemy, damage, hit.point);
        showHitMarker();
      }
    }
  }

  function performKnifeMelee() {
    if (Game.isGameOver || Game.isPaused) return;
    Game.audio.playKnifeSlice();
    showCombatLog('Executed Combat Knife Strike!', '#f8fafc');

    const p = Game.player.position;
    Game.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.mesh.position.x - p.x;
      const dz = e.mesh.position.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3.2) {
        damageEnemy(e, 85, e.mesh.position);
        showHitMarker();
      }
    });
  }

  function deploySentryTurret() {
    const p = Game.player.position;
    const yaw = Game.player.rotation.yaw;
    const tx = p.x - Math.sin(yaw) * 2.5;
    const tz = p.z - Math.cos(yaw) * 2.5;

    const turretGroup = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.8, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    base.position.y = 0.4;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.9), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
    head.position.y = 0.9;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.9, -0.5);

    turretGroup.add(base); turretGroup.add(head); turretGroup.add(barrel);
    turretGroup.position.set(tx, 0, tz);
    Game.scene.add(turretGroup);

    Game.deployedTurrets.push({
      mesh: turretGroup,
      headMesh: head,
      x: tx,
      z: tz,
      fireRate: 0.18,
      lastFire: 0,
      range: 22,
      ammo: 120
    });

    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 900, 0.4);
    showCombatLog('Auto-Defense Sentry Turret Deployed!', '#10b981');
  }

  function damageEnemy(enemy, amount, hitPoint) {
    enemy.health -= amount;
    enemy.state = 'chase';
    showCombatLog(`Dealt ${Math.round(amount)} DMG to ${enemy.type.toUpperCase()}`, '#f87171');

    // Update Boss UI if active boss
    if (Game.activeBoss === enemy) {
      updateBossHUD();
    }

    if (enemy.health <= 0) {
      enemy.isAlive = false;
      enemy.health = 0;
      Game.kills++;
      Game.score += 150;
      Game.scene.remove(enemy.mesh);
      Game.audio.playMonsterAttack();
      showCombatLog(`ELIMINATED: ${enemy.type.toUpperCase()}! (+150 PTS)`, '#eab308');

      if (Game.activeBoss === enemy) {
        hideBossHUD();
      }

      // Check Boss Drops
      if (enemy.type === 'screamer') {
        Game.mission.screamerEliminated = true;
        showCombatLog('The Screamer dropped Red Master Keycard!', '#ef4444');
        Game.mission.hasRedKeycard = true;
        triggerRadioComms('VANGUARD-01', 'Hostile bio-screamer neutralized. Proceed to Vault Alpha!');
        updateMissionHUD();
        Game.audio.playObjectiveSuccess();
      } else if (enemy.type === 'goliath') {
        Game.mission.goliathEliminated = true;
        showCombatLog('Bio-Goliath Titan Obliterated! Bio-Dome Secured!', '#10b981');
        triggerRadioComms('OVERSEER COMMAND', 'Bio-Goliath sample destroyed. Security seals disengaged.');
        updateMissionHUD();
        Game.audio.playObjectiveSuccess();
      } else if (enemy.type === 'veil') {
        Game.mission.veilEliminated = true;
        showCombatLog('Apex Veil Banished! Extraction Path Open!', '#10b981');
        triggerRadioComms('VANGUARD-01', 'LZ is clear! Launch the distress flare at the Helipad!');
        updateMissionHUD();
        Game.audio.playObjectiveSuccess();
      }

      if (Game.gameMode === 'horde') {
        Game.horde.enemiesRemaining--;
        updateHordeHUD();
        if (Game.horde.enemiesRemaining <= 0) {
          triggerHordeWaveComplete();
        }
      }

      // Log session to Android Bridge
      if (window.AndroidBridge) {
        window.AndroidBridge.recordSession(Game.kills, Math.floor((Date.now() - Game.startTime) / 1000), Game.score);
      }
    }
  }

  function alertNearbyEnemies(radius) {
    const p = Game.player.position;
    Game.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.mesh.position.x - p.x;
      const dz = e.mesh.position.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        e.state = 'chase';
      }
    });
  }

  function deployProximityMine() {
    const wep = Game.weapons.mine;
    if (wep.clip <= 0) {
      showCombatLog('No Proximity Mines remaining!', '#ef4444');
      return;
    }

    wep.clip--;
    updateWeaponHUD();
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 900, 0.5);

    const p = Game.player.position;
    const yaw = Game.player.rotation.yaw;
    const mx = p.x - Math.sin(yaw) * 2;
    const mz = p.z - Math.cos(yaw) * 2;

    const mineMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.15, 12),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    mineMesh.position.set(mx, 0.08, mz);

    const laser = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 3.2, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
    );
    laser.rotation.x = -Math.PI / 2;
    laser.position.set(mx, 0.09, mz);

    Game.scene.add(mineMesh);
    Game.scene.add(laser);

    Game.deployedMines.push({
      mesh: mineMesh,
      laserMesh: laser,
      x: mx,
      z: mz,
      radius: 3.2,
      damage: 280,
      isArmed: true
    });

    showCombatLog('M26 Proximity Laser Mine Armed!', '#ef4444');
  }

  function reloadCurrentWeapon() {
    const wep = Game.weapons[Game.weapons.current];
    if (wep.isReloading || wep.clip >= wep.maxClip || wep.reserve <= 0) return;

    wep.isReloading = true;
    Game.audio.playReload();
    showCombatLog(`Reloading ${wep.name}...`, '#38bdf8');

    setTimeout(() => {
      const needed = wep.maxClip - wep.clip;
      const take = Math.min(needed, wep.reserve);
      wep.clip += take;
      wep.reserve -= take;
      wep.isReloading = false;
      updateWeaponHUD();
    }, wep.reloadTime * 1000);
  }

  function switchWeapon(slotKey) {
    if (!Game.weapons[slotKey]) return;
    Game.weapons.current = slotKey;
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 700, 0.4);

    document.querySelectorAll('.quick-wep-btn').forEach(btn => {
      if (btn.dataset.wep === slotKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateWeaponHUD();
    showCombatLog(`Equipped: ${Game.weapons[slotKey].name}`, '#f8fafc');
  }

  function toggleSuppressor() {
    Game.tactical.isSuppressed = !Game.tactical.isSuppressed;
    const btn = document.getElementById('btn-toggle-suppressor');
    const status = document.getElementById('suppressor-status');
    if (btn) btn.classList.toggle('active', Game.tactical.isSuppressed);
    if (status) {
      status.textContent = Game.tactical.isSuppressed ? 'SUPPRESSED' : 'LOUD';
      status.style.color = Game.tactical.isSuppressed ? '#10b981' : '#94a3b8';
    }
    if (Game.player.weaponMesh && Game.player.weaponMesh.suppressorMesh) {
      Game.player.weaponMesh.suppressorMesh.visible = Game.tactical.isSuppressed;
    }
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 850, 0.3);
    showCombatLog(Game.tactical.isSuppressed ? 'Attached Tactical Suppressor (Stealth)' : 'Detached Suppressor (Standard)', '#38bdf8');
  }

  function toggleNVG() {
    Game.tactical.nvgActive = !Game.tactical.nvgActive;
    const nvg = document.getElementById('nvg-overlay');
    const btn = document.getElementById('btn-toggle-nvg');
    if (nvg) nvg.classList.toggle('hidden', !Game.tactical.nvgActive);
    if (btn) btn.classList.toggle('active', Game.tactical.nvgActive);
    Game.audio.playNVGBeep();
    showCombatLog(Game.tactical.nvgActive ? 'Night Vision Optics [NVG] Engaged' : 'Night Vision Optics Disengaged', '#10b981');
  }

  function toggleGasMask() {
    Game.tactical.gasMaskActive = !Game.tactical.gasMaskActive;
    const mask = document.getElementById('gasmask-overlay');
    const btn = document.getElementById('btn-toggle-mask');
    if (mask) mask.classList.toggle('hidden', !Game.tactical.gasMaskActive);
    if (btn) btn.classList.toggle('active', Game.tactical.gasMaskActive);
    Game.audio.playGasMaskBreath();
    showCombatLog(Game.tactical.gasMaskActive ? 'Hazmat Gas Mask Sealed' : 'Hazmat Gas Mask Removed', '#06b6d4');
  }

  function toggleThermalVision() {
    Game.tactical.thermalActive = !Game.tactical.thermalActive;
    const thermal = document.getElementById('thermal-overlay');
    const btn = document.getElementById('btn-toggle-thermal');
    if (thermal) thermal.classList.toggle('hidden', !Game.tactical.thermalActive);
    if (btn) btn.classList.toggle('active', Game.tactical.thermalActive);
    Game.audio.playThermalHum();
    showCombatLog(Game.tactical.thermalActive ? 'FLIR Thermal Heat-Seeking Engaged' : 'FLIR Thermal Optics Disengaged', '#f59e0b');
    unlockAchievement('thermal_master', 'Thermal Predator', 'Used FLIR thermal imaging to track bio-signatures in the dark', '🔥');
  }

  function triggerEMPBlast() {
    Game.audio.playEMPBlast();
    showCombatLog('ELECTROMAGNETIC PULSE DETONATED! ALL CREATURES BLINDED!', '#38bdf8');

    const p = Game.player.position;
    Game.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.mesh.position.x - p.x;
      const dz = e.mesh.position.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 32) {
        e.state = 'stunned';
        e.attackCooldown = 5.0; // Stun for 5 seconds
        damageEnemy(e, 35, e.mesh.position);
      }
    });

    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.style.background = 'rgba(56, 189, 248, 0.5)';
      setTimeout(() => { flash.style.background = 'rgba(220, 38, 38, 0)'; }, 200);
    }
    unlockAchievement('emp_overload', 'High Voltage', 'Detonated an EMP blast neutralizing multiple bio-hostiles', '⚡');
  }

  function toggleDroneRecon() {
    Game.tactical.droneActive = !Game.tactical.droneActive;
    const hud = document.getElementById('drone-hud');
    const btn = document.getElementById('btn-deploy-drone');
    if (hud) hud.classList.toggle('hidden', !Game.tactical.droneActive);
    if (btn) btn.classList.toggle('active', Game.tactical.droneActive);

    if (Game.tactical.droneActive) {
      Game.tactical.dronePos.x = Game.player.position.x;
      Game.tactical.dronePos.z = Game.player.position.z;
      Game.tactical.dronePos.y = 22; // High altitude recon
      Game.audio.playDroneMotor();
      showCombatLog('UAV FPV Drone Launched. Aerial Reconnaissance Active.', '#38bdf8');
      unlockAchievement('drone_pilot', 'Skyward Sentinel', 'Deployed reconnaissance drone to scan perimeter', '🛸');
    } else {
      showCombatLog('UAV Drone Recalled to Operative Dock.', '#94a3b8');
    }
  }

  function exitDroneRecon() {
    Game.tactical.droneActive = false;
    const hud = document.getElementById('drone-hud');
    const btn = document.getElementById('btn-deploy-drone');
    if (hud) hud.classList.add('hidden');
    if (btn) btn.classList.remove('active');
    showCombatLog('Exited UAV Drone FPV Mode.', '#94a3b8');
  }

  function placeFortifiedBarricade() {
    const p = Game.player.position;
    const yaw = Game.player.rotation.yaw;
    const bx = p.x - Math.sin(yaw) * 2.2;
    const bz = p.z - Math.cos(yaw) * 2.2;

    const barMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.4, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    barMesh.position.set(bx, 0.7, bz);
    barMesh.rotation.y = yaw;
    Game.scene.add(barMesh);

    Game.tactical.barricades.push({
      mesh: barMesh,
      x: bx,
      z: bz,
      health: 200,
      isAlive: true
    });

    Game.audio.playBarricadeHammer();
    showCombatLog('Reinforced Steel Barricade Erected!', '#10b981');
    unlockAchievement('fort_builder', 'Defensive Bastion', 'Constructed a fortified barrier against the outbreak', '🧱');
  }

  function throwTacticalFlashbang() {
    Game.audio.playFlashbangTinnitus();
    showCombatLog('FLASHBANG DEPLOYED!', '#f8fafc');

    const overlay = document.getElementById('flashbang-overlay');
    if (overlay) {
      overlay.style.background = 'rgba(255, 255, 255, 0.95)';
      setTimeout(() => { overlay.style.background = 'rgba(255, 255, 255, 0)'; }, 600);
    }

    const p = Game.player.position;
    Game.enemies.forEach(e => {
      if (!e.isAlive) return;
      const dx = e.mesh.position.x - p.x;
      const dz = e.mesh.position.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 25) {
        e.state = 'stunned';
        e.attackCooldown = 4.5;
      }
    });
  }

  function callTacticalAirdrop() {
    if (Game.tactical.airdropState === 'incoming') {
      showCombatLog('Airdrop already inbound!', '#ef4444');
      return;
    }

    Game.tactical.airdropState = 'incoming';
    Game.audio.playAirdropSiren();
    showCombatLog('EMERGENCY SUPPLY AIRDROP CALLED! LZ MARKED BY SMOKE BEACON!', '#38bdf8');
    triggerRadioComms('OVERSEER COMMAND', 'Supply pod payload released. ETA 5 seconds.');

    const p = Game.player.position;
    const ax = p.x + (Math.random() * 8 - 4);
    const az = p.z + (Math.random() * 8 - 4);

    const pod = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.0, 2.0),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    pod.position.set(ax, 40, az);
    Game.scene.add(pod);

    const parachute = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 2, 8),
      new THREE.MeshLambertMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide })
    );
    parachute.position.set(ax, 42.2, az);
    Game.scene.add(parachute);

    const dropObj = { pod, parachute, x: ax, y: 40, z: az, landed: false };
    Game.tactical.airdropObj = dropObj;

    const dropInterval = setInterval(() => {
      if (!dropObj.landed) {
        dropObj.y -= 1.8;
        dropObj.pod.position.y = dropObj.y;
        dropObj.parachute.position.y = dropObj.y + 2.2;
        if (dropObj.y <= 1.0) {
          dropObj.landed = true;
          dropObj.y = 1.0;
          dropObj.pod.position.y = 1.0;
          Game.scene.remove(dropObj.parachute);
          clearInterval(dropInterval);
          Game.audio.playExplosion();
          showCombatLog('SUPPLY POD TOUCHDOWN! Open for heavy ammunition & serums!', '#10b981');
          spawnLootItem('airdrop_cache', 'High-Tier Airdrop Pod', '📦', ax, az, () => {
            Game.weapons.rifle.reserve += 90;
            Game.weapons.flamer.reserve += 150;
            Game.tactical.serums.reflex += 2;
            Game.tactical.serums.armor += 2;
            showCombatLog('Recovered Heavy Assault Munitions & Alchemy Serums!', '#38bdf8');
            updateWeaponHUD();
            updateSerumHUD();
          });
          unlockAchievement('airdrop_master', 'Apex Logistics', 'Called down emergency tactical airdrop payload', '📦');
        }
      }
    }, 100);
  }

  function injectBioSerum(type) {
    if (!Game.tactical.serums[type] || Game.tactical.serums[type] <= 0) {
      showCombatLog(`No ${type.toUpperCase()} serums remaining! Craft in backpack.`, '#ef4444');
      return;
    }

    Game.tactical.serums[type]--;
    Game.audio.playSerumInject();
    updateSerumHUD();

    if (type === 'reflex') {
      Game.tactical.bulletTimeActive = true;
      Game.tactical.bulletTimeTimer = 8.0;
      const overlay = document.getElementById('bullet-time-overlay');
      if (overlay) overlay.classList.remove('hidden');
      showCombatLog('FOCUS REFLEX INJECTED! BULLET-TIME 50% TIME DILATION ENGAGED!', '#38bdf8');
      unlockAchievement('bullet_time', 'Temporal Distortion', 'Activated Focus Reflex bullet-time serum in combat', '💉');
    } else if (type === 'armor') {
      Game.tactical.armorSerumActive = true;
      Game.tactical.armorSerumTimer = 20.0;
      showCombatLog('IRON-SKIN SERUM INJECTED! +60% DAMAGE MITIGATION ACTIVE!', '#10b981');
    } else if (type === 'stim') {
      Game.player.stamina = 100;
      Game.player.health = Math.min(Game.player.maxHealth, Game.player.health + 30);
      showCombatLog('NEURO-STIM INJECTED! STAMINA MAXED & +30 HP RESTORED!', '#eab308');
      updateStatsHUD();
    }
  }

  function updateSerumHUD() {
    const rQty = document.getElementById('serum-reflex-qty');
    const aQty = document.getElementById('serum-armor-qty');
    const sQty = document.getElementById('serum-stim-qty');
    if (rQty) rQty.textContent = `x${Game.tactical.serums.reflex}`;
    if (aQty) aQty.textContent = `x${Game.tactical.serums.armor}`;
    if (sQty) sQty.textContent = `x${Game.tactical.serums.stim}`;
  }

  function openHackingTerminal() {
    const modal = document.getElementById('hack-modal');
    if (modal) {
      modal.classList.remove('hidden');
      Game.audio.playHackBeep();
    }
  }

  function submitHackAttempt() {
    Game.audio.playHackSuccess();
    showCombatLog('CYBER MAINFRAME DECRYPTED! BLAST DOORS & ARMORY CACHES UNLOCKED!', '#10b981');
    const modal = document.getElementById('hack-modal');
    if (modal) modal.classList.add('hidden');
    Game.weapons.flamer.clip = Game.weapons.flamer.maxClip;
    Game.weapons.flamer.reserve += 100;
    updateWeaponHUD();
    unlockAchievement('master_hacker', 'Cyber Infiltrator', 'Successfully bypassed high-security mainframe terminal', '💻');
  }

  function selectOperativeClass(className) {
    Game.tactical.operativeClass = className;
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 900, 0.4);

    if (className === 'commando') {
      Game.player.speed = 5.2;
      Game.weapons.rifle.damage = 34;
      showCombatLog('Commando Class Selected: +20% Ballistic DMG & Rapid Movement', '#ef4444');
    } else if (className === 'infiltrator') {
      Game.player.speed = 5.6;
      showCombatLog('Infiltrator Class Selected: +30% Sprint Speed & Stealth Dampening', '#38bdf8');
    } else if (className === 'medic') {
      Game.player.maxHealth = 125;
      Game.player.health = 125;
      showCombatLog('Combat Medic Selected: +25 Max HP & Enhanced Trauma Regeneration', '#10b981');
    } else if (className === 'engineer') {
      showCombatLog('Field Engineer Selected: Fortified Barricades & Sentry Overclock', '#f59e0b');
    }

    const modal = document.getElementById('class-modal');
    if (modal) modal.classList.add('hidden');
    unlockAchievement('class_spec', 'Specialized Operative', `Selected ${className.toUpperCase()} specialization`, '🎖️');
  }

  function unlockAchievement(id, title, desc, icon = '🏆') {
    if (Game.tactical.achievementsUnlocked.has(id)) return;
    Game.tactical.achievementsUnlocked.add(id);
    Game.audio.playObjectiveSuccess();

    const toast = document.getElementById('achievement-toast');
    const titleSpan = document.getElementById('achieve-title');
    const descSpan = document.getElementById('achieve-desc');
    const iconSpan = document.querySelector('.achieve-icon');

    if (toast && titleSpan && descSpan) {
      titleSpan.textContent = title;
      descSpan.textContent = desc;
      if (iconSpan) iconSpan.textContent = icon;
      toast.classList.remove('hidden');
      setTimeout(() => { toast.classList.add('hidden'); }, 4500);
    }

    if (window.AndroidBridge && window.AndroidBridge.unlockAchievement) {
      window.AndroidBridge.unlockAchievement(id, title);
    }
  }

  function updateSonarRadar(delta) {
    Game.tactical.sonarTimer += delta;
    if (Game.tactical.sonarTimer >= 2.0) {
      Game.tactical.sonarTimer = 0;
      Game.audio.playSonarPing();

      const container = document.getElementById('radar-blips-container');
      if (!container) return;
      container.innerHTML = '';

      const p = Game.player.position;
      const yaw = Game.player.rotation.yaw;

      Game.enemies.forEach(e => {
        if (!e.isAlive) return;
        const dx = e.mesh.position.x - p.x;
        const dz = e.mesh.position.z - p.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 35) {
          // Local rotated coords
          const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
          const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
          const px = 40 + (rx / 35) * 36;
          const py = 40 + (rz / 35) * 36;

          const blip = document.createElement('div');
          blip.className = 'sonar-blip';
          blip.style.left = `${px}px`;
          blip.style.top = `${py}px`;
          container.appendChild(blip);
        }
      });
    }
  }

  function applyRecoil(amount) {
    if (Game.player.weaponMesh) {
      Game.player.weaponMesh.position.z += amount * 1.5;
      Game.player.weaponMesh.position.y += amount * 0.5;
      setTimeout(() => {
        if (Game.player.weaponMesh) {
          Game.player.weaponMesh.position.set(0, 0, 0);
        }
      }, 90);
    }
  }

  function triggerMuzzleFlash() {
    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.style.background = 'rgba(255, 200, 100, 0.15)';
      setTimeout(() => { flash.style.background = 'rgba(220, 38, 38, 0)'; }, 40);
    }
  }

  function showHitMarker() {
    const marker = document.getElementById('hit-marker');
    if (marker) {
      marker.style.opacity = '1';
      setTimeout(() => { marker.style.opacity = '0'; }, 80);
    }
  }

  // --- 7. TACTICAL RADIO CHATTER & BOSS HUD SYSTEM ---
  function triggerRadioComms(caller, message) {
    const box = document.getElementById('radio-comms-box');
    const callerSpan = document.getElementById('radio-caller');
    const msgSpan = document.getElementById('radio-message');
    if (!box || !callerSpan || !msgSpan) return;

    callerSpan.textContent = caller;
    msgSpan.textContent = `"${message}"`;
    box.classList.remove('hidden');
    Game.audio.playRadioBeep();

    setTimeout(() => {
      box.classList.add('hidden');
    }, 6500);
  }

  function showBossHUD(name, phase = 'PHASE 1') {
    const box = document.getElementById('boss-health-container');
    const nameSpan = document.getElementById('boss-name');
    const badge = document.getElementById('boss-phase-badge');
    if (!box) return;

    nameSpan.textContent = name;
    badge.textContent = phase;
    box.classList.remove('hidden');
    updateBossHUD();
  }

  function updateBossHUD() {
    if (!Game.activeBoss) return;
    const fill = document.getElementById('boss-bar-fill');
    if (fill) {
      const pct = Math.max(0, (Game.activeBoss.health / Game.activeBoss.maxHealth) * 100);
      fill.style.width = `${pct}%`;
    }
  }

  function hideBossHUD() {
    const box = document.getElementById('boss-health-container');
    if (box) box.classList.add('hidden');
    Game.activeBoss = null;
  }

  // --- 8. INVENTORY & CRAFTING SYSTEM ---
  function addInventoryItem(item) {
    const existing = Game.inventory.find(i => i.id === item.id);
    if (existing && item.type !== 'lore') {
      existing.qty += item.qty;
    } else {
      Game.inventory.push(item);
    }
    renderInventoryGrid();
  }

  function renderInventoryGrid() {
    const grid = document.getElementById('inventory-grid');
    const countSpan = document.getElementById('inv-count');
    if (!grid) return;

    grid.innerHTML = '';
    countSpan.textContent = Game.inventory.length;

    for (let i = 0; i < 16; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';

      if (i < Game.inventory.length) {
        const itm = Game.inventory[i];
        slot.innerHTML = `
          <div class="slot-icon">${itm.icon}</div>
          <div class="slot-name">${itm.name}</div>
          <div class="slot-qty">x${itm.qty}</div>
        `;
        if (i === Game.selectedInvIndex) slot.classList.add('selected');

        slot.addEventListener('click', () => {
          Game.selectedInvIndex = i;
          renderInventoryGrid();
          inspectInventoryItem(itm);
        });
      } else {
        slot.innerHTML = `<div class="slot-empty">EMPTY</div>`;
      }
      grid.appendChild(slot);
    }

    if (Game.inventory[Game.selectedInvIndex]) {
      inspectInventoryItem(Game.inventory[Game.selectedInvIndex]);
    }
  }

  function inspectInventoryItem(item) {
    const title = document.getElementById('inspect-title');
    const desc = document.getElementById('inspect-desc');
    const useBtn = document.getElementById('btn-item-use');
    const dropBtn = document.getElementById('btn-item-drop');

    if (!title || !item) return;

    title.textContent = item.name.toUpperCase();
    desc.textContent = item.desc;
    useBtn.disabled = false;
    dropBtn.disabled = false;

    useBtn.onclick = () => useInventoryItem(item);
    dropBtn.onclick = () => dropInventoryItem(item);
  }

  function useInventoryItem(item) {
    if (item.id === 'medkit') {
      Game.player.health = Math.min(Game.player.maxHealth, Game.player.health + 50);
      Game.player.isBleeding = false;
      showCombatLog('Used Field Medkit (+50 HP & Bleeding Stopped)', '#10b981');
      consumeSelectedItem();
    } else if (item.id === 'medkit_adv') {
      Game.player.health = Game.player.maxHealth;
      Game.player.infection = 0;
      Game.player.isBleeding = false;
      showCombatLog('Used Advanced Trauma Kit (100% HP, Infection Cured)', '#10b981');
      consumeSelectedItem();
    } else if (item.id === 'adrenaline') {
      Game.player.adrenalineActive = true;
      Game.player.adrenalineTimer = 25.0;
      showCombatLog('Adrenaline Active! Supercharged Sprint for 25s!', '#eab308');
      consumeSelectedItem();
    } else if (item.id === 'battery') {
      Game.player.flashlightBattery = 100;
      showCombatLog('Flashlight Battery Recharged to 100%!', '#38bdf8');
      consumeSelectedItem();
    } else if (item.id === 'gas_filter') {
      Game.tactical.gasFilter = 100;
      showCombatLog('Replaced Hazmat Gas Mask Filter (100%)', '#06b6d4');
      consumeSelectedItem();
    } else if (item.id === 'sentry_item') {
      deploySentryTurret();
      consumeSelectedItem();
    } else if (item.id.startsWith('datapad')) {
      showLoreModal(item.name, item.desc);
    }
    updateStatsHUD();
  }

  function consumeSelectedItem() {
    const itm = Game.inventory[Game.selectedInvIndex];
    if (!itm) return;
    itm.qty--;
    if (itm.qty <= 0) {
      Game.inventory.splice(Game.selectedInvIndex, 1);
      Game.selectedInvIndex = 0;
    }
    renderInventoryGrid();
  }

  function dropInventoryItem(item) {
    consumeSelectedItem();
    showCombatLog(`Dropped ${item.name}`, '#94a3b8');
  }

  function renderCraftingTab() {
    const list = document.getElementById('crafting-recipes-list');
    if (!list) return;

    list.innerHTML = '';
    Game.craftingRecipes.forEach((recipe, idx) => {
      const card = document.createElement('div');
      card.className = `recipe-card ${idx === Game.selectedRecipeIndex ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="recipe-icon">${recipe.icon}</div>
        <div class="recipe-details">
          <div class="recipe-title">${recipe.name}</div>
          <div class="recipe-desc">${recipe.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        Game.selectedRecipeIndex = idx;
        renderCraftingTab();
        inspectCraftingRecipe(recipe);
      });
      list.appendChild(card);
    });

    inspectCraftingRecipe(Game.craftingRecipes[Game.selectedRecipeIndex]);
  }

  function inspectCraftingRecipe(recipe) {
    const title = document.getElementById('craft-inspect-title');
    const desc = document.getElementById('craft-inspect-desc');
    const reqsList = document.getElementById('craft-reqs-list');
    const craftBtn = document.getElementById('btn-craft-execute');

    if (!title || !recipe) return;

    title.textContent = recipe.name.toUpperCase();
    desc.textContent = recipe.desc;
    reqsList.innerHTML = '';

    let canCraft = true;
    recipe.reqs.forEach(req => {
      const invItem = Game.inventory.find(i => i.id === req.id);
      const hasQty = invItem ? invItem.qty : 0;
      const isEnough = hasQty >= req.qty;
      if (!isEnough) canCraft = false;

      const reqDiv = document.createElement('div');
      reqDiv.className = `req-item ${isEnough ? 'has-enough' : 'missing'}`;
      reqDiv.innerHTML = `<span>${req.name}</span><span>${hasQty}/${req.qty}</span>`;
      reqsList.appendChild(reqDiv);
    });

    craftBtn.disabled = !canCraft;
    craftBtn.onclick = () => executeCraftRecipe(recipe);
  }

  function executeCraftRecipe(recipe) {
    recipe.reqs.forEach(req => {
      const invItem = Game.inventory.find(i => i.id === req.id);
      if (invItem) {
        invItem.qty -= req.qty;
        if (invItem.qty <= 0) {
          const idx = Game.inventory.indexOf(invItem);
          if (idx !== -1) Game.inventory.splice(idx, 1);
        }
      }
    });

    addInventoryItem(Object.assign({}, recipe.result));
    Game.audio.playLootPickup();
    showCombatLog(`Crafted: ${recipe.name}!`, '#10b981');
    renderCraftingTab();
  }

  // --- 9. STORY CAMPAIGN TRIGGERS & MULTI-ENDING LOGIC ---
  function triggerGeneratorActivation() {
    if (!Game.mission.hasFuel) {
      showCombatLog('Generator is out of fuel! Recover Diesel Canister from Sector 1 sheds.', '#ef4444');
      return;
    }
    if (!Game.mission.hasBlueKeycard) {
      showCombatLog('Substation console locked! Requires Blue Security Keycard.', '#ef4444');
      return;
    }

    Game.mission.generatorRunning = true;
    Game.stationLights.forEach(light => { light.intensity = 2.4; });
    Game.audio.playObjectiveSuccess();
    showCombatLog('Station Omega-9 Emergency Power Grid Online! Research Labs Unlocked!', '#10b981');
    triggerRadioComms('VANGUARD-01', 'Power grid detected online. Move inside and decrypt mainframe!');

    Game.mission.chapter = 2;
    Game.mission.title = 'CHAPTER 1: The Bio-Archive';
    Game.mission.desc = 'Access Station Omega-9 Mainframe to decrypt classified Project Veil virus research.';
    Game.mission.task = 'Decrypt Research Mainframe Terminal';
    updateMissionHUD();
  }

  function triggerMainframeDecrypt() {
    if (!Game.mission.generatorRunning) {
      showCombatLog('Terminal offline! Restore substation generator power first.', '#ef4444');
      return;
    }

    Game.mission.dataDownloaded = true;
    Game.audio.playObjectiveSuccess();
    showCombatLog('Project Veil Mainframe Decrypted! RED Keycard located in Quarantine Bay!', '#38bdf8');
    triggerRadioComms('OVERSEER COMMAND', 'Bio-data acquired. The Screamer has cornered Quarantine. Terminate it!');

    Game.mission.chapter = 3;
    Game.mission.title = 'CHAPTER 2: The Screamer Quarantine';
    Game.mission.desc = 'Enter Quarantine Bay and neutralize The Screamer to acquire the Red Master Keycard.';
    Game.mission.task = 'Eliminate The Screamer in Sector 4';
    updateMissionHUD();
  }

  function triggerBioDomeTerminal() {
    Game.mission.hasBioDomeKey = true;
    Game.audio.playGoliathRoar();
    showCombatLog('WARNING: Stasis Breach! The Bio-Goliath has awakened!', '#dc2626');
    triggerRadioComms('VANGUARD-01', 'Massive biological signature detected in Sub-Level 2 Bio-Dome! Take it down!');

    const goliath = Game.enemies.find(e => e.type === 'goliath' && e.isAlive);
    if (goliath) {
      Game.activeBoss = goliath;
      goliath.state = 'chase';
      showBossHUD('THE BIO-GOLIATH [TITAN APEX]', 'PHASE 1');
    }
  }

  function triggerVaultUnlock() {
    if (!Game.mission.hasRedKeycard) {
      showCombatLog('Vault Alpha Blast Door Locked! Requires Red Master Keycard.', '#ef4444');
      return;
    }

    showCombatLog('Vault Alpha Containment Unsealed! THE VEIL IS UNLEASHED!', '#dc2626');
    triggerRadioComms('OVERSEER COMMAND', 'Warning! Apex entity The Veil is loose! Banish it to reach Helipad!');

    const veil = Game.enemies.find(e => e.type === 'veil' && e.isAlive);
    if (veil) {
      Game.activeBoss = veil;
      veil.state = 'chase';
      showBossHUD('THE VEIL [OPTICAL APEX STALKER]', 'ENRAGED');
    }

    Game.mission.chapter = 4;
    Game.mission.title = 'CHAPTER 3: Apex Extraction';
    Game.mission.desc = 'Banish The Veil and reach Northern Ridge Helipad to call extraction helicopter.';
    Game.mission.task = 'Defeat The Veil and launch Helipad Flare';
    updateMissionHUD();
  }

  function triggerExtractionFlare() {
    if (!Game.mission.veilEliminated) {
      showCombatLog('Cannot extract while The Veil stalks the perimeter! Defeat it first!', '#ef4444');
      return;
    }

    if (Game.mission.extractionActive) return;

    Game.mission.extractionActive = true;
    Game.audio.playObjectiveSuccess();
    showCombatLog('Distress Flare Launched! Vanguard-01 Inbound! HOLD THE HELIPAD (45s)!', '#f59e0b');
    triggerRadioComms('VANGUARD-01', 'Flare sighted! Inbound for extraction in 45 seconds! Defend the pad!');

    document.getElementById('extraction-timer-row').classList.remove('hidden');

    // Spawn final horde around helipad
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      createEnemy('hollow', Math.cos(angle) * 35, -95 + Math.sin(angle) * 35, 90, 2.2);
    }

    const timerInt = setInterval(() => {
      if (Game.isGameOver || Game.isPaused) return;
      Game.mission.extractionTimeLeft--;
      const sec = Game.mission.extractionTimeLeft;
      document.getElementById('extraction-timer-val').textContent = `00:${sec < 10 ? '0' + sec : sec}`;

      if (sec <= 0) {
        clearInterval(timerInt);
        showEndingDecisionModal();
      }
    }, 1000);
  }

  function showEndingDecisionModal() {
    const modal = document.getElementById('ending-decision-modal');
    if (modal) modal.classList.remove('hidden');
    Game.isPaused = true;
  }

  function selectEnding(type) {
    const modal = document.getElementById('ending-decision-modal');
    if (modal) modal.classList.add('hidden');
    Game.isPaused = false;
    Game.activeEnding = type;

    let endingName = 'True Survivor [Cure Secured]';
    let victorySub = 'CHAPTER COMPLETED: EXTRACTION SUCCESSFUL';

    if (type === 'destruct') {
      endingName = 'Heroic Sacrifice [Protocol Omega Detonation]';
      victorySub = 'FACILITY VAPORIZED: ALL MUTATIONS ERADICATED';
      Game.audio.playExplosion();
    } else if (type === 'lockdown') {
      endingName = 'Quarantine Sentinel [Vault Lockdown]';
      victorySub = 'SEALED IN VAULT ALPHA: BIOHAZARD CONTAINED';
    }

    document.getElementById('victory-header-subtitle').textContent = victorySub;
    document.getElementById('victory-ending-name').textContent = endingName;
    document.getElementById('victory-score').textContent = `${Game.score} PTS`;
    document.getElementById('victory-kills').textContent = `${Game.kills}`;
    document.getElementById('victory-overlay').classList.remove('hidden');

    Game.audio.playObjectiveSuccess();
  }

  // --- 10. ENDLESS HORDE SURVIVAL ARENA SYSTEM ---
  function startEndlessHordeMode() {
    Game.gameMode = 'horde';
    Game.horde.wave = 1;
    Game.horde.enemiesRemaining = 6;
    Game.horde.waveActive = true;

    document.getElementById('horde-wave-row').classList.remove('hidden');
    document.getElementById('mission-sector-tag').textContent = 'ENDLESS HORDE SURVIVAL';
    document.getElementById('mission-title').textContent = 'SURVIVAL ARENA';
    document.getElementById('mission-desc').textContent = 'Defend Station Omega-9 against relentless evolving waves.';
    document.getElementById('mission-task').textContent = 'Survive current swarm';

    spawnHordeWave(1);
    updateHordeHUD();
  }

  function spawnHordeWave(wave) {
    const count = 4 + wave * 3;
    Game.horde.enemiesRemaining = count;
    showCombatLog(`WAVE ${wave} COMMENCING! (+${count} CREATURES)`, '#dc2626');
    triggerRadioComms('VANGUARD-01', `Wave ${wave} incoming! Multiple hostile signals closing in!`);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 25;
      const px = Game.player.position.x + Math.cos(angle) * dist;
      const pz = Game.player.position.z + Math.sin(angle) * dist;

      if (wave % 5 === 0 && i === 0) {
        // Boss Wave every 5th wave
        createEnemy('goliath', px, pz, 400 + wave * 50, 1.4);
      } else if (i % 3 === 0) {
        createEnemy('crawler', px, pz, 70 + wave * 10, 2.8);
      } else {
        createEnemy('hollow', px, pz, 90 + wave * 12, 1.9 + wave * 0.05);
      }
    }
    updateHordeHUD();
  }

  function triggerHordeWaveComplete() {
    Game.score += Game.horde.wave * 500;
    showCombatLog(`WAVE ${Game.horde.wave} CLEARED! (+${Game.horde.wave * 500} PTS)`, '#10b981');
    Game.audio.playObjectiveSuccess();

    // Airdrop ammo cache
    spawnLootItem(`airdrop_${Game.horde.wave}`, 'Survival Airdrop Crate', '📦', Game.player.position.x + 4, Game.player.position.z + 4, () => {
      Game.weapons.pistol.reserve += 30;
      Game.weapons.shotgun.reserve += 16;
      Game.weapons.rifle.reserve += 60;
      showCombatLog('Recovered Emergency Ammo Airdrop!', '#38bdf8');
      updateWeaponHUD();
    });

    Game.horde.wave++;
    setTimeout(() => {
      if (Game.gameMode === 'horde' && !Game.isGameOver) {
        spawnHordeWave(Game.horde.wave);
      }
    }, 6000);
  }

  function updateHordeHUD() {
    const waveSpan = document.getElementById('horde-wave-val');
    const remSpan = document.getElementById('horde-enemies-left');
    if (waveSpan) waveSpan.textContent = `${Game.horde.wave} / ${Game.horde.maxWaves}`;
    if (remSpan) remSpan.textContent = `${Game.horde.enemiesRemaining}`;
  }

  // --- 11. CCTV SECURITY CAMERA FEED TERMINAL (Phase 6) ---
  function openCCTVTerminal() {
    const modal = document.getElementById('cctv-modal');
    if (modal) modal.classList.remove('hidden');
    switchCCTVCamera(1);
  }

  function switchCCTVCamera(camNum) {
    const title = document.getElementById('cctv-cam-title');
    const view = document.getElementById('cctv-cam-text');
    const btns = document.querySelectorAll('.cctv-btn');

    btns.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.cam, 10) === camNum);
    });

    const camData = {
      1: { name: 'CAM 01: PERIMETER SECURITY GATE', status: 'STATUS: ACTIVE • 2 MUTANT TARGETS PATROLLING' },
      2: { name: 'CAM 02: POWER SUBSTATION & GENERATOR', status: 'STATUS: ACTIVE • DIESEL GENERATOR COILS RUNNING' },
      3: { name: 'CAM 03: MAINFRAME RESEARCH COMPLEX', status: 'STATUS: ACTIVE • PROJECT VEIL DATA CORES' },
      4: { name: 'CAM 04: VAULT ALPHA CONTAINMENT', status: 'STATUS: WARNING • RED KEYCARD SEAL DETECTED' },
      5: { name: 'CAM 05: NORTHERN RIDGE HELIPAD', status: 'STATUS: ACTIVE • VANGUARD-01 LANDING ZONE' }
    };

    const c = camData[camNum] || camData[1];
    if (title) title.textContent = c.name;
    if (view) view.textContent = `[FEED ESTABLISHED]\n${c.name}\n${c.status}`;
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 700, 0.3);
  }

  // --- 12. HUD & STATUS UPDATES ---
  function updateWeaponHUD() {
    const wep = Game.weapons[Game.weapons.current];
    const nameEl = document.getElementById('weapon-name');
    const clipEl = document.getElementById('ammo-clip');
    const reserveEl = document.getElementById('ammo-reserve');

    if (nameEl) nameEl.textContent = wep.name;
    if (clipEl) clipEl.textContent = wep.clip;
    if (reserveEl) reserveEl.textContent = wep.reserve;

    const batVal = document.getElementById('battery-val');
    if (batVal) batVal.textContent = `${Math.round(Game.player.flashlightBattery)}%`;
  }

  function updateStatsHUD() {
    const hp = document.getElementById('health-val');
    const hpBar = document.getElementById('health-bar');
    const stVal = document.getElementById('stamina-val');
    const stBar = document.getElementById('stamina-bar');
    const filterBar = document.getElementById('filter-bar');
    const infBar = document.getElementById('infection-bar');

    if (hp) hp.textContent = `${Math.round(Game.player.health)}%`;
    if (hpBar) hpBar.style.width = `${Math.max(0, Game.player.health)}%`;
    if (stVal) stVal.textContent = `${Math.round(Game.player.stamina)}%`;
    if (stBar) stBar.style.width = `${Math.max(0, Game.player.stamina)}%`;
    if (filterBar) filterBar.style.width = `${Math.max(0, Game.tactical.gasFilter)}%`;
    if (infBar) infBar.style.width = `${Math.min(100, Game.player.infection)}%`;

    const lowHealth = document.getElementById('low-health-vignette');
    if (lowHealth) {
      lowHealth.style.opacity = Game.player.health < 35 ? (1 - Game.player.health / 35).toString() : '0';
    }
  }

  function updateMissionHUD() {
    const task = document.getElementById('mission-task');
    const title = document.getElementById('mission-title');
    const desc = document.getElementById('mission-desc');
    if (task) task.textContent = Game.mission.task;
    if (title) title.textContent = Game.mission.title;
    if (desc) desc.textContent = Game.mission.desc;
  }

  function showCombatLog(msg, color = '#f8fafc') {
    const log = document.getElementById('combat-log');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = color;
    entry.textContent = `> ${msg}`;
    log.appendChild(entry);

    setTimeout(() => {
      if (entry.parentNode) entry.parentNode.removeChild(entry);
    }, 4500);
  }

  function showLoreModal(title, text) {
    const modal = document.getElementById('lore-modal');
    const titleEl = document.getElementById('lore-title');
    const textEl = document.getElementById('lore-content');
    if (!modal) return;

    titleEl.textContent = title.toUpperCase();
    textEl.textContent = text;
    modal.classList.remove('hidden');
    Game.audio.playLootPickup();
  }

  // --- 13. MAIN GAME TICK & SIMULATION LOOP ---
  function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (Game.isGameOver || Game.isPaused) {
      if (Game.renderer && Game.scene && Game.camera) {
        Game.renderer.render(Game.scene, Game.camera);
      }
      return;
    }

    let delta = Math.min(Game.clock ? Game.clock.getDelta() : 0.016, 0.1);

    // Bullet-Time & Serum Timers
    if (Game.tactical.bulletTimeActive) {
      Game.tactical.bulletTimeTimer -= delta;
      if (Game.tactical.bulletTimeTimer <= 0) {
        Game.tactical.bulletTimeActive = false;
        const overlay = document.getElementById('bullet-time-overlay');
        if (overlay) overlay.classList.add('hidden');
      }
    }
    if (Game.tactical.armorSerumActive) {
      Game.tactical.armorSerumTimer -= delta;
      if (Game.tactical.armorSerumTimer <= 0) {
        Game.tactical.armorSerumActive = false;
      }
    }

    // 1. Weather Simulation (Rain & Lightning)
    updateWeather(delta);

    // 2. Player Movement & Physics
    updatePlayer(delta);

    // 3. Creature AI & Boss Update (affected by bullet time time-dilation)
    const enemyDelta = Game.tactical.bulletTimeActive ? delta * 0.45 : delta;
    updateEnemies(enemyDelta);

    // 4. Deployed Mines & Turrets
    updateDefenses(delta);

    // 5. Survival Drain (Bleeding, Infection, Gas Filter)
    updateBiohazards(delta);

    // 6. Sonar Acoustic Radar Pulse
    updateSonarRadar(delta);

    // 7. Camera & Flashlight Alignment
    updateCamera();

    // 8. Render 3D Scene
    if (Game.renderer && Game.scene && Game.camera) {
      Game.renderer.render(Game.scene, Game.camera);
    }
  }

  function updateWeather(delta) {
    // Rain Particles Descent
    if (Game.weather.rainParticles) {
      const pos = Game.weather.rainParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 18 * delta;
        if (pos[i] < 0) pos[i] = 40;
      }
      Game.weather.rainParticles.geometry.attributes.position.needsUpdate = true;
      Game.weather.rainParticles.position.x = Game.player.position.x;
      Game.weather.rainParticles.position.z = Game.player.position.z;
    }

    // Dynamic Lightning System
    Game.weather.lightningTimer -= delta;
    if (Game.weather.lightningTimer <= 0) {
      Game.weather.lightningTimer = 10 + Math.random() * 18;
      triggerLightningStrike();
    }
  }

  function triggerLightningStrike() {
    const flash = document.getElementById('lightning-flash');
    if (flash) {
      flash.style.background = 'rgba(255, 255, 255, 0.7)';
      if (Game.weather.lightningLight) Game.weather.lightningLight.intensity = 3.5;
      setTimeout(() => {
        if (flash) flash.style.background = 'rgba(255, 255, 255, 0)';
        if (Game.weather.lightningLight) Game.weather.lightningLight.intensity = 0;
      }, 70);
    }
    setTimeout(() => {
      Game.audio.playThunder();
    }, 450);
  }

  function updatePlayer(delta) {
    const p = Game.player;
    const input = Game.input;

    let moveSpeed = p.speed;
    if (p.adrenalineActive) {
      moveSpeed *= 1.35;
      p.adrenalineTimer -= delta;
      if (p.adrenalineTimer <= 0) p.adrenalineActive = false;
    } else if (p.isSprinting && p.stamina > 5) {
      moveSpeed *= p.sprintMultiplier;
      p.stamina = Math.max(0, p.stamina - 15 * delta);
    } else {
      p.stamina = Math.min(p.maxStamina, p.stamina + 8 * delta);
    }

    if (p.isCrouching) moveSpeed *= p.crouchMultiplier;

    // Movement vectors relative to yaw
    const forwardX = -Math.sin(p.rotation.yaw);
    const forwardZ = -Math.cos(p.rotation.yaw);
    const rightX = Math.cos(p.rotation.yaw);
    const rightZ = -Math.sin(p.rotation.yaw);

    const moveX = forwardX * input.forward + rightX * input.right;
    const moveZ = forwardZ * input.forward + rightZ * input.right;

    p.position.x += moveX * moveSpeed * delta;
    p.position.z += moveZ * moveSpeed * delta;

    // Footstep audio pulse
    if (Math.abs(input.forward) > 0.1 || Math.abs(input.right) > 0.1) {
      p.stepTimer += delta * (p.isSprinting ? 2.8 : 1.8);
      if (p.stepTimer > 1.0) {
        p.stepTimer = 0;
        Game.audio.playFootstep();
      }
    }

    // Flashlight Battery Drain
    if (p.flashlightOn) {
      p.flashlightBattery = Math.max(0, p.flashlightBattery - 0.25 * delta);
      if (p.flashlightBattery <= 0) {
        p.flashlightOn = false;
        if (p.flashlightLight) p.flashlightLight.intensity = 0;
        showCombatLog('Flashlight battery depleted! Craft or find Lithium Cell.', '#ef4444');
      }
    }

    // Proximity Object Interaction check
    checkObjectInteractions();
    updateStatsHUD();
  }

  function updateEnemies(delta) {
    const p = Game.player.position;

    Game.enemies.forEach(e => {
      if (!e.isAlive) return;

      const dx = p.x - e.mesh.position.x;
      const dz = p.z - e.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Look at player
      const angle = Math.atan2(dx, dz);
      e.mesh.rotation.y = angle;

      // Detection & Aggro Range
      const detectRange = Game.player.flashlightOn ? 35 : 18;
      if (dist < detectRange && e.state === 'patrol') {
        e.state = 'chase';
        Game.audio.playMonsterAttack();
      }

      if (e.state === 'chase') {
        if (dist > 1.4) {
          e.mesh.position.x += (dx / dist) * e.speed * delta;
          e.mesh.position.z += (dz / dist) * e.speed * delta;
        } else {
          // Attack cooldown
          e.attackCooldown -= delta;
          if (e.attackCooldown <= 0) {
            e.attackCooldown = 1.3;
            let dmg = 18;
            if (e.type === 'goliath') dmg = 40;
            else if (e.type === 'screamer') dmg = 25;

            Game.player.health -= dmg;
            Game.player.isBleeding = true;
            Game.audio.playMonsterAttack();
            triggerDamageFlash();
            showCombatLog(`Attacked by ${e.type.toUpperCase()}! (-${dmg} HP)`, '#ef4444');

            if (Game.player.health <= 0) {
              triggerPlayerDeath();
            }
          }
        }
      }
    });
  }

  function updateDefenses(delta) {
    // 1. Proximity Mines
    Game.deployedMines.forEach(mine => {
      if (!mine.isArmed) return;
      Game.enemies.forEach(e => {
        if (!e.isAlive) return;
        const dx = e.mesh.position.x - mine.x;
        const dz = e.mesh.position.z - mine.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < mine.radius) {
          mine.isArmed = false;
          Game.audio.playExplosion();
          damageEnemy(e, mine.damage, e.mesh.position);
          Game.scene.remove(mine.mesh);
          Game.scene.remove(mine.laserMesh);
          showCombatLog('M26 Mine Detonated! Massive AoE Blast!', '#ef4444');
        }
      });
    });

    // 2. Deployable Auto-Turrets
    Game.deployedTurrets.forEach(turret => {
      if (turret.ammo <= 0) return;
      turret.lastFire += delta;

      let nearestTarget = null;
      let nearestDist = turret.range;

      Game.enemies.forEach(e => {
        if (!e.isAlive) return;
        const dx = e.mesh.position.x - turret.x;
        const dz = e.mesh.position.z - turret.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestTarget = e;
        }
      });

      if (nearestTarget && turret.lastFire >= turret.fireRate) {
        turret.lastFire = 0;
        turret.ammo--;
        Game.audio.playTurretFire();
        damageEnemy(nearestTarget, 22, nearestTarget.mesh.position);
      }
    });
  }

  function updateBiohazards(delta) {
    const p = Game.player;

    // Bleeding Tick
    if (p.isBleeding) {
      p.health = Math.max(0, p.health - 1.2 * delta);
      if (p.health <= 0) triggerPlayerDeath();
    }

    // Subterranean Bio-Dome Toxic Zone Check (Sector 6: x: -45, z: 50)
    const dx = p.position.x - (-45);
    const dz = p.position.z - 50;
    const inBioZone = Math.sqrt(dx * dx + dz * dz) < 18;

    if (inBioZone) {
      if (!Game.tactical.gasMaskActive) {
        p.infection = Math.min(100, p.infection + 6 * delta);
        p.health = Math.max(0, p.health - 3.5 * delta);
        showCombatLog('TOXIC SPORES DETECTED! EQUIP GAS MASK [G]!', '#dc2626');
        if (p.health <= 0) triggerPlayerDeath();
      } else {
        Game.tactical.gasFilter = Math.max(0, Game.tactical.gasFilter - 1.5 * delta);
        if (Game.tactical.gasFilter <= 0) {
          p.health = Math.max(0, p.health - 2 * delta);
        }
      }
    }
  }

  function checkObjectInteractions() {
    const p = Game.player.position;
    const prompt = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');
    let found = null;

    Game.worldObjects.forEach(obj => {
      const dx = p.x - obj.position.x;
      const dz = p.z - obj.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obj.radius) {
        found = obj;
      }
    });

    Game.lootBoxes.forEach(loot => {
      if (loot.isCollected) return;
      const dx = p.x - loot.position.x;
      const dz = p.z - loot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 2.4) {
        found = {
          prompt: `SCAVENGE ${loot.name.toUpperCase()}`,
          action: () => {
            loot.isCollected = true;
            Game.scene.remove(loot.mesh);
            loot.onPickup();
            Game.audio.playLootPickup();
          }
        };
      }
    });

    if (found && prompt && promptText) {
      promptText.textContent = found.prompt;
      prompt.classList.remove('hidden');
      Game.activeInteraction = found;
    } else if (prompt) {
      prompt.classList.add('hidden');
      Game.activeInteraction = null;
    }
  }

  function updateCamera() {
    const p = Game.player;
    Game.camera.position.set(p.position.x, p.position.y, p.position.z);
    Game.camera.rotation.order = 'YXZ';
    Game.camera.rotation.y = p.rotation.yaw;
    Game.camera.rotation.x = p.rotation.pitch;
  }

  function triggerDamageFlash() {
    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.style.background = 'rgba(220, 38, 38, 0.45)';
      setTimeout(() => { flash.style.background = 'rgba(220, 38, 38, 0)'; }, 120);
    }
  }

  function triggerPlayerDeath() {
    Game.isGameOver = true;
    const overlay = document.getElementById('death-overlay');
    const killsSpan = document.getElementById('death-kills');
    const timeSpan = document.getElementById('death-time');

    const sec = Math.floor((Date.now() - Game.startTime) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    if (killsSpan) killsSpan.textContent = `${Game.kills}`;
    if (timeSpan) timeSpan.textContent = `${m}m ${s}s`;
    if (overlay) overlay.classList.remove('hidden');
  }

  // --- 14. INPUT LISTENERS & TOUCH CONTROLS ---
  function setupInputHandlers() {
    // Keyboard Listeners
    window.addEventListener('keydown', e => {
      Game.audio.init();
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') Game.input.forward = 1;
      if (code === 'KeyS' || code === 'ArrowDown') Game.input.forward = -1;
      if (code === 'KeyA' || code === 'ArrowLeft') Game.input.right = -1;
      if (code === 'KeyD' || code === 'ArrowRight') Game.input.right = 1;
      if (code === 'ShiftLeft' || code === 'ShiftRight') Game.player.isSprinting = true;
      if (code === 'KeyC') Game.player.isCrouching = !Game.player.isCrouching;
      if (code === 'KeyF') toggleFlashlight();
      if (code === 'KeyN') toggleNVG();
      if (code === 'KeyH') toggleThermalVision();
      if (code === 'KeyG') toggleGasMask();
      if (code === 'KeyT') toggleSuppressor();
      if (code === 'KeyZ') triggerEMPBlast();
      if (code === 'KeyU') toggleDroneRecon();
      if (code === 'KeyB') placeFortifiedBarricade();
      if (code === 'KeyK') callTacticalAirdrop();
      if (code === 'KeyJ') throwTacticalFlashbang();
      if (code === 'KeyV') performKnifeMelee();
      if (code === 'KeyX') deploySentryTurret();
      if (code === 'KeyE') executeCurrentInteraction();
      if (code === 'KeyR') reloadCurrentWeapon();
      if (code === 'Tab') { e.preventDefault(); toggleBackpackModal(); }
      if (code === 'Digit1') switchWeapon('pistol');
      if (code === 'Digit2') switchWeapon('shotgun');
      if (code === 'Digit3') switchWeapon('rifle');
      if (code === 'Digit4') switchWeapon('mine');
      if (code === 'Digit5') switchWeapon('flamer');
    });

    window.addEventListener('keyup', e => {
      const code = e.code;
      if (code === 'KeyW' || code === 'KeyS' || code === 'ArrowUp' || code === 'ArrowDown') Game.input.forward = 0;
      if (code === 'KeyA' || code === 'KeyD' || code === 'ArrowLeft' || code === 'ArrowRight') Game.input.right = 0;
      if (code === 'ShiftLeft' || code === 'ShiftRight') Game.player.isSprinting = false;
    });

    // Touch Virtual Joystick
    setupTouchControls();

    // UI Buttons
    setupUIButtons();
  }

  function toggleFlashlight() {
    if (Game.player.flashlightBattery <= 0) return;
    Game.player.flashlightOn = !Game.player.flashlightOn;
    if (Game.player.flashlightLight) {
      Game.player.flashlightLight.intensity = Game.player.flashlightOn ? 3.4 : 0;
    }
    const status = document.getElementById('flashlight-status');
    if (status) status.classList.toggle('active', Game.player.flashlightOn);
    Game.audio.playMechanicalClick(Game.audio.ctx ? Game.audio.ctx.currentTime : 0, 1200, 0.3);
  }

  function executeCurrentInteraction() {
    if (Game.activeInteraction && Game.activeInteraction.action) {
      Game.activeInteraction.action();
    }
  }

  function toggleBackpackModal() {
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;
    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
      modal.classList.remove('hidden');
      renderInventoryGrid();
      renderCraftingTab();
    } else {
      modal.classList.add('hidden');
    }
  }

  function setupTouchControls() {
    const lookZone = document.getElementById('touch-look-zone');
    const joyBase = document.getElementById('joystick-left-base');
    const joyKnob = document.getElementById('joystick-left-knob');
    let joyTouchId = null;
    let lookTouchId = null;
    let lastLookX = 0;
    let lastLookY = 0;

    if (joyBase && joyKnob) {
      joyBase.addEventListener('touchstart', e => {
        e.preventDefault();
        Game.audio.init();
        const t = e.changedTouches[0];
        joyTouchId = t.identifier;
      }, { passive: false });

      window.addEventListener('touchmove', e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === joyTouchId) {
            const rect = joyBase.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = t.clientX - cx;
            const dy = t.clientY - cy;
            const dist = Math.min(40, Math.sqrt(dx * dx + dy * dy));
            const angle = Math.atan2(dy, dx);

            joyKnob.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
            Game.input.right = Math.cos(angle) * (dist / 40);
            Game.input.forward = -Math.sin(angle) * (dist / 40);
          } else if (t.identifier === lookTouchId) {
            const dx = t.clientX - lastLookX;
            const dy = t.clientY - lastLookY;
            lastLookX = t.clientX;
            lastLookY = t.clientY;
            Game.player.rotation.yaw -= dx * 0.005;
            Game.player.rotation.pitch = Math.max(-1.2, Math.min(1.2, Game.player.rotation.pitch - dy * 0.005));
          }
        }
      }, { passive: false });

      window.addEventListener('touchend', e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === joyTouchId) {
            joyTouchId = null;
            joyKnob.style.transform = 'translate(0, 0)';
            Game.input.forward = 0;
            Game.input.right = 0;
          } else if (t.identifier === lookTouchId) {
            lookTouchId = null;
          }
        }
      });
    }

    if (lookZone) {
      lookZone.addEventListener('touchstart', e => {
        e.preventDefault();
        Game.audio.init();
        const t = e.changedTouches[0];
        lookTouchId = t.identifier;
        lastLookX = t.clientX;
        lastLookY = t.clientY;
      }, { passive: false });
    }
  }

  function setupUIButtons() {
    // Touch Action Buttons
    const btnFire = document.getElementById('btn-touch-fire');
    if (btnFire) btnFire.addEventListener('click', () => fireCurrentWeapon());

    const btnAim = document.getElementById('btn-touch-aim');
    if (btnAim) btnAim.addEventListener('click', () => {
      Game.tactical.isAimingADS = !Game.tactical.isAimingADS;
      Game.camera.fov = Game.tactical.isAimingADS ? 45 : 65;
      Game.camera.updateProjectionMatrix();
      btnAim.classList.toggle('active', Game.tactical.isAimingADS);
    });

    const btnReload = document.getElementById('btn-touch-reload');
    if (btnReload) btnReload.addEventListener('click', () => reloadCurrentWeapon());

    const btnUse = document.getElementById('btn-touch-interact');
    if (btnUse) btnUse.addEventListener('click', () => executeCurrentInteraction());

    const btnLight = document.getElementById('btn-touch-light');
    if (btnLight) btnLight.addEventListener('click', () => toggleFlashlight());

    const btnSprint = document.getElementById('btn-touch-sprint');
    if (btnSprint) btnSprint.addEventListener('click', () => {
      Game.player.isSprinting = !Game.player.isSprinting;
      btnSprint.classList.toggle('active', Game.player.isSprinting);
    });

    const btnCrouch = document.getElementById('btn-touch-crouch');
    if (btnCrouch) btnCrouch.addEventListener('click', () => {
      Game.player.isCrouching = !Game.player.isCrouching;
      btnCrouch.classList.toggle('active', Game.player.isCrouching);
    });

    const btnInv = document.getElementById('btn-touch-inv');
    if (btnInv) btnInv.addEventListener('click', () => toggleBackpackModal());

    // Tactical Gear Buttons (Phase 4 - 24)
    const btnNVG = document.getElementById('btn-toggle-nvg');
    if (btnNVG) btnNVG.addEventListener('click', () => toggleNVG());

    const btnThermal = document.getElementById('btn-toggle-thermal');
    if (btnThermal) btnThermal.addEventListener('click', () => toggleThermalVision());

    const btnMask = document.getElementById('btn-toggle-mask');
    if (btnMask) btnMask.addEventListener('click', () => toggleGasMask());

    const btnSup = document.getElementById('btn-toggle-suppressor');
    if (btnSup) btnSup.addEventListener('click', () => toggleSuppressor());

    const btnEMP = document.getElementById('btn-deploy-emp');
    if (btnEMP) btnEMP.addEventListener('click', () => triggerEMPBlast());

    const btnDrone = document.getElementById('btn-deploy-drone');
    if (btnDrone) btnDrone.addEventListener('click', () => toggleDroneRecon());

    const btnExitDrone = document.getElementById('btn-exit-drone');
    if (btnExitDrone) btnExitDrone.addEventListener('click', () => exitDroneRecon());

    const btnBarricade = document.getElementById('btn-deploy-barricade');
    if (btnBarricade) btnBarricade.addEventListener('click', () => placeFortifiedBarricade());

    const btnAirdrop = document.getElementById('btn-call-airdrop');
    if (btnAirdrop) btnAirdrop.addEventListener('click', () => callTacticalAirdrop());

    const btnFlashbang = document.getElementById('btn-throw-flashbang');
    if (btnFlashbang) btnFlashbang.addEventListener('click', () => throwTacticalFlashbang());

    const btnMelee = document.getElementById('btn-melee-strike');
    if (btnMelee) btnMelee.addEventListener('click', () => performKnifeMelee());

    const btnTurret = document.getElementById('btn-deploy-sentry');
    if (btnTurret) btnTurret.addEventListener('click', () => deploySentryTurret());

    const btnCCTV = document.getElementById('btn-open-cctv');
    if (btnCCTV) btnCCTV.addEventListener('click', () => openCCTVTerminal());

    const btnCloseCCTV = document.getElementById('btn-close-cctv');
    if (btnCloseCCTV) btnCloseCCTV.addEventListener('click', () => {
      document.getElementById('cctv-modal').classList.add('hidden');
    });

    // Bio-Enhancement Serum Syringes
    const btnSerumReflex = document.getElementById('btn-serum-reflex');
    if (btnSerumReflex) btnSerumReflex.addEventListener('click', () => injectBioSerum('reflex'));

    const btnSerumArmor = document.getElementById('btn-serum-armor');
    if (btnSerumArmor) btnSerumArmor.addEventListener('click', () => injectBioSerum('armor'));

    const btnSerumStim = document.getElementById('btn-serum-stim');
    if (btnSerumStim) btnSerumStim.addEventListener('click', () => injectBioSerum('stim'));

    // Cyber Hacking Modal
    const btnHackSubmit = document.getElementById('btn-hack-submit');
    if (btnHackSubmit) btnHackSubmit.addEventListener('click', () => submitHackAttempt());

    const btnCloseHack = document.getElementById('btn-close-hack');
    if (btnCloseHack) btnCloseHack.addEventListener('click', () => {
      document.getElementById('hack-modal').classList.add('hidden');
    });

    document.querySelectorAll('.hack-node-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('matched');
        Game.audio.playHackBeep();
      });
    });

    // Operative Class Selection Modal
    const btnCloseClass = document.getElementById('btn-close-class');
    if (btnCloseClass) btnCloseClass.addEventListener('click', () => {
      document.getElementById('class-modal').classList.add('hidden');
    });

    document.querySelectorAll('.class-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.class-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectOperativeClass(card.dataset.class);
      });
    });

    document.querySelectorAll('.cctv-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchCCTVCamera(parseInt(btn.dataset.cam, 10));
      });
    });

    // Quick Weapon Selector
    document.querySelectorAll('.quick-wep-btn').forEach(btn => {
      btn.addEventListener('click', () => switchWeapon(btn.dataset.wep));
    });

    // Backpack & Crafting Tabs
    const tabInv = document.getElementById('tab-btn-inv');
    const tabCraft = document.getElementById('tab-btn-craft');
    const invContent = document.getElementById('inv-tab-content');
    const craftContent = document.getElementById('craft-tab-content');
    const btnCloseInv = document.getElementById('btn-close-inv');

    if (tabInv && tabCraft) {
      tabInv.addEventListener('click', () => {
        tabInv.classList.add('active');
        tabCraft.classList.remove('active');
        invContent.classList.remove('hidden');
        craftContent.classList.add('hidden');
      });
      tabCraft.addEventListener('click', () => {
        tabCraft.classList.add('active');
        tabInv.classList.remove('active');
        craftContent.classList.remove('hidden');
        invContent.classList.add('hidden');
        renderCraftingTab();
      });
    }
    if (btnCloseInv) btnCloseInv.addEventListener('click', () => toggleBackpackModal());

    // Ending Selection Buttons
    const btnEndingExtract = document.getElementById('btn-ending-extract');
    if (btnEndingExtract) btnEndingExtract.addEventListener('click', () => selectEnding('extract'));

    const btnEndingDestruct = document.getElementById('btn-ending-destruct');
    if (btnEndingDestruct) btnEndingDestruct.addEventListener('click', () => selectEnding('destruct'));

    const btnEndingLockdown = document.getElementById('btn-ending-lockdown');
    if (btnEndingLockdown) btnEndingLockdown.addEventListener('click', () => selectEnding('lockdown'));

    // Victory Continue -> Endless Mode
    const btnContinue = document.getElementById('btn-continue-game');
    if (btnContinue) btnContinue.addEventListener('click', () => {
      document.getElementById('victory-overlay').classList.add('hidden');
      startEndlessHordeMode();
    });

    // Pause & Respawn
    const btnRespawn = document.getElementById('btn-respawn');
    if (btnRespawn) btnRespawn.addEventListener('click', () => location.reload());

    const btnLoreClose = document.getElementById('btn-close-lore');
    const btnLoreDismiss = document.getElementById('btn-lore-dismiss');
    if (btnLoreClose) btnLoreClose.addEventListener('click', () => document.getElementById('lore-modal').classList.add('hidden'));
    if (btnLoreDismiss) btnLoreDismiss.addEventListener('click', () => document.getElementById('lore-modal').classList.add('hidden'));
  }

  // --- 15. INITIALIZATION BOOTSTRAP ---
  window.addEventListener('DOMContentLoaded', () => {
    init3D();
    setupInputHandlers();
    updateWeaponHUD();
    updateStatsHUD();
    updateMissionHUD();
    gameLoop();
  });

  window.addEventListener('resize', () => {
    if (Game.camera && Game.renderer) {
      Game.camera.aspect = window.innerWidth / window.innerHeight;
      Game.camera.updateProjectionMatrix();
      Game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });

  // Expose global controller for Android Bridge or Dev console
  window.DrexviaGame = Game;

})();
