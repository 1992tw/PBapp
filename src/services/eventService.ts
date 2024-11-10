import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/apiConfig'; // Assuming API_URL is defined in your config file

// Function to retrieve username from AsyncStorage
export const getUsername = async (): Promise<string | null> => {
  const storedUsername = await AsyncStorage.getItem('username');
  return storedUsername;
};

// Function to capitalize the first letter of a string
export const capitalizeFirstLetter = (string: string | null): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Function to fetch events from the API
export const fetchEvents = async (token: string | null, userId: string | null): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/events/upcoming`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if response.data.events is an array before filtering
    if (Array.isArray(response.data.events)) {
      // Filter events: If public is false, check if the user is in the invitedPlayers array
      const filteredEvents = response.data.events.filter((event: any) => {
        if (!event.public && !event.invitedPlayers.includes(userId)) {
          return false; // Exclude private events unless invited
        }
        return true;
      });
      return filteredEvents;
    } else {
      console.error('Error: Expected "events" array but got:', response.data);
      return []; // Return an empty array if "events" is not in the expected format
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return []; // Return an empty array if the request fails
  }
};

// Function to join an event
export const joinEvent = async (eventId: string, token: string | null): Promise<boolean> => {
  try {
    // Ensure token is available, if not return false
    if (!token) {
      console.error("No token provided");
      return false;
    }

    // Make the POST request with the eventId in the URL and Authorization header
    const response = await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`, // Add the Authorization token here
        "Content-Type": "application/json", // Optional: to make sure content-type is JSON
      },
    });

    if (response.data.success) {
      return true;
    } else {
      console.error("Failed to join event", response.data);
      return false;
    }
  } catch (error) {
    console.error("Failed to join event:", error);
    return false;
  }
};


