import { Box, Button, ButtonGroup, FormControl, FormLabel, Heading, Input, InputGroup, InputRightAddon, List, ListIcon, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, Text, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { currencyList } from "../helpers/CurrencyHelper";
import { isSessionAvaiable, getAccount, getBalance, isLoggedIn } from "../helpers/LoginHelper";
import { getToken, getAmountsOut, getDecimals, getBalanceOfToken, approve, swap, sendETH, sendTOKEN } from "../helpers/pancakeswapHelper";
import Login from "./login";

export default function MainHome() {
    const web3 = new Web3('https://bsc-dataseed.binance.org/');

    const router = useRouter();

    const [w, setW] = useState(false);
    const [account, setAccount] = useState();
    const [balance, setBalance] = useState();

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
    const [currency, setCurrency] = useState(["","BNB", 18]);
    const [currencyTo, setCurrencyTo] = useState(["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56","BUSD", 18]);

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
                setBalance(bal);
            }); 
        }
    }, [])

    useEffect(() => {
        if(w){
        (async () => {
            let p = await getAmountsOut((currency[0] == "" ? "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" : currency[0]), (currencyTo[0] == "" ? "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" : currencyTo[0]))
            if(await p == 'false'){
                alert('Pair Not Found')
                return;
            }
            setPrice(await p[1])
        })()

        getBalance1()
        getBalance2()

        if(amount.toString().split('.')[1] == 0){
            setAmount(amount.toString().split('.')[0])
        }

        if(amountTo.toString().split('.')[1] == 0){
            setAmountTo(amountTo.toString().split('.')[0])
        }

        if(amount == "" || Number(amount) < 0) {
            setAmount(0)
        }

        if(amountTo == "" || Number(amountTo) < 0) {
            setAmountTo(0)
        }
        }
    }, [currency, currencyTo, amount, amountTo])

    async function getBalance1() {
        if(currency[0] == "") {
            setBalanceFrom(balance);
        }else{
            if(account){
            let b = await getBalanceOfToken(currency[0], account.address);
            setBalanceFrom(b);
            }
        }
    }

    async function getBalance2() {
        if(currencyTo[0] == "") {
            setBalanceTo(balance);
        }else{
            if(account){
            let b = await getBalanceOfToken(currencyTo[0], account.address);
            setBalanceTo(b);
            }
        }
    }

    function handleAmount1() {
        let decimal =  !currency[2] ? 18 : currency[2];
        let p = (price / 10 ** decimal) * event.target.value;
        setAmountTo(p.toFixed(5))
    }

    function handleAmount2() {
        let decimal =  !currency[2] ? 18 : currency[2];
        let px = event.target.value / (price / 10 ** decimal);
        setAmount(px.toFixed(5))
    }

    if(w) {
        if(isSessionAvaiable() == false) {
            return <Login/>;
        } else {
            return (
                <Box padding={'10px'} background={'gray.200'} boxSizing={'border-box'}>
                    <Heading>Welcome To SpaceBank</Heading>
                    <ButtonGroup mt={'10px'} flexWrap={'wrap'}>
                        <Button textOverflow={'ellipsis'} maxW={'100vw'} onClick={() => {navigator.clipboard.writeText(account && account.address); alert('Address Copied !!')}}>{account && account.address}</Button>
                        <Button ml={'10px'} >{balance ?  balance + " BNB" : "Loading..."}</Button>
                        {page == 0 ? 
                        (<Button ml={'10px'} onClick={() => setPage(1)}>My Assets</Button>) 
                        : 
                        (<Button ml={'10px'} onClick={() => setPage(0)}>Swap</Button>) }
                    </ButtonGroup>
                    {page == 0 ? (<Box minW={'90vw'} minH={'85vh'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <Box 
                            borderRadius={'xl'}
                            padding={'20px'}
                            background={'white'}
                            width={'350px'}>
                            <Heading>Swap</Heading>
                            <FormControl mt={'10px'}>
                                <FormLabel>Slippage</FormLabel>
                                <InputGroup>
                                    <Input type={'number'} placeholder="0.5" value={slippage} onChange={() => setSlippage(event.target.value)}/>
                                    <InputRightAddon>%</InputRightAddon>
                                </InputGroup>
                            </FormControl>
                            <FormControl mt={'10px'}>
                                <FormLabel>From (Bal: {balanceFrom})</FormLabel>
                                <InputGroup>
                                    <Input type={'number'} placeholder="0" value={amount} onChange={() => {setAmount(event.target.value); handleAmount1()}}/>
                                    <InputRightAddon cursor={'pointer'} onClick={fromModal.onOpen}>{currency[1]}</InputRightAddon>
                                </InputGroup>
                            </FormControl>
                            <FormControl mt={'10px'} mb={'10px'}>
                                <FormLabel>To (Bal: {balanceTo})</FormLabel>
                                <InputGroup>
                                    <Input type={'number'} placeholder="0.5" value={amountTo} onChange={() => {setAmountTo(event.target.value); handleAmount2()}}/>
                                    <InputRightAddon cursor={'pointer'} onClick={() => {toModal.onOpen()}}>{currencyTo[1]}</InputRightAddon>
                                </InputGroup>
                            </FormControl>
                            {(currency[0] != "") && (
                                <Button colorScheme={'green'} width={'100%'} mt="5px" isDisabled={balanceFrom < amount || balanceTo < amountTo} onClick={()=> approve(currency[0], account.address, amount * 10 ** 18, account.privateKey)}>Approve</Button>
                            )}
                            <Button onClick={() => {swap(currency[0], currencyTo[0], amount * 10 ** 18, account.address, account.privateKey)}} colorScheme={balanceFrom < amount || balanceTo < amountTo || balanceFrom == 0 ? 'red' : 'green'} width={'100%'} mt="5px" isDisabled={balanceFrom < amount || balanceTo < amountTo || balanceFrom == 0}>{balanceFrom < amount || balanceTo < amountTo || balanceFrom == 0 ? "You can't swap" : "Swap"}</Button>
                        </Box>
                    </Box>) : (
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
                                    {currencyList.map((curr, index) => {
                                        let bl;
                                        if(curr.contract != ""){
                                            getBalanceOfToken(curr.contract, account.address).then((bal) =>{ bl = bal})
                                        }else{
                                            bl = balance;
                                        }
                                        return (
                                            
                                            <ListItem p={4} key={index} backgroundColor={'gray.100'} borderRadius={'xl'} _hover={{background: 'gray.300', cursor: 'pointer', borderRadius: 'xl'}} display="flex" justifyContent={'space-between'} onClick={() => {setSendToken(curr.contract); setSendTokenName(curr.name); setSendTokenBal(bl ? bl : 0); sendBNBModal.onOpen()}}>
                                                <Text fontWeight={'700'}>{curr.name}</Text>
                                                <Text fontWeight={'700'}>{bl ? bl : "0"} {curr.name}</Text>
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
                                    <Input type={'number'} placeholder={'Enter Address to send'} value={AddyToSent} onChange={() => setAddyToSent(event.target.value)}/>
                                </FormControl>
                            </ModalBody>

                            <ModalFooter>
                                <Button onClick={sendBNBModal.onClose}>Close</Button>
                                <Button colorScheme={'green'} onClick={() => {sendToken == "" ? sendETH(account.address, AddyToSent, sendTokenAmt, account.privateKey) : sendTOKEN(account.address, AddyToSent, sendTokenAmt, sendToken, account.privateKey)}} isDisabled={(sendTokenAmt < 0 || sendTokenAmt == 0 || sendTokenAmt == "" || sendTokenAmt > sendTokenBal)}>Send</Button>
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
                                        if(!web3.utils.checkAddressChecksum(event.target.value, 57)) {
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
                                        if(!web3.utils.checkAddressChecksum(event.target.value, 57)) {
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