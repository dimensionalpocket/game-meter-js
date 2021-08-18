// @ts-check

'use strict'

import { expect } from '@dimensionalpocket/development'

import GameMeter from '../index.js'
import { GameMeter as GameMeterFromSrc } from '../src/GameMeter.js'

describe('main require', function () {
  it('exports GameMeter from src', function () {
    expect(GameMeter).to.equal(GameMeterFromSrc)
  })
})
