var KYLToken = artifacts.require('KYLToken');
var KYLCrowdsale = artifacts.require('KYLCrowdsale');

async function getToken(ins){
    const token = await ins.token.call();
    return KYLToken.at(token);
}

contract('KYLCrowdsale', (accounts) =>{

    const preInvestor = accounts[1];
    const pubInvestor = accounts[2];
    const extInvestor = accounts[3];
    const airDropAddr = accounts[4];
    const pbextInvestor = accounts[5];
    const blackInvestor = accounts[6];
    const KYLTokensUser = accounts[7];

    it('should deploy crowdsale and token contract', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            const token = await ins.token.call();
            assert(token, 'Token address not stored');
            done();
        });
    });

    it('should be preico stage', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            const stage = await ins.stage.call();
            assert(stage, 0, 'PreICO');
            done();
        });
    });

    it('shouldnt be able to buy at PreICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            const opt = {
                from: pubInvestor, 
                value: web3.toWei(10, 'ether')
            }
            await ins.buyTokens(pubInvestor, opt);
        }).catch(() => {
            done();
        })
    });

    it('should be added to whitelist', (done) =>{         
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.addToWhitelist(preInvestor);
            const is_in = await ins.isWhitelisted(preInvestor);
            assert.equal(is_in, true, 'Can´t be whitelisted');
            done();
        });
    });

    it('should be able to buy at PreICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            const opt = {
                from: preInvestor, 
                value: web3.toWei(10, 'ether')
            }
            await ins.buyTokens(preInvestor, opt);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(preInvestor);
            assert.equal(amount.toNumber() / (10 ** 18), 16940, 'Cannot buy tokens');

            const raised = await ins.weiRaised.call();
            assert.equal(raised.toNumber() / (10 ** 18), 10, 'Wei raised mismatch');

            done();
        });
    });

    it('should be able to mint tokens at PreICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.mintTo(extInvestor, 25000);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(extInvestor);
            assert.equal(Math.ceil(amount.toNumber() / (10 ** 18)), 25000, 'Cannot buy tokens');

            const raised = await ins.weiRaised.call();
            assert.equal(Math.ceil(raised.toNumber() / (10 ** 18)), 25, 'Wei raised mismatch');
            done();
        });
    });

    it('should be able to airdrop tokens (external buy) at PreICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.airDrop(airDropAddr, 50000);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(airDropAddr);
            assert.equal(Math.ceil(amount.toNumber() / (10 ** 18)), 50000, 'Cannot buy tokens');
            
            const raised = await ins.airdropCap.call();
            assert.equal(raised.toNumber(), 4950000, 'AirDropped tokens mismatch');

            done();
        });
    });

    it('should be paused', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.pause();
            const paused = await ins.paused.call();
            assert.equal(paused, true, 'Cannot pause');
            done();
        });
    });

    it('should reset current rate', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.setRate(1500);
            const rate = await ins.rate.call();
            assert.equal(rate, 1500, 'Cannot change rate');
            done();
        });
    });

    it('should be unpaused', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.unpause();
            const paused = await ins.paused.call();
            assert.equal(paused, false, 'Cannot unpause');
            done();
        });
    });

    it('should be able to mint remaining tokens at PreICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.mintTo(extInvestor, 13237500);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(extInvestor);
            assert.equal(Math.ceil(amount.toNumber() / (10 ** 18)), 13262500, 'Cannot buy tokens');

            const raised = await ins.weiRaised.call();
            assert.equal(Math.ceil(raised.toNumber() / (10 ** 18)), 8850, 'Wei raised mismatch');

            done();
        });
    });

    it('should be paused', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.pause();
            const paused = await ins.paused.call();
            assert.equal(paused, true, 'Cannot pause');
            done();
        });
    });

    it('should set next stage and be unpaused', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.endPreICO(1500);
            const stage = await ins.stage.call();
            assert.equal(stage, 1, 'Is not ICO');
            done();
        });
    });

    it('should be able to buy at Public ICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.buyTokens(pubInvestor, {from: pubInvestor, value: web3.toWei(10, 'ether')});

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(pubInvestor);
            assert.equal(amount.toNumber() / (10 ** 18), 15000, 'Cannot buy tokens');

            done();
        });
    });

    it('should be able to mint at Public ICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.mintTo(pubInvestor, 985000);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(extInvestor);
            assert.equal(Math.ceil(amount.toNumber() / (10 ** 18)), 13262500, 'Cannot mint tokens');

            done();
        });
    });

    it('should be able to buy externally at Public ICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.mintTo(pbextInvestor, 48000000);
            await ins.mintTo(blackInvestor, 500000);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf(pbextInvestor);
            assert.equal(amount.toNumber() / (10 ** 18), 48000000, 'Cannot buy tokens');

            done();
        });
    });

    it('should be paused', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.pause();
            const paused = await ins.paused.call();
            assert.equal(paused, true, 'Cannot pause');
            done();
        });
    });

    it('should be able to close Public ICO', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.finalize();

            const kylToken = await getToken(ins);
            const status = await kylToken.paused.call();
            assert.equal(status, false, 'Cannot finish');
            
            done();
        });
    });

    it('should be able to transfer tokens after end', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{

            const kylToken = await getToken(ins);
            await kylToken.transfer(blackInvestor, 500000, {from: pubInvestor});

            const amount = await kylToken.balanceOf(blackInvestor);
            assert.equal(amount.toNumber() / (10 ** 18), 500000, 'Cannot buy tokens');

            done();
        });
    });

    it('should be able to freeze tokens', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.freezeTokens(blackInvestor);
            done();
        });
    });

    it('shouldnt be able to transfer tokens', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            const kylToken = await getToken(ins);
            await kylToken.transfer(KYLTokensUser, 500000, {from: blackInvestor});
        }).catch(() =>{
            done();
        });
    });

    it('should be able to team mint', (done) =>{
        KYLCrowdsale.deployed().then(async (ins) =>{
            await ins.teamMint(30000000);

            const kylToken = await getToken(ins);
            const amount = await kylToken.balanceOf("0x352039187ea40cecde81789b8657f09a4f9031f8");
            assert.equal(amount.toNumber() / (10 ** 18), 30000000, 'Cannot buy tokens');
            
            done();
        });
    });

});

