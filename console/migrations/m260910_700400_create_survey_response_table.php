<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey_response}}`.
 */
class m260910_700400_create_survey_response_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey_response}}', [
            'id' => $this->primaryKey(),
            'survey_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->null(),
            'target_teacher_id' => $this->integer()->null(),
            'submitted_at' => $this->integer()->notNull(),
            'dimension_scores' => $this->json()->null(),
            'primary_dimension_id' => $this->integer()->null(),
            'recommendation' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10), // 10=completed
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey_response-survey_id',
            '{{%survey_response}}',
            'survey_id',
            '{{%survey}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-survey_response-user_id',
            '{{%survey_response}}',
            'user_id',
            '{{%user}}',
            'id',
            'CASCADE',
            'SET NULL'
        );

        $this->addForeignKey(
            'fk-survey_response-target_teacher_id',
            '{{%survey_response}}',
            'target_teacher_id',
            '{{%teacher}}',
            'id',
            'CASCADE',
            'SET NULL'
        );

        $this->addForeignKey(
            'fk-survey_response-primary_dimension_id',
            '{{%survey_response}}',
            'primary_dimension_id',
            '{{%survey_dimension}}',
            'id',
            'CASCADE',
            'SET NULL'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey_response-primary_dimension_id', '{{%survey_response}}');
        $this->dropForeignKey('fk-survey_response-target_teacher_id', '{{%survey_response}}');
        $this->dropForeignKey('fk-survey_response-user_id', '{{%survey_response}}');
        $this->dropForeignKey('fk-survey_response-survey_id', '{{%survey_response}}');
        $this->dropTable('{{%survey_response}}');
    }
}
