import React, { useEffect, useState, useRef } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Modal,
  Snackbar,
  Alert,
  Grid,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CurrentPackage from "./CurrentPackage";
const savemoney = `${IMAGE_BASE_URL}/savemoney.svg`;
const goldCoinGif = `${IMAGE_BASE_URL}/goldcoin.gif`;
const silverCoinGif = `${IMAGE_BASE_URL}/silvercoin.gif`;
const bronzeCoinGif = `${IMAGE_BASE_URL}/bronzecoin.gif`;
import "./Packages.css"; // Import CSS for styling

const tigerTheme = createTheme({
  palette: {
    primary: { main: "#F4A261" },
    secondary: { main: "#E76F51" },
    background: { default: "white", paper: "#FFFFFF" },
    text: { primary: "#2A2A2A", secondary: "#6D6875" },
  },
  typography: {
    fontFamily: "poppins, sans-serif",
    fontWeightBold: 700,
    fontWeightMedium: 600,
  },
});

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isViewMoreOpen, setIsViewMoreOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showHurray, setShowHurray] = useState(false);
  const currentPackageRef = useRef(null);

  const userId = sessionStorage.getItem("userId") || "";
  const RazorKey = import.meta.env.VITE_RZP_KEY_ID;
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          `${AZURE_BASE_URL}/v1.0/admin/admin-user-package`,
        );
        const data = await response.json();
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        setPackages(data);
      } catch (err) {
        openSnackbar(
          "Failed to load packages. Please purchase a package now.",
          "error",
        );
      }
    };
    fetchPackages();
  }, []);

  const openSnackbar = (message, severity) =>
    setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleViewMore = (pkg) => {
    setSelectedPackage(pkg);
    setIsViewMoreOpen(true);
  };

  const handleViewMoreClose = () => setIsViewMoreOpen(false);

  const getPackageGif = (packageName) => {
    const lowerCaseName = packageName?.toLowerCase();
    if (lowerCaseName?.includes("gold")) return goldCoinGif;
    if (lowerCaseName?.includes("silver")) return silverCoinGif;
    if (lowerCaseName?.includes("bronze")) return bronzeCoinGif;
    return savemoney;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpay = async (pkg) => {
    try {
      const res = await loadRazorpayScript();
      if (!res)
        return openSnackbar(
          "Razorpay SDK failed to load. Are you online?",
          "error",
        );

      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/core/razor-pay/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pkg.priceRs,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          }),
        },
      );

      const data = await response.json();
      if (response.ok && data.id) {
        const options = {
          key: RazorKey,
          amount: pkg.priceRs,
          currency: "INR",
          name: "TASK TIGERS",
          description: "Package Purchase",
          image: savemoney,
          order_id: data.id,
          handler: async (response) => {
            await registerPackageWithPaymentId(
              pkg,
              response.razorpay_payment_id,
            );
          },
          prefill: { name: "", email: "", contact: "" },
          theme: { color: "#E76F51" },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        openSnackbar("Failed to initiate payment. Please try again.", "error");
      }
    } catch (error) {
      openSnackbar(
        "An error occurred while processing payment. Please try again.",
        "error",
      );
    }
  };

  const registerPackageWithPaymentId = async (pkg, paymentId) => {
    setLoading(true);
    try {
      const payload = {
        userId,
        packageName: pkg.packageName,
        priceRs: pkg.priceRs,
        validity: pkg.validity || 1,
        discount: pkg.discount,
        description: pkg.description,
        comments: pkg.comments,
        paymentId,
        packageId: pkg._id,
      };

      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/user-packages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        openSnackbar("Package successfully activated!", "success");
        setShowHurray(true);
        currentPackageRef.current.fetchUserPackage();
      } else {
        openSnackbar("Failed to activate package. Please try again.", "error");
      }
    } catch (error) {
      openSnackbar("An error occurred. Please try again later.", "error");
    } finally {
      setLoading(false);
      handleViewMoreClose();
    }
  };

  return (
    <ThemeProvider theme={tigerTheme}>
      <h2 className="my-packges">My packages</h2>
      <Box
        display="flex"
        sx={{ backgroundColor: "background.default", minHeight: "80vh" ,position:'relative'}}
      >
        <Box flex={1} >
          <CurrentPackage
            userId={userId}
            ref={currentPackageRef}
            newPurchase={showHurray}
            setNewPurchase={setShowHurray}
          />
          <div className="packages-container">
           <div className="packages-main-con" >
              {Array.isArray(packages) && packages.length > 0 ? (
                packages.map((pkg, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={5} key={index} >
                    <Card
                      sx={{ boxShadow: 3, borderRadius: 2, height: "100%" }}
                    >
                      <CardContent
                        sx={{
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid container>
                          <Grid
                            item
                            xs={5}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ padding: 2 }}
                          >
                            <img
                              src={getPackageGif(pkg.packageName)}
                              alt={`${pkg.packageName} icon`}
                              style={{
                                width: "100%",
                                maxHeight: "100px",
                                objectFit: "contain",
                              }}
                            />
                          </Grid>
                          <Grid item xs={7} sx={{ padding: 0 }}>
                            <Typography
                              variant="h6"
                              color="text.primary"
                              fontWeight="bold"
                            >
                              {pkg.packageName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Price: ₹{pkg.priceRs}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Validity: {pkg.validity || "1"} days
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={() => handleViewMore(pkg)}
                              sx={{
                                mt: 2,
                                backgroundColor: 'black',
                                color: 'white',
                                border: 'none',
                                "&:hover": {
                                  backgroundColor: 'white',
                                  border: '1px solid black',
                                  color: 'black',
                                },
                              }}
                              
                            >
                              View More
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography>No packages available</Typography>
              )}
            </div>
          </div>
          <Modal open={isViewMoreOpen} onClose={handleViewMoreClose}>
            <Box
              sx={{
                width: 400,
                margin: "auto",
                position:'absolute',
                top:'50%',
                left:'50%',
                transform: 'translate(-50%, -50%)',  
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              {selectedPackage && (
                <>
                  <Typography variant="h5" mb={2} color="primary">
                    {selectedPackage.packageName}
                  </Typography>
                  <Typography>
                    <strong>Price:</strong> ₹{selectedPackage.priceRs}
                  </Typography>
                  <Typography>
                    <strong>Validity:</strong> {selectedPackage.validity || "1"}{" "}
                    days
                  </Typography>
                  <Typography>
                    <strong>Discount:</strong> {selectedPackage.discount}%
                  </Typography>
                  <Typography>
                    <strong>Description:</strong> {selectedPackage.description}
                  </Typography>
                  <Typography>
                    <strong>Comments:</strong> {selectedPackage.comments}
                  </Typography>
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor:'black',
                        color:'white',
                        "&:hover":{
                          backgroundColor:'white',
                          color:'black',
                          border:'1px solid black' 
                        }
                      }}
                      onClick={() => initiateRazorpay(selectedPackage)}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? "Processing..." : "Activate Package"}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={closeSnackbar}
          >
            <Alert
              onClose={closeSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Packages;
