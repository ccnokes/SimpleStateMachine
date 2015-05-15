angular.module('app', ['SimpleStateMachine'])
	.controller('MainCtrl', [ '$scope', 'SimpleStateMachine', function($scope, SimpleStateMachine) {

		/**
		 * Set up our state machine and expose it to $scope, so it can be templated.
		 * Note that additional properties unrelated to te StateMachine can be safely added to each state.
		 */
		$scope.navState = new SimpleStateMachine()
			.setStates([
				{ 
					name: 'Nav 1', 
					initial: true,
					possibleStates: ['Nav 2', 'Nav 3']
				},
				{ 
					name: 'Nav 2',
					possibleStates: ['Nav 1', 'Nav 3']
				},
				{ 
					name: 'Nav 3',
					possibleStates: ['Nav 1', 'Nav 2']
				}
			])
			//we'll call this function in the template on ng-click
			.decorateStates('onClick', function stateOnClick() {
				$scope.navState.goToState(this.name);
			})
			.start();

		//That's it.



		/**
		 * What would an implementation look like without a state machine?
		 * The above is pretty simple, whereas this implementation took more time to implement,
		 * is harder to read and understand, and is less flexible and portable.
		 * See angular-ex.html for the HTML of this version as well.
		 * Note that this version has no way to prevent entering the same state one after another
		 * and has no history.
		 */
		
		//declare my states
		$scope.navItems = [
			{ name: 'Nav 1', selected: true },
			{ name: 'Nav 2', selected: false },
			{ name: 'Nav 3', selected: false }
		];

		//return the active state's name
		var setSelectedState = function() {
			var selected = $scope.navItems.filter(function(item) {
				return item.selected;
			});
			return selected[0].name;
		};

		//set it initially
		$scope.selectedNav = setSelectedState();

		//stateOnClick functional equivalent
		$scope.selectNav = function(nav) {
			//make them all false
			$scope.navItems.forEach(function(item) {
				item.selected = false;
			});

			//except for one we just clicked
			nav.selected = true;

			//set it again on click
			$scope.selectedNav = setSelectedState();
		};

	}]);