import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
  Modal,
  Dimensions
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const { width, height } = Dimensions.get('window');

const DoctorProfile = () => {
  const router = useRouter();
  const { userData, loading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState('https://via.placeholder.com/150');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      const userRef = doc(db, "users", userData.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setCurrentImage(doc.data().profileImage || 'https://via.placeholder.com/150');
        }
      });
      return () => unsubscribe();
    }
  }, [userData?.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
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
        const userRef = doc(db, "users", userData?.uid!);
        await updateDoc(userRef, { profileImage: result.secure_url });
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          <Image 
            source={{ uri: currentImage }} 
            style={styles.fullImage} 
            resizeMode="contain" 
          />
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatar} 
            onPress={() => setIsModalVisible(true)}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Image key={currentImage} source={{ uri: currentImage }} style={styles.imageStyle} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.editIconBadge} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>Dr. {userData?.name || "Doctor"}</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/attendanceDoctor')}>
          <Ionicons name="people-outline" size={32} color="#007AFF" />
          <Text style={styles.cardTitle}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/questionbankDoctor')}>
          <Ionicons name="add-circle-outline" size={32} color="#34C759" />
          <Text style={styles.cardTitle}>Questions Bank</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/attendanceDoctorList')}>
          <Ionicons name="list-outline" size={32} color="#FF3B30" />
          <Text style={styles.cardTitle}>Attendance List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/dashboard' as any)}>
          <Ionicons name="stats-chart-outline" size={32} color="#5856D6" />
          <Text style={styles.cardTitle}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/screens/DoctorResultsScreen')}>
          <Ionicons name="trophy-outline" size={32} color="#FF9500" />
          <Text style={styles.cardTitle}>Quiz Results</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#007AFF',
    padding: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imageStyle: { width: '100%', height: '100%' },
  editIconBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#34C759',
    width: 36,
    height: 36,
    borderRadius: 18,
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
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  grid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 4
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10, color: '#333' }
});

export default DoctorProfile;