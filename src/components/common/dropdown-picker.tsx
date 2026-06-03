import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

interface DropdownPickerProps {
  label: string;
  placeholder: string;
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function DropdownPicker({
  label,
  placeholder,
  items,
  selectedValue,
  onSelect,
  disabled = false,
  loading = false,
}: DropdownPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: theme.card,
            borderColor: selectedValue ? theme.primary : theme.border,
            opacity: disabled ? 0.5 : 1,
            ...Shadows.sm,
          },
        ]}
        onPress={() => !disabled && !loading && setIsOpen(true)}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedValue ? theme.text : theme.textMuted,
            },
          ]}
        >
          {loading ? 'Loading...' : selectedValue || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card, ...Shadows.lg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select {label}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    {
                      borderBottomColor: theme.borderLight,
                      backgroundColor:
                        item === selectedValue ? theme.primary + '12' : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: item === selectedValue ? theme.primary : theme.text,
                        fontWeight: item === selectedValue ? '600' : '400',
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {item === selectedValue && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  optionsList: {
    paddingHorizontal: Spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.sm,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
  },
});
