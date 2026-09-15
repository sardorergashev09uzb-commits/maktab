<?php

use yii\db\Migration;

class m260910_300500_create_grade_category_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%grade_category}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull(),
            'code' => $this->string(50)->notNull()->unique(),
            'weight' => $this->decimal(5, 2)->defaultValue(1.00),
            'max_score' => $this->integer()->defaultValue(100),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%grade_category}}');
    }
}
