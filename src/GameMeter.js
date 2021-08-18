// @ts-check

'use strict'

export class GameMeter {
  /**
   * @param {object} [opts]
   * @param {number} [opts.minimum]
   * @param {number} [opts.maximum]
   * @param {number} [opts.current]
   * @param {number} [opts.regeneration]
   * @param {number} [opts.timestamp] - timestamp as integer
   */
  constructor ({ minimum = 0.0, maximum = 1.0, current = 0.0, regeneration = 0.0, timestamp = Date.now() } = {}) {
    /** @type {number} */
    this.minimum = minimum

    /** @type {number} */
    this.maximum = maximum

    /** @type {number} */
    this._current = current

    /** @type {number} */
    this._regeneration = regeneration

    /** @type {number} */
    this.timestamp = timestamp
  }

  /**
   * Returns the current amount of meter.
   * Runs regeneration first.
   * @param {number} timestamp - timestamp as integer
   */
  current (timestamp = Date.now()) {
    return this.regenerate(timestamp)._current
  }

  /**
   * Regenerates the meter based on a new timestamp.
   * @param {number} timestamp
   * @return {this}
   */
  regenerate (timestamp = Date.now()) {
    // Skip if the meter does not regenerate.
    if (this._regeneration === 0) return this

    var delta = timestamp - this.timestamp
    this.timestamp = timestamp

    // If timestamp is lower than last update, do not regenerate.
    if (delta < 0) return this

    var gain = this._regeneration * (delta / 1000)
    this._current += gain

    return this.clamp()
  }

  clamp () {
    return this
  }
}
