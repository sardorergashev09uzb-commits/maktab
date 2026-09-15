<?php

use yii\db\Migration;

class m260910_500400_create_coin_rule_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%coin_rule}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(100)->notNull(),
            'code' => $this->string(50)->notNull()->unique(),
            'coins_amount' => $this->integer()->notNull(),
            'description' => $this->text()->null(),
            'is_active' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%coin_rule}}');
    }
}
