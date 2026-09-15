<?php

use yii\db\Migration;

class m260910_600000_create_achievement_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%achievement}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(150)->notNull(),
            'description' => $this->text()->null(),
            'category' => $this->string(50)->defaultValue('academic'),
            'badge_color' => $this->string(30)->defaultValue('indigo'),
            'icon' => $this->string(50)->defaultValue('Award'),
            'coin_reward' => $this->integer()->defaultValue(25),
            'is_active' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%achievement}}');
    }
}
