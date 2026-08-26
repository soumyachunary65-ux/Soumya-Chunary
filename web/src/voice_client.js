/**
 * DREXVIA - WebRTC 3D Proximity & Squad Voice Client
 * Developer: Soumya Chunary Studios
 */

class VoiceClient {
  constructor(gameClient) {
    this.game = gameClient;
    this.localStream = null;
    this.audioCtx = null;
    this.micGainNode = null;
    this.peers = new Map(); // peerId -> { pc, pannerNode, gainNode, audioEl, isSquad }
    this.isMuted = true;
    this.pushToTalkActive = false;
    this.voiceMode = 'proximity'; // 'proximity' | 'squad'
    this.micEnabled = false;

    // WebRTC STUN servers configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  async init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.micGainNode = this.audioCtx.createGain();
      this.micGainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });

        const micSource = this.audioCtx.createMediaStreamSource(this.localStream);
        micSource.connect(this.micGainNode);

        // Mute mic by default until Push-to-Talk is pressed
        this.setMicrophoneActive(false);
        this.micEnabled = true;
        console.log('[DREXVIA VOICE] WebRTC Voice System Initialized.');
      } else {
        console.warn('[DREXVIA VOICE] Microphones not supported in this environment, using simulated voice.');
      }
    } catch (err) {
      console.warn('[DREXVIA VOICE] Microphone access restricted/denied:', err.message);
      this.micEnabled = false;
    }
  }

  setMicrophoneActive(active) {
    this.pushToTalkActive = active;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = active;
      });
    }

    const micIndicator = document.getElementById('voice-indicator');
    if (micIndicator) {
      micIndicator.classList.toggle('active', active);
    }
  }

  async createPeerConnection(targetId, isSquad = false) {
    if (this.peers.has(targetId)) return this.peers.get(targetId).pc;

    const pc = new RTCPeerConnection(this.rtcConfig);

    // Setup 3D Spatial Audio Panner
    const panner = this.audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 3.0;
    panner.maxDistance = 40.0;
    panner.rolloffFactor = 1.5;
    panner.coneInnerAngle = 360;

    const gain = this.audioCtx.createGain();
    panner.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Add local tracks to send
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && this.game.ws) {
        this.game.sendVoiceSignal(targetId, 'ice', e.candidate, this.voiceMode);
      }
    };

    pc.ontrack = (e) => {
      const remoteStream = e.streams[0];
      const audioSource = this.audioCtx.createMediaStreamSource(remoteStream);
      audioSource.connect(panner);
    };

    this.peers.set(targetId, { pc, panner, gain, isSquad });
    return pc;
  }

  updateListenerPosition(playerPos, playerYaw) {
    if (!this.audioCtx || !this.audioCtx.listener) return;

    // Orientation vector
    const lx = -Math.sin(playerYaw);
    const lz = -Math.cos(playerYaw);

    if (this.audioCtx.listener.positionX) {
      this.audioCtx.listener.positionX.setValueAtTime(playerPos.x, this.audioCtx.currentTime);
      this.audioCtx.listener.positionY.setValueAtTime(playerPos.y, this.audioCtx.currentTime);
      this.audioCtx.listener.positionZ.setValueAtTime(playerPos.z, this.audioCtx.currentTime);
      this.audioCtx.listener.forwardX.setValueAtTime(lx, this.audioCtx.currentTime);
      this.audioCtx.listener.forwardY.setValueAtTime(0, this.audioCtx.currentTime);
      this.audioCtx.listener.forwardZ.setValueAtTime(lz, this.audioCtx.currentTime);
    }
  }

  updatePeer3DPosition(peerId, peerPos) {
    const peer = this.peers.get(peerId);
    if (peer && peer.panner) {
      if (peer.panner.positionX) {
        peer.panner.positionX.setValueAtTime(peerPos.x, this.audioCtx.currentTime);
        peer.panner.positionY.setValueAtTime(peerPos.y, this.audioCtx.currentTime);
        peer.panner.positionZ.setValueAtTime(peerPos.z, this.audioCtx.currentTime);
      }
    }
  }

  async handleIncomingSignal(msg) {
    const { senderId, signalType, signalData, mode, senderPosition } = msg;

    if (senderPosition) {
      this.updatePeer3DPosition(senderId, senderPosition);
    }

    const pc = await this.createPeerConnection(senderId, mode === 'squad');

    if (signalType === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.game.sendVoiceSignal(senderId, 'answer', answer, this.voiceMode);
    } else if (signalType === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
    } else if (signalType === 'ice') {
      await pc.addIceCandidate(new RTCIceCandidate(signalData));
    }
  }

  destroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
    }
    this.peers.forEach(p => p.pc.close());
    this.peers.clear();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceClient;
}
