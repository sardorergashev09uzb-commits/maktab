<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%cms_faq}}`.
 */
class m260910_800200_create_cms_faq_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%cms_faq}}', [
            'id' => $this->primaryKey(),
            'question' => $this->string(500)->notNull(),
            'answer' => $this->text()->notNull(),
            'category' => $this->string(50)->defaultValue('general'), // general, admission, payment, curriculum
            'order_number' => $this->smallInteger()->defaultValue(1),
            'is_active' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%cms_faq}}');
    }
}
