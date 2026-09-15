<?php

use yii\db\Migration;

class m260910_500500_create_coin_transaction_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%coin_transaction}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'amount' => $this->integer()->notNull(),
            'type' => $this->string(30)->notNull(),
            'reason' => $this->string(255)->notNull(),
            'reference_type' => $this->string(50)->null(),
            'reference_id' => $this->integer()->null(),
            'created_by' => $this->integer()->null(),
            'created_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey('fk-coin_transaction-student_id', '{{%coin_transaction}}', 'student_id', '{{%student}}', 'id', 'CASCADE', 'CASCADE');
        $this->addForeignKey('fk-coin_transaction-created_by', '{{%coin_transaction}}', 'created_by', '{{%user}}', 'id', 'SET NULL', 'CASCADE');
        $this->createIndex('idx-coin_transaction-student_id', '{{%coin_transaction}}', 'student_id');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-coin_transaction-created_by', '{{%coin_transaction}}');
        $this->dropForeignKey('fk-coin_transaction-student_id', '{{%coin_transaction}}');
        $this->dropTable('{{%coin_transaction}}');
    }
}
