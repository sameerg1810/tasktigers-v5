import axios from "axios";

const baseUrl = import.meta.env.VITE_AZURE_BASE_URL;

export const getReferralDetails = async (referralCode) => {
  console.log("the referal code", referralCode);
  try {
    const response = await axios.post(
      `${baseUrl}/v1.0/users/user-referral/referral-code-data`,
      { referralCode },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data; // Return API response
  } catch (error) {
    console.error("Error fetching referral details:", error);
    throw error; // Propagate the error for the caller to handle
  }
};
