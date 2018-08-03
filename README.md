![alt text](https://github.com/Kapytal-io/KYL/blob/master/images/portada.png)
# KYL
Repository for the development, documentation, and debugging of Kapytal Exchange Token (KYL coin).

## Overview
The token created on this repo makes use of the standard-protocol ERC-20 which is used by most of the industries. We make use of Open Zeppelin's pre-built-audited smart contracts on Solidity to manage tokens on the Ethereum network. Also, here in the same repo there are some contracts that define the crowdsale logic for the PreICO and ICO by being made [Kapytal](http://kapytal.io)

The crowdsale contracts does not follow any standard, they provide a simple set of functions that made crowdsale's administration easier. They're also congruent with Open Zeppelin's of many others process of crowdsale.

## Technologies used
The contracts were created using solidity compiler version 0.4.22 which is one of the stable versions. 
For running the automated unitary tests, truffle suite is needed along with npm and NodeJS.
Truffle tests were written using NodeJS enviroinment.

Truffle is a development environment, testing framework and asset pipeline for Ethereum, aiming to make life as an Ethereum developer easier. With Truffle, you get:

Built-in smart contract compilation, linking, deployment and binary management.
Automated contract testing with Mocha and Chai.
Configurable build pipeline with support for custom build processes.
Scriptable deployment & migrations framework.

Ganache is a personal blockchain for Ethereum development you can use to deploy contracts, develop your applications, and run tests.
![alt text](https://github.com/Kapytal-io/KYL/blob/master/images/truffle.png)

## Requirements
The tests are intended to run on a Unix terminal installing the following software

npm (latest)
truffle @4.1.13 (solc@0.422)
ganache-cli  6.1.66

## Installation
npm is distributed with Node.js- which means that when you download Node.js, you automatically get npm installed on your computer and you can get it on [npm](https://www.npmjs.com/package/npm)

Once you have installed the npm distribution, the next step is to install the remaining packages, using the following command lines:



```
$ npm install -g truffle


$ npm install -g ganache-cli
```


## Unit Testing
For unit testing, we make use of truffle suite which includes an automated framework for running local and unit tests on a blockchain. The blockchain used is ganache-cli, which is a local client to easily deploy and run Ethereum contracts.

For running the unitary tests under truffle-suite, once the repository has been cloned, you must put the following commands:
```
$ ganache-cli
```
This line runs the `ganache client` to support the local blockchain, where in the next steps the contract is going to be deploy and service the functions for the test.
For further information about ganache-cli functionality please refer to the following link: https://github.com/trufflesuite/ganache-cli

```
$ truffle compile
$ truffle migrate
```

At this point we’re almost done the final step is run the following command which is going to run crowdsale’s automated tests showing some feature on the run.
```
$ truffle test
```
For further information about ganache-cli functionality please refer to the following link: https://github.com/trufflesuite/truffle
Every check on the output list test states that a function has been executed successfully. Each unit test is made on the top of JavaScript, meanwhile contract’s functions are called on the back.
After all tests have been passed, your output terminal should look like the following figure:
![alt text](https://github.com/Kapytal-io/KYL/blob/master/images/chekedList.png "Result list check")
## API Description (Functions and Gas Costs)
### Business Rules
* CFS: Curent crowdsale stage should be Pre ICO
* RRA: Newer rate should be major than zero
* ADR: Address should be different than 0x0
* CRU: Current block should be minor than ending block
* CBU: Current block should be major than ending block
* QTY: Token quantity should be major than zero
* TOK: There should enough remaining tokens after subtracting requested tokens from token cap

1. Function: Constructor.
Contract: self
Objective: Upload the contract to the ethereum blockchain, starting crowdsale on the way
Conditions: Starting block shold be major than curent block and ending block should be major than actual block
Conditions: Have an ethereum account
Lifespan: At call
Caller: Anyone
State: None
Cost: 100 usd @ 60Gwei

2. Function transferOwnership
Contract: Ownable
Objective: An owner can transfer ownership to another ethereum account.
Conditions: Address cannot be zero
Lifespan: Contract’s
Caller: Owner
State: None
Cost: 1.11 usd @ 60 Gwei
 
3. Function: pause / unpause
Contract: Pausable
Objective: Certain functions may be affected by this function effects. Pausing the crowdsale gives the Owner the chance to: change the exchange rate, finalize a crowdsale’s stage, start a new stage, pause token sales, among other administrative functions.
Conditions: Crowdsale state should be paused / unpaused depending on function's calls
Lifespan: Contract's
Caller: Owner
State: Paused / unpaused
Cost: 1.08 usd @ 60Gwei
 
4. Function: addToWhitelist
Contract: WhitelistedCrowdsale, KYLCrowdsale
Objective: During the Pre ICO, only the investors within the list are able to buy tokens. Owner can whitelist investor’s addresses that fulfill business requirements by calling this function.
Conditions: CFS
Lifespan: Pre ICO
Caller: Owner
State: None
Cost: 1.70 usd @ 60Gwei
 
5. Function setRate
Objective: As the crowdsale progresses, owner should be able to change exchange rate.
Conditions: RRA
Lifespan: Contract's
Caller: Owner
State: Paused
Cost: 1.08 usd @ 60Gwei

6. unction: buyTokens
Objective: Buy tokens.
Conditions: ADR, CRU, token quantity should be minor than softcap or hardcap, depending on current stage.
Lifespan: As long as current block is minor than ending block.
Caller: Anyone
State: Not paused
Cost: Not calculated
 
7. Function mintTo
Objective: Handle external buyers, making owner able to mint tokens to other ethereum addresses.
Conditions: ADR, QTY.
Lifespan: As long as soft cap or hard cap isn’t reached
Caller: Owner
State: Not paused
Cost: 3.68 usd @ 60Gwei
 
8. Function airdrop
Objective: Given a determined ethereum address, owner is able to air drop promotional tokens.
Conditions: ADR, QTY, TOK.
Lifespan: As long as there are enough promotional tokens left.
Caller: Owner
State: None
Cost: 1.70 usd @ 60Gwei

9. Function endPreICO:
Objective: Finalize PreICO, starts ICO
Conditions: CFS
Lifespan: PreICO
Caller: Owner
State: Paused
Cost: 2.30 usd @ 60Gwei
 
10. Function finalize:
Objective: Finalize ICO
Conditions: CBU
Lifespan: ICO
Caller: Owner
State: Paused
 
11. Function: freezeTokens
Objective: Given a compromised ethereum account, Owner can block address's token transfers
Conditions: Address is unfreezed
LifeSpan: Contract’s
Caller: Owner
State: None
 
12. Function: unfreezeTokens
Objective: Unfreeze an account that has KYL Tokens on it
Conditions: Address is freezed
LifeSpan: Contract’s
Caller: Owner
State: None
 
13. Function teamMInt
Objective: Mint tokens for team members after crowdsale has ended
Conditions: QTY, TOK
Lifespan: After Crowdsale
Caller: Owner
State: None

## Project status
For now the smart contracts that be call: Crowdsale, KYLCrowdsale.sol, KYLToken.sol, Migrations.sol and
SafeMath.sol. are finished
[You can see the how to working](https://remix.ethereum.org/#optimize=true&version=soljson-v0.4.24+commit.e67f0147.js “REMIX”)
For the smart contrac call “Crowdsale” in this moment the cost of having it in the Rupsten is being checked.
We are still waiting for the contact of the back-end developers team for to be able to establish how the contracts will be connected and interact.

## License
![alt text](https://github.com/Kapytal-io/KYL/blob/master/images/portada.png)