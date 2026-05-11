import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebaseConfig";

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access the images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const data = new FormData();
      const fileUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

      data.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
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

      if (result.secure_url) {
        const userRef = doc(db, "users", auth.currentUser?.uid!);
        await updateDoc(userRef, { profileImage: result.secure_url });
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#135D56" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topSection}>
        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: userData?.profileImage || 'https://via.placeholder.com/150' }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>

        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => setIsModalVisible(true)}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#135D56" />
            ) : (
              <Image
                source={{ uri: userData?.profileImage || 'https://via.placeholder.com/150' }}
                style={styles.imageStyle}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.editIconBadge} onPress={pickImage}>
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>


        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={24} color="#135D56" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{userData?.phone || "010203040"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="ribbon-outline" size={24} color="#135D56" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Account Role</Text>
            <Text style={styles.value}>{userData?.role || "University Student"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topSection: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#135D56',
  },
  imageStyle: {
    width: '100%',
    height: '100%'
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34C759',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: width,
    height: height * 0.7
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#135D56"
  },
  email: {
    color: "1A2530",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    color: "#135D56",
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionHeader: {
    width: "90%",
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#135D56",
    marginBottom: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    backgroundColor: "#F0F7FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
});