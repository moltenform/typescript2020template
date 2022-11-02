// Test which will run in nodejs
// $ node test.js
// (Might work with other CommonJS-compatible environments)
var assert = require('assert')
var LRUCache = require('./lru-core').LRUCache
var c = new LRUCache(4)

c.put('adam', 29)
c.put('john', 26)
c.put('angela', 24)
c.put('bob', 48)

assert.equal(c.get('adam'), 29)
assert.equal(c.get('john'), 26)
assert.equal(c.get('angela'), 24)
assert.equal(c.get('bob'), 48)

assert.equal(c.get('angela'), 24)

c.put('ygwie', 81)
assert.equal(c.get('adam'), undefined)

// test remove
var to_remove = new LRUCache(4)
to_remove.put('adam', 29)
to_remove.put('john', 26)
to_remove.shift()
to_remove.shift()
assert.equal(to_remove.size, 0)
assert.equal(to_remove.head, undefined)
assert.equal(to_remove.tail, undefined)

// test shift
c = new LRUCache(4)
assert.equal(c.size, 0)
c.put('a', 1)
c.put('b', 2)
c.put('c', 3)
assert.equal(c.size, 3)
var e = c.shift()
assert(e.key, 'a')
assert(e.value, 1)
e = c.shift()
assert(e.key, 'b')
assert(e.value, 2)
e = c.shift()
assert(e.key, 'c')
assert(e.value, 3)
assert.equal(c.size, 0)

c = new LRUCache(4)

c.put(0, 1)
c.put(0, 2)
c.put(0, 3)
c.put(0, 4)

assert.equal(c.size, 4)
assert.deepEqual(c.shift(), { key: 0, value: 1, newer: undefined, older: undefined })
assert.deepEqual(c.shift(), { key: 0, value: 2, newer: undefined, older: undefined })
assert.deepEqual(c.shift(), { key: 0, value: 3, newer: undefined, older: undefined })
assert.deepEqual(c.shift(), { key: 0, value: 4, newer: undefined, older: undefined })
assert.equal(c.size, 0) // check .size correct
// If we made it down here, all tests passed. Neat.
