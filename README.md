# @dimensionalpocket/game-meter

A Meter class for Javascript games.

## Features

* Minimum and maximum amounts
* Regeneration over time
* Tick-based regeneration
* On-demand or timer-based updates

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
* `startTimer()` and `stopTimer()` - see the **Meter Update** section.

## Properties

* `minimum`
* `maximum`
* `amount` - the current amount, before regeneration.

## Meter Update

When a meter is instantiated, it does nothing (sits idly) until values are requested:

```javascript
var meter = new Meter({current: 50.0, maximum: 100.0, regeneration: 1.0})

// wait 10 seconds

meter.amount // => 50.0 -- no regeneration

meter.current() // => 60.0 -- regenerates first, then returns `meter.amount`
```

The main difference being:

* Calling most methods will cause the meter to regenerate.
* Calling properties will return the stored values without changes.

If you'd rather not call `current()` to cause `meter.amount` to change, you can start a timer on the meter:

```javascript
meter.startTimer()
```

This will create an internal timer that will constantly update `meter.amount`.

> Please note that the interval of that timer is the **tick duration**, so be careful when you run timers with the default 1 ms tick duration. For best results with timers, set a longer tick duration so that it doesn't overwhelm the CPU.

To stop the timer:

```javascript
meter.stopTimer()
```

Timers are great in combination with reactive libraries (such as **React**, **Vue**, etc) referencing `meter.amount` directly (as opposed to `meter.current()`) while the internal timer updates its value over time. You might also want to call `meter.stopTimer()` when the component is destroyed.
