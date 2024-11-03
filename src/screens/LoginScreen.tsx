import React, { useState, useRef } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { login } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const passwordInputRef = useRef<TextInput>(null); // Ref for password input

  const handleLogin = async () => {
    try {
      const response = await login(identifier, password);
      if (response.token) {
        navigation.navigate('Home');
        setLoginError(false);
      } else {
        setLoginError(true);
        Alert.alert('Error', response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(true);
      Alert.alert('Error', 'An error occurred during login. Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        returnKeyType="next"
        placeholderTextColor="#A9A9A9"
        blurOnSubmit={false}
        onSubmitEditing={() => passwordInputRef.current?.focus()} // Focus on password input
      />
      <View style={styles.passwordContainer}>
        <TextInput
          ref={passwordInputRef} // Use the ref here
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, styles.passwordInput]}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity
          onPressIn={() => setIsPasswordVisible(true)}
          onPressOut={() => setIsPasswordVisible(false)}
          style={styles.iconContainer}
        >
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="#A9A9A9"
          />
        </TouchableOpacity>
      </View>
      <Button title="Login" onPress={handleLogin} />
      {loginError && (
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    padding: 4,
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
