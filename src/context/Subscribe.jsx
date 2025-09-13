import React, { createContext, useState, useContext } from "react";
import { toast } from "react-hot-toast"; 
import { useAuth } from "./AuthContext";

export const SubscribeContext = createContext();

const SubscribeProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [errors, setErrors] = useState("");  // Track error message
    const [successMessage, setSuccessMessage] = useState(""); // Track success message

    // Handle input changes
    const handleChange = (e) => {
        const input = e.target.value;
        setText(input);  // Update the text input
    };

    // Function to send email to the server
    const sendTokenToServer = async (email) => {
        const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

        setLoading(true); // Set loading state to true when making a request
        try {
            console.log('Sending email:', { email });

            const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/subscribe/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error('Error details:', errorDetails);
                throw new Error(errorDetails.message || "Failed to fetch data");
            }

            const responseData = await response.json();
            setSuccessMessage("Subscription successful!"); // Set success message
            setErrors(""); // Clear errors if successful
            toast.success("Subscription successful!"); // Show success toast notification

            // Clear the input field after successful subscription
            setText(""); // Clear the input field
        } catch (error) {
            console.error('Subscription error:', error);
            setErrors(error.message); // Set error message if failure
            toast.error(error.message); // Show error toast notification
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    // Handle subscription when the button is clicked
    const handleSubscribe = () => {
        const email = text;

        // Basic email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phonePattern = /^\d{10}$/;

        if (emailPattern.test(email) || phonePattern.test(email)) {
            sendTokenToServer(email);
        } else {
            setErrors("Enter a valid email or 10-digit phone number"); // Set error message
            toast.error("Enter a valid email or 10-digit phone number"); // Show error toast notification
        }
    };

    return (
        <SubscribeContext.Provider value={{ handleChange, text, errors, successMessage, handleSubscribe, loading }}>
            {children}
        </SubscribeContext.Provider>
    );
};

export default SubscribeProvider;
