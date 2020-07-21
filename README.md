# delcache

Delete module cache safely. This project is inspired by [decache](https://github.com/dwyl/decache).

[![Build Status](https://travis-ci.org/zhongkai/delcache.svg?branch=master)](https://travis-ci.org/zhongkai/delcache)
[![Coverage Status](https://coveralls.io/repos/github/zhongkai/delcache/badge.svg?branch=master)](https://coveralls.io/github/zhongkai/delcache?branch=master)

## Installation

```bash
# use npm
npm install delcache
# or use yarn
yarn global add delcache
```

## Environment

Node.js 10+

## Background

Deleting module cache is the precondition of 'hot reloading'. Typically, we delete the module cache by:

`delete require.cache[require.resolve('xxx')]`

However, this method can cause memory leakage. It clears the module cache in `Module._cache` which is referenced by `require.cache`, but it doesn't eliminate the reference in the array of `xxx.parent.children`.

`delcache` provides a way to eliminate both kinds of reference:

 `delcache('xxx')`

In most cases, this is enough to clean up all references, with the following exception:

```js
{
    id: 'parentModule',
    children: [{
        id: 'childModuleA',
        children: [{
            id: 'targetModule'
        }]
    }, {
        id: 'childModuleB',
        children: [{
            id: 'targetModule'
        }]
    }]
}
```

You will find `targetModule` still in the children of `childModuleA` after calling `delcache(targetModule)` in `childModuleB`. In this condition, you can pass `true` as the second argument to `delcache`: `delcache(targetModule, true)`. `delcache` will traverse the whole module tree to delete targetModule from children of every module.

When passing `rootPath` as the third argument, `delcache` will take it as the starting point. It is a recommended way to save time traversing the module tree.

## Usage

Delete cache of target module and clear reference in parent's children:

```js
const delcache = require('delcache')

let five = require('./five')

five.num = 6

delcache('./five')

five = require('./five')

console.log(five.num) // 5
```

Pass `true` as the second argument to delete cache of target module from the whole module tree.

```js
const delcache = require('delcache')

let five = require('./five')

five.num = 6

delcache('./five', true)

five = require('./five')

console.log(five.num) // 5
```

When the second argument is `true`, you can specify the `rootPath` from which clear the reference of the target module.

This is a recommended way to make the delete operation faster:

```js
const delcache = require('delcache')

let five = require('./five')

five.num = 6

delcache('./five', true, '../../root')

five = require('./five')

console.log(five.num) // 5
```

## Notice

Don't uese `delete require.cache[xxx]` with `delcache`, cause `delcache` will check if a module is referenced by `Module._cache`.

```js
//parent.js
require('./a')
require('./b')
//a.js
require('./mod')
delete require.cache[require.resolve('./mod')]
//b.js
const delcache = require('delcahce')
delcache('./mod', true) // delcache can not eliminate the reference of mod in children of a.js
```
