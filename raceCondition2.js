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