import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl, setApiUrl, DEFAULT_API_URL } from '../lib/config';
import { colors } from '../lib/theme';

interface ApiSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ApiSettingsModal({ visible, onClose }: ApiSettingsModalProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (visible) {
      getApiUrl().then(setUrl);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Xatolik', 'API manzilini kiriting');
      return;
    }
    await setApiUrl(url.trim());
    Alert.alert('Saqlandi', 'API manzili muvaffaqiyatli saqlandi!');
    onClose();
  };

  const handleReset = async () => {
    setUrl(DEFAULT_API_URL);
    await setApiUrl(DEFAULT_API_URL);
    Alert.alert('Tiklandi', 'Standart Cloudflare Tunnel manziliga qaytarildi');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="server" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>API Sozlamalari</Text>
              <Text style={styles.subtitle}>Server ulanish manzilini oʻzgartirish</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Backend API URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://...trycloudflare.com/v1"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.quickActions}>
              <Text style={styles.quickTitle}>Tezkor variantlar:</Text>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => setUrl('https://vbulletin-fun-italic-polls.trycloudflare.com/v1')}
              >
                <Text style={styles.quickChipText}>Cloudflare Tunnel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => setUrl('http://10.0.2.2:8080/v1')}
              >
                <Text style={styles.quickChipText}>Android Emulator (10.0.2.2:8080)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={handleReset}>
                <Text style={styles.resetText}>Tiklash</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveText}>Saqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  quickActions: {
    gap: 6,
    marginTop: 4,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  quickChip: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickChipText: {
    fontSize: 12,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
