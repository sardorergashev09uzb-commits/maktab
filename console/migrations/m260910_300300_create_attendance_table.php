<?php

use yii\db\Migration;

class m260910_300300_create_attendance_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%attendance}}', [
            'id' => $this->primaryKey(),
            'lesson_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'status' => $this->smallInteger()->notNull(),
            'remarks' => $this->string(255)->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createIndex('idx-attendance-lesson_id-student_id', '{{%attendance}}', ['lesson_id', 'student_id'], true);

        $this->addForeignKey('fk-attendance-lesson_id', '{{%attendance}}', 'lesson_id', '{{%lesson}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-attendance-student_id', '{{%attendance}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'RESTRICT');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-attendance-student_id', '{{%attendance}}');
        $this->dropForeignKey('fk-attendance-lesson_id', '{{%attendance}}');
        $this->dropIndex('idx-attendance-lesson_id-student_id', '{{%attendance}}');
        $this->dropTable('{{%attendance}}');
    }
}
