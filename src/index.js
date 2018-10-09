import axios from 'axios'
// import io from 'socket.io-client'

class Atma {
	constructor() {
		this.server = null
		this.authSocket = true
		this.accessTokenPooling = null
		this.accessTokenExp = null
	}

	init(opts = {}) {
		if(!opts.server) {
			throw Error('parameter server is required')
			return
		}
		this.server = opts.server
		this.accessTokenExp = 30000
		// this.authSocket = io(`${this.server}/auth`)
	}

	login(email) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.post(`${self.server}/api/login`, {
				email: email
			})
				.then((result) => {
					// this.authSocket.emit('join', {
					// 	room: result.data.data.email + '/' + result.data.data.codename
					// })
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	register(email) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.post(`${self.server}/api/register`, {
				email: email
			})
				.then((result) => {
					// this.authSocket.emit('join', {
					// 	room: result.data.data.email + '/' + result.data.data.codename
					// })
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	current(refreshToken) {
		const self = this
		return new Promise((resolve, reject) => {
			axios.get(`${self.server}/api/current`, {
				headers: {
					authorization: `bearer ${refreshToken}`
				}
			})
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	requestAccessToken(appId, refreshToken) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.get(`${self.server}/api/token/${appId}`, {
				headers: {
					authorization: `bearer ${refreshToken}`
				}
			})
				.then((result) => {
					// this.authSocket.emit('join', {
					// 	room: refreshToken
					// })
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	confirmPooling(email, accessCode) {
		return new Promise(async (resolve, reject) => {
			const self = this
			try {
				const response = await self.confirm(email, accessCode)
				clearInterval(pooling)
				resolve(response)
			} catch (err) {
				console.error(err)
				// return err
			}
			const pooling = setInterval(async () => {
				try {
					const response = await self.confirm(email, accessCode)
					clearInterval(pooling)
					resolve(response)
				} catch (err) {
					console.error(err)
					// return err
				}
			}, 5000)
		})
	}

	confirm(email, accessCode) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.post(`${self.server}/api/confirm`, {
				email: email,
				codename: accessCode
			})
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	verify(jwt) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.get(`${self.server}/api/verify?token=${jwt}`)
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
	}

	logout(token) {
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.post(`${self.server}/api/logout`, {
				refresh: token
			})
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
		// this.authSocket.emit('logout', token)
	}

	onAuth(cb) {
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		this.authSocket.on('authState', (response) => {
			if(response) {
				this.authSocket.emit('join', {
					room: response.data.token
				})
			}
			cb(response)
		})
	}
}

const myAtma = new Atma()

export default myAtma