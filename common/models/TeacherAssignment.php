<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class TeacherAssignment extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%teacher_assignment}}';
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }

    public function rules()
    {
        return [
            [['teacher_id', 'subject_id', 'school_class_id', 'academic_year_id'], 'required'],
            [['teacher_id', 'subject_id', 'school_class_id', 'academic_year_id', 'created_at', 'updated_at'], 'integer'],
            [['teacher_id'], 'exist', 'skipOnError' => true, 'targetClass' => Teacher::class, 'targetAttribute' => ['teacher_id' => 'id']],
            [['subject_id'], 'exist', 'skipOnError' => true, 'targetClass' => Subject::class, 'targetAttribute' => ['subject_id' => 'id']],
            [['school_class_id'], 'exist', 'skipOnError' => true, 'targetClass' => SchoolClass::class, 'targetAttribute' => ['school_class_id' => 'id']],
            [['academic_year_id'], 'exist', 'skipOnError' => true, 'targetClass' => AcademicYear::class, 'targetAttribute' => ['academic_year_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'teacher_id' => 'Teacher ID',
            'subject_id' => 'Subject ID',
            'school_class_id' => 'School Class ID',
            'academic_year_id' => 'Academic Year ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'teacher_id']);
    }

    public function getSubject()
    {
        return $this->hasOne(Subject::class, ['id' => 'subject_id']);
    }

    public function getSchoolClass()
    {
        return $this->hasOne(SchoolClass::class, ['id' => 'school_class_id']);
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }
}
