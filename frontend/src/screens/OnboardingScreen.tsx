import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, Title, Paragraph } from 'react-native-paper';

const OnboardingScreen = ({ navigation }: any) => {
  const handleGetStarted = async () => {
    // Set onboarded flag
    // navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Title>Welcome to Shift Scheduler</Title>
          <Paragraph>AI-powered shift optimization for your team.</Paragraph>
          <Button mode="contained" onPress={handleGetStarted}>
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
    padding: 20,
  },
});

export default OnboardingScreen;
