/**
 * @file batch delete require cache
 * @author cxtom
 */

const path = require('path')
const callsite = require('callsite')

function batchdelcache(modulePathArray, all = false, rootPath = '') {

    function traverseChildren(mod, cb) {
        const visitedChildiren = {}
        visitedChildiren[mod.id] = 1

        function run(m) {
            visitedChildiren[m.id] = 1;
            m.children = m.children.filter(child => {
                // 不能 delete c++ child，否则报错
                if (path.extname(child.filename) !== '.node' && !visitedChildiren[child.id]) {
                    run(child);
                }
                return false;
            })
            cb(m);
        }

        run(mod);
    }

    if (!Array.isArray(modulePathArray)) {
        modulePathArray = [modulePathArray]
    }

    const modulesToClean = modulePathArray.map(findModule).map(p => require.cache[p]).filter(item => !!item)
    const topModule = getTopModule(rootPath && findModule(rootPath))
    const moduleInUse = findAllModuleInUse(modulesToClean, topModule)

    for (const mod of modulesToClean) {

        // 删除该模块的所有子引用
        traverseChildren(mod, m => {
            if (!moduleInUse.has(m)) {
                delete require.cache[m.id];
            }
        });

        // 防止内存泄露
        /* istanbul ignore else */
        if (mod.parent) {
            if (all) {
                clearFromTree(mod, topModule);
            }
            else {
                mod.parent.children = mod.parent.children.filter(m => m.id !== mod.id);
            }
        }
    }
}

function getTopModule(rootPath) {
    let topModule = null

    if (rootPath) {
        try {
            topModule = require.cache[require.resolve(rootPath)]
        }
        catch(e) {
            throw Error('top module is not found.')
        }
    }
    else {
        topModule = module

        while (topModule.parent) {
            topModule = topModule.parent
        }
    }

    return topModule
}

function clearFromTree(mod, topModule) {
    traverseTree(topModule, m => m.id == mod.id); // true to delete

    function traverseTree(root, cb) {
        const visitedTreeChildren = {};
        visitedTreeChildren[root.id] = 1;
        function run(mod) {
            mod.children = mod.children.filter(child => {
                if (cb(child)) {
                    return false
                }
                else {
                    if(!visitedTreeChildren[child.id]) {
                        visitedTreeChildren[child.id] = 1;
                        run(child);
                    }
                    return true;
                }
            })
        }
        run(root);
    }
}

/**
 * 找到所有还在使用的模块
 */
function findAllModuleInUse(moduleRealPathArray, topModule) {
    const moduleRealPathSet = new Set(moduleRealPathArray)
    const moduleInUse = new Set()
    moduleInUse.add(topModule)

    function run(mod) {
        for (const child of mod.children) {
            if (moduleInUse.has(child) || moduleRealPathSet.has(child)) {
                continue
            }

            moduleInUse.add(child)
            run(child)
        }
    }
    run(topModule)

    return moduleInUse
}

function findModule(modulePath) {

    //如果传入相对路径
    if (/^\./.test(modulePath)) {
        let visited = false
        const stacks = callsite()
        for (const stack of stacks) {
            const filename = stack.getFileName()

            /* istanbul ignore else */
            if (filename == module.filename) {
                visited = true
            }
            else if (!filename) {
                continue
            }
            else if (filename !== module.filename && filename !== 'module.js' && visited) {
                modulePath = path.resolve(path.dirname(filename), modulePath)
                break
            }
        }
    }
    try {
        return require.resolve(modulePath)
    } catch (e) {
        throw new Error(`[batchdelcache] ${e.stack}`);
    }
}


module.exports = batchdelcache;
module.exports.default = batchdelcache;