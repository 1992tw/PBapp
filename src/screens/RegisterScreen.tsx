import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { register } from '../services/authService';

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // New email state
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const data = await register(username, email, password); // Pass email
      Alert.alert('Success', data.message || 'Registration successful!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#A9A9A9" 
        value={username}
        onChangeText={setUsername}
        returnKeyType="next" // Show 'next' on the keyboard
        onSubmitEditing={() => {}}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A9A9A9" 
        value={email}
        onChangeText={setEmail}
        returnKeyType="next" // Show 'next' on the keyboard
        onSubmitEditing={() => {}} // Allows for multi-line editing
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A9A9A9" 
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        returnKeyType="done" // Show 'done' on the keyboard
        onSubmitEditing={handleRegister} // Calls handleRegister on 'Enter'
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default RegisterScreen;
