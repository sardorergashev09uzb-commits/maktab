<?php


use yii\db\Migration;

class m260910_400600_create_exam_question_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%exam_question}}', [
            'exam_id' => $this->integer(),
            'question_id' => $this->integer(),
            'points' => $this->decimal(5, 2)->defaultValue(1.00),
            'order_number' => $this->integer()->defaultValue(1),
            'PRIMARY KEY(exam_id, question_id)',
        ], $tableOptions);

        $this->addForeignKey('fk-exam_question-exam_id', '{{%exam_question}}', 'exam_id', '{{%exam}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-exam_question-question_id', '{{%exam_question}}', 'question_id', '{{%question}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-exam_question-question_id', '{{%exam_question}}');
        $this->dropForeignKey('fk-exam_question-exam_id', '{{%exam_question}}');
        $this->dropTable('{{%exam_question}}');
    }
}
