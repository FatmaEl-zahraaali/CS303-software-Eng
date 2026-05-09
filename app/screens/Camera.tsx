import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const { userData } = useAuth();
  const { qrData } = useLocalSearchParams();

  useEffect(() => {
    requestPermission();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
      saveAttendanceFinal(result.uri);
      setDone(true);
    }
  };
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
      return null;
    }
  };

  const saveAttendanceFinal = async (photoUri: string) => {
    setLoading(true);
    const imageUrl = await uploadToCloudinary(photoUri);

    if (imageUrl && userData) {
      const qrParsed = JSON.parse(qrData as string);

      await addDoc(collection(db, "attendance_records"), {
        courseName: qrParsed.courseName,
        sessionId: qrParsed.sessionId,
        studentName: userData.name,
        studentEmail: userData.email,
        studentImage: imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Attendance was successfully recorded with the photo!");
      router.replace("/(tabs)/Homepage");
    } else {
      Alert.alert("Error", "Image upload failed, please try again.");
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
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Selfie with the Doctor</Text>


      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />


      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Selfie</Text>
      </TouchableOpacity>

      {photo && (
        <Image source={{ uri: photo }} style={styles.image} />
      )}

      {done && (
        <View style={styles.success}>
          <Text style={styles.check}>✔</Text>
          <Text style={styles.successText}>Attendance is done</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    gap: 15,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  qr: {
    fontSize: 14,
    color: "gray",
  },

  camera: {
    width: 300,
    height: 400,
    borderRadius: 15,
    overflow: "hidden",
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },

  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  check: {
    color: "green",
    fontSize: 20,
  },

  successText: {
    color: "green",
    fontWeight: "bold",
  },


  button: {
    backgroundColor: "#135D56",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});