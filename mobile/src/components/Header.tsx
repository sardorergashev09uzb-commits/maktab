import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { colors } from '../lib/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenProfile: () => void;
}

export function Header({ title, subtitle, onOpenProfile }: HeaderProps) {
  const { user, role } = useAuth();

  const getRoleLabel = () => {
    switch (role) {
      case 'student':
        return "O'quvchi";
      case 'parent':
        return 'Ota-ona';
      case 'teacher':
        return "O'qituvchi";
      case 'admin':
      case 'super_admin':
        return 'Admin';
      default:
        return 'Foydalanuvchi';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.profileBtn} onPress={onOpenProfile} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  roleBadge: {
    paddingRight: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
