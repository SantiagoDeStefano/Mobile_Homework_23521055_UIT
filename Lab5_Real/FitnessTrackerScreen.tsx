import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";

type Stats = {
  steps: number;
  calories: number;
  points: number;
};

class BoundFitnessService {
  private steps = 0;

  addSteps(value: number) {
    this.steps += value;
  }

  async getStats(): Promise<Stats> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      steps: this.steps,
      calories: this.steps * 0.04,
      points: Math.floor(this.steps / 100),
    };
  }

  reset() {
    this.steps = 0;
  }
}

export default function FitnessTrackerScreen() {
  const serviceRef = useRef(new BoundFitnessService());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [points, setPoints] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState(
    "Press Gemini Suggestion to get advice.",
  );

  const badgeScale = useRef(new Animated.Value(1)).current;

  const goal = 10000;
  const progress = Math.min(steps / goal, 1);

  const badges = [
    { name: "Beginner", value: 1000 },
    { name: "Adventurer", value: 3000 },
    { name: "Hero", value: 5000 },
    { name: "Legend", value: 10000 },
  ];

  const earnedBadges = badges.filter((b) => steps >= b.value);

  useEffect(() => {
    if (earnedBadges.length > 0) {
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [earnedBadges.length]);

  useEffect(() => {
    return () => stopBackgroundService();
  }, []);

  const asyncTaskCalculate = async (newSteps: number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCalories(Number((newSteps * 0.04).toFixed(2)));
    setPoints(Math.floor(newSteps / 100));
  };

  const startBackgroundService = () => {
    if (intervalRef.current) return;

    setIsTracking(true);
    setLog((prev) => ["Background Service started", ...prev]);

    intervalRef.current = setInterval(() => {
      const randomSteps = Math.floor(Math.random() * 500) + 100;

      serviceRef.current.addSteps(randomSteps);

      serviceRef.current.getStats().then((stats) => {
        setSteps(stats.steps);
        asyncTaskCalculate(stats.steps);

        setLog((prev) => [
          `Logged +${randomSteps} steps. Total: ${stats.steps}`,
          ...prev.slice(0, 7),
        ]);
      });
    }, 1500);
  };

  const stopBackgroundService = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    setLog((prev) => ["Background Service stopped", ...prev]);
  };

  const startForegroundService = () => {
    Alert.alert(
      "Foreground Service",
      `Tracking active: ${steps} steps\nKeep moving, hero!`,
    );

    setLog((prev) => [
      `Foreground notification shown: ${steps} steps`,
      ...prev.slice(0, 7),
    ]);
  };

  const bindToService = async () => {
    const stats = await serviceRef.current.getStats();

    setSteps(stats.steps);
    setCalories(Number(stats.calories.toFixed(2)));
    setPoints(stats.points);

    setLog((prev) => [
      `Bound Service returned: ${stats.steps} steps`,
      ...prev.slice(0, 7),
    ]);
  };

  const resetTracker = () => {
    stopBackgroundService();
    serviceRef.current.reset();

    setSteps(0);
    setCalories(0);
    setPoints(0);
    setSuggestion("Press Gemini Suggestion to get advice.");
    setLog(["Tracker reset"]);
  };

  const getGeminiSuggestion = async () => {
    const text =
      steps >= 10000
        ? "Amazing! You reached your goal. Take a light walk tomorrow to recover."
        : steps >= 5000
          ? "Good progress. Try a 20-minute jog to reach 10,000 steps."
          : "Start with a short 10-minute walk. Small quests still count.";

    setSuggestion(text);

    setLog((prev) => [
      "Gemini-style suggestion generated",
      ...prev.slice(0, 7),
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quest Fitness Tracker</Text>
      <Text style={styles.subtitle}>Walk. Earn points. Unlock badges.</Text>

      <View style={styles.card}>
        <Text style={styles.bigNumber}>{steps}</Text>
        <Text style={styles.label}>steps</Text>

        <View style={styles.progressOuter}>
          <View
            style={[styles.progressInner, { width: `${progress * 100}%` }]}
          />
        </View>

        <Text style={styles.goalText}>
          Goal: {steps}/{goal} steps
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{calories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>

      <Animated.View
        style={[styles.badgeBox, { transform: [{ scale: badgeScale }] }]}
      >
        {badges.map((badge) => (
          <Text
            key={badge.name}
            style={[
              styles.badge,
              steps >= badge.value ? styles.badgeEarned : styles.badgeLocked,
            ]}
          >
            {steps >= badge.value ? "🏆" : "🔒"} {badge.name}
          </Text>
        ))}
      </Animated.View>

      <Text style={styles.sectionTitle}>Services</Text>

      <TouchableOpacity
        style={[styles.button, isTracking && styles.disabledButton]}
        onPress={startBackgroundService}
        disabled={isTracking}
      >
        <Text style={styles.buttonText}>Start Background Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={startForegroundService}>
        <Text style={styles.buttonText}>Start Foreground Service</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={bindToService}>
        <Text style={styles.buttonText}>Bind to Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.stopButton}
        onPress={stopBackgroundService}
      >
        <Text style={styles.buttonText}>Stop Tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.geminiButton}
        onPress={getGeminiSuggestion}
      >
        <Text style={styles.buttonText}>Gemini Suggestion</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={resetTracker}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Workout Suggestion</Text>
        <Text style={styles.suggestion}>{suggestion}</Text>
      </View>

      <Text style={styles.sectionTitle}>Service Log</Text>

      <View style={styles.logBox}>
        {log.map((item, index) => (
          <Text key={index} style={styles.logText}>
            • {item}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    padding: 20,
  },
  title: {
    color: "#FFD700",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    color: "#D6E4F0",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1E2A38",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  bigNumber: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    color: "#AAB8C2",
    textAlign: "center",
    fontSize: 18,
  },
  progressOuter: {
    height: 18,
    backgroundColor: "#34495E",
    borderRadius: 20,
    marginTop: 20,
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#00D084",
  },
  goalText: {
    color: "#D6E4F0",
    textAlign: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1E2A38",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  statValue: {
    color: "#FFD700",
    fontSize: 26,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#D6E4F0",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  badgeBox: {
    backgroundColor: "#1E2A38",
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
  },
  badge: {
    fontSize: 16,
    marginVertical: 4,
  },
  badgeEarned: {
    color: "#FFD700",
  },
  badgeLocked: {
    color: "#7F8C8D",
  },
  button: {
    backgroundColor: "#00A8E8",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#566573",
  },
  stopButton: {
    backgroundColor: "#E67E22",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  geminiButton: {
    backgroundColor: "#8E44AD",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#C0392B",
    padding: 15,
    borderRadius: 14,
    marginBottom: 18,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  suggestion: {
    color: "#D6E4F0",
    fontSize: 16,
    lineHeight: 22,
  },
  logBox: {
    backgroundColor: "#1E2A38",
    borderRadius: 16,
    padding: 14,
    marginBottom: 40,
  },
  logText: {
    color: "#D6E4F0",
    marginBottom: 6,
  },
});
