<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%system_setting}}`.
 */
class m260910_900000_create_system_setting_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%system_setting}}', [
            'id' => $this->primaryKey(),
            'key' => $this->string(64)->notNull()->unique(),
            'value' => $this->text()->null(),
            'title' => $this->string(255)->notNull(),
            'description' => $this->text()->null(),
            'group' => $this->string(50)->notNull()->defaultValue('general'), // general, academic, finance, notification
            'type' => $this->string(30)->notNull()->defaultValue('string'), // string, number, boolean, json
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex('idx-system_setting-group', '{{%system_setting}}', 'group');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%system_setting}}');
    }
}
