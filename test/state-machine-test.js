
describe('state-machine', function() {
	
	var SSM,
		states,
		onEnterMock = jasmine.createSpy('onEnterMock'),
		onLeaveMock = jasmine.createSpy('onLeaveMock');


	beforeEach(function() {
		states = [
			{
				name: 'state1',
				initial: true,
				onEnter: onEnterMock,
				onLeave: onLeaveMock,
				states: ['state2']
			},
			{
				name: 'state2',
				onLeave: onLeaveMock,
				states: ['state3']
			},
			{
				name: 'state3',
				onEnter: onEnterMock,
				onLeave: onLeaveMock,
				states: ['state1']
			}
		];

		SSM = new SimpleStateMachine(states);

	});

	it('should start at the initial event', function() {
		expect( SSM.getCurrentState() ).toEqual('state1');
	});

	it('goToState should change the state only to a state defined in the current state\'s state object', function() {
		SSM.goToState('state2');
		expect( SSM.getCurrentState() ).toEqual('state2');

		//invalid because we're now on state2, which won't allow us state1
		SSM.goToState('state1');
		expect( SSM.getCurrentState() ).toEqual('state2');
	});

	it('goToState should update history', function() {
		SSM.goToState('state2');
		expect( SSM.history.length ).toEqual(2);
	});

	it('should call onEnter functions on enter and onLeave functions on leave', function() {
		onEnterMock.calls.reset();
		onLeaveMock.calls.reset();

		//state2 has no enter handler
		SSM.goToState('state2');
		expect( onLeaveMock ).toHaveBeenCalled();
		onLeaveMock.calls.reset();

		//state 3 has both
		SSM.goToState('state3');
		expect( onLeaveMock ).toHaveBeenCalled();
		expect( onEnterMock ).toHaveBeenCalled();

		onEnterMock.calls.reset();
		onLeaveMock.calls.reset();

		SSM.goToState('state1');
		expect( onLeaveMock ).toHaveBeenCalled();
		expect( onEnterMock ).toHaveBeenCalled();
	});

	it('subscribed functions should be called on state change', function() {
		var sub = jasmine.createSpy('sub');
		SSM.subscribeToState(['state2'], sub);
		SSM.goToState('state2');
		expect(sub).toHaveBeenCalled();

		sub.calls.reset();
		SSM.subscribeToState(['state3'], sub);
		SSM.goToState('state3');
		expect(sub).toHaveBeenCalled();

		sub.calls.reset();
		SSM.subscribeToState(['state1'], sub);
		SSM.goToState('state1');
		expect(sub).toHaveBeenCalled();
	});

	it('subscribeToState should handle a function that subscribes to 2 or more events', function() {
		var sub = jasmine.createSpy('sub');
		
		SSM.subscribeToState(['state1', 'state2', 'state3'], sub);
		
		SSM.goToState('state2');
		expect(sub).toHaveBeenCalled();
		sub.calls.reset();
		
		SSM.goToState('state3');
		expect(sub).toHaveBeenCalled();
		sub.calls.reset();

		SSM.goToState('state1');
		expect(sub).toHaveBeenCalled();
	});

	it('can be initialized without any states', function() {
		var SM2 = new SimpleStateMachine();
		expect(SM2).toBeDefined();

		SM2.setStates(states);
		expect( SM2.getCurrentState() ).toEqual( SM2.currentState.name );
	});

	it('nextState should advance to the next state', function() {
		expect(SSM.getCurrentState()).toEqual('state1');
		
		SSM.nextState();
		expect(SSM.getCurrentState()).toEqual('state2');
		
		SSM.nextState();
		expect(SSM.getCurrentState()).toEqual('state3');
		
		//go to first state if previous one was the last state
		SSM.nextState();
		expect(SSM.getCurrentState()).toEqual('state1');
	});


});