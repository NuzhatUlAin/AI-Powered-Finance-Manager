import React, { useState } from 'react';
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import colors from '../constants/colors';

const AddExpenseModal = ({
  visible,
  onClose,
  onSave,
  categoryId,
  categoryName,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const resetFields = () => {
    setName('');
    setAmount('');
    setNotes('');
  };

  const handleSave = () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Oops!', 'Name and amount are required');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    onSave({
      id: Date.now().toString(),
      categoryId,
      name: name.trim(),
      amount: parsedAmount,
      notes: notes.trim(),
      date: today,
      month,
    });

    resetFields();
    onClose();
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        <View style={styles.centeredView}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Add to {categoryName || 'Collection'}
              </Text>

              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item description"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any notes?"
              placeholderTextColor={colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  sheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },

  closeBtn: {
    fontSize: 24,
    color: colors.textLight,
    marginLeft: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: colors.text,
  },

  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
});

export default AddExpenseModal;