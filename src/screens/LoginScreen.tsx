import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { login } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../navigation/types'; // Adjust based on your project structure


const LoginScreen = () => {
  const [identifier, setIdentifier] = useState(''); // Updated to reflect either username or email
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false); // State to track login error
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    try {
      const response = await login(identifier, password); // Updated parameter name
      if (response.token) {
        navigation.navigate('Home');
        setLoginError(false); // Reset error state on successful login
      } else {
        setLoginError(true); // Set error state if login fails
        Alert.alert('Error', response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(true); // Set error state on exception
      Alert.alert('Error', 'An error occurred during login. Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username or Email" // Updated placeholder text
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => {}}
        placeholderTextColor="#A9A9A9" 
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        placeholderTextColor="#A9A9A9" 
      />
      <Button title="Login" onPress={handleLogin} />
      {loginError && ( // Conditionally render the forgot password link
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          <Button 
            title="Reset Password"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
        </View>
      )}
      <View style={styles.registerContainer}>
        <Text>Don't have an account?</Text>
        <Button title="Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  registerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    marginBottom: 8,
  },
});

export default LoginScreen;
