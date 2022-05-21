import './LandingPage.css';
import {useState} from "react";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import ChainAccess from "../../api/chain-access.js";
import PocketCrypto from "../../contracts/PocketCrypto.json";
import AddMeta from "./AddMeta/AddMeta.jsx";
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {

    const [web3, setWeb3] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [connectClicked, setConnectClicked] = useState(false);
    const navigate = useNavigate();

    const connectToMetaMask = async () => {
        
        setConnectClicked(true);
        const provider = await detectEthereumProvider();

        if (provider) {
            // If the provider returned by detectEthereumProvider is not the same as
            // window.ethereum, something is overwriting it, perhaps another wallet.
            if (provider !== window.ethereum) {
            console.error('Do you have multiple wallets installed?');
            }
            // Access the decentralized web!
            try {
            //Request to select account from MetaMask
            const accounts = await provider.request({
                method: "eth_requestAccounts",
            });
            //create web3 instance
            const web3 = new Web3(provider);

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = PocketCrypto.networks[networkId];
                const instance = new web3.eth.Contract(
                    PocketCrypto.abi,
                    deployedNetwork && deployedNetwork.address,
                );
            // Set web3, accounts, and contract to the state
            setWeb3(web3);
            window.ethereum.on('accountsChanged', function (accounts) {
                setAccounts(accounts);
                ChainAccess.setChainAddressState(accounts[0]);
            });
            setAccounts(accounts);
            setContract(instance);
            ChainAccess.setChainState(web3, accounts[0], instance);
            
            let account = await ChainAccess.getAccount();
            console.log(account);
            if (account.isAccount) {
                if (account.role === 0) {
                    navigate("/add");
                } else {
                    navigate("/ward/" + account.owner);
                }
            }

            //We are now connected to metamask
            setIsConnected(true);

           
            } catch(error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
            }
        } else {
            console.log('Please install MetaMask!');
        }
    };

    return (
        <Box
            sx={{"margin": "10% 0 0 20px"}}
            display="flex"
            justifyContent="center"
            aligntItems="center"
        >
            {   !connectClicked &&
                <Grid 
            container
            direction="row"
            justifyContent="center"
            >
                <Grid item xs={12} md={3}>
                    <img 
                        src="assets/walletimg.svg"
                        alt="wallet" 
                    >

                    </img>
                </Grid>
                <Grid item xs={12} md={3}>
                    <p 
                        style={{ 
                            "backgroundImage" : "linear-gradient(to right, #e8499b, #d551b0, #bc5cc2, #9c66d0, #766fd8)",
                            "WebkitBackgroundClip": "text",
                            "WebkitTextFillColor" : "transparent",
                            "fontSize": "50px",
                            "textAlign": "left",
                            "fontWeight": "900",
                            "marginTop": "0",
                            "marginBottom": "1.5rem",
                            "padding": "0"
                        }}
                    >
                        PocketCrypto
                    </p>
                    <p
                        style={{
                            "fontSize": "1.125rem",
                            "lineHeight": "1.75rem",
                            "textAlign": "left",
                            "marginTop": "0",
                            "marginBottom": "1.5rem",
                        }}
                    >
                        A simple, easy to use, and secure pocket money solution for guardians and wards.
                    </p>
                    <Button
                        sx={{
                            "float": "left",
                            "margin" : "1rem 1rem 1rem 0",
                            "borderRadius" : "30px",
                            "backgroundImage": "linear-gradient(to right, #f97316, #fb5b36, #f7434e, #ec3163, #db2777)"
                        }}
                        variant="contained"
                        onClick = {connectToMetaMask}
                    >
                        Connect Wallet
                    </Button>
                </Grid>
                </Grid>
            }
            {
                connectClicked && !isConnected &&
                <CircularProgress color="inherit" />
            }
            {
                connectClicked && isConnected && <AddMeta/>
            }
        </Box>
    );
}

export default LandingPage;
