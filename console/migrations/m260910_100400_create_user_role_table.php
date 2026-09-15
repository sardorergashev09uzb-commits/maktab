<?php

use yii\db\Migration;

class m260910_100400_create_user_role_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%user_role}}', [
            'user_id' => $this->integer()->notNull(),
            'role_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addPrimaryKey('pk-user_role', '{{%user_role}}', ['user_id', 'role_id']);

        $this->addForeignKey(
            'fk-user_role-user_id',
            '{{%user_role}}',
            'user_id',
            '{{%user}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-user_role-role_id',
            '{{%user_role}}',
            'role_id',
            '{{%role}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-user_role-role_id', '{{%user_role}}');
        $this->dropForeignKey('fk-user_role-user_id', '{{%user_role}}');
        $this->dropTable('{{%user_role}}');
    }
}
