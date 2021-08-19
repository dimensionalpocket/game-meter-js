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
      // @ts-ignore - private property
      expect(meter._current).to.eq(0.0)
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
      // @ts-ignore - private property
      expect(meter._current).to.eq(50.5)
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
      // @ts-ignore - private property
      expect(meter._current).to.eq(3.5)
      meter.set(8.5)
      // @ts-ignore - private property
      expect(meter._current).to.eq(5.0)
      meter.set(0.5)
      // @ts-ignore - private property
      expect(meter._current).to.eq(1.0)
    })
  })

  describe('#setRegeneration', function () {
    before(function () {
      this.meter1 = new GameMeter({ maximum: 100.0 })
      this.meter2 = new GameMeter({ maximum: 100.0 })
      sinon.stub(this.meter1, 'regenerate')
      sinon.stub(this.meter2, 'regenerate')
      this.meter1.setRegeneration(2.0, 123456)
      this.meter2.setRegeneration(3.0)
    })

    after(function () {
      this.meter1.regenerate.restore()
      this.meter2.regenerate.restore()
    })

    it('calls #regenerate with timestamp', function () {
      expect(this.meter1.regenerate).to.have.been.calledWith(123456)
      expect(this.meter2.regenerate).to.have.been.calledWith(Date.now())
    })

    it('sets regeneration amount', function () {
      // @ts-ignore - private property
      expect(this.meter1._regeneration).to.eq(2.0)
      // @ts-ignore - private property
      expect(this.meter2._regeneration).to.eq(3.0)
    })
  })

  describe('#setTickDuration', function () {
    before(function () {
      this.meter1 = new GameMeter({ maximum: 100.0 })
      this.meter2 = new GameMeter({ maximum: 100.0 })
      sinon.stub(this.meter1, 'regenerate')
      sinon.stub(this.meter2, 'regenerate')
      this.meter1.setTickDuration(2000, 123456)
      this.meter2.setTickDuration(3000)
    })

    after(function () {
      this.meter1.regenerate.restore()
      this.meter2.regenerate.restore()
    })

    it('calls #regenerate with timestamp', function () {
      expect(this.meter1.regenerate).to.have.been.calledWith(123456)
      expect(this.meter2.regenerate).to.have.been.calledWith(Date.now())
    })

    it('sets tick duration', function () {
      // @ts-ignore - private property
      expect(this.meter1._tick).to.eq(2000)
      // @ts-ignore - private property
      expect(this.meter2._tick).to.eq(3000)
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

  describe('#regenerate', function () {

  })
})
