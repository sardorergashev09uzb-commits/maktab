<?php

use yii\db\Migration;

class m260910_101000_create_student_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%student}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull()->unique(),
            'student_code' => $this->string(20)->unique(),
            'birth_date' => $this->date(),
            'gender' => $this->smallInteger(),
            'address' => $this->text(),
            'blood_type' => $this->string(5),
            'medical_notes' => $this->text(),
            'admission_date' => $this->date(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-student-user_id',
            '{{%student}}',
            'user_id',
            '{{%user}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-student-user_id', '{{%student}}');
        $this->dropTable('{{%student}}');
    }
}
