<?php

use yii\db\Migration;

class m260910_300800_seed_phase2_defaults extends Migration
{
    public function safeUp()
    {
        $time = time();

        $this->insert('{{%grading_policy}}', [
            'name' => 'Asosiy baholash siyosati (48 soat)',
            'deadline_hours' => 48,
            'exclude_weekends' => 1,
            'exclude_holidays' => 1,
            'allow_zavuch_override' => 1,
            'status' => 10,
            'created_at' => $time,
            'updated_at' => $time,
        ]);

        $categories = [
            ['Uy vazifasi', 'homework', 1.0, 100],
            ['Darsdagi ish', 'classwork', 1.0, 100],
            ['Nazorat ishi', 'control', 1.5, 100],
            ['Loyiha', 'project', 1.5, 100],
            ['Imtihon', 'exam', 2.0, 100],
            ['Yakuniy', 'final', 2.0, 100],
        ];

        foreach ($categories as $category) {
            $this->insert('{{%grade_category}}', [
                'name' => $category[0],
                'code' => $category[1],
                'weight' => $category[2],
                'max_score' => $category[3],
                'status' => 10,
                'created_at' => $time,
                'updated_at' => $time,
            ]);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%grade_category}}', ['code' => ['homework', 'classwork', 'control', 'project', 'exam', 'final']]);
        $this->delete('{{%grading_policy}}', ['name' => 'Asosiy baholash siyosati (48 soat)']);
    }
}
