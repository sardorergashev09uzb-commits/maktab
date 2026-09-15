<?php


use yii\db\Migration;

class m260910_400700_create_exam_attempt_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%exam_attempt}}', [
            'id' => $this->primaryKey(),
            'exam_id' => $this->integer(),
            'student_id' => $this->integer(),
            'started_at' => $this->integer()->notNull(),
            'finished_at' => $this->integer()->null(),
            'total_score' => $this->decimal(5, 2)->defaultValue(0.00),
            'passed' => $this->boolean()->defaultValue(false),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-exam_attempt-exam_id', '{{%exam_attempt}}', 'exam_id', '{{%exam}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-exam_attempt-student_id', '{{%exam_attempt}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-exam_attempt-student_id', '{{%exam_attempt}}');
        $this->dropForeignKey('fk-exam_attempt-exam_id', '{{%exam_attempt}}');
        $this->dropTable('{{%exam_attempt}}');
    }
}
