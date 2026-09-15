<?php

use yii\db\Migration;

class m260910_300600_create_grade_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%grade}}', [
            'id' => $this->primaryKey(),
            'lesson_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'teacher_id' => $this->integer()->notNull(),
            'grade_category_id' => $this->integer()->notNull(),
            'score' => $this->decimal(5, 2)->notNull(),
            'max_score' => $this->decimal(5, 2)->notNull()->defaultValue(100.00),
            'comment' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-grade-lesson_id', '{{%grade}}', 'lesson_id', '{{%lesson}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade-student_id', '{{%grade}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade-teacher_id', '{{%grade}}', 'teacher_id', '{{%teacher}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-grade-category_id', '{{%grade}}', 'grade_category_id', '{{%grade_category}}', 'id', 'CASCADE', 'RESTRICT');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-grade-category_id', '{{%grade}}');
        $this->dropForeignKey('fk-grade-teacher_id', '{{%grade}}');
        $this->dropForeignKey('fk-grade-student_id', '{{%grade}}');
        $this->dropForeignKey('fk-grade-lesson_id', '{{%grade}}');
        $this->dropTable('{{%grade}}');
    }
}
