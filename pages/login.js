import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, FormControl, Heading, Input, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { getPassword, addLoginSession } from '../helpers/LoginHelper';

export default function Login() {
    const [error, setError] = useState();
    const [password, setPassword] = useState();
    const router = useRouter();

    function login() {
        if(password == getPassword()) {
            addLoginSession();
            router.reload()
        }else{
            setError("Incorrect Password");
        }
    }

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
                <Heading>Login</Heading>
                <Text color={'gray.700'}>Login to continue...</Text>
                {error && <Alert status="error" borderRadius={'md'} margin={'10px 0px 5px 0px'} maxW={'310px'}>
                    <AlertIcon/>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>}
                <FormControl>
                    <Input type={'password'} placeholder="Password..." mt={4} mb={4} value={password} onChange={() => setPassword(event.target.value)}/>
                </FormControl>
                <Button colorScheme={'green'} width={'100%'} mt={'5px'} onClick={login}>Next</Button>
            </Box>
        </Box>
    )
}