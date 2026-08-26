/**
 * DREXVIA - WebRTC Proximity & Squad Voice Signaling Server
 * Developer: Soumya Chunary Studios
 */

class VoiceSignaling {
  constructor() {
    this.peers = new Map(); // playerId -> { ws, position, squadId, matchId, isMuted }
  }

  registerPeer(playerId, ws, squadId, matchId) {
    this.peers.set(playerId, {
      ws,
      squadId,
      matchId,
      position: { x: 0, y: 0, z: 0 },
      isMuted: false
    });
  }

  updatePeerPosition(playerId, pos) {
    const peer = this.peers.get(playerId);
    if (peer) {
      peer.position = pos;
    }
  }

  handleSignal(senderId, data) {
    // data: { targetId, signalType: 'offer'|'answer'|'ice', signalData, mode: 'proximity'|'squad' }
    const sender = this.peers.get(senderId);
    if (!sender) return;

    if (data.targetId) {
      const target = this.peers.get(data.targetId);
      if (target && target.ws && target.ws.readyState === 1) {
        // Calculate 3D distance for spatial audio volume attenuation hint
        const dx = sender.position.x - target.position.x;
        const dy = sender.position.y - target.position.y;
        const dz = sender.position.z - target.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        target.ws.send(JSON.stringify({
          type: 's_voice_relay',
          senderId: senderId,
          signalType: data.signalType,
          signalData: data.signalData,
          mode: data.mode || 'proximity',
          distance: dist,
          senderPosition: sender.position
        }));
      }
    }
  }

  removePeer(playerId) {
    this.peers.delete(playerId);
  }
}

module.exports = VoiceSignaling;
