<?php

namespace common\services;

use Yii;
use common\models\AdmissionApplication;
use common\models\User;
use common\models\Role;
use common\models\Student;
use common\models\ParentModel;
use common\models\ParentStudent;
use common\models\SchoolClass;
use common\models\AcademicYear;
use common\models\Enrollment;
use common\models\Contract;
use common\services\FinanceService;
use common\services\NotificationService;
use yii\web\NotFoundHttpException;
use yii\web\BadRequestHttpException;

class AdmissionService
{
    /**
     * Create new application from public landing or backoffice
     */
    public function createApplication(array $data)
    {
        $app = new AdmissionApplication();
        $app->attributes = $data;

        // Auto-generate application number
        if (empty($app->application_number)) {
            $year = date('Y');
            $randomNum = mt_rand(1000, 9999);
            $app->application_number = "ADM-{$year}-{$randomNum}";
        }

        if (empty($app->status)) {
            $app->status = AdmissionApplication::STATUS_NEW;
        }

        if (!$app->save()) {
            throw new BadRequestHttpException(json_encode($app->errors));
        }

        // Send notification to school administration
        try {
            $notifService = new NotificationService();
            $admins = User::find()
                ->innerJoin('user_role', 'user_role.user_id = user.id')
                ->innerJoin('role', 'role.id = user_role.role_id')
                ->where(['role.name' => ['super_admin', 'admin', 'director']])
                ->all();

            foreach ($admins as $admin) {
                $notifService->sendNotification(
                    $admin->id,
                    'Yangi qabul arizasi kelib tushdi!',
                    "Nomzod: {$app->first_name} {$app->last_name} ({$app->applying_grade}-sinf). Ariza raqami: {$app->application_number}",
                    'admission',
                    '/admissions'
                );
            }
        } catch (\Exception $e) {
            Yii::error('Failed to notify admins of new admission: ' . $e->getMessage());
        }

        return $app;
    }

    /**
     * Update application status and progress
     */
    public function updateStatus($id, $status, $notes = null, $interviewDate = null, $examScore = null)
    {
        $app = AdmissionApplication::findOne($id);
        if (!$app) {
            throw new NotFoundHttpException('Ariza topilmadi.');
        }

        $app->status = $status;
        if ($notes !== null) {
            $app->notes = $notes;
        }
        if ($interviewDate !== null) {
            $app->interview_date = $interviewDate;
        }
        if ($examScore !== null) {
            $app->exam_score = (float)$examScore;
        }

        if (!$app->save()) {
            throw new BadRequestHttpException(json_encode($app->errors));
        }

        return $app;
    }

    /**
     * Auto-Enroll student into school class, creating User, Student, Enrollment and Contract
     */
    public function enrollStudent($id, $schoolClassId, $annualTuitionFee = 25000000)
    {
        $app = AdmissionApplication::findOne($id);
        if (!$app) {
            throw new NotFoundHttpException('Ariza topilmadi.');
        }

        if ($app->status === AdmissionApplication::STATUS_ENROLLED) {
            throw new BadRequestHttpException('Ushbu nomzod allaqachon maktab o\'quvchisi sifatida rasmiylashtirilgan.');
        }

        $schoolClass = SchoolClass::findOne($schoolClassId);
        if (!$schoolClass) {
            throw new NotFoundHttpException('Tanlangan sinf topilmadi.');
        }

        $academicYear = AcademicYear::find()->where(['is_current' => 1])->one() 
            ?: AcademicYear::find()->orderBy(['id' => SORT_DESC])->one();

        if (!$academicYear) {
            throw new BadRequestHttpException('Faol o\'quv yili topilmadi.');
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            $time = time();

            // 1. Create Student User account
            $cleanFirst = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $app->first_name));
            $username = $cleanFirst . '_' . mt_rand(100, 999);
            $email = $app->parent_email ?: "{$username}@maktab.uz";

            // Ensure unique username
            while (User::find()->where(['username' => $username])->exists()) {
                $username = $cleanFirst . '_' . mt_rand(100, 999);
            }

            $user = new User();
            $user->username = $username;
            $user->email = $email;
            $user->first_name = $app->first_name;
            $user->last_name = $app->last_name;
            $user->middle_name = $app->middle_name;
            $user->phone = $app->parent_phone;
            $user->status = User::STATUS_ACTIVE;
            $user->setPassword('password123');
            $user->generateAuthKey();
            $user->generateAccessToken();
            $user->save(false);

            // Assign 'student' role
            $studentRole = Role::findOne(['name' => Role::STUDENT]);
            if ($studentRole) {
                Yii::$app->db->createCommand()->insert('user_role', [
                    'user_id' => $user->id,
                    'role_id' => $studentRole->id,
                ])->execute();
            }

            // 2. Create Student record
            $studentCode = 'STU-' . mt_rand(10000, 99999);
            $student = new Student();
            $student->user_id = $user->id;
            $student->student_code = $studentCode;
            $student->birth_date = $app->birth_date;
            $student->gender = $app->gender ?: 1;
            $student->address = $app->address;
            $student->admission_date = date('Y-m-d');
            $student->status = Student::STATUS_ACTIVE;
            $student->save(false);

            // 3. Create Enrollment in the selected class
            $enrollment = new Enrollment();
            $enrollment->student_id = $student->id;
            $enrollment->school_class_id = $schoolClass->id;
            $enrollment->academic_year_id = $academicYear->id;
            $enrollment->enrolled_date = date('Y-m-d');
            $enrollment->status = Enrollment::STATUS_ACTIVE;
            $enrollment->notes = "Qabul arizasi orqali kiritildi: {$app->application_number}";
            $enrollment->save(false);

            // 4. Create Contract and initial Invoices via FinanceService
            $contract = new Contract();
            $contract->student_id = $student->id;
            $contract->academic_year_id = $academicYear->id;
            $contract->contract_number = 'SH-' . date('Y') . '-' . mt_rand(1000, 9999);
            $contract->total_amount = $annualTuitionFee;
            $contract->discount_amount = 0;
            $contract->payment_plan = 'monthly';
            $contract->status = Contract::STATUS_ACTIVE;
            $contract->start_date = $academicYear->start_date;
            $contract->end_date = $academicYear->end_date;
            $contract->save(false);

            $financeService = new FinanceService();
            $financeService->generateContractInvoices($contract);

            // 5. Update AdmissionApplication status
            $app->status = AdmissionApplication::STATUS_ENROLLED;
            $app->enrolled_student_id = $student->id;
            $app->notes = ($app->notes ? $app->notes . "\n" : "") . 
                "Rasmiylashtirildi: {$schoolClass->name} sinfi, Logini: {$username}, Shartnoma: {$contract->contract_number}";
            $app->save(false);

            $transaction->commit();

            return [
                'success' => true,
                'application' => $app,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'initial_password' => 'password123',
                ],
                'student' => $student,
                'class' => $schoolClass,
                'contract' => $contract,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }
    }

    /**
     * Funnel statistics for Admissions CRM
     */
    public function getFunnelStats()
    {
        $total = (int)AdmissionApplication::find()->count();
        $statuses = ['new', 'contacted', 'interview', 'exam', 'accepted', 'rejected', 'enrolled'];
        $counts = [];

        foreach ($statuses as $st) {
            $counts[$st] = (int)AdmissionApplication::find()->where(['status' => $st])->count();
        }

        $conversionRate = $total > 0 ? round(($counts['enrolled'] / $total) * 100, 1) : 0;

        return [
            'total_applications' => $total,
            'counts' => $counts,
            'conversion_rate' => $conversionRate,
        ];
    }
}
