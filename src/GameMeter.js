// @ts-check

'use strict'

export class GameMeter {
  /**
   * @param {object} [opts]
   * @param {number} [opts.minimum] - Minimum amount. Defaults to 0.
   * @param {number} [opts.maximum] - Maximum amount. Defaults to 1.0.
   * @param {number} [opts.current] - Starting amount. Defaults to 0.
   * @param {number} [opts.regeneration] - Amount of meter to regenerate per second. Can also be zero or negative. Defaults to 0.
   * @param {number} [opts.timestamp] - Timestamp the meter starts at. Defaults to current timestamp.
   * @param {number} [opts.tick] - Tick duration in milliseconds. Defaults to 1.
   */
  constructor ({ minimum = 0.0, maximum = 1.0, current = 0.0, regeneration = 0.0, timestamp = Date.now(), tick = 1 } = {}) {
    /** @type {number} */
    this.minimum = minimum

    /** @type {number} */
    this.maximum = maximum

    this.set(current)

    /**
     * Amount of meter to regenerate per second.
     * Can also be zero or negative.
     * @type {number}
     * @private
     */
    this._regeneration = regeneration

    /**
     * Timestamp the meter was last updated at.
     * Only used with regeneration.
     * @type {number}
     * @private
     */
    this._timestamp = timestamp

    /**
     * Tick duration in ms. Must be >= 1.
     * Only used with regeneration.
     * @type {number}
     * @private
     */
    this._tick = Math.max(tick, 1)
  }

  /**
   * Sets the current amount.
   * @param {number} amount
   */
  set (amount) {
    /**
     * Current amount of meter.
     * @type {number}
     */
    this.amount = this.clamp(amount)
  }

  /**
   * Returns the current amount of meter after regeneration.
   * @param {number} [timestamp] - timestamp as integer
   */
  current (timestamp = Date.now()) {
    this.regenerate(timestamp)
    return this.amount
  }

  /**
   * Sets a new regeneration amount for this meter.
   * @param {number} regeneration - Amount per second to regenerate. Can also be zero or negative.
   * @param {number} [timestamp]
   */
  setRegeneration (regeneration, timestamp = Date.now()) {
    var oldRegeneration = this._regeneration
    if (oldRegeneration !== 0) {
      // First regenerate using the previous amount before applying the new one.
      this.regenerate(timestamp)
    } else if (regeneration !== 0) {
      // In this case, regeneration is changing from zero, so we assign a new timestamp.
      // (Timestamps are only updated when regeneration is not zero -- see #regenerate).
      this._timestamp = timestamp
    }

    this._regeneration = regeneration
  }

  /**
   * Sets the tick duration in milliseconds.
   * @param {number} duration - Duration in milliseconds. Must be >= 1.
   * @param {number} [timestamp]
   */
  setTickDuration (duration, timestamp = Date.now()) {
    // Before applying the new duration, regenerate the meter
    // using a 1ms tick duration to account for a partial tick.
    this._tick = 1
    this.regenerate(timestamp)

    this._tick = Math.max(1, duration)
  }

  /**
   * Regenerates the meter based on a new timestamp.
   * @param {number} [timestamp]
   * @return {number} - Amount of meter regenerated.
   */
  regenerate (timestamp = Date.now()) {
    // Skip if the meter does not regenerate.
    var regeneration = this._regeneration
    if (regeneration === 0) return 0

    var oldTimestamp = this._timestamp

    // No time change, nothing to do.
    if (timestamp === oldTimestamp) return 0

    // If rewinding time, just update the timestamp and skip regeneration.
    // TODO: perhaps support rewinding time in the future? (Impacts tick calculations.)
    var delta = timestamp - oldTimestamp
    if (delta < 0) {
      this._timestamp = timestamp
      return 0
    }

    var tick = this._tick
    var ticks = Math.floor(delta / tick)

    // If the time difference is shorter than a single tick, do not regenerate.
    if (ticks < 1) return 0

    // Updates timestamp subtracting the incomplete tick duration,
    // so that the new timestamp increase is a multiple of the tick duration.
    this._timestamp = timestamp - (delta % tick)

    var oldCurrent = this.amount

    // Skip if meter is already filled or depleted.
    if (
      (regeneration > 0 && oldCurrent >= this.maximum) ||
      (regeneration < 0 && oldCurrent <= this.minimum)
    ) return 0

    // Gain is based on how many ticks passed.
    // Expression in brackets is "regeneration per tick".
    var gain = (regeneration * tick / 1000) * ticks

    var newCurrent = this.clamp(oldCurrent + gain)

    this.amount = newCurrent

    // Returns the gain after clamping.
    return newCurrent - oldCurrent
  }

  /**
   * Clamps a value between the meter's minimum and maximum.
   * @param {number} value - value to clamp
   * @return {number} - adjusted value
   */
  clamp (value) {
    return Math.min(Math.max(value, this.minimum), this.maximum)
  }
}
