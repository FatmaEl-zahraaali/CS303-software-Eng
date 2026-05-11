import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseConfig';
interface Review {
  id: string;
  studentName: string;
  studentImage?: string;
  reviewText: string;
  timestamp?: any;
}
export default function DoctorResultsScreen() {
  const [results, setResults] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setResults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Review }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircleSmall}>
          {item.studentImage ? (
            <Image
              source={{ uri: item.studentImage }}
              style={styles.profileImageStyle}
            />
          ) : (
            <Ionicons name="person-circle" size={35} color="#007AFF" />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.timestampText}>
            {item.timestamp?.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </Text>
        </View>
      </View>
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewText}>"{item.reviewText}"</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#007AFF" />;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Reviews</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No reviews recorded yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  header: {
    backgroundColor: "#007AFF",
    height: 100,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 35,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    padding: 20,
  }, card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155'
  },
  questionText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94A3B8'
  },
  iconCircleSmall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 22.5,
  },
  reviewContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF'
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8'
  }
});