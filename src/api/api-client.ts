import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isEmulator = Constants.appOwnership === 'expo';

function getBaseUrl() {
  return __DEV__
    ? 'http://10.0.2.2:5199'
    : 'https://azaantime-1.onrender.com';
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
