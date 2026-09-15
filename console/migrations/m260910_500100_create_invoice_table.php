<?php

use yii\db\Migration;

class m260910_500100_create_invoice_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%invoice}}', [
            'id' => $this->primaryKey(),
            'contract_id' => $this->integer()->null(),
            'student_id' => $this->integer()->notNull(),
            'invoice_number' => $this->string(50)->notNull()->unique(),
            'title' => $this->string(255)->notNull(),
            'amount' => $this->decimal(12, 2)->notNull(),
            'paid_amount' => $this->decimal(12, 2)->defaultValue(0.00),
            'due_date' => $this->date()->notNull(),
            'status' => $this->smallInteger()->defaultValue(10),
            'notes' => $this->text()->null(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-invoice-contract_id', '{{%invoice}}', 'contract_id', '{{%contract}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-invoice-student_id', '{{%invoice}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-invoice-student_id', '{{%invoice}}');
        $this->dropForeignKey('fk-invoice-contract_id', '{{%invoice}}');
        $this->dropTable('{{%invoice}}');
    }
}
