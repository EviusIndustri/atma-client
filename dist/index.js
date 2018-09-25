'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Atma = function () {
	function Atma() {
		(0, _classCallCheck3.default)(this, Atma);

		this.server = null;
		this.authSocket = null;
		this.accessTokenPooling = null;
		this.accessTokenExp = null;
	}

	(0, _createClass3.default)(Atma, [{
		key: 'init',
		value: function init() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (!opts.server) {
				throw Error('parameter server is required');
				return;
			}
			this.server = opts.server;
			this.accessTokenExp = 30000;
			this.authSocket = (0, _socket2.default)(this.server + '/auth');
		}
	}, {
		key: 'login',
		value: function login(email) {
			var _this = this;

			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.post(self.server + '/login', {
					email: email
				}).then(function (result) {
					_this.authSocket.emit('join', {
						room: result.data.data.email + '/' + result.data.data.codename
					});
					resolve(result);
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'register',
		value: function register(email) {
			var _this2 = this;

			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.post(self.server + '/register', {
					email: email
				}).then(function (result) {
					_this2.authSocket.emit('join', {
						room: result.data.data.email + '/' + result.data.data.codename
					});
					resolve(result);
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'current',
		value: function current(refreshToken) {
			var self = this;
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.get(self.server + '/current', {
					headers: {
						authorization: 'bearer ' + refreshToken
					}
				}).then(function (result) {
					resolve(result);
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'requestAccessToken',
		value: function requestAccessToken(appId, refreshToken) {
			var _this3 = this;

			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.get(self.server + '/token/' + appId, {
					headers: {
						authorization: 'bearer ' + refreshToken
					}
				}).then(function (result) {
					_this3.authSocket.emit('join', {
						room: refreshToken
					});
					resolve(result);
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'verify',
		value: function verify(jwt) {
			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.get(self.server + '/verify?token=' + jwt).then(function (result) {
					resolve(result);
				}).catch(function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'logout',
		value: function logout(token) {
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			this.authSocket.emit('logout', token);
		}
	}, {
		key: 'onAuth',
		value: function onAuth(cb) {
			var _this4 = this;

			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			this.authSocket.on('authState', function (response) {
				if (response) {
					_this4.authSocket.emit('join', {
						room: response.data.token
					});
				}
				cb(response);
			});
		}
	}]);
	return Atma;
}();

exports.default = new Atma();

