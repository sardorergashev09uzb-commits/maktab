<?php

use yii\db\Migration;

class m260910_100500_create_academic_year_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%academic_year}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(50)->notNull(),
            'slug' => $this->string(50)->unique(),
            'start_date' => $this->date()->notNull(),
            'end_date' => $this->date()->notNull(),
            'is_current' => $this->boolean()->defaultValue(false),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%academic_year}}');
    }
}
