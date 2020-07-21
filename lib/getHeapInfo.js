function getHeapUsed() {
    return process.memoryUsage().heapUsed / 1024 / 1024
}

function getHeapTotal() {
    return process.memoryUsage().heapTotal / 1024 / 1024
}

module.exports = {
    getHeapUsed,
    getHeapTotal
}