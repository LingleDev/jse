# JSE - JSON Storage Engine
A very generic name for an easily created library  
  
JSE is a library I made for my projects. It enables me to manipulate a JSON database using Map notation and the native fs library.  
It runs off of async/await for sake of speed.

## Installation 

Installing JSE is pretty simple  
`npm install https://github.com/LingleDev/jse.git`

## Usage

JSE uses async/await, so you must await _everything_ if you want the program to work.

```js
// Require JSE
const jse = require('jse')

// Initialize and create a database instance

/**
 * @param {String} name Name of the database to create
 * @param {String} path The path to the folder where the database file will be held
 * @param {Boolean} persistent Whether the database will persist when the program exits. Defaults to true
 * @param {Boolean} polite Polite mode disables overwriting, and makes the program tell you no when you try to overwrite stuff. Defaults to false.
 * @param {Boolean} poe Print on exit - if true, the program will print the database file when the program exits. Defaults to false
*/
const TestDB = new jse("TestDB", __dirname+"/database/", true, false)

// Create a new collection
const TestCL = await TestDB.create("test");

// Get from & write to the collection
await TestCL.set("key", "value") // returns an object with the inputs

let value = await TestCL.get("key") // returns the value of the provided key, if said key exists

// verify a key's existence in the collection
await TestCL.has('key')

// Delete a key or an Array of keys from the collection
await TestCL.delete("key");

await TestCL.delete(['key1', 'key2'])

// Console: value
```  

> **Be warned**: Unless polite mode is enabled, JSE *will not care* about your data. If you don't like data being overwritten, turn polite mode on.

You can also access the full list of collections with `JSE.collections`. When you create a new collection, it will store it in a map.

There's also the ability to iterate thru the collections in a database. Like so:  

```js
// Get all collections from a database
// TestDB.each is a wrapper for Map.each

TestDB.each((key,value) => {
	console.log(`Name: ${key}; Value: ${value}`)
})
```