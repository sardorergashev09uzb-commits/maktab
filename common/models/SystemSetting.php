<?php

namespace common\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class SystemSetting extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%system_setting}}';
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
            [['key', 'title'], 'required'],
            [['value', 'description'], 'string'],
            [['group'], 'string', 'max' => 50],
            [['type'], 'string', 'max' => 30],
            [['key'], 'string', 'max' => 64],
            [['title'], 'string', 'max' => 255],
            [['key'], 'unique'],
            [['created_at', 'updated_at'], 'integer'],
        ];
    }

    /**
     * Get a setting value by key
     */
    public static function getValue($key, $default = null)
    {
        $setting = static::findOne(['key' => $key]);
        if (!$setting) {
            return $default;
        }

        switch ($setting->type) {
            case 'boolean':
                return (bool)$setting->value;
            case 'number':
                return is_numeric($setting->value) ? (float)$setting->value : $default;
            case 'json':
                $decoded = json_decode($setting->value, true);
                return $decoded !== null ? $decoded : $default;
            default:
                return $setting->value;
        }
    }

    /**
     * Set a setting value by key
     */
    public static function setValue($key, $value)
    {
        $setting = static::findOne(['key' => $key]);
        if (!$setting) {
            return false;
        }

        if (is_array($value) || is_object($value)) {
            $setting->value = json_encode($value, JSON_UNESCAPED_UNICODE);
        } else {
            $setting->value = (string)$value;
        }

        return $setting->save();
    }

    /**
     * Get all settings grouped by group name
     */
    public static function getAllGrouped()
    {
        $settings = static::find()->orderBy(['group' => SORT_ASC, 'id' => SORT_ASC])->all();
        $grouped = [];
        foreach ($settings as $s) {
            $grouped[$s->group][] = $s;
        }
        return $grouped;
    }
}
