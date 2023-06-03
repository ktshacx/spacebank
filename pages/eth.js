import { Box, Button, ButtonGroup, FormControl, FormLabel, Select, Heading, Input, InputGroup, InputRightAddon, List, ListIcon, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, Text, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { tokenABI } from "../helpers/abiHelper";
import { isSessionAvaiable, getAccount, getBalance, isLoggedIn } from "../helpers/LoginHelper";
import { getToken, getAmountsOut, getDecimals, getBalanceOfToken, approve, swap, sendETH, sendTOKEN } from "../helpers/ethHelper";
import Login from "./login";

export default function MainHome() {
    const web3 = new Web3('https://ethereum.publicnode.com');

    const router = useRouter();

    const [w, setW] = useState(false);
    const [account, setAccount] = useState();
    const [balance, setBalance] = useState();

    const [page, setPage] = useState(1);
    
    const [sendToken, setSendToken] = useState("ETH");
    const [sendTokenName, setSendTokenName] = useState("ETH");
    const [sendTokenBal, setSendTokenBal] = useState(0);

    const [sendTokenAmt, setSendTokenAmt] = useState(0);
    const [AddyToSent, setAddyToSent] = useState("");

    const [slippage, setSlippage] = useState(0.5);
    const [balanceFrom, setBalanceFrom] = useState(0);
    const [balanceTo, setBalanceTo] = useState(0);
    const [amount, setAmount] = useState(0);
    const [amountTo, setAmountTo] = useState(0);
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState(["","ETH", 18]);
    const [currencyTo, setCurrencyTo] = useState(["0xdAC17F958D2ee523a2206206994597C13D831ec7","BUSD", 18]);

    const [balances, setBalances] = useState([]);

    const [currencyList, setCurrencyList] = useState([
        {contract: "", name: "ETH"},
        {contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", name: "USDT", decimal: 18},
        {contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", name: "USDC", decimal: 18},
    ])

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
            setAccount(getAccount()); 
            getBalance().then((bal) => {
                setBalance(bal / 10 ** 18);
            });
        }
    }, [])

    useEffect(() => {
        if(w){
        getBalance1()
        getBalance2()
        }
    }, [currency, currencyTo, amount, amountTo])

    async function getBalance1() {
        if(currency[0] == "") {
            setBalanceFrom(balance);
        }else{
            if(account){
            let b = await getBalanceOfToken(currency[0], account.address);
            setBalanceFrom(b / 10 ** 18);
            }
        }
    }

    async function getBalance2() {
        if(currencyTo[0] == "") {
            setBalanceTo(balance);
        }else{
            if(account){
            let b = await getBalanceOfToken(currencyTo[0], account.address);
            setBalanceTo(b / 10 ** 18);
            }
        }
    }

    function handleAmount1(amount) {
        setAmount(amount)
        let decimal =  !currency[2] ? 18 : currency[2];
        let p = (price / 10 ** decimal) * amount;
        setAmountTo(p.toFixed(5))
    }

    function handleAmount2(amount) {
        setAmountTo(amount)
        let decimal =  !currency[2] ? 18 : currency[2];
        let px = amount / (price / 10 ** decimal);
        setAmount(px.toFixed(5))
    }

    async function getAllBalances() {
        if(w) {
            let map = [];
            for(let i = 0; i < currencyList.length; i++){
                if(currencyList[i].contract == ""){
                    map.push(Number(balance))
                }else{
                    map.push(Number(await getBalanceOfToken(currencyList[i]?.contract, account?.address)) / 10 ** 18);
                }
            }
            return map;
        }
    }

    useEffect(() => {
        getAllBalances()
        .then((data) => {
            console.log(data)
            setBalances(data);
        })
    })

    if(w) {
        if(isSessionAvaiable() == false) {
            return <Login/>;
        } else {
            return (
                <Box padding={'10px'} background={'gray.200'} boxSizing={'border-box'}>
                    <Heading>Welcome To SpaceBank</Heading>
                    <ButtonGroup mt={'10px'} flexWrap={'wrap'}>
                        <Button textOverflow={'ellipsis'} maxW={'100vw'} onClick={() => {navigator.clipboard.writeText(account && account.address); alert('Address Copied !!')}}>{account && account.address}</Button>
                        <Button ml={'10px'} >{ balance + " ETH"}</Button>
                        <Button ml={'10px'} onClick={() => router.push('/tron')}>Tron Chain</Button>
                    </ButtonGroup>
                    {page == 0 ? (<></>) : (
                        <Box mt="30px">
                            <Heading>Your Assets</Heading>
                            <FormControl>
                                    <FormLabel>Search</FormLabel>
                                    <Input type={'text'} placeholder={'Enter any contract'} onInput={async () => {
                                        event.target.value = web3.utils.toHex(event.target.value)
                                        if(!event.target.value || event.target.value == 'undefined' || event.target.value == "" || !web3.utils.isHex(event.target.value) || !web3.utils.isAddress(event.target.value, 97) || web3.eth.getCode(event.target.value) == "0x"){
                                            return;
                                        }
                                        if(!web3.utils.checkAddressChecksum(event.target.value, 57)) {
                                            event.target.value = web3.utils.toChecksumAddress(event.target.value);
                                        } 
                                        try {
                                            var token = await getToken(event.target.value);
                                            currencyList.push(await token);
                                        }catch(err){
                                            alert("invalid token")
                                        }
                                    }}/>
                                </FormControl>
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
                                <Button colorScheme={'green'} onClick={() => {sendToken == "" ? sendETH(account.address, AddyToSent, sendTokenAmt, account.privateKey) : sendTOKEN(account.address, AddyToSent, sendTokenAmt, sendToken, account.privateKey)}} isDisabled={(AddyToSent == "" || !AddyToSent || sendTokenAmt < 0 || sendTokenAmt == 0 || sendTokenAmt == "" || sendTokenAmt > sendTokenBal)}>Send</Button>
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