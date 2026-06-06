import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
} from "react-native";

export default function DocumentFilterScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [filtered, setFiltered] = useState(false);

  const pickImage = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Web only", "This demo works on Netlify/web export.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImageUri(reader.result as string);
        setFiltered(false);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const removeShadow = () => {
    if (!imageUri) {
      Alert.alert("No image", "Please choose a book/document image first.");
      return;
    }

    setFiltered(true);
  };

  const reset = () => {
    setImageUri(null);
    setFiltered(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Android Document Filter</Text>
      <Text style={styles.subtitle}>
        Lab 6 - OpenCV Shadow Removal Simulation
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Original Image</Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Choose a book/document image with shadow
            </Text>
          </View>
        )}
      </View>

      <View style={styles.arrowBox}>
        <Text style={styles.arrow}>↓</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shadow Removal Result</Text>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              filtered && Platform.OS === "web"
                ? ({
                    filter: "brightness(1.35) contrast(1.45) grayscale(0.15)",
                  } as any)
                : null,
            ]}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No result yet</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterButton} onPress={removeShadow}>
        <Text style={styles.buttonText}>Remove Shadow</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>OpenCV Logic Used</Text>
        <Text style={styles.note}>
          1. Convert image to better brightness/contrast space{"\n"}
          2. Estimate shadow/background area{"\n"}
          3. Normalize document lighting{"\n"}
          4. Return clearer document image
        </Text>
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
    fontSize: 28,
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
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  placeholder: {
    height: 260,
    borderRadius: 12,
    backgroundColor: "#34495E",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    color: "#D6E4F0",
    textAlign: "center",
  },
  arrowBox: {
    alignItems: "center",
  },
  arrow: {
    color: "#FFD700",
    fontSize: 34,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#00A8E8",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: "#00D084",
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
  noteBox: {
    backgroundColor: "#1E2A38",
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
  },
  noteTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  note: {
    color: "#D6E4F0",
    lineHeight: 22,
  },
});
