import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function SubjectList() {
  const router = useRouter();

  const goToSubject = (subjectCode: string) => {
    router.push({
      pathname: '/subject' ,
      params: { code: subjectCode }
    });
  };

  return (

    <View style={styles.container}>
      <StatusBar backgroundColor="#ff7a00" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Welcome </Text>
        <Text style={styles.subtitle}>Choose your subject</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.card} onPress={() => goToSubject("CS303")}>
          <Text style={styles.text}>CS303</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToSubject("CS309")}>
          <Text style={styles.text}>CS309</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToSubject("CS202")}>
          <Text style={styles.text}>CS202</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff7a00',
  },
  subtitle: {
    fontSize: 16,
    color: '#ff7a00',
    marginTop: 5,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    padding: 22,
    backgroundColor: '#FF8C00',
    marginBottom: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});