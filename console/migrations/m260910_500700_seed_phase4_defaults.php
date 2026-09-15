<?php

use yii\db\Migration;

class m260910_500700_seed_phase4_defaults extends Migration
{
    public function safeUp()
    {
        $time = time();

        // 1. Seed Coin Rules
        $rules = [
            ['Darsda to\'liq qatnashish (100% davomat)', 'perfect_attendance', 15, 'Hafta davomida dars qoldirmaganlik uchun', 1, $time, $time],
            ['Uy vazifasini o\'z vaqtida topshirish', 'homework_ontime', 20, 'Uy vazifasini belgilangan muddatdan kechiktirmay topshirish', 1, $time, $time],
            ['Imtihondan a\'lo ball (90%+)', 'exam_excellence', 50, 'Choraklik yoki oraliq imtihonda yuqori ball olish', 1, $time, $time],
            ['Darsdagi faollik va namunali xulq', 'behavior_good', 10, 'O\'qituvchi tomonidan darsdagi ijobiy ishtirok uchun', 1, $time, $time],
            ['Olimpiada va tanlovlar g\'olibi', 'competition_winner', 100, 'Fan olimpiadalari va maktab musobaqalaridagi g\'alaba', 1, $time, $time],
        ];

        $this->batchInsert('{{%coin_rule}}', [
            'title', 'code', 'coins_amount', 'description', 'is_active', 'created_at', 'updated_at'
        ], $rules);

        // 2. Seed Rewards
        $rewards = [
            ['Maktab logotipli maxsus futbolka', 'Sifatli paxta matosidan tayyorlangan brendli futbolka', 150, 25, null, 1, $time, $time],
            ['Ilmiy-ommabop kitob', 'Kutubxonamizdagi eng sara ilmiy va badiiy kitoblar', 80, 40, null, 1, $time, $time],
            ['Premium daftar va ruchkalar to\'plami', 'Zamonaviy kantselyariya to\'plami', 50, 50, null, 1, $time, $time],
            ['1 kunlik erkin kiyinish vaucheri', 'Juma kuni erkin kiyimda kelish imtiyozi', 100, 100, null, 1, $time, $time],
            ['Direktor bilan birgalikda tushlik', 'Maktab direktori bilan qahva va tushlik suhbati', 300, 10, null, 1, $time, $time],
        ];

        $this->batchInsert('{{%coin_reward}}', [
            'title', 'description', 'coins_cost', 'stock_quantity', 'image_url', 'is_active', 'created_at', 'updated_at'
        ], $rewards);

        // 3. Sample Student Contract & Finance
        $student = (new \yii\db\Query())->select(['id'])->from('{{%student}}')->one();
        $academicYear = (new \yii\db\Query())->select(['id'])->from('{{%academic_year}}')->one();
        $parent = (new \yii\db\Query())->select(['id'])->from('{{%parent}}')->one();
        $user = (new \yii\db\Query())->select(['id'])->from('{{%user}}')->one();

        if ($student && $academicYear) {
            $this->insert('{{%contract}}', [
                'contract_number' => 'SH-2026-001',
                'student_id' => $student['id'],
                'parent_id' => $parent ? $parent['id'] : null,
                'academic_year_id' => $academicYear['id'],
                'total_amount' => 15000000.00,
                'discount_amount' => 0.00,
                'paid_amount' => 1500000.00,
                'payment_plan' => 'monthly',
                'start_date' => '2026-09-01',
                'end_date' => '2027-05-31',
                'notes' => '1 yillik standart o\'qish shartnomasi',
                'status' => 10,
                'created_at' => $time,
                'updated_at' => $time,
            ]);

            $contractId = $this->db->getLastInsertID();

            // Sentyabr invoysi (To'langan)
            $this->insert('{{%invoice}}', [
                'contract_id' => $contractId,
                'student_id' => $student['id'],
                'invoice_number' => 'INV-2026-09',
                'title' => 'Sentyabr oyi o\'qish to\'lovi',
                'amount' => 1500000.00,
                'paid_amount' => 1500000.00,
                'due_date' => '2026-09-10',
                'status' => 30, // Paid
                'notes' => 'O\'z vaqtida to\'langan',
                'created_at' => $time,
                'updated_at' => $time,
            ]);

            $invoice1Id = $this->db->getLastInsertID();

            // To'lov kvitansiyasi
            $this->insert('{{%payment}}', [
                'payment_number' => 'PAY-2026-001',
                'invoice_id' => $invoice1Id,
                'student_id' => $student['id'],
                'amount' => 1500000.00,
                'payment_date' => '2026-09-05',
                'payment_method' => 'payme',
                'transaction_reference' => 'PAYME-TX-9842104',
                'notes' => 'Mobil ilova orqali to\'landi',
                'status' => 10,
                'created_at' => $time,
                'updated_at' => $time,
            ]);

            // Oktyabr invoysi (Kutilmoqda / Pending)
            $this->insert('{{%invoice}}', [
                'contract_id' => $contractId,
                'student_id' => $student['id'],
                'invoice_number' => 'INV-2026-10',
                'title' => 'Oktyabr oyi o\'qish to\'lovi',
                'amount' => 1500000.00,
                'paid_amount' => 0.00,
                'due_date' => '2026-10-10',
                'status' => 10, // Pending
                'notes' => 'Navbatdagi oylik to\'lov',
                'created_at' => $time,
                'updated_at' => $time,
            ]);

            // Seed Coin Ledger for this student
            $this->batchInsert('{{%coin_transaction}}', [
                'student_id', 'amount', 'type', 'reason', 'reference_type', 'reference_id', 'created_by', 'created_at'
            ], [
                [$student['id'], 50, 'credit', 'Matematika oraliq nazoratida a\'lo natija', 'exam', 1, $user ? $user['id'] : null, $time - 86400],
                [$student['id'], 20, 'credit', 'Fizika uy vazifasi o\'z vaqtida bajarildi', 'assignment', 1, $user ? $user['id'] : null, $time - 43200],
                [$student['id'], 15, 'credit', 'Haftalik to\'liq davomat mukofoti', 'lesson', null, $user ? $user['id'] : null, $time - 3600],
            ]);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%coin_transaction}}');
        $this->delete('{{%payment}}');
        $this->delete('{{%invoice}}');
        $this->delete('{{%contract}}');
        $this->delete('{{%coin_reward}}');
        $this->delete('{{%coin_rule}}');
    }
}
