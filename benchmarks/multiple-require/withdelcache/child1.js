const delcache = require('../../../batchdelcache')
const { getHeapUsed } = require('../../../lib/getHeapInfo')
let times = 10000

console.info('before memory heapUsed', getHeapUsed())

while(times--) {
    var a = require('../../common/hw1')
    delete require.cache[require.resolve('../../common/hw1')]
}
