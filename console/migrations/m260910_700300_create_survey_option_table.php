<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey_option}}`.
 */
class m260910_700300_create_survey_option_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey_option}}', [
            'id' => $this->primaryKey(),
            'survey_question_id' => $this->integer()->notNull(),
            'option_text' => $this->string(500)->notNull(),
            'dimension_id' => $this->integer()->null(),
            'weight' => $this->decimal(5, 2)->defaultValue(1.00),
            'order_number' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey_option-survey_question_id',
            '{{%survey_option}}',
            'survey_question_id',
            '{{%survey_question}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-survey_option-dimension_id',
            '{{%survey_option}}',
            'dimension_id',
            '{{%survey_dimension}}',
            'id',
            'CASCADE',
            'SET NULL'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey_option-dimension_id', '{{%survey_option}}');
        $this->dropForeignKey('fk-survey_option-survey_question_id', '{{%survey_option}}');
        $this->dropTable('{{%survey_option}}');
    }
}
