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
	
	if(states) {
		this.setStates(states);	
	} else {
		this.states = [];
	}
	
	
	this.history = [];
	this.currentState = null;
}


/**
 * Private, handles tracking and history logic
 * @param  {object}
 */
function trackHistory(stateName) {
	//track enter and leave times on state object
	var visitObj = {
		enterTime: new Date(),
		stateName: stateName
	};

	//track in state machine history, make copy of object (omits functions)
	this.history.push(visitObj);
}


/**
 * Private fn, transitions to a new state. Does the heay lifting
 * @param {object} stateObj - state object we want to go to
 * @param {object} optParams - object to pass to onEnter fn
 */
function goToStateInternal(stateObj, optParams) {
	var self = this;
	
	//call onLeave transitional fn, pass in new state obj
	if(this.currentState) {
		this.currentState.deactivate();
	}
	
	trackHistory.call(this, stateObj.name);

	//set to new state
	this.currentState = stateObj;
	
	this.currentState.activate(optParams);
	

	//call all subscribers to this state
	if(this.currentState.subscribers && this.currentState.subscribers.length > 0) {
		var subs = this.currentState.subscribers;
		subs.forEach(function(sub, i) {
			sub(self.currentState);
		});
	}
}

function createStates(arr) {
	var self = this;

	//get all state names
	this.allStateNames = arr.map(function(state) {
		return state.name;
	});

	var states = [];
	arr.forEach(function(item) {
		//make all states possible by default
		//fix up any states that use a wildcard
		if(!item.possibleStates || item.possibleStates[0] === '*') {
			item.possibleStates = self.allStateNames;
		}
		var newState = new State(item, self);
		states.push(newState);
	});
	return states;
}


SimpleStateMachine.prototype = {

	/**
	 * starts everything in the state machine
	 */
	start: function() {
		this.initialized = true;

		//wire up subscribers to states that were deferred until initialization
		if(this.subscribeQueue && this.subscribeQueue.length > 0) {
			var self = this;
			this.subscribeQueue.forEach(function(item) {
				self.subscribeToState.apply(self, item);
			});
		}

		//start initial state
		for( var i = 0; i < this.states.length; i++) {			
			var state = this.states[i];

			if(state.initial) {
				goToStateInternal.call(this, state);
			}
		}
		return this;
	},

	/**
	 * so you can set states later after construction
	 * @param {Array} states
	 * @return {Object} this, for chaining
	 */
	setStates: function(states) {
		this.states = createStates.call(this, states);
		return this;
	},

	/**
	 * add method to each state
	 * @param  {String} name of function, will overwrite existing if same name
	 * @param  {Function} function that gets attached to prototype of State
	 * @return {Object} this, for chaining
	 */
	decorateStates: function(name, fn) {
		State.addMethod(name, fn);
		return this;
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
	 * get all states that are disabled or can't be entered
	 * @return {Array}
	 */
	getImpossibleStates: function() {
		var possibles = this.currentState.possibleStates;
		return this.allStateNames.filter(function(item){ 
			return possibles.indexOf(item) === -1; 
		});
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
		return this;
	}
};