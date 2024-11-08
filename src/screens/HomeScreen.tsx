// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types'; // Adjust path accordingly
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have the right icon
import { logout } from '../services/authService'; // Import your logout function
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import axios from 'axios'; // Import axios for API requests
import { API_URL } from '../config/apiConfig'; // Import the dynamic API URL

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use the defined type
  const [username, setUsername] = useState<string | null>(null); // State to hold username
  const [events, setEvents] = useState<any[]>([]); // State to hold events

  // Function to retrieve username from AsyncStorage
  const getUsername = async () => {
    const storedUsername = await AsyncStorage.getItem('username'); // Adjust the key based on where you save it
    setUsername(storedUsername); // Update the state with the retrieved username
  };

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string | null) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to fetch events from the API
  const fetchEvents = async () => {
    try {
      console.log(`${API_URL}/events/upcoming`)
      const token = await AsyncStorage.getItem('auth-token'); // Get the user token from AsyncStorage
      const response = await axios.get(`${API_URL}/events/upcoming`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      });
      setEvents(response.data.events); // Update the state with the fetched events
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // Fetch username and events when the component mounts or when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUsername();
      fetchEvents();
    });

    getUsername();
    fetchEvents();

    // Set header options for logout button
    navigation.setOptions({
      headerRight: () => (
        <Icon.Button
          name="log-out-outline"
          size={25}
          backgroundColor="transparent"
          color="#000"
          onPress={handleLogout}
        />
      ),
    });

    return unsubscribe; // Clean up the event listener
  }, [navigation]); // Ensure it updates if navigation changes

  // Define handleLogout inside the HomeScreen component
  const handleLogout = async () => {
    await logout(); // Ensure you import this from your authService
    setUsername(null); // Clear the username state on logout
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  // Render each event item
  const renderEventItem = ({ item }: { item: any }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.eventType}</Text>
      <Text style={styles.eventText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.eventText}>Address: {item.address}</Text>
      <Text style={styles.eventText}>Weather: {item.weather}</Text>
      <Text style={styles.eventText}>Fees: ${item.fees}</Text>
      <Text style={styles.eventText}>Public: {item.public ? 'Yes' : 'No'}</Text>
      <Text style={styles.eventText}>Indoor: {item.indoor ? 'Yes' : 'No'}</Text>
      <Text style={styles.eventText}>Joined Players: {item.joinedPlayers.length}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome {capitalizeFirstLetter(username)}!
      </Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.eventList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 16 },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  eventList: { width: '100%' },
  eventItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  eventTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  eventText: { fontSize: 16 },
});

export default HomeScreen;