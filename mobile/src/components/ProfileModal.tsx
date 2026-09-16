import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ApiSettingsModal } from './ApiSettingsModal';
import { colors } from '../lib/theme';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { user, role, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Rostdan ham hisobingizdan chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          onClose();
          await logout();
        },
      },
    ]);
  };

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
        return 'Tizim Administratori';
      case 'director':
        return 'Maktab Direktori';
      case 'zavuch':
        return 'O‘quv ishlari bo‘yicha direktor o‘rinbosari';
      case 'accountant':
        return 'Bosh Buxgalter';
      default:
        return 'Foydalanuvchi';
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarBigText}>
                  {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userRole}>{getRoleLabel()}</Text>
              <Text style={styles.userUsername}>@{user?.username}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                <Text style={styles.infoText}>{user?.email || 'Email kiritilmagan'}</Text>
              </View>
              {user?.phone ? (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.infoText}>{user.phone}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowPasswordModal(true)}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="key-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuText}>Parolni oʻzgartirish</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowApiModal(true)}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="server-outline" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.menuText}>API Server sozlamalari</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                </View>
                <Text style={[styles.menuText, { color: colors.danger }]}>Tizimdan chiqish</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Yopish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ApiSettingsModal
        visible={showApiModal}
        onClose={() => setShowApiModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBig: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarBigText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  userRole: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userUsername: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
  },
  menu: {
    gap: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.bg,
  },
  logoutItem: {
    backgroundColor: colors.dangerLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  closeBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
