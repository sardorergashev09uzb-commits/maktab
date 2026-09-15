<?php


use yii\db\Migration;

class m260910_400800_create_exam_answer_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%exam_answer}}', [
            'id' => $this->primaryKey(),
            'exam_attempt_id' => $this->integer(),
            'question_id' => $this->integer(),
            'selected_option_id' => $this->integer()->null(),
            'text_answer' => $this->text()->null(),
            'score_awarded' => $this->decimal(5, 2)->defaultValue(0.00),
            'is_correct' => $this->boolean()->defaultValue(false),
        ], $tableOptions);

        $this->addForeignKey('fk-exam_answer-exam_attempt_id', '{{%exam_answer}}', 'exam_attempt_id', '{{%exam_attempt}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-exam_answer-question_id', '{{%exam_answer}}', 'question_id', '{{%question}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-exam_answer-question_id', '{{%exam_answer}}');
        $this->dropForeignKey('fk-exam_answer-exam_attempt_id', '{{%exam_answer}}');
        $this->dropTable('{{%exam_answer}}');
    }
}
