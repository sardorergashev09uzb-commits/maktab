<?php

use yii\db\Migration;

class m260910_500200_create_invoice_item_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%invoice_item}}', [
            'id' => $this->primaryKey(),
            'invoice_id' => $this->integer()->notNull(),
            'description' => $this->string(255)->notNull(),
            'amount' => $this->decimal(12, 2)->notNull(),
            'quantity' => $this->integer()->defaultValue(1),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-invoice_item-invoice_id', '{{%invoice_item}}', 'invoice_id', '{{%invoice}}', 'id', 'CASCADE', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-invoice_item-invoice_id', '{{%invoice_item}}');
        $this->dropTable('{{%invoice_item}}');
    }
}
