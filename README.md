# STATE STORE
Built around the `Node.js` `EventEmitter` from the `events` module

## Principle
I became curious about the `EventEmitter` considering I had seen similar syntax used in web sockets. I decided to explore real-life
use cases of it. The `EventEmitter` has a structure of the observer pattern; this is an object-oriented design pattern. The Observer 
pattern defines an object (called subject) that  notifies a set of observers (or listeners) when a change in its state occurs.

We also know that the principle of state management is one that monitors data for change in it and updates display accordingly(e.g. re-render UI).


## Source Files
`event-store.js`
Defines a reusable `EventStore` class that:
- Accepts an initial state.
- Notifies subscribers on state changes using `.emit()`.
- Allows listeners to subscribe using `.enlist(listener)` and unsubscribe using the returned function.


`usestore.js`
A `useStore` hook  is created in this file. Specific for integrating our library with `React.js`. It connects our `EventStore` class to React
components, allowing them access the state of the  store and re-render when the state changes. Crafted using the `useReducer` and `useEffect` React hooks. It links our `EventStore` with React's rendering system. 

**How it Works**:
It Subscribes to the store's `change` events which are emitted by `EventStore` whenever `setState` updates state. This is done using the store's 
`enlist` method. When a change occurs, it calls the reducer's dispatch function to force a re-render.

It unsubscribes from the store when the component unmounts to prevent memory leaks.


## Use Cases
Now going to explore some use cases using different frameworks. This is generally going to look at user code.

**Installation**
```bash
npm install stimutter@alpha
```

### How To Use (JavaScript)

`stimutter` can be used in JavaScript environments, both in `Node.js` for server-side applications and in browsers with `HTML` for client-side interfaces. Below are two common use cases: basic state management in `Node.js` and interactive state management in a browser with `HTML`.

#### Basic Usage in Node.js
This example shows how to use `EventStore` in a Node.js script to manage state and listen for updates.

```javascript
// app.js
import EventStore from 'stimutter'; 

//sample object
const user = {
  username: 'Mike',
  complexion: 'fair',
};

const eventStore = new EventStore(user);

function myListener(prevState, newState) {
  console.log(`State changed from ${prevState.username} to ${newState.username}`);
}

const delist = eventStore.enlist(myListener);

// Trigger a change
eventStore.setState({ username: 'Steve' });

// Check final state
console.log('Final state:', eventStore.getState());

// Optionally stop listening
delist();
```

**How It Works**
- Import `EventStore` from `stimutter`.
- Create an `EventStore` instance with an initial state (`{ username: 'Mike', complexion: 'fair' }`).
- Use `enlist` to register a listener (`myListener`) that responds to update events.
- Call `setState` to update the state, triggering an update event with `prevState` and `newState`.
- Use `delist` to unsubscribe the listener.


**Output**:
When you run the code(`node app.js`), you should see:

```bash
State changed from Mike to Steve
Final state: {username: "Steve", complexion: "fair"}
```


### Vanilla Javascript and HTML
Going to need a bundler like webpack to use in this scenario.

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Observable State (Node EventEmitter)</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

```javaScript
// app.js
import EventStore from 'stimutter'; 

const eventStore = new EventStore({ count: 0 });

function render(state) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Count: ${state.count}</h1>
    <button id="increment">+1</button>
    <button id="decrement">-1</button>
  `;
}

eventStore.enlist(render); // Register listener
render(eventStore.getState()); // Initial UI render

document.addEventListener('click', (e) => {
  if (e.target.id === 'increment') {
    eventStore.setState({ count: eventStore.getState().count + 1 });
  } else if (e.target.id === 'decrement') {
    eventStore.setState({ count: eventStore.getState().count - 1 });
  }
});
```
**How It Works**:
- Import `EventStore` from `stimutter`.
- Create an `EventStore` instance with an initial state (`{ count: 0 }`).
- Use `enlist` to register a `render` function that updates the DOM on update events.
- Call `setState` on button clicks to update `count`, triggering re-renders.
- Bundle with Webpack to generate `bundle.js` for the HTML file.


**Output**: Clicking the button increments or decrements count, and the UI updates to reflect the new value.


### React.js
`stimutter` integrates seamlessly with React.js using the `useStore` hook from `usestore.js`. Below are two common use cases: basic state management in a single component and global state sharing across multiple components.

#### Basic Usage in a React Component
This example shows how to use `EventStore` and `useStore` in a single React component to manage state, similar to React’s `useState` but with the benefits of `stimutter`’s event-driven architecture.

```javascript
// src/App.jsx
import EventStore, { useStore } from 'stimutter'; 

const eventStore = new EventStore({ count: 0 });

function App() {
  const state = useStore(eventStore);

  function handleClick() {
    eventStore.setState({ count: state.count + 1 });
  }

  return (
    <>
      <h1>Counter</h1>
      <div>
        <button onClick={handleClick}>count is {state.count}</button>
      </div>
    </>
  );
}

export default App;
```


**How it Works**:
- Import `EventStore` and `useStore` from `stimutter`.
- Create an `eventStore` instance with an initial state (`{ count: 0 }`).
- Use `useStore(eventStore)` to access the current state and re-render on changes.
- Call `setState to update` the state, triggering an update event that causes the component to re-render with the new count.


**Output**: Clicking the button increments count, and the UI updates to reflect the new value.



#### Global State Across Various Components
This example demonstrates sharing state across multiple components, a key advantage of Stimutter over local state management.

```javaScript
//App.jsx
import EventStore, { useStore } from 'stimutter'; 
import CounterDisplay from './CounterDisplay';

export const eventStore = new EventStore({ count: 0 });

function App() {
  const state = useStore(eventStore);

  function handleClick() {
    eventStore.setState({ count: state.count + 1 });
  }

  return (
    <>
      <h1>Counter</h1>
      <div>
        <button onClick={handleClick}>count is {state.count}</button>
      </div>
      <CounterDisplay />
    </>
  );
}

export default App;
```

```javaScript
//CounterDisplay.jsx
import { useStore } from 'stimutter'; // Adjust path or use NPM package
import { eventStore } from './App';

function CounterDisplay() {
  const state = useStore(eventStore);
  return <p>Count from another component: {state.count}</p>;
}

export default CounterDisplay;
```

**How it Works**
- Export `eventStore` from `App.jsx` to share the same instance with other components.
- `CounterDisplay.jsx` imports `eventStore` and uses `useStore` to access the shared state.
- When `setState` is called in `App.jsx`, both components re-render with the updated count.


**Output**: 
Clicking the button in `App.jsx` increments count, and both `App` and `CounterDisplay` display the same updated value, demonstrating global state management.



