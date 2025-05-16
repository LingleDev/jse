const fsExists = require('fs.promises.exists')

const { PoliteModeError } = require('./errors/')

const fs = require('node:fs/promises')

class JSE {
	/**
	 * Creates a new JSE database
	 * @param {String} name The name of the new database
	 * @param {String} path The path to store the JSON database
	 * @param {Boolean} pers Specifies if the database should be persistent - if not, the files will be cleared when the process exits. Defaults to true
	 * @param {Boolean} polite If polite is false, then the program will not hesitate to overwrite data. If true, the program will not overwrite data. Defaults to false
	 * @param {Boolean} poe Print on exit - if persistence is off, this tells the program whether to print the database to stdout on exit. Defaults to false
	 */
	constructor(name, path, persistent = true, polite=false, poe = false) {
		/**
		 * The name of the database
		 */
		this.name = name.toLowerCase()
		/**
		 * The path to the database folder
		*/
		this.path = path
		/**
		 * If the database will persist or not
		 */
		this.persistent = persistent
		/**
		 * Print on exit
		 */
		this.poe = poe

		/**
		 * Specifies whether the program should overwrite data
		 */
		this.polite = polite

		/**
				* A path to the JSON file that holds the database
				* @type {String}
				*/
		this.file = `${this.path}/jse-${this.name}.json`

		/**
		 * @type {Map<String, Collection>}
		 */
		this.collections = new Map();

		this.initialized = this.init();

		this.isInitialized = false
	}

	/**
	 * @private
	 */
	async init() {
		if (!(await fsExists(this.file)) || (await fs.readFile(this.file) == "")) {
			await fs.writeFile(this.file, "[]", { encoding: 'utf-8' });
		} else {
			let json = JSON.parse(await fs.readFile(this.file));

			for (var col of json) {
				// console.log(col);
				this.collections.set(col.name, new Collection(this, col.name))
			}
		}

		process.on('exit', async () => {
			await this.cleanup()
		})

		this.isInitialized = true;
	}

	/**
	 * Returns the JSON object
	 */
	async json() {
		let json = await fs.readFile(this.file, "utf-8");

		return JSON.parse(json);
	}

	/**
	 * Creates a collection in the database
	 * @param {String} name
	 * @returns {Promise<Collection>}
	 */
	create(name) {
		return new Promise((res, rej) => {
			this.initialized
				.then(() => {
					name = name.toLowerCase();
					let coll
					
					if (!this.collections.has(name)) {
						coll = new Collection(this, name);

						this.collections.set(name, coll);
					} else {
						coll = this.collections.get(name);
					}

					coll.init()
						.then(() => {
							res(coll);
						})
				})
		})
	}

	/**
	 * Verifies the existence of a collection in the database
	 * @param {String} name 
	 */
	async has(name) {
		let col = await this.get(name);

		return (typeof col !== "undefined")
	}

	/**
	 * Gets an existing collection from the database
	 * @param {String} name 
	 */
	async get(name) {
		await this.initialized

		let col = this.collections.get(name)

		return col
	}

	/**
	 * Drops a collection from the database
	 * @param {String} name
	 * @returns {Promise<Object>} 
	 */
	drop(name) {
		return new Promise((res,rej) => {
			if (this.isInitialized) {
				let coll = this.collections.get(name.toLowerCase());

				if (coll) {
					coll.selfDestruct();
				}
			}
		})
	}

	/**
	 * Iterates over each collection in the database.
	 * @param {Function} iterator 
	 */
	each(iterator) {
		this.collections.each(iterator);
	}

	/**
	 * @private
	 */
	async cleanup() {
		if (!this.persistent) {
			if (this.poe) {
				console.log(`[JSE] Printing database file...`)

				let file = await fs.readFile(this.file);

				console.log(file)
			}

			try {
				await fs.unlink(`${this.path}/jse-${this.name}.json`);
			} catch(e) {

			}
		}
	}
}

class Collection {
	/**
	 * Represents a collection in a JSE database file
	 * @param {JSE} jse The JSE instance from which this class was instantiated.
	 * @param {String} name The name of the collection
	 */
	constructor(jse, name) {
		if (typeof jse == "undefined") {
			throw new Error("You must provide a JSE class to create a Collection")
		}

		this.jse = jse

		this.name = name
		this.file = jse.file

		this.contents
		this.self

	}

	/**
	 * @private
	 */
	async init() {
		/**
		 * @private
		 * @type {Array}
		 */
		this.contents = JSON.parse(await fs.readFile(this.file))

		if (!this.contents.find(e => e.name == this.name)) {
			this.contents.push({ name: this.name, index: this.contents.length, keys: {} })

			await fs.writeFile(this.file, JSON.stringify(this.contents))
		}

		/**
		 * @type {Object}
		 */
		this.self = this.contents.find(e => e.name == this.name) || { name: this.name, index: this.contents.length, keys: {} }
	}

	/**
	 * @private
	 */
	selfDestruct() {
		let index = this.contents.indexOf(this.self);

		this.contents.splice(index, 1);

		this.updateFile();
	}

	/**
	 * @private
	 * Forces a pull from the database file
	 */
	async pullFile() {
		let file = await fs.readFile(this.file, { encoding: 'utf-8' });

		this.contents = JSON.parse(file);

		this.self = this.contents.find(e => e.name == this.name)
	}

	/**
	 * @private
	 * Forces an update to the JSON database file
	 */
	async updateFile() {
		await fs.writeFile(this.file, JSON.stringify(this.contents), { encoding: 'utf-8' })
	}

	/**
	 * Sets the value of the specified key
	 * @param {String} key 
	 * @param {} value 
	 */
	async set(key, value) {
		await this.pullFile();

		let keys = this.self.keys;

		if (keys.hasOwnProperty(key) && this.jse.polite) {
			throw new PoliteModeError(`Cannot overwrite key '${key}' in ${this.jse.name}.${this.name}. This key/value combination already exists`)
		}

		keys[key] = value;

		await this.updateFile()

		return keys[key];
	}

	/**
	 * Gets the value of the specified key
	 * @param {String} key
	 */
	async get(key) {
		await this.pullFile();

		return this.self.keys[key]
	}

	/**
	 * Checks to see if the specified key exists in the collection
	 * @param {String} key
	 */
	async has(key) {
		await this.pullFile();

		let keys = this.self.keys;

		return keys.hasOwnProperty(key);
	}

	/**
	 * Finds the specified key-value pair, and removes it from the database.
	 * @param {String|Array} key The key to remove, or an array of keys to remove
	 * @returns {Promise<Array<String>>} 
	 */
	async delete(key) {
		await this.pullFile();

		let keys = this.self.keys

		if (typeof key == "string") {

			if (this.self.keys.hasOwnProperty(key)) {
				let val = keys[key]
				
				delete keys[key];

				await this.updateFile();

				return [val];
			} else {
				return [];
			}

		} else if (key instanceof Array) {
			let deleted = []
			
			for (var k of key) {
				
				if (keys.hasOwnProperty(k)) {
					deleted.push(keys[k])
				}
			
				delete keys[k];
			}

			await this.updateFile();

			return deleted
		}
	}
}

module.exports = JSE
