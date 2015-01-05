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

	this.initialized = false;
	this.subscribeQueue = []; //for when we want to subscribe to states before they're initialized
	this.states = states || [];
	this.history = [];
	this.currentState = {};

	//if states are passed into the constructor, assume we want to auto-initialize it
	if(this.states.length > 0) {
		this.init();
	}

}


/**
 * Private, handles tracking and history logic
 * @param  {object}
 */
function trackHistory(stateObj) {
	//tack number of visits to current state
	stateObj.visitedCount++;

	//track enter and leave times on state object
	var visitObj = {
		enterTime: new Date(),
		stateName: stateObj.name
	};

	//track in state machine history, make copy of object (omits functions)
	this.history.push(visitObj);

	return stateObj;
}


/**
 * Private fn, transitions to a new state. Does the heay lifting
 * @param {object} stateObj - state object we want to go to
 * @param {object} optParams - object to pass to onEnter fn
 */
function goToStateInternal(stateObj, optParams) {
	var self = this;
	
	//call onLeave transitional fn, pass in new state obj
	if(this.currentState && this.currentState.onLeave) {
		this.currentState.onLeave(stateObj);
	}
	
	trackHistory.call(this, stateObj);

	//set to new state
	this.currentState = stateObj;
	
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


SimpleStateMachine.prototype = {

	/**
	 * starts everything in the state machine
	 */
	init: function() {
		this.initialized = true;

		//get all state names
		this.allStateNames = this.states.map(function(state) {
			return state.name;
		});

		//wire up subscribers to states that we're deferred until initialization
		if(this.subscribeQueue && this.subscribeQueue.length > 0) {
			var self = this;
			this.subscribeQueue.forEach(function(item) {
				self.subscribeToState.apply(self, item);
			});
		}

		//start initial state
		for( var i = 0; i < this.states.length; i++) {			
			var state = this.states[i];
			
			//set meta properties on each state
			state.visits = [];
			state.visitedCount = 0;
			
			//fix up any states that use a wildcard
			if(state.possibleStates && state.possibleStates[0] === '*') {
				state.possibleStates = this.allStateNames;
			}

			if(state.initial) {
				goToStateInternal.call(this, state);
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
	 * returns current state object
	 */
	getCurrentState: function() {
		return this.currentState;
	},

	/**
	 * checks if current state name matches provided stateName
	 * @type {string} stateName
	 * @return {boolean}
	 */
	isState: function(stateName) {
		return this.getCurrentState().name === stateName;
	},

	/**
	 * get previous state
	 */
	getPreviousState: function() {
		if(this.history[this.history.length - 2]) {
			return this.getState( this.history[this.history.length - 2].stateName );
		}
		else {
			return null;
		}
	},

	/**
	 * iterates through states and returns one that matches the provided stateName
	 * @param {string} stateName - name of the state to get
	 * @return {object} the state object
	 */
	getState: function(stateName) {
		var stateToReturn;
		for(var i = 0; i < this.states.length; i++) {
			if(this.states[i].name === stateName) {
				stateToReturn = this.states[i];
				break;
			}
		}
		return stateToReturn;
	},

	/**
	 * gets all of the current state's possible states that can be transitioned to
	 */
	getPossibleStates: function() {
		return this.currentState.possibleStates;
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
		
		goToStateInternal.call(this, this.states[nextIndex], optParams);
	},

	/**
	 * transitions to specified state
	 * @param {string} stateName - state to go to
	 * @param {object} optParams - optional params to pass to state's onEnter callback
	 */
	goToState: function(stateName, optParams){
		if(this.currentState.possibleStates.indexOf(stateName) > -1) {
			var newState = this.getState(stateName);
			goToStateInternal.call(this, newState, optParams);
		}
	},

	/**
	 * subscribe to a state
	 * @param {array} stateNames - array of names of states you want to subscribe to
	 * @param {function} cb - callback function
	 */
	subscribeToState: function(stateNames, cb) {
		//if its a string, make it an array
		if(typeof stateNames === 'string') {
			stateNames = [stateNames];
		}

		//this allows for events to be subscribed to before they've been initialized
		if(!this.initialized) {
			this.subscribeQueue.push([stateNames, cb]);
		}
		else {
			var self = this;
			var statesArr = [];

			//account for wildcards
			if(stateNames[0] === '*') {
				statesArr = this.allStateNames;
			}
			else {
				statesArr = stateNames;	
			}

			statesArr.forEach(function(stateName) {
				var stateObj = self.getState(stateName);
				if(stateObj && typeof cb === 'function') {
					
					//create prop if it doesn't exist
					if(!stateObj.subscribers) {
						stateObj.subscribers = [];
					}
					//push to array
					stateObj.subscribers.push(cb);
				}
				else {
					throw new Error('can\'t subscribe to ', stateName);
				}
			});
		}
	}
};


//TRANSPORT

if (typeof exports === 'object') {
	// CommonJS
	exports = module.exports = SimpleStateMachine;
} 
else {
	// browser global
	window.SimpleStateMachine = SimpleStateMachine;
}

})(window);