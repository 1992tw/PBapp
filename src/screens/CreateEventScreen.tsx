import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert } from 'react-native';
import { createEvent } from '../services/eventService'; // Function to create events
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation

const CreateEventScreen = () => {
  const navigation = useNavigation(); // Initialize navigation hook

  // State variables for the event details
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [fees, setFees] = useState('');
  const [weather, setWeather] = useState('');
  const [indoor, setIndoor] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    // Validate that all fields are filled
    if (!eventType || !date || !address || !fees || !weather) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const token = await AsyncStorage.getItem('auth-token');
    if (!token) {
      Alert.alert('Error', 'You are not logged in');
      return;
    }

    setLoading(true);
    try {
      const newEvent = await createEvent(
        {
          eventType,
          dateString: date, // Ensure the date is in ISO string format
          address,
          fees: parseFloat(fees),
          weather,
          indoor,
          public: true, // Default to public
        },
        token
      );

      if (newEvent) {
        // Clear input fields after successful event creation
        setEventType('');
        setDate('');
        setAddress('');
        setFees('');
        setWeather('');
        setIndoor(false);

        // Show success notification
        Alert.alert('Success', 'Event created successfully');

        // Redirect to the Home Screen
        navigation.navigate('Home'); // Ensure this matches the name of your Home screen in your navigator
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Event</Text>
      
      {/* Event Type Input */}
      <TextInput
        placeholder="Event Type"
        style={styles.input}
        value={eventType}
        onChangeText={setEventType}
      />
      
      {/* Date Input */}
      <TextInput
        placeholder="Date (ISO String)"
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />
      
      {/* Address Input */}
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      
      {/* Fees Input */}
      <TextInput
        placeholder="Fees"
        style={styles.input}
        value={fees}
        onChangeText={setFees}
        keyboardType="numeric"
      />
      
      {/* Weather Input */}
      <TextInput
        placeholder="Weather"
        style={styles.input}
        value={weather}
        onChangeText={setWeather}
      />
      
      {/* Indoor Event Switch */}
      <View style={styles.switchContainer}>
        <Text>Indoor Event:</Text>
        <Switch value={indoor} onValueChange={setIndoor} />
      </View>
      
      {/* Create Event Button */}
      <Button title="Create Event" onPress={handleCreateEvent} disabled={loading} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default CreateEventScreen;
