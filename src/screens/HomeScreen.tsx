// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types'; // Adjust path accordingly
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have the right icon
import { logout } from '../services/authService'; // Import your logout function
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use the defined type
  const [username, setUsername] = useState<string | null>(null); // State to hold username

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

  // Fetch username when the component mounts or when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', getUsername); // Fetch username when screen is focused
    getUsername(); // Call the function to get the username

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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome {capitalizeFirstLetter(username)}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});

export default HomeScreen;
