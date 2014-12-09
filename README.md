#SimpleStateMachine
State machines are simple yet powerful. This one aims to be as simple as possible.

##Usage
```javascript

//Example implementation:

//instantiate the SimpleStateMachine constructor and pass in an array of states
var state = new SimpleStateMachine([
	{
		name: 'loading',
		initial: true, //fires this state first
		onEnter: function() { console.log('entered loading'); }, //called when we enter this state
		onLeave: function() { console.log('left loading'); }, //called when we leave this state
		states: [ '*' ] // * wildcard means we can enter into any state from this one
	},
	{
		name: 'loggedIn',
		onEnter: function() { console.log('entered loggedIn'); },
		onLeave: function() { console.log('left loggedIn'); },
		states: [ 'loggedOut' ] //can only enter the loggedOut state from here
	},
	{
		name: 'loggedOut',
		onEnter: function() { console.log('entered loggedOut'); },
		onLeave: function() { console.log('left loggedOut'); },
		states: [ 'loggedIn' ]
	}
]);

state.subscribeToState(['loggedIn', 'loggedOut'], function(state) {
	console.log("I get called when we enter the states above.");
});

//pretend AuthService was defined elsewhere
AuthService.logIn(function() {
	state.goToState('loggedIn');
});

AuthService.logOut(function() {
	state.goToState('loggedOut');
});

```
