import axios from 'axios';

export const fetchExternalJobOffers = async (location) => {
    try {
        const response = await axios.get('http://localhost:8080/joboffers/external', { params: { location } });
        return response.data;
    } catch (error) {
        console.error('Error fetching job offers:', error);
        throw error;
    }
};
