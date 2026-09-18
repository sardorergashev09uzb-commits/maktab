import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProfileModal } from '../components/ProfileModal';
import { api } from '../lib/api';
import { ParentPortalData } from '../types';
import { colors } from '../lib/theme';

export function ParentScreen() {
  const [data, setData] = useState<ParentPortalData | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'finance' | 'announcements'>('overview');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.portal.parent();
      setData(res);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ota-ona maʻlumotlari yuklanmoqda...</Text>
      </View>
    );
  }

  const children = data?.children || [];
  const currentChild = children[selectedChildIndex] || children[0];

  return (
    <View style={styles.container}>
      <Header
        title="Ota-ona Portali"
        subtitle="Farzandlaringiz taʻlimi nazorati"
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Children Selector */}
      {children.length > 0 ? (
        <View style={styles.childBar}>
          <Text style={styles.childBarLabel}>Farzand:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childChips}>
            {children.map((child, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.childChip,
                  selectedChildIndex === idx && styles.activeChildChip,
                ]}
                onPress={() => setSelectedChildIndex(idx)}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={selectedChildIndex === idx ? '#ffffff' : colors.primary}
                />
                <Text
                  style={[
                    styles.childChipText,
                    selectedChildIndex === idx && styles.activeChildChipText,
                  ]}
                >
                  {child.user?.first_name} {child.user?.last_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'overview' && styles.activeTabBtn]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={18}
            color={activeTab === 'overview' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Umumiy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'grades' && styles.activeTabBtn]}
          onPress={() => setActiveTab('grades')}
        >
          <Ionicons
            name="school-outline"
            size={18}
            color={activeTab === 'grades' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'grades' && styles.activeTabText]}>
            Baholar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'finance' && styles.activeTabBtn]}
          onPress={() => setActiveTab('finance')}
        >
          <Ionicons
            name="wallet-outline"
            size={18}
            color={activeTab === 'finance' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'finance' && styles.activeTabText]}>
            Toʻlovlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'announcements' && styles.activeTabBtn]}
          onPress={() => setActiveTab('announcements')}
        >
          <Ionicons
            name="megaphone-outline"
            size={18}
            color={activeTab === 'announcements' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>
            Eʻlonlar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={{ gap: 14 }}>
            {/* Child Profile Card */}
            <View style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Ionicons name="school" size={24} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>
                  {currentChild?.user?.first_name} {currentChild?.user?.last_name || 'Farzand'}
                </Text>
                <Text style={styles.childSub}>
                  Sinf: {currentChild?.currentEnrollment?.schoolClass?.name || '1-A sinf'} • ID:{' '}
                  {currentChild?.student_code || 'ST-001'}
                </Text>
              </View>
            </View>

            {/* Attendance & Performance Banner */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>96%</Text>
                <Text style={styles.kpiLabel}>Davomat</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: colors.secondary }]}>4.9</Text>
                <Text style={styles.kpiLabel}>Oʻrtacha Baho</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: colors.success }]}>Faol</Text>
                <Text style={styles.kpiLabel}>Holati</Text>
              </View>
            </View>

            {/* Invoices Alert */}
            {data?.invoices && data.invoices.length > 0 ? (
              <View style={styles.alertCard}>
                <Ionicons name="alert-circle" size={24} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>Toʻlov eslatmasi</Text>
                  <Text style={styles.alertDesc}>
                    {data.invoices.length} ta oylik toʻlov kutilmoqda.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 2: GRADES */}
        {activeTab === 'grades' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farzandning Soʻnggi Baholari</Text>
            {data?.recent_grades && data.recent_grades.length > 0 ? (
              data.recent_grades.map((g: any, idx: number) => (
                <View key={idx} style={styles.gradeCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gradeSubject}>{g.lesson?.subject?.name || 'Fan'}</Text>
                    <Text style={styles.gradeCat}>{g.gradeCategory?.name || 'Kundalik baho'}</Text>
                  </View>
                  <View style={styles.gradeScore}>
                    <Text style={styles.gradeScoreVal}>{g.score}</Text>
                    <Text style={styles.gradeScoreMax}>/100</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Hozircha yangi baholar yoʻq</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: FINANCE */}
        {activeTab === 'finance' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Toʻlovlar & Invoyslar Tarixi</Text>
            {data?.invoices && data.invoices.length > 0 ? (
              data.invoices.map((inv: any, idx: number) => (
                <View key={idx} style={styles.invoiceCard}>
                  <View style={styles.invHeader}>
                    <Text style={styles.invNumber}>Invoys #{inv.invoice_number}</Text>
                    <View style={styles.invStatusPending}>
                      <Text style={styles.invStatusText}>Toʻlanmagan</Text>
                    </View>
                  </View>
                  <Text style={styles.invAmount}>
                    {Number(inv.amount || 0).toLocaleString()} UZS
                  </Text>
                  <Text style={styles.invDueDate}>Oxirgi toʻlov muddati: {inv.due_date}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.success} />
                <Text style={styles.emptyText}>Barcha toʻlovlar toʻliq amalga oshirilgan</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maktab Eʻlonlari</Text>
            {data?.announcements && data.announcements.length > 0 ? (
              data.announcements.map((ann, idx) => (
                <View key={idx} style={styles.annCard}>
                  <Text style={styles.annTitle}>{ann.title}</Text>
                  <Text style={styles.annBody}>{ann.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Hozircha yangi eʻlonlar mavjud emas</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ProfileModal visible={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  childBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  childBarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginRight: 10,
  },
  childChips: {
    flexDirection: 'row',
    gap: 8,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeChildChip: {
    backgroundColor: colors.primary,
  },
  childChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  activeChildChipText: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 2,
  },
  activeTabBtn: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
  childCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  childSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: colors.warningLight,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  alertDesc: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  gradeCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradeSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  gradeCat: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gradeScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeScoreVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  gradeScoreMax: {
    fontSize: 11,
    color: colors.textMuted,
  },
  invoiceCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  invStatusPending: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  invStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.danger,
  },
  invAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  invDueDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  annCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  annTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  annBody: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
