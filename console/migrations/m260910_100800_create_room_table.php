<?php

use yii\db\Migration;

class m260910_100800_create_room_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%room}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull(),
            'building' => $this->string(100),
            'floor' => $this->smallInteger(),
            'capacity' => $this->integer(),
            'type' => $this->string(50),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%room}}');
    }
}
