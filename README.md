#SimpleStateMachine
State machines are simple yet powerful. This one aims to be as simple as possible. No external dependencies.

##Install
```
bower install simple-state-machine
```

##Usage
See index.html for all examples. The example using Angular has a side-by-side comparison of using SimpleStateMachine vs. not in a pretty typical use-case. See .js file code comments for documentation.

##Why?
One of the primary things front end Javascript deals with is setting and managing the state of different objects and exposing that state to the DOM. There's a lot of complexity to this: not all states can be universally reached from all other states, other objects need to be notified when a states has been entered/left, only one state can be "active" at a time, etc. I've found that this complexity can be reduced by using a state machine to manage it. This is because: 

- The pub/sub pattern allows for greater seperation of concerns; and pub/sub is at the heart of this state machine.
- Having a common API for managing state within an app makes you more productive because you don't reinvent the wheel every time you're working on state related logic.


[This article](http://www.shopify.com/technology/3383012-why-developers-should-be-force-fed-state-machines) also explains why state machines should be used.