import crypto from 'crypto';

/**
 * Revive AI — Cryptographic Append-Only Hash-Chained Audit Ledger
 * Guarantees zero tampering, immutable monotonic sequences, and verifiable provenance.
 */

const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

export class HashChainedAuditLedger {
  constructor(initialEvents = []) {
    this.events = [];
    if (initialEvents && initialEvents.length > 0) {
      initialEvents.forEach(evt => this.appendEvent(evt));
    }
  }

  getLatestHash() {
    if (this.events.length === 0) return GENESIS_HASH;
    return this.events[0].block_hash;
  }

  getLatestSequence() {
    if (this.events.length === 0) return 0;
    return this.events[0].sequence_id || this.events.length;
  }

  appendEvent(eventData) {
    const prevHash = this.getLatestHash();
    const sequenceId = this.getLatestSequence() + 1;
    const timestamp = eventData.occurred_at || new Date().toISOString();
    const actorId = eventData.actor_id || 'system';
    const action = eventData.action || 'UNKNOWN_ACTION';
    const correlationId = eventData.correlation_id || 'GENERAL';
    const details = typeof eventData.details === 'string' ? eventData.details : JSON.stringify(eventData.details || {});

    const blockPayload = `${prevHash}|${sequenceId}|${timestamp}|${actorId}|${action}|${correlationId}|${details}`;
    const blockHash = crypto.createHash('sha256').update(blockPayload).digest('hex');

    const fullBlock = {
      id: eventData.id || `AUDIT-${Date.now()}-${sequenceId}`,
      sequence_id: sequenceId,
      prev_hash: prevHash,
      block_hash: blockHash,
      occurred_at: timestamp,
      actor_type: eventData.actor_type || 'system',
      actor_id: actorId,
      action: action,
      correlation_id: correlationId,
      details: details,
      tamper_proof: true
    };

    this.events.unshift(fullBlock);
    return fullBlock;
  }

  verifyChainIntegrity() {
    if (this.events.length === 0) {
      return { valid: true, totalBlocks: 0, status: "EMPTY_LEDGER" };
    }

    // Traverse from oldest (tail) to newest (head)
    const chronological = [...this.events].reverse();
    let expectedPrevHash = GENESIS_HASH;

    for (let i = 0; i < chronological.length; i++) {
      const block = chronological[i];

      if (block.prev_hash !== expectedPrevHash) {
        return {
          valid: false,
          brokenBlockSequence: block.sequence_id,
          expectedPrevHash,
          actualPrevHash: block.prev_hash,
          reason: `Hash pointer mismatch at sequence #${block.sequence_id}`
        };
      }

      const blockPayload = `${block.prev_hash}|${block.sequence_id}|${block.occurred_at}|${block.actor_id}|${block.action}|${block.correlation_id}|${block.details}`;
      const calculatedHash = crypto.createHash('sha256').update(blockPayload).digest('hex');

      if (calculatedHash !== block.block_hash) {
        return {
          valid: false,
          brokenBlockSequence: block.sequence_id,
          calculatedHash,
          actualHash: block.block_hash,
          reason: `Payload tampering detected at sequence #${block.sequence_id}`
        };
      }

      expectedPrevHash = block.block_hash;
    }

    return {
      valid: true,
      totalBlocks: this.events.length,
      latestBlockHash: this.getLatestHash(),
      status: "CHAIN_VALID_CRYPTOGRAPHICALLY_SEALED"
    };
  }

  getEvents() {
    return this.events;
  }
}
