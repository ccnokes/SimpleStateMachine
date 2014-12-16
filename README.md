#SimpleStateMachine
State machines are simple yet powerful. This one aims to be as simple as possible. It's basically a glorified pub/sub. No dependencies.

##Usage
```javascript

//instead of code that might look like this:

function AuthService() {
	this.loggedIn = false;
	this.loggedOut = true;
	this.loading = true;
}

//...and then a mess of code to handle actions that occur on a state change, you could do this:

//Example implementation:

//instantiate the SimpleStateMachine constructor and pass in an array of states
function AuthService() {
	this.state = new SimpleStateMachine([
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
}

AuthService.prototype.logIn = function() {
	this.state.goToState('loggedIn');
};

AuthService.prototype.logOut = function() {
	this.state.goToState('loggedOut');
};

//elsewhere in your code....
AuthService.state.subscribeToState(['loggedIn', 'loggedOut'], function(state) {
	console.log("I get called when we enter the states above.");
});


//it looks like a lot more code but in my experience this is easier to manage than the spaghetti that results from the first approach.
```
