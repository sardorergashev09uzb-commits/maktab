<?php

use yii\db\Migration;

class m260910_100900_create_school_class_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%school_class}}', [
            'id' => $this->primaryKey(),
            'academic_year_id' => $this->integer()->notNull(),
            'name' => $this->string(50)->notNull(),
            'grade_level' => $this->smallInteger()->notNull(),
            'section' => $this->string(10),
            'room_id' => $this->integer(),
            'capacity' => $this->integer(),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-school_class-academic_year_id',
            '{{%school_class}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-school_class-room_id',
            '{{%school_class}}',
            'room_id',
            '{{%room}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-school_class-room_id', '{{%school_class}}');
        $this->dropForeignKey('fk-school_class-academic_year_id', '{{%school_class}}');
        $this->dropTable('{{%school_class}}');
    }
}
