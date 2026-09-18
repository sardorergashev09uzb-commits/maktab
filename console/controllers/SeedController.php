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

    public function actionFullDemo()
    {
        echo ">>> 1. Asosiy maktab ma'lumotlarini yuklash...\n";
        $this->actionSampleData();
        $this->actionTestUsers();
        $this->actionCms();

        $year = \common\models\AcademicYear::find()->where(['is_current' => 1])->one();
        $class5A = \common\models\SchoolClass::findOne(['name' => '5-A', 'academic_year_id' => $year->id]);
        $teacher = \common\models\Teacher::find()->one();
        $student = \common\models\Student::find()->one();
        $parent = \common\models\ParentModel::find()->one();

        if (!$year || !$class5A || !$teacher || !$student || !$parent) {
            echo "Xatolik: Baza modellari topilmadi!\n";
            return;
        }

        // 1. Ota-onani o'quvchiga bog'lash
        $psExists = \common\models\ParentStudent::find()->where(['parent_id' => $parent->id, 'student_id' => $student->id])->exists();
        if (!$psExists) {
            $ps = new \common\models\ParentStudent();
            $ps->parent_id = $parent->id;
            $ps->student_id = $student->id;
            $ps->relation_type = 'father';
            $ps->is_primary = 1;
            $ps->save(false);
            echo "Ota-ona va o'quvchi bog'landi.\n";
        }

        // 2. O'quvchini 5-A sinfiga biriktirish
        $enrExists = \common\models\Enrollment::find()->where(['student_id' => $student->id, 'school_class_id' => $class5A->id])->exists();
        if (!$enrExists) {
            $enr = new \common\models\Enrollment();
            $enr->student_id = $student->id;
            $enr->school_class_id = $class5A->id;
            $enr->academic_year_id = $year->id;
            $enr->enrolled_date = '2026-09-01';
            $enr->status = 10;
            $enr->save(false);
            echo "O'quvchi 5-A sinfiga biriktirildi.\n";
        }

        // 3. Fanlar va xonalarni olish
        $math = \common\models\Subject::findOne(['code' => 'MATH']);
        $uzb = \common\models\Subject::findOne(['code' => 'UZB']);
        $eng = \common\models\Subject::findOne(['code' => 'ENG']);
        $phys = \common\models\Subject::findOne(['code' => 'PHYS']);
        $it = \common\models\Subject::findOne(['code' => 'IT']);
        $steam = \common\models\Subject::findOne(['code' => 'STEAM']);
        $hist = \common\models\Subject::findOne(['code' => 'HIST']);
        $chess = \common\models\Subject::findOne(['code' => 'CHESS']);

        $room101 = \common\models\Room::findOne(['name' => '102-Matematika xonasi']) ?: \common\models\Room::find()->one();
        $roomSteam = \common\models\Room::findOne(['name' => '201-STEAM & Robototexnika markazi']) ?: $room101;
        $roomIt = \common\models\Room::findOne(['name' => '202-IT & Dasturlash xonasi']) ?: $room101;

        // 4. Haftalik to'liq dars jadvalini shakllantirish (Dushanba - Shanba)
        \common\models\Schedule::deleteAll(['school_class_id' => $class5A->id]);

        $scheduleTemplates = [
            1 => [ // Dushanba
                ['08:30', '09:15', $math, $room101],
                ['09:25', '10:10', $uzb, $room101],
                ['10:20', '11:05', $eng, $room101],
                ['11:25', '12:10', $it, $roomIt],
                ['12:20', '13:05', $steam, $roomSteam],
            ],
            2 => [ // Seshanba
                ['08:30', '09:15', $phys, $room101],
                ['09:25', '10:10', $math, $room101],
                ['10:20', '11:05', $hist, $room101],
                ['11:25', '12:10', $eng, $room101],
                ['12:20', '13:05', $chess, $room101],
            ],
            3 => [ // Chorshanba
                ['08:30', '09:15', $it, $roomIt],
                ['09:25', '10:10', $eng, $room101],
                ['10:20', '11:05', $math, $room101],
                ['11:25', '12:10', $steam, $roomSteam],
                ['12:20', '13:05', $uzb, $room101],
            ],
            4 => [ // Payshanba
                ['08:30', '09:15', $math, $room101],
                ['09:25', '10:10', $phys, $room101],
                ['10:20', '11:05', $uzb, $room101],
                ['11:25', '12:10', $hist, $room101],
                ['12:20', '13:05', $it, $roomIt],
            ],
            5 => [ // Juma
                ['08:30', '09:15', $eng, $room101],
                ['09:25', '10:10', $math, $room101],
                ['10:20', '11:05', $steam, $roomSteam],
                ['11:25', '12:10', $uzb, $room101],
                ['12:20', '13:05', $chess, $room101],
            ],
            6 => [ // Shanba
                ['09:00', '09:45', $steam, $roomSteam],
                ['09:55', '10:40', $chess, $room101],
                ['10:50', '11:35', $it, $roomIt],
            ],
        ];

        foreach ($scheduleTemplates as $day => $items) {
            foreach ($items as $item) {
                if (!$item[2]) continue;
                $sch = new \common\models\Schedule();
                $sch->academic_year_id = $year->id;
                $sch->school_class_id = $class5A->id;
                $sch->subject_id = $item[2]->id;
                $sch->teacher_id = $teacher->id;
                $sch->room_id = $item[3] ? $item[3]->id : null;
                $sch->day_of_week = $day;
                $sch->start_time = $item[0];
                $sch->end_time = $item[1];
                $sch->status = 10;
                $sch->save(false);
            }
        }
        echo "5-A sinf haftalik dars jadvali to'liq saqlandi!\n";

        // 5. Bugungi darslar (Lesson) generatsiyasi
        $today = date('Y-m-d');
        \common\models\Lesson::deleteAll(['school_class_id' => $class5A->id, 'date' => $today]);

        $todayDayOfWeek = (int)date('N');
        $todaySlots = $scheduleTemplates[$todayDayOfWeek] ?? $scheduleTemplates[1]; // agar yakshanba bo'lsa dushanbaniki

        $todayLessons = [];
        foreach ($todaySlots as $slot) {
            if (!$slot[2]) continue;
            $lesson = new \common\models\Lesson();
            $lesson->academic_year_id = $year->id;
            $lesson->school_class_id = $class5A->id;
            $lesson->subject_id = $slot[2]->id;
            $lesson->teacher_id = $teacher->id;
            $lesson->room_id = $slot[3] ? $slot[3]->id : null;
            $lesson->date = $today;
            $lesson->start_time = $slot[0];
            $lesson->end_time = $slot[1];
            $lesson->topic = $slot[2]->name . " bo'yicha interaktiv dars";
            $lesson->status = \common\models\Lesson::STATUS_SCHEDULED;
            $lesson->save(false);
            $todayLessons[] = $lesson;
        }
        echo "Bugungi darslar muvaffaqiyatli ochildi (" . count($todayLessons) . " ta dars).\n";

        // 6. O'tmishdagi darslar, davomat va baholar
        $categories = \common\models\GradeCategory::find()->all();
        $catMap = [];
        foreach ($categories as $cat) {
            $catMap[$cat->code] = $cat->id;
        }

        $hwCat = $catMap['homework'] ?? ($categories[0]->id ?? 1);
        $examCat = $catMap['exam'] ?? ($categories[1]->id ?? 1);
        $projCat = $catMap['project'] ?? ($categories[2]->id ?? 1);
        $cwCat = $catMap['classwork'] ?? $hwCat;

        // O'tgan 14 kunga darslar va davomat qo'shish
        for ($i = 1; $i <= 14; $i++) {
            $pastDate = date('Y-m-d', strtotime("-$i days"));
            $pastDay = (int)date('N', strtotime($pastDate));
            if ($pastDay == 7) continue; // Yakshanba emas

            $pastSlots = $scheduleTemplates[$pastDay] ?? $scheduleTemplates[1];
            foreach ($pastSlots as $pslot) {
                if (!$pslot[2]) continue;
                $pl = new \common\models\Lesson();
                $pl->academic_year_id = $year->id;
                $pl->school_class_id = $class5A->id;
                $pl->subject_id = $pslot[2]->id;
                $pl->teacher_id = $teacher->id;
                $pl->room_id = $pslot[3] ? $pslot[3]->id : null;
                $pl->date = $pastDate;
                $pl->start_time = $pslot[0];
                $pl->end_time = $pslot[1];
                $pl->topic = $pslot[2]->name . " mavzusi";
                $pl->status = \common\models\Lesson::STATUS_COMPLETED;
                $pl->save(false);

                // Davomat
                $att = new \common\models\Attendance();
                $att->lesson_id = $pl->id;
                $att->student_id = $student->id;
                $att->status = ($i == 3) ? \common\models\Attendance::STATUS_LATE : (($i == 9) ? \common\models\Attendance::STATUS_EXCUSED : \common\models\Attendance::STATUS_PRESENT);
                $att->remarks = ($i == 3) ? 'Transport kechikdi (5 daqiqa)' : (($i == 9) ? 'Shifokor ma\'lumotnomasi' : 'Darsda faol qatnashdi');
                $att->save(false);

                // Ayrim darslarga baholar
                if ($i % 2 == 0) {
                    $grade = new \common\models\Grade();
                    $grade->lesson_id = $pl->id;
                    $grade->student_id = $student->id;
                    $grade->teacher_id = $teacher->id;
                    $grade->grade_category_id = ($i == 2) ? $examCat : (($i == 4) ? $projCat : $hwCat);
                    $grade->score = ($i == 2) ? 95 : (($i == 4) ? 100 : (($i == 6) ? 88 : 92));
                    $grade->max_score = 100;
                    $grade->comment = "A'lo darajada bajardi!";
                    $grade->status = \common\models\Grade::STATUS_SUBMITTED;
                    $grade->save(false);
                }
            }
        }
        echo "O'tgan kunlar uchun davomat va baholar muvaffaqiyatli kiritildi!\n";

        // 7. Uy vazifalari (Assignments)
        \common\models\Assignment::deleteAll(['school_class_id' => $class5A->id]);

        $hwList = [
            [
                'title' => "Kvadrat tenglamalar va diskriminant formulasi",
                'subject' => $math,
                'desc' => "Darslikdagi 45-52-mashqlarni daftarga to'liq yechish va oraliq qadamlarni ko'rsatish.",
                'days' => 2,
                'score' => 100,
            ],
            [
                'title' => "Essay: The Future of Artificial Intelligence",
                'subject' => $eng,
                'desc' => "Write an essay containing at least 250 words about how AI will shape education and careers.",
                'days' => 3,
                'score' => 100,
            ],
            [
                'title' => "Nyutonning II qonuniga doir laboratoriya tahlili",
                'subject' => $phys,
                'desc' => "Tajriba ma'lumotlari asosida tezlanish va kuch grafigini chizish va xulosa yozish.",
                'days' => 5,
                'score' => 100,
            ],
            [
                'title' => "Python'da qidiruv va tartiblash algoritmlari",
                'subject' => $it,
                'desc' => "Binary search va Bubble sort funksiyalarini yozib, test qilish.",
                'days' => 7,
                'score' => 100,
            ],
        ];

        foreach ($hwList as $hw) {
            if (!$hw['subject']) continue;
            $as = new \common\models\Assignment();
            $as->school_class_id = $class5A->id;
            $as->subject_id = $hw['subject']->id;
            $as->teacher_id = $teacher->id;
            $as->title = $hw['title'];
            $as->description = $hw['desc'];
            $as->due_date = date('Y-m-d 23:59:59', strtotime("+{$hw['days']} days"));
            $as->max_score = $hw['score'];
            $as->status = \common\models\Assignment::STATUS_ACTIVE;
            $as->save(false);
        }
        echo "Faol uy vazifalari qo'shildi!\n";

        // 8. Ota-onaga invoyslar (Moliya)
        \common\models\Invoice::deleteAll(['student_id' => $student->id]);

        $inv1 = new \common\models\Invoice();
        $inv1->student_id = $student->id;
        $inv1->invoice_number = 'INV-2026-09-001';
        $inv1->title = '2026-Sentabr oylik ta\'lim to\'lovi';
        $inv1->amount = 2500000;
        $inv1->paid_amount = 2500000;
        $inv1->due_date = '2026-09-10';
        $inv1->status = \common\models\Invoice::STATUS_PAID;
        $inv1->save(false);

        $inv2 = new \common\models\Invoice();
        $inv2->student_id = $student->id;
        $inv2->invoice_number = 'INV-2026-10-002';
        $inv2->title = '2026-Oktabr oylik ta\'lim to\'lovi';
        $inv2->amount = 2500000;
        $inv2->paid_amount = 0;
        $inv2->due_date = '2026-10-10';
        $inv2->status = \common\models\Invoice::STATUS_PENDING;
        $inv2->save(false);
        echo "Ota-ona uchun to'lov invoyslari tayyorlandi!\n";

        // 9. Coinlar va sovg'alar
        $rewards = [
            ['Al-Xorazmiy Smart Termos', 'Haroratni ko\'rsatuvchi zanglamas po\'lat termos (500ml)', 150, 'termos.png'],
            ['Maktab logotipli Hoodie (Svitshot)', 'Qalin paxtali, qulay va maktab ramzi tushirilgan kiyim', 300, 'hoodie.png'],
            ['VIP Kutubxona va Coworking abonementi', 'Shaxsiy tinch o\'qish zali va bepul ichimliklar (1 oy)', 80, 'library.png'],
            ['Arduino & STEM Robototexnika to\'plami', 'Uyda mustaqil robot yasash uchun datchik va motorlar to\'plami', 500, 'arduino.png'],
        ];

        foreach ($rewards as $rw) {
            $existRw = \common\models\CoinReward::findOne(['title' => $rw[0]]);
            if (!$existRw) {
                $cr = new \common\models\CoinReward();
                $cr->title = $rw[0];
                $cr->description = $rw[1];
                $cr->coin_price = $rw[2];
                $cr->stock_quantity = 25;
                $cr->status = 10;
                $cr->save(false);
            }
        }

        // Student coin balansi
        $coinTx = new \common\models\CoinTransaction();
        $coinTx->student_id = $student->id;
        $coinTx->amount = 350;
        $coinTx->type = 'award';
        $coinTx->reason = "A'lo baholar va olimpiadadagi faol ishtirok uchun";
        $coinTx->save(false);
        echo "Coin balansi va sovg'alar tayyorlandi!\n";

        // 10. E'lonlar
        $announcements = [
            [
                'title' => 'Cambridge Mock Imtihoni bo\'lib o\'tadi',
                'content' => 'Kelgusi haftada 5-11 sinf o\'quvchilari uchun Cambridge standarti bo\'yicha diagnostik imtihon o\'tkaziladi. Barcha o\'quvchilarga omad tilaymiz!',
                'target_role' => 'all',
                'priority' => 10,
            ],
            [
                'title' => 'Robototexnika va STEAM Ko\'rgazmasi',
                'content' => 'Maktabimizning STEAM laboratoriyasida o\'quvchilar yasagan innovatsion robotlar va IT loyihalar ko\'rgazmasi bo\'lib o\'tadi.',
                'target_role' => 'all',
                'priority' => 5,
            ],
            [
                'title' => 'Ota-onalar bilan shaxsiy maslahatlashuv kuni',
                'content' => 'Har bir ota-ona o\'qituvchilar bilan farzandining individual rivojlanish rejasi bo\'yicha yuzma-yuz suhbatlashishi mumkin.',
                'target_role' => 'parents',
                'priority' => 8,
            ],
        ];

        foreach ($announcements as $ann) {
            $exAnn = \common\models\Announcement::findOne(['title' => $ann['title']]);
            if (!$exAnn) {
                $an = new \common\models\Announcement();
                $an->title = $ann['title'];
                $an->content = $ann['content'];
                $an->target_role = $ann['target_role'];
                $an->priority = $ann['priority'];
                $an->is_published = 1;
                $an->published_at = date('Y-m-d H:i:s');
                $an->save(false);
            }
        }
        echo "Maktab e'lonlari joylashtirildi!\n";

        echo "\n==========================================================\n";
        echo " BARCHA TEST MA'LUMOTLARI 100% MUVAFFAQIYATLI YUKLANDI! \n";
        echo "==========================================================\n";
    }
}
