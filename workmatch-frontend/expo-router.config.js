import 'dotenv/config';
const { withExpoRouter } = require('expo-router/plugin');

module.exports = withExpoRouter({
  origin: 'expo://',
  extra: {
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
  },
});
