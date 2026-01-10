import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Appbar, Button, DataTable, FAB, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { optimizeShifts } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Optimize: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Optimize'>;

type Staff = {
  id: string;
  name: string;
  wage: string;
  skill: string;
};

type ForecastInterval = {
  time: string;
  demand: number;
};

type Shift = {
  staff_id: string;
  name: string;
  start: string;
  end: string;
  cost: number;
};

const STAFF_KEY = '@shift_scheduler_staff';
const FORECAST_KEY = '@shift_scheduler_forecast';
const SCHEDULE_KEY = '@shift_scheduler_schedule';

const OptimizeScreen = ({ navigation }: Props) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [forecast, setForecast] = useState<ForecastInterval[]>([]);
  const [schedule, setSchedule] = useState<{ shifts: Shift[]; total_cost: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffJson, forecastJson] = await Promise.all([
        AsyncStorage.getItem(STAFF_KEY),
        AsyncStorage.getItem(FORECAST_KEY),
      ]);
      if (staffJson) setStaff(JSON.parse(staffJson));
      if (forecastJson) {
        const f: any[] = JSON.parse(forecastJson);
        setForecast(f.map((i: any) => ({ time: i.time, demand: i.demand })));
      }
    } catch (e) {
      Alert.alert('Load Error', 'Check staff & forecast data');
    }
  };

  const saveSchedule = async (data: { shifts: Shift[]; total_cost: number }) => {
    try {
      await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(data));
      setSchedule(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to save schedule');
    }
  };

  const runOptimization = async () => {
    if (staff.length === 0) {
      Alert.alert('Missing Data', 'Add staff first');
      return;
    }
    if (forecast.length === 0) {
      Alert.alert('Missing Data', 'Generate forecast first');
      return;
    }
    setLoading(true);
    try {
      const staffParsed = staff.map(s => ({
        ...s,
        wage: parseFloat(s.wage),
      }));
      const result = await optimizeShifts({ forecast, staff: staffParsed });
      await saveSchedule(result);
      Alert.alert('Optimized!', `Total cost: $${result.total_cost.toFixed(2)}`);
    } catch (e: any) {
      Alert.alert('Optimization Error', e.response?.data?.detail || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const clearSchedule = () => {
    Alert.alert('Clear?', 'Remove schedule?', [
      { text: 'Cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          await AsyncStorage.removeItem(SCHEDULE_KEY);
          setSchedule(null);
        },
      },
    ]);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Optimize Schedule" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Ready? {staff.length} staff, {forecast.length} forecast hours</Title>
            <Paragraph>OR-Tools will assign minimal cost shifts to meet demand.</Paragraph>
            <Button
              icon="rocket-launch"
              mode="contained"
              onPress={runOptimization}
              loading={loading}
              style={styles.optimizeButton}
              disabled={loading}
            >
              Run AI Optimization
            </Button>
          </Card.Content>
        </Card>

        {schedule && (
          <>
            <Button icon="delete" onPress={clearSchedule} style={styles.button}>
              Clear Schedule
            </Button>
            <DataTable style={styles.table}>
              <DataTable.Header>
                <DataTable.Title>Staff</DataTable.Title>
                <DataTable.Title>Shift</DataTable.Title>
                <DataTable.Title>Duration</DataTable.Title>
                <DataTable.Title>Cost</DataTable.Title>
              </DataTable.Header>
              {schedule.shifts.map((shift, idx) => {
                const start = new Date(shift.start);
                const end = new Date(shift.end);
                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                return (
                  <DataTable.Row key={idx}>
                    <DataTable.Cell>{shift.name}</DataTable.Cell>
                    <DataTable.Cell>{start.toLocaleString()} - {end.toLocaleString()}</DataTable.Cell>
                    <DataTable.Cell>{duration.toFixed(1)}h</DataTable.Cell>
                    <DataTable.Cell>${shift.cost.toFixed(2)}</DataTable.Cell>
                  </DataTable.Row>
                );
              })}
              <DataTable.Row>
                <DataTable.Cell />
                <DataTable.Cell />
                <DataTable.Cell />
                <DataTable.Cell style={{ fontWeight: 'bold' }}>${schedule.total_cost.toFixed(2)}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </>
        )}
      </ScrollView>
      {schedule && (
        <FAB
          icon="calendar"
          label="View Calendar"
          style={styles.fab}
          onPress={() => navigation.navigate('Schedule' as any)} // TODO: Add screen
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  optimizeButton: {
    marginTop: 8,
  },
  button: {
    marginVertical: 8,
  },
  table: {
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default OptimizeScreen;
