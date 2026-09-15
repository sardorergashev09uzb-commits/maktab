<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%audit_log}}`.
 */
class m260910_900100_create_audit_log_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%audit_log}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->null(),
            'action' => $this->string(50)->notNull(), // login, create, update, delete, override, enroll, payment, etc.
            'model' => $this->string(100)->null(), // e.g. Grade, Payment, AdmissionApplication
            'model_id' => $this->integer()->null(),
            'details' => $this->text()->null(),
            'ip_address' => $this->string(45)->null(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex('idx-audit_log-user_id', '{{%audit_log}}', 'user_id');
        $this->createIndex('idx-audit_log-action', '{{%audit_log}}', 'action');
        $this->createIndex('idx-audit_log-model', '{{%audit_log}}', 'model');
        $this->createIndex('idx-audit_log-created_at', '{{%audit_log}}', 'created_at');

        $this->addForeignKey(
            'fk-audit_log-user_id',
            '{{%audit_log}}',
            'user_id',
            '{{%user}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey('fk-audit_log-user_id', '{{%audit_log}}');
        $this->dropTable('{{%audit_log}}');
    }
}
