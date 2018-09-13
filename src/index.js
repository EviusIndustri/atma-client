import axios from 'axios'
import io from 'socket.io-client'
import Cookies from 'js-cookie'

class Atma {
	constructor(opts = {}) {
		this.server = opts.server || 'http://localhost:6969'
		this.authSocket = null
		this.accessTokenPooling = null
		this.accessTokenExp = opts.accessTokenExp || 30000
	}

	init() {
		const self = this
		this.authSocket = io(`${self.server}/auth`)
		if(Cookies.get('token')) {
			this.generateAccessTokenPooling(Cookies.get('token'))
		}
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

	current() {
		const self = this
		const refreshToken = Cookies.get('token')
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

	isLoggedIn() {
		return Cookies.get('token') ? true : false
	}

	getAccessToken() {
		return Cookies.get('accessToken')
	}

	async generateAccessTokenPooling() {
		const self = this

		this.authSocket.emit('join', {
			room: Cookies.get('token')
		})
		const response = await self.requestAccessToken(Cookies.get('token'))
		Cookies.set('accessToken', response.data.data)

		this.accessTokenPooling = setInterval(async () => {
			const response = await self.requestAccessToken(Cookies.get('token'))
			Cookies.set('accessToken', response.data.data)
		}, this.accessTokenExp)
	}

	requestAccessToken(refreshToken) {
		const self = this
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		return new Promise((resolve, reject) => {
			axios.get(`${self.server}/token`, {
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

	logout() {
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		clearInterval(this.accessTokenPooling)
		this.authSocket.emit('logout', Cookies.get('token'))
	}

	onAuth(cb) {
		if(!this.authSocket) {
			console.error('atma is not initialized')
			return 
		}
		this.authSocket.on('authState', (response) => {
			if(response) {
				Cookies.set('token', response.data.token)
				this.generateAccessTokenPooling(response.data.token)
			}
			else{
				Cookies.remove('token')
			}
			cb(response)
		})
	}
}

export default new Atma()