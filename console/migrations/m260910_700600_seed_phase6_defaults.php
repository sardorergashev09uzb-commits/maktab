<?php

use yii\db\Migration;

/**
 * Handles seeding default surveys, dimensions, questions and options.
 */
class m260910_700600_seed_phase6_defaults extends Migration
{
    public function safeUp()
    {
        $time = time();

        // 1. Kasbga yo'naltirish so'rovnomasi
        $this->insert('{{%survey}}', [
            'title' => 'Kelajak kasblari va qobiliyat diagnostikasi (Holland & STEM modeli)',
            'description' => 'Ushbu ko\'p o\'lchovli test o\'quvchining qobiliyatlari, analitik tafakkuri, ijodiy yondashuvi va shaxsiy qiziqishlarini tahlil qilib, eng mos keladigan kasbiy yo\'nalishlarni aniqlab beradi.',
            'type' => 'career_guidance',
            'target_role' => 'student',
            'is_anonymous' => false,
            'status' => 20, // published
            'created_at' => $time,
            'updated_at' => $time,
        ]);
        $careerSurveyId = $this->db->getLastInsertID();

        // Dimensions
        $dimensions = [
            [
                'name' => 'Axborot Texnologiyalari va Sun\'iy Intellekt',
                'code' => 'STEM_IT',
                'description' => 'Mantiqiy-algoritmik tafakkur, dasturlash va ma\'lumotlar tahlili.',
                'color_code' => '#3b82f6',
                'recommendation_text' => 'Sizda kuchli mantiqiy-algoritmik tafakkur va tizimli yondashuv ustun. Sizga Dasturiy ta\'minot muhandisligi, Kiberxavfsizlik, Sun\'iy Intellekt va Katta ma\'lumotlar (Big Data) sohalari yuqori mos keladi.',
                'order_number' => 1,
            ],
            [
                'name' => 'Muhandislik, Mexatronika va Arxitektura',
                'code' => 'ENG_ROBOT',
                'description' => 'Fazoviy tasavvur, texnik tizimlar, robototexnika va mexanika.',
                'color_code' => '#f59e0b',
                'recommendation_text' => 'Siz murakkab texnik tizimlar, qurilmalar va fazoviy loyihalashga yuqori qobiliyatga egasiz. Sizga Robototexnika, Mexatronika, Biotibbiyot muhandisligi va Zamonaviy arxitektura yo\'nalishlari tavsiya etiladi.',
                'order_number' => 2,
            ],
            [
                'name' => 'Tibbiyot, Biologiya va Farmatsevtika',
                'code' => 'MED_BIO',
                'description' => 'Tabiiy fanlar, tirik organizmlar, tibbiy tadqiqotlar va laboratoriya.',
                'color_code' => '#10b981',
                'recommendation_text' => 'Sizda tirik organizmlar, tadqiqotlar va laboratoriya tahlillariga chuqur qiziqish bor. Shifokorlik, Genetik muhandislik, Biotexnologiya va Farmatsevtika sohalarida ulkan yutuqlarga erisha olasiz.',
                'order_number' => 3,
            ],
            [
                'name' => 'Biznes, Moliya va Menejment',
                'code' => 'BIZ_FIN',
                'description' => 'Yetakchilik, strategik tahlil, moliya, muzokaralar va loyiha boshqaruvi.',
                'color_code' => '#6366f1',
                'recommendation_text' => 'Sizda yetakchilik, strategik rejalashtirish, xatarlarni baholash va muloqot qobiliyati yuqori. Startap menejmenti, Investitsiya tahlili, Xalqaro iqtisodiyot va Marketing sohalari siz uchun ayni muddao.',
                'order_number' => 4,
            ],
            [
                'name' => 'Ijodiyot, Raqamli Dizayn va Media',
                'code' => 'ARTS_MEDIA',
                'description' => 'Estetik did, hissiy intellekt, vizual san\'at, UI/UX va audio-vizual ijod.',
                'color_code' => '#ec4899',
                'recommendation_text' => 'Sizda g\'ayrioddiy estetik did, erkin tasavvur va hissiy intellekt rivojlangan. UI/UX Dizayn, 3D Animatsiya, Kinematografiya va Zamonaviy Media yo\'nalishlarida o\'z iqtidoringizni to\'liq namoyon eta olasiz.',
                'order_number' => 5,
            ],
        ];

        $dimIds = [];
        foreach ($dimensions as $dim) {
            $this->insert('{{%survey_dimension}}', [
                'survey_id' => $careerSurveyId,
                'name' => $dim['name'],
                'code' => $dim['code'],
                'description' => $dim['description'],
                'color_code' => $dim['color_code'],
                'recommendation_text' => $dim['recommendation_text'],
                'order_number' => $dim['order_number'],
                'created_at' => $time,
                'updated_at' => $time,
            ]);
            $dimIds[$dim['code']] = $this->db->getLastInsertID();
        }

        // Questions & Options
        $questionsData = [
            [
                'text' => 'Bo\'sh vaqtingizda qaysi mashg\'ulot sizga eng katta zavq bag\'ishlaydi?',
                'options' => [
                    ['text' => 'Yangi dasturlash tilini o\'rganish yoki mantiqiy jumboqlarni yechish', 'code' => 'STEM_IT'],
                    ['text' => 'Konstruktorlar, sxemalar yig\'ish yoki texnik qurilmalarni tuzatish', 'code' => 'ENG_ROBOT'],
                    ['text' => 'Tabiatdagi hodisalarni kuzatish, mikroskop yoki biologik tajribalar o\'tkazish', 'code' => 'MED_BIO'],
                    ['text' => 'Yangi g\'oya asosida loyiha tuzish, do\'stlarni bir maqsad atrofida birlashtirish', 'code' => 'BIZ_FIN'],
                    ['text' => 'Rasm chizish, video montaj qilish yoki yangi dizayn yaratish', 'code' => 'ARTS_MEDIA'],
                ],
            ],
            [
                'text' => 'Agar maktabda erkin ilmiy loyiha tayyorlash berilsa, qaysi mavzuni tanlardingiz?',
                'options' => [
                    ['text' => 'Maktab o\'quvchilari uchun mobil ilova yoki bot yaratish', 'code' => 'STEM_IT'],
                    ['text' => 'Quyosh energiyasida harakatlanuvchi aqlli model loyihalash', 'code' => 'ENG_ROBOT'],
                    ['text' => 'Inson salomatligi va to\'g\'ri ovqatlanishning organizmga ta\'siri', 'code' => 'MED_BIO'],
                    ['text' => 'Maktab oshxonasining moliyaviy daromad modelini optimallashtirish', 'code' => 'BIZ_FIN'],
                    ['text' => 'Maktabning yangi brendi va vizual identifikatsiyasini ishlab chiqish', 'code' => 'ARTS_MEDIA'],
                ],
            ],
            [
                'text' => 'Kelajakda qanday ish muhitida faoliyat yuritishni orzu qilasiz?',
                'options' => [
                    ['text' => 'Zamonaviy IT kompaniyasida ilg\'or texnologiyalar yaratish', 'code' => 'STEM_IT'],
                    ['text' => 'Yuqori texnologiyali laboratoriya yoki ishlab chiqarish korxonasida', 'code' => 'ENG_ROBOT'],
                    ['text' => 'Zamonaviy klinika yoki biotexnologik ilmiy markazda', 'code' => 'MED_BIO'],
                    ['text' => 'O\'z shaxsiy biznesingizda rahbar sifatida', 'code' => 'BIZ_FIN'],
                    ['text' => 'Kreativ studiyada erkin ijodiy jamoa bilan', 'code' => 'ARTS_MEDIA'],
                ],
            ],
            [
                'text' => 'Qaysi fanlar guruhini o\'rganish sizga eng yengil va qiziq tuyuladi?',
                'options' => [
                    ['text' => 'Informatika va algebra', 'code' => 'STEM_IT'],
                    ['text' => 'Fizika, geometriya va chizmachilik', 'code' => 'ENG_ROBOT'],
                    ['text' => 'Biologiya, kimyo va anatomiya', 'code' => 'MED_BIO'],
                    ['text' => 'Iqtisodiyot, chet tillari va mantiq', 'code' => 'BIZ_FIN'],
                    ['text' => 'Tasviriy san\'at, adabiyot va madaniyat', 'code' => 'ARTS_MEDIA'],
                ],
            ],
            [
                'text' => 'Muammoni hal qilishda sizning asosiy uslubingiz qanday?',
                'options' => [
                    ['text' => 'Algoritmlar tuzib, qadamma-qadam tahlil qilish', 'code' => 'STEM_IT'],
                    ['text' => 'Amalda tajriba qilish, qismlarga ajratib mexanizmni ko\'rish', 'code' => 'ENG_ROBOT'],
                    ['text' => 'Ilmiy faktlar va tabiiy qonuniyatlarga tayanish', 'code' => 'MED_BIO'],
                    ['text' => 'Odamlar bilan muzokara olib borish va umumiy manfaat topish', 'code' => 'BIZ_FIN'],
                    ['text' => 'Kutilmagan nostandart ijodiy g\'oya o\'ylab topish', 'code' => 'ARTS_MEDIA'],
                ],
            ],
        ];

        foreach ($questionsData as $qIdx => $qData) {
            $this->insert('{{%survey_question}}', [
                'survey_id' => $careerSurveyId,
                'question_text' => $qData['text'],
                'question_type' => 'single_choice',
                'order_number' => $qIdx + 1,
                'is_required' => true,
                'created_at' => $time,
                'updated_at' => $time,
            ]);
            $qId = $this->db->getLastInsertID();

            foreach ($qData['options'] as $oIdx => $opt) {
                $this->insert('{{%survey_option}}', [
                    'survey_question_id' => $qId,
                    'option_text' => $opt['text'],
                    'dimension_id' => $dimIds[$opt['code']] ?? null,
                    'weight' => 2.00,
                    'order_number' => $oIdx + 1,
                    'created_at' => $time,
                    'updated_at' => $time,
                ]);
            }
        }

        // 2. O'qituvchini baholash so'rovnomasi (Anonim)
        $this->insert('{{%survey}}', [
            'title' => 'O\'qituvchi faoliyatini baholash (360 darajali fikr-mulohaza)',
            'description' => 'Hurmatli o\'quvchi! Darslar sifatini yanada oshirish uchun fan o\'qituvchingiz faoliyatini xolis baholang. Ushbu so\'rovnoma to\'liq ANONIM o\'tkaziladi.',
            'type' => 'teacher_eval',
            'target_role' => 'student',
            'is_anonymous' => true,
            'status' => 20, // published
            'created_at' => $time,
            'updated_at' => $time,
        ]);
        $teacherSurveyId = $this->db->getLastInsertID();

        $evalQuestions = [
            ['text' => 'O\'qituvchi yangi mavzuni tushunarli va qiziqarli tarzda yetkazib beradimi?', 'type' => 'rating_scale', 'req' => true],
            ['text' => 'Dars davomida o\'quvchilar savollariga sabr-toqat bilan javob beriladimi?', 'type' => 'rating_scale', 'req' => true],
            ['text' => 'Uy vazifalari va baholar o\'z vaqtida, adolatli tekshiriladimi?', 'type' => 'rating_scale', 'req' => true],
            ['text' => 'Darsda intizom va o\'zaro hurmat muhiti qanday darajada ta\'minlangan?', 'type' => 'rating_scale', 'req' => true],
            ['text' => 'O\'qituvchingizga qo\'shimcha taklif yoki tilaklaringiz:', 'type' => 'text', 'req' => false],
        ];

        foreach ($evalQuestions as $idx => $eq) {
            $this->insert('{{%survey_question}}', [
                'survey_id' => $teacherSurveyId,
                'question_text' => $eq['text'],
                'question_type' => $eq['type'],
                'order_number' => $idx + 1,
                'is_required' => $eq['req'],
                'created_at' => $time,
                'updated_at' => $time,
            ]);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%survey}}', ['type' => ['career_guidance', 'teacher_eval']]);
    }
}
