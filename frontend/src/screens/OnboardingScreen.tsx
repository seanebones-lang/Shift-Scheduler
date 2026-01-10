import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = ({ navigation }: any) => {
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save onboarding status');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome to ShiftAI Scheduler</Title>
          <Paragraph style={styles.paragraph}>Optimize your team's shifts with AI forecasting and advanced optimization.</Paragraph>
          <Button mode="contained" onPress={handleGetStarted} style={styles.button}>
            Get Started
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    elevation: 4,
  },
  title: {
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default OnboardingScreen;
