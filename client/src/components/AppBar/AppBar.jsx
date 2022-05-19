import {useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import './AppBar.css';
import ChainAccess from "../../api/chain-access.js";
const AppBar = () => {
    const [balance, setBalance] = useState(0);
    const [nickname, setNickname] = useState("");
    
    useEffect( () => {
        let getStateData = async () => {
            setBalance(await ChainAccess.getUserBalance());
            setNickname(ChainAccess.nickname);
        };
        getStateData();
    }, []);

    return (
        <Box className="app-bar">
            <div className="app-bar--left">
                {nickname}
            </div>
            <div className="app-bar--right">
                {balance}
                <img 
                    src="assets/ether.svg"
                    alt="ether" 
                    className="ether-img"
                >
                </img>
            </div>
        </Box>
    );
}

export default AppBar;