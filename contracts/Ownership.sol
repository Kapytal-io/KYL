pragma solidity ^0.4.22;

contract Ownable {
    address public owner;   
    /**
    * @dev sets the original `owner` of the contract to the sender account.
    */
    constructor() public{
        owner = msg.sender;
    }   
    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }   
    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) onlyOwner public{
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
}

contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;
    /**
    * @dev modifier to allow actions only when the contract IS paused
    */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }
    /**
    * @dev modifier to allow actions only when the contract IS NOT paused
    */
    modifier whenPaused {
        require(paused);
        _;
    }
    /**
    * @dev called by the owner to pause, triggers stopped state
    */
    function pause() onlyOwner whenNotPaused public returns (bool) {
        paused = true;
        emit Pause();
        return true;
    }
    /**
    * @dev called by the owner to unpause, returns to normal state
    */
    function unpause() onlyOwner whenPaused public returns (bool) {
        paused = false;
        emit Unpause();
        return true;
    }
}