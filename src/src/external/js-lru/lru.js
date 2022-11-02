var LRUCache = require('./lru-core').LRUCache

// ----------------------------------------------------------------------------
// Following code is optional and can be removed without breaking the core
// functionality.

/**
 * Check if <key> is in the cache without registering recent use. Feasible if
 * you do not want to chage the state of the cache, but only "peek" at it.
 * Returns the entry associated with <key> if found, or undefined if not found.
 */
LRUCache.prototype.find = function (key) {
  return this._keymap[key]
}

/**
 * Update the value of entry with <key>. Returns the old value, or undefined if
 * entry was not in the cache.
 */
LRUCache.prototype.set = function (key, value) {
  var oldvalue
  var entry = this.get(key, true)
  if (entry) {
    oldvalue = entry.value
    entry.value = value
  } else {
    oldvalue = this.put(key, value)
    if (oldvalue) oldvalue = oldvalue.value
  }
  return oldvalue
}

/**
 * Remove entry <key> from cache and return its value. Returns undefined if not
 * found.
 */
LRUCache.prototype.remove = function (key) {
  var entry = this._keymap[key]
  if (!entry) {
    return
  }
  delete this._keymap[entry.key] // need to do delete unfortunately
  if (entry.newer && entry.older) {
    // relink the older entry with the newer entry
    entry.older.newer = entry.newer
    entry.newer.older = entry.older
  } else if (entry.newer) {
    // remove the link to us
    entry.newer.older = undefined
    // link the newer entry to head
    this.head = entry.newer
  } else if (entry.older) {
    // remove the link to us
    entry.older.newer = undefined
    // link the newer entry to head
    this.tail = entry.older
  } else {// if(entry.older === undefined && entry.newer === undefined) {
    this.head = this.tail = undefined
  }

  this.size--
  return entry.value
}

/** Removes all entries */
LRUCache.prototype.removeAll = function () {
  // This should be safe, as we never expose strong refrences to the outside
  this.head = this.tail = undefined
  this.size = 0
  this._keymap = {}
}

/**
 * Return an array containing all keys of entries stored in the cache object, in
 * arbitrary order.
 */
if (typeof Object.keys === 'function') {
  LRUCache.prototype.keys = function () {
    return Object.keys(this._keymap)
  }
} else {
  LRUCache.prototype.keys = function () {
    var keys = []
    for (var k in this._keymap) keys.push(k)
    return keys
  }
}

/**
 * Call `fun` for each entry. Starting with the newest entry if `desc` is a true
 * value, otherwise starts with the oldest (head) enrty and moves towards the
 * tail.
 *
 * `fun` is called with 3 arguments in the context `context`:
 *   `fun.call(context, Object key, Object value, LRUCache self)`
 */
LRUCache.prototype.forEach = function (fun, context, desc) {
  var entry
  if (context === true) {
    desc = true
    context = undefined
  } else if (typeof context !== 'object') {
    context = this
  }
  if (desc) {
    entry = this.tail
    while (entry) {
      fun.call(context, entry.key, entry.value, this)
      entry = entry.older
    }
  } else {
    entry = this.head
    while (entry) {
      fun.call(context, entry.key, entry.value, this)
      entry = entry.newer
    }
  }
}

/** Returns a JSON (array) representation */
LRUCache.prototype.toJSON = function () {
  var s = []
  var entry = this.head
  while (entry) {
    s.push({key: entry.key.toJSON(), value: entry.value.toJSON()})
    entry = entry.newer
  }
  return s
}

/** Returns a String representation */
LRUCache.prototype.toString = function () {
  var s = ''
  var entry = this.head
  while (entry) {
    s += String(entry.key) + ':' + entry.value
    entry = entry.newer
    if (entry) {
      s += ' < '
    }
  }
  return s
}

// Export ourselves
if (typeof this === 'object') {
  this.LRUCache = LRUCache
}
