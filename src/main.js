
//TRANSPORT

// CommonJS
if (typeof exports === 'object') {
	exports = module.exports = SimpleStateMachine;
}
//Angular
else if('angular' in root) {
	angular.module('SimpleStateMachine', [])
		.value('SimpleStateMachine', SimpleStateMachine);
}
// browser global
else {
	root.SimpleStateMachine = SimpleStateMachine;
}

})(((typeof window === 'object' && window) || this));