import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [temperature, setTemperature] = useState("25");
  const [humidity, setHumidity] = useState("60");
  const [quantity, setQuantity] = useState("100");
  const [salesVelocity, setSalesVelocity] = useState("50");
  const [days, setDays] = useState("3");

  const BASE_URL = "http://13.60.182.102:8000";

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const predict = async () => {
    if (!image) return alert("Select image first!");

    setLoading(true);

    const formData = new FormData();

    formData.append("file", {
      uri: image,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("temperature", Number(temperature));
    formData.append("humidity", Number(humidity));
    formData.append("quantity", Number(quantity));
    formData.append("sales_velocity", Number(salesVelocity));
    formData.append("days_in_storage", Number(days));

    try {
      const response = await axios.post(
        `${BASE_URL}/predict`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (error: any) {
      alert("Prediction failed");
      console.log(error.response?.data);
    }

    setLoading(false);
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Smart Retail AI</Text>
        <Text style={styles.subHeader}>
          AI-Powered Waste & Pricing Optimization
        </Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {image ? "Change Image" : "Select Product Image"}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image source={{ uri: image }} style={styles.image} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Environment Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Temperature"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={temperature}
            onChangeText={setTemperature}
          />

          <TextInput
            style={styles.input}
            placeholder="Humidity"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={humidity}
            onChangeText={setHumidity}
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <TextInput
            style={styles.input}
            placeholder="Sales Velocity"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={salesVelocity}
            onChangeText={setSalesVelocity}
          />

          <TextInput
            style={styles.input}
            placeholder="Days in Storage"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={days}
            onChangeText={setDays}
          />
        </View>

        <TouchableOpacity onPress={predict} disabled={loading}>
          <LinearGradient
            colors={["#00c6ff", "#0072ff"]}
            style={styles.predictButton}
          >
            <Text style={styles.predictText}>
              {loading ? "Analyzing..." : "Run AI Prediction"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#fff" />}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>AI Results</Text>
            <Text style={styles.resultItem}>
              Ripeness: {result.ripeness_stage}
            </Text>
            <Text style={styles.resultItem}>
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </Text>
            <Text style={styles.resultItem}>
              Spoilage Probability:{" "}
              {(result.spoilage_probability * 100).toFixed(2)}%
            </Text>
            <Text style={styles.resultItem}>
              Optimal Discount: {result.optimal_discount_percent}%
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subHeader: {
    textAlign: "center",
    color: "#ccc",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  imagePicker: {
    backgroundColor: "#ffffff20",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 12,
  },
  input: {
    backgroundColor: "#ffffff15",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    color: "#fff",
  },
  predictButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  predictText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    borderRadius: 15,
  },
  resultTitle: {
    color: "#00c6ff",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  resultItem: {
    color: "#fff",
    marginBottom: 6,
  },
});