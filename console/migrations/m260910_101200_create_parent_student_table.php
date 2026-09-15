<?php

use yii\db\Migration;

class m260910_101200_create_parent_student_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%parent_student}}', [
            'parent_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'relation_type' => $this->string(50),
            'is_primary' => $this->boolean()->defaultValue(false),
        ], $tableOptions);

        $this->addPrimaryKey('pk-parent_student', '{{%parent_student}}', ['parent_id', 'student_id']);

        $this->addForeignKey(
            'fk-parent_student-parent_id',
            '{{%parent_student}}',
            'parent_id',
            '{{%parent}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-parent_student-student_id',
            '{{%parent_student}}',
            'student_id',
            '{{%student}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-parent_student-student_id', '{{%parent_student}}');
        $this->dropForeignKey('fk-parent_student-parent_id', '{{%parent_student}}');
        $this->dropTable('{{%parent_student}}');
    }
}
