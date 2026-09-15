<?php


use yii\db\Migration;

class m260910_400100_create_submission_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%submission}}', [
            'id' => $this->primaryKey(),
            'assignment_id' => $this->integer(),
            'student_id' => $this->integer(),
            'text_content' => $this->text()->null(),
            'file_url' => $this->string(255)->null(),
            'submitted_at' => $this->integer()->notNull(),
            'score' => $this->decimal(5, 2)->null(),
            'teacher_feedback' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createIndex('idx-submission-assignment_student', '{{%submission}}', ['assignment_id', 'student_id'], true);
        $this->addForeignKey('fk-submission-assignment_id', '{{%submission}}', 'assignment_id', '{{%assignment}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-submission-student_id', '{{%submission}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-submission-student_id', '{{%submission}}');
        $this->dropForeignKey('fk-submission-assignment_id', '{{%submission}}');
        $this->dropTable('{{%submission}}');
    }
}
