import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";

export default function HealthScreen() {
  const [running, setRunning]   = useState(false);
  const [seconds, setSeconds]   = useState(0);
  const [calories, setCalories] = useState(0);
  const [steps, setSteps]       = useState(0);
  const [bpm, setBpm]           = useState<number | null>(null);
  const timerRef  = useRef<any>(null);
  const stepsRef  = useRef<any>(null);
  const bpmRef    = useRef<any>(null);

  const start = () => {
    setRunning(true);

    // Timer
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setCalories((c) => parseFloat((c + 0.05).toFixed(1)));
    }, 1000);

    // Steps every ~600ms
    stepsRef.current = setInterval(() => {
      setSteps((s) => s + 1);
    }, 600);

    // Fake BPM 60–100
    bpmRef.current = setInterval(() => {
      setBpm(60 + Math.floor(Math.random() * 40));
    }, 1500);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(timerRef.current);
    clearInterval(stepsRef.current);
    clearInterval(bpmRef.current);
  };

  const reset = () => {
    pause();
    setSeconds(0);
    setCalories(0);
    setSteps(0);
    setBpm(null);
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Health Monitor</Text>

      {/* Watch face */}
      <View style={s.watch}>
        <Text style={s.clock}>⏱ {time}</Text>

        <View style={s.metricsRow}>
          <View style={s.metric}>
            <Text style={s.metricIcon}>♥</Text>
            <Text style={s.metricValue}>{bpm ?? "—"}</Text>
            <Text style={s.metricLabel}>BPM</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricIcon}>🔥</Text>
            <Text style={s.metricValue}>{calories}</Text>
            <Text style={s.metricLabel}>kcal</Text>
          </View>
        </View>

        <View style={s.metricsRow}>
          <View style={s.metric}>
            <Text style={s.metricIcon}>〜</Text>
            <Text style={s.metricValue}>{steps}</Text>
            <Text style={s.metricLabel}>Steps</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricIcon}>🔄</Text>
            <Text style={s.metricValue}>{Math.floor(steps / 1300 * 10) / 10}</Text>
            <Text style={s.metricLabel}>km</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, running ? s.btnGray : s.btnOrange]}
            onPress={running ? pause : start}
          >
            <Text style={s.btnText}>{running ? "PAUSE" : "START"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.btnGray]} onPress={reset}>
            <Text style={s.btnText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status */}
      <View style={s.statusCard}>
        <Text style={s.statusTitle}>Session Summary</Text>
        <Text style={s.statusRow}>⏱  Duration:  <Text style={s.statusVal}>{time}</Text></Text>
        <Text style={s.statusRow}>♥  Heart rate: <Text style={s.statusVal}>{bpm ? `${bpm} bpm` : "—"}</Text></Text>
        <Text style={s.statusRow}>🔥 Calories:  <Text style={s.statusVal}>{calories} kcal</Text></Text>
        <Text style={s.statusRow}>👟 Steps:     <Text style={s.statusVal}>{steps}</Text></Text>
        <Text style={s.statusRow}>📍 Distance:  <Text style={s.statusVal}>{Math.floor(steps / 1300 * 100) / 100} km</Text></Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { padding: 24, paddingTop: 60, backgroundColor: "#0f0f0f", flexGrow: 1, alignItems: "center" },
  title:       { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 32 },

  // Watch
  watch:       { width: 280, height: 280, borderRadius: 140, backgroundColor: "#1a1a1a", borderWidth: 8, borderColor: "#333", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  clock:       { color: "#f5a623", fontSize: 28, fontWeight: "700", marginBottom: 16 },
  metricsRow:  { flexDirection: "row", gap: 32, marginBottom: 12 },
  metric:      { alignItems: "center" },
  metricIcon:  { fontSize: 18, color: "#f5a623" },
  metricValue: { color: "#fff", fontSize: 16, fontWeight: "700" },
  metricLabel: { color: "#888", fontSize: 10 },
  btnRow:      { flexDirection: "row", gap: 12, marginTop: 16 },
  btn:         { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnOrange:   { backgroundColor: "#f5a623" },
  btnGray:     { backgroundColor: "#444" },
  btnText:     { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Summary
  statusCard:  { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 20, width: "100%" },
  statusTitle: { color: "#f5a623", fontWeight: "700", fontSize: 16, marginBottom: 12 },
  statusRow:   { color: "#aaa", fontSize: 14, marginBottom: 8 },
  statusVal:   { color: "#fff", fontWeight: "600" },
});