

/* 
A race condition is a subtle and problematic situation that occurs when two or more operations
(usually processes or threads) are trying to access and change a shared resource (like a variable, file or database)
at the same time, and the final outcome of the resource depends on the unpredictable order
or timing in which these operations finish.

Essentially, they are "racing" to complete their tasks, and the winner (the one that finishes last) dictates the results, 
often leading to incorrect data.

WHY ITS BAD

Data Corruption/Inconsistency
The most common result is that the shared data ends up in an unintended, incorrect or inconsistent state.

Unpredictability(Non-Determinism)
The bug only appears intermittently, depending on millisecond timing differences, making it incredibly difficult to reproduce, debug and fix.

Security Vulnerabilities
In some cases, a race condition can be expoited by an attacker to gain unauthorized access or privileges.

JavaScript is inherently single-threaded, which means that two pieces of code (like two withdrawal "thread" in the analogy) aren't truly running simultaneously
on the same data in the same way they would in a multi-threaded language

*/



// Bank Example
// Shared resource
let accountBalance = 200;


// ASYNCHRONOUS OPERATION (Simulates a database read/write)

function withdraw (amount, transactionId) {
    console.log(`\nTransaction ${transactionId}: Starting withdrawal of $${amount}`);

    //Step A: Reads the current balance (simulated delay)
    const currentBalance = accountBalance;
    console.log(`Transaction ${transactionId}: Read balance: $${currentBalance}`);


    return new Promise(resolve => {
        setTimeout(() => {
            // Step B: Calculate the new balance
            if(currentBalance >= amount) {
                const newBalance = currentBalance - amount;

            // Step C: Write the new balance back (The critical moment)
                accountBalance = newBalance;
                console.log(`Transaction ${transactionId}: Wrote new balance: $${newBalance}`);
                resolve(true);
            } else {
                console.log(`Transaction ${transactionId}: FAILED - Insufficient funds.`);
                resolve(false)
            }


        }, 50); // Small delay to force the "race"
    });
}


// 3, The RACE: Two operations called almost simultaneously
console.log(`Initial Balance: $${accountBalance}`);

const transaction1 = withdraw(100, 'T1');
const transaction2 = withdraw(50, 'T2');

//Wait for both to finish and then check the final balance
Promise.all([transaction1,transaction1]).then(() => {
    console.log(`\n --- Transactions Complete ---`);
    console.log(`FINAL BALANCE (Actual): $${accountBalance}`);
    console.log(`FINAL BALANCE (expected): $50`); // 200-100-50 = 50
});


/*
When we run the code, the output will typically look like :
1. T1 Reads: reads the balance as $200.
2. T2 Reads: T2 reads the balance as $200 (before T1 can write its result.)
3. T1 Writes: After its 50ms delay, T1 writes 200 - 100 = $100
4. T2 Write: After its 50ms delay, T2 writes 200 - 50 = 150

The final balance is $150, demonstrating the lost balance where the $100 withdrawal (T1's work) 
was completely overwritten by the second transation (T2)

The simulation clearly illustrates how access to a shared, mutable state (accountBalance)
without proper synchronization can lead to incorrect, non-deterministic results.

*/


