// src/screens/EventHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { fetchEventHistory } from '../services/eventService'; // Fetch function to get past events
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventHistoryScreen = () => {
  interface Event {
    _id: string;
    eventType: string;
    date: string;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        setLoading(false);
        return;
      }
      try {
        const userId = await AsyncStorage.getItem('user-id');
        const fetchedEvents = await fetchEventHistory(token);
        setEvents(fetchedEvents);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch event history');
      }
      setLoading(false);
    };

    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event History</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text>{item.eventType}</Text>
            <Text>{new Date(item.date).toLocaleDateString()}</Text> {/* Formatting date */}
          </View>
        )}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
});

export default EventHistoryScreen;
