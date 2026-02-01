const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'wasm' and 'db' to asset extensions
config.resolver.assetExts.push('wasm');
config.resolver.assetExts.push('db');

module.exports = config;
