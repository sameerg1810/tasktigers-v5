// api.js
import axios from "axios";
import { getRandomColor } from "../../../utils/utils.js";

const BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

// Fetch users and providers data with a preference for names over phone numbers
export const fetchUsersAndProviders = async () => {
  try {
    const [userResponse, providerResponse] = await Promise.all([
      axios.get(`${BASE_URL}/v1.0/users/userAuth`),
      axios.get(`${BASE_URL}/v1.0/providers/provider-auth`),
    ]);

    console.log("User API Response:", userResponse.data);
    console.log("Provider API Response:", providerResponse.data);

    const users = userResponse.data.map((user) => ({
      id: user._id,
      name:
        `${user.firstName || ""} ${user.surName || ""}`.trim() || user.phone,
      phone: user.phone,
      type: "user",
      color: getRandomColor(),
    }));

    const serviceProviders = providerResponse.data.map((provider) => ({
      id: provider.id,
      name:
        `${provider.firstName || ""} ${provider.surName || ""}`.trim() ||
        provider.primaryMobile ||
        provider.whatsappNumber,
      phone:
        provider.primaryMobile ||
        provider.whatsappNumber ||
        provider.phone ||
        "Unknown",
      type: "provider",
      color: getRandomColor(),
    }));

    return { users, serviceProviders };
  } catch (error) {
    console.error("Error fetching users and providers:", error);
    return { users: [], serviceProviders: [] };
  }
};

// Fetch chat history between subadmin and a selected user or provider
export const fetchProviderChatHistory = async (subadminId, receiverId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/chats?userId=${subadminId}&providerId=${receiverId}`,
    );
    console.log("Chat History Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

// Mark a specific message as seen
export const markMessageAsSeen = async (chatId) => {
  try {
    const response = await axios.patch(`${BASE_URL}/chats/seen`, { chatId });
    console.log("Mark as Seen Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error marking message as seen:", error);
  }
};

// Fetch unread message count for a specific receiver
export const fetchUnreadMessageCount = async (receiverId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/chats/unread?receiverId=${receiverId}`,
    );
    console.log("Unread Message Count Response:", response.data);
    return response.data.unreadMessagesCount || 0;
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return 0;
  }
};
