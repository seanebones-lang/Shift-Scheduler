import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Title, Paragraph, FAB } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Dashboard: undefined;
  Staff: undefined;
  Forecast: undefined;
  Optimize: undefined;
  Schedule: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation }: Props) => {
  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="ShiftAI Scheduler" />
      </Appbar.Header>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Dashboard</Title>
        <Paragraph style={styles.subtitle}>AI-Powered Shift Optimization</Paragraph>
        <View style={styles.buttonsContainer}>
          <Card style={styles.card} onPress={() => handleNavigate('Staff')}>
            <Card.Content>
              <Title>👥 Manage Staff</Title>
              <Paragraph>Add, edit, or remove staff members with wages & skills</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleNavigate('Forecast')}>
            <Card.Content>
              <Title>📈 Sales & Forecast</Title>
              <Paragraph>Input historical sales for next 7-day demand prediction</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleNavigate('Optimize')}>
            <Card.Content>
              <Title>⚙️ Optimize Schedule</Title>
              <Paragraph>Generate cost-optimal shifts based on forecast & staff</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleNavigate('Schedule')}>
            <Card.Content>
              <Title>📅 View Schedule</Title>
              <Paragraph>Calendar view of assigned shifts & total cost</Paragraph>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <FAB
        icon="refresh"
        label="Refresh Data"
        style={styles.fab}
        onPress={() => {/* TODO: Reload storage */}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  buttonsContainer: {
    gap: 16,
  },
  card: {
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
