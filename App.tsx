import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ResumeScreen from './Lab1/ResumeScreen';
import SentimentScreen from './Lab1/SentimentScreen';

export default function App() {
  const [tab, setTab] = useState<'resume' | 'sentiment'>('resume');

  return (
    <SafeAreaProvider>
      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, tab === 'resume' && s.tabActive]}
          onPress={() => setTab('resume')}
        >
          <Text style={[s.tabText, tab === 'resume' && s.tabTextActive]}>
            Ex 1 · Resume
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'sentiment' && s.tabActive]}
          onPress={() => setTab('sentiment')}
        >
          <Text style={[s.tabText, tab === 'sentiment' && s.tabTextActive]}>
            Ex 2 · Sentiment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screens */}
      {tab === 'resume' ? <ResumeScreen /> : <SentimentScreen />}
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111620',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
    paddingTop: 48,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7E95',
  },
  tabTextActive: {
    color: '#38BDF8',
  },
});