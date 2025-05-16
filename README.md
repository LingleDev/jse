# JSE - JSON Storage Engine
A very generic name for an easily created library  
  
JSE is a library I made for my projects. It enables me to manipulate a JSON database using Map notation and the native fs library.  
It runs off of async/await for sake of speed.

## Installation 

Installing JSE is pretty simple  
`npm install https://github.com/LingleDev/jse.git`

## Usage

JSE uses async/await, so you must await _everything_ if you don't want the program to scream at you.

```js
// Require JSE
const jse = require('jse')

// Initialize and create a database instance

/**
 * @param {String} name Name of the database to create
 * @param {String} path The path to the folder where the database file will be held
 * @param {Boolean} persistent Whether the database will persist when the program exits. Defaults to true
 * @param {Boolean} poe Print on exit - if true, the program will print the database file when the program exits. Defaults to false
*/
const TestDB = new jse("TestDB", __dirname+"/database/")

// Create a new collection
const TestCL = await TestDB.create("test");

// Get from & write to the collection
await TestCL.set("key", "value") // returns an object with the inputs

let value = await TestCL.get("key") // returns the value of the provided key, if said key exists

// Console: value
```  

> **Be warned**: JSE *does not care* about your data. It always does what you tell it to. If you tell it to overwrite a key, it will *not* warn you. It will overwrite your shit.

You can also access the full list of collections with `JSE.collections`. When you create a new collection, it will store it in a map.

```js
// Get all collections from a database
// TestDB.each is a wrapper for Map.each

TestDB.each((key,value) => {
	console.log(`Name: ${key}; Value: ${value}`)
})
```