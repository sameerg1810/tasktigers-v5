export const fetchProviderDetailsId = async (providerId) => {
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
  try {
    console.log("Fetching provider details for providerId:", providerId);

    const response = await fetch(
      `${AZURE_BASE_URL}/v1.0/providers/provider-auth/${providerId}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Provider details fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Error fetching provider details:", error);
    return null;
  }
};
