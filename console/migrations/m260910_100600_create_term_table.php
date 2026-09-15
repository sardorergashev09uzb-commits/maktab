<?php

use yii\db\Migration;

class m260910_100600_create_term_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%term}}', [
            'id' => $this->primaryKey(),
            'academic_year_id' => $this->integer()->notNull(),
            'name' => $this->string(100)->notNull(),
            'order_number' => $this->smallInteger()->notNull(),
            'start_date' => $this->date()->notNull(),
            'end_date' => $this->date()->notNull(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-term-academic_year_id',
            '{{%term}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-term-academic_year_id', '{{%term}}');
        $this->dropTable('{{%term}}');
    }
}
