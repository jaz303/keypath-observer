# keypath-observer

## Keypaths

A `keypath` is a non-empty array consisting of strings and integers. A single element in this array is called a segment.

Wildcards are supported; when supplying a keypath to observe, use `?` to match any value for the current segment, or `*` to match all keypaths from this point, regardless of length.

### Wildcard Examples

`['a', 'b', '?']` matches `['a', 'b', 'c']`, `['a', 'b', 'a']`, but not `['a', 'b', 'c', 'd']`.

`['a', '*']` matches `['a', 'b']`, `['a', 'b', 'b']`, and so-on.

## Events

Events are designated by strings and may be namespaced with `:`. Events propagate through the namespace hierarchy, so for example, firing the event `change:update:add` would fire listeners registers for `change:update:add`, `change:update` and `change`.

## API

#### `var tree = require('keypath-observer')()`

Create a new keypath observer instance.

#### `tree.observe(keypath, cb, [ctx])`

Register callback `cb`, optionally bound to context `ctx`, to be fired whenever any event is emitted on `keypath`.

Returns a function that can be called to remove the callback registration.

#### `tree.observe(keypath, evt, cb, [ctx])`

Register callback `cb`, optionally bound to context `ctx`, to be fired whenever event `evt` is emitted on `keypath`.

Returns a function that can be called to remove the callback registration.

#### `tree.emit(keypath, evt, [args...])`

Emit event `evt` on `keypath`.