<?php

use yii\db\Migration;

class m260910_500300_create_payment_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%payment}}', [
            'id' => $this->primaryKey(),
            'payment_number' => $this->string(50)->notNull()->unique(),
            'invoice_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'amount' => $this->decimal(12, 2)->notNull(),
            'payment_date' => $this->date()->notNull(),
            'payment_method' => $this->string(30)->defaultValue('cash'),
            'transaction_reference' => $this->string(100)->null(),
            'notes' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'reversed_at' => $this->integer()->null(),
            'reversed_by' => $this->integer()->null(),
            'reversal_reason' => $this->text()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-payment-invoice_id', '{{%payment}}', 'invoice_id', '{{%invoice}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-payment-student_id', '{{%payment}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-payment-reversed_by', '{{%payment}}', 'reversed_by', '{{%user}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-payment-reversed_by', '{{%payment}}');
        $this->dropForeignKey('fk-payment-student_id', '{{%payment}}');
        $this->dropForeignKey('fk-payment-invoice_id', '{{%payment}}');
        $this->dropTable('{{%payment}}');
    }
}
