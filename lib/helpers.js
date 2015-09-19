var unyield = require('unyield')
var thunkify = require('thunkify')

/**
 * Given a thunk `fn`, return a thunk of it that returns `undefined` instead of
 * an error. Useful for, say, `fs.stat()`.
 */

var safe = function (fn) {
  return unyield(function * () {
    try {
      var result = yield fn.apply(this, arguments)
      return result
    } catch (e) {
      return
    }
  })
}

var stat = safe(thunkify(require('fs').stat))

/**
 * Given two objects, return a list of keys in `new` that values are changed in
 * `old`. Also, propagate the new keys into `old`.
 *
 *     var old = {
 *       'index.html': 'abc'
 *       'script.js': 'def'
 *     }
 *
 *     var neww = {
 *       'index.html': 'xyz'
 *       'script.js': 'def'
 *     }
 *
 *     diffHashes(old, new)
 *     => [ 'index.html' ]
 */

exports.diffHashes = function (old, neww) {
  var updated = []

  Object.keys(neww).forEach(function (key) {
    if (!old[key] || old[key] !== neww[key]) {
      updated.push(key)
    }
    old[key] = neww[key]
  })

  return updated
}

/**
 * Given a list of files `paths`, return only the files; weed out any
 * directories or whatnot.
 */

exports.filterFiles = unyield(function * (cwd, paths) {
  var stats = yield paths.map(function (path) {
    return stat(require('path').join(cwd, path))
  })

  var result = paths.filter(function (path, idx) {
    if (stats[idx] && stats[idx].isFile()) return true
  })

  return result
})