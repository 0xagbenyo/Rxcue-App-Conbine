import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FamilyMembersScreen = ({ navigation }: any) => {
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4568',
      email: 'jane.doe@example.com',
    },
    {
      id: '2',
      name: 'Johnny Doe',
      relationship: 'Son',
      phone: '+1 (555) 123-4569',
      email: 'johnny.doe@example.com',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
    };

    setFamilyMembers([...familyMembers, member]);
    setNewMember({ name: '', relationship: '', phone: '', email: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Family member added successfully!');
  };

  const handleRemoveMember = (id: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this family member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(familyMembers.filter(member => member.id !== id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Members</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {familyMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRelationship}>{member.relationship}</Text>
              <Text style={styles.memberPhone}>{member.phone}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(member.id)}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}

        {familyMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No family members added yet</Text>
            <Text style={styles.emptySubtext}>Add family members to manage their health profiles</Text>
          </View>
        )}
      </ScrollView>

      {showAddForm && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newMember.name}
              onChangeText={(text) => setNewMember({ ...newMember, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g., Spouse, Son, Daughter)"
              value={newMember.relationship}
              onChangeText={(text) => setNewMember({ ...newMember, relationship: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newMember.phone}
              onChangeText={(text) => setNewMember({ ...newMember, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              value={newMember.email}
              onChangeText={(text) => setNewMember({ ...newMember, email: text })}
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
              <Text style={styles.addButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilyMembersScreen; 