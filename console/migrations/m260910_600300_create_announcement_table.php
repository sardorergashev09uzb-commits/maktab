<?php

use yii\db\Migration;

class m260910_600300_create_announcement_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%announcement}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(255)->notNull(),
            'content' => $this->text()->notNull(),
            'target_role' => $this->string(30)->defaultValue('all'),
            'priority' => $this->string(20)->defaultValue('normal'),
            'is_published' => $this->boolean()->defaultValue(true),
            'author_id' => $this->integer()->null(),
            'published_at' => $this->integer()->notNull(),
            'expires_at' => $this->integer()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-announcement-author_id', '{{%announcement}}', 'author_id', '{{%user}}', 'id', 'SET NULL', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-announcement-author_id', '{{%announcement}}');
        $this->dropTable('{{%announcement}}');
    }
}
