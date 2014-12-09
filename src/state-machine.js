(function(window) {

/**
 * SimpleStateMachine constructor
 * @constructor
 * @param {array} states - an array of objects representing the states
 */
function SimpleStateMachine(states) {
	
	//make 'new' optional
	if(!(this instanceof SimpleStateMachine)) {
		return new SimpleStateMachine(states);
	}

	this.states = states || [];
	this.history = [];
	this.currentState;

	//if states are passed into the constructor, assume we want to auto-initialize it
	if(this.states.length > 0) {
		this.init();
	}

}

/**
 * private fn, transitions to a new state
 * @param {object} stateObj - state object we want to go to
 * @param {object} optParams - object to pass to onEnter fn
 */
function goToStateInternal(stateObj, optParams) {
	var self = this;
	
	//call onLeave transitional fn, pass in new state obj
	if(this.currentState && this.currentState.onLeave) {
		this.currentState.onLeave(stateObj);
	}
	
	//set to new state
	this.currentState = stateObj;

	//track in history
	this.history.push(stateObj);
	if(!stateObj.visitedCount) {
		stateObj.visitedCount = 1;
	}
	else {
		stateObj.visitedCount++;
	}
	
	//call new state's handler fn
	if(this.currentState.onEnter) {
		//pass back currentState obj
		this.currentState.onEnter(this.currentState, optParams);
	}

	//call all subscribers to this state
	if(this.currentState.subscribers && this.currentState.subscribers.length > 0) {
		var subs = this.currentState.subscribers;
		subs.forEach(function(sub, i) {
			sub(self.currentState);
		});
	}
}

/**
 * private fn, iterates through states and returns one that matches the provided stateName
 * @param {string} stateName - name of the state to get
 * @return {object} the state object
 */
function pluckState(stateName) {
	var stateToReturn;
	for(var i = 0; i < this.states.length; i++) {
		if(this.states[i].name === stateName) {
			stateToReturn = this.states[i];
			break;
		}
	}
	return stateToReturn;
}


SimpleStateMachine.prototype = {

	/**
	 * starts everything in the state machine
	 */
	init: function() {
		//get all state names
		var allStateNames = this.states.map(function(state) {
			return state.name;
		});

		//start initial state
		for( var i = 0; i < this.states.length; i++) {			
			var state = this.states[i];
			if (state.initial) {
				goToStateInternal.call(this, state);
			}
			//fix up any states that use a wildcard
			if(state.states && state.states[0] === '*') {
				state.states = allStateNames;
			}
		}
	},

	/**
	 * so you can set states later after construction
	 */
	setStates: function(states) {
		this.states = states;
		this.init();
	},

	/**
	 * returns current state's name
	 */
	getCurrentState: function() {
		return this.currentState.name;
	},

	/**
	 * gets all of the current state's possible states that can be transitioned to
	 */
	getPossibleStates: function() {
		return this.currentState.states;
	},

	/**
	 * gets next state as defined in states array. useful for when states are all a linear flow
	 * @param {object} optParams - object
	 */
	nextState: function(optParams) {
		var currentIndex = this.states.indexOf(this.currentState),
			nextIndex = currentIndex + 1;
		
		//if no next index, roll back to 0
		if(nextIndex >= this.states.length) {
			nextIndex = 0;
		}
		
		this.goToStateInternal.call(this, this.states[nextIndex], optParams);
	},

	/**
	 * transitions to specified state
	 * @param {string} stateName - state to go to
	 * @param {object} optParams - optional params to pass to state's onEnter callback
	 */
	goToState: function(stateName, optParams){
		if(this.currentState.states.indexOf(stateName) > -1) {
			var newState = pluckState.call(this, stateName);
			goToStateInternal.call(this, newState, optParams);
		}
		else {
			console.error(stateName, 'state does not exist');
		}
	},

	/**
	 * subscribe to a state
	 * @param {array} stateNames - array of names of states you want to subscribe to
	 * @param {function} cb - callback function
	 */
	subscribeToState: function(stateNames, cb) {
		var self = this;

		stateNames.forEach(function(stateName) {
			var stateObj = pluckState.call(self, stateName);
			if(stateObj && typeof cb === 'function') {
				
				//create prop if it doesn't exist
				if(!stateObj.subscribers) {
					stateObj.subscribers = [];
				}
				//push to array
				stateObj.subscribers.push(cb);
			}
			else {
				console.error('can\'t subscribe to ', stateName);
			}
		});
	}
};


//TRANSPORT

if (typeof exports === 'object') {
	// CommonJS
	module.exports = SimpleStateMachine;
} 
else {
	// browser global
	window.SimpleStateMachine = SimpleStateMachine;
}

})(window);