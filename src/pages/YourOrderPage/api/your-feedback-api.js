//this is for submitting rating for provider
const BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
export const sendFeedback = async (data) => {
  console.log(" the the data we send to this component about rating", data);
  const url = `${BASE_URL}/v1.0/users/user-feedback`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed to submit feedback.");
  }

  return response.json();
};
