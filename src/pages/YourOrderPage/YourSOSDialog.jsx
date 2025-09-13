import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
  Box,
} from "@mui/material";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FireTruckIcon from "@mui/icons-material/FireTruck";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const YourSOSDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Emergency Contact Numbers</DialogTitle>
      <DialogContent>
        <DialogContentText>
          In case of emergency, please use one of the following numbers:
        </DialogContentText>
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            <LocalPoliceIcon sx={{ marginRight: 1 }} />
            <a href="tel:100">100 - Police</a>
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <LocalHospitalIcon sx={{ marginRight: 1 }} />
            <a href="tel:108">108 - Ambulance</a>
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <FireTruckIcon sx={{ marginRight: 1 }} />
            <a href="tel:112">112 - General Emergency</a>
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <SupportAgentIcon sx={{ marginRight: 1 }} />
            <a href="tel:1800123456">Customer Care</a>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default YourSOSDialog;
