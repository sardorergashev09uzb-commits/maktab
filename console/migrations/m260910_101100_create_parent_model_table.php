<?php

use yii\db\Migration;

class m260910_101100_create_parent_model_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%parent}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull()->unique(),
            'occupation' => $this->string(255),
            'workplace' => $this->string(255),
            'address' => $this->text(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-parent-user_id',
            '{{%parent}}',
            'user_id',
            '{{%user}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-parent-user_id', '{{%parent}}');
        $this->dropTable('{{%parent}}');
    }
}
