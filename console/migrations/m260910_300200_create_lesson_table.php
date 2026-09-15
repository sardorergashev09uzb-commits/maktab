<?php

use yii\db\Migration;

class m260910_300200_create_lesson_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%lesson}}', [
            'id' => $this->primaryKey(),
            'schedule_id' => $this->integer()->null(),
            'academic_year_id' => $this->integer()->notNull(),
            'school_class_id' => $this->integer()->notNull(),
            'subject_id' => $this->integer()->notNull(),
            'teacher_id' => $this->integer()->notNull(),
            'room_id' => $this->integer()->null(),
            'date' => $this->date()->notNull(),
            'start_time' => $this->time()->notNull(),
            'end_time' => $this->time()->notNull(),
            'topic' => $this->string(255)->null(),
            'notes' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-lesson-schedule_id', '{{%lesson}}', 'schedule_id', '{{%schedule}}', 'id', 'SET NULL', 'RESTRICT');
        $this->addForeignKey('fk-lesson-academic_year_id', '{{%lesson}}', 'academic_year_id', '{{%academic_year}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-lesson-school_class_id', '{{%lesson}}', 'school_class_id', '{{%school_class}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-lesson-subject_id', '{{%lesson}}', 'subject_id', '{{%subject}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-lesson-teacher_id', '{{%lesson}}', 'teacher_id', '{{%teacher}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-lesson-room_id', '{{%lesson}}', 'room_id', '{{%room}}', 'id', 'SET NULL', 'RESTRICT');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-lesson-room_id', '{{%lesson}}');
        $this->dropForeignKey('fk-lesson-teacher_id', '{{%lesson}}');
        $this->dropForeignKey('fk-lesson-subject_id', '{{%lesson}}');
        $this->dropForeignKey('fk-lesson-school_class_id', '{{%lesson}}');
        $this->dropForeignKey('fk-lesson-academic_year_id', '{{%lesson}}');
        $this->dropForeignKey('fk-lesson-schedule_id', '{{%lesson}}');
        $this->dropTable('{{%lesson}}');
    }
}
