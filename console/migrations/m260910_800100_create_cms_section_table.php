<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%cms_section}}`.
 */
class m260910_800100_create_cms_section_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%cms_section}}', [
            'id' => $this->primaryKey(),
            'key' => $this->string(50)->notNull()->unique(),
            'title' => $this->string(255)->notNull(),
            'subtitle' => $this->string(255)->null(),
            'content' => $this->text()->null(),
            'image_url' => $this->string(255)->null(),
            'is_active' => $this->boolean()->defaultValue(true),
            'order_number' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);
    }

    public function safeDown()
    {
        $this->dropTable('{{%cms_section}}');
    }
}
