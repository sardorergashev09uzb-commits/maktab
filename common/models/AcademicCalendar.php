<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%academic_calendar}}".
 *
 * @property int $id
 * @property int $academic_year_id
 * @property string $date
 * @property string $type
 * @property string|null $title
 * @property string|null $description
 * @property int|null $is_working_day
 * @property int|null $created_at
 * @property int|null $updated_at
 *
 * @property AcademicYear $academicYear
 */
class AcademicCalendar extends ActiveRecord
{
    public const TYPE_SCHOOL_DAY = 'school_day';
    public const TYPE_WEEKEND = 'weekend';
    public const TYPE_HOLIDAY = 'holiday';
    public const TYPE_SPECIAL_CLOSURE = 'special_closure';
    public const TYPE_EXAM_PERIOD = 'exam_period';

    public static function tableName()
    {
        return '{{%academic_calendar}}';
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
            [['academic_year_id', 'date', 'type'], 'required'],
            [['academic_year_id', 'is_working_day', 'created_at', 'updated_at'], 'integer'],
            [['date'], 'safe'],
            [['description'], 'string'],
            [['type'], 'string', 'max' => 30],
            [['title'], 'string', 'max' => 255],
            [['academic_year_id', 'date'], 'unique', 'targetAttribute' => ['academic_year_id', 'date']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'academic_year_id' => 'Academic Year ID',
            'date' => 'Date',
            'type' => 'Type',
            'title' => 'Title',
            'description' => 'Description',
            'is_working_day' => 'Is Working Day',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getAcademicYear()
    {
        return $this->hasOne(AcademicYear::class, ['id' => 'academic_year_id']);
    }
}
