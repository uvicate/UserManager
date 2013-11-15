(function(App){
	"use strict";
	var Module = function(App){
		this.initialFunctionality();
		this.a = App;
	}

	Module.prototype.initialFunctionality = function() {
		var form = document.getElementById('form-login');

		var T = this;
		form.addEventListener('submit', function(e){
			if(e.preventDefault){
				e.preventDefault();
			}
			e.returnValue = false;

			T.sendRequest();
		}, false);
	};

	Module.prototype.sendRequest = function(){
		var btn = document.getElementById('login-button');
		btn.setAttribute('disabled', 'disabled');

		var data = {};
		var inputs = document.querySelectorAll('#form-login input');
		for(var i = 0, len = inputs.length; i < len; i++){
			var input = inputs[i];
			var id = input.id;
			data[id] = input.value;
		}


		var j = {
			url: this.a._data.rest+'Members/',
			mode: 'POST',
			div: undefined,
			cache: true,
			data: data,
			response: 'object'
		}
		new Vi(j).ajax(function(r){
			btn.removeAttribute('disabled');
			if(r.success === true){
				//User is redirected to the backend of the platform.
				Application.loadCategory('backend');
			}else{
				//Error is shown to user
				var e = document.getElementById('errors');
				e.style.display = 'block';
			}
		});
	}

	var i = new Module(App);
})(App);