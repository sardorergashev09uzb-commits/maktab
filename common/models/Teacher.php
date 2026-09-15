<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Teacher extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%teacher}}';
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
            [['user_id'], 'required'],
            [['user_id', 'experience_years', 'status', 'created_at', 'updated_at'], 'integer'],
            [['hire_date'], 'safe'],
            [['employee_code'], 'string', 'max' => 20],
            [['specialization', 'education'], 'string', 'max' => 255],
            [['employee_code'], 'unique'],
            [['user_id'], 'unique'],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
            ['status', 'default', 'value' => 10],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'employee_code' => 'Employee Code',
            'specialization' => 'Specialization',
            'education' => 'Education',
            'experience_years' => 'Experience Years',
            'hire_date' => 'Hire Date',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getTeacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class, ['teacher_id' => 'id']);
    }

    public function getSubjects()
    {
        return $this->hasMany(Subject::class, ['id' => 'subject_id'])
            ->via('teacherAssignments');
    }

    public function getSchoolClasses()
    {
        return $this->hasMany(SchoolClass::class, ['id' => 'school_class_id'])
            ->via('teacherAssignments');
    }

    public function fields()
    {
        $fields = parent::fields();
        $fields['full_name'] = function ($model) {
            return $model->getFullName();
        };
        return $fields;
    }

    public function extraFields()
    {
        return ['user', 'teacherAssignments', 'subjects', 'schoolClasses'];
    }

    public function getFullName()
    {
        return $this->user ? $this->user->first_name . ' ' . $this->user->last_name : '';
    }
}
