import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from "../../config/firebaseConfig";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

export default function SubjectList() {
  const router = useRouter();

  const PRIMARY_COLOR = '#135D56';
  const ICON_BG_LIGHT = '#E0F2F1';
  const [userData, setUserData] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userRef, (docSnap: any) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const subjects = [
    { code: "CS303", icon: "layers" },
    { code: "CS309", icon: "code-slash" },
    { code: "CS202", icon: "terminal" },
    { code: "CS302", icon: "git-network" },
  ];

  const filteredSubjects = subjects.filter(subject =>
    subject.code.toLowerCase().includes(search.toLowerCase())
  );

  const goToSubject = (subjectCode: string) => {
    router.push({
      pathname: '/subject' as any,
      params: { code: subjectCode }
    });
  };


  const SubjectCard = ({ code, icon }: { code: string, icon: any }) => {
    return (
      <Pressable
        onPress={() => goToSubject(code)}
        style={({ pressed }) => [
          styles.card,
          pressed && { backgroundColor: PRIMARY_COLOR }
        ]}
      >
        {({ pressed }) => {
          const isActive = pressed;
          return (
            <View style={styles.cardInternal}>
              <View style={[
                styles.iconWrapper,
                { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : ICON_BG_LIGHT }
              ]}>
                <Ionicons
                  name={icon}
                  size={32}
                  color={isActive ? '#FFFFFF' : PRIMARY_COLOR}
                />
              </View>
              <Text style={[styles.subjectCode, isActive && { color: '#FFFFFF' }]}>
                {code}
              </Text>
            </View>
          );
        }}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

      <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Your Academic Hub</Text>
        </View>

        <TouchableOpacity style={styles.profileBadge}activeOpacity={1}>
            <Image
              source={{ uri: userData?.profileImage }}
              style={styles.profileImage}
            />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredBody}>

          <View style={styles.logoContainer}>
            <Ionicons name="school" size={60} color={PRIMARY_COLOR} />
          </View>

          <Text style={styles.sectionTitle}>Courses</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />

            <TextInput
              placeholder="Search course..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.gridContainer}>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject, index) => (
                <SubjectCard
                  key={index}
                  code={subject.code}
                  icon={subject.icon}
                />
              ))
            ) : (
              <Text style={{ marginTop: 20, color: '#777' }}>
                No courses found
              </Text>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F4',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    color: '#B2DFDB',
    marginTop: 2,
  },
  centeredBody: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logoContainer: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#E0F2F1',
    padding: 20,
    borderRadius: 40,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2A3A48',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    width: '90%',
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 8,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: CARD_WIDTH,
    height: 185,
    borderRadius: 35,
    margin: 6,
    elevation: 8,
  },
  cardInternal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  subjectCode: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A3A48',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileBadge: {
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderRadius: 25,
    elevation: 5,
    overflow: 'hidden',
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
});