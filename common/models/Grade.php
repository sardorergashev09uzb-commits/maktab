<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%grade}}".
 *
 * @property int $id
 * @property int $lesson_id
 * @property int $student_id
 * @property int $teacher_id
 * @property int $grade_category_id
 * @property float $score
 * @property float $max_score
 * @property string|null $comment
 * @property int|null $status
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class Grade extends ActiveRecord
{
    public const STATUS_DRAFT = 10;
    public const STATUS_SUBMITTED = 20;
    public const STATUS_LOCKED = 30;

    public static function tableName()
    {
        return '{{%grade}}';
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
            [['lesson_id', 'student_id', 'teacher_id', 'grade_category_id', 'score'], 'required'],
            [['lesson_id', 'student_id', 'teacher_id', 'grade_category_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['score', 'max_score'], 'number'],
            [['comment'], 'string'],
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
            'score' => 'Score',
            'max_score' => 'Max Score',
            'comment' => 'Comment',
            'status' => 'Status',
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

    public function extraFields()
    {
        return ['lesson', 'student', 'teacher', 'gradeCategory'];
    }
}
