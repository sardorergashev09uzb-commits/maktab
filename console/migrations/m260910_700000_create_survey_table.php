<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey}}`.
 */
class m260910_700000_create_survey_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(255)->notNull(),
            'description' => $this->text()->null(),
            'type' => $this->string(50)->notNull()->defaultValue('career_guidance'),
            'target_role' => $this->string(30)->notNull()->defaultValue('student'),
            'academic_year_id' => $this->integer()->null(),
            'start_date' => $this->date()->null(),
            'end_date' => $this->date()->null(),
            'is_anonymous' => $this->boolean()->defaultValue(false),
            'status' => $this->smallInteger()->notNull()->defaultValue(20),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey-academic_year_id',
            '{{%survey}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'CASCADE',
            'SET NULL'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey-academic_year_id', '{{%survey}}');
        $this->dropTable('{{%survey}}');
    }
}
