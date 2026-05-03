import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const FolderCard = ({ folder, spent, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: folder.color }]}
      onPress={onPress}
    >
      <Text style={styles.folderName}>{folder.name}</Text>
      <Text style={styles.spending}>
        Rs {spent.toFixed(0)} spent
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  spending: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});

export default FolderCard;
