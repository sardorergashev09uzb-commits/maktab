<?php

use yii\db\Migration;

class m260910_600400_create_notification_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%notification}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'title' => $this->string(255)->notNull(),
            'message' => $this->text()->notNull(),
            'type' => $this->string(30)->defaultValue('general'),
            'link_url' => $this->string(255)->null(),
            'is_read' => $this->boolean()->defaultValue(false),
            'read_at' => $this->integer()->null(),
            'created_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk-notification-user_id', '{{%notification}}', 'user_id', '{{%user}}', 'id', 'CASCADE', 'CASCADE');
        $this->createIndex('idx-notification-user_id-is_read', '{{%notification}}', ['user_id', 'is_read']);
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-notification-user_id', '{{%notification}}');
        $this->dropTable('{{%notification}}');
    }
}
