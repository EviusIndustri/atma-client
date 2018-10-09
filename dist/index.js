'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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
				_axios2.default.post(self.server + '/api/login', {
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
				_axios2.default.post(self.server + '/api/register', {
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
				_axios2.default.get(self.server + '/api/current', {
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
				_axios2.default.get(self.server + '/api/token/' + appId, {
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
		key: 'confirmPooling',
		value: function confirmPooling(email, accessCode) {
			var _this4 = this;

			var self = this;
			var pooling = setInterval((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
				var response;
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.prev = 0;
								_context.next = 3;
								return self.confirm(email, accessCode);

							case 3:
								response = _context.sent;

								clearInterval(pooling);
								return _context.abrupt('return', response);

							case 8:
								_context.prev = 8;
								_context.t0 = _context['catch'](0);

								console.error(_context.t0);
								// return err

							case 11:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, _this4, [[0, 8]]);
			})));
		}
	}, {
		key: 'confirm',
		value: function confirm(email, accessCode) {
			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.post(self.server + '/api/confirm', {
					email: email,
					codename: accessCode
				}).then(function (result) {
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
				_axios2.default.get(self.server + '/api/verify?token=' + jwt).then(function (result) {
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
			var _this5 = this;

			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			this.authSocket.on('authState', function (response) {
				if (response) {
					_this5.authSocket.emit('join', {
						room: response.data.token
					});
				}
				cb(response);
			});
		}
	}]);
	return Atma;
}();

var myAtma = new Atma();

exports.default = myAtma;

