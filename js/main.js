var App;

window.dhtmlHistory.create({
	toJSON: function(o) {
		return JSON.stringify(o);
	}
	, fromJSON: function(s) {
		return JSON.parse(s);
	}
});

(function(){
	"use strict";
	var Main = function(){
		this.getConfig(function(r, t){
			var modules = r.modules;

			t.start(r);
		});
	}

	/**
	 * Gets the main site configuration
	 * @return {json} Configuration
	 */
	Main.prototype.getConfig = function(callback) {
		var t = this;
		new Vi({url:'config.json', 'response': 'object'}).server(function(r){
			if(typeof callback === 'function'){
				callback(r, t);
			}
		});
	};

	Main.prototype.start = function(r) {
		var lang = this.browserLanguage();
		var modules = {};

		var mods = Object.keys(r.modules);
		for(var i = 0, len = mods.length; i < len; i++){
			var k = mods[i];
			modules[k] = {nombre: k, url:r.modules_path};
		}

		var j = {name: 'Dress code', modules:modules, div:'#content', currentLang: lang};
		this.a = new AppSystem(j);
		App = this.a;

		this.a._data = r;
		var t = this;

		dhtmlHistory.initialize();
		dhtmlHistory.addListener(t.handleHistory);

		this.a.init(function(){
			var initialModule = dhtmlHistory.getCurrentLocation();
			var module = (initialModule === '') ? 'backend' : initialModule;
			t.verifyIdentity(function(r){
				switch(r.success){
					case true:
						t.loadCategory('backend', function(){
							if(module !== 'backend' && module !== 'login'){
								t.loadCategory(module);
							}
						});
					break;
					case false:
						t.loadCategory('login');
					break;
				}
			});
		});
	};

	Main.prototype.verifyIdentity = function(callback) {
		callback = (typeof callback === 'function') ? callback : function(){};
		var j = {
			url: this.a._data.rest+'Members/',
			mode: 'GET',
			div: undefined,
			cache: true,
			response: 'object',
			headerValue: 'application/json'
		}
		new Vi(j).ajax(callback);
	};

	Main.prototype.handleURL = function(url) {
		url = url.match(/([^/]+)/gi);
		return url;
	};

	Main.prototype.handleHistory = function(newLocation, historyData) {
		if(typeof Application.a.current === 'object'){
			Application.loadCategory(newLocation);
		}
	};

	Main.prototype.activeMenuCategory = function(category) {
		this.clearMenu();
		var el = document.querySelector('#side-menu>li>a[data-module="'+category+'"]');
		if(el !== null){
			el = el.parentNode;
			el.className = 'active';
		}
	};

	Main.prototype.clearMenu = function() {
		var elms = document.querySelectorAll('#side-menu>li');
		for(var i = 0, len = elms.length; i < len; i++){
			var el = elms[i];
			el.className = '';
		}
	};

	Main.prototype.loadCategory = function(category, callback) {
		var url = this.handleURL(category);
		if(category !== 'backend'){
			dhtmlHistory.add(category, {message: "Module " +url[0]});
			this.activeMenuCategory(url[0]);
		}

		switch(category){
			case 'backend':
			case 'login':
			case 'setup':
				this.a.div = '#content';
			break;
			default:
				this.a.div = '#modules-content';
			break;
		}

		this.a.getModule(url[0]);
		this.a.current._url = url;

		if(category !== 'backend'){
			var t = this;
			$(this.a.div).fadeOut('fast', function(){
				t.a.current.start(function(){
					$(t.a.div).fadeIn('fast', function(){
						if(typeof callback === 'function'){
							callback();
						}
					});
				});
			});
		}else{
			this.a.current.start(function(){
				if(typeof callback === 'function'){
					callback();
				}
			});
		}
	};

	Main.prototype.browserLanguage = function() {
		var lang = navigator.language || navigator.userLanguage;
		lang = lang.match(/([a-z]+)/gi);
		if(lang !== null){
			lang = lang[0];
		}

		var l = '';
		switch(lang){
			case 'es':
				l = lang;
			break;
			default:
			case 'en':
				l = lang;
			break;
		}

		return l;
	};

	window.Application = new Main();
})();