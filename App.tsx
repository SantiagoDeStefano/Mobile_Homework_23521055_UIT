import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import HealthScreen from "./Lab5_Health/HealthScreen";
import MovieScreen from "./Lab5_TV/MovieScreen";

export default function App() {
  const [tab, setTab] = useState<"health" | "movies">("health");

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />

      {/* Tab bar */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, tab === "health" && s.tabActive]}
          onPress={() => setTab("health")}
        >
          <Text style={s.tabText}>❤️ Health</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === "movies" && s.tabActive]}
          onPress={() => setTab("movies")}
        >
          <Text style={s.tabText}>🎬 Movies</Text>
        </TouchableOpacity>
      </View>

      {/* Screen */}
      {tab === "health" ? <HealthScreen /> : <MovieScreen />}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar:    { flexDirection: "row", backgroundColor: "#1a1a1a", paddingTop: 48 },
  tab:       { flex: 1, padding: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#f5a623" },
  tabText:   { color: "#fff", fontWeight: "600", fontSize: 14 },
});