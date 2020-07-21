const { getHeapUsed } = require('../../../lib/getHeapInfo')
let times = 10000

console.info('before memory heapUsed', getHeapUsed())

while(times--) {
    require('../../common/hw1')
    require('../../common/hw2')
    // fake delete
    delete require.cache[require.resolve('../../common/hw1')]
    delete require.cache[require.resolve('../../common/hw2')]
}