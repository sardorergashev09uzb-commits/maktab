<?php


use yii\db\Migration;

class m260910_400400_create_question_option_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%question_option}}', [
            'id' => $this->primaryKey(),
            'question_id' => $this->integer(),
            'option_text' => $this->text()->notNull(),
            'is_correct' => $this->boolean()->defaultValue(false),
            'order_number' => $this->smallInteger()->defaultValue(1),
        ], $tableOptions);

        $this->addForeignKey('fk-question_option-question_id', '{{%question_option}}', 'question_id', '{{%question}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-question_option-question_id', '{{%question_option}}');
        $this->dropTable('{{%question_option}}');
    }
}
