<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\services\AnalyticsService;

class AnalyticsController extends Controller
{
    private $analyticsService;

    public function init()
    {
        parent::init();
        $this->analyticsService = new AnalyticsService();
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
        ];
        return $behaviors;
    }

    /**
     * Director Executive KPI Dashboard
     */
    public function actionDirector()
    {
        return $this->analyticsService->getDirectorDashboard();
    }

    /**
     * Academic Director (Zavuch) Analytics
     */
    public function actionAcademic()
    {
        return $this->analyticsService->getAcademicAnalytics();
    }

    /**
     * Financial Analytics for Accountant
     */
    public function actionFinance()
    {
        return $this->analyticsService->getFinancialAnalytics();
    }

    /**
     * Export raw reports as CSV
     */
    public function actionExport($type = 'students')
    {
        $csvContent = $this->analyticsService->exportCsv($type);
        
        $response = Yii::$app->response;
        $response->format = \yii\web\Response::FORMAT_RAW;
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="hisobot_' . $type . '_' . date('Y-m-d') . '.csv"');
        
        return $csvContent;
    }
}
