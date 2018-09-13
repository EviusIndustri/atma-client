var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')

import atma from '../../dist'

const atmaInit = async (state, emitter) => {
	atma.init({
		server: 'localhost:'
	})

	atma.onAuth((response) => {
		if(response) {
			console.log('login')
			state.currentUser = response.data.data
			emitter.emit('replaceState', '/')
		}
		else{
			console.log('logout')
			emitter.emit('replaceState', '/login')
		}
	})
}

const mainPage = (state, emit) => {
	if(!atma.isLoggedIn()) {
		emit('replaceState', '/login')
		return loginPage(state, emit)
	}
	return html`
		<body>
			<div class="flex items-center vh-100">
				<div class="w-100">
					<div class="mw6 tc center ph2 ph4-ns">
						<h2>Authenticated Only!</h2>
					</div>
					<div class="w-10 center">
						<button onclick=${logout}>Logout</button>
					</div>
				</div>
			</div>
    </body>
	`

	function logout(e) {
		e.preventDefault()
		atma.logout()
	}
}

function loginPage (state, emit) {
  return html`
    <body>
			<div class="flex items-center vh-100">
				<div class="w-100">
					<div class="mw6 center ph2 ph4-ns">
						<h2>atma</h2>
					</div>
					<div class="mw6 center ph3 ph4-ns">
						<form class="flex w-full center " onsubmit=${login}>
							<div class="w-80 pr2">
								<input oninput=${onInputLogin} value=${state.inputLogin} />
							</div>
							<div class="w-20">
								<button>Login</button>
							</div>
						</form>
					</div>
					<div class="tc pt3">
						<p>Do not have account? <a href="/register">Register</a></p>
					</div>
				</div>
			</div>
    </body>
	`

  function login(e) {
		e.preventDefault()
		emit('submitLogin')
	}
	
	function onInputLogin(e) {
		emit('onInputLogin', e.target.value)
	}
}

function registerPage (state, emit) {
  return html`
    <body>
			<div class="flex items-center vh-100">
				<div class="w-100">
					<div class="mw6 center ph2 ph4-ns">
						<h2>atma</h2>
					</div>
					<div class="mw6 center ph3 ph4-ns">
						<form class="flex w-full center " onsubmit=${register}>
							<div class="w-80 pr2">
								<input oninput=${onInputRegister} value=${state.inputRegister} />
							</div>
							<div class="w-20">
								<button>Register</button>
							</div>
						</form>
					</div>
					<div class="tc pt3">
						<p>Already have account? <a href="/login">Login</a></p>
					</div>
				</div>
			</div>
    </body>
  `

  function register(e) {
		e.preventDefault()
		emit('submitRegister')
	}
	
	function onInputRegister(e) {
		emit('onInputRegister', e.target.value)
	}
}

function confirmPage (state, emit) {
	if(!state.confirmCodename) {
		emit('pushState', '/')
		return mainPage(state, emit)
	}
	return html`
		<body>
			<div class="flex items-center vh-100">
				<div class="w-100">
					<div class="mw6 tc center ph2 ph4-ns">
						<h4 class="red">Do not close this window!</h4>
						<h4 class="pt4">Waiting confirmation with code:</h4>
						<h2>${state.confirmCodename}</h2>
					</div>
				</div>
			</div>
    </body>
  `
}

function verifyPage (state, emit) {
	if(!state.authVerified) {
		emit('authVerify', state.query.token)
	}
	return html`
		<body>
			<div class="flex items-center vh-100">
				<div class="w-100">
					<div class="mw6 tc center ph2 ph4-ns">
						<h2>${state.authVerified || 'Verifying...'}</h2>
						${ state.authVerified ? html`
							<h4>You can close this window</h4>
						` : ''
						}
					</div>
				</div>
			</div>
    </body>
  `
}

function countStore (state, emitter) {
	state.inputLogin = ''
	state.inputRegister = ''
	state.accessToken = ''
	state.confirmEmail = ''
	state.confirmCodename = ''
  emitter.on('onInputLogin', function (value) {
		state.inputLogin = value
		emitter.emit('render')
  })
  emitter.on('onInputRegister', function (value) {
		state.inputRegister = value
		emitter.emit('render')
	})
	emitter.on('accessToken', (value) => {
		state.accessToken = value
		emitter.emit('render')
	})

	emitter.on('submitRegister', async () => {
		try {
			const response = await atma.register(state.inputRegister)
			state.confirmEmail = response.data.data.email
			state.confirmCodename = response.data.data.codename
			emitter.emit('pushState', '/confirm')	
		} catch (err) {
			alert(err.response.data.message)
		}
	})
	emitter.on('submitLogin', async () => {
		const response = await atma.login(state.inputLogin)
		state.confirmEmail = response.data.data.email
		state.confirmCodename = response.data.data.codename
		emitter.emit('pushState', '/confirm')
	})
	emitter.on('authVerify', async (jwt) => {
		try {
			const response = await atma.verify(jwt)	
			state.authVerified = 'Verification Success'
			emitter.emit('render')
		} catch (err) {
			state.authVerified = 'Verification Failed'
			emitter.emit('render')
		}
	})
}

var app = choo()
app.use(devtools())
app.use(atmaInit)
app.use(countStore)
app.route('/', mainPage)
app.route('/login', loginPage)
app.route('/register', registerPage)
app.route('/confirm', confirmPage)
app.route('/verify', verifyPage)
app.mount('body')