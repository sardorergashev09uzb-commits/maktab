<?php

use yii\db\Migration;

class m260910_300700_create_grade_override_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%grade_override}}', [
            'id' => $this->primaryKey(),
            'lesson_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'teacher_id' => $this->integer()->notNull(),
            'grade_category_id' => $this->integer()->notNull(),
            'requested_score' => $this->decimal(5, 2)->notNull(),
            'reason' => $this->text()->notNull(),
            'zavuch_id' => $this->integer()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'decision_notes' => $this->text()->null(),
            'decided_at' => $this->integer()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-grade_override-lesson_id', '{{%grade_override}}', 'lesson_id', '{{%lesson}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade_override-student_id', '{{%grade_override}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade_override-teacher_id', '{{%grade_override}}', 'teacher_id', '{{%teacher}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade_override-category_id', '{{%grade_override}}', 'grade_category_id', '{{%grade_category}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade_override-zavuch_id', '{{%grade_override}}', 'zavuch_id', '{{%user}}', 'id', 'SET NULL', 'RESTRICT');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-grade_override-zavuch_id', '{{%grade_override}}');
        $this->dropForeignKey('fk-grade_override-category_id', '{{%grade_override}}');
        $this->dropForeignKey('fk-grade_override-teacher_id', '{{%grade_override}}');
        $this->dropForeignKey('fk-grade_override-student_id', '{{%grade_override}}');
        $this->dropForeignKey('fk-grade_override-lesson_id', '{{%grade_override}}');
        $this->dropTable('{{%grade_override}}');
    }
}
