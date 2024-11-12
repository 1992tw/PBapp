import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import { getUserById } from '../services/eventService';

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);  // New state to track loading status

  // Fetch username and userId from AsyncStorage
  const getUserData = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedUserId = await AsyncStorage.getItem('userId');
    setUsername(storedUsername);
    setUserId(storedUserId);
  };

  // Function to fetch upcoming events
  const fetchEvents = async () => {
    if (isLoading) return;  // Avoid fetching if already in progress

    try {
      setIsLoading(true);  // Set loading state to true before the request
      const token = await AsyncStorage.getItem('auth-token');
      const response = await axios.get(`${API_URL}/events/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For each event, fetch the usernames of the joined players
      const upcomingEvents = await Promise.all(response.data.events.map(async (event: any) => {
        const joinedPlayerUsernames = await Promise.all(
          event.joinedPlayers.map(async (playerId: string) => {
            if (token) {
              const playerData = await getUserById(playerId, token);
              return playerData.username;
            }
            return '';
          })
        );
        return { ...event, joinedPlayerUsernames };
      }));

      setEvents(upcomingEvents);  // Set the events with usernames
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);  // Reset loading state after request completes
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
        await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchEvents();  // Reload events after joining
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
        {/* Event details */}
        <Text style={styles.eventType}>{item.eventType}</Text>
        <Text style={styles.eventText}>
          Date: {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
        </Text>
        <Text style={styles.eventText}>Address: {item.address}</Text>
        <Text style={styles.eventText}>Weather: {item.weather}</Text>
        <Text style={styles.eventText}>Fees: ${item.fees}</Text>
        <Text style={styles.eventText}>{item.indoor ? 'Indoor Event' : 'Outdoor Event'}</Text>
        <Text style={styles.eventText}>{item.public ? 'Public Event' : 'Private Event'}</Text>

        {/* Display joined players */}
        {item.joinedPlayerUsernames.length > 0 ? (
          <View style={styles.joinedPlayersContainer}>
            <Text style={styles.eventText}>
              {item.joinedPlayerUsernames.length === 1
                ? '1 Player Joined:'
                : `${item.joinedPlayerUsernames.length} Players Joined:`}
            </Text>
            {item.joinedPlayerUsernames.map((username: string, index: number) => (
              <Text key={index} style={styles.joinedPlayerName}>{username}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.eventText}>No players have joined yet</Text>
        )}

        {/* Comments */}
        {item.comments.length > 0 ? (
          <View style={styles.commentsContainer}>
            <Text style={styles.eventText}>Comments:</Text>
            {item.comments.map((comment: any, index: number) => (
              <View key={index} style={styles.commentContainer}>
                <Text style={styles.commentUsername}>{comment.username}:</Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.eventText}>No comments yet</Text>
        )}

        {/* Join or Edit buttons */}
        {isJoined ? (
          <Text style={styles.joinedText}>Joined</Text>
        ) : (
          <Button title="Join" onPress={() => handleJoinEvent(item._id)} />
        )}
        {isOwner && <Button title="Edit" onPress={() => handleEditEvent(item._id)} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome {capitalizeFirstLetter(username) || 'User'}!
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
  eventText: { fontSize: 16, marginBottom: 8 },
  eventType: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginBottom: 8 },
  joinedPlayersContainer: { marginTop: 8, marginBottom: 8 },
  joinedPlayerName: { fontSize: 14, color: '#555' },
  joinedText: { color: 'green', fontWeight: 'bold' },
  commentsContainer: { marginTop: 8, marginBottom: 8 },
  commentContainer: { marginBottom: 8 },
  commentUsername: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  commentText: { fontSize: 14, color: '#777', marginLeft: 16 },
});

export default HomeScreen;
