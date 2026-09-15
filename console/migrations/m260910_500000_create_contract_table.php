<?php

use yii\db\Migration;

class m260910_500000_create_contract_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%contract}}', [
            'id' => $this->primaryKey(),
            'contract_number' => $this->string(50)->notNull()->unique(),
            'student_id' => $this->integer()->notNull(),
            'parent_id' => $this->integer()->null(),
            'academic_year_id' => $this->integer()->notNull(),
            'total_amount' => $this->decimal(12, 2)->notNull(),
            'discount_amount' => $this->decimal(12, 2)->defaultValue(0.00),
            'paid_amount' => $this->decimal(12, 2)->defaultValue(0.00),
            'payment_plan' => $this->string(20)->defaultValue('monthly'),
            'start_date' => $this->date()->notNull(),
            'end_date' => $this->date()->notNull(),
            'notes' => $this->text()->null(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-contract-student_id', '{{%contract}}', 'student_id', '{{%student}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-contract-parent_id', '{{%contract}}', 'parent_id', '{{%parent}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-contract-academic_year_id', '{{%contract}}', 'academic_year_id', '{{%academic_year}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-contract-academic_year_id', '{{%contract}}');
        $this->dropForeignKey('fk-contract-parent_id', '{{%contract}}');
        $this->dropForeignKey('fk-contract-student_id', '{{%contract}}');
        $this->dropTable('{{%contract}}');
    }
}
