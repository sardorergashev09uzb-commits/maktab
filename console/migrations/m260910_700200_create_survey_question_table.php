<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey_question}}`.
 */
class m260910_700200_create_survey_question_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey_question}}', [
            'id' => $this->primaryKey(),
            'survey_id' => $this->integer()->notNull(),
            'question_text' => $this->text()->notNull(),
            'question_type' => $this->string(30)->notNull()->defaultValue('single_choice'), // single_choice, multiple_choice, rating_scale, text
            'order_number' => $this->smallInteger()->defaultValue(1),
            'is_required' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey_question-survey_id',
            '{{%survey_question}}',
            'survey_id',
            '{{%survey}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey_question-survey_id', '{{%survey_question}}');
        $this->dropTable('{{%survey_question}}');
    }
}
