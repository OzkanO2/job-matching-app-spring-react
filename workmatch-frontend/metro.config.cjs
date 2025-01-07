const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs'); // Ajoute le support des fichiers .mjs

module.exports = config;
