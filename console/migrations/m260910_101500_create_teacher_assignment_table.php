<?php

use yii\db\Migration;

class m260910_101500_create_teacher_assignment_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%teacher_assignment}}', [
            'id' => $this->primaryKey(),
            'teacher_id' => $this->integer()->notNull(),
            'subject_id' => $this->integer()->notNull(),
            'school_class_id' => $this->integer()->notNull(),
            'academic_year_id' => $this->integer()->notNull(),
            'is_class_teacher' => $this->boolean()->defaultValue(false),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createIndex(
            'idx-teacher_assignment-unique',
            '{{%teacher_assignment}}',
            ['teacher_id', 'subject_id', 'school_class_id', 'academic_year_id'],
            true
        );

        $this->addForeignKey(
            'fk-teacher_assignment-teacher_id',
            '{{%teacher_assignment}}',
            'teacher_id',
            '{{%teacher}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-teacher_assignment-subject_id',
            '{{%teacher_assignment}}',
            'subject_id',
            '{{%subject}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-teacher_assignment-school_class_id',
            '{{%teacher_assignment}}',
            'school_class_id',
            '{{%school_class}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-teacher_assignment-academic_year_id',
            '{{%teacher_assignment}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-teacher_assignment-academic_year_id', '{{%teacher_assignment}}');
        $this->dropForeignKey('fk-teacher_assignment-school_class_id', '{{%teacher_assignment}}');
        $this->dropForeignKey('fk-teacher_assignment-subject_id', '{{%teacher_assignment}}');
        $this->dropForeignKey('fk-teacher_assignment-teacher_id', '{{%teacher_assignment}}');
        $this->dropIndex('idx-teacher_assignment-unique', '{{%teacher_assignment}}');
        $this->dropTable('{{%teacher_assignment}}');
    }
}
