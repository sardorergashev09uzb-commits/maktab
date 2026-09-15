<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class Student extends ActiveRecord
{
    const GENDER_MALE = 1;
    const GENDER_FEMALE = 2;
    const STATUS_ACTIVE = 10;
    const STATUS_INACTIVE = 0;
    const STATUS_GRADUATED = 20;

    public static function tableName()
    {
        return '{{%student}}';
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
            [['user_id', 'gender', 'status', 'created_at', 'updated_at'], 'integer'],
            [['birth_date', 'admission_date'], 'safe'],
            [['address', 'medical_notes'], 'string'],
            [['student_code'], 'string', 'max' => 20],
            [['blood_type'], 'string', 'max' => 5],
            [['student_code'], 'unique'],
            [['user_id'], 'unique'],
            [['status'], 'default', 'value' => self::STATUS_ACTIVE],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'student_code' => 'Student Code',
            'birth_date' => 'Birth Date',
            'gender' => 'Gender',
            'address' => 'Address',
            'blood_type' => 'Blood Type',
            'medical_notes' => 'Medical Notes',
            'admission_date' => 'Admission Date',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getEnrollments()
    {
        return $this->hasMany(Enrollment::class, ['student_id' => 'id']);
    }

    public function getCurrentEnrollment()
    {
        return $this->hasOne(Enrollment::class, ['student_id' => 'id'])
            ->where(['status' => Enrollment::STATUS_ACTIVE])
            ->orderBy(['id' => SORT_DESC]);
    }

    public function getParentStudents()
    {
        return $this->hasMany(ParentStudent::class, ['student_id' => 'id']);
    }

    public function getParents()
    {
        return $this->hasMany(ParentModel::class, ['id' => 'parent_id'])
            ->via('parentStudents');
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
        return ['user', 'enrollments', 'currentEnrollment', 'parents'];
    }

    public function getFullName()
    {
        return $this->user ? $this->user->first_name . ' ' . $this->user->last_name : '';
    }
}
