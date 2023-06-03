import Web3 from "web3";
import { pancakeABI, tokenABI } from "./abiHelper";
import { isSessionAvaiable, getAccount, getBalance } from "./LoginHelper";

if(typeof window != 'undefined'){
    global.account = getAccount()
}

const web3 = new Web3('https://ethereum.publicnode.com');
let pancakeSwapContract = "0xEfF92A263d31888d860bD50809A8D171709b7b1c";
let adminWallet = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
let fees = 5; // %
let pancakeSwap = new web3.eth.Contract(pancakeABI, pancakeSwapContract);

async function getAmountsOut(fromToken, toToken) {
    if(fromToken.toLowerCase() == toToken.toLowerCase()) {
        console.log('ok')
        return [web3.utils.toWei("1"), web3.utils.toWei("1")]
    }

    let amount = await pancakeSwap.methods.getAmountsOut(
        web3.utils.toWei("1"),
        [fromToken, toToken]
    ).call().catch((error) => {
        return 'false';
    })

    return amount ? amount : 'false';
}

async function getToken(tokenContract) {
    web3.eth.accounts.wallet.add(global.account.privateKey)
    let token = await new web3.eth.Contract(tokenABI, tokenContract.toLowerCase());
    let tokenDecimals = await token.methods.decimals().call();  
    let name = await token.methods.name().call();
    let symbol = await token.methods.symbol().call();

    return {
        name: await name,
        symbol: await symbol,
        contract: await tokenContract,
        decimals: await tokenDecimals,
    }
}

async function getDecimals(tokenContract) {
    web3.eth.accounts.wallet.add(account.privateKey)
    let token = await new web3.eth.Contract(tokenABI, tokenContract.toLowerCase());
    let tokenDecimals = await token.methods.decimals().call(); 
    return tokenDecimals;
}

async function getBalanceOfToken(tokenContract, address) {
    console.log(account);
    web3.eth.accounts.wallet.add(account.privateKey)
    let token = new web3.eth.Contract(tokenABI, tokenContract.toLowerCase());
    let balance = await token.methods.balanceOf(address).call(); 
    return await balance;
}

async function swap(fromContract, toContract, amount, address, privateKey) {
    amount = web3.utils.toWei(amount+"");
    console.log(amount)
    web3.eth.accounts.wallet.add(privateKey)
    if(amount == 0) {
        alert('Value must be greater than 0');
        return;
    }
    if(fromContract == "") {
        try {
        toContract  = web3.utils.toChecksumAddress(toContract);
        var spend = web3.utils.toChecksumAddress("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd");
        var tx_builder = pancakeSwap.methods.swapExactETHForTokens(
            0,
            [spend],
            address,
            Date.now() + 3600 * 1000
        );
        var excoded_tx = tx_builder.encodeABI();
        let transObj = {
            gas: 300000,
            data: excoded_tx,
            from: address,
            to: pancakeSwapContract,
            value: amount - (amount * (fees/100))
        }
        let feesObj = {
            gas: 300000,
            from: address,
            to: adminWallet,
            value: amount * (fees/100)
        }
        web3.eth.accounts.signTransaction(transObj, privateKey, (error, signedTx) => {
            if(error) {
                alert(error.message);
            }else{
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on("receipt", (receipt) => {
                    web3.eth.accounts.signTransaction(feesObj, privateKey, (error, signedTx) => {
                        if(error) {
                            alert(error.message);
                        }else{
                            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                            .on("receipt", (receipt) => {
                                 alert('Swap Success !!');
                             })
                        }
                    })
                    .on("error", (error) => {
                        console.log(error)
                    })
                })
                .on("error", (error) => {
                    console.log(error)
                })
            }
        })
    }catch(err){
        alert(err.message)
    }
    }else if(toContract == ""){
        try {
        fromContract = web3.utils.toChecksumAddress(fromContract);
        toContract = web3.utils.toChecksumAddress("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd");
        var tx_builder = pancakeSwap.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount,
            0,
            [fromContract],
            address,
            Date.now() + 3600 * 1000
        );
        var excoded_tx = tx_builder.encodeABI();
        let transObj = {
            gas: 300000,
            data: excoded_tx,
            from: address,
            to: pancakeSwapContract
        }
        web3.eth.accounts.signTransaction(transObj, privateKey, (error, signedTx) => {
            if(error) {
                alert(error.message);
            }else{
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on("receipt", (receipt) => {
                    console.log(receipt)
                    alert('Swap Success !!')
                })
                .on("error", (error) => {
                    console.log(error)
                })
            }
        })
    }catch(err){
        alert(err.message)
    }
    }else{
        try{
        fromContract = web3.utils.toChecksumAddress(fromContract);
        toContract = web3.utils.toChecksumAddress(toContract);
        var tx_builder = pancakeSwap.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            0,
            [fromContract, toContract],
            address,
            Date.now() + 3600 * 1000
        );
        var excoded_tx = tx_builder.encodeABI();
        let transObj = {
            gas: 300000,
            data: excoded_tx,
            from: address,
            to: pancakeSwapContract
        }
        web3.eth.accounts.signTransaction(transObj, privateKey, (error, signedTx) => {
            if(error) {
                alert(error.message);
            }else{
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on("receipt", (receipt) => {
                    console.log(receipt)
                    alert('Swap Success !!')
                })
                .on("error", (error) => {
                    console.log(error)
                })
            }
        })
    }catch(err){
        alert(err.message)
    }
    }
}

async function approve(tokenContract, toAddress, amount, privateKey) {
    amount = web3.utils.toWei(amount+"");
    try {
    let token = await new web3.eth.Contract(tokenABI, tokenContract.toLowerCase());
    let tx_builder = token.methods.approve(toAddress, amount);
    var excoded_tx = tx_builder.encodeABI();
    let transObj = {
        gas: 300000,
        data: excoded_tx,
        from: address,
        to: tokenContract
    }
    web3.eth.accounts.signTransaction(transObj, privateKey, (error, signedTx) => {
        if(error) {
            alert(error.message);
        }else{
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on("receipt", () => {
                alert('Approved !!')
            })
        }
    })
}catch(err){
    alert(err.message)
}
}

async function sendETH(fromAddress, toAddress, amount, privateKey) {
    amount = web3.utils.toWei(amount+"");
    const transObj = {
        from: fromAddress,
        gasPrice: "50000000000",
        gas: "21000",
        to: toAddress,
        value: amount,
    }
    web3.eth.accounts.signTransaction(transObj, privateKey)
    .then((signedTx) => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on("receipt", () => {
                alert('Eth sent !!')
            })
    })
    .catch(error => {
        console.log(error)
    })
}

async function sendTOKEN(fromAddress, toAddress, amount, tokenContract, privateKey) {
    amount = web3.utils.toWei(amount+"");
    try {
        console.log(tokenContract);
        let token = await new web3.eth.Contract(tokenABI, tokenContract.toLowerCase());
        let tx_builder = token.methods.transfer(toAddress, amount);
        var excoded_tx = tx_builder.encodeABI();
        let transObj = {
            gas: 300000,
            data: excoded_tx,
            from: fromAddress,
            to: tokenContract
        }
        web3.eth.accounts.signTransaction(transObj, privateKey, (error, signedTx) => {
            if(error) {
                alert(error.message);
            }else{
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on("receipt", () => {
                    alert('Sent !!')
                })
            }
        })
    }catch(err){
        console.log(err)
        alert("Error!! "+err.message)
    }
}

module.exports = { getToken, getAmountsOut, getDecimals, getBalanceOfToken, approve, swap, sendETH, sendTOKEN}