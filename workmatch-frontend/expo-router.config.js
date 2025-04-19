import 'dotenv/config';
const { withExpoRouter } = require('expo-router/plugin');

module.exports = withExpoRouter({
  origin: 'expo://',
  extra: {
    backendUrl: process.env.REACT_APP_BACKEND_URL,
  },
});
