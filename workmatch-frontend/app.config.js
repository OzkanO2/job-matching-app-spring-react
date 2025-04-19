import 'dotenv/config';

export default {
  expo: {
    extra: {
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
    }
  }
};
