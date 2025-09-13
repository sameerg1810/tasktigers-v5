export const fetchOtp = async () => {
  try {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in sessionStorage");
    }

    const baseUrl = import.meta.env.VITE_AZURE_BASE_URL;
    if (!baseUrl) {
      throw new Error(
        "VITE_AZURE_BASE_URL is not set in environment variables",
      );
    }

    console.log("Fetching OTP for userId:", userId);
    const response = await fetch(`${baseUrl}/v1.0/users/userAuth/${userId}`);
    console.log("API Response:", response);

    if (!response.ok) {
      throw new Error(`Failed to fetch OTP: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OTP Data:", data);
    return data.uniqueNumber;
  } catch (error) {
    console.error("Error fetching OTP:", error.message);
    return null;
  }
};
