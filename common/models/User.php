<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;
use yii\behaviors\TimestampBehavior;

class User extends ActiveRecord implements IdentityInterface
{
    const STATUS_DELETED = 0;
    const STATUS_INACTIVE = 5;
    const STATUS_ACTIVE = 10;

    public static function tableName()
    {
        return '{{%user}}';
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
            [['username', 'auth_key', 'password_hash', 'email', 'first_name', 'last_name'], 'required'],
            [['status', 'created_at', 'updated_at'], 'integer'],
            [['username', 'password_hash', 'email', 'first_name', 'last_name', 'access_token', 'avatar'], 'string', 'max' => 255],
            [['auth_key'], 'string', 'max' => 32],
            [['middle_name'], 'string', 'max' => 100],
            [['phone'], 'string', 'max' => 20],
            [['username'], 'unique'],
            [['email'], 'unique'],
            [['access_token'], 'unique'],
            ['status', 'default', 'value' => self::STATUS_ACTIVE],
            ['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_INACTIVE, self::STATUS_DELETED]],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'username' => 'Username',
            'auth_key' => 'Auth Key',
            'password_hash' => 'Password Hash',
            'password_reset_token' => 'Password Reset Token',
            'email' => 'Email',
            'status' => 'Status',
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'phone' => 'Phone',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => self::STATUS_ACTIVE]);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        return static::findOne(['access_token' => $token, 'status' => self::STATUS_ACTIVE]);
    }

    public static function findByUsername($username)
    {
        return static::findOne(['username' => $username, 'status' => self::STATUS_ACTIVE]);
    }

    public function getId()
    {
        return $this->getPrimaryKey();
    }

    public function getAuthKey()
    {
        return $this->auth_key;
    }

    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    public function generateAccessToken()
    {
        $this->access_token = Yii::$app->security->generateRandomString();
    }

    public function getRoles()
    {
        return $this->hasMany(Role::class, ['id' => 'role_id'])
            ->viaTable('{{%user_role}}', ['user_id' => 'id']);
    }

    public function getStudent()
    {
        return $this->hasOne(Student::class, ['user_id' => 'id']);
    }

    public function getTeacher()
    {
        return $this->hasOne(Teacher::class, ['user_id' => 'id']);
    }

    public function getParentProfile()
    {
        return $this->hasOne(ParentModel::class, ['user_id' => 'id']);
    }

    public function hasRole(string $roleName): bool
    {
        if ($this->roles) {
            foreach ($this->roles as $role) {
                if ($role->name === $roleName) {
                    return true;
                }
            }
        }
        return false;
    }

    public function hasAnyRole(array $roleNames): bool
    {
        if ($this->roles) {
            foreach ($this->roles as $role) {
                if (in_array($role->name, $roleNames, true)) {
                    return true;
                }
            }
        }
        return false;
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SUPER_ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->hasAnyRole([Role::SUPER_ADMIN, Role::ADMIN, Role::DIRECTOR]);
    }

    public function isTeacher(): bool
    {
        return $this->hasRole(Role::TEACHER);
    }

    public function isStudent(): bool
    {
        return $this->hasRole(Role::STUDENT);
    }

    public function isParent(): bool
    {
        return $this->hasRole(Role::PARENT);
    }

    public function isZavuch(): bool
    {
        return $this->hasRole(Role::ZAVUCH);
    }

    public function isAccountant(): bool
    {
        return $this->hasRole(Role::ACCOUNTANT);
    }
}
