// api.js
export const fetchUserPackage = async (userId) => {
  try {
    const response = await fetch(
      `${AZURE_BASE_URL}/v1.0/users/user-packages/${userId}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch package data");
    }

    return data;
  } catch (error) {
    console.error("Error fetching user package:", error);
    throw error;
  }
};
