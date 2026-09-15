<?php

namespace common\services;

use Yii;
use common\models\AcademicCalendar;
use common\models\GradingPolicy;

class CalendarService
{
    /**
     * Check if a given date is a working day
     */
    public static function isWorkingDay(string $date, ?int $academicYearId = null): bool
    {
        $dayOfWeek = (int) date('N', strtotime($date)); // 1=Mon .. 7=Sun
        if ($dayOfWeek >= 6) { // Saturday or Sunday
            return false;
        }

        $query = AcademicCalendar::find()->where(['date' => $date]);
        if ($academicYearId) {
            $query->andWhere(['academic_year_id' => $academicYearId]);
        }

        $calDay = $query->one();
        if ($calDay) {
            return (bool) $calDay->is_working_day;
        }

        return true;
    }

    /**
     * Calculate grading deadline timestamp for a lesson based on grading policy.
     * Takes into account weekends and holidays.
     */
    public static function calculateDeadline(string $lessonDate, string $lessonEndTime, ?GradingPolicy $policy = null, ?int $academicYearId = null): int
    {
        if (!$policy) {
            $policy = GradingPolicy::find()->where(['status' => 10])->one();
        }

        $hours = $policy ? (int)$policy->deadline_hours : 48;
        $excludeWeekends = $policy ? (bool)$policy->exclude_weekends : true;
        $excludeHolidays = $policy ? (bool)$policy->exclude_holidays : true;

        $currentTime = strtotime("$lessonDate $lessonEndTime");
        $remainingHours = $hours;

        while ($remainingHours > 0) {
            // Step forward 1 hour
            $currentTime += 3600;
            $currentDateStr = date('Y-m-d', $currentTime);
            $dayOfWeek = (int) date('N', $currentTime);

            if ($excludeWeekends && $dayOfWeek >= 6) {
                continue;
            }

            if ($excludeHolidays) {
                $isHoliday = AcademicCalendar::find()
                    ->where(['date' => $currentDateStr, 'is_working_day' => false])
                    ->exists();
                if ($isHoliday) {
                    continue;
                }
            }

            $remainingHours--;
        }

        return $currentTime;
    }
}
