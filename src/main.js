
//TRANSPORT

if (typeof exports === 'object') {
	// CommonJS
	exports = module.exports = SimpleStateMachine;
}
// //not sure if this will work
// else if ('angular' in window) {
// 	angular.module('SimpleStateMachine', [])
// 		.service('StateMachine', SimpleStateMachine);
// }
else {
	// browser global
	window.SimpleStateMachine = SimpleStateMachine;
}