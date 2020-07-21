/**
 * @file batch delete require cache
 * @author cxtom
 */

const path = require('path')
const callsite = require('callsite')

function batchdelcache(modulePathArray, all = false, rootPath = '') {

    const visitedChildiren = {};

    function traverseChildren(mod, cb) {
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
        modulePathArray = [modulePathArray];
    }

    for (const modulePath of modulePathArray) {
        const moduleRealPath = findModule(modulePath);

        if (!moduleRealPath) {
            continue;
        }

        const mod = require.cache[moduleRealPath];

        if (!mod) {
            continue;
        }

        // 删除该模块的所有子引用
        traverseChildren(mod, m => {
            delete require.cache[m.id];
        });


        // 防止内存泄露
        /* istanbul ignore else */
        if (mod.parent) {
            if (all) {
                clearTree(mod, rootPath);
            }
            else {
                mod.parent.children = mod.parent.children.filter(m => m.id !== mod.id);
            }
        }
    }
}

function clearTree(mod, rootPath) {

    let topModule = null;

    if (rootPath) {
        try {
            topModule = require.cache[require.resolve(rootPath)];
        }
        catch(e) {}
    }
    else {
        topModule = mod;

        while (topModule.parent) {
            topModule = topModule.parent;
        }
    }

    if (topModule) {
        traverseTree(topModule, m => m.id == mod.id); // true to delete
    }
}

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
            else if (filename !== module.filename && filename !== 'module.js' && visited) {
                modulePath = path.resolve(path.dirname(filename), modulePath)
                break
            }
        }
    }
    try {
        return require.resolve(modulePath)
    } catch (e) {
        return ''
    }
}


module.exports = batchdelcache;
module.exports.default = batchdelcache;