<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%grading_policy}}".
 *
 * @property int $id
 * @property string $name
 * @property int|null $deadline_hours
 * @property int|null $exclude_weekends
 * @property int|null $exclude_holidays
 * @property int|null $allow_zavuch_override
 * @property int|null $status
 * @property int|null $created_at
 * @property int|null $updated_at
 */
class GradingPolicy extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%grading_policy}}';
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
            [['name'], 'required'],
            [['deadline_hours', 'exclude_weekends', 'exclude_holidays', 'allow_zavuch_override', 'status', 'created_at', 'updated_at'], 'integer'],
            [['name'], 'string', 'max' => 100],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'deadline_hours' => 'Deadline Hours',
            'exclude_weekends' => 'Exclude Weekends',
            'exclude_holidays' => 'Exclude Holidays',
            'allow_zavuch_override' => 'Allow Zavuch Override',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }
}
