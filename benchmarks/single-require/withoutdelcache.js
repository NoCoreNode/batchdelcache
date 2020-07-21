const { getHeapUsed } = require('../../lib/getHeapInfo')
console.info('before memory heapUsed', getHeapUsed())
let time = 10000

while(time--) {
    require('../common/hw1')
    require('../common/hw2')
    delete require.cache[require.resolve('../common/hw1')]
    delete require.cache[require.resolve('../common/hw2')]
}
global.gc()
console.info('after memory heapUsed', getHeapUsed())

