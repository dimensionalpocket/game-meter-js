# @dimensionalpocket/game-meter

A reactive Meter class for Javascript games. Supports minimum and maximum values, and regeneration over time.

## Usage

```javascript
var hp = new GameMeter()

hp.minimum = 0.0
hp.maximum = 100.0
hp.regeneration = 1.0 // 1 HP per second

hp.set(hp.maximum / 5)

assert(hp.current() == 50.0)

// wait 50 seconds

assert(hp.current() == 100.0)

// cause damage

hp.increment(-20.0)
assert(hp.current() == 80.0)

// wait 20 seconds

assert(hp.current() == 100.0)
```

## Properties

* `minimum`
* `maximum`
* `regeneration` - how many points to regenerate per second. Can be negative for a "decay" effect.

## Methods

* `set(value)` - sets the meter to an absolute value. Will be clamped based on minimum/maximum.
* `increment(value)` - regenerates the meter then adds/subtracts from the current value.
* `current([timestamp])` - returns the current meter value. Accepts an optional `timestamp` argument (default `Date.now()`).
