import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

export default function SubjectList() {
  const router = useRouter();

  const PRIMARY_COLOR = '#135D56'; 
  const ICON_BG_LIGHT = '#E0F2F1';

  const goToSubject = (subjectCode: string) => {
    router.push({
      pathname: '/subject' as any,
      params: { code: subjectCode }
    });
  };

  const goToProfile = () => {
    router.push('/(tabs)/profile' as any);
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
        <TouchableOpacity style={styles.profileBadge} onPress={goToProfile}>
          <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      <View style={styles.centeredBody}>
        
        <View style={styles.logoContainer}>
           <Ionicons name="school" size={60} color={PRIMARY_COLOR} />
        </View>
        
        <Text style={styles.sectionTitle}>Courses</Text>
        
        <View style={styles.gridContainer}>
          <SubjectCard code="CS303" icon="layers" />
          <SubjectCard code="CS309" icon="code-slash" />
          <SubjectCard code="CS202" icon="terminal" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F4',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  profileBadge: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    elevation: 5,
  },
  centeredBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logoContainer: {
    marginBottom: 20,
    backgroundColor: '#E0F2F1',
    padding: 20,
    borderRadius: 40,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2A3A48',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: CARD_WIDTH,
    height: 185,
    borderRadius: 35,
    marginBottom: 80,
    marginHorizontal: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
});