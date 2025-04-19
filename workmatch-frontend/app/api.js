import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig.extra.backendUrl;

export const fetchJobsFromBackend = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/adzuna/jobs`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch jobs from backend:', error);
        throw error;
    }
};
