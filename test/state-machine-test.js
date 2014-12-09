
describe('state-machine', function() {
	
	var SM,
		states,
		StateMachine = require('../../src/models/state-machine.js');

	var onEnterMock = jasmine.createSpy('onEnterMock');
	var onEndMock = jasmine.createSpy('onEndMock');


	beforeEach(function() {
		states = [
			{
				name: 'state1',
				initial: true,
				handler: onEnterMock,
				onEnd: onEndMock,
				events: {
					state2: 'state2'
				}
			},
			{
				name: 'state2',
				onEnd: onEndMock,
				events: {
					state3: 'state3'
				}
			},
			{
				name: 'state3',
				handler: onEnterMock,
				onEnd: onEndMock,
				events: {
					state1: 'state1'
				}
			}
		];

		SM = new StateMachine(states);

	});

	it('should start at the initial event', function() {
		expect( SM.getStatus() ).toEqual('state1');
	});

	it('sendEvent should change the state only to a state defined in the current state\'s state event object', function() {
		SM.goToState('state2');
		expect( SM.getStatus() ).toEqual('state2');

		//invalid because we're now on state2, which won't allow us state1
		SM.goToState('state1');
		expect( SM.getStatus() ).toEqual('state2');
	});

	it('should call handler functions on enter and onEnd functions on out', function() {
		onEnterMock.calls.reset();
		onEndMock.calls.reset();

		//state2 has no enter handler
		SM.goToState('state2');
		expect( onEndMock ).toHaveBeenCalled();
		onEndMock.calls.reset();

		//state 3 has both
		SM.goToState('state3');
		expect( onEndMock ).toHaveBeenCalled();
		expect( onEnterMock ).toHaveBeenCalled();

		onEnterMock.calls.reset();
		onEndMock.calls.reset();

		SM.goToState('state1');
		expect( onEndMock ).toHaveBeenCalled();
		expect( onEnterMock ).toHaveBeenCalled();
	});

	it('subscribed functions should be called on state change', function() {
		var sub = jasmine.createSpy('sub');
		SM.subscribe('state2', sub);
		SM.goToState('state2');
		expect(sub).toHaveBeenCalled();

		sub.calls.reset();
		SM.subscribe('state3', sub);
		SM.goToState('state3');
		expect(sub).toHaveBeenCalled();

		sub.calls.reset();
		SM.subscribe('state1', sub);
		SM.goToState('state1');
		expect(sub).toHaveBeenCalled();
	});

	it('subscribe should handle a function that subscribes to 2 or more events', function() {
		var sub = jasmine.createSpy('sub');
		
		SM.subscribe('state1 state2 state3', sub);
		
		SM.goToState('state2');
		expect(sub).toHaveBeenCalled();
		sub.calls.reset();
		
		SM.goToState('state3');
		expect(sub).toHaveBeenCalled();
		sub.calls.reset();

		SM.goToState('state1');
		expect(sub).toHaveBeenCalled();

	});

	it('can be initialized without any states', function() {
		var SM2 = new StateMachine();
		expect(SM2).toBeDefined();

		SM2.setStates(states);
		expect( SM2.getStatus() ).toEqual( SM2.currentState.name );		
	});

	it('nextState should advance to the next state', function() {
		expect(SM.getStatus()).toEqual('state1');
		
		SM.nextState();
		expect(SM.getStatus()).toEqual('state2');
		
		SM.nextState();
		expect(SM.getStatus()).toEqual('state3');
		
		//go to first state if previous one was the last state
		SM.nextState();
		expect(SM.getStatus()).toEqual('state1');
	});


});