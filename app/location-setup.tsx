import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { DropdownPicker } from '@/components/common/dropdown-picker';
import { locationApi } from '@/api/location-api';
import { storageService } from '@/services/storage-service';

export default function LocationSetupScreen() {
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStates();
      setSelectedState('');
      setSelectedCity('');
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      loadCities();
      setSelectedCity('');
    }
  }, [selectedState]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const data = await locationApi.getCountries();
      setCountries(data);
    } catch {
      Alert.alert('Error', 'Failed to load countries. Please check your connection.');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const data = await locationApi.getStates();
      setStates(data);
    } catch {
      Alert.alert('Error', 'Failed to load states.');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async () => {
    try {
      setLoadingCities(true);
      const data = await locationApi.getCities();
      setCities(data);
    } catch {
      Alert.alert('Error', 'Failed to load cities.');
    } finally {
      setLoadingCities(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedCountry || !selectedState || !selectedCity) {
      Alert.alert('Incomplete', 'Please select your country, state, and city.');
      return;
    }

    try {
      setSaving(true);
      const resolved = await locationApi.resolveLocation(
        selectedCountry,
        selectedState,
        selectedCity
      );
      await storageService.saveLocation({
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        locationCode: resolved?.code,
      });
      router.replace('/(main)/home');
    } catch {
      Alert.alert('Error', 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  const isComplete = selectedCountry && selectedState && selectedCity;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with icon */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: theme.primary + '12',
                borderColor: theme.accent + '50',
                borderWidth: 2,
                ...Shadows.lg,
              },
            ]}
          >
            <MaterialCommunityIcons name="mosque" size={56} color={theme.primary} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Assalamu Alaikum
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Select your location to get accurate prayer times
          </Text>
        </View>

        {/* Dropdowns */}
        <View style={styles.formSection}>
          <DropdownPicker
            label="Country"
            placeholder="Select your country"
            items={countries}
            selectedValue={selectedCountry}
            onSelect={setSelectedCountry}
            loading={loadingCountries}
          />

          <DropdownPicker
            label="State"
            placeholder="Select your state"
            items={states}
            selectedValue={selectedState}
            onSelect={setSelectedState}
            disabled={!selectedCountry}
            loading={loadingStates}
          />

          <DropdownPicker
            label="City"
            placeholder="Select your city"
            items={cities}
            selectedValue={selectedCity}
            onSelect={setSelectedCity}
            disabled={!selectedState}
            loading={loadingCities}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: isComplete ? theme.primary : theme.border,
              ...Shadows.md,
            },
          ]}
          onPress={handleContinue}
          disabled={!isComplete || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name="star"
                size={18}
                color={isComplete ? theme.accent : theme.textMuted}
              />
              <Text
                style={[
                  styles.continueText,
                  { color: isComplete ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                Continue
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isComplete ? '#FFFFFF' : theme.textMuted}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Decorative bottom */}
        <View style={styles.decorativeRow}>
          <View style={[styles.decorativeLine, { backgroundColor: theme.accent + '40' }]} />
          <Ionicons name="moon" size={16} color={theme.accent} />
          <View style={[styles.decorativeLine, { backgroundColor: theme.accent + '40' }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: Spacing.xxxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  decorativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  decorativeLine: {
    height: 1,
    width: 60,
  },
});
