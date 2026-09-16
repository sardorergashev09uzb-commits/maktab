import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/lib/auth-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { StudentScreen } from './src/screens/StudentScreen';
import { ParentScreen } from './src/screens/ParentScreen';
import { TeacherScreen } from './src/screens/TeacherScreen';
import { colors } from './src/lib/theme';

function MainNavigator() {
  const { user, role, isLoading } = useAuth();
  const [adminViewMode, setAdminViewMode] = useState<'student' | 'parent' | 'teacher'>('student');

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="school" size={44} color="#ffffff" />
        </View>
        <Text style={styles.splashTitle}>AL-XORAZMIY MAKTAB</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
        <Text style={styles.splashSubtitle}>Ilova yuklanmoqda...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // If user is admin/super_admin/director, provide role preview selector bar
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'director' || role === 'zavuch';

  const renderContent = () => {
    if (role === 'student') return <StudentScreen />;
    if (role === 'parent') return <ParentScreen />;
    if (role === 'teacher') return <TeacherScreen />;

    // Admin default preview switcher
    switch (adminViewMode) {
      case 'parent':
        return <ParentScreen />;
      case 'teacher':
        return <TeacherScreen />;
      case 'student':
      default:
        return <StudentScreen />;
    }
  };

  return (
    <View style={styles.root}>
      {isAdmin ? (
        <View style={styles.adminBar}>
          <Text style={styles.adminBarText}>Admin koʻrinishi:</Text>
          <View style={styles.adminSwitcher}>
            <TouchableOpacity
              style={[styles.adminChip, adminViewMode === 'student' && styles.activeAdminChip]}
              onPress={() => setAdminViewMode('student')}
            >
              <Text style={[styles.adminChipText, adminViewMode === 'student' && styles.activeAdminChipText]}>
                Oʻquvchi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminChip, adminViewMode === 'parent' && styles.activeAdminChip]}
              onPress={() => setAdminViewMode('parent')}
            >
              <Text style={[styles.adminChipText, adminViewMode === 'parent' && styles.activeAdminChipText]}>
                Ota-ona
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminChip, adminViewMode === 'teacher' && styles.activeAdminChip]}
              onPress={() => setAdminViewMode('teacher')}
            >
              <Text style={[styles.adminChipText, adminViewMode === 'teacher' && styles.activeAdminChipText]}>
                Oʻqituvchi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.screenContainer}>{renderContent()}</View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  splashTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
    marginTop: 18,
  },
  splashSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  adminBar: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBarText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  adminSwitcher: {
    flexDirection: 'row',
    gap: 6,
  },
  adminChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeAdminChip: {
    backgroundColor: colors.primary,
  },
  adminChipText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  activeAdminChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
