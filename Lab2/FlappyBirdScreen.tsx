import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function FlappyBirdScreen({ onPlay }: { onPlay?: () => void }) {
  // Bird bobbing animation
  const birdY = useRef(new Animated.Value(0)).current;
  // Play button pulse
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bob bird up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(birdY, {
          toValue: -12,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(birdY, {
          toValue: 12,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(btnScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      {/* Background */}
      <Image
        source={require("../assets/background.png")}
        style={s.background}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={s.content}>
        {/* Title */}
        <Image
          source={require("../assets/title.png")}
          style={s.title}
          resizeMode="contain"
        />

        {/* Bird */}
        <Animated.Image
          source={require("../assets/bird_main.jpg")}
          style={[s.bird, { transform: [{ translateY: birdY }] }]}
          resizeMode="contain"
        />

        {/* Play button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity onPress={onPlay} activeOpacity={0.85}>
            <Image
              source={require("../assets/play.png")}
              style={s.playBtn}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  background: {
    position: "absolute",
    width,
    height,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  title: {
    width: width * 0.65,
    height: 80,
  },
  bird: {
    width: 80,
    height: 60,
  },
  playBtn: {
    width: 120,
    height: 60,
  },
});