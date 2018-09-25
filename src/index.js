import axios from 'axios'
import io from 'socket.io-client'
import Cookies from 'js-cookie'

class Atma {
	constructor() {
		this.server = null
		this.authSocket = null
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
		this.authSocket = io(`${this.server}/auth`)
	}

	login(email) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.post(`${self.server}/login`, {
				email: email
			})
				.then((result) => {
					this.authSocket.emit('join', {
						room: result.data.data.email + '/' + result.data.data.codename
					})
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
			axios.post(`${self.server}/register`, {
				email: email
			})
				.then((result) => {
					this.authSocket.emit('join', {
						room: result.data.data.email + '/' + result.data.data.codename
					})
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
			axios.get(`${self.server}/current`, {
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
			axios.get(`${self.server}/token/${appId}`, {
				headers: {
					authorization: `bearer ${refreshToken}`
				}
			})
				.then((result) => {
					this.authSocket.emit('join', {
						room: refreshToken
					})
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
			axios.get(`${self.server}/verify?token=${jwt}`)
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
		this.authSocket.emit('logout', token)
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

export default new Atma()