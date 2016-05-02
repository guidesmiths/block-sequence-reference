var _ = require('lodash').runInContext()

module.exports = function(config, cb) {

    var store = {}

    function ensure(options, cb) {

        if (options.name === null || options.name === undefined) return cb(new Error('name is required'))

        var name = options.name.toLowerCase()
        var value = options.value || 0
        var metadata = options.metadata || {}

        process.nextTick(function() {
            cb(null, store[name] || create({ name: name, value: value, metadata: metadata }))
        })
    }

    function allocate(options, cb) {

        var size = options.size || 1

        ensure(options, function(err, sequence) {
            if (err) return cb(err)
            process.nextTick(function() {
                sequence.value += size
                var block = { next: sequence.value - size + 1, remaining: size }
                cb(null, _.chain({})
                          .defaultsDeep(sequence, block)
                          .omit(['value'])
                          .value()
                )
            })
        })
    }

    function create(options) {
        store[options.name] = _.defaultsDeep(options, { value: 0 })
        return store[options.name]
    }

    function remove(options, cb) {
        if (options.name === null || options.name === undefined) return cb(new Error('name is required'))
        delete store[options.name]
        cb()
    }

    function close(cb) {
        cb && cb()
    }

    cb(null, {
        remove: remove,
        allocate: allocate,
        ensure: ensure,
        close: close
    })

}