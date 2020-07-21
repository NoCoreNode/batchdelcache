const delcache = require('../../batchdelcache')
const { getHeapUsed } = require('../../lib/getHeapInfo')
console.info('before memory heapUsed', getHeapUsed())
let time = 10000

while(time--) {
    require('../common/hw1')
    require('../common/hw2')
    delcache(['../common/hw1', '../common/hw2'])
}
global.gc()
console.info('after memory heapUsed', getHeapUsed())
