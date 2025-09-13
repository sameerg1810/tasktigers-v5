import axios from "axios";

const baseUrl = import.meta.env.VITE_AZURE_BASE_URL;

// Fetch referral code by userId
export const getReferralCode = async (userId) => {
  console.log("the userId sending to getreferal", userId);
  try {
    const response = await axios.get(
      `${baseUrl}/v1.0/users/user-referral/referral-code/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching referral code:", error);
    throw error;
  }
};

// Create a new referral code
export const createReferralCode = async (data) => {
  console.log("the createReferral code", data);
  try {
    const response = await axios.post(
      `${baseUrl}/v1.0/users/user-referral/referral-code`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating referral code:", error);
    throw error;
  }
};
