class PoliteModeError extends Error {
	constructor(message) {
		super()

		this.name = "PoliteModeError"
		this.message = `[JSE] ${message}`
	}
}

module.exports = PoliteModeError