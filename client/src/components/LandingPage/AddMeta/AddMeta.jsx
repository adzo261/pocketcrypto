import './AddMeta.css';
import {useState} from "react";
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChainAccess from "../../../api/chain-access.js";
import {
  useNavigate,
} from "react-router-dom";

const AddMeta = () => {
    const [role, setRole] = useState(0);
    const [nick, setNick] = useState("");
    const navigate = useNavigate();

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };

     const handleNickChange = (event) => {
        setNick(event.target.value);
    };

    const saveDetails = async () => {
        await ChainAccess.addAccount(role, nick);
        if (ChainAccess.getRole() === 0) {
            navigate("/add");
        } else {
            navigate("/ward");
        }
    }

    return (
        <Grid
        container
        direction="column"
        justifyContent="center"
        >
            <Grid 
            container
            direction="row"
            justifyContent="center"
            >     
                <Grid item xs={12} md={2} className="meta-label">
                    Choose your role
                </Grid>
                <Grid item xs={12} md={2}>
                    <Select
                    value={role}
                    label="Role"
                    onChange = {handleRoleChange} 
                    className="meta-input"
                    >
                        <MenuItem value={0}>Guardian</MenuItem>
                        <MenuItem value={1}>Ward</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Grid 
            container
            direction="row"
            justifyContent="center"
            className="select-nickname-grid-container"
            >     
                <Grid item xs={12} md={2} className="meta-label">
                    Set a nickname
                </Grid>
                <Grid item xs={12} md={2}>
                   <TextField
                        className="meta-input"
                        variant="standard"
                        required
                        value={nick}
                        placeholder = "Eg. John"
                        onChange = {handleNickChange}
                    />
                </Grid>
            </Grid>
            <Button
                variant="contained"
                className="meta-button"
                onClick={saveDetails}
            >
                Continue <ChevronRightIcon />
            </Button>
        </Grid>
    )
}

export default AddMeta;