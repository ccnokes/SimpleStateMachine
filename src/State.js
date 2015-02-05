/**
 * State constructor, should only be called by StateMachine
 * @param {Object} config object
 * @param {Object} parent StateMachine object
 */
function State(obj, SM) {
	//merge all props in obj onto 'this'
	for(var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			this[prop] = obj[prop];
		}
	}

	this.SM = SM;

	//set defaults
	this.initial = obj.initial || false;
	this.visitedCount = 0;

	if(obj.initial) {
		this.active = true;
	} else {
		this.active = false;
	}
}

/**
 * Static method that appends function to prototype
 * @param {String} name of fn
 * @param {Function}
 */
State.addMethod = function(name, fn) {
	State.prototype[name] = fn;
};

State.prototype = {
	/**
	 * sets this state to active
	 * @param  {Object} optional object that can be passed and consumed in onEnter callback
	 * @return {Object} this, for chaining
	 */
	activate: function(optParams) {
		this.active = true;
		this.visitedCount++;
		if(this.onEnter) {
			this.onEnter(this, optParams);
		}
		return this;
	},

	/**
	 * deactivate this state
	 * @return {Object} this, for chaining
	 */
	deactivate: function() {
		this.active = false;
		if(this.onLeave) {
			this.onLeave(this);
		}
		return this;
	},

	/**
	 * is this state active?
	 * @return {Boolean}
	 */
	isActive: function() {
		return this.active;
	}
};