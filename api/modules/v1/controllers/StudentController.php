<?php
namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class StudentController extends ActiveController
{
    public $modelClass = 'common\models\Student';

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
        $query = $modelClass::find()->joinWith(['user', 'currentEnrollment.schoolClass']);
        
        $q = \Yii::$app->request->get('q');
        if ($q) {
            $query->andWhere([
                'or',
                ['like', '{{%student}}.student_code', $q],
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
        $gender = (int)$request->post('gender', 1);
        $birthDate = $request->post('birth_date');
        $studentCode = trim($request->post('student_code', ''));
        $classId = $request->post('school_class_id');

        if (!$firstName || !$lastName) {
            \Yii::$app->response->statusCode = 422;
            return ['message' => 'Ism va familiya kiritilishi shart'];
        }

        if (!$studentCode) {
            $studentCode = 'ST-' . date('Y') . '-' . str_pad((string)mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
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

            // Assign student role if exists
            $studentRole = \common\models\Role::findOne(['name' => \common\models\Role::STUDENT]);
            if ($studentRole) {
                \Yii::$app->db->createCommand()->insert('{{%user_role}}', [
                    'user_id' => $user->id,
                    'role_id' => $studentRole->id,
                ])->execute();
            }

            $student = new \common\models\Student();
            $student->user_id = $user->id;
            $student->student_code = $studentCode;
            $student->birth_date = $birthDate ?: null;
            $student->gender = $gender;
            $student->address = $request->post('address', '');
            $student->admission_date = date('Y-m-d');
            $student->status = \common\models\Student::STATUS_ACTIVE;

            if (!$student->save()) {
                $transaction->rollBack();
                \Yii::$app->response->statusCode = 422;
                return ['message' => 'O\'quvchi profilini saqlashda xatolik', 'errors' => $student->errors];
            }

            // Enroll in class if provided
            if ($classId) {
                $currentYear = \common\models\AcademicYear::findCurrent();
                $academicYearId = $currentYear ? $currentYear->id : 1;
                $enrollment = new \common\models\Enrollment();
                $enrollment->student_id = $student->id;
                $enrollment->school_class_id = (int)$classId;
                $enrollment->academic_year_id = $academicYearId;
                $enrollment->enrolled_date = date('Y-m-d');
                $enrollment->status = \common\models\Enrollment::STATUS_ACTIVE;
                $enrollment->save();
            }

            $transaction->commit();
            \Yii::$app->response->statusCode = 201;
            return \common\models\Student::find()->where(['id' => $student->id])->with(['user', 'currentEnrollment.schoolClass'])->one();
        } catch (\Exception $e) {
            $transaction->rollBack();
            \Yii::$app->response->statusCode = 500;
            return ['message' => 'Server xatosi: ' . $e->getMessage()];
        }
    }
}
