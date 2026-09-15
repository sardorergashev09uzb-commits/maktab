<?php


use yii\db\Migration;

class m260910_400300_create_question_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%question}}', [
            'id' => $this->primaryKey(),
            'question_bank_id' => $this->integer()->null(),
            'subject_id' => $this->integer(),
            'question_text' => $this->text()->notNull(),
            'type' => $this->string(30)->defaultValue('single_choice'),
            'points' => $this->decimal(5, 2)->defaultValue(1.00),
            'difficulty' => $this->smallInteger()->defaultValue(1),
            'image_url' => $this->string(255)->null(),
            'formula' => $this->text()->null(),
            'explanation' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-question-question_bank_id', '{{%question}}', 'question_bank_id', '{{%question_bank}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-question-subject_id', '{{%question}}', 'subject_id', '{{%subject}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-question-subject_id', '{{%question}}');
        $this->dropForeignKey('fk-question-question_bank_id', '{{%question}}');
        $this->dropTable('{{%question}}');
    }
}
