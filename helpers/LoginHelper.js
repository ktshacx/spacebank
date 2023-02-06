import Web3 from "web3"
import { reactLocalStorage } from 'reactjs-localstorage';

const web3 = new Web3('https://bsc-dataseed.binance.org/')

function createAccount() {
    return(web3.eth.accounts.create())
}

function isLoggedIn() {
    if(reactLocalStorage.get('account') == undefined || reactLocalStorage.get('account') == 'undefined' || reactLocalStorage.get('account') == "") {
        return false;
    }else if(reactLocalStorage.get('account') == undefined || reactLocalStorage.get('password') == 'undefined' || reactLocalStorage.get('password') == "") {
        return false;
    }else{
        return true;
    }
}

function isSessionAvaiable() {
    if(reactLocalStorage.get('loggedin') == undefined || reactLocalStorage.get('loggedin') == 'undefined' || reactLocalStorage.get('loggedin') == "" || reactLocalStorage.get('loggedin') < Date.now()) {
        return false;
    }else{
        return true;
    }
}

function getPassword() {
    return reactLocalStorage.get("password");
}

function addLoginSession() {
    reactLocalStorage.set("loggedin", Date.now() + 2 * 3600 * 1000 + "");
}

function getAccount() {
    if(reactLocalStorage.get('account') == undefined || reactLocalStorage.get('loggedin') == null || reactLocalStorage.get('account') == ""){
        return null;
    }else{
        return JSON.parse(reactLocalStorage.get('account'));
    }
}

async function getBalance() {
    var account = await getAccount();
    if(account) {
        return await web3.eth.getBalance(account['address']);
    }else{
        return 0;
    }
}

function getAssets() {
    return JSON.parse(reactLocalStorage.get('assets'));
}

module.exports = {
    createAccount: createAccount,
    isLoggedIn: isLoggedIn,
    isSessionAvaiable: isSessionAvaiable,
    getPassword: getPassword,
    addLoginSession: addLoginSession,
    getAccount:getAccount,
    getBalance: getBalance
}