document.addEventListener('DOMContentLoaded', function() {

	//declare our states
	var states = [
		{
			name: 'initial',
			initial: true,
			onEnter: function() { console.log('entered ' + this.name); },
			onLeave: function() { console.log('left ' + this.name); },
			possibleStates: [ 'state 1' ] //optional. if empty, it equals all states
		},
		{
			name: 'state 1',
			onEnter: function() { console.log('entered ' + this.name); },
			onLeave: function() { console.log('left ' + this.name); },
			possibleStates: [ 'state 2' ]
		},
		{
			name: 'state 2',
			onEnter: function() { console.log('entered ' + this.name); },
			onLeave: function() { console.log('left ' + this.name); },
			possibleStates: [ 'state 3', 'initial' ]
		},
		{
			name: 'state 3',
			onEnter: function() { console.log('entered ' + this.name); },
			onLeave: function() { console.log('left ' + this.name); }
		}
	];

	//function that gets called on every state change
	var onStateChange = function(state) {
		state.customFn(); //call our customFn defined below
		
		//disable un-enterable states' buttons
		sm.getImpossibleStates().forEach(function(name) {
			document.querySelector('[data-state="'+name+'"]').disabled = true;
		});

		//enable button for possibleStates
		sm.getPossibleStates().forEach(function(name) {
			document.querySelector('[data-state="'+name+'"]').disabled = false;
		});
	};

	//implement it all
	var sm = new SimpleStateMachine(states);
	
	//add method to each state object
	sm.decorateStates('customFn', function() {
		//set our state name in the DOM
		document.getElementById('state').innerHTML = this.name;
	});
	
	//attach onStateChange to each state, * matches all
	sm.subscribeToState(['*'], onStateChange);
	
	//start it
	sm.start();


	//wire up click events to buttons
	function attachButtonEvents() {
		var buttons = document.getElementsByClassName('state-btn');
		[].slice.call(buttons).forEach(function(node, i) {
			node.addEventListener('click', function() {
				//go to the button's state
				sm.goToState(node.dataset.state);
			});
		});
	}

	attachButtonEvents();
});