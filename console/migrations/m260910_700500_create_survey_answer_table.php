<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey_answer}}`.
 */
class m260910_700500_create_survey_answer_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey_answer}}', [
            'id' => $this->primaryKey(),
            'survey_response_id' => $this->integer()->notNull(),
            'survey_question_id' => $this->integer()->notNull(),
            'survey_option_id' => $this->integer()->null(),
            'rating_value' => $this->smallInteger()->null(),
            'text_answer' => $this->text()->null(),
            'created_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey_answer-survey_response_id',
            '{{%survey_answer}}',
            'survey_response_id',
            '{{%survey_response}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-survey_answer-survey_question_id',
            '{{%survey_answer}}',
            'survey_question_id',
            '{{%survey_question}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-survey_answer-survey_option_id',
            '{{%survey_answer}}',
            'survey_option_id',
            '{{%survey_option}}',
            'id',
            'CASCADE',
            'SET NULL'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey_answer-survey_option_id', '{{%survey_answer}}');
        $this->dropForeignKey('fk-survey_answer-survey_question_id', '{{%survey_answer}}');
        $this->dropForeignKey('fk-survey_answer-survey_response_id', '{{%survey_answer}}');
        $this->dropTable('{{%survey_answer}}');
    }
}
