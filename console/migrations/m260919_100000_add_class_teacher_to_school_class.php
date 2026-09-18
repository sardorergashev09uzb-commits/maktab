<?php
use yii\db\Migration;

class m260919_100000_add_class_teacher_to_school_class extends Migration
{
    public function safeUp()
    {
        $this->addColumn('{{%school_class}}', 'class_teacher_id', $this->integer()->null()->after('room_id'));
        $this->addForeignKey(
            'fk-school_class-class_teacher_id',
            '{{%school_class}}',
            'class_teacher_id',
            '{{%teacher}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-school_class-class_teacher_id', '{{%school_class}}');
        $this->dropColumn('{{%school_class}}', 'class_teacher_id');
    }
}
