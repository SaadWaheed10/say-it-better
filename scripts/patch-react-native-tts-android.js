/**
 * react-native-tts still references removed Gradle jcenter().
 * Rewrite its Android build.gradle for modern AGP / RN.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-tts',
  'android',
  'build.gradle',
);

const contents = `def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

apply plugin: 'com.android.library'

android {
    namespace "net.no_mad.tts"
    compileSdkVersion safeExtGet('compileSdkVersion', 34)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 24)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
        versionCode 1
        versionName "1.0"
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`;

if (!fs.existsSync(target)) {
  console.warn('[SayItBetter] react-native-tts android build.gradle not found; skip patch.');
  process.exit(0);
}

fs.writeFileSync(target, contents);
console.log('[SayItBetter] Patched react-native-tts Android Gradle (removed jcenter).');
