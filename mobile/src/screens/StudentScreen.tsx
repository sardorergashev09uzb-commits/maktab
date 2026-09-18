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
import { StudentPortalData } from '../types';
import { colors } from '../lib/theme';

export function StudentScreen() {
  const [data, setData] = useState<StudentPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'grades' | 'tasks' | 'coins'>('today');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.portal.student();
      setData(res);
    } catch {
      // Ignore or show offline
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

  const daysOfWeek = [
    { id: 1, label: 'Du' },
    { id: 2, label: 'Se' },
    { id: 3, label: 'Cho' },
    { id: 4, label: 'Pa' },
    { id: 5, label: 'Ju' },
    { id: 6, label: 'Sha' },
  ];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Oʻquvchi maʻlumotlari yuklanmoqda...</Text>
      </View>
    );
  }

  const scheduleForDay = (data?.schedule || []).filter((s: any) => s.day_of_week === selectedDay);

  return (
    <View style={styles.container}>
      <Header
        title="Oʻquvchi Portali"
        subtitle={data?.student?.student_code ? `ID: ${data.student.student_code}` : undefined}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'today' && styles.activeTabBtn]}
          onPress={() => setActiveTab('today')}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={activeTab === 'today' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Bugun</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'schedule' && styles.activeTabBtn]}
          onPress={() => setActiveTab('schedule')}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={activeTab === 'schedule' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Jadval</Text>
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
          <Text style={[styles.tabText, activeTab === 'grades' && styles.activeTabText]}>Baholar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tasks' && styles.activeTabBtn]}
          onPress={() => setActiveTab('tasks')}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={activeTab === 'tasks' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>Vazifalar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'coins' && styles.activeTabBtn]}
          onPress={() => setActiveTab('coins')}
        >
          <Ionicons
            name="gift-outline"
            size={18}
            color={activeTab === 'coins' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'coins' && styles.activeTabText]}>Coinlar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* KPI Banner */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>98%</Text>
            <Text style={styles.kpiLabel}>Davomat</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.secondary }]}>
              {data?.recent_grades && data.recent_grades.length > 0
                ? (
                    data.recent_grades.reduce((a, b) => a + Number(b.score), 0) /
                    data.recent_grades.length
                  ).toFixed(1)
                : '4.8'}
            </Text>
            <Text style={styles.kpiLabel}>Oʻrtacha Ball</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.accent }]}>
              {data?.coin_balance || 0} 🪙
            </Text>
            <Text style={styles.kpiLabel}>Coin Balans</Text>
          </View>
        </View>

        {/* TAB 1: TODAY'S LESSONS */}
        {activeTab === 'today' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugungi Darslar</Text>
            {data?.today_lessons && data.today_lessons.length > 0 ? (
              data.today_lessons.map((lesson, idx) => (
                <View key={idx} style={styles.lessonCard}>
                  <View style={styles.lessonTimeBadge}>
                    <Text style={styles.lessonTimeText}>
                      {lesson.start_time?.slice(0, 5)} - {lesson.end_time?.slice(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonSubject}>{lesson.subject?.name || 'Fan nomi'}</Text>
                    <Text style={styles.lessonDetail}>
                      Ustoz: {lesson.teacher?.user?.first_name} {lesson.teacher?.user?.last_name} • Xona:{' '}
                      {lesson.room?.name || '101'}
                    </Text>
                    {lesson.topic ? (
                      <Text style={styles.lessonTopic}>Mavzu: {lesson.topic}</Text>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="cafe-outline" size={36} color={colors.textLight} />
                <Text style={styles.emptyText}>Bugun rejalashtirilgan darslar yoʻq</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: SCHEDULE */}
        {activeTab === 'schedule' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Haftalik Dars Jadvali</Text>
            <View style={styles.daysSelector}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayChip, selectedDay === day.id && styles.activeDayChip]}
                  onPress={() => setSelectedDay(day.id)}
                >
                  <Text
                    style={[styles.dayChipText, selectedDay === day.id && styles.activeDayChipText]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {scheduleForDay.length > 0 ? (
              scheduleForDay.map((s: any, idx: number) => (
                <View key={idx} style={styles.lessonCard}>
                  <View style={styles.lessonTimeBadge}>
                    <Text style={styles.lessonTimeText}>
                      {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonSubject}>{s.subject?.name}</Text>
                    <Text style={styles.lessonDetail}>
                      Xona: {s.room?.name || 'Nomaʼlum'} • {s.teacher?.user?.first_name}{' '}
                      {s.teacher?.user?.last_name}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Ushbu kunda darslar yoʻq</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: GRADES */}
        {activeTab === 'grades' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oxirgi Baholar</Text>
            {data?.recent_grades && data.recent_grades.length > 0 ? (
              data.recent_grades.map((grade, idx) => (
                <View key={idx} style={styles.gradeCard}>
                  <View style={styles.gradeLeft}>
                    <Text style={styles.gradeSubject}>{grade.lesson?.subject?.name || 'Fan'}</Text>
                    <Text style={styles.gradeCategory}>
                      {grade.gradeCategory?.name || 'Darsdagi ish'}
                    </Text>
                    {grade.comment ? (
                      <Text style={styles.gradeComment}>Izoh: {grade.comment}</Text>
                    ) : null}
                  </View>
                  <View style={styles.gradeScoreBadge}>
                    <Text style={styles.gradeScoreText}>{grade.score}</Text>
                    <Text style={styles.gradeMaxText}>/{grade.max_score || 100}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="ribbon-outline" size={36} color={colors.textLight} />
                <Text style={styles.emptyText}>Hozircha baholar qoʻyilmagan</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: TASKS */}
        {activeTab === 'tasks' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uyga Vazifalar & Topshiriqlar</Text>
            {data?.assignments && data.assignments.length > 0 ? (
              data.assignments.map((task: any, idx: number) => (
                <View key={idx} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskSubject}>{task.subject?.name || 'Fan'}</Text>
                    <View style={styles.taskBadge}>
                      <Text style={styles.taskBadgeText}>Muddat: {task.due_date?.slice(0, 10)}</Text>
                    </View>
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description ? (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {task.description}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
                <Text style={styles.emptyText}>Barcha vazifalar topshirilgan!</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 5: COINS */}
        {activeTab === 'coins' && (
          <View style={styles.section}>
            <View style={styles.coinBanner}>
              <View style={styles.coinIconCircle}>
                <Text style={{ fontSize: 32 }}>🪙</Text>
              </View>
              <Text style={styles.coinBannerVal}>{data?.coin_balance || 0} Coin</Text>
              <Text style={styles.coinBannerSub}>
                Aʻlo baholar va intizom uchun maktab ragʻbati
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Sovgʻalar Doʻkoni</Text>
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>📚</Text>
                <Text style={styles.rewardName}>Badiiy Kitob</Text>
                <Text style={styles.rewardPrice}>50 Coin</Text>
              </View>

              <View style={styles.rewardCard}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>🎒</Text>
                <Text style={styles.rewardName}>Maktab Ryukzaki</Text>
                <Text style={styles.rewardPrice}>150 Coin</Text>
              </View>

              <View style={styles.rewardCard}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>🎟️</Text>
                <Text style={styles.rewardName}>Muzeyga Chipta</Text>
                <Text style={styles.rewardPrice}>80 Coin</Text>
              </View>

              <View style={styles.rewardCard}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>🎓</Text>
                <Text style={styles.rewardName}>Maxsus Sertifikat</Text>
                <Text style={styles.rewardPrice}>30 Coin</Text>
              </View>
            </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
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
    gap: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  lessonCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonTimeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lessonTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  lessonDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  lessonTopic: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  daysSelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  dayChip: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeDayChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  activeDayChipText: {
    color: '#ffffff',
  },
  gradeCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradeLeft: {
    flex: 1,
  },
  gradeSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  gradeCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gradeComment: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 4,
  },
  gradeScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gradeScoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  gradeMaxText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  taskBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  taskDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  coinBanner: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  coinIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  coinBannerVal: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  coinBannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  rewardPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
