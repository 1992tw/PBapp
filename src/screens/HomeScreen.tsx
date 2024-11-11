import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
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
  const [userId, setUserId] = useState<string | null>(null); // State to hold userId
  const [events, setEvents] = useState<any[]>([]); // State to hold events

  // Fetch username and userId from AsyncStorage
  const getUserData = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedUserId = await AsyncStorage.getItem('userId');
    setUsername(storedUsername);
    setUserId(storedUserId);
  };

  // Function to fetch upcoming events
  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      const response = await axios.get(`${API_URL}/events/upcoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter only upcoming events and set them in the state
      const upcomingEvents = response.data.events.filter((event: any) => new Date(event.date) > new Date());
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // Fetch user data and events when the component mounts or when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserData();
      fetchEvents();
    });

    getUserData();
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

    return unsubscribe;
  }, [navigation]);

  // Function to handle logout
  const handleLogout = async () => {
    await logout();
    setUsername(null);
    navigation.navigate('Login');
  };

  // Function to handle "Join" button click
  const handleJoinEvent = async (eventId: string) => {
    const token = await AsyncStorage.getItem('auth-token');
    if (token) {
      try {
        // Updated API request to use eventId in the URL path
        await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        fetchEvents(); // Reload events after joining
      } catch (error) {
        Alert.alert('Error', 'Failed to join the event');
      }
    } else {
      Alert.alert('Error', 'You need to be logged in');
    }
  };

  // Function to handle "Edit" button click
  const handleEditEvent = (eventId: string) => {
    navigation.navigate('EditEvent', { eventId });
  };

  // Helper function to capitalize the first letter of the username
  const capitalizeFirstLetter = (username: string | null) => {
    if (!username) return '';
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Render each event item
 const renderEventItem = ({ item }: { item: any }) => {
  const isJoined = item.joinedPlayers.includes(userId);
  const isOwner = item.createdBy === userId;

  return (
    <View style={styles.eventItem}>
      {/* Display event type with large font */}
      <Text style={styles.eventType}>{item.eventType}</Text>

      {/* Other event details */}
      <Text style={styles.eventText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.eventText}>Address: {item.address}</Text>
      <Text style={styles.eventText}>Weather: {item.weather}</Text>
      <Text style={styles.eventText}>Fees: ${item.fees}</Text>

      {/* Display number of joined players and their usernames */}
      {item.joinedPlayers.length > 0 ? (
        <View style={styles.joinedPlayersContainer}>
          <Text style={styles.eventText}>
            {item.joinedPlayers.length} Player(s) Joined:
          </Text>
          {item.joinedPlayers.map((playerId: string) => (
            <Text key={playerId} style={styles.joinedPlayerName}>
              {playerId} {/* You can replace this with actual usernames if you have them */}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.eventText}>No players have joined yet</Text>
      )}

      {/* Display "Join" or "Joined" button based on user's participation */}
      {isJoined ? (
        <Text style={styles.joinedText}>Joined</Text>
      ) : (
        <Button title="Join" onPress={() => handleJoinEvent(item._id)} />
      )}

      {/* Show "Edit" button if the user is the event creator */}
      {isOwner && (
        <Button title="Edit" onPress={() => handleEditEvent(item._id)} />
      )}
    </View>
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome {capitalizeFirstLetter(username) ? capitalizeFirstLetter(username) : 'User'}!
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
  eventItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  eventText: { fontSize: 16 },
  eventType: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginBottom: 8 },
  joinedPlayersContainer: { marginTop: 8, marginBottom: 8 },
  joinedPlayerName: { fontSize: 14, color: '#555' },
  joinedText: { color: 'green', fontWeight: 'bold' },
});


export default HomeScreen;
