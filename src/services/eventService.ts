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

// Function to fetch upcoming events
export const fetchEvents = async (token: string, userId: string) => {
  try {
    // Ensure token is passed in the headers
    const response = await axios.get(`${API_URL}/events/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Events fetched:', response.data); // Log response for debugging

    return response.data; // Assuming response.data contains the events
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch events:', error.response?.data || error.message);
    } else {
      console.error('Failed to fetch events:', error);
    }
    throw error; // Throw error to be caught in component
  }
};



// Function to fetch event history (past events the user joined)
export const fetchEventHistory = async (token: string | null): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/events/history/joined`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.history || [];
  } catch (error) {
    console.error('Failed to fetch event history:', error);
    return []; // Return empty array if failed
  }
};


export const getEventById = async (eventId: any, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/events/details/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Ensure this returns the event object
  } catch (error) {
    throw new Error('Failed to fetch event');
  }
};


// Edit an event
export const editEvent = async (

  eventId: string,

  eventData: {

    eventType: string;

    dateString: string;

    address: string;

    fees: number;

    weather: string;

    indoor: boolean;

    public: boolean;

    updatedDate: string; // Add updatedDate property

  },

  token: string) => {
  try {
    const response = await axios.put(
      `${API_URL}/events/edit/${eventId}`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to update event');
  }
};

export const createEvent = async (eventData: {
  eventType: string;
  dateString: string;
  address: string;
  fees: number;
  weather: string;
  indoor: boolean;
  public: boolean;
}, token: string | null): Promise<boolean> => {
  try {
    if (!token) {
      console.error("No token provided");
      return false;
    }

    const response = await axios.post(`${API_URL}/events/create`, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      return true;
    } else {
      console.error("Failed to create event", response.data);
      return false;
    }
  } catch (error) {
    console.error("Failed to create event:", error);
    return false;
  }
};


// Function to join an event
export const joinEvent = async (eventId: string, token: string | null): Promise<boolean> => {
  try {
    if (!token) {
      console.error("No token provided");
      return false;
    }

    const response = await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
