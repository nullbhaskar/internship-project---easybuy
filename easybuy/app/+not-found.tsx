import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="map-outline" size={80} color="#4F46E5" />
        </View>
        
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Lost in the aisles?</Text>
        <Text style={styles.description}>
          We couldn't find the page or product you were looking for. It might have been moved or is currently out of stock.
        </Text>

        <Link href="/home" asChild>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="home-outline" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Back to Homepage</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 8,
    borderColor: '#E0E7FF',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: 'System',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: width * 0.8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
