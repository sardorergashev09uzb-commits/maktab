<?php
namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class TeacherController extends ActiveController
{
    public $modelClass = 'common\models\Teacher';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        unset($actions['create']);
        return $actions;
    }

    public function prepareDataProvider()
    {
        $modelClass = $this->modelClass;
        $query = $modelClass::find()->joinWith(['user']);
        
        $q = \Yii::$app->request->get('q');
        if ($q) {
            $query->andWhere([
                'or',
                ['like', '{{%teacher}}.employee_code', $q],
                ['like', '{{%teacher}}.specialization', $q],
                ['like', '{{%user}}.first_name', $q],
                ['like', '{{%user}}.last_name', $q],
                ['like', '{{%user}}.phone', $q],
            ]);
        }

        return new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => (int)\Yii::$app->request->get('per-page', 50),
            ],
            'sort' => [
                'defaultOrder' => ['id' => SORT_DESC],
            ],
        ]);
    }

    public function actionCreate()
    {
        $request = \Yii::$app->request;
        $firstName = trim($request->post('first_name', ''));
        $lastName = trim($request->post('last_name', ''));
        $phone = trim($request->post('phone', ''));
        $specialization = trim($request->post('specialization', ''));
        $education = trim($request->post('education', ''));
        $experience = (int)$request->post('experience_years', 0);
        $employeeCode = trim($request->post('employee_code', ''));

        if (!$firstName || !$lastName) {
            \Yii::$app->response->statusCode = 422;
            return ['message' => 'Ism va familiya kiritilishi shart'];
        }

        if (!$employeeCode) {
            $employeeCode = 'T-' . date('Y') . '-' . str_pad((string)mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        $transaction = \Yii::$app->db->beginTransaction();
        try {
            $user = new \common\models\User();
            $baseUsername = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $firstName . '.' . $lastName));
            $username = $baseUsername;
            $counter = 1;
            while (\common\models\User::findOne(['username' => $username])) {
                $username = $baseUsername . $counter++;
            }

            $user->username = $username;
            $user->first_name = $firstName;
            $user->last_name = $lastName;
            $user->phone = $phone;
            $user->email = $request->post('email') ?: ($username . '@maktab.uz');
            $user->setPassword($request->post('password') ?: 'password123');
            $user->generateAuthKey();
            $user->generateAccessToken();
            $user->status = \common\models\User::STATUS_ACTIVE;

            if (!$user->save()) {
                $transaction->rollBack();
                \Yii::$app->response->statusCode = 422;
                return ['message' => 'Foydalanuvchi yaratishda xatolik', 'errors' => $user->errors];
            }

            // Assign teacher role if exists
            $teacherRole = \common\models\Role::findOne(['name' => \common\models\Role::TEACHER]);
            if ($teacherRole) {
                \Yii::$app->db->createCommand()->insert('{{%user_role}}', [
                    'user_id' => $user->id,
                    'role_id' => $teacherRole->id,
                ])->execute();
            }

            $teacher = new \common\models\Teacher();
            $teacher->user_id = $user->id;
            $teacher->employee_code = $employeeCode;
            $teacher->specialization = $specialization;
            $teacher->education = $education;
            $teacher->experience_years = $experience;
            $teacher->hire_date = date('Y-m-d');
            $teacher->status = 10;

            if (!$teacher->save()) {
                $transaction->rollBack();
                \Yii::$app->response->statusCode = 422;
                return ['message' => 'O\'qituvchi profilini saqlashda xatolik', 'errors' => $teacher->errors];
            }

            $transaction->commit();
            \Yii::$app->response->statusCode = 201;
            return \common\models\Teacher::find()->where(['id' => $teacher->id])->with(['user'])->one();
        } catch (\Exception $e) {
            $transaction->rollBack();
            \Yii::$app->response->statusCode = 500;
            return ['message' => 'Server xatosi: ' . $e->getMessage()];
        }
    }
}
