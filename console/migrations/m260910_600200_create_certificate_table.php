<?php

use yii\db\Migration;

class m260910_600200_create_certificate_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%certificate}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'title' => $this->string(200)->notNull(),
            'issuer' => $this->string(150)->notNull(),
            'issue_date' => $this->date()->notNull(),
            'file_url' => $this->string(255)->null(),
            'verification_code' => $this->string(100)->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'reviewed_by' => $this->integer()->null(),
            'review_notes' => $this->text()->null(),
            'reviewed_at' => $this->integer()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-certificate-student_id', '{{%certificate}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-certificate-reviewed_by', '{{%certificate}}', 'reviewed_by', '{{%user}}', 'id', 'SET NULL', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-certificate-reviewed_by', '{{%certificate}}');
        $this->dropForeignKey('fk-certificate-student_id', '{{%certificate}}');
        $this->dropTable('{{%certificate}}');
    }
}
