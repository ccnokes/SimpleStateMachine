describe('State', function() {

	var state,
		onEnterMock = jasmine.createSpy('onEnterMock'),
		onLeaveMock = jasmine.createSpy('onLeaveMock');

	beforeEach(function() {
		state = new State({
			name: 'test',
			initial: true,
			onEnter: onEnterMock,
			onLeave: onLeaveMock,
			blergh: 'asd'
		}, {});
	});

	afterEach(function() {
		onEnterMock.calls.reset();
		onLeaveMock.calls.reset();
	});

	it('should extend arbitrary props onto itself', function() {
		expect(state.blergh).toBeDefined();
	});

	it('should be set to active if its initial', function() {
		expect(state.active).toEqual(true);
	});

	it('addMethod should add a function to the prototype', function() {
		var mock = jasmine.createSpy('test');
		State.addMethod('testFn', mock);
		state.testFn();
		expect(mock).toHaveBeenCalled();
	});

	it('activate', function() {
		state.activate();
		expect(state.visitedCount).toEqual(1);
		expect(onEnterMock).toHaveBeenCalled();

		state.activate({test: 123});
		expect(state.visitedCount).toEqual(2);
		expect(onEnterMock).toHaveBeenCalledWith(state, {test: 123});
	});

	it('deactivate', function() {
		state.deactivate();
		expect(onLeaveMock).toHaveBeenCalled();
	});

	it('isActive', function() {
		state.activate();
		expect(state.isActive()).toEqual(true);
	});

});