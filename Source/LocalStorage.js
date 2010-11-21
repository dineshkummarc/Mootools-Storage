/*
---
description: A cross browser persistent storgae API

license: MIT-style

authors:
- Arieh Glazer

contributors:
- Amadeus Demarzi

requires:
- core/1.2.4+ : [Core,Class,Class.Extras,Cookie]

provides: [LocalStorage]

...
*/
/*!
Copyright (c) 2010 Arieh Glazer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE
*/
(function() {

var LocalStorage = window.LocalStorage = new Class({

	Implements: [Options, Events],

	options: {
		path: '*',
		name: window.location.hostname,
		duration: 60 * 60 * 24 * 30
	},

	storage: null,

	initialize: function(options) {
		this.setOptions(options);

		if (window.localStorage) {
			this.storage = window.localStorage;
		} else if (Browser.Engine.trident) {
			//IE < 8
			this.storage = (function() {
				var storage = document.createElement("span");
				storage.style.behavior = "url(#default#userData)";
				storage.inject(document.body);
				storage.load(this.options.name);

				return {
					setItem: (function(name, value) {
						storage.setAttribute(name, value);
						storage.save(this.options.name);
					}).bind(this),

					getItem: (function(name) {
						return storage.getAttribute(name);
					}).bind(this),

					removeItem: (function(name) {
						storage.removeAttribute(name);
						storage.save(this.options.name);
					}).bind(this)
				};
			}).apply(this);

		} else if (window.globalStorage) {
			this.storage = (function() {
				var storage = window.globalStorage[this.options.name];

				return {
					setItem: (function(name, value) {
						storage[name] = value;
					}).bind(this),

					getItem: (function(name) {
						return storage[name].value;
					}).bind(this),

					removeItem: (function(name) {
						delete(storage[name]);
					}).bind(this)
				};
			}).apply(this);
		} else {
			this.storage = (function() {
				var options = {
					path: this.options.path,
					duration: this.options.duration
				};

				return {
					setItem: (function(name, value) {
						Cookie.write(name, value, options);
					}).bind(this),

					getItem: (function(name) {
						return Cookie.read(name);
					}).bind(this),

					removeItem: (function(name) {
						Cookie.dispose(name);
					}).bind(this)
				};
			}).apply(this);
		}
	},

	set: function(name, value) {
		this.storage.setItem(name, JSON.encode(value));

		this.fireEvent('set', [name, value]);

		return this;
	},

	get: function(name) {
		var data = JSON.decode(this.storage.getItem(name));

		this.fireEvent('get', [name, data]);

		return data;
	},

	remove: function(name) {
		this.fireEvent('remove', name);

		this.storage.removeItem(name);

		return this;
	}
});

})();