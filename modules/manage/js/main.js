(function(App){
	"use strict";

	var Module = function(App){
		this.a = App;

		this.defaultjs = {
			css: {load: false},
			html: {load: true},
			js: {load: true},
			translate: {load: true}
		}

		var t = this;
		this.get_users(function(r){
			t.render_users(r);
		});
	}

	Module.prototype.get_users = function(callback) {
		var j = {
			url: this.a._data.rest+'Users/',
			mode: 'GET',
			div: undefined,
			cache: true,
			response: 'object',
			headerValue: 'application/json'
		}

		new Vi(j).ajax(callback);
	};

	Module.prototype.render_users = function(users) {
		var container = document.getElementById('users-holder');

		var keys = ['fullname'];
		for(var i = 0, len = users.length; i < len; i++){
			var user = users[i];

			var row = document.createElement('tr');
			row._user = user;

			for(var j = 0, len2 = keys.length; j < len2; j++){
				var key = keys[j];
				if(user.hasOwnProperty(key)){
					var column = document.createElement('td');
					var text = user[key];
					column.appendChild(document.createTextNode(text));
					row.appendChild(column);
				}
			}

			//Operations
			var op = document.createElement('td');
			row.appendChild(op);

			container.appendChild(row);
		}
	};

	Module.prototype.loadSubFile = function(file, callback) {
		callback = (typeof callback !== 'function') ? function(){} : callback;
		var params = this.defaultjs;
		var extensions = {translate: 'xml', html: 'html', js: 'js'};

		for(var p in params){
			if(params.hasOwnProperty(p)){
				if(params[p].load === true){
					var ex = (typeof extensions[p] === 'undefined') ? '' : '.'+extensions[p];
					params[p].file = file + ex;
				}
			}
		}

		this.a.div = '#sub-content';
		var t = this;
		this.a.current.start(callback, params);
	};

	var m = new Module(App);
})(App);