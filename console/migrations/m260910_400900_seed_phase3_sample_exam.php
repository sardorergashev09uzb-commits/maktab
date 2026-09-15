<?php


use yii\db\Migration;
use yii\db\Query;

class m260910_400900_seed_phase3_sample_exam extends Migration
{
    public function safeUp()
    {
        $subject = (new Query())->select(['id'])->from('{{%subject}}')->one();
        $teacher = (new Query())->select(['id'])->from('{{%teacher}}')->one();
        $academicYear = (new Query())->select(['id'])->from('{{%academic_year}}')->one();
        $schoolClass = (new Query())->select(['id'])->from('{{%school_class}}')->one();

        if ($subject && $teacher) {
            $this->insert('{{%question_bank}}', [
                'subject_id' => $subject['id'],
                'teacher_id' => $teacher['id'],
                'title' => 'Matematika asosiy savollar banki',
                'status' => 10,
                'created_at' => time(),
                'updated_at' => time(),
            ]);
            $bankId = $this->db->getLastInsertID();

            // Q1
            $this->insert('{{%question}}', [
                'question_bank_id' => $bankId,
                'subject_id' => $subject['id'],
                'question_text' => '25 * 4 hisoblang',
                'type' => 'single_choice',
                'points' => 10,
                'status' => 10,
                'created_at' => time(),
                'updated_at' => time(),
            ]);
            $q1Id = $this->db->getLastInsertID();
            $this->insert('{{%question_option}}', ['question_id' => $q1Id, 'option_text' => '100', 'is_correct' => 1, 'order_number' => 1]);
            $this->insert('{{%question_option}}', ['question_id' => $q1Id, 'option_text' => '90', 'is_correct' => 0, 'order_number' => 2]);
            $this->insert('{{%question_option}}', ['question_id' => $q1Id, 'option_text' => '110', 'is_correct' => 0, 'order_number' => 3]);
            $this->insert('{{%question_option}}', ['question_id' => $q1Id, 'option_text' => '80', 'is_correct' => 0, 'order_number' => 4]);

            // Q2
            $this->insert('{{%question}}', [
                'question_bank_id' => $bankId,
                'subject_id' => $subject['id'],
                'question_text' => 'Kvadrat tenglama ildizlari: x^2 - 5x + 6 = 0',
                'type' => 'formula',
                'formula' => 'x^2 - 5x + 6 = 0',
                'points' => 15,
                'status' => 10,
                'created_at' => time(),
                'updated_at' => time(),
            ]);
            $q2Id = $this->db->getLastInsertID();
            $this->insert('{{%question_option}}', ['question_id' => $q2Id, 'option_text' => 'x1 = 2, x2 = 3', 'is_correct' => 1, 'order_number' => 1]);
            $this->insert('{{%question_option}}', ['question_id' => $q2Id, 'option_text' => 'x1 = 1, x2 = 6', 'is_correct' => 0, 'order_number' => 2]);
            $this->insert('{{%question_option}}', ['question_id' => $q2Id, 'option_text' => 'x1 = -2, x2 = -3', 'is_correct' => 0, 'order_number' => 3]);
            $this->insert('{{%question_option}}', ['question_id' => $q2Id, 'option_text' => 'x1 = 0, x2 = 5', 'is_correct' => 0, 'order_number' => 4]);

            // Q3
            $this->insert('{{%question}}', [
                'question_bank_id' => $bankId,
                'subject_id' => $subject['id'],
                'question_text' => 'Har qanday juft son 2 ga qoldiqsiz bo\'linadi',
                'type' => 'true_false',
                'points' => 10,
                'status' => 10,
                'created_at' => time(),
                'updated_at' => time(),
            ]);
            $q3Id = $this->db->getLastInsertID();
            $this->insert('{{%question_option}}', ['question_id' => $q3Id, 'option_text' => 'To\'g\'ri', 'is_correct' => 1, 'order_number' => 1]);
            $this->insert('{{%question_option}}', ['question_id' => $q3Id, 'option_text' => 'Noto\'g\'ri', 'is_correct' => 0, 'order_number' => 2]);

            if ($academicYear && $schoolClass) {
                $this->insert('{{%exam}}', [
                    'academic_year_id' => $academicYear['id'],
                    'school_class_id' => $schoolClass['id'],
                    'subject_id' => $subject['id'],
                    'teacher_id' => $teacher['id'],
                    'title' => '1-Chorak Matematika Oraliq Nazorati',
                    'duration_minutes' => 45,
                    'start_time' => date('Y-m-d H:i:s'),
                    'end_time' => date('Y-m-d H:i:s', strtotime('+7 days')),
                    'status' => 20,
                    'created_at' => time(),
                    'updated_at' => time(),
                ]);
                $examId = $this->db->getLastInsertID();

                $this->insert('{{%exam_question}}', ['exam_id' => $examId, 'question_id' => $q1Id, 'points' => 10, 'order_number' => 1]);
                $this->insert('{{%exam_question}}', ['exam_id' => $examId, 'question_id' => $q2Id, 'points' => 15, 'order_number' => 2]);
                $this->insert('{{%exam_question}}', ['exam_id' => $examId, 'question_id' => $q3Id, 'points' => 10, 'order_number' => 3]);
            }
        }
    }

    public function safeDown()
    {
        $this->delete('{{%exam}}', ['title' => '1-Chorak Matematika Oraliq Nazorati']);
        $this->delete('{{%question_bank}}', ['title' => 'Matematika asosiy savollar banki']);
    }
}
