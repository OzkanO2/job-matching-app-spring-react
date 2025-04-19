import 'dotenv/config';
const { withExpoRouter } = require('expo-router/plugin');

export default {
  expo: {
    name: 'workmatch-frontend',
    slug: 'workmatch-frontend',
    extra: {
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
    },
  },
};