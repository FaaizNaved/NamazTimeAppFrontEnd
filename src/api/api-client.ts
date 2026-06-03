import axios from 'axios';
import { Platform } from 'react-native';

/** Dev API host — Android emulator uses 10.0.2.2 to reach host machine localhost. */
function getBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5199';
  }
  return 'http://localhost:5199';
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
