import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlappyBirdScreen from './Lab2/FlappyBirdScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <FlappyBirdScreen onPlay={() => console.log('Play pressed!')} />
    </SafeAreaProvider>
  );
}