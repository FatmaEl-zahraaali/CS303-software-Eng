import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Dimensions, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const PRIMARY_COLOR = "#135D56";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

export default function SubjectList() {
  const router = useRouter();
  const [scaleValue] = useState(new Animated.Value(1));

  const PRIMARY_COLOR = '#135D56';
  const SECONDARY_COLOR = '#1B7A6E';
  const ICON_BG_LIGHT = '#E0F2F1';

  const goToSubject = (subjectCode: string) => {
    router.push({
      pathname: '/subject' as any,
      params: { code: subjectCode }
    });
  };

  const goToProfile = () => {
    router.push('/Profile');
  };

  const SubjectCard = ({ code, icon, color = PRIMARY_COLOR }: { code: string, icon: any, color?: string }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <Pressable
        onPress={() => goToSubject(code)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <LinearGradient
          colors={pressed ? [PRIMARY_COLOR, SECONDARY_COLOR] : ['#fff', '#fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={[
            styles.iconWrapper,
            { backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : ICON_BG_LIGHT }
          ]}>
            <Ionicons
              name={icon}
              size={32}
              color={pressed ? '#FFFFFF' : color}
            />
          </View>
          <Text style={[styles.subjectCode, pressed && { color: '#FFFFFF' }]}>
            {code}
          </Text>
          {!pressed && (
            <View style={styles.cardBadge}>
              <LinearGradient
                colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>View</Text>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F4F4']}
      style={styles.container}
    >
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

      <LinearGradient
        colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Your Academic Hub</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={goToProfile}>
          <LinearGradient
            colors={['#fff', '#f0f0f0']}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.centeredBody}>
        <LinearGradient
          colors={[ICON_BG_LIGHT, '#fff']}
          style={styles.logoContainer}
        >
          <Ionicons name="school" size={60} color={PRIMARY_COLOR} />
        </LinearGradient>

        <Text style={styles.sectionTitle}>My Courses</Text>
        <Text style={styles.sectionSubtitle}>Select a course to continue</Text>

        <View style={styles.gridContainer}>
          <SubjectCard code="CS303" icon="layers" />
          <SubjectCard code="CS309" icon="code-slash" />
          <SubjectCard code="CS202" icon="terminal" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#B2DFDB',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  profileBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileGradient: {
    padding: 12,
    borderRadius: 20,
  },
  centeredBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 60,
    elevation: 6,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  iconWrapper: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A3A48',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardBadge: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
