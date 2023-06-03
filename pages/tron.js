import { Box, Button, ButtonGroup, FormControl, FormLabel, Select, Heading, Input, InputGroup, InputRightAddon, List, ListIcon, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, Text, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { tokenABI } from "../helpers/abiHelper";
import { isSessionAvaiable, getAccount, getBalance, isLoggedIn } from "../helpers/LoginHelper";
import { getToken, getAmountsOut, getDecimals, getBalanceOfToken, approve, swap } from "../helpers/pancakeswapHelper";
import Login from "./login";
const TronWeb = require('tronweb');

export default function Tron() {
    const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');

    const router = useRouter();

    const [w, setW] = useState(false);
    const [account, setAccount] = useState();
    const [balance, setBalance] = useState();

    const [currencyList, setCurrencyList] = useState([
        {contract: "", name: "Tron"},
        {contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", name: "USDT", decimal: 18},
        {contract: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8", name: "USDC", decimal: 18},
    ])

    const [page, setPage] = useState(1);
    
    const [sendToken, setSendToken] = useState("BNB");
    const [sendTokenName, setSendTokenName] = useState("BNB");
    const [sendTokenBal, setSendTokenBal] = useState(0);

    const [sendTokenAmt, setSendTokenAmt] = useState(0);
    const [AddyToSent, setAddyToSent] = useState("");

    const [slippage, setSlippage] = useState(0.5);
    const [balanceFrom, setBalanceFrom] = useState(0);
    const [balanceTo, setBalanceTo] = useState(0);
    const [amount, setAmount] = useState(0);
    const [amountTo, setAmountTo] = useState(0);
    const [price, setPrice] = useState(0);

    const [tronWeb, setTronweb] = useState();
    const [currency, setCurrency] = useState(["","BNB", 18]);
    const [currencyTo, setCurrencyTo] = useState(["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t","USDT", 18]);

    const [balances, setBalances] = useState([]);

    //modal
    const fromModal = useDisclosure()
    const toModal = useDisclosure()
    const sendBNBModal = useDisclosure()

    useEffect(() => {
        setW(true); 
        const isLoggedin = isLoggedIn();
        if(!isLoggedin) {
            router.push('/newAccount');
        }else{
            if(!localStorage.getItem('tron')){
                var data = TronWeb.utils.accounts.generateAccount();
                localStorage.setItem('tron', JSON.stringify(data));
                var privateKey = data.privateKey;
            }else{
                var data = JSON.parse(localStorage.getItem('tron'));
                var privateKey = data.privateKey;
            }
            setAccount({
                privateKey: privateKey,
                address: data.address.base58
            })
            const tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',
            headers: { "TRON-PRO-API-KEY": '999ba646-398f-4edc-9a68-4f0b61799675' },
            privateKey: privateKey
            })
            setTronweb(tronWeb);
            tronWeb.trx.getBalance(data.address.base58)
            .then(result => {
                setBalance(result / 6 * 10 ** 18)
            })
        }
    }, [])

    async function getAllBalances() {
        if(w) {
            let map = [];
            for(let i = 0; i < currencyList.length; i++){
                if(currencyList[i].contract == ""){
                    map.push(Number(balance))
                }else{
                    let instance = await tronWeb.contract(tokenABI, currencyList[i].contract);
                    let res = await instance.balanceOf(account.address).call();
                    console.log(res)
                    map.push(Number(res));
                }
            }
            return map;
        }
    }


    useEffect(() => {
        const interval = setInterval(() => {
        getAllBalances()
        .then((data) => {
            console.log(data)
            setBalances(data);
        })
    }, 3000);
    return () => clearInterval(interval);
    })

    async function sendETH(from, to, amount) {
        amount = tronWeb.fromSun(amount+"");
        try {
        let data = await tronWeb.transactionBuilder.sendTrx(to, amount, from);
        console.log(data)
        }catch(error){
            alert(error);
        }
    }

    async function sendTOKEN(from, to, amount, tokenContract) {
        amount = tronWeb.toSun(amount+"");
        try {
            let instance = await tronWeb.contract(tokenABI, tokenContract);
            const hash = await instance.transfer(to, amount).send();
            console.log(hash)
            alert('Token Sent !!')
        }catch(error){
            console.log(error)
            alert(error.message);
        }
    }

    if(w) {
        if(isSessionAvaiable() == false) {
            return <Login/>;
        } else {
            return (
                <Box padding={'10px'} background={'gray.200'} boxSizing={'border-box'}>
                    <Heading>Welcome To SpaceBank (TRX)</Heading>
                    <ButtonGroup mt={'10px'} flexWrap={'wrap'}>
                        <Button textOverflow={'ellipsis'} maxW={'100vw'} onClick={() => {navigator.clipboard.writeText(account && account.address); alert('Address Copied !!')}}>{account && account.address}</Button>
                        <Button ml={'10px'} >{balance + " TRX"}</Button>
                        <Button onClick={() => router.push('/home')}>BNB Chain</Button>
                    </ButtonGroup>
                    {page == 0 ? (<></>) : (
                        <Box mt="30px">
                            <Heading>Your Assets</Heading>
                            <List spacing={3} mt={4}>
                                    {balances && currencyList.map((curr, index) => {
                                        let bal = balances[index];
                                        return (
                                                <ListItem p={4} key={index} backgroundColor={'gray.100'} borderRadius={'xl'} _hover={{background: 'gray.300', cursor: 'pointer', borderRadius: 'xl'}} display="flex" justifyContent={'space-between'} onClick={() => {setSendToken(curr.contract); setSendTokenName(curr.name); setSendTokenBal(balances[index] ? balances[index] : 0); sendBNBModal.onOpen()}}>
                                                    <Text fontWeight={'700'}>{curr.name}</Text>
                                                    <Text fontWeight={'700'}>{bal ? bal : 0} {curr.name}</Text>
                                                </ListItem>
                                            )
                                    })}
                                </List>
                        </Box>
                    )}

                    <Modal isOpen={sendBNBModal.isOpen} onClose={sendBNBModal.onClose}>
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>Send Token</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody pb={6}>
                                <Text>Balanace: {sendTokenBal} {sendTokenName}</Text>
                                <FormControl>
                                    <FormLabel>Amount</FormLabel>
                                    <Input type={'number'} placeholder={'Enter BNB amount'} value={sendTokenAmt} onChange={() => setSendTokenAmt(event.target.value == "" ? 0 : event.target.value)}/>
                                </FormControl>
                                <FormControl mt={2}>
                                    <FormLabel>Address</FormLabel>
                                    <Input type={'text'} placeholder={'Enter Address to send'} value={AddyToSent} onChange={() => setAddyToSent(event.target.value)}/>
                                </FormControl>
                            </ModalBody>

                            <ModalFooter>
                                <Button onClick={sendBNBModal.onClose}>Close</Button>
                                <Button colorScheme={'green'} onClick={() => {sendToken == "" ? sendETH(account.address, AddyToSent, sendTokenAmt, account.privateKey) : sendTOKEN(account.address, AddyToSent, sendTokenAmt, sendToken, account.privateKey)}}>Send</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>


                    <Modal isOpen={fromModal.isOpen} onClose={fromModal.onClose}>
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>From Token</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody pb={6}>
                                <FormControl>
                                    <FormLabel>Search</FormLabel>
                                    <Input type={'text'} placeholder={'Enter any contract'} onInput={async () => {
                                        event.target.value = web3.utils.toHex(event.target.value)
                                        if(!event.target.value || event.target.value == 'undefined' || event.target.value == "" || !web3.utils.isHex(event.target.value) || !web3.utils.isAddress(event.target.value, 97) || web3.eth.getCode(event.target.value) == "0x"){
                                            return;
                                        }
                                        if(!web3.utils.checkAddressChecksum(event.target.value, 96)) {
                                            event.target.value = web3.utils.toChecksumAddress(event.target.value);
                                        } 
                                        try {
                                            var token = await getToken(event.target.value);
                                            currencyList.push(await token);
                                            setCurrency([await token.contract, await token.symbol, await token.decimal]);
                                            fromModal.onClose();
                                            console.log(await token)
                                        }catch(err){
                                            alert("invalid token")
                                        }
                                    }}/>
                                </FormControl>
                                <List spacing={3} mt={4}>
                                    {currencyList.map((curr, index) => {
                                        if(curr.contract == currency[0] || curr.contract == currencyTo[0]) {
                                            return null;
                                        }else{
                                            return (
                                                <ListItem p={4} key={index} backgroundColor={'gray.100'} borderRadius={'xl'} _hover={{background: 'gray.300', cursor: 'pointer', borderRadius: 'xl'}} onClick={() => {setCurrency([curr.contract, curr.name]); fromModal.onClose();}}>
                                                    <Text fontWeight={'700'}>{curr.name}</Text>
                                                </ListItem>
                                            )
                                        }
                                    })}
                                </List>
                            </ModalBody>

                            <ModalFooter>
                                <Button onClick={fromModal.onClose}>Close</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal isOpen={toModal.isOpen} onClose={toModal.onClose}>
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>To Token</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody pb={6}>
                                <FormControl>
                                    <FormLabel>Search</FormLabel>
                                    <Input type={'text'} placeholder={'Enter any contract'} onInput={async () => {
                                        event.target.value = web3.utils.toHex(event.target.value)
                                        if(!event.target.value || event.target.value == 'undefined' || event.target.value == "" || !web3.utils.isHex(event.target.value) || !web3.utils.isAddress(event.target.value, 97) || web3.eth.getCode(event.target.value) == "0x"){
                                            return;
                                        }
                                        if(!web3.utils.checkAddressChecksum(event.target.value, 96)) {
                                            event.target.value = web3.utils.toChecksumAddress(event.target.value);
                                        } 
                                        try {
                                            var token = await getToken(event.target.value);
                                            currencyList.push(await token);
                                            setCurrencyTo([await token.contract, await token.symbol, await token.decimal]);
                                            toModal.onClose();
                                            console.log(await token)
                                        }catch(err){
                                            alert("invalid token")
                                        }
                                    }}/>
                                </FormControl>
                                <List spacing={3} mt={4}>
                                    {currencyList.map((curr, index) => {
                                        if(curr.contract == currency[0] || curr.contract == currencyTo[0]) {
                                            return null;
                                        }else{
                                            return (
                                                <ListItem p={4} backgroundColor={'gray.100'} borderRadius={'xl'} _hover={{background: 'gray.300', cursor: 'pointer', borderRadius: 'xl'}} onClick={() => {setCurrencyTo([curr.contract, curr.name, curr.decimal]); toModal.onClose();}}>
                                                    <Text fontWeight={'700'}>{curr.name}</Text>
                                                </ListItem>
                                            )
                                        }
                                    })}
                                </List>
                            </ModalBody>

                            <ModalFooter>
                                <Button onClick={toModal.onClose}>Close</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Box>
            );
        }
    }
}