document.addEventListener('DOMContentLoaded', function() {


	/**
	 * Declare our states
	 */
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


	/**
	 * implement it all
	 */
	var sm = new SimpleStateMachine(states);
	
	//add method to each state object
	//this same functionality could also go in the subscribeToState function below
	sm.decorateStates('customFn', function() {
		//set our state name in the DOM
		document.getElementById('state').innerHTML = this.name;
	});
	
	//call this function on every state change, * matches all
	sm.subscribeToState(['*'], function(state) {
		state.customFn(); //call our customFn defined above
		
		//disable un-enterable states' buttons
		sm.getImpossibleStates().forEach(function(name) {
			document.querySelector('[data-state="'+name+'"]').disabled = true;
		});

		//enable button for possibleStates
		sm.getPossibleStates().forEach(function(name) {
			document.querySelector('[data-state="'+name+'"]').disabled = false;
		});
	});
	
	//start it, should be called after setting, subscribing to, and decorating states is done
	sm.start();


	/**
	 * wire up click events to buttons so we can see the above code in action in the UI
	 */
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