import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import '../../Tile/Tile.css';
import './TransactionTile.css';

const TransactionTile = (props) => {
    const {transaction, role} = props;
    
    return (
        <Grid 
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            className="tile"
            >
            <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent="center">
                    {transaction.date}
                </Box>
            </Grid>
             <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent="center">
                   {transaction.amount} ether
                </Box>
            </Grid>
            {
                role === 0 &&
                <Grid item xs={12} md={4}>
                    <Box display="flex" justifyContent="center">
                        <Button 
                            variant="contained" 
                            className="add-btn"
                            style={{
                                marginRight: "30px"
                            }}>
                            <DoneIcon/>
                        </Button>
                        <Button 
                            variant="contained" 
                            className="remove-btn"
                        >
                            <ClearIcon/>
                        </Button>
                    </Box>
                </Grid>
            }
           
        </Grid>
       
    );
}

export default TransactionTile;