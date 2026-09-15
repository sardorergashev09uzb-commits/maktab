<?php

use yii\db\Migration;

class m260910_600500_seed_phase5_defaults extends Migration
{
    public function safeUp()
    {
        $time = time();

        // 1. Seed Achievements
        $achievements = [
            ['Matematika bilimdoni', 'Matematika fani bo\'yicha fan olimpiadasi yoki oraliq nazoratda 95%+ ball to\'plaganlik uchun', 'academic', 'indigo', 'Award', 50, 1, $time, $time],
            ['Haftalik to\'liq davomat', 'Bir oy davomida hech bir darsni qoldirmaganlik va kechikmaganlik uchun', 'discipline', 'emerald', 'CheckCircle2', 20, 1, $time, $time],
            ['Maktab sport chempioni', 'Maktab ichki va shahar sport musobaqalarida faxrli o\'rinni egallaganlik uchun', 'sport', 'amber', 'Trophy', 40, 1, $time, $time],
            ['Kitobxon o\'quvchi', 'Oy davomida maktab kutubxonasidan 5 tadan ortiq kitob o\'qib taqriz yozganlik uchun', 'creative', 'blue', 'BookOpen', 30, 1, $time, $time],
            ['Namunali xulq sohibi', 'Maktab qoidalariga to\'liq rioya qilgan va tengdoshlariga o\'rnak bo\'lgan o\'quvchi', 'discipline', 'purple', 'Star', 25, 1, $time, $time],
        ];

        $this->batchInsert('{{%achievement}}', [
            'title', 'description', 'category', 'badge_color', 'icon', 'coin_reward', 'is_active', 'created_at', 'updated_at'
        ], $achievements);

        $student = (new \yii\db\Query())->select(['id'])->from('{{%student}}')->one();
        $user = (new \yii\db\Query())->select(['id'])->from('{{%user}}')->one();
        $adminId = $user ? $user['id'] : null;

        // 2. Seed Student Achievement
        $firstAch = (new \yii\db\Query())->select(['id'])->from('{{%achievement}}')->one();
        if ($student && $firstAch) {
            $this->insert('{{%student_achievement}}', [
                'student_id' => $student['id'],
                'achievement_id' => $firstAch['id'],
                'awarded_date' => date('Y-m-d'),
                'notes' => 'Yuksak akademik ko\'rsatkichlar uchun taqdim etildi',
                'awarded_by' => $adminId,
                'created_at' => $time,
            ]);

            // 3. Seed Sample Certificate
            $this->insert('{{%certificate}}', [
                'student_id' => $student['id'],
                'title' => 'Respublika Fan Olimpiadasi (Matematika) - 2-o\'rin diplomi',
                'issuer' => 'Xalq Ta\'limi Vazirligi',
                'issue_date' => '2026-08-20',
                'file_url' => null,
                'verification_code' => 'CERT-OLYMP-2026-8942',
                'status' => 20, // Verified
                'reviewed_by' => $adminId,
                'review_notes' => 'Asl nusxasi tekshirildi va tasdiqlandi.',
                'reviewed_at' => $time,
                'created_at' => $time,
                'updated_at' => $time,
            ]);
        }

        // 4. Seed Announcements
        $announcements = [
            [
                'Yangi o\'quv yili boshlanishi va tantanali birinchi qo\'ng\'iroq',
                'Hurmatli ota-onalar, o\'qituvchilar va o\'quvchilar! Yangi o\'quv yili munosabati bilan barchangizni tabriklaymiz. Tantanali saf yig\'ilishi soat 08:30 da maktab asosiy maydonchasida boshlanadi.',
                'all',
                'urgent',
                1,
                $adminId,
                $time,
                null,
                $time,
                $time,
            ],
            [
                'Ota-onalar majlisi: 1-Chorak natijalari va rejalashtirish',
                'Hurmatli ota-onalar! Shu haftaning shanba kuni soat 14:00 da farzandlaringiz sinf rahbarlari bilan birgalikda 1-chorak akademik natijalari yuzasidan ota-onalar uchrashuvi bo\'lib o\'tadi.',
                'parents',
                'high',
                1,
                $adminId,
                $time,
                null,
                $time,
                $time,
            ],
            [
                'O\'qituvchilar uchun yangi baholash mezonlari va metodik qo\'llanma',
                'Hurmatli ustozlar, yangi formatdagi 48 soatlik baholash va topshiriqlar tizimi bo\'yicha metodik qo\'llanma o\'qituvchilar xonasida tarqatildi. Barcha o\'qituvchilar tanishib chiqishi so\'raladi.',
                'teachers',
                'normal',
                1,
                $adminId,
                $time,
                null,
                $time,
                $time,
            ],
        ];

        $this->batchInsert('{{%announcement}}', [
            'title', 'content', 'target_role', 'priority', 'is_published', 'author_id', 'published_at', 'expires_at', 'created_at', 'updated_at'
        ], $announcements);

        // 5. Seed Notifications
        if ($adminId) {
            $this->batchInsert('{{%notification}}', [
                'user_id', 'title', 'message', 'type', 'link_url', 'is_read', 'read_at', 'created_at'
            ], [
                [$adminId, 'Yangi to\'lov qabul qilindi', 'SH-2026-001 shartnoma bo\'yicha 1 500 000 so\'m to\'lov tasdiqlandi.', 'payment', '/payments', 0, null, $time - 3600],
                [$adminId, 'Sertifikat tekshiruvdan o\'tdi', 'Matematika fan olimpiadasi diplomi verifikatsiya qilindi.', 'achievement', '/achievements', 0, null, $time - 1800],
                [$adminId, 'Haftalik dars jadvali e\'lon qilindi', 'Barcha sinflar uchun yangi jadval tasdiqlandi.', 'announcement', '/schedule', 1, $time - 500, $time - 7200],
            ]);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%notification}}');
        $this->delete('{{%announcement}}');
        $this->delete('{{%certificate}}');
        $this->delete('{{%student_achievement}}');
        $this->delete('{{%achievement}}');
    }
}
