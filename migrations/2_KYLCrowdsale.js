var KYLCrowdsale = artifacts.require('./contracts/KYLCrowdsale.sol');

module.exports = function(deployer){
    deployer.then(async () =>{
        const startBlock = web3.eth.getBlock("latest").number + 1;
        const endBlock = startBlock + 20;
        const fixRate = 1694;
        const cap = 38350;
        const wallet = "0x352039187ea40cecde81789b8657f09a4f9031f8";
            
        return deployer.deploy(KYLCrowdsale, startBlock, endBlock, fixRate, cap, wallet);
    });   
}