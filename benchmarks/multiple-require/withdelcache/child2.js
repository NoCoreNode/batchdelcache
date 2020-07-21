const delcache = require('../../../batchdelcache')
const { getHeapUsed } = require('../../../lib/getHeapInfo')

require('../../common/hw1')
require('../../common/hw2')
delcache(['../../common/hw1', '../../common/hw2'], true)

global.gc()

console.info('after memory heapUsed', getHeapUsed())
