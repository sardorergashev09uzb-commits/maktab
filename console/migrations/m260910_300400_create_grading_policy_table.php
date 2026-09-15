<?php

use yii\db\Migration;

class m260910_300400_create_grading_policy_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%grading_policy}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull(),
            'deadline_hours' => $this->integer()->defaultValue(48),
            'exclude_weekends' => $this->boolean()->defaultValue(true),
            'exclude_holidays' => $this->boolean()->defaultValue(true),
            'allow_zavuch_override' => $this->boolean()->defaultValue(true),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%grading_policy}}');
    }
}
