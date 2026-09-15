<?php

use yii\db\Migration;

class m260910_600100_create_student_achievement_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%student_achievement}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'achievement_id' => $this->integer()->notNull(),
            'awarded_date' => $this->date()->notNull(),
            'notes' => $this->text()->null(),
            'awarded_by' => $this->integer()->null(),
            'created_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-student_achievement-student_id', '{{%student_achievement}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-student_achievement-achievement_id', '{{%student_achievement}}', 'achievement_id', '{{%achievement}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-student_achievement-awarded_by', '{{%student_achievement}}', 'awarded_by', '{{%user}}', 'id', 'SET NULL', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-student_achievement-awarded_by', '{{%student_achievement}}');
        $this->dropForeignKey('fk-student_achievement-achievement_id', '{{%student_achievement}}');
        $this->dropForeignKey('fk-student_achievement-student_id', '{{%student_achievement}}');
        $this->dropTable('{{%student_achievement}}');
    }
}
