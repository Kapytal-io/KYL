var KYLCrowdsale = artifacts.require('./contracts/KYLCrowdsale.sol');

module.exports = function(deployer){
    web3.eth.getBlock("latest", function(err, res) {
        if (err) { return reject(err) }
        else{
            const startBlock = res.number + 1;
            const endBlock = startBlock + 20;
            const fixRate = 1694;
            const cap = 38350;
            const wallet = "0x352039187ea40cecde81789b8657f09a4f9031f8";
            
            deployer.deploy(KYLCrowdsale, startBlock, endBlock, fixRate, cap, wallet);
        }
    });   
}