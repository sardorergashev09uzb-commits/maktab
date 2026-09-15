<?php


use yii\db\Migration;

class m260910_400000_create_assignment_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%assignment}}', [
            'id' => $this->primaryKey(),
            'lesson_id' => $this->integer()->null(),
            'school_class_id' => $this->integer(),
            'subject_id' => $this->integer(),
            'teacher_id' => $this->integer(),
            'title' => $this->string(255)->notNull(),
            'description' => $this->text()->notNull(),
            'attachment_url' => $this->string(255)->null(),
            'due_date' => $this->dateTime()->notNull(),
            'max_score' => $this->integer()->defaultValue(100),
            'status' => $this->smallInteger()->defaultValue(10),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk-assignment-lesson_id', '{{%assignment}}', 'lesson_id', '{{%lesson}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-assignment-school_class_id', '{{%assignment}}', 'school_class_id', '{{%school_class}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-assignment-subject_id', '{{%assignment}}', 'subject_id', '{{%subject}}', 'id', 'RESTRICT', 'CASCADE');
        $this->addForeignKey('fk-assignment-teacher_id', '{{%assignment}}', 'teacher_id', '{{%teacher}}', 'id', 'RESTRICT', 'CASCADE');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-assignment-teacher_id', '{{%assignment}}');
        $this->dropForeignKey('fk-assignment-subject_id', '{{%assignment}}');
        $this->dropForeignKey('fk-assignment-school_class_id', '{{%assignment}}');
        $this->dropForeignKey('fk-assignment-lesson_id', '{{%assignment}}');
        $this->dropTable('{{%assignment}}');
    }
}
