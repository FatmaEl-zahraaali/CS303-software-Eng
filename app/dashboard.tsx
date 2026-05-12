import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

interface SessionData {
  id: string;
  doctorId?: string;
  doctorName?: string;
  subject?: string;
  sessionNumber?: number;
  createdAt?: any;
  active?: boolean;
}

interface SessionAttendanceData {
  sessionId: string;
  sessionNumber: number;
  subject: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  createdAt: any;
}

interface ChartDataItem {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function GeneralDashboardScreen() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  
  const [sessions, setSessions] = useState<SessionAttendanceData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionAttendanceData | null>(null);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  
  const [attendanceChartData, setAttendanceChartData] = useState<ChartDataItem[]>([]);
  const [questionsData, setQuestionsData] = useState<ChartDataItem[]>([
    { name: 'Easy', count: 0, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Medium', count: 0, color: '#FF9800', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Hard', count: 0, color: '#BF360C', legendFontColor: '#333', legendFontSize: 12 },
  ]);

  useEffect(() => {
    loadData();
    subscribeToSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadAttendanceForSession(selectedSession.sessionId);
    }
  }, [selectedSession]);

  const loadData = async () => {
    if (!userData?.uid) return;
    try {
      setLoading(true);
      
      const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const totalStudentsCount = studentsSnap.size;
      setTotalStudents(totalStudentsCount);
      
      const questionsSnap = await getDocs(query(collection(db, 'questions'), where('doctorId', '==', userData?.uid)));
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
      
      setQuestionsData([
        { name: 'Easy', count: easy, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
        { name: 'Medium', count: medium, color: '#FF9800', legendFontColor: '#333', legendFontSize: 12 },
        { name: 'Hard', count: hard, color: '#BF360C', legendFontColor: '#333', legendFontSize: 12 },
      ]);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToSessions = () => {
    if (!userData?.uid) return;
    
    const q = query(collection(db, 'attendance_sessions'), where('doctorId', '==', userData.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const sessionsList: SessionAttendanceData[] = [];
      
      for (const doc of snapshot.docs) {
        const sessionData = doc.data() as SessionData;
        const sessionId = doc.id;
        
        const attendanceSnap = await getDocs(query(collection(db, 'attendance_records'), where('sessionId', '==', sessionId)));
        const presentCount = attendanceSnap.size;
        
        sessionsList.push({
          sessionId: sessionId,
          sessionNumber: sessionData.sessionNumber || 0,
          subject: sessionData.subject || 'Unknown',
          totalStudents: totalStudents,
          presentCount: presentCount,
          absentCount: totalStudents - presentCount,
          attendanceRate: totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0,
          createdAt: sessionData.createdAt || null,
        });
      }
      
      sessionsList.sort((a, b) => b.sessionNumber - a.sessionNumber);
      setSessions(sessionsList);
      
      if (sessionsList.length > 0 && !selectedSession) {
        setSelectedSession(sessionsList[0]);
      }
    });
    
    return () => unsubscribe();
  };

  const loadAttendanceForSession = (sessionId: string) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      const present = session.presentCount;
      const absent = totalStudents - present;
      const rate = totalStudents > 0 ? ((totalStudents - present) / totalStudents) * 100 : 0;
      
      setPresentCount(present);
      setAbsentCount(absent);
      setAttendanceRate(Math.round(rate));
      
      setAttendanceChartData([
        { name: 'Present', count: present, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
        { name: 'Absent', count: absent, color: '#E65100', legendFontColor: '#333', legendFontSize: 12 },
      ]);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleSessionSelect = (session: SessionAttendanceData) => {
    setSelectedSession(session);
    setShowSessionPicker(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </LinearGradient>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

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
      </View>

      <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.sessionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={22} color="#667eea" />
          <Text style={styles.chartTitle}>Session Attendance Report</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.sessionSelector}
          onPress={() => setShowSessionPicker(true)}
        >
          <Ionicons name="book" size={20} color="#667eea" />
          <Text style={styles.sessionSelectorText}>
            {selectedSession 
              ? `${selectedSession.subject} - Session ${selectedSession.sessionNumber}`
              : 'Select Session'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#667eea" />
        </TouchableOpacity>
      </LinearGradient>

      {selectedSession && (
        <View style={styles.statsRow}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#8BC34A' + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#8BC34A" />
            </View>
            <Text style={[styles.statValue, { color: '#8BC34A' }]}>{presentCount}</Text>
            <Text style={styles.statTitle}>Present</Text>
          </LinearGradient>

          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E65100' + '20' }]}>
              <Ionicons name="close-circle" size={24} color="#E65100" />
            </View>
            <Text style={[styles.statValue, { color: '#E65100' }]}>{absentCount}</Text>
            <Text style={styles.statTitle}>Absent</Text>
          </LinearGradient>

          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="stats-chart" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{attendanceRate}%</Text>
            <Text style={styles.statTitle}>Absence Rate</Text>
          </LinearGradient>
        </View>
      )}

      {attendanceChartData.length > 0 && attendanceChartData[0]?.count + attendanceChartData[1]?.count > 0 ? (
        <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={22} color="#667eea" />
            <Text style={styles.chartTitle}>Present vs Absent</Text>
          </View>
          <PieChart
            data={attendanceChartData}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </LinearGradient>
      ) : null}

      <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart-outline" size={22} color="#667eea" />
          <Text style={styles.chartTitle}>Questions by Difficulty</Text>
        </View>
        <PieChart
          data={questionsData}
          width={screenWidth - 48}
          height={200}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </LinearGradient>

      <Modal
        visible={showSessionPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSessionPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowSessionPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Session</Text>
            <ScrollView style={styles.pickerContainer}>
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.sessionId}
                  style={[styles.sessionOption, selectedSession?.sessionId === session.sessionId && styles.sessionOptionSelected]}
                  onPress={() => handleSessionSelect(session)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionOptionText, selectedSession?.sessionId === session.sessionId && styles.sessionOptionTextSelected]}>
                      {session.subject}
                    </Text>
                    <Text style={[styles.sessionOptionSubText, selectedSession?.sessionId === session.sessionId && styles.sessionOptionSubTextSelected]}>
                      Session {session.sessionNumber} - {Math.round(session.attendanceRate)}% absent
                    </Text>
                  </View>
                  {selectedSession?.sessionId === session.sessionId && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
              {sessions.length === 0 && (
                <Text style={styles.emptyText}>No sessions found. Create a session first.</Text>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowSessionPicker(false)}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: -15, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, backgroundColor: '#fff' },
  statIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statTitle: { fontSize: 11, color: '#666', marginTop: 4 },
  sessionCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  sessionSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f0f0', padding: 12, borderRadius: 12, marginTop: 12 },
  sessionSelectorText: { fontSize: 16, color: '#333', flex: 1, textAlign: 'center' },
  chartCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: '#fff', elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  pickerContainer: { width: '100%', maxHeight: 400, marginBottom: 16 },
  sessionOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginVertical: 4, borderRadius: 12, backgroundColor: '#f5f5f5' },
  sessionOptionSelected: { backgroundColor: '#667eea' },
  sessionOptionText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sessionOptionSubText: { fontSize: 12, color: '#666', marginTop: 2 },
  sessionOptionSubTextSelected: { color: '#fff' },
  sessionOptionTextSelected: { color: '#fff' },
  emptyText: { textAlign: 'center', padding: 20, color: '#999' },
  closeModalBtn: { marginTop: 8, backgroundColor: '#667eea', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, width: '100%', alignItems: 'center' },
  closeModalBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
