import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import { createAccount } from '../helpers/LoginHelper';
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter();

  return (
    <Box
      display={'flex'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      minH={'100vh'}>
      <Heading>Hello, Welcome to SpaceBank</Heading>
      <ButtonGroup marginTop={4}>
        <Button colorScheme={'blue'} onClick={() => router.push('/newAccount')}>Create New Account</Button>
        <Button colorScheme={'gray'} onClick={() => router.push('/home')}>Login With Existing Account</Button>
      </ButtonGroup>
    </Box>
  )
}
