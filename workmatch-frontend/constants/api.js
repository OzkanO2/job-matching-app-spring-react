import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔁 Change ici uniquement pour local vs distant
const isLocal = false; // ⬅️ true = localhost | false = Render

const BASE_URL = isLocal
    ? 'http://localhost:8080' // BACKEND local
  : 'https://projet-workmatch.onrender.com';

axios.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
export const fetchJobsFromBackend = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/adzuna/jobs`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch jobs from backend:', error);
        throw error;
    }
};
export { BASE_URL };
