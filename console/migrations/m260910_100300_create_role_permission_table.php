<?php

use yii\db\Migration;

class m260910_100300_create_role_permission_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%role_permission}}', [
            'role_id' => $this->integer()->notNull(),
            'permission_id' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addPrimaryKey('pk-role_permission', '{{%role_permission}}', ['role_id', 'permission_id']);

        $this->addForeignKey(
            'fk-role_permission-role_id',
            '{{%role_permission}}',
            'role_id',
            '{{%role}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-role_permission-permission_id',
            '{{%role_permission}}',
            'permission_id',
            '{{%permission}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-role_permission-permission_id', '{{%role_permission}}');
        $this->dropForeignKey('fk-role_permission-role_id', '{{%role_permission}}');
        $this->dropTable('{{%role_permission}}');
    }
}
