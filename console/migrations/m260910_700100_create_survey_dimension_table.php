<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%survey_dimension}}`.
 */
class m260910_700100_create_survey_dimension_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%survey_dimension}}', [
            'id' => $this->primaryKey(),
            'survey_id' => $this->integer()->notNull(),
            'name' => $this->string(150)->notNull(),
            'code' => $this->string(50)->notNull(),
            'description' => $this->text()->null(),
            'color_code' => $this->string(30)->defaultValue('#3b82f6'),
            'recommendation_text' => $this->text()->null(),
            'order_number' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-survey_dimension-survey_id',
            '{{%survey_dimension}}',
            'survey_id',
            '{{%survey}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-survey_dimension-survey_id', '{{%survey_dimension}}');
        $this->dropTable('{{%survey_dimension}}');
    }
}
