<?php


use yii\db\Migration;

class m260910_400200_create_question_bank_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%question_bank}}', [
            'id' => $this->primaryKey(),
            'subject_id' => $this->integer(),
            'teacher_id' => $this->integer(),
            'title' => $this->string(255)->notNull(),
            'description' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-question_bank-subject_id', '{{%question_bank}}', 'subject_id', '{{%subject}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-question_bank-teacher_id', '{{%question_bank}}', 'teacher_id', '{{%teacher}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-question_bank-teacher_id', '{{%question_bank}}');
        $this->dropForeignKey('fk-question_bank-subject_id', '{{%question_bank}}');
        $this->dropTable('{{%question_bank}}');
    }
}
