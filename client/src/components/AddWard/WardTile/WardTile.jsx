import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {useNavigate} from "react-router-dom";
import './WardTile.css';

const WardTile = (props) => {

    const {ward, isWardAvailable, isMyWard, removeWard, addWard} = props;
    const navigate = useNavigate();

    const navigateToWardPage = () => {
        navigate("/ward/" + ward.owner);
    }

    return (
        <Grid 
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            className="ward-tile"
            onClick={navigateToWardPage}
            >
            <Box
                component={Grid}
                item
                md={4}
                display={{ xs: "none", sm: "block" }}>
                    <Box display="flex" justifyContent="center">
                        {ward.owner}
                    </Box>
            </Box>
            <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent="center">
                    {ward.nickname}
                </Box>
            </Grid>
             <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent="center">
                    {   isWardAvailable && 
                        <Button 
                            variant="contained" 
                            className="add-ward"
                            onClick={(event) => addWard(event, ward)}
                            >
                            <AddIcon/>
                        </Button>

                    }
                    {   isMyWard &&
                        <Button 
                            variant="contained" 
                            className="remove-ward"
                            onClick={(event) => removeWard(event, ward)}
                        >
                            <RemoveIcon/>
                        </Button>
                    }
                </Box>
            </Grid>
        </Grid>
       
    );
}

export default WardTile;