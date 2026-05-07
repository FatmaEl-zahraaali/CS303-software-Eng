import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../../../config/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function GeneralDashboardScreen() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!userData?.uid) return;
    try {
      setLoading(true);
      const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const totalStudentsCount = studentsSnap.size;
      setTotalStudents(totalStudentsCount);
      const questionsSnap = await getDocs(collection(db, 'questions'));
      let easy = 0, medium = 0, hard = 0;
      questionsSnap.forEach((doc) => {
        const diff = doc.data().difficulty;
        if (diff === 'Easy') easy++;
        else if (diff === 'Medium') medium++;
        else if (diff === 'Hard') hard++;
      });
      setEasyCount(easy);
      setMediumCount(medium);
      setHardCount(hard);
      setTotalQuestions(easy + medium + hard);
      const attendanceSnap = await getDocs(collection(db, 'attendance_records'));
      const totalAttendance = attendanceSnap.size;
      const uniqueSessions = new Set(attendanceSnap.docs.map(doc => doc.data().sessionId)).size;
      const maxPossible = totalStudentsCount * uniqueSessions;
      const rate = maxPossible > 0 ? (totalAttendance / maxPossible) * 100 : 0;
      setAttendanceRate(Math.round(rate));
      setPresentCount(totalAttendance);
      setAbsentCount(Math.max(0, maxPossible - totalAttendance));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </LinearGradient>
    );
  }

  const attendanceData = [
    { name: 'Present', count: presentCount, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Absent', count: absentCount, color: '#E65100', legendFontColor: '#333', legendFontSize: 12 },
  ];

  const questionsData = [
    { name: 'Easy', count: easyCount, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Medium', count: mediumCount, color: '#FF9800', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Hard', count: hardCount, color: '#BF360C', legendFontColor: '#333', legendFontSize: 12 },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Welcome Back,</Text>
            <Text style={styles.userName}>Dr. {userData?.name || 'Doctor'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#4A90E2' + '20' }]}>
            <Ionicons name="people-outline" size={24} color="#4A90E2" />
          </View>
          <Text style={[styles.statValue, { color: '#4A90E2' }]}>{totalStudents}</Text>
          <Text style={styles.statTitle}>Total Students</Text>
        </LinearGradient>

        <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#8BC34A' + '20' }]}>
            <Ionicons name="help-circle-outline" size={24} color="#8BC34A" />
          </View>
          <Text style={[styles.statValue, { color: '#8BC34A' }]}>{totalQuestions}</Text>
          <Text style={styles.statTitle}>Questions</Text>
        </LinearGradient>

        <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
            <Ionicons name="checkmark-done-outline" size={24} color="#FF9800" />
          </View>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{attendanceRate}%</Text>
          <Text style={styles.statTitle}>Attendance Rate</Text>
        </LinearGradient>
      </View>

      <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart-outline" size={22} color="#667eea" />
          <Text style={styles.chartTitle}>Attendance vs Absence</Text>
        </View>
        {presentCount + absentCount > 0 ? (
          <PieChart
            data={attendanceData}
            width={screenWidth - 48}
            height={200}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>No attendance data yet</Text>
        )}
      </LinearGradient>

      <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart-outline" size={22} color="#667eea" />
          <Text style={styles.chartTitle}>Questions by Difficulty</Text>
        </View>
        <PieChart
          data={questionsData}
          width={screenWidth - 48}
          height={200}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#fff', fontWeight: '500' },
  headerGradient: { paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  header: { paddingHorizontal: 20 },
  greetingText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: -15, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
  statIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statTitle: { fontSize: 11, color: '#666', marginTop: 4 },
  chartCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e' },
  emptyText: { textAlign: 'center', color: '#a0a0a0', marginTop: 20, marginBottom: 20 },
});
