import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import axios from "axios";

import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export default function HomeScreen() {

  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [temperature, setTemperature] = useState("25");
  const [humidity, setHumidity] = useState("60");
  const [quantity, setQuantity] = useState("100");
  const [salesVelocity, setSalesVelocity] = useState("50");
  const [days, setDays] = useState("3");

  const API_URL = "http://13.60.182.102:8000/predict";

  async function preprocessImage(uri: string) {

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 224, height: 224 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  }

  async function pickImage() {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {

      const processed = await preprocessImage(result.assets[0].uri);

      setImage(processed);
      setResult(null);
    }
  }

  async function takePhoto() {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {

      const processed = await preprocessImage(result.assets[0].uri);

      setImage(processed);
      setResult(null);
    }
  }

  async function predict() {

    if (!image) {
      Alert.alert("Please select image");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("file", {
      uri: image,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("temperature", temperature);
    formData.append("humidity", humidity);
    formData.append("quantity", quantity);
    formData.append("sales_velocity", salesVelocity);
    formData.append("days_in_storage", days);

    try {

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);

    } catch (error) {

      console.log(error);
      Alert.alert("Prediction failed");

    }

    setLoading(false);
  }

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Smart Retail AI
      </Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>
          Select Image
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>
          Take Photo
        </Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

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
        placeholder="Days In Storage"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
      />

      <TouchableOpacity style={styles.predictButton} onPress={predict}>
        <Text style={styles.predictText}>
          Predict
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="white" />
      )}

      {result && (

        <View style={styles.resultBox}>

          <Text style={styles.result}>
            Ripeness: {result.ripeness_stage}
          </Text>

          <Text style={styles.result}>
            Confidence: {result.confidence}
          </Text>

          <Text style={styles.result}>
            Spoilage: {result.spoilage_probability}
          </Text>

          <Text style={styles.result}>
            Discount: {result.optimal_discount_percent}%
          </Text>

        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },

  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#2979ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },

  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  predictButton: {
    backgroundColor: "#00c853",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },

  predictText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#111",
    borderRadius: 10,
  },

  result: {
    color: "#fff",
    marginBottom: 6,
  },
});