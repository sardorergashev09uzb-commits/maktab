<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%grade_override}}".
 *
 * @property int $id
 * @property int $lesson_id
 * @property int $student_id
 * @property int $teacher_id
 * @property int $grade_category_id
 * @property float $requested_score
 * @property string $reason
 * @property int|null $zavuch_id
 * @property int|null $status
 * @property string|null $decision_notes
 * @property int|null $decided_at
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class GradeOverride extends ActiveRecord
{
    public const STATUS_PENDING = 10;
    public const STATUS_APPROVED = 20;
    public const STATUS_REJECTED = 30;

    public static function tableName()
    {
        return '{{%grade_override}}';
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
            [['lesson_id', 'student_id', 'teacher_id', 'grade_category_id', 'requested_score', 'reason'], 'required'],
            [['lesson_id', 'student_id', 'teacher_id', 'grade_category_id', 'zavuch_id', 'status', 'decided_at', 'created_at', 'updated_at'], 'integer'],
            [['requested_score'], 'number'],
            [['reason', 'decision_notes'], 'string'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'lesson_id' => 'Lesson ID',
            'student_id' => 'Student ID',
            'teacher_id' => 'Teacher ID',
            'grade_category_id' => 'Grade Category ID',
            'requested_score' => 'Requested Score',
            'reason' => 'Reason',
            'zavuch_id' => 'Zavuch ID',
            'status' => 'Status',
            'decision_notes' => 'Decision Notes',
            'decided_at' => 'Decided At',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getLesson()
    {
        return $this->hasOne(Lesson::class, ['id' => 'lesson_id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['id' => 'student_id']);
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['id' => 'teacher_id']);
    }

    public function getGradeCategory()
    {
        return $this->hasOne(GradeCategory::class, ['id' => 'grade_category_id']);
    }

    public function getZavuch()
    {
        return $this->hasOne(User::class, ['id' => 'zavuch_id']);
    }

    public function extraFields()
    {
        return ['lesson', 'student', 'teacher', 'gradeCategory', 'zavuch'];
    }
}
