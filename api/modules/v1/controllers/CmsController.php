<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use common\models\CmsSection;
use common\models\CmsFaq;
use common\models\SystemSetting;
use common\models\Student;
use common\models\Teacher;
use common\models\SchoolClass;
use common\models\Subject;
use common\models\AcademicYear;
use common\models\Room;
use common\models\ParentModel;
use common\models\AdmissionApplication;
use common\models\StudentAchievement;
use yii\web\NotFoundHttpException;

class CmsController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        unset($behaviors['authenticator']);
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'optional' => ['public', 'seed-demo'],
        ];
        return $behaviors;
    }

    /**
     * Populate full demo data into the database
     */
    public function actionSeedDemo()
    {
        return \common\services\DemoDataSeeder::run();
    }

    /**
     * Get aggregated landing page data
     */
    public function actionPublic()
    {
        $sections = CmsSection::find()
            ->where(['is_active' => true])
            ->orderBy(['order_number' => SORT_ASC])
            ->asArray()
            ->all();

        $sectionsByKey = [];
        foreach ($sections as $s) {
            $content = $s['content'];
            $decoded = json_decode($content, true);
            $sectionsByKey[$s['key']] = [
                'id' => $s['id'],
                'title' => $s['title'],
                'subtitle' => $s['subtitle'],
                'content' => $decoded !== null ? $decoded : $content,
                'image_url' => $s['image_url'],
            ];
        }

        $faqs = CmsFaq::find()
            ->where(['is_active' => true])
            ->orderBy(['order_number' => SORT_ASC])
            ->asArray()
            ->all();

        // Real school system settings
        $settings = SystemSetting::find()
            ->select(['key', 'value'])
            ->asArray()
            ->all();
        $settingsMap = [];
        foreach ($settings as $item) {
            $settingsMap[$item['key']] = $item['value'];
        }

        // Live school statistics from database
        $totalStudents = (int) Student::find()->where(['status' => Student::STATUS_ACTIVE])->count();
        $totalTeachers = (int) Teacher::find()->where(['status' => 10])->count();
        $totalClasses = (int) SchoolClass::find()->where(['status' => 10])->count();
        $totalSubjects = (int) Subject::find()->where(['status' => 10])->count();
        $totalRooms = (int) Room::find()->count();
        $totalParents = (int) ParentModel::find()->count();
        $totalApplications = (int) AdmissionApplication::find()->count();
        $totalAchievements = (int) StudentAchievement::find()->count();
        $currentYear = AcademicYear::find()->where(['is_current' => 1])->asArray()->one();

        // Calculate teacher to student ratio
        $ratioNumber = $totalTeachers > 0 && $totalStudents > 0 
            ? max(1, round($totalStudents / $totalTeachers)) 
            : 8;
        $teacherStudentRatio = "1 : " . $ratioNumber;

        // Average class capacity / size
        $avgClassCapacity = (int) SchoolClass::find()->where(['status' => 10])->average('capacity');
        if ($avgClassCapacity <= 0) {
            $avgClassCapacity = 16;
        }

        // Classes count by education stage
        $primaryClassesCount = (int) SchoolClass::find()->where(['status' => 10])->andWhere(['<=', 'grade_level', 4])->count();
        $middleClassesCount = (int) SchoolClass::find()->where(['status' => 10])->andWhere(['between', 'grade_level', 5, 9])->count();
        $highClassesCount = (int) SchoolClass::find()->where(['status' => 10])->andWhere(['>=', 'grade_level', 10])->count();

        // Active distinct grade levels
        $grades = SchoolClass::find()
            ->select('grade_level')
            ->distinct()
            ->where(['status' => 10])
            ->orderBy(['grade_level' => SORT_ASC])
            ->column();

        // Popular subjects list
        $popularSubjects = Subject::find()
            ->select('name')
            ->where(['status' => 10])
            ->limit(8)
            ->column();

        return [
            'sections' => $sectionsByKey,
            'faqs' => $faqs,
            'settings' => $settingsMap,
            'live_stats' => [
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_classes' => $totalClasses,
                'total_subjects' => $totalSubjects,
                'total_rooms' => $totalRooms,
                'total_parents' => $totalParents,
                'total_applications' => $totalApplications,
                'total_achievements' => $totalAchievements,
                'teacher_student_ratio' => $teacherStudentRatio,
                'average_class_capacity' => $avgClassCapacity,
                'classes_by_program' => [
                    'primary' => $primaryClassesCount,
                    'middle' => $middleClassesCount,
                    'high' => $highClassesCount,
                ],
                'popular_subjects' => $popularSubjects,
                'academic_year' => $currentYear ? $currentYear['name'] : '2026/2027',
                'grades' => !empty($grades) ? array_map('intval', $grades) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            ],
        ];
    }

    /**
     * List all CMS sections for admin
     */
    public function actionSections()
    {
        return CmsSection::find()->orderBy(['order_number' => SORT_ASC])->all();
    }

    /**
     * Update CMS section
     */
    public function actionUpdateSection($id)
    {
        $section = CmsSection::findOne($id);
        if (!$section) {
            throw new NotFoundHttpException('Bo\'lim topilmadi.');
        }

        $section->attributes = Yii::$app->request->getBodyParams();
        if ($section->save()) {
            return $section;
        }
        return ['errors' => $section->errors];
    }

    /**
     * List all CMS FAQs for admin
     */
    public function actionFaqs()
    {
        return CmsFaq::find()->orderBy(['order_number' => SORT_ASC])->all();
    }

    /**
     * Create or update FAQ
     */
    public function actionCreateFaq()
    {
        $faq = new CmsFaq();
        $faq->attributes = Yii::$app->request->getBodyParams();
        if ($faq->save()) {
            return $faq;
        }
        return ['errors' => $faq->errors];
    }

    public function actionUpdateFaq($id)
    {
        $faq = CmsFaq::findOne($id);
        if (!$faq) {
            throw new NotFoundHttpException('FAQ topilmadi.');
        }

        $faq->attributes = Yii::$app->request->getBodyParams();
        if ($faq->save()) {
            return $faq;
        }
        return ['errors' => $faq->errors];
    }
}
