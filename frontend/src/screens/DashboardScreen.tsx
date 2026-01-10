import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Button, Card, Title, Paragraph, FAB } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Dashboard: undefined;
  // Add more later: Staff, Sales, etc.
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation }: Props) => {
  const handleAction = (action: string) => {
    Alert.alert('Coming Soon', `${action} feature will be implemented here.`);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Shift Scheduler" />
      </Appbar.Header>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Dashboard</Title>
        <Paragraph style={styles.subtitle}>Manage your shifts with AI power</Paragraph>
        <View style={styles.buttonsContainer}>
          <Card style={styles.card} onPress={() => handleAction('Manage Staff')}>
            <Card.Content>
              <Title>Manage Staff</Title>
              <Paragraph>Add or edit staff members</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleAction('Upload Sales')}>
            <Card.Content>
              <Title>Sales History</Title>
              <Paragraph>Upload historical sales data</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleAction('Forecast')}>
            <Card.Content>
              <Title>Generate Forecast</Title>
              <Paragraph>Demand prediction</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleAction('Optimize')}>
            <Card.Content>
              <Title>Optimize Schedule</Title>
              <Paragraph>AI shift assignment</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.card} onPress={() => handleAction('View Schedule')}>
            <Card.Content>
              <Title>View Schedule</Title>
              <Paragraph>Calendar view</Paragraph>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => handleAction('Quick Add')}
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
