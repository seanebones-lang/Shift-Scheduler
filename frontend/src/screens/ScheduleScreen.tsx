import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, FAB, Card, Title, Paragraph, Button, DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Schedule: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

type Shift = {
  staff_id: string;
  name: string;
  start: string;
  end: string;
  cost: number;
};

const SCHEDULE_KEY = '@shift_scheduler_schedule';

const ScheduleScreen = ({ navigation }: Props) => {
  const [schedule, setSchedule] = useState<{ shifts: Shift[]; total_cost: number } | null>(null);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const json = await AsyncStorage.getItem(SCHEDULE_KEY);
      if (json) {
        const data = JSON.parse(json);
        setSchedule(data);
        // Mark dates with shifts
        const marks: any = {};
        data.shifts.forEach(shift => {
          const dateStr = new Date(shift.start).toISOString().split('T')[0];
          marks[dateStr] = { marked: true, dotColor: 'blue' };
        });
        setMarkedDates(marks);
      }
    } catch (e) {
      Alert.alert('Error', 'No schedule found. Optimize first!');
    }
  };

  const filterShiftsByDate = (date: string) => {
    if (!schedule) return [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return schedule.shifts.filter(shift => {
      const shiftStart = new Date(shift.start);
      return shiftStart >= startOfDay && shiftStart <= endOfDay;
    });
  };

  const exportSchedule = async () => {
    if (!schedule) return;
    try {
      const json = JSON.stringify(schedule, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schedule.json';
        a.click();
      } else {
        Alert.alert('Export', 'Copy JSON to clipboard or share');
        // TODO: Clipboard/Share
      }
    } catch (e) {
      Alert.alert('Error', 'Export failed');
    }
  };

  const shiftsToday = filterShiftsByDate(selectedDate);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Shift Schedule" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        {schedule ? (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Title>Weekly Total: ${schedule.total_cost.toFixed(2)}</Title>
                <Paragraph>{schedule.shifts.length} shifts assigned</Paragraph>
              </Card.Content>
            </Card>

            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              current={format(new Date(), 'yyyy-MM-dd')}
              style={styles.calendar}
            />

            <Card style={styles.shiftsCard}>
              <Card.Content>
                <Title>Shifts on {format(new Date(selectedDate), 'MMM dd, yyyy')}</Title>
                {shiftsToday.length === 0 ? (
                  <Paragraph>No shifts</Paragraph>
                ) : (
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Staff</DataTable.Title>
                      <DataTable.Title>Time</DataTable.Title>
                      <DataTable.Title>Duration</DataTable.Title>
                      <DataTable.Title>Cost</DataTable.Title>
                    </DataTable.Header>
                    {shiftsToday.map((shift, idx) => {
                      const start = new Date(shift.start);
                      const end = new Date(shift.end);
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      return (
                        <DataTable.Row key={idx}>
                          <DataTable.Cell>{shift.name}</DataTable.Cell>
                          <DataTable.Cell>{start.toLocaleTimeString()} - {end.toLocaleTimeString()}</DataTable.Cell>
                          <DataTable.Cell>{duration.toFixed(1)}h</DataTable.Cell>
                          <DataTable.Cell>${shift.cost.toFixed(2)}</DataTable.Cell>
                        </DataTable.Row>
                      );
                    })}
                  </DataTable>
                )}
              </Card.Content>
            </Card>

            <Button icon="download" mode="contained" onPress={exportSchedule} style={styles.button}>
              Export JSON
            </Button>
          </>
        ) : (
          <Card>
            <Card.Content>
              <Title>No Schedule</Title>
              <Paragraph>Run optimization first!</Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      <FAB
        icon="home"
        style={styles.fab}
        onPress={() => navigation.navigate('Dashboard' as any)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
  },
  calendar: {
    margin: 16,
  },
  shiftsCard: {
    margin: 16,
  },
  button: {
    margin: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ScheduleScreen;
