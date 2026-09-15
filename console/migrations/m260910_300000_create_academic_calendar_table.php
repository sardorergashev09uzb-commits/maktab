<?php

use yii\db\Migration;

class m260910_300000_create_academic_calendar_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%academic_calendar}}', [
            'id' => $this->primaryKey(),
            'academic_year_id' => $this->integer()->notNull(),
            'date' => $this->date()->notNull(),
            'type' => $this->string(30)->notNull(),
            'title' => $this->string(255)->null(),
            'description' => $this->text()->null(),
            'is_working_day' => $this->boolean()->defaultValue(true),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->createIndex(
            'idx-academic_calendar-academic_year_id-date',
            '{{%academic_calendar}}',
            ['academic_year_id', 'date'],
            true
        );

        $this->addForeignKey(
            'fk-academic_calendar-academic_year_id',
            '{{%academic_calendar}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'CASCADE',
            'RESTRICT'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-academic_calendar-academic_year_id', '{{%academic_calendar}}');
        $this->dropIndex('idx-academic_calendar-academic_year_id-date', '{{%academic_calendar}}');
        $this->dropTable('{{%academic_calendar}}');
    }
}
