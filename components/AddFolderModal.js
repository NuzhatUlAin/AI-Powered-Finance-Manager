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
  Platform,
} from 'react-native';
import colors from '../constants/colors';

const SWATCH_COLORS = ['#F4A7B9', '#C9B8E8', '#B5EAD7', '#FFDAC1', '#FDFD96', '#C7CEEA'];

const AddFolderModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SWATCH_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Category name is required');
      return;
    }

    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      color: selectedColor,
    });

    setName('');
    setSelectedColor(SWATCH_COLORS[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.centeredView}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Category</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
            />

          <Text style={styles.colorLabel}>Pick your color:</Text>
          <View style={styles.swatchRow}>
            {SWATCH_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.swatchSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Create Category</Text>
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
  },
  closeBtn: {
    fontSize: 24,
    color: colors.textLight,
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
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginVertical: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  swatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
});

export default AddFolderModal;
