<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class AdmissionApplication extends ActiveRecord
{
    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_INTERVIEW = 'interview';
    const STATUS_EXAM = 'exam';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_ENROLLED = 'enrolled';

    const GENDER_MALE = 1;
    const GENDER_FEMALE = 2;

    public static function tableName()
    {
        return '{{%admission_application}}';
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
            [['application_number', 'first_name', 'last_name', 'parent_name', 'parent_phone'], 'required'],
            [['birth_date', 'interview_date'], 'safe'],
            [['gender', 'applying_grade', 'academic_year_id', 'enrolled_student_id', 'created_at', 'updated_at'], 'integer'],
            [['exam_score'], 'number'],
            [['address', 'interview_notes', 'notes'], 'string'],
            [['application_number', 'source'], 'string', 'max' => 50],
            [['first_name', 'last_name', 'middle_name'], 'string', 'max' => 100],
            [['parent_name', 'parent_email'], 'string', 'max' => 150],
            [['parent_phone', 'status'], 'string', 'max' => 30],
            [['previous_school'], 'string', 'max' => 255],
            [['application_number'], 'unique'],
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }

    public function getEnrolledStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'enrolled_student_id']);
    }

    public function extraFields()
    {
        return ['academicYear', 'enrolledStudent'];
    }
}
