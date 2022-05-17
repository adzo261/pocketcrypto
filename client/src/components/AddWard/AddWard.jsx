import { Fragment, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import './AddWard.css';
import WardTile from './WardTile/WardTile.jsx';
import ChainAccess from "../../api/chain-access.js";
import {useNavigate} from "react-router-dom";
const AddWard = () => {

    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [availableWards, setAvailableWards] = useState([]);
    const [myWards, setMyWards] = useState([]);

    useEffect( () => {
        console.log(ChainAccess.address);
        if (!ChainAccess.address) {
            navigate("/");
            return;
        }
        syncWards();
        /* setAvailableWards([{owner:"0xf2088778dBD3470203147B7ECcDEF9e67b08af74", nickname: "Avail1"},
        {owner:"0xf2088778dBD3470203147B7ECcDEF9e67b08af75", nickname: "Avail2"},]);

        setMyWards([{owner:"0xf2088778dBD3470203147B7ECcDfF9e67b08af74", nickname: "Ward1"},
        {owner:"0xf2088778dBD3470203147B7ECcDEF9X67b08af75", nickname: "Ward2"},]); 
        */
    }, [navigate]);

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;

        return (
            <div {...other}>
            {value === index && <Box p={3}>{children}</Box>}
            </div>
        );
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    }

    const addWard = (event, ward) => {
        event.stopPropagation();
        ChainAccess.addWard(ward.owner);
        setMyWards(myWards.concat(ward));
        setAvailableWards(availableWards.filter(w => w.owner !== ward.owner));
        //TODO: syncing with chain sometimes gives old results
        //because transaction sometime isnt mined yet
        syncWards();
    }

    const removeWard = (event, ward) => {
        event.stopPropagation();
        ChainAccess.removeWard(ward.owner);
        setMyWards(myWards.filter(w => w.owner !== ward.owner));
        setAvailableWards(availableWards.concat(ward));
        //TODO: syncing with chain sometimes gives old results
        //because transaction sometime isnt mined yet
        syncWards();
    }

    const syncWards = async () => {
        setAvailableWards(await ChainAccess.getAvailableWards());
        setMyWards(await ChainAccess.getMyWards());
    }
    

    return (
        <Fragment>
            <Box className="tab-box">
                <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
                    <Tab label="Your Wards"/>
                    <Tab label="Available Wards" />
                </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
                {
                    myWards.map(
                        (ward, i ) => 
                        <WardTile 
                            key={i} 
                            ward={ward} 
                            isMyWard={true}
                            removeWard={removeWard}
                        >
                        </WardTile>
                    )
                }
                {
                    myWards.length === 0 &&
                    <p className="empty-message">You don't have any wards. Please add wards.</p>
                }
            </TabPanel>
            <TabPanel value={tab} index={1}>
                {
                    availableWards.map(
                        (ward, i ) =>
                        <WardTile 
                            key={i} 
                            ward={ward} 
                            isWardAvailable={true}
                            addWard={addWard}
                        >
                        </WardTile>
                    )
                }
                {
                    availableWards.length === 0 &&
                    <p className="empty-message">No Wards Available</p>
                }
            </TabPanel>
        </Fragment>
    );
}

export default AddWard;