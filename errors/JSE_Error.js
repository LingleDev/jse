class JSE_Error extends Error {
	constructor(message) {
		super()

		this.name = "JSE_Error"
		this.message = `[JSE] ${message}`
	}
}

module.exports = JSE_Error