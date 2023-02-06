import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, FormControl, Heading, Input, Progress, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createAccount, isLoggedIn } from "../helpers/LoginHelper";

export default function newAccount() {
    const [account, setAccount] = useState();
    const [password, setPassword] = useState("");
    const [error, setError] = useState();
    const [part, setPart] = useState(1);

    const router = useRouter()

    function handleNext1() {
        if(password.length < 8) {
            setError("Password must be greater than 8 letters.");
        }else{
            let acc = createAccount();
            setAccount(acc);
            setPart(2);
        }
    }

    function handleNext2() {
        localStorage.setItem("account", JSON.stringify(account));
        localStorage.setItem("password", password);
        router.push('/home')
    }

    useEffect(() => {
        var isLoggedin = isLoggedIn();
        console.log(isLoggedin)
        if(isLoggedin) {
            router.push('/home');
        }
    }, [])

    if(part == 1){
        return (
            <Box 
                display={'flex'}
                justifyContent={'center'}
                minH={'100vh'}
                alignItems={'center'}
                background={'gray.200'}>

                <Box
                    borderRadius={'xl'}
                    padding={'20px'}
                    background={'white'}
                    width={'350px'}>
                    <Progress colorScheme='green' size='sm' value={33} borderRadius={'md'}/>
                    <Heading mt={'20px'}>Account Creation</Heading>
                    <Text color={'gray.700'}>Create Password...</Text>
                    {error && <Alert status="error" borderRadius={'md'} margin={'10px 0px 5px 0px'} maxW={'310px'}>
                        <AlertIcon/>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>}
                    <FormControl>
                        <Input type={'password'} placeholder="Password..." mt={4} mb={4} value={password} onChange={() => setPassword(event.target.value)}/>
                    </FormControl>
                    <Button colorScheme={'green'} width={'100%'} mt={'5px'} onClick={handleNext1}>Next</Button>
                </Box>
            </Box>
        )
    }

    if(part == 2){
        return (
            <Box 
                display={'flex'}
                justifyContent={'center'}
                minH={'100vh'}
                alignItems={'center'}
                background={'gray.200'}>

                <Box
                    borderRadius={'xl'}
                    padding={'20px'}
                    background={'white'}
                    width={'350px'}>
                    <Progress colorScheme='green' size='sm' value={66} borderRadius={'md'}/>
                    <Heading mt={'20px'}>Account Creation</Heading>
                    <Text color={'gray.700'}>Account Generated...</Text>
                    <Box padding={'10px'} background={'gray.200'} margin={'20px 0px 0px 0px'} borderRadius={'md'}>{account && account.privateKey}</Box>
                    <Text color={'gray.700'}>Copy the secret pharse and save it somewhere...</Text>
                    <Button colorScheme={'green'} width={'100%'} mt={'10px'} onClick={handleNext2}>Next</Button>
                </Box>
            </Box>
        )
    }
}