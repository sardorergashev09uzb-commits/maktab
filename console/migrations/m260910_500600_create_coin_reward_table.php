<?php

use yii\db\Migration;

class m260910_500600_create_coin_reward_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%coin_reward}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string(150)->notNull(),
            'description' => $this->text()->null(),
            'coins_cost' => $this->integer()->notNull(),
            'stock_quantity' => $this->integer()->defaultValue(0),
            'image_url' => $this->string(255)->null(),
            'is_active' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createTable('{{%reward_redemption}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'coin_reward_id' => $this->integer()->notNull(),
            'coins_spent' => $this->integer()->notNull(),
            'status' => $this->smallInteger()->defaultValue(10),
            'delivered_at' => $this->integer()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-reward_redemption-student_id', '{{%reward_redemption}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-reward_redemption-coin_reward_id', '{{%reward_redemption}}', 'coin_reward_id', '{{%coin_reward}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-reward_redemption-coin_reward_id', '{{%reward_redemption}}');
        $this->dropForeignKey('fk-reward_redemption-student_id', '{{%reward_redemption}}');
        $this->dropTable('{{%reward_redemption}}');
        $this->dropTable('{{%coin_reward}}');
    }
}
