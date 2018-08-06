pragma solidity ^0.4.22;

import "./Crowdsale.sol";

contract KYLCrowdsale is Pausable, WhitelistedCrowdsale, CappedCrowdsale{
    enum stages {pICO, ICO}

    event PreCrowdsaleStarted();
    event CrowdsaleStarted();
    event CrowdsaleFinished();
    event RateChanged(uint256 rate);

    event ExternalPurchase(address indexed who, uint256 tokens);
    event AirDroppedTokens(address indexed who, uint256 tokens);
    event TeamMintedTokens(uint256 tokens);

    stages public stage;

    uint256 public softCap;
    uint256 public hardCap;
    uint256 public teamCap;
    uint256 public airdropCap;

    /**
    * @dev function: constructor
    * @param _startBlock at what block number, the crowdsale should begin
    * @param _endBlock at what block number, the crowdsale should stop
    * @param _fixRate how many tokens gives 1 ether
    * @param _cap crowdsale capitalization in ether
    * @param wallet address which collects received ether
     */
    constructor(
        uint256 _startBlock, uint256 _endBlock, 
        uint256 _fixRate, uint256 _cap,
        address wallet
    )
        public 
        Crowdsale(_startBlock, _endBlock, _fixRate, wallet)
        WhitelistedCrowdsale()
        CappedCrowdsale(_cap * (1 ether))
    {
        stage = stages.pICO;

        softCap = 15000000;
        hardCap = 50000000;
        teamCap = 30000000;
        airdropCap = 5000000;

        KYLToken(token).pause();

        emit PreCrowdsaleStarted();
    }

    /**
    * @dev overriden function
    * @notice creates a mintable compatible token
    * @return the custom token
    */
    function createTokenContract() internal returns (MintableToken) {
        return new KYLToken();
    }

    /**
    * @dev overriden function
    * @notice owner must be the caller, stage should be preICO
    * @notice adds an address to the early investors whitelist
    */
    function addToWhitelist(address buyer) public onlyOwner{
        require(stage == stages.pICO);
        super.addToWhitelist(buyer);
    }

    /**
    * @notice owner must be the caller, state should be paused
    * @notice sets a custom rate
    */
    function setRate(uint256 _rate) public whenPaused onlyOwner{
        require(_rate > 0);
        rate = _rate;
        emit RateChanged(rate);
    }

    /**
    * @dev overriden function
    * @notice crowdsale state should be unpaused
    * @notice a investor can call this function to buy tokens
    * @param who the address where tokens are forwarded
    */
    function buyTokens(address who) public whenNotPaused payable{
        require(who != 0x0);
        require(super.validPurchase());

        uint256 value = msg.value;
        uint256 tokens = value.mul(rate);

        if(stage == stages.pICO){
            require(super.isWhitelisted(who));
            require(softCap.sub(tokens.div(1 ether)) >= 0);        
            softCap = softCap.sub(tokens.div(1 ether));
        }else if(stage == stages.ICO){
            require(hardCap.sub(tokens.div(1 ether)) >= 0);
            hardCap = hardCap.sub(tokens.div(1 ether));
        }
        
        weiRaised = weiRaised.add(value);
        token.mint(who, tokens);
        emit TokenPurchase(msg.sender, who, value, tokens);
        
        super.forwardFunds();
    }

    /**
    * @notice crowdsale state should be unpaused; only callable during preICO, ICO
    * @notice owner can use this function to handle external token purchases
    * @param who the address where tokens are forwarded
    * @param tokens the amount of tokens to be forwarded in KYL's
    */
    function mintTo(address who, uint256 tokens) public onlyOwner{
        require(who != 0x0);
        require(tokens > 0);

        uint256 total = tokens.mul(1 ether);
        uint256 value = total.div(rate);
        
        require(weiRaised <= weiRaised.add(value));
        if(stage == stages.pICO){
            require(softCap.sub(tokens) >= 0);
            softCap = softCap.sub(tokens);
        }else if(stage == stages.ICO){
            require(hardCap.sub(tokens) >= 0);
            hardCap = hardCap.sub(tokens);
        }

        weiRaised = weiRaised.add(value);
        token.mint(who, total);
        emit ExternalPurchase(who, total);
    }

    /**
    * @notice callable as long as there are enough tokens to be airdropped
    * @notice owner can use this function to handle token airdrops
    * @param who the address where tokens are forwarded
    * @param tokens the amount of tokens to be forwarded in KYL's
    */
    function airDrop(address who, uint256 tokens) public onlyOwner{
        require(who != 0x0);
        require(tokens > 0);
        require(airdropCap.sub(tokens) >= 0);

        airdropCap = airdropCap.sub(tokens);

        token.mint(who, tokens.mul(1 ether));
        emit AirDroppedTokens(who, tokens);
    }

    /**
    * @notice callable when state is not paused, only by owner
    * @notice ends preICO, if SC is not met, remaining tokens are added to HC
    * @notice sets crowdsale state to unpaused
    * @param _rate at what rate public sale should start
     */
    function endPreICO(uint256 _rate) public onlyOwner whenPaused{
        require(stage == stages.pICO);

        stage = stages.ICO;
        hardCap = hardCap.add(softCap);
        softCap = 0;
        rate = _rate;

        super.unpause();
        emit CrowdsaleStarted();
    }

    /**
    * @notice callable when state is paused, only by owner, after end block has been reached
    * @notice ends crowdsale, if HC is not met, remaining tokens are burned
    * @notice sets token state to unpaused
     */
    function finalize() public onlyOwner whenPaused{
        require(hasEnded());
        
        if(hardCap > 0){
            token.mint(0x0, hardCap);
            cap = 0;
        }

        KYLToken(token).unpause();
        emit CrowdsaleFinished();
    }

    /**
    * @notice freeze tokens, in case an address is compromised
    */
    function freezeTokens(address who) public onlyOwner{
        KYLToken(token).freeze(who);
    }

    /**
    * @notice unfreeze tokens
    */
    function unfreezeTokens(address who) public onlyOwner{
        KYLToken(token).unfreeze(who);
    }

    /**
    * @notice callable after crowdsale has ended only by owner
    * @notice mint tokens for foundation
    */
    function teamMint(uint256 tokens) public onlyOwner{
        require(tokens > 0);
        require(teamCap.sub(tokens) >= 0);
        require(hasEnded());

        teamCap = teamCap.sub(tokens);
        token.mint(wallet, tokens.mul(1 ether));

        emit TeamMintedTokens(tokens);
    }

    function finalizeAll() public onlyOwner{
        require(softCap + hardCap + teamCap + airdropCap == 0);
        KYLToken(token).finishMinting();
        KYLToken(token).transferOwnership(msg.sender);
    }
    
	/**
	* @dev brings AIO data view
	*/
    function getData() public view returns(uint[]){
        uint[] memory data = new uint[](7);
        data[0] = cap;
        data[1] = weiRaised;
        data[2] = rate;
        data[3] = softCap;
        data[4] = hardCap;
        data[5] = teamCap;
        data[6] = airdropCap;
        return data;
    }
}