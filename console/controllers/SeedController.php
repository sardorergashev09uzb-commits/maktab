<?php
/**
 * Test foydalanuvchilar yaratish skripti
 * Foydalanish: php yii seed/test-users
 */

namespace console\controllers;

use Yii;
use yii\console\Controller;
use common\models\User;
use common\models\Role;
use common\models\Student;
use common\models\Teacher;
use common\models\ParentModel;

class SeedController extends Controller
{
    public function actionTestUsers()
    {
        $users = [
            [
                'username' => 'admin',
                'email' => 'admin@maktab.uz',
                'password' => 'admin123',
                'first_name' => 'Admin',
                'last_name' => 'Superadmin',
                'roles' => ['super_admin', 'admin'],
            ],
            [
                'username' => 'director',
                'email' => 'director@maktab.uz',
                'password' => 'director123',
                'first_name' => 'Abdulla',
                'last_name' => 'Karimov',
                'roles' => ['director'],
            ],
            [
                'username' => 'zavuch',
                'email' => 'zavuch@maktab.uz',
                'password' => 'zavuch123',
                'first_name' => 'Nilufar',
                'last_name' => 'Toshmatova',
                'roles' => ['zavuch'],
            ],
            [
                'username' => 'accountant',
                'email' => 'accountant@maktab.uz',
                'password' => 'accountant123',
                'first_name' => 'Dilorom',
                'last_name' => 'Saidova',
                'roles' => ['accountant'],
            ],
            [
                'username' => 'teacher1',
                'email' => 'teacher1@maktab.uz',
                'password' => 'teacher123',
                'first_name' => 'Anvar',
                'last_name' => 'Raximov',
                'roles' => ['teacher'],
                'teacher' => [
                    'employee_code' => 'T001',
                    'specialization' => 'Matematika',
                    'experience_years' => 10,
                ],
            ],
            [
                'username' => 'student1',
                'email' => 'student1@maktab.uz',
                'password' => 'student123',
                'first_name' => 'Ali',
                'last_name' => 'Valiyev',
                'roles' => ['student'],
                'student' => [
                    'student_code' => 'S001',
                    'birth_date' => '2012-05-15',
                    'gender' => 1,
                ],
            ],
            [
                'username' => 'parent1',
                'email' => 'parent1@maktab.uz',
                'password' => 'parent123',
                'first_name' => 'Sobir',
                'last_name' => 'Valiyev',
                'roles' => ['parent'],
                'parent' => [
                    'occupation' => 'Dasturchi',
                    'workplace' => 'IT kompaniya',
                ],
            ],
        ];

        foreach ($users as $userData) {
            $existing = User::findOne(['username' => $userData['username']]);
            if ($existing) {
                echo "User '{$userData['username']}' already exists, skipping...\n";
                continue;
            }

            $user = new User();
            $user->username = $userData['username'];
            $user->email = $userData['email'];
            $user->setPassword($userData['password']);
            $user->generateAuthKey();
            $user->generateAccessToken();
            $user->first_name = $userData['first_name'];
            $user->last_name = $userData['last_name'];
            $user->status = User::STATUS_ACTIVE;

            if (!$user->save()) {
                echo "ERROR creating user '{$userData['username']}': " . json_encode($user->errors) . "\n";
                continue;
            }

            foreach ($userData['roles'] as $roleName) {
                $role = Role::findOne(['name' => $roleName]);
                if ($role) {
                    Yii::$app->db->createCommand()->insert('{{%user_role}}', [
                        'user_id' => $user->id,
                        'role_id' => $role->id,
                    ])->execute();
                    echo "  Role '{$roleName}' assigned.\n";
                } else {
                    echo "  WARNING: Role '{$roleName}' not found!\n";
                }
            }

            if (isset($userData['teacher'])) {
                $teacher = new Teacher();
                $teacher->user_id = $user->id;
                $teacher->employee_code = $userData['teacher']['employee_code'];
                $teacher->specialization = $userData['teacher']['specialization'];
                $teacher->experience_years = $userData['teacher']['experience_years'];
                $teacher->status = 10;
                if ($teacher->save()) {
                    echo "  Teacher profile created.\n";
                } else {
                    echo "  ERROR creating teacher: " . json_encode($teacher->errors) . "\n";
                }
            }

            if (isset($userData['student'])) {
                $student = new Student();
                $student->user_id = $user->id;
                $student->student_code = $userData['student']['student_code'];
                $student->birth_date = $userData['student']['birth_date'];
                $student->gender = $userData['student']['gender'];
                $student->status = 10;
                if ($student->save()) {
                    echo "  Student profile created.\n";
                } else {
                    echo "  ERROR creating student: " . json_encode($student->errors) . "\n";
                }
            }

            if (isset($userData['parent'])) {
                $parent = new ParentModel();
                $parent->user_id = $user->id;
                $parent->occupation = $userData['parent']['occupation'];
                $parent->workplace = $userData['parent']['workplace'];
                if ($parent->save()) {
                    echo "  Parent profile created.\n";
                } else {
                    echo "  ERROR creating parent: " . json_encode($parent->errors) . "\n";
                }
            }

            echo "User '{$userData['username']}' created (ID: {$user->id})\n";
        }

        echo "\n=== Test foydalanuvchilar tayyor! ===\n";
    }

    public function actionCms()
    {
        $sections = [
            [
                'key' => 'programs',
                'title' => 'Bizning Ta\'lim Dasturlarimiz',
                'subtitle' => 'Har bir yosh davriga moslashtirilgan o\'quv dasturlari va fanlar integratsiyasi',
                'content' => json_encode([
                    [
                        'title' => 'Boshlang\'ich Ta\'lim (1-4 sinf)',
                        'desc' => 'Kichik guruhlar (16 nafargacha), individual yondashuv, qiziqarli o\'yin metodikalari va chet tillarini o\'rganish.',
                        'badge' => 'Boshlang\'ich',
                        'color' => 'from-blue-500 to-indigo-600',
                    ],
                    [
                        'title' => 'O\'rta Ta\'lim (5-9 sinf)',
                        'desc' => 'Chuqurlashtirilgan matematika, fizika, informatika, ikkinchi chet tili (nemis/arab) va laboratoriya amaliyotlari.',
                        'badge' => 'Asosiy',
                        'color' => 'from-emerald-500 to-teal-600',
                    ],
                    [
                        'title' => 'Yuqori Ta\'lim & OTM (10-11 sinf)',
                        'desc' => 'IELTS 7.0+, SAT imtihonlariga maqsadli tayyorgarlik, xalqaro olimpiadalar va kasbiy yo\'naltirish (Holland & STEM).',
                        'badge' => 'Bitiruvchi',
                        'color' => 'from-violet-500 to-purple-600',
                    ],
                    [
                        'title' => 'STEAM & IT Laboratoriyalari',
                        'desc' => 'Robototexnika, Python dasturlash, 3D modellashtirish, startap loyihalar va sun\'iy intellekt ko\'nikmalari.',
                        'badge' => 'Innovatsiya',
                        'color' => 'from-amber-500 to-orange-600',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'order_number' => 4,
                'is_active' => 1,
            ],
            [
                'key' => 'advantages',
                'title' => 'Nega Ota-onalar Bizni Tanlaydilar?',
                'subtitle' => 'Farzandingizning sog\'lom, xavfsiz va sermahsul ta\'lim olishi uchun barcha sharoitlar',
                'content' => json_encode([
                    [
                        'icon' => 'BookOpen',
                        'title' => 'Cambridge & STEAM Dasturi',
                        'desc' => 'Xalqaro standartlar bo\'yicha integratsiyalashgan ta\'lim va chuqur amaliyot.',
                    ],
                    [
                        'icon' => 'Users',
                        'title' => 'Oliy Toifali Ustozlar',
                        'desc' => 'Xalqaro sertifikatlarga ega, ko\'p yillik tajribali mutaxassislar jamoasi.',
                    ],
                    [
                        'icon' => 'Laptop',
                        'title' => 'Raqamli Ekotizim (ERP & LMS)',
                        'desc' => 'Ota-onalar uchun shaxsiy mobil kabinet, onlayn baholar, dars jadvali va davomat nazorati.',
                    ],
                    [
                        'icon' => 'Award',
                        'title' => 'Rag\'batlantiruvchi Coin Tizimi',
                        'desc' => 'A\'lo baholar va intizom uchun maktab ichki valyutasi va qimmatbaho sovg\'alar do\'koni.',
                    ],
                    [
                        'icon' => 'Shield',
                        'title' => '24/7 Xavfsizlik & Face-ID',
                        'desc' => 'Xavfsiz yopiq hudud, video nazorat va ota-onaga bolaning kirib-chiqishi bo\'yicha SMS xabarnomalar.',
                    ],
                    [
                        'icon' => 'Globe',
                        'title' => '3 Mahal Ovqatlanish & Transport',
                        'desc' => 'Parhezshunos nazoratidagi issiq taomlar va shahar bo\'ylab qulay qatnovchi maktab avtobuslari.',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'order_number' => 5,
                'is_active' => 1,
            ],
            [
                'key' => 'mission',
                'title' => 'Maktabimizning Bosh Maqsadi',
                'subtitle' => 'Dunyoning nufuzli oliygohlarida erkin raqobatlasha oladigan, milliy qadriyatlarga sodiq, intellektual salohiyatli barkamol avlodni tarbiyalash.',
                'content' => json_encode([
                    'ratio' => '1 : 8',
                    'ratio_label' => 'Ustoz / O\'quvchi nisbati',
                    'target' => 'IELTS 7.5+',
                    'target_label' => 'Bitiruvchilar o\'rtacha bali',
                    'points' => [
                        'Har bir sinfda ko\'pi bilan 16 nafargacha o\'quvchi',
                        'O\'quvchi qobiliyati bo\'yicha individual o\'sish traektoriyasi',
                        'Psixolog va tyutorlar tomonidan muntazam monitoring',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'order_number' => 6,
                'is_active' => 1,
            ],
            [
                'key' => 'cta',
                'title' => 'Farzandingiz Kelajagiga Bugunoq Poydevor Qo\'ying!',
                'subtitle' => 'Ariza qoldiring, qabul komissiyamiz siz bilan bog\'lanib, bepul konsultatsiya va maktab bo\'ylab ekskursiya tashkil qiladi.',
                'content' => json_encode([
                    'button_text' => 'Hozirroq Ariza Qoldirish',
                ], JSON_UNESCAPED_UNICODE),
                'order_number' => 7,
                'is_active' => 1,
            ],
        ];

        foreach ($sections as $sec) {
            $existing = \common\models\CmsSection::findOne(['key' => $sec['key']]);
            if (!$existing) {
                $model = new \common\models\CmsSection();
                $model->attributes = $sec;
                $model->save(false);
                echo "Qo'shildi: {$sec['key']}\n";
            } else {
                $existing->attributes = $sec;
                $existing->save(false);
                echo "Yangilandi: {$sec['key']}\n";
            }
        }

        echo "\n=== CMS bo'limlari to'liq bazaga yozildi! ===\n";
    }

    public function actionSampleData()
    {
        $year = \common\models\AcademicYear::find()->where(['is_current' => 1])->one();
        if (!$year) {
            $year = new \common\models\AcademicYear();
            $year->name = '2026/2027';
            $year->slug = '2026-2027';
            $year->start_date = '2026-09-01';
            $year->end_date = '2027-05-25';
            $year->is_current = 1;
            $year->status = 10;
            $year->save(false);
        }

        // 1. Subjects
        $subjects = [
            ['Matematika', 'MATH', 'Chuqurlashtirilgan algebra va geometriya'],
            ['Fizika', 'PHYS', 'Nazariy va amaliy fizika laboratoriyalari'],
            ['Kimyo', 'CHEM', 'Tajribaviy kimyo va moddalar tahlili'],
            ['Biologiya', 'BIO', 'Umumiy biologiya va genetika asoslari'],
            ['Ingliz tili (Cambridge)', 'ENG', 'Cambridge xalqaro standarti va IELTS'],
            ['Nemis tili', 'GER', 'Ikkinchi xorijiy til'],
            ['Informatika & Python', 'IT', 'Dasturlash, algoritmlar va sun\'iy intellekt'],
            ['Robototexnika & STEAM', 'STEAM', 'Arduino, mikrokontrollerlar va 3D modellashtirish'],
            ['Tarix', 'HIST', 'O\'zbekiston va jahon sivilizatsiyalari tarixi'],
            ['Geografiya', 'GEO', 'Iqtisodiy va ijtimoiy geografiya'],
            ['Ona tili va adabiyot', 'UZB', 'Grammatika, nutq madaniyati va adabiyot'],
            ['Shaxmat', 'CHESS', 'Mantiqiy fikrlash va strategiya'],
        ];

        foreach ($subjects as $s) {
            $exists = \common\models\Subject::findOne(['code' => $s[1]]);
            if (!$exists) {
                $sub = new \common\models\Subject();
                $sub->name = $s[0];
                $sub->code = $s[1];
                $sub->description = $s[2];
                $sub->status = 10;
                $sub->save(false);
                echo "Fan qo'shildi: {$s[0]}\n";
            }
        }

        // 2. Rooms
        $rooms = [
            ['101-Boshlang\'ich sinf', 'A-bino', 1, 16],
            ['102-Matematika xonasi', 'A-bino', 1, 16],
            ['103-Fizika laboratoriyasi', 'A-bino', 1, 16],
            ['104-Kimyo-Biologiya laboratoriyasi', 'A-bino', 1, 16],
            ['201-STEAM & Robototexnika markazi', 'B-bino', 2, 20],
            ['202-IT & Dasturlash xonasi', 'B-bino', 2, 20],
            ['203-Ingliz tili lingafon xonasi', 'B-bino', 2, 16],
            ['204-Tarix va gumanitar xona', 'B-bino', 2, 16],
            ['Bosh faollar zali (Konferents-zal)', 'Bosh bino', 1, 150],
            ['Yopiq sport majmuasi va basseyn', 'Sport bino', 1, 60],
        ];

        foreach ($rooms as $r) {
            $exists = \common\models\Room::findOne(['name' => $r[0]]);
            if (!$exists) {
                $room = new \common\models\Room();
                $room->name = $r[0];
                $room->building = $r[1];
                $room->capacity = $r[3];
                $room->save(false);
                echo "Xona qo'shildi: {$r[0]}\n";
            }
        }

        // 3. Classes
        $classes = [
            ['1-A', 1, 'A', 16],
            ['2-A', 2, 'A', 16],
            ['5-A', 5, 'A', 16],
            ['7-A', 7, 'A', 16],
            ['8-B', 8, 'B', 16],
            ['10-A', 10, 'A', 16],
            ['11-A', 11, 'A', 16],
        ];

        foreach ($classes as $c) {
            $exists = \common\models\SchoolClass::findOne([
                'academic_year_id' => $year->id,
                'name' => $c[0],
            ]);
            if (!$exists) {
                $sc = new \common\models\SchoolClass();
                $sc->academic_year_id = $year->id;
                $sc->name = $c[0];
                $sc->grade_level = $c[1];
                $sc->section = $c[2];
                $sc->capacity = $c[3];
                $sc->status = 10;
                $sc->save(false);
                echo "Sinf qo'shildi: {$c[0]}\n";
            }
        }

        echo "\n=== Maktab ma'lumotlari (fanlar, xonalar, sinflar) muvaffaqiyatli to'ldirildi! ===\n";
    }
}
