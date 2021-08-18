// @ts-check

'use strict'

import { expect } from '@dimensionalpocket/development'

import Meter from '../index.js'
import { Meter as MeterFromSrc } from '../src/Meter.js'

describe('main require', function () {
  it('exports Meter from src', function () {
    expect(Meter).to.equal(MeterFromSrc)
  })
})
