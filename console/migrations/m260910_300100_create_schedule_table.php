<?php

use yii\db\Migration;

class m260910_300100_create_schedule_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%schedule}}', [
            'id' => $this->primaryKey(),
            'academic_year_id' => $this->integer()->notNull(),
            'school_class_id' => $this->integer()->notNull(),
            'subject_id' => $this->integer()->notNull(),
            'teacher_id' => $this->integer()->notNull(),
            'room_id' => $this->integer()->null(),
            'day_of_week' => $this->smallInteger()->notNull(),
            'start_time' => $this->time()->notNull(),
            'end_time' => $this->time()->notNull(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-schedule-academic_year_id', '{{%schedule}}', 'academic_year_id', '{{%academic_year}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-schedule-school_class_id', '{{%schedule}}', 'school_class_id', '{{%school_class}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-schedule-subject_id', '{{%schedule}}', 'subject_id', '{{%subject}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-schedule-teacher_id', '{{%schedule}}', 'teacher_id', '{{%teacher}}', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk-schedule-room_id', '{{%schedule}}', 'room_id', '{{%room}}', 'id', 'SET NULL', 'RESTRICT');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-schedule-room_id', '{{%schedule}}');
        $this->dropForeignKey('fk-schedule-teacher_id', '{{%schedule}}');
        $this->dropForeignKey('fk-schedule-subject_id', '{{%schedule}}');
        $this->dropForeignKey('fk-schedule-school_class_id', '{{%schedule}}');
        $this->dropForeignKey('fk-schedule-academic_year_id', '{{%schedule}}');
        $this->dropTable('{{%schedule}}');
    }
}
