import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Appbar, Button, DataTable, FAB, Portal, Dialog, TextInput, Switch, HelperText, Card } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { forecastSales } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Forecast: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Forecast'>;

type SalesPoint = { ds: string; y: number };
type ForecastInterval = { time: string; demand: number; confidence_low: number; confidence_high: number };

const FORECAST_KEY = '@shift_scheduler_forecast';
const HISTORY_KEY = '@shift_scheduler_history';

const ForecastScreen = ({ navigation }: Props) => {
  const [forecast, setForecast] = useState<ForecastInterval[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [manualHistory, setManualHistory] = useState<SalesPoint[]>([]);
  const [newPoint, setNewPoint] = useState({ ds: '', y: '' });

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      const json = await AsyncStorage.getItem(FORECAST_KEY);
      if (json) {
        const data: ForecastInterval[] = JSON.parse(json);
        setForecast(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveForecast = async (data: ForecastInterval[]) => {
    try {
      await AsyncStorage.setItem(FORECAST_KEY, JSON.stringify(data));
      setForecast(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to save forecast');
    }
  };

  const pickCSV = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.csv],
      });
      if (Platform.OS === 'web') {
        // Web CSV parse
        const text = await result[0].file?.text();
        if (text) {
          const lines = text.split('\n').slice(1); // Skip header
          const history: SalesPoint[] = lines
            .map(line => {
              const [ds, y] = line.split(',');
              return { ds: ds?.trim() || '', y: parseFloat(y || '0') };
            })
            .filter(p => p.ds && !isNaN(p.y));
          if (history.length >= 14) {
            generateForecast(history);
          } else {
            Alert.alert('Error', 'Need at least 14 data points (CSV: ds,y)');
          }
        }
      } else {
        Alert.alert('CSV', 'Parse manually or use JSON endpoint');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const addManualPoint = () => {
    const yNum = parseFloat(newPoint.y);
    if (!newPoint.ds || isNaN(yNum)) {
      Alert.alert('Error', 'Valid date (YYYY-MM-DD) and sales required');
      return;
    }
    setManualHistory([...manualHistory, { ds: newPoint.ds, y: yNum }]);
    setNewPoint({ ds: '', y: '' });
  };

  const generateForecast = async (history: SalesPoint[]) => {
    if (history.length < 14) {
      Alert.alert('Error', 'At least 14 historical points needed for Prophet');
      return;
    }
    setLoading(true);
    try {
      const result = await forecastSales(history);
      const positiveIntervals = result.intervals.filter(i => i.demand > 0);
      await saveForecast(positiveIntervals);
      Alert.alert('Success', `Forecast generated: ${positiveIntervals.length} hours`);
      if (manualHistory.length) setManualHistory([]);
    } catch (e) {
      Alert.alert('Forecast Error', e.response?.data?.detail || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const clearForecast = () => {
    Alert.alert('Clear?', 'Remove forecast?', [
      { text: 'Cancel' },
      { text: 'Clear', onPress: async () => {
        await AsyncStorage.removeItem(FORECAST_KEY);
        setForecast([]);
      }},
    ]);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sales Forecast" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Button icon="file-upload" mode="contained" onPress={pickCSV} style={styles.button} loading={loading}>
              Pick Sales CSV
            </Button>
            <Button icon="keyboard" mode="outlined" onPress={() => setShowForm(true)} style={styles.button}>
              Manual Input
            </Button>
            <HelperText>CSV format: ds (date), y (sales). At least 14 rows.</HelperText>
          </Card.Content>
        </Card>

        {forecast.length > 0 && (
          <>
            <Button icon="delete" onPress={clearForecast} style={styles.button}>
              Clear Forecast
            </Button>
            <DataTable style={styles.table}>
              <DataTable.Header>
                <DataTable.Title>Time</DataTable.Title>
                <DataTable.Title>Demand</DataTable.Title>
                <DataTable.Title>Low</DataTable.Title>
                <DataTable.Title>High</DataTable.Title>
              </DataTable.Header>
              {forecast.slice(0, 24).map((item, idx) => ( // Show first day
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{new Date(item.time).toLocaleTimeString()}</DataTable.Cell>
                  <DataTable.Cell>{item.demand.toFixed(1)}</DataTable.Cell>
                  <DataTable.Cell>{item.confidence_low.toFixed(1)}</DataTable.Cell>
                  <DataTable.Cell>{item.confidence_high.toFixed(1)}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
            <HelperText type="info">Showing first 24h of 168h forecast. Ready for optimization!</HelperText>
          </>
        )}
      </ScrollView>
      <FAB icon="play" style={styles.fab} onPress={() => {/* To Optimize */}} disabled={!forecast.length || loading} />

      {/* Manual Input Dialog */}
      <Portal>
        <Dialog visible={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Title>Add Sales Points</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="Date (YYYY-MM-DD HH:MM)"
                value={newPoint.ds}
                onChangeText={(text) => setNewPoint({ ...newPoint, ds: text })}
                placeholder="2024-01-01 10:00"
              />
              <TextInput
                label="Sales (y)"
                value={newPoint.y}
                keyboardType="numeric"
                onChangeText={(text) => setNewPoint({ ...newPoint, y: text })}
              />
              <Button onPress={addManualPoint} style={styles.button}>Add Point</Button>
              <Button
                onPress={async () => {
                  if (manualHistory.length >= 14) {
                    await generateForecast(manualHistory);
                    setShowForm(false);
                  } else {
                    Alert.alert('Need more', `Add ${14 - manualHistory.length} more points`);
                  }
                }}
                disabled={manualHistory.length < 14}
                mode="contained"
              >
                Generate ({manualHistory.length}/14)
              </Button>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
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

export default ForecastScreen;
