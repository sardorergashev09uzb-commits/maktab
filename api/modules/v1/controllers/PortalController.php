<?php

namespace api\modules\v1\controllers;

use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\services\PortalService;
use Yii;

class PortalController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = ['class' => Cors::class];
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::class];
        return $behaviors;
    }

    public function actionStudent()
    {
        $studentId = Yii::$app->request->get('student_id');
        $service = new PortalService();
        return $service->getStudentDashboardData($studentId);
    }

    public function actionParent()
    {
        $parentId = Yii::$app->request->get('parent_id');
        $service = new PortalService();
        return $service->getParentDashboardData($parentId);
    }

    public function actionTeacher()
    {
        $teacherId = Yii::$app->request->get('teacher_id');
        $service = new PortalService();
        return $service->getTeacherDashboardData($teacherId);
    }
}
