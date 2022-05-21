import { Fragment, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import '../Tabs/Tabs.css';
import './WardPage.css';
import AppBar from '../AppBar/AppBar.jsx';
import TransactionTile from './TransactionTile/TransactionTile'
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import {useParams } from 'react-router-dom'
import ChainAccess from "../../api/chain-access.js";

const WardPage = () => {
    const {wardAddress} = useParams();
    const [tab, setTab] = useState(0);
    const [requestEtherDialogState, setRequestEtherDialogState] = useState(false);
    const [requestedEth, setRequestedEth] = useState();
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [approvedTransactions, setApprovedTransactions] = useState([]);
    const [rejectedTransactions, setRejectedTransactions] = useState([]);
    
    useEffect(() => {
        const getTransactions = async () => {
            let transactions = await ChainAccess.getTransactions(wardAddress);
            setPendingTransactions(transactions.pending);
            setApprovedTransactions(transactions.approved);
            setRejectedTransactions(transactions.rejected);
        }
        getTransactions();
    },[]);

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

    const requestEth = async () => {
        await ChainAccess.requestEth(requestedEth);
        setRequestEtherDialogState(false);
    }

    return (
         <Fragment>
            <AppBar></AppBar>
            <Box className="tab-box">
                <Tabs value={tab} onChange={handleTabChange} aria-label="Transactions">
                    <Tab label="Pending"/>
                    <Tab label="Approved" />
                    <Tab label="Rejected" />
                </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
                {
                    pendingTransactions.map(
                        (transaction, i ) => 
                        <TransactionTile 
                            key={i} 
                            transaction={transaction} 
                            role = {ChainAccess.getRole()}
                        >
                        </TransactionTile>
                    )
                }
                {
                    pendingTransactions.length === 0 &&
                    <p className="empty-message">No pending transactions</p>
                }
            </TabPanel>
            <TabPanel value={tab} index={1}>
                 {
                    approvedTransactions.map(
                        (transaction, i ) => 
                        <TransactionTile 
                            key={i} 
                            transaction={transaction} 
                            role = {ChainAccess.getRole()}
                        >
                        </TransactionTile>
                    )
                }
                {
                    approvedTransactions.length === 0 &&
                    <p className="empty-message">No approved transactions</p>
                }
            </TabPanel>
            <TabPanel value={tab} index={2}>
                {
                    rejectedTransactions.map(
                        (transaction, i ) => 
                        <TransactionTile 
                            key={i} 
                            transaction={transaction} 
                        >
                        </TransactionTile>
                    )
                }
                {
                    rejectedTransactions.length === 0 &&
                    <p className="empty-message">No rejected transactions</p>
                }
            </TabPanel>
            <Fab variant="extended" color="primary"
                sx={{
                    position: "fixed",
                    bottom: (theme) => theme.spacing(5),
                    right: (theme) => theme.spacing(2),
                    /* "backgroundImage": "linear-gradient(to right, #f97316, #fb5b36, #f7434e, #ec3163, #db2777)" */
                    background: "white",
                    color: "black",
                    fontSize: "15px",
                    fontWeight: "bold",
                    textTransform: "none",

                }}
                onClick={() => setRequestEtherDialogState(true)}
            >
                <img 
                    src="/assets/ether.svg"
                    alt="ether" 
                    className="ether-img"
                    style={{
                        height:"35px",
                        marginRight: "5px"
                    }}
                />
                Request Ether
            </Fab>
            <Dialog open={requestEtherDialogState} onClose={() => setRequestEtherDialogState(false)}>
                <DialogTitle>Request Ether</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ether Amount"
                        type="number"
                        variant="standard"
                        onChange={(e) => setRequestedEth(e.target.value)}
                        value = {requestedEth}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRequestEtherDialogState(false)}>Cancel</Button>
                    <Button onClick={requestEth}>Request</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default WardPage;