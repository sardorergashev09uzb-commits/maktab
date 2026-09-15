<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%admission_application}}`.
 */
class m260910_800000_create_admission_application_table extends Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%admission_application}}', [
            'id' => $this->primaryKey(),
            'application_number' => $this->string(50)->notNull()->unique(),
            'first_name' => $this->string(100)->notNull(),
            'last_name' => $this->string(100)->notNull(),
            'middle_name' => $this->string(100)->null(),
            'birth_date' => $this->date()->null(),
            'gender' => $this->smallInteger()->null(), // 1=male, 2=female
            'applying_grade' => $this->smallInteger()->notNull()->defaultValue(1), // 1..11
            'academic_year_id' => $this->integer()->null(),
            'parent_name' => $this->string(150)->notNull(),
            'parent_phone' => $this->string(30)->notNull(),
            'parent_email' => $this->string(150)->null(),
            'address' => $this->text()->null(),
            'previous_school' => $this->string(255)->null(),
            'status' => $this->string(30)->notNull()->defaultValue('new'), // new, contacted, interview, exam, accepted, rejected, enrolled
            'interview_date' => $this->dateTime()->null(),
            'interview_notes' => $this->text()->null(),
            'exam_score' => $this->decimal(5, 2)->null(),
            'notes' => $this->text()->null(),
            'source' => $this->string(50)->defaultValue('landing_page'), // landing_page, phone, telegram, walk_in
            'enrolled_student_id' => $this->integer()->null(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->addForeignKey(
            'fk-admission_application-academic_year_id',
            '{{%admission_application}}',
            'academic_year_id',
            '{{%academic_year}}',
            'id',
            'CASCADE',
            'SET NULL'
        );

        $this->addForeignKey(
            'fk-admission_application-enrolled_student_id',
            '{{%admission_application}}',
            'enrolled_student_id',
            '{{%student}}',
            'id',
            'CASCADE',
            'SET NULL'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-admission_application-enrolled_student_id', '{{%admission_application}}');
        $this->dropForeignKey('fk-admission_application-academic_year_id', '{{%admission_application}}');
        $this->dropTable('{{%admission_application}}');
    }
}
