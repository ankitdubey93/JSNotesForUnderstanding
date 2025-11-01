
/* 
A closure in JS is a function that remembers its outer function's environment (or lexical scope) even after
the outer function has finished executing. This allows the inner function to access variables from its
surrounding scope.


A closure is created when an inner function is defined inside an outer function, and the inner function
refers to variables declared in the outer function . When the outer function executes and returns the 
inner function, the inner function retains a reference to the outer function's scope - this 
persistent link is the closure.
*/




// E.g closure example 1

function makeGreeter (greeting) {
    // "greeting" is a variable in the outer function's scope

    function greet(name) {
        // "greet" is the inner function forming the closure

        console.log(`${greeting}, ${name}!`)
    }

    // The closure is created when 'greet' is returned.
    return greet;
}


// 'sayHello' and 'sayHi' are now functions that 'remember' their 'greeting' value
const sayHello = makeGreeter("Hello");
const sayHi = makeGreeter("Hi");

sayHello("Alice");
sayHi("Bob");



/* 
The makeGreeter function runs and finishes. Normally, its local variable greeting would
be gone.
However, the returned function (greet) is assigned to sayHello and sayHi.
These returned functions "close over" the greeting variable, retaining a value specific
to their creation (either 'Hello or "Hi")
*/



// Eg. 2: Maintaining state(Private variables)

// Closures are excellent for maintaining state and creating private variables.

function createCounter() {
    let count = 0;

    return {
        increment: function () {
            count++;
            return count;
        },

        getValue: function () {
            return count;
        }
    };
}


const counterA = createCounter();
const counterB = createCounter(); // creates an entirely separate scope for 'count'


console.log(counterA.increment());
console.log(counterA.increment());

console.log(counterB.getValue());
console.log(counterB.increment());


/*
The count variable is only accessible through the returned increment and getValue methods. It cannot be directly modified from the outside.
Each call to createCounter() creates a new, independent scope for count, demonstrating how closures can isolate state.

The main benefit of having different, independent counts (like counterA and counterB in the example) is data isolation and state management. 
This capability, powered by closures, is essential for building complex, reliable applications.

Why Independent Counts are Useful
The ability to create multiple, isolated instances of a function's state is crucial for simulating objects and managing concurrent processes without interference.

1. Encapsulation and Data Privacy 
In JavaScript, closures are the primary mechanism for achieving encapsulation, which is the bundling of data (the count) with the methods that operate on that data (increment and getValue).

Benefit:
 The count variable is "private." No external code can accidentally or maliciously reset it (e.g., counterA.count = 99). 
 This leads to more predictable and reliable code.

Use: 
This is the foundation of the Module Pattern in JavaScript, 
used to build components that expose a clear public interface while keeping internal workings hidden.

2. Creating Independent Instances 
The technique allows you to create multiple, separate instances of an object's behavior (like a counter) that don't affect each other.

Benefit: 
If counterA was tracking clicks on an "Add to Cart" button and counterB was tracking character input in a search bar, 
you need them to operate completely separately. The closure ensures that counterA's calls to increment() only change its own internal count and not counterB's.

Use: 
Creating unique instances of objects like timers, score trackers, transaction IDs, or any component that needs to maintain a unique internal state.

3. Concurrency and Asynchronous Operations 
When dealing with asynchronous tasks (like network requests or event handling), you often need to ensure that a function uses the c
orrect variables from the moment it was created, even if the surrounding environment changes later.

Benefit: 
The closure "freezes" the value of the outer variables. If you were starting 10 separate timers, 
a closure would ensure that each timer's callback function refers to its own specific timer ID or index, 
preventing a race condition where all callbacks try to use the final, updated index value.

Use: 
Properly binding event listeners to elements in a loop, or ensuring callback functions in a 
series of asynchronous operations retain the context they need.






*/

