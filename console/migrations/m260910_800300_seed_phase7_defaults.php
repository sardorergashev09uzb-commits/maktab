<?php

use yii\db\Migration;

/**
 * Handles seeding default admission applications and CMS content.
 */
class m260910_800300_seed_phase7_defaults extends Migration
{
    public function safeUp()
    {
        $time = time();

        // 1. Namunaviy arizalar
        $applications = [
            [
                'application_number' => 'ADM-2026-001',
                'first_name' => 'Jasur',
                'last_name' => 'Xamidov',
                'middle_name' => 'Boburovich',
                'birth_date' => '2014-05-12',
                'gender' => 1,
                'applying_grade' => 5,
                'parent_name' => 'Bobur Xamidov',
                'parent_phone' => '+998901112233',
                'parent_email' => 'bobur@example.uz',
                'address' => 'Toshkent sh., Yunusobod tumani, 4-mavze',
                'previous_school' => '42-umumta\'lim maktabi',
                'status' => 'new',
                'source' => 'landing_page',
                'notes' => 'Ota-onasi matematika yo\'nalishiga qiziqishini bildirgan.',
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'application_number' => 'ADM-2026-002',
                'first_name' => 'Madina',
                'last_name' => 'Tursunova',
                'middle_name' => 'Rustam qizi',
                'birth_date' => '2019-09-20',
                'gender' => 2,
                'applying_grade' => 1,
                'parent_name' => 'Dildora Tursunova',
                'parent_phone' => '+998902223344',
                'parent_email' => 'dildora@example.uz',
                'address' => 'Toshkent sh., Mirzo Ulug\'bek tumani',
                'previous_school' => 'Smart Kids bolalar bog\'chasi',
                'status' => 'interview',
                'interview_date' => date('Y-m-d 10:00:00', strtotime('+2 days')),
                'interview_notes' => 'Mantiqiy savollarga qobiliyati yuqori, jamoada o\'zini erkin tutadi.',
                'source' => 'telegram',
                'created_at' => $time - 86400,
                'updated_at' => $time,
            ],
            [
                'application_number' => 'ADM-2026-003',
                'first_name' => 'Amir',
                'last_name' => 'Saidov',
                'middle_name' => 'Farhodovich',
                'birth_date' => '2011-03-15',
                'gender' => 1,
                'applying_grade' => 8,
                'parent_name' => 'Farhod Saidov',
                'parent_phone' => '+998903334455',
                'parent_email' => 'farhod@example.uz',
                'address' => 'Toshkent sh., Shayxontohur tumani',
                'previous_school' => '17-maktab',
                'status' => 'accepted',
                'exam_score' => 92.50,
                'notes' => 'Kirish imtihonidan 92.5 ball to\'pladi. Sinfga rasmiylashtirish tavsiya etildi.',
                'source' => 'landing_page',
                'created_at' => $time - 172800,
                'updated_at' => $time,
            ],
        ];

        foreach ($applications as $app) {
            $this->insert('{{%admission_application}}', $app);
        }

        // 2. CMS Sections
        $sections = [
            [
                'key' => 'hero',
                'title' => 'Zamonaviy Xususiy Maktab — Farzandingizning Yorqin Kelajagi Shu Yerdan Boshlanadi',
                'subtitle' => 'Xalqaro standartlar, Cambridge dasturi, STEAM laboratoriyalari va kuchli axloqiy tarbiya uyg\'unligi.',
                'content' => 'Biz har bir bolaning individual iqtidoriga ishonamiz va uni kashf etish uchun qulay ta\'lim muhitini yaratamiz.',
                'image_url' => '/images/school_hero.jpg',
                'is_active' => true,
                'order_number' => 1,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'about',
                'title' => 'Nega Aynan Bizning Maktab?',
                'subtitle' => 'Kelajak liderlarini tayyorlaydigan innovatsion ekotizim',
                'content' => 'Maktabimizda akademik ta\'lim zamonaviy raqamli texnologiyalar, robototexnika, 3 mahal sog\'lom ovqatlanish va professional sport seksiyalari bilan birga olib boriladi.',
                'image_url' => null,
                'is_active' => true,
                'order_number' => 2,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'key' => 'stats',
                'title' => 'Raqamlar va Yutuqlarimiz',
                'subtitle' => 'Sifatli ta\'limning amaldagi isboti',
                'content' => json_encode([
                    ['label' => 'O\'quvchilar soni', 'value' => '500+'],
                    ['label' => 'Oliy toifali ustozlar', 'value' => '45+'],
                    ['label' => 'OTMga kirish natijasi', 'value' => '100%'],
                    ['label' => 'STEAM to\'garaklari', 'value' => '20+'],
                ]),
                'image_url' => null,
                'is_active' => true,
                'order_number' => 3,
                'created_at' => $time,
                'updated_at' => $time,
            ],
        ];

        foreach ($sections as $sec) {
            $this->insert('{{%cms_section}}', $sec);
        }

        // 3. CMS FAQs
        $faqs = [
            [
                'question' => 'Maktabga qabul jarayoni qanday bosqichlardan iborat?',
                'answer' => 'Veb-saytimiz orqali onlayn ariza qoldirasiz. Qabul komissiyasi siz bilan bog\'lanib, o\'quvchi bilan psixologik suhbat va fanlar bo\'yicha diagnostik test kunini belgilaydi.',
                'category' => 'admission',
                'order_number' => 1,
                'is_active' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'question' => 'O\'qish to\'lovi va to\'lov muddatlari qanday tartibda amalga oshiriladi?',
                'answer' => 'Yillik ta\'lim to\'lovi qulay grafik asosida oylik, choraklik yoki bir yillik (10% chegirma bilan) shaklda to\'lanishi mumkin. Click, Payme yoki bank orqali qabul qilinadi.',
                'category' => 'payment',
                'order_number' => 2,
                'is_active' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'question' => 'Maktabda ovqatlanish va transport xizmati bormi?',
                'answer' => 'Ha, kuniga 3 mahal issiq va muvozanatli parhez taomlar beriladi. Shuningdek, shahar bo\'ylab maxsus qulay maktab avtobuslari (shuttle bus) xizmat ko\'rsatadi.',
                'category' => 'general',
                'order_number' => 3,
                'is_active' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'question' => 'Chet tillari qaysi darajada o\'rgatiladi?',
                'answer' => 'Ingliz tili Cambridge dasturi asosida har kuni o\'rgatiladi va bitiruvchilar IELTS 7.0+ darajaga ega bo\'ladilar. 5-sinfdan boshlab ikkinchi xorijiy til sifatida nemis yoki arab tili tanlanadi.',
                'category' => 'curriculum',
                'order_number' => 4,
                'is_active' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ],
            [
                'question' => 'Qanday sport va ijodiy to\'garaklar faoliyat yuritadi?',
                'answer' => 'Robototexnika, Mental arifmetika, Dasturlash, Suzish, Shaxmat, Taekvondo va Teatr studiyasi kabi 20 dan ortiq to\'garaklar maktab dasturiga to\'liq kiritilgan.',
                'category' => 'curriculum',
                'order_number' => 5,
                'is_active' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ],
        ];

        foreach ($faqs as $faq) {
            $this->insert('{{%cms_faq}}', $faq);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%cms_faq}}');
        $this->delete('{{%cms_section}}');
        $this->delete('{{%admission_application}}');
    }
}
