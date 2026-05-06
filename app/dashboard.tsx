import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, RefreshControl, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [passRate, setPassRate] = useState(0);
  const [weeklyAttendance, setWeeklyAttendance] = useState([88, 92, 95, 98]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [questionsDistribution, setQuestionsDistribution] = useState([
    { name: 'Easy', count: 45, color: '#2c7da0' },
    { name: 'Medium', count: 68, color: '#61a5c2' },
    { name: 'Hard', count: 45, color: '#89c2d9' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setError(null);
      
      const studentsSnap = await getDocs(collection(db, 'students'));
      setTotalStudents(studentsSnap.size);
      
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      setAttendanceCount(attendanceSnap.size);
      
      const questionsSnap = await getDocs(collection(db, 'questions'));
      setTotalQuestions(questionsSnap.size);
      
      const recentQuery = query(
        collection(db, 'attendance'),
        orderBy('date', 'desc'),
        limit(5)
      );
      const recentSnap = await getDocs(recentQuery);
      const records = [];
      recentSnap.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() });
      });
      setRecentAttendance(records);
      
      setPassRate(85);
      
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load data. Please check your internet connection.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  if (loading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c7da0" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome Back,</Text>
        <Text style={styles.welcomeSubtitle}>{user.email}</Text>
      </View>
      
      <View style={styles.cardsGrid}>
        <View style={styles.card}>
          <View style={[styles.cardIconContainer, { backgroundColor: '#e0f2fe' }]}>
            <Text style={styles.cardIcon}>👥</Text>
          </View>
          <Text style={styles.cardTitle}>Total Students</Text>
          <Text style={styles.cardValue}>{totalStudents}</Text>
        </View>
        
        <View style={styles.card}>
          <View style={[styles.cardIconContainer, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.cardIcon}>✅</Text>
          </View>
          <Text style={styles.cardTitle}>Attendance</Text>
          <Text style={styles.cardValue}>{attendanceCount}</Text>
        </View>
        
        <View style={styles.card}>
          <View style={[styles.cardIconContainer, { backgroundColor: '#fef9c3' }]}>
            <Text style={styles.cardIcon}>📚</Text>
          </View>
          <Text style={styles.cardTitle}>Questions Bank</Text>
          <Text style={styles.cardValue}>{totalQuestions}</Text>
        </View>
        
        <View style={styles.card}>
          <View style={[styles.cardIconContainer, { backgroundColor: '#fce7f3' }]}>
            <Text style={styles.cardIcon}>📊</Text>
          </View>
          <Text style={styles.cardTitle}>Pass Rate</Text>
          <Text style={styles.cardValue}>{passRate}%</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Attendance Trend</Text>
        <BarChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{ data: weeklyAttendance }]
          }}
          width={screenWidth - 48}
          height={220}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#2c7da0',
            backgroundGradientTo: '#61a5c2',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
        />
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Questions by Difficulty</Text>
        <PieChart
          data={questionsDistribution}
          width={screenWidth - 48}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View style={styles.legendContainer}>
          {questionsDistribution.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}: {item.count}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.tableContainer}>
        <Text style={styles.sectionTitle}>Recent Attendance Records</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>Student Name</Text>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>Status</Text>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>Date</Text>
        </View>
        
        {recentAttendance.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => setSelectedStudent(item)}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.studentName || item.name || 'Unknown'}</Text>
              <Text style={[
                styles.tableCell,
                item.status === 'present' ? styles.statusPresent : 
                item.status === 'late' ? styles.statusLate : styles.statusAbsent
              ]}>
                {item.status || 'absent'}
              </Text>
              <Text style={styles.tableCell}>{item.date || 'N/A'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <Modal
        visible={!!selectedStudent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedStudent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Details</Text>
              <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedStudent?.studentName || selectedStudent?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID:</Text>
                <Text style={styles.detailValue}>{selectedStudent?.studentId || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  selectedStudent?.status === 'present' ? styles.statusPresent : 
                  selectedStudent?.status === 'late' ? styles.statusLate : styles.statusAbsent
                ]}>
                  {selectedStudent?.status || 'absent'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{selectedStudent?.date || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1e3a5f',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2c7da0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    padding: 24,
    paddingBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f2b3d',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#334155',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  tableHeaderCell: {
    color: '#1e3a5f',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
  },
  statusPresent: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  statusLate: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  statusAbsent: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  modalClose: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
});