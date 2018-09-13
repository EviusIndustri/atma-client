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

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Atma = function () {
	function Atma() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		(0, _classCallCheck3.default)(this, Atma);

		this.server = opts.server || 'http://localhost:6969';
		this.authSocket = null;
		this.accessTokenPooling = null;
		this.accessTokenExp = opts.accessTokenExp || 30000;
	}

	(0, _createClass3.default)(Atma, [{
		key: 'init',
		value: function init() {
			var self = this;
			this.authSocket = (0, _socket2.default)(self.server + '/auth');
			if (_jsCookie2.default.get('token')) {
				this.generateAccessTokenPooling(_jsCookie2.default.get('token'));
			}
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
		value: function current() {
			var self = this;
			var refreshToken = _jsCookie2.default.get('token');
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
		key: 'isLoggedIn',
		value: function isLoggedIn() {
			return _jsCookie2.default.get('token') ? true : false;
		}
	}, {
		key: 'getAccessToken',
		value: function getAccessToken() {
			return _jsCookie2.default.get('accessToken');
		}
	}, {
		key: 'generateAccessTokenPooling',
		value: function () {
			var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
				var _this3 = this;

				var self, response;
				return _regenerator2.default.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								self = this;


								this.authSocket.emit('join', {
									room: _jsCookie2.default.get('token')
								});
								_context2.next = 4;
								return self.requestAccessToken(_jsCookie2.default.get('token'));

							case 4:
								response = _context2.sent;

								_jsCookie2.default.set('accessToken', response.data.data);

								this.accessTokenPooling = setInterval((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
									var response;
									return _regenerator2.default.wrap(function _callee$(_context) {
										while (1) {
											switch (_context.prev = _context.next) {
												case 0:
													_context.next = 2;
													return self.requestAccessToken(_jsCookie2.default.get('token'));

												case 2:
													response = _context.sent;

													_jsCookie2.default.set('accessToken', response.data.data);

												case 4:
												case 'end':
													return _context.stop();
											}
										}
									}, _callee, _this3);
								})), this.accessTokenExp);

							case 7:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			function generateAccessTokenPooling() {
				return _ref.apply(this, arguments);
			}

			return generateAccessTokenPooling;
		}()
	}, {
		key: 'requestAccessToken',
		value: function requestAccessToken(refreshToken) {
			var self = this;
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			return new _promise2.default(function (resolve, reject) {
				_axios2.default.get(self.server + '/token', {
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
		value: function logout() {
			if (!this.authSocket) {
				console.error('atma is not initialized');
				return;
			}
			clearInterval(this.accessTokenPooling);
			this.authSocket.emit('logout', _jsCookie2.default.get('token'));
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
					_jsCookie2.default.set('token', response.data.token);
					_this4.generateAccessTokenPooling(response.data.token);
				} else {
					_jsCookie2.default.remove('token');
				}
				cb(response);
			});
		}
	}]);
	return Atma;
}();

exports.default = new Atma();

