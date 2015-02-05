
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
				possibleStates: ['state2']
			},
			{
				name: 'state2',
				onLeave: onLeaveMock,
				possibleStates: ['state3']
			},
			{
				name: 'state3',
				onEnter: onEnterMock,
				onLeave: onLeaveMock,
				possibleStates: ['state1']
			}
		];

		SSM = new SimpleStateMachine(states);
		SSM.start();
	});

	afterEach(function() {
		onEnterMock.calls.reset();
		onLeaveMock.calls.reset();
	});

	it('should be defined', function() {
		expect(SSM).toBeDefined();
		expect(SSM.states).toBeDefined();
	});

	it('should start at the initial event', function() {
		var current = SSM.getCurrentState();
		expect(current.name).toEqual('state1');
	});

	it('getState should return a state object', function() {
		expect( SSM.getState('state2').name ).toEqual('state2');
	});

	it('isState should return bool if the current state matches the given state name', function() {
		expect( SSM.isState('state1') ).toEqual(true);
	});

	it('getPreviousState should return the previous state', function() {
		expect( SSM.getPreviousState() ).toEqual(null);
		SSM.goToState('state2');
		expect( SSM.getPreviousState().name ).toEqual('state1');
	});

	it('getPossibleStates should return the states the current state can go to', function() {
		expect( SSM.getPossibleStates() ).toEqual(states[0].possibleStates);
	});

	it('getImpossibleStates should return states that can\'t be entered right now', function() {
		expect( SSM.getImpossibleStates() ).toEqual(['state1', 'state3']);
	});

	it('goToState should pass optional params to onEnter', function() {
		SSM.goToState('state2');
		onEnterMock.calls.reset();

		SSM.goToState('state3', {test: 123});
		expect(onEnterMock).toHaveBeenCalledWith(SSM.getState('state3'), {test: 123});
	});

	it('goToState should change the state only to a state defined in the current state\'s possibleStates object', function() {
		SSM.goToState('state2');
		expect( SSM.getCurrentState().name ).toEqual('state2');

		//invalid because we're now on state2, which won't allow us state1
		SSM.goToState('state1');
		expect( SSM.getCurrentState().name ).toEqual('state2');
	});

	it('goToState should update history and visitedCount', function() {
		SSM.goToState('state2');
		expect( SSM.history.length ).toEqual(2);
		expect( SSM.getCurrentState().visitedCount ).toEqual(1);
	});

	it('should call onEnter functions on enter and onLeave functions on leave', function() {
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

		//should work with a string too
		sub.calls.reset();
		SSM.subscribeToState('state2', sub);
		SSM.goToState('state2');
		expect(sub).toHaveBeenCalled();
	});

	it('can be initialized without any states', function() {
		var SM2 = new SimpleStateMachine();
		expect(SM2).toBeDefined();
		SM2.setStates(states);
		SM2.start();
		expect( SM2.getCurrentState().name ).toEqual('state1');
	});

	it('nextState should advance to the next state', function() {
		expect(SSM.getCurrentState().name).toEqual('state1');
		
		SSM.nextState();
		expect(SSM.getCurrentState().name).toEqual('state2');
		
		SSM.nextState();
		expect(SSM.getCurrentState().name).toEqual('state3');
		
		//go to first state if previous one was the last state
		SSM.nextState();
		expect(SSM.getCurrentState().name).toEqual('state1');
	});

});