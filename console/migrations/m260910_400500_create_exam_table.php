<?php


use yii\db\Migration;

class m260910_400500_create_exam_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%exam}}', [
            'id' => $this->primaryKey(),
            'academic_year_id' => $this->integer(),
            'school_class_id' => $this->integer(),
            'subject_id' => $this->integer(),
            'teacher_id' => $this->integer(),
            'title' => $this->string(255)->notNull(),
            'description' => $this->text()->null(),
            'duration_minutes' => $this->integer()->defaultValue(45),
            'start_time' => $this->dateTime()->notNull(),
            'end_time' => $this->dateTime()->notNull(),
            'passing_score' => $this->decimal(5, 2)->defaultValue(60.00),
            'max_score' => $this->decimal(5, 2)->defaultValue(100.00),
            'shuffle_questions' => $this->boolean()->defaultValue(true),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-exam-academic_year_id', '{{%exam}}', 'academic_year_id', '{{%academic_year}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-exam-school_class_id', '{{%exam}}', 'school_class_id', '{{%school_class}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-exam-subject_id', '{{%exam}}', 'subject_id', '{{%subject}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-exam-teacher_id', '{{%exam}}', 'teacher_id', '{{%teacher}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-exam-teacher_id', '{{%exam}}');
        $this->dropForeignKey('fk-exam-subject_id', '{{%exam}}');
        $this->dropForeignKey('fk-exam-school_class_id', '{{%exam}}');
        $this->dropForeignKey('fk-exam-academic_year_id', '{{%exam}}');
        $this->dropTable('{{%exam}}');
    }
}
