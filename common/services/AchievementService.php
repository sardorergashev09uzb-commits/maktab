<?php

namespace common\services;

use Yii;
use common\models\Achievement;
use common\models\StudentAchievement;
use common\models\Certificate;
use common\models\Student;
use yii\web\NotFoundHttpException;
use yii\web\BadRequestHttpException;

class AchievementService
{
    /**
     * Award an achievement badge to a student and trigger coin reward
     */
    public function awardAchievement($studentId, $achievementId, $notes = null, $userId = null)
    {
        $student = Student::findOne($studentId);
        if (!$student) {
            throw new NotFoundHttpException('O\'quvchi topilmadi.');
        }

        $achievement = Achievement::findOne($achievementId);
        if (!$achievement || !$achievement->is_active) {
            throw new NotFoundHttpException('Yutuq/nishon topilmadi yoki faol emas.');
        }

        $sa = new StudentAchievement();
        $sa->student_id = $studentId;
        $sa->achievement_id = $achievementId;
        $sa->awarded_date = date('Y-m-d');
        $sa->notes = $notes;
        $sa->awarded_by = $userId;
        $sa->created_at = time();

        if (!$sa->save()) {
            throw new BadRequestHttpException('Yutuqni biriktirishda xatolik: ' . json_encode($sa->errors));
        }

        // Award coins if defined
        if ($achievement->coin_reward > 0) {
            $coinService = new CoinService();
            $coinService->awardCoins(
                $studentId,
                $achievement->coin_reward,
                $achievement->title . ' nishoni uchun rag\'bat',
                'achievement',
                $achievement->id,
                $userId
            );
        }

        // Send notification
        if ($student->user_id) {
            $notifService = new NotificationService();
            $notifService->sendNotification(
                $student->user_id,
                'Tabriklaymiz! Yangi yutuq: ' . $achievement->title,
                'Sizga ' . $achievement->title . ' nishoni taqdim etildi va ' . $achievement->coin_reward . ' coin berildi!',
                'achievement',
                '/portal/student'
            );
        }

        return [
            'success' => true,
            'student_achievement' => $sa,
            'achievement' => $achievement,
        ];
    }

    /**
     * Review and verify a certificate
     */
    public function verifyCertificate($certificateId, $status, $reviewNotes = null, $userId = null)
    {
        $cert = Certificate::findOne($certificateId);
        if (!$cert) {
            throw new NotFoundHttpException('Sertifikat topilmadi.');
        }

        $cert->status = $status;
        $cert->reviewed_by = $userId;
        $cert->review_notes = $reviewNotes;
        $cert->reviewed_at = time();
        $cert->save(false);

        if ($status == Certificate::STATUS_VERIFIED) {
            // Reward 50 coins for verified diploma/certificate
            $coinService = new CoinService();
            $coinService->awardCoins(
                $cert->student_id,
                50,
                $cert->title . ' sertifikati tasdiqlandi',
                'certificate',
                $cert->id,
                $userId
            );

            $student = $cert->student;
            if ($student && $student->user_id) {
                $notifService = new NotificationService();
                $notifService->sendNotification(
                    $student->user_id,
                    'Sertifikat tasdiqlandi!',
                    $cert->title . ' sertifikatingiz tasdiqlandi va hisobingizga 50 coin qo\'shildi.',
                    'achievement',
                    '/achievements'
                );
            }
        }

        return [
            'success' => true,
            'certificate' => $cert,
        ];
    }
}
