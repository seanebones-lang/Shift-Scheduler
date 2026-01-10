import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Appbar, Button, TextInput, List, FAB, Dialog, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Dashboard: undefined;
  Staff: undefined;
};

type Staff = {
  id: string;
  name: string;
  wage: string;
  skill: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Staff'>;

const STAFF_KEY = '@shift_scheduler_staff';

const StaffScreen = ({ navigation }: Props) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', wage: '', skill: 'general' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const json = await AsyncStorage.getItem(STAFF_KEY);
      if (json) {
        setStaff(JSON.parse(json));
      }
    } catch (e) {
      console.error('Load staff error:', e);
    }
  };

  const saveStaff = async (updatedStaff: Staff[]) => {
    try {
      await AsyncStorage.setItem(STAFF_KEY, JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
    } catch (e) {
      Alert.alert('Error', 'Failed to save staff');
    }
  };

  const addOrUpdateStaff = () => {
    if (!newStaff.name || !newStaff.wage) {
      Alert.alert('Error', 'Name and wage required');
      return;
    }
    const wageNum = parseFloat(newStaff.wage);
    if (isNaN(wageNum) || wageNum <= 0) {
      Alert.alert('Error', 'Valid wage required');
      return;
    }
    const staffItem: Staff = {
      ...newStaff,
      wage: wageNum.toFixed(2),
      id: editingId || Date.now().toString(),
    };
    let updated;
    if (editingId) {
      updated = staff.map(s => s.id === editingId ? staffItem : s);
      setEditingId(null);
    } else {
      updated = [staffItem, ...staff];
    }
    saveStaff(updated);
    setNewStaff({ name: '', wage: '', skill: 'general' });
    setDialogVisible(false);
  };

  const editStaff = (item: Staff) => {
    setNewStaff({ name: item.name, wage: item.wage, skill: item.skill });
    setEditingId(item.id);
    setDialogVisible(true);
  };

  const deleteStaff = (id: string) => {
    Alert.alert('Confirm Delete', 'Remove this staff member?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => saveStaff(staff.filter(s => s.id !== id)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Staff }) => (
    <List.Item
      title={item.name}
      description={`$${item.wage}/hr | Skill: ${item.skill}`}
      left={() => <List.Icon icon="account" />}
      right={() => (
        <View style={styles.itemActions}>
          <Button onPress={() => editStaff(item)} icon="pencil" mode="text" compact>
            Edit
          </Button>
          <Button onPress={() => deleteStaff(item.id)} icon="delete" mode="text" compact textColor="red">
            Delete
          </Button>
        </View>
      )}
    />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Staff Management" />
      </Appbar.Header>
      <View style={styles.container}>
        <FlatList
          data={staff}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<List.Item title="No Staff" description="Tap + to add" left={() => <List.Icon icon="account-plus" />} />}
        />
        <FAB
          icon={editingId ? "check" : "plus"}
          style={styles.fab}
          onPress={() => {
            if (editingId) {
              addOrUpdateStaff();
            } else {
              setDialogVisible(true);
            }
          }}
        />
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => {
            setDialogVisible(false);
            setEditingId(null);
            setNewStaff({ name: '', wage: '', skill: 'general' });
          }}>
            <Dialog.Title>{editingId ? 'Edit Staff' : 'Add Staff'}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Name"
                value={newStaff.name}
                onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
                mode="outlined"
              />
              <TextInput
                label="Hourly Wage ($)"
                value={newStaff.wage}
                keyboardType="decimal-pad"
                onChangeText={(text) => setNewStaff({ ...newStaff, wage: text })}
                mode="outlined"
              />
              <TextInput
                label="Skill"
                value={newStaff.skill}
                onChangeText={(text) => setNewStaff({ ...newStaff, skill: text })}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => {
                setDialogVisible(false);
                setEditingId(null);
                setNewStaff({ name: '', wage: '', skill: 'general' });
              }}>Cancel</Button>
              <Button onPress={addOrUpdateStaff}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default StaffScreen;
