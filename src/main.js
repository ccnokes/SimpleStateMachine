
//TRANSPORT

// CommonJS
if (typeof exports === 'object') {
	exports = module.exports = SimpleStateMachine;
}
//Angular
else if('angular' in window) {
	angular.module('SimpleStateMachine', [])
		.value('SimpleStateMachine', SimpleStateMachine);
}
// browser global
else {
	window.SimpleStateMachine = SimpleStateMachine;
}

})(window);