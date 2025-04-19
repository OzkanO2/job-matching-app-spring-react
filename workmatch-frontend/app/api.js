import axios from 'axios';

const BASE_URL = 'process.env.REACT_APP_BACKEND_URL';

export const fetchJobsFromBackend = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/adzuna/jobs`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch jobs from backend:', error);
        throw error;
    }
};
