<?php

use yii\db\Migration;

/**
 * Class m260910_900200_seed_phase8_defaults
 */
class m260910_900200_seed_phase8_defaults extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $time = time();

        $settings = [
            // General
            [
                'key' => 'school_name',
                'value' => 'Al-Xorazmiy Xalqaro Xususiy Maktabi',
                'title' => 'Maktabning to\'liq nomi',
                'description' => 'Maktab rasmiy hujjati va landing sahifasida ko\'rsatiladigan nomi',
                'group' => 'general',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'school_phone',
                'value' => '+998 71 200 00 20',
                'title' => 'Aloqa telefoni',
                'description' => 'Maktab ma\'muriyati telefon raqami',
                'group' => 'general',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'school_email',
                'value' => 'info@al-xorazmiy.uz',
                'title' => 'Elektron pochta',
                'description' => 'Rasmiy xat-xabarlar uchun email manzili',
                'group' => 'general',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'school_address',
                'value' => 'Toshkent sh., Yunusobod tumani, Amir Temur ko\'chasi, 14-uy',
                'title' => 'Yuridik manzil',
                'description' => 'Maktab joylashgan bino va manzil',
                'group' => 'general',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'director_name',
                'value' => 'Akromov Bobur Aliyevich',
                'title' => 'Maktab Direktori',
                'description' => 'Direktor F.I.Sh.',
                'group' => 'general',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            // Academic
            [
                'key' => 'grade_deadline_hours',
                'value' => '48',
                'title' => 'Baholash muddati (soat)',
                'description' => 'Dars yakunlanganidan keyin baho qo\'yish uchun o\'qituvchiga beriladigan vaqt (48 soat qoidasi)',
                'group' => 'academic',
                'type' => 'number',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'late_threshold_minutes',
                'value' => '15',
                'title' => 'Kechikish chegarasi (daqiqa)',
                'description' => 'Necha daqiqadan so\'ng o\'quvchiga kechikkan statusi qo\'yilishi',
                'group' => 'academic',
                'type' => 'number',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'passing_exam_percent',
                'value' => '60',
                'title' => 'Imtihondan o\'tish bali (%)',
                'description' => 'Test va oraliq nazoratlardan o\'tish uchun minimal foiz',
                'group' => 'academic',
                'type' => 'number',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            // Finance
            [
                'key' => 'currency',
                'value' => 'UZS',
                'title' => 'Asosiy valyuta',
                'description' => 'Buxgalteriya va shartnomalar valyuta belgisi',
                'group' => 'finance',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'tax_id',
                'value' => '301298456',
                'title' => 'Maktab STIR / INN',
                'description' => 'Yuridik soliq to\'lovchi identifikatsiya raqami',
                'group' => 'finance',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'bank_account',
                'value' => '20208000900123456001',
                'title' => 'Hisob-kitob raqami',
                'description' => 'Maktabning asosiy bank hisob raqami',
                'group' => 'finance',
                'type' => 'string',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            // Notification & System
            [
                'key' => 'sms_notification_enabled',
                'value' => '1',
                'title' => 'SMS bildirishnomalar',
                'description' => 'Ota-onalarga davomat va to\'lovlar haqida SMS xabar yuborish (1 = Ha, 0 = Yo\'q)',
                'group' => 'notification',
                'type' => 'boolean',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'coin_system_enabled',
                'value' => '1',
                'title' => 'Gamifikatsiya va Coin tizimi',
                'description' => 'O\'quvchilarni rag\'batlantirish iqtisodiyotining faolligi',
                'group' => 'academic',
                'type' => 'boolean',
                'created_at' => $time,
                'updated_at' => $time,
            ],
        ];

        foreach ($settings as $setting) {
            $this->insert('{{%system_setting}}', $setting);
        }

        // Insert initial audit logs
        $admin = (new \yii\db\Query())->from('{{%user}}')->where(['username' => 'admin'])->one();
        $adminId = $admin ? $admin['id'] : null;

        $this->insert('{{%audit_log}}', [
            'user_id' => $adminId,
            'action' => 'system_init',
            'model' => 'SystemSetting',
            'model_id' => null,
            'details' => 'Tizim dastlabki sozlamalari muvaffaqiyatli o\'rnatildi va konfiguratsiya qilindi.',
            'ip_address' => '127.0.0.1',
            'created_at' => $time,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->truncateTable('{{%audit_log}}');
        $this->truncateTable('{{%system_setting}}');
    }
}
