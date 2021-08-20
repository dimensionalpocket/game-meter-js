// @ts-check

'use strict'

import { expect, sinon } from '@dimensionalpocket/development'
import { GameMeter } from '../src/GameMeter.js'

describe('GameMeter', function () {
  before(function () {
    this.clock = sinon.useFakeTimers()
  })

  after(function () {
    this.clock.restore()
  })

  describe('constructor', function () {
    it('sets defaults', function () {
      var meter = new GameMeter()
      expect(meter.minimum).to.eq(0.0)
      expect(meter.maximum).to.eq(1.0)
      expect(meter.amount).to.eq(0.0)
      // @ts-ignore - private property
      expect(meter._regeneration).to.eq(0.0)
      // @ts-ignore - private property
      expect(meter._tick).to.eq(1)
      // @ts-ignore - private property
      expect(meter._timestamp).to.eq(Date.now())
    })

    it('sets minimum', function () {
      var meter = new GameMeter({ minimum: -1.0 })
      expect(meter.minimum).to.eq(-1.0)
    })

    it('sets maximum', function () {
      var meter = new GameMeter({ maximum: 100.0 })
      expect(meter.maximum).to.eq(100.0)
    })

    it('sets current amount', function () {
      var meter = new GameMeter({ maximum: 100.0, current: 50.5 })
      expect(meter.amount).to.eq(50.5)
    })

    it('sets regeneration', function () {
      var meter = new GameMeter({ regeneration: 2.5 })
      // @ts-ignore - private property
      expect(meter._regeneration).to.eq(2.5)
    })

    it('sets tick duration', function () {
      var meter = new GameMeter({ tick: 500 })
      // @ts-ignore - private property
      expect(meter._tick).to.eq(500)
      meter = new GameMeter({ tick: -500 })
      // @ts-ignore - private property
      expect(meter._tick).to.eq(1)
    })

    it('sets timestamp', function () {
      var meter = new GameMeter({ timestamp: 123456 })
      // @ts-ignore - private property
      expect(meter._timestamp).to.eq(123456)
    })
  })

  describe('#set', function () {
    it('sets current amount within limits', function () {
      var meter = new GameMeter({ minimum: 1.0, maximum: 5.0 })
      meter.set(3.5)
      expect(meter.amount).to.eq(3.5)
      meter.set(8.5)
      expect(meter.amount).to.eq(5.0)
      meter.set(0.5)
      expect(meter.amount).to.eq(1.0)
    })
  })

  describe('#current', function () {
    before(function () {
      this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, regeneration: 1.0, timestamp: 1000 })
      this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, regeneration: 1.0 })
      this.clock.tick(1000)
      this.current1 = this.meter1.current(2000)
      this.current2 = this.meter2.current()
    })

    it('regenerates first then returns current amount', function () {
      expect(this.current1).to.eq(51.0)
      expect(this.current2).to.eq(51.0)
    })
  })

  describe('#setRegeneration', function () {
    context('when previous regeneration is zero', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0 })
        this.clock.tick(1000)
        this.meter1.setRegeneration(2.0, 2000)
        this.meter2.setRegeneration(3.0)
      })

      it('sets regeneration amount', function () {
        // @ts-ignore - private property
        expect(this.meter1._regeneration).to.eq(2.0)
        // @ts-ignore - private property
        expect(this.meter2._regeneration).to.eq(3.0)
      })

      it('updates timestamps', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(2000)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now())
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(50.0)
        expect(this.meter2.amount).to.eq(50.0)
      })
    })

    context('when previous regeneration is not zero', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, regeneration: 1.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, regeneration: 1.0 })
        this.clock.tick(1000)
        this.meter1.setRegeneration(2.0, 2000)
        this.meter2.setRegeneration(3.0)
      })

      it('sets regeneration amount', function () {
        // @ts-ignore - private property
        expect(this.meter1._regeneration).to.eq(2.0)
        // @ts-ignore - private property
        expect(this.meter2._regeneration).to.eq(3.0)
      })

      it('updates timestamps', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(2000)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now())
      })

      it('regenerates under the previous amount', function () {
        expect(this.meter1.amount).to.eq(51.0)
        expect(this.meter2.amount).to.eq(51.0)
      })
    })
  })

  describe('#setTickDuration', function () {
    before(function () {
      this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 750, regeneration: 1.0, timestamp: 1000 })
      this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 1500, regeneration: 1.0 })
      this.clock.tick(1000)
      this.meter1.setTickDuration(2000, 2000)
      this.meter2.setTickDuration(3000)
    })

    it('sets tick duration', function () {
      // @ts-ignore - private property
      expect(this.meter1._tick).to.eq(2000)
      // @ts-ignore - private property
      expect(this.meter2._tick).to.eq(3000)
    })

    it('first regenerates under a 1ms tick setting', function () {
      expect(this.meter1.amount).to.eq(51.0)
      expect(this.meter2.amount).to.eq(51.0)
    })
  })

  describe('#regenerate', function () {
    context('when regeneration is zero', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0 })
        this.clock.tick(1000)
        this.result1 = this.meter1.regenerate(2000)
        this.result2 = this.meter2.regenerate()
      })

      it('returns 0', function () {
        expect(this.result1).to.eq(0)
        expect(this.result2).to.eq(0)
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(50.0)
        expect(this.meter2.amount).to.eq(50.0)
      })

      it('does not update timestamps', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(1000)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now() - 1000)
      })
    })

    context('when no time has passed', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 750, regeneration: 1.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 1500, regeneration: 1.0 })
        this.result1 = this.meter1.regenerate(1000) // no change
        this.result2 = this.meter2.regenerate()
      })

      it('returns 0', function () {
        expect(this.result1).to.eq(0)
        expect(this.result2).to.eq(0)
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(50.0)
        expect(this.meter2.amount).to.eq(50.0)
      })
    })

    context('when rewinding time', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, regeneration: 1.0, timestamp: 1000 })
        this.result1 = this.meter1.regenerate(500)
      })

      it('returns 0', function () {
        expect(this.result1).to.eq(0)
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(50.0)
      })

      it('moves timestamp back in time', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(500)
      })
    })

    context('when not a single tick has passed', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 750, regeneration: 1.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 1500, regeneration: 1.0 })
        this.result1 = this.meter1.regenerate(1500)
        this.clock.tick(500)
        this.result2 = this.meter2.regenerate()
      })

      it('returns 0', function () {
        expect(this.result1).to.eq(0)
        expect(this.result2).to.eq(0)
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(50.0)
        expect(this.meter2.amount).to.eq(50.0)
      })

      it('does not update timestamps', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(1000)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now() - 500)
      })
    })

    context('when one or more ticks have passed', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 750, regeneration: 1.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 50.0, tick: 1500, regeneration: 1.0 })
        this.result1 = this.meter1.regenerate(3000) // 2 ticks (750 x2) + 500ms partial tick
        this.clock.tick(2000)
        this.result2 = this.meter2.regenerate() // 1 tick + 500ms partial tick
      })

      it('returns the regenerated amounts', function () {
        expect(this.result1).to.eq(0.75 + 0.75) // regeneration 1.0 / tick 750 >> 2 ticks
        expect(this.result2).to.eq(1.5) // regeneration 1.0 / tick 1500
      })

      it('regenerates', function () {
        expect(this.meter1.amount).to.eq(51.5)
        expect(this.meter2.amount).to.eq(51.5)
      })

      it('updates timestamps subtracting partial ticks', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(2500)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now() - 500)
      })
    })

    context('when the meter is already filled or depleted', function () {
      before(function () {
        this.meter1 = new GameMeter({ maximum: 100.0, current: 100.0, tick: 750, regeneration: 1.0, timestamp: 1000 })
        this.meter2 = new GameMeter({ maximum: 100.0, current: 0.0, tick: 1500, regeneration: -1.0 })
        this.result1 = this.meter1.regenerate(3000) // 2 ticks (750 x2) + 500ms partial tick
        this.clock.tick(2000)
        this.result2 = this.meter2.regenerate() // 1 tick + 500ms partial tick
      })

      it('returns 0', function () {
        expect(this.result1).to.eq(0)
        expect(this.result2).to.eq(0)
      })

      it('does not regenerate', function () {
        expect(this.meter1.amount).to.eq(100.0)
        expect(this.meter2.amount).to.eq(0.0)
      })

      it('updates timestamps subtracting partial ticks', function () {
        // @ts-ignore - private property
        expect(this.meter1._timestamp).to.eq(2500)
        // @ts-ignore - private property
        expect(this.meter2._timestamp).to.eq(Date.now() - 500)
      })
    })
  })

  describe('#clamp', function () {
    it("clamps given value between meter's minimum and maximum", function () {
      var meter = new GameMeter({ minimum: -100.0, maximum: 100.0 })
      expect(meter.clamp(50.5)).to.eq(50.5)
      expect(meter.clamp(500)).to.eq(100.0)
      expect(meter.clamp(-500)).to.eq(-100.0)
    })
  })
})
