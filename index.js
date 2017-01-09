console.log('Ghoulie (c) 2016 Jaxcore, MIT Licensed');

var EventEmitter = require('event-emitter');

function ar(a) {
	return Array.prototype.slice.apply(a);
}

function Ghoulie() {
	this.queuing = !this.isClient() || this.isDev() || typeof global==='object';
	var isServer = typeof process=='object' && typeof process.env==='object' && typeof process.env.NODE_ENV==='string';
	if (this.isClient() && this.isDev() && !isServer) {
		var me = this;
		window.addEventListener('load', function() {
			me.log('ghoulie: init');
			me.is_dev_client = true;
			me.init();
		});
	}
	//else alert('no client '+this.isClient()+' '+this.isDev()+' '+isServer);
	this.ee = new EventEmitter();
}
Ghoulie.prototype = {
	isClient: function() {
		return typeof global==='object' || (typeof window==='object' && typeof navigator==='object' || typeof location==='object');
	},
	isProd: function() {
		// assume production environment unless window.NODE_ENV is set to something other than test/dev/develop/development
		return !this.isDev();
	},
	isDev: function() {
		// development environment if window.NODE_ENV is set to one of test/dev/develop/development
		if (typeof NODE_ENV === 'string' && (NODE_ENV === 'test' || NODE_ENV === 'dev' || NODE_ENV === 'develop' || NODE_ENV === 'development')) {
			return true;
		}
	},
	emit: function () {
		if (this.is_dev_client) {
			var args = Array.prototype.slice.apply(arguments);
			this.ee.emit.apply(this.ee, args);
			//console.log('ghoulie: log', arguments);
		}
		else if (this.isDev()) {
			// var args = ar(arguments);
			var args = Array.prototype.slice.apply(arguments);
			if (this.queuing) { //} && this.ghoulies) {
				this.queue.push(args);
			}
			else {
				console.log('ghoulie: emiting', args);
				this.ee.emit.apply(this.ee, args);
			}
		}
	},
	once: function () {
		if (this.isDev()) {
			var args = ar(arguments);
			this.ee.once.apply(this.ee, args);
		}
		else if (this.isClient() && !this.isProd()) {
			console.log('ghoulie: once', arguments)
		}
	},
	on: function () {
		if (this.isDev()) {
			var args = Array.prototype.slice.apply(arguments);
			this.ee.on.apply(this.ee, args);
		}
		else if (this.isClient() && this.isDev()) {
			console.log('ghoulie: on', arguments)
		}
	},
	log: function () {
		if (this.is_dev_client) console.log('ghoulie: log', arguments);
		else if (this.isDev()) {
			var args = Array.prototype.slice.apply(arguments);
			if (this.ghoulies) {
				if (this.queuing) {
					this.logQueue.push(args);
				}
				else {
					args.unshift({ghoulieName: this.name});
					this.ghoulies.log.apply(this.ghoulies, args);
				}
			}
			else {
				console.log('ghoulie: log', args);
			}
		}
	},
	init: function () {
		if ((this.ghoulies || this.is_dev_client) && this.queuing) {
			this.queuing = false;
			var l;
			while (l = this.logQueue.shift()) {
				this.log.apply(this, l);
			}
			var q;
			while (q = this.queue.shift()) {
				this.emit.apply(this, q);
			}
		}
	},
	name: 'ghoulie',
	queue: [],
	logQueue: [],
	ghoulies: null
};

var ghoulie = new Ghoulie();
if (typeof window === 'object') {
	window.__ghoulie = ghoulie;
}
module.exports = ghoulie;
