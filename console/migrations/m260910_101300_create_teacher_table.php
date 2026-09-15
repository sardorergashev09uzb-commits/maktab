<?php

use yii\db\Migration;

class m260910_101300_create_teacher_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%teacher}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull()->unique(),
            'employee_code' => $this->string(20)->unique(),
            'specialization' => $this->string(255),
            'education' => $this->string(255),
            'experience_years' => $this->smallInteger(),
            'hire_date' => $this->date(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-teacher-user_id',
            '{{%teacher}}',
            'user_id',
            '{{%user}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-teacher-user_id', '{{%teacher}}');
        $this->dropTable('{{%teacher}}');
    }
}
