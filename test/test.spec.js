const delcache = require('../batchdelcache')
const child_process = require('child_process')
const path = require('path')
const expect = require('chai').expect


it('nonexistent module', () => {
    expect(() => {
        delcache('./nonexistent')
    }).to.throw(/nonexistent/)
})

it('delete twice', () => {
    expect(() => {
        let five = require('./res/five')
        delcache('./res/five')
        delcache('./res/five')
    }).to.not.throw()
})

it('check parent children', () => {
    require('./res/six');
    require('./res/nine');
    delcache(['./res/six', './res/nine']);
    const count = module.children.filter(m => {
        return m.id == require.resolve('./res/six') || m.id == require.resolve('./res/nine')
    }).length
    expect(count).to.be.equal(0)
})

it('delcache local module successfully', () => {
    let five = require('./res/five')
    let eight = require('./res/eight')
    five.num = 6
    eight.num = 9
    delcache(['./res/five', './res/eight'])
    const addons = Object.keys(require.cache)
    expect(addons.indexOf(require.resolve('./res/five'))).to.be.equal(-1)
    expect(addons.indexOf(require.resolve('./res/eight'))).to.be.equal(-1)
    five = require('./res/five')
    expect(five.num).to.be.equal(5)
    eight = require('./res/eight')
    expect(eight.num).to.be.equal(8)
})

it('delcache js addons successfully', () => {
    require('chalk')
    delcache('chalk')
    const addons = Object.keys(require.cache)
    expect(addons.indexOf(require.resolve('modern-syslog'))).to.be.equal(-1)
})

it('ignore c++ child', function () {
    require('modern-syslog')
    delcache('modern-syslog')
    expect(() => {
        require('modern-syslog')
    }).to.not.throw()
})

it('delete all', function (done) {
    child_process.exec(`node ${ path.resolve(__dirname, './res/parent.js') }`, function (error, stdout, stderr) {
        if (!error && /num:0/.test(stdout)) {
            done()
        }
        else {
            expect.fail()
            done()
        }
    });
})

it('normal deleting will not remove ancestor\' child', function () {
    require('./res/seven')
    module.parent.children.push(require.cache[require.resolve('./res/seven')])
    delcache('./res/seven')
    const count = module.parent.children.filter(m => {
        return m.id == require.resolve('./res/seven')
    }).length
    expect(count).to.be.equal(1)
})

it('`all` deleting will remove ancestor\' child', function () {
    require('./res/seven')
    module.parent.children.push(require.cache[require.resolve('./res/seven')])
    delcache('./res/seven', 1)
    const count = module.parent.children.filter(m => {
        return m.id == require.resolve('./res/seven')
    }).length
    expect(count).to.be.equal(0)
})

it('nonexistent root module', () => {
    expect(() => {
        require('chalk')
        delcache('chalk', 1, '../../nonexistent')
    }).to.not.throw()
})

it('root module', function () {
    require('./res/seven')
    module.parent.children.push(require.cache[require.resolve('./res/seven')])
    delcache('./res/seven', 1, module)
    const count = module.parent.children.filter(m => {
        return m.id == require.resolve('./res/seven')
    }).length
    expect(count).to.be.equal(1)
})

it('ignore module that is still in use', function () {
    require('./res/ignore-module-still-in-use/index')
    expect(require('./res/ignore-module-still-in-use/lib').state.a).to.be.equal(3);
    delcache('./res/ignore-module-still-in-use/a', true, './res/ignore-module-still-in-use/index')
    expect(require('./res/ignore-module-still-in-use/lib').state.a).to.be.equal(3);
})
