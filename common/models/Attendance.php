<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%attendance}}".
 *
 * @property int $id
 * @property int $lesson_id
 * @property int $student_id
 * @property int $status
 * @property string|null $remarks
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class Attendance extends ActiveRecord
{
    public const STATUS_PRESENT = 1;
    public const STATUS_LATE = 2;
    public const STATUS_ABSENT = 3;
    public const STATUS_EXCUSED = 4;

    public static function tableName()
    {
        return '{{%attendance}}';
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
            [['lesson_id', 'student_id', 'status'], 'required'],
            [['lesson_id', 'student_id', 'status', 'created_at', 'updated_at'], 'integer'],
            [['remarks'], 'string', 'max' => 255],
            [['lesson_id', 'student_id'], 'unique', 'targetAttribute' => ['lesson_id', 'student_id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'lesson_id' => 'Lesson ID',
            'student_id' => 'Student ID',
            'status' => 'Status',
            'remarks' => 'Remarks',
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

    public function extraFields()
    {
        return ['lesson', 'student'];
    }
}
