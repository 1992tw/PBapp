import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { editEvent, getEventById } from '../services/eventService'; // Assuming you have these functions in your eventService
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker'; // Date Picker for React Native
import DatePicker from 'react-datepicker'; // Date Picker for Web
import 'react-datepicker/dist/react-datepicker.css'; // CSS for the date picker

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { eventId: string } }, 'params'>>();
  const { eventId } = route.params; // Get eventId from the route params

  const [eventDetails, setEventDetails] = useState({
    eventType: '',
    date: new Date(),
    address: '',
    fees: '',
    weather: '',
    indoor: false,
    public: true, // Add public by default
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load the event details when the screen is focused
  useEffect(() => {
    const loadEventData = async () => {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        return;
      }

      try {
        const eventData = await getEventById(eventId, token); // Fetch the event details using the eventId
        if (eventData) {
          setEventDetails({
            eventType: eventData.eventType,
            date: new Date(eventData.date), // Set date using the value from the backend
            address: eventData.address,
            fees: eventData.fees.toString(), // Ensure it's a string for the input field
            weather: eventData.weather,
            indoor: eventData.indoor,
            public: eventData.public, // Ensure 'public' field is set
          });
        } else {
          Alert.alert('Error', 'Event not found');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load event data');
      }
    };

    loadEventData();
  }, [eventId]);

  // Function to handle date change from the Date Picker
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || eventDetails.date; // If no date is selected, use the current date
    setShowDatePicker(false);
    setEventDetails(prevDetails => ({ ...prevDetails, date: currentDate }));
  };

  // Function to handle event update
  const handleEditEvent = async () => {
    const { eventType, address, fees, weather, indoor, public: isPublic, date } = eventDetails;

    if (!eventType || !address || !fees || !weather) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const token = await AsyncStorage.getItem('auth-token');
    if (!token) {
      Alert.alert('Error', 'You are not logged in');
      return;
    }

    // Format the date to ISO string before sending to the backend
    const formattedDate = date.toISOString();

    setLoading(true);
    try {
      const updatedEvent = await editEvent(
        eventId,
        {
          eventType,
          dateString: formattedDate, // Send the date as an ISO string
          address,
          fees: parseFloat(fees), // Parse fees to number
          weather,
          indoor,
          public: isPublic, // Pass the 'public' value as received from state
          updatedDate: new Date().toISOString(), // Set the updatedDate to current date
        },
        token
      );
      if (updatedEvent) {
        Alert.alert('Success', 'Event updated successfully');
        navigation.goBack(); // Navigate back to the previous screen
      } else {
        Alert.alert('Error', 'Failed to update event');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update event');
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEventDetails(prevDetails => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Event</Text>
      <TextInput
        placeholder="Event Type"
        style={styles.input}
        value={eventDetails.eventType}
        onChangeText={value => handleInputChange('eventType', value)}
      />
      
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={eventDetails.address}
        onChangeText={value => handleInputChange('address', value)}
      />

      <TextInput
        placeholder="Fees"
        style={styles.input}
        value={eventDetails.fees}
        onChangeText={value => handleInputChange('fees', value)}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Weather"
        style={styles.input}
        value={eventDetails.weather}
        onChangeText={value => handleInputChange('weather', value)}
      />

      <View style={styles.switchContainer}>
        <Text>Indoor Event:</Text>
        <Switch
          value={eventDetails.indoor}
          onValueChange={value => handleInputChange('indoor', value)}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Public Event:</Text>
        <Switch
          value={eventDetails.public}
          onValueChange={value => handleInputChange('public', value)}
        />
      </View>

      {/* Display the formatted date */}
      <View style={styles.dateContainer}>
        <Text>Date: {eventDetails.date.toLocaleDateString()}</Text>

        {/* Conditional rendering of the Date Picker based on Platform */}
        {Platform.OS === 'web' ? (
          <DatePicker
            selected={eventDetails.date}
            onChange={(date: Date | null) => {
              if (date) {
                setEventDetails(prevDetails => ({ ...prevDetails, date }));
              }
            }}
            dateFormat="MMMM d, yyyy"
          />
        ) : (
          <Button title="Pick Date" onPress={() => setShowDatePicker(true)} />
        )}
      </View>

      {/* Date Picker Modal for mobile */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={eventDetails.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Button 
        title={loading ? 'Updating...' : 'Update Event'} 
        onPress={handleEditEvent} 
        disabled={loading}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
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
  dateContainer: {
    marginBottom: 20,
  },
});

export default EditEventScreen;
