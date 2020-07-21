const delcache = require('../../../batchdelcache')
let times = 10000

while(times--) {
    var a = require('../../common/hw2')
    delete require.cache[require.resolve('../../common/hw2')]
}