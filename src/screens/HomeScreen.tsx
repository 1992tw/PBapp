import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types'; // Adjust path accordingly
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have the right icon
import { logout } from '../services/authService'; // Import your logout function
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { getUsername, capitalizeFirstLetter, fetchEvents, joinEvent } from '../services/eventService'; // Import from eventService

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use the defined type
  const [username, setUsername] = useState<string | null>(null); // State to hold username
  const [userId, setUserId] = useState<string | null>(null); // State to hold userId
  const [events, setEvents] = useState<any[]>([]); // State to hold events

  // Function to handle logout
  const handleLogout = async () => {
    await logout(); // Ensure you import this from your authService
    setUsername(null); // Clear the username state on logout
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  // Fetch username, userId, and events when the component mounts or when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    loadUserData();

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

  // Function to load user data (username, userId, and events)
  const loadUserData = async () => {
    const storedUsername = await getUsername(); // Fetch username from AsyncStorage
    setUsername(storedUsername); // Set the username state
    const storedUserId = await AsyncStorage.getItem('userId'); // Get the userId from AsyncStorage
    setUserId(storedUserId); // Set the userId state
    const token = await AsyncStorage.getItem('auth-token'); // Get the user token from AsyncStorage
    if (token) {
      const eventsData = await fetchEvents(token, storedUserId); // Fetch events from the API
      setEvents(eventsData); // Set the events state
    }
  };

  // Function to handle "Join" button click
const handleJoinEvent = async (eventId: string) => {
  const token = await AsyncStorage.getItem('auth-token'); // Get the token from AsyncStorage
  if (token) {
    const success = await joinEvent(eventId, token); // Join event with the token
    if (success) {
      // Optionally, reload events or handle UI update
      loadUserData(); // Re-fetch events and update the state
    } else {
      Alert.alert('Error', 'Failed to join event');
    }
  } else {
    Alert.alert('Error', 'You need to be logged in');
  }
};


const handleJoinEventOptimistic = async (eventId: string) => {
  const token = await AsyncStorage.getItem('auth-token'); // Get the token from AsyncStorage
  if (token) {
    // Optimistically update the event to reflect the change (join event locally)
    setEvents((prevEvents) => 
      prevEvents.map((event) => 
        event._id === eventId 
          ? { ...event, joinedPlayers: [...event.joinedPlayers, userId] } 
          : event
      )
    );

    // Now send the request to join the event
    const success = await joinEvent(eventId, token); 
    if (!success) {
      Alert.alert('Error', 'Failed to join event');
    } else {
      // After joining, you can re-fetch if necessary or simply leave the optimistic update as it is
      loadUserData(); // Re-fetch events after success
    }
  } else {
    Alert.alert('Error', 'You need to be logged in');
  }
};


const renderEventItem = ({ item }: { item: any }) => {
  const isJoined = item.joinedPlayers.includes(userId);
  const isInvited = item.public === false && item.invitedPlayers.includes(userId);
  const showJoinButton = !isJoined && (item.public || isInvited);

  return (
    <View style={styles.eventItem}>
      <Text style={styles.eventText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.eventText}>Type: {item.eventType}</Text>
      <Text style={styles.eventText}>Address: {item.address}</Text>
      <Text style={styles.eventText}>Weather: {item.weather}</Text>
      <Text style={styles.eventText}>Fees: ${item.fees}</Text>
      <Text style={styles.eventText}>Joined: {item.joinedPlayers.length} players</Text> {/* Display the number of joined players */}

      {showJoinButton ? (
        <Button title="Join" onPress={() => handleJoinEventOptimistic(item._id)} />
      ) : (
        <Text style={styles.joinedText}>{isJoined ? 'Joined' : 'Invitation Only'}</Text>
      )}
    </View>
  );
};


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
  eventItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  eventText: { fontSize: 16 },
  joinedText: { color: 'green', fontWeight: 'bold' },
});

export default HomeScreen;
