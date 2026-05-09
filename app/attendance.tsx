import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { db } from "../config/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function ScanCS202() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false); 
  const [currentSessionId, setCurrentSessionId] = useState("");

  useEffect(() => {
    requestPermission();
  }, []);
  const uploadToCloudinary = async (uri: string) => {
    try {
      const data = new FormData();
      data.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'attendance_selfie.jpg',
      } as any);

      data.append('upload_preset', 'profile_upload');

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dynvl7i8n/image/upload',
        {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
        }
      );

      const result = await res.json();
      return result.secure_url;
    } catch (error) {
      console.log("Upload Error:", error);
      return null;
    }
  };

  const saveAttendance = async (photoUri: string) => {
    setLoading(true);

    const imageUrl = await uploadToCloudinary(photoUri);

    if (imageUrl && userData) {
      await addDoc(collection(db, "attendance_records"), {
        studentName: userData.name,
        studentEmail: userData.email,
        studentImage: imageUrl,
        sessionId: currentSessionId,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Your attendance has been successfully recorded");
    } else {
      Alert.alert("Error", "Image upload failed");
    }
    setLoading(false);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  const handleScan = async ({ data }: any) => {
    if (scanned) return;

    if (!userData) {
      Alert.alert("Error", "User data not found. Please log in again.");
      return;
    }
    setScanned(true);
    try {
      const qrData = JSON.parse(data);

      await addDoc(collection(db, "attendance_records"), {
        courseName: qrData.courseName,
        sessionId: qrData.sessionId,
        sessionTitle: qrData.sessionTitle,
        studentName: userData.name,
        studentEmail: userData.email,
        studentId: userData.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Attendance Saved!");

      router.push({
        pathname: "/screens/Camera",
        params: { qrData: data },
      });

    } catch (error) {

      Alert.alert("Error", "Failed to save attendance");

    }
  };

  return (
    <View style={styles.page}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleScan}
      />

      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.text}>Align QR inside the box</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: 320,
    height: 320,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  text: {
    marginTop: 20,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 6,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});