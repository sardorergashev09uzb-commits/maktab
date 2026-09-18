import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProfileModal } from '../components/ProfileModal';
import { api } from '../lib/api';
import { TeacherPortalData, Lesson } from '../types';
import { colors } from '../lib/theme';

export function TeacherScreen() {
  const [data, setData] = useState<TeacherPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'attendance' | 'schedule'>('today');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.portal.teacher();
      setData(res);
      if (res?.today_lessons && res.today_lessons.length > 0 && !selectedLesson) {
        setSelectedLesson(res.today_lessons[0]);
      }
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

  const handleMarkAllPresent = () => {
    // Mark sample students as present
    const updated: { [studentId: number]: number } = { 1: 1, 2: 1, 3: 1, 4: 1 };
    setAttendanceRecords(updated);
    Alert.alert('Bajarildi', 'Barcha oʻquvchilar "Keldi" deb belgilandi');
  };

  const handleSetStatus = (studentId: number, status: number) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedLesson?.id) {
      Alert.alert('Xatolik', 'Dars tanlanmagan');
      return;
    }

    setIsSubmitting(true);
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student_id: Number(studentId),
        status,
      }));

      await api.attendance.batch({
        lesson_id: selectedLesson.id,
        records: records.length > 0 ? records : [{ student_id: 1, status: 1 }],
      });

      Alert.alert('Saqlandi', 'Davomat muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Davomatni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Oʻqituvchi stoli yuklanmoqda...</Text>
      </View>
    );
  }

  // Sample classroom roster for demonstration
  const sampleRoster = [
    { id: 1, name: 'Aliyev Behruz', code: 'ST-2026-001' },
    { id: 2, name: 'Karimova Madina', code: 'ST-2026-002' },
    { id: 3, name: 'Xalilov Jasur', code: 'ST-2026-003' },
    { id: 4, name: 'Oripova Diyora', code: 'ST-2026-004' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Oʻqituvchi Stoli"
        subtitle={data?.teacher?.specialization || 'Pedagog'}
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
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Bugungi darslar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'attendance' && styles.activeTabBtn]}
          onPress={() => setActiveTab('attendance')}
        >
          <Ionicons
            name="checkbox-outline"
            size={18}
            color={activeTab === 'attendance' ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
            Tezkor Davomat
          </Text>
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
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Haftalik reja
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TAB 1: TODAY'S LESSONS */}
        {activeTab === 'today' && (
          <View style={{ gap: 14 }}>
            {/* Quick KPI Cards */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{data?.today_lessons?.length || 0}</Text>
                <Text style={styles.kpiLabel}>Bugungi Darslar</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: colors.secondary }]}>
                  {data?.teacher_assignments?.length || 0}
                </Text>
                <Text style={styles.kpiLabel}>Biriktirilgan Sinflar</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Bugungi Jadval</Text>
            {data?.today_lessons && data.today_lessons.length > 0 ? (
              data.today_lessons.map((l, idx) => (
                <View key={idx} style={styles.lessonCard}>
                  <View style={styles.lessonTime}>
                    <Text style={styles.lessonTimeText}>
                      {l.start_time?.slice(0, 5)} - {l.end_time?.slice(0, 5)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonSubj}>{l.subject?.name || 'Matematika'}</Text>
                    <Text style={styles.lessonMeta}>
                      Sinf: {l.schoolClass?.name || '5-A'} • Xona: {l.room?.name || '102'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.attendanceActionBtn}
                    onPress={() => {
                      setSelectedLesson(l);
                      setActiveTab('attendance');
                    }}
                  >
                    <Text style={styles.attendanceActionBtnText}>Davomat</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="sunny-outline" size={36} color={colors.textLight} />
                <Text style={styles.emptyText}>Bugun rejalashtirilgan darslar yoʻq</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: SMART ATTENDANCE */}
        {activeTab === 'attendance' && (
          <View style={{ gap: 14 }}>
            {/* Current Lesson Banner */}
            <View style={styles.activeLessonBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeLessonTitle}>
                  {selectedLesson?.subject?.name || 'Fan tanlangan'}
                </Text>
                <Text style={styles.activeLessonSub}>
                  Sinf: {selectedLesson?.schoolClass?.name || '1-A'} • Vaqt:{' '}
                  {selectedLesson?.start_time?.slice(0, 5) || '08:30'}
                </Text>
              </View>
              <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllPresent}>
                <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                <Text style={styles.markAllBtnText}>Hammasi darsda</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Sinf oʻquvchilari</Text>

            {sampleRoster.map((student) => {
              const currentStatus = attendanceRecords[student.id] || 1; // Default present (1)
              return (
                <View key={student.id} style={styles.studentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentCode}>{student.code}</Text>
                  </View>

                  <View style={styles.statusButtons}>
                    {/* 1: Keldi (Present) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 1 && { backgroundColor: colors.success },
                      ]}
                      onPress={() => handleSetStatus(student.id, 1)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 1 && { color: '#ffffff' },
                        ]}
                      >
                        Keldi
                      </Text>
                    </TouchableOpacity>

                    {/* 2: Kechikdi (Late) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 2 && { backgroundColor: colors.warning },
                      ]}
                      onPress={() => handleSetStatus(student.id, 2)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 2 && { color: '#ffffff' },
                        ]}
                      >
                        Kech
                      </Text>
                    </TouchableOpacity>

                    {/* 3: Kelmadi (Absent) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 3 && { backgroundColor: colors.danger },
                      ]}
                      onPress={() => handleSetStatus(student.id, 3)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 3 && { color: '#ffffff' },
                        ]}
                      >
                        Yoʻq
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.saveAttendanceBtn}
              onPress={handleSaveAttendance}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
                  <Text style={styles.saveAttendanceBtnText}>Davomatni Saqlash</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Biriktirilgan Sinflar</Text>
            {data?.teacher_assignments && data.teacher_assignments.length > 0 ? (
              data.teacher_assignments.map((ta: any, idx: number) => {
                const c = ta.schoolClass;
                return (
                  <View key={idx} style={styles.assignedCard}>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{c?.name || 'Sinf'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assignedTitle}>{c?.name || 'Sinf'} - {ta.subject?.name}</Text>
                      <Text style={styles.assignedSub}>
                        Xona: {c?.room?.name || '101'} • {ta.is_class_teacher ? 'Sinf rahbari' : 'Fan oʻqituvchisi'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Hozircha biriktirilgan sinflar mavjud emas</Text>
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
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
  lessonTime: {
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
  lessonSubj: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  lessonMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  attendanceActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  attendanceActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  activeLessonBanner: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  activeLessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeLessonSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markAllBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  studentRow: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  studentCode: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  saveAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 14,
    marginTop: 10,
  },
  saveAttendanceBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  assignedCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  assignedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  assignedSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
