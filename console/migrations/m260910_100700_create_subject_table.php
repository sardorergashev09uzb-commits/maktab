<?php

use yii\db\Migration;

class m260910_100700_create_subject_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%subject}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'code' => $this->string(20)->unique(),
            'description' => $this->text(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%subject}}');
    }
}
