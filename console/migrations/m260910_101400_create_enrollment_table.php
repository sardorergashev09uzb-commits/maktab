<?php

use yii\db\Migration;

class m260910_101400_create_enrollment_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%enrollment}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'school_class_id' => $this->integer()->notNull(),
            'academic_year_id' => $this->integer()->notNull(),
            'enrolled_date' => $this->date(),
            'status' => $this->smallInteger()->defaultValue(10),
            'notes' => $this->text(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createIndex(
            'idx-enrollment-unique',
            '{{%enrollment}}',
            ['student_id', 'school_class_id', 'academic_year_id'],
            true
        );

        $this->addForeignKey(
            'fk-enrollment-student_id',
            '{{%enrollment}}',
            'student_id',
            '{{%student}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-enrollment-school_class_id',
            '{{%enrollment}}',
            'school_class_id',
            '{{%school_class}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-enrollment-academic_year_id',
            '{{%enrollment}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-enrollment-academic_year_id', '{{%enrollment}}');
        $this->dropForeignKey('fk-enrollment-school_class_id', '{{%enrollment}}');
        $this->dropForeignKey('fk-enrollment-student_id', '{{%enrollment}}');
        $this->dropIndex('idx-enrollment-unique', '{{%enrollment}}');
        $this->dropTable('{{%enrollment}}');
    }
}
