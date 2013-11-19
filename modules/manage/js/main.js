(function(App){
	"use strict";

	var Module = function(App){
		this.a = App;

		this.defaultjs = {
			css: {load: false},
			html: {load: true},
			js: {load: false},
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
		container.innerHTML = '';

		var keys = ['fullname'];
		for(var i = 0, len = users.length; i < len; i++){
			var user = users[i];

			var row = document.createElement('tr');

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
			//-------------
			var op = this.operations_per_user(user);

			row.appendChild(op);

			container.appendChild(row);
		}
	};

	Module.prototype.operations_per_user = function(user) {
		var options = {
				'view': {
					i: 'glyphicon glyphicon-play', 
					c: 'btn btn-success', 
					t:'btn-view',
					callback: function(obj, user){
						obj.loadSubFile('userdata', function(){
							obj.get_user_data(user, function(usr){
								obj.load_user_data(usr);
							});
						});
					}
				}
			};
			var op_keys = Object.keys(options);

			var op = document.createElement('td');

			var op_container = document.createElement('div');
			op_container.className = 'row';
			op_container._user = user;

			op.appendChild(op_container);

			for(var j = 0, len2 = op_keys.length; j < len2; j++){
				var k = op_keys[j];
				var opt = options[k];

				var btn = document.createElement('button');
				btn.className = opt.c+' col-sm-4';
				op_container.appendChild(btn);

				var icon = document.createElement('i');
				icon.className = opt.i;
				btn.appendChild(icon);

				btn._t = this;
				btn.addEventListener('click', function(){
					var usr = this.parentNode._user;
					opt.callback(this._t, usr);
				}, false);
			}

		return op;
	};

	Module.prototype.get_user_data = function(user, callback) {
		var j = {
			url: this.a._data.rest+'Users/'+user.id,
			mode: 'GET',
			div: undefined,
			cache: true,
			response: 'object',
			headerValue: 'application/json'
		}

		var t = this;
		new Vi(j).ajax(callback);
	};

	Module.prototype.load_user_data = function(user) {

		var container = document.getElementById('user-info');
		container._user = user;

		var img = Application.getGravatarImg(user.basic.email, 250);
		var imgContainer = document.getElementById('profile-pic');
		imgContainer.src = img;

		var j = {
			data: user,
			container: container,
			banned: ['fullname', 'id', 'name'],
			callback: function(obj, key, data, banned, container){
				obj.render_user_data(key, data, banned, container);
			}
		}
		this.explore_usr_data(j);

		var btn = document.createElement('button');
		btn.id = 'save-btn';
		btn.className = 'btn btn-primary pull-right ladda-button';
		btn.setAttribute('data-style', 'expand-right');

		var text = this.a.current.getText('save-btn');
		var span = document.createElement('span');
		span.className = 'ladda-label';
		span.setAttribute('data-ltag', 'save-btn');
		span.appendChild(document.createTextNode(text));
		btn.appendChild(span);
		var icon = document.createElement('i');
		icon.className = 'glyphicon glyphicon-ok';
		btn.appendChild(icon);
		container.appendChild(btn);

		var l = Ladda.create( btn );

		container._t = this;
		container.addEventListener('submit', function(e){
			if(e.preventDefault){
				e.preventDefault();
			}

			e.returnValue = false;

			l.start();
			btn.setAttribute('disabled', 'disabled');

			this._t.update_user(this._user, function(){
				btn.removeAttribute('disabled');
				l.stop();
			});
		}, false);
	};

	Module.prototype.explore_usr_data = function(j) {
		for(var k in j.data){
			if(j.data.hasOwnProperty(k)){
				if(typeof j.data[k] === 'object' && Object.keys(j.data[k]).length > 0){
					var container = this.sub_user_data(k);
					j.container.appendChild(container);

					var jd = {
						data: j.data[k],
						container: container,
						callback: j.callback,
						banned: []
					}

					this.explore_usr_data(jd);
				}else{
					j.callback(this, k, j.data[k], j.banned, j.container);
				}
			}
		}
	};

	Module.prototype.sub_user_data = function(key) {
		var container = document.createElement('div');
		container.setAttribute('data-subcontainer', key);
		var title = document.createElement('h2');
		title.setAttribute('data-ltag', key);
		var t = this.a.current.getText(key);
		title.appendChild(document.createTextNode(t));
		container.appendChild(title);

		return container;
	};

	Module.prototype.render_user_data = function(key, data, bannedkeys, container) {

		if(bannedkeys.indexOf(key) < 0){
			var main = document.createElement('div');
			main.className = 'form-group';
			var label = document.createElement('label');
			label.setAttribute('for', 'input-'+key);
			label.className = 'col-sm-4 control-label';
			label.setAttribute('data-ltag', key);
			var t = this.a.current.getText(key);
			label.appendChild(document.createTextNode(t));
			main.appendChild(label);

			var sub = document.createElement('div');
			sub.className = 'col-sm-8';
			main.appendChild(sub);

			var input = document.createElement('input');
			input.type = 'text';
			input.className = 'form-control';
			input.name = key;
			input.id = 'input-'+key;
			input.value = data;
			sub.appendChild(input);

			container.appendChild(main);
		}
	};

	Module.prototype.update_user = function(user, callback) {
		callback = (typeof callback === 'function') ? callback : function(){};

		var newdata = this.get_user_local_data();

		if(JSON.stringify(user) !== JSON.stringify(newdata)){
			var j = {
				url: this.a._data.rest+'Users/'+user.id,
				mode: 'PUT',
				div: undefined,
				cache: true,
				response: 'object',
				data: newdata.basic
			}

			var t = this;
			new Vi(j).ajax(callback);
		}else{
			callback();
		}
	};

	Module.prototype.get_user_local_data = function() {
		var container = document.getElementById('user-info');
		var inputs = container.querySelectorAll('.form-control');

		var data = {};

		for(var i = 0, len = inputs.length; i < len; i++){
			var target = data;
			var input = inputs[i];
			var parentkey = input.parentNode.parentNode.parentNode;
			console.log(parentkey, parentkey.getAttribute('data-subcontainer'));
			if(parentkey.getAttribute('data-subcontainer')){
				parentkey = parentkey.getAttribute('data-subcontainer');
				if(!data.hasOwnProperty(parentkey)){
					data[parentkey] = {};
				}

				target = data[parentkey];
			}

			var name = input.name;
			var value = input.value;

			target[name] = value;
		}

		return data;
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