// App.tsx — add ImageGalleryScreen to your navigator
// This is a PATCH example showing where to add Homework3.
// Adjust to match your actual navigator (Stack, Tab, Drawer, etc.)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// existing screens
import ResumeScreen from './Lab1/ResumeScreen';
import SentimentScreen from './Lab1/SentimentScreen';
import FlappyBirdScreen from './Lab2/FlappyBirdScreen';
import SpeechTranslatorScreen from './Lab2_TextToSpeech/SpeechTranslatorScreen';

// new homework screen
import ImageGalleryScreen from './Homework3/ImageGalleryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ImageGallery" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ResumeScreen" component={ResumeScreen} />
        <Stack.Screen name="Sentiment" component={SentimentScreen} />
        <Stack.Screen name="FlappyBird" component={FlappyBirdScreen} />
        <Stack.Screen name="SpeechTranslator" component={SpeechTranslatorScreen} />
        <Stack.Screen name="ImageGallery" component={ImageGalleryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
