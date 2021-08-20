# @dimensionalpocket/game-meter

A Meter class for Javascript games.

## Features

* Minimum and maximum amounts
* Regeneration over time
* Tick-based regeneration
* On-demand updates

## Usage

```javascript
var hp = new GameMeter({
  minimum: 0.0,
  maximum: 100.0,
  regeneration: 1.0 // 1 HP per second
})

hp.set(hp.maximum / 2)

assert(hp.current() == 50.0)

// wait 50 seconds

assert(hp.current() == 100.0)

// cause damage
hp.increment(-20.0)

assert(hp.current() == 80.0)

// wait 20 seconds

assert(hp.current() == 100.0)
```

## Methods

Most methods take an optional `timestamp` argument which is used to regenerate the meter before applying changes or returning amounts. The `timestamp` argument defaults to current time.

* `set(amount)` - sets the meter to an absolute amount. Will be clamped based on minimum/maximum.
* `setRegeneration(amount, [timestamp])` - changes regeneration amount.
* `setTickDuration(duration, [timestamp])` - sets the tick duration. Default is 1 ms (the same as no tick).
* `increment(amount, [timestamp])` - adds/subtracts from the current amount.
* `current([timestamp])` - returns the current meter amount, after regeneration.
* `regenerate([timestamp])` - regenerates the meter based on time passed after last update.

## Properties

* `minimum`
* `maximum`
* `amount` - the current amount, before regeneration.
