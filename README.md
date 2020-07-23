# batchdelcache

Delete module cache safely. This project is inspired by [decache](https://github.com/dwyl/decache).

[![Build Status](https://travis-ci.org/NoCoreNode/batchdelcache.svg?branch=master)](https://travis-ci.org/NoCoreNode/batchdelcache)
[![Coverage Status](https://coveralls.io/repos/github/NoCoreNode/batchdelcache/badge.svg?branch=master)](https://coveralls.io/github/NoCoreNode/batchdelcache?branch=master)

## Installation

```bash
# use npm
npm install batchdelcache
# or use yarn
yarn global add batchdelcache
```

## Environment

Node.js 10+

## Background

Deleting module cache is the precondition of 'hot reloading'. Typically, we delete the module cache by:

`delete require.cache[require.resolve('xxx')]`

However, this method can cause memory leakage. It clears the module cache in `Module._cache` which is referenced by `require.cache`, but it doesn't eliminate the reference in the array of `xxx.parent.children`.

`batchdelcache` provides a way to eliminate both kinds of reference:

 `batchdelcache('xxx')`

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

You will find `targetModule` still in the children of `childModuleA` after calling `batchdelcache(targetModule)` in `childModuleB`. In this condition, you can pass `true` as the second argument to `batchdelcache`: `batchdelcache(targetModule, true)`. `batchdelcache` will traverse the whole module tree to delete targetModule from children of every module.

When passing `rootPath` as the third argument, `batchdelcache` will take it as the starting point. It is a recommended way to save time traversing the module tree.

## Usage

Delete cache of target module and clear reference in parent's children:

```js
const batchdelcache = require('batchdelcache')

let five = require('./five')

five.num = 6

batchdelcache(['./five'])

five = require('./five')

console.log(five.num) // 5
```

Pass `true` as the second argument to delete cache of target module from the whole module tree.

```js
const batchdelcache = require('batchdelcache')

let five = require('./five')
let six = require('./six')

five.num = 6
six.sum = 7

batchdelcache(['./five', './six'], true)

five = require('./five')
six = require('./six')

console.log(five.num) // 5
console.log(six.num) // 6
```

When the second argument is `true`, you can specify the `rootPath` from which clear the reference of the target module.

This is a recommended way to make the delete operation faster:

```js
const batchdelcache = require('batchdelcache')

let five = require('./five')

five.num = 6

batchdelcache('./five', true, '../../root')

five = require('./five')

console.log(five.num) // 5
```

## Notice

Don't uese `delete require.cache[xxx]` with `batchdelcache`, cause `batchdelcache` will check if a module is referenced by `Module._cache`.

```js
//parent.js
require('./a')
require('./b')
//a.js
require('./mod')
delete require.cache[require.resolve('./mod')]
//b.js
const batchdelcache = require('delcahce')
batchdelcache('./mod', true) // delcache can not eliminate the reference of mod in children of a.js
```
