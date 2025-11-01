// Using async/await to Serialize Shared Access (The Bank Problem)

/*
The solution is to force the operations to run sequentially(one after the other), preventing the
"read-read-write-write" scenario.
*/


// We use Promises and the async/await syntax to "lock" the execution order:



let accountBalance = 200;

// The function is now "async";

async function withdrawSafe(amount, transactionId) {
    console.log(`\nTransaction ${transactionId}: Starting withdrawal of $${amount}`);

    // Wait until this function is the only one executing its steps.

    // 1. Read Balance (Synchronous Step)
    const currentBalance = accountBalance;

    console.log(`Transaction ${transactionId}: Read Balance: $${currentBalance}`);


    //2. Simulate Delay (A necessary wait, but controlled)
    // We use 'await' here to PAUSE the execution of the current 'withdrawSafe' call
    // until this small delay is over

    await new Promise(resolve => setTimeout(resolve,50));

    //3. Write Balance (this step only runs AFTER the previous 'await')
    if(currentBalance >= amount){
        accountBalance = currentBalance - amount;
        console.log(`Transaction ${transactionId}: Wrote new balance: $${accountBalance}`);
    } else {
        console.log(`Transaction ${transactionId}: FAILED - INSUFFICIENT funds.`);
    }

}

async function runTransactions() {
    console.log(`INITIAL BALANCE: $${accountBalance}`);


    // The key is to use 'await' to ensure the first transaction completes fully
    // (Read, Delay, Write) before the second one is even started.

    await withdrawSafe(200, 'T1'); // T1 MUST finish its write....
    await withdrawSafe(50,'T2'); // ....before T2 begins its read.


    console.log(`\n--- Transactions Complete ---`);
    console.log(`FINAL BALANCE (Actual): $${accountBalance}`);
    console.log(`FINAL BALANCE (Expected): $50`);

}


runTransactions();


/*
T1 Start - T1 reads balance - Account Balance(200) 
T1 Pause - T1 hits await (50ms) - Account Balance(200) - T2 cannot start yet
T1 FINISH - T1 resumes and writes the new balance - Account Balance (100) - T1's work is safe
T2 Start - T2 reads balance(T1 has finished) - Account Balance(100) - T2 reads the correct, updated balance
T2 Pause - T2 hits await (50ms) - Account Balance(100) 
T2 Finish - T2 resumes and writes the new balance (100-50=50) - Account Balance(50) - Correct Final Balance


By using await, we serialize the access to the shared resource, eliminating the "race" and guaranteeing the correct result.
*/



/*
Javascript is single-threaded, meaning only one instruction executes at any given time.
We need to force sequential execution using async/await because of the JavaScript Event Loop and
asynchronous operations, not because of true parallel threading.

WHY SEQUENTIAL CONTROL IS NECESSARY IN SINGLE-THREADED JS
The single-threaded nature of JavaScript only guarantees that the code currently running in the 
Call Stack isn't interrupted. It does not guarantee that asynchronous tasks will finish in the order
they were initiated, nor does it prevent multiple asynchronous tasks from reading shared data
before any of them with their updates.

1. The Call Stack vs. The Event QUEUE

When you initiate an asynchronous operation (like setTimeout, fetching data with fetch, or an I/O operation)
 - The operation is started synchronously
 - The main thread continues executing the rest of the synchronous code (like starting the second transaction)
 - The asynchronous callback (the part that writes the new balance) is place in a separate Event Queue to wait

 In the bank example, both transactions read the balance of $200 in the quick synchronous phase and 
 then simultaneously scheduled their write operations to the Event Queue. This created the race.

 2. The Problem: Non-Blocking Execution

 Javascript is designed to be non-blocking (which is good for user interface). When it encounters an operation
 that takes time (like the 50ms delay in our example), it delegates that task and immediately moves
 on to the next line of code:

 - Without await
    1. Start T1(T1 reads $200)
    2. Start T2(T2 reads $200)
    3. 50ms later, T1 writes $100
    4. 51ms later, T2 writes $150 (overwriting T1). The order of the start of the transactions is 
    not the order of the finish of the transactions.


 - With await:
    1. Start T1
    2. T2 reaches await and pauses the execution of the entire runTransactions function. It yields control back to the Event Loop.
    3. T1's asynchronous part runs and finishes (it writes the correct $100)
    4. The runTransactions function resumes execution from where it left off, and T2 is 
    finally allowed to start. T2 now reads the updated balance of $100.

    Conclusion: Control Over Asynchronous Timing

    We use async/await to logically serialize the asynchronous execution of functions that 
    manipulate shared state. While the CPU isn't running the functions in parallel, the time gap
    between the synchronous read and the asynchronous write introduces the opportunity for a race 
    condition, which await explicitly closes.
*/