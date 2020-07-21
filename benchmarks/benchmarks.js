const path = require('path')
const child_process = require('child_process')

const benchmarks = [
    './single-require/withoutdelcache.js',
    './single-require/withdelcache.js',
    './multiple-require/withoutdelcache/parent.js',
    './multiple-require/withdelcache/parent.js',
]

for(const benchmark of benchmarks) {
    child_process.exec(`node --expose_gc ${ path.resolve(__dirname, benchmark) }`, function (error, stdout, stderr) {
        if (error) {
            console.log(error)
        }
        console.log(`--- ${ benchmark } ---`)
        console.log(stdout)
        console.log('\r\n')
    });
}