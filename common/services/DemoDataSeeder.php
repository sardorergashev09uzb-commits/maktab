<?php

namespace common\services;

use Yii;
use common\models\AcademicYear;
use common\models\SchoolClass;
use common\models\Subject;
use common\models\Room;
use common\models\Teacher;
use common\models\Student;
use common\models\ParentModel;
use common\models\ParentStudent;
use common\models\Enrollment;
use common\models\Schedule;
use common\models\Lesson;
use common\models\Attendance;
use common\models\Grade;
use common\models\GradeCategory;
use common\models\Assignment;
use common\models\Invoice;
use common\models\CoinReward;
use common\models\CoinTransaction;
use common\models\Announcement;

class DemoDataSeeder
{
    public static function run()
    {
        $log = [];

        // 1. Academic Year
        $year = AcademicYear::find()->where(['is_current' => 1])->one();
        if (!$year) {
            $year = new AcademicYear();
            $year->name = '2026/2027';
            $year->slug = '2026-2027';
            $year->start_date = '2026-09-01';
            $year->end_date = '2027-05-25';
            $year->is_current = 1;
            $year->status = 10;
            $year->save(false);
            $log[] = "O'quv yili ochildi: 2026/2027";
        }

        // 2. Subjects
        $subjectsData = [
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

        foreach ($subjectsData as $s) {
            $sub = Subject::findOne(['code' => $s[1]]);
            if (!$sub) {
                $sub = new Subject();
                $sub->name = $s[0];
                $sub->code = $s[1];
                $sub->description = $s[2];
                $sub->status = 10;
                $sub->save(false);
            }
        }

        // 3. Rooms
        $roomsData = [
            ['101-Boshlang\'ich sinf', 'A-bino', 1, 16],
            ['102-Matematika xonasi', 'A-bino', 1, 16],
            ['103-Fizika laboratoriyasi', 'A-bino', 1, 16],
            ['104-Kimyo-Biologiya laboratoriyasi', 'A-bino', 1, 16],
            ['201-STEAM & Robototexnika markazi', 'B-bino', 2, 20],
            ['202-IT & Dasturlash xonasi', 'B-bino', 2, 20],
            ['203-Ingliz tili lingafon xonasi', 'B-bino', 2, 16],
            ['204-Tarix va gumanitar xona', 'B-bino', 2, 16],
        ];

        foreach ($roomsData as $r) {
            $room = Room::findOne(['name' => $r[0]]);
            if (!$room) {
                $room = new Room();
                $room->name = $r[0];
                $room->building = $r[1];
                $room->capacity = $r[3];
                $room->save(false);
            }
        }

        // 4. Classes
        $classesData = [
            ['1-A', 1, 'A', 16],
            ['2-A', 2, 'A', 16],
            ['5-A', 5, 'A', 16],
            ['7-A', 7, 'A', 16],
            ['8-B', 8, 'B', 16],
            ['10-A', 10, 'A', 16],
            ['11-A', 11, 'A', 16],
        ];

        foreach ($classesData as $c) {
            $sc = SchoolClass::findOne(['name' => $c[0], 'academic_year_id' => $year->id]);
            if (!$sc) {
                $sc = new SchoolClass();
                $sc->academic_year_id = $year->id;
                $sc->name = $c[0];
                $sc->grade_level = $c[1];
                $sc->section = $c[2];
                $sc->capacity = $c[3];
                $sc->status = 10;
                $sc->save(false);
            }
        }

        $class5A = SchoolClass::findOne(['name' => '5-A', 'academic_year_id' => $year->id]);
        $teacher = Teacher::find()->one();
        $student = Student::find()->one();
        $parent = ParentModel::find()->one();

        if ($parent && $student) {
            $psExists = ParentStudent::find()->where(['parent_id' => $parent->id, 'student_id' => $student->id])->exists();
            if (!$psExists) {
                $ps = new ParentStudent();
                $ps->parent_id = $parent->id;
                $ps->student_id = $student->id;
                $ps->relation_type = 'father';
                $ps->is_primary = 1;
                $ps->save(false);
            }
        }

        if ($student && $class5A) {
            $enrExists = Enrollment::find()->where(['student_id' => $student->id, 'school_class_id' => $class5A->id])->exists();
            if (!$enrExists) {
                $enr = new Enrollment();
                $enr->student_id = $student->id;
                $enr->school_class_id = $class5A->id;
                $enr->academic_year_id = $year->id;
                $enr->enrolled_date = '2026-09-01';
                $enr->status = 10;
                $enr->save(false);
            }
        }

        // Subjects & Rooms lookup
        $math = Subject::findOne(['code' => 'MATH']) ?: Subject::find()->one();
        $uzb = Subject::findOne(['code' => 'UZB']) ?: $math;
        $eng = Subject::findOne(['code' => 'ENG']) ?: $math;
        $phys = Subject::findOne(['code' => 'PHYS']) ?: $math;
        $it = Subject::findOne(['code' => 'IT']) ?: $math;
        $steam = Subject::findOne(['code' => 'STEAM']) ?: $math;
        $hist = Subject::findOne(['code' => 'HIST']) ?: $math;
        $chess = Subject::findOne(['code' => 'CHESS']) ?: $math;

        $room101 = Room::findOne(['name' => '102-Matematika xonasi']) ?: Room::find()->one();
        $roomSteam = Room::findOne(['name' => '201-STEAM & Robototexnika markazi']) ?: $room101;
        $roomIt = Room::findOne(['name' => '202-IT & Dasturlash xonasi']) ?: $room101;

        // 5. Weekly Schedule for 5-A
        if ($class5A && $teacher) {
            Schedule::deleteAll(['school_class_id' => $class5A->id]);

            $scheduleTemplates = [
                1 => [
                    ['08:30', '09:15', $math, $room101],
                    ['09:25', '10:10', $uzb, $room101],
                    ['10:20', '11:05', $eng, $room101],
                    ['11:25', '12:10', $it, $roomIt],
                    ['12:20', '13:05', $steam, $roomSteam],
                ],
                2 => [
                    ['08:30', '09:15', $phys, $room101],
                    ['09:25', '10:10', $math, $room101],
                    ['10:20', '11:05', $hist, $room101],
                    ['11:25', '12:10', $eng, $room101],
                    ['12:20', '13:05', $chess, $room101],
                ],
                3 => [
                    ['08:30', '09:15', $it, $roomIt],
                    ['09:25', '10:10', $eng, $room101],
                    ['10:20', '11:05', $math, $room101],
                    ['11:25', '12:10', $steam, $roomSteam],
                    ['12:20', '13:05', $uzb, $room101],
                ],
                4 => [
                    ['08:30', '09:15', $math, $room101],
                    ['09:25', '10:10', $phys, $room101],
                    ['10:20', '11:05', $uzb, $room101],
                    ['11:25', '12:10', $hist, $room101],
                    ['12:20', '13:05', $it, $roomIt],
                ],
                5 => [
                    ['08:30', '09:15', $eng, $room101],
                    ['09:25', '10:10', $math, $room101],
                    ['10:20', '11:05', $steam, $roomSteam],
                    ['11:25', '12:10', $uzb, $room101],
                    ['12:20', '13:05', $chess, $room101],
                ],
                6 => [
                    ['09:00', '09:45', $steam, $roomSteam],
                    ['09:55', '10:40', $chess, $room101],
                    ['10:50', '11:35', $it, $roomIt],
                ],
            ];

            foreach ($scheduleTemplates as $day => $items) {
                foreach ($items as $item) {
                    if (!$item[2]) continue;
                    $sch = new Schedule();
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
            $log[] = "5-A sinf haftalik dars jadvali to'liq saqlandi.";

            // 6. Today's Lessons
            $today = date('Y-m-d');
            Lesson::deleteAll(['school_class_id' => $class5A->id, 'date' => $today]);

            $todayDayOfWeek = (int)date('N');
            $todaySlots = $scheduleTemplates[$todayDayOfWeek] ?? $scheduleTemplates[1];

            foreach ($todaySlots as $slot) {
                if (!$slot[2]) continue;
                $lesson = new Lesson();
                $lesson->academic_year_id = $year->id;
                $lesson->school_class_id = $class5A->id;
                $lesson->subject_id = $slot[2]->id;
                $lesson->teacher_id = $teacher->id;
                $lesson->room_id = $slot[3] ? $slot[3]->id : null;
                $lesson->date = $today;
                $lesson->start_time = $slot[0];
                $lesson->end_time = $slot[1];
                $lesson->topic = $slot[2]->name . " bo'yicha interaktiv dars";
                $lesson->status = Lesson::STATUS_SCHEDULED;
                $lesson->save(false);
            }
            $log[] = "Bugungi darslar ochildi.";

            // 7. Past lessons, attendance, and grades for student1
            if ($student) {
                $categories = GradeCategory::find()->all();
                $catId = !empty($categories) ? $categories[0]->id : 1;

                for ($i = 1; $i <= 10; $i++) {
                    $pastDate = date('Y-m-d', strtotime("-$i days"));
                    $pastDay = (int)date('N', strtotime($pastDate));
                    if ($pastDay == 7) continue;

                    $pastSlots = $scheduleTemplates[$pastDay] ?? $scheduleTemplates[1];
                    foreach (array_slice($pastSlots, 0, 2) as $pslot) {
                        if (!$pslot[2]) continue;
                        $pl = new Lesson();
                        $pl->academic_year_id = $year->id;
                        $pl->school_class_id = $class5A->id;
                        $pl->subject_id = $pslot[2]->id;
                        $pl->teacher_id = $teacher->id;
                        $pl->room_id = $pslot[3] ? $pslot[3]->id : null;
                        $pl->date = $pastDate;
                        $pl->start_time = $pslot[0];
                        $pl->end_time = $pslot[1];
                        $pl->topic = $pslot[2]->name . " amaliyoti";
                        $pl->status = Lesson::STATUS_COMPLETED;
                        $pl->save(false);

                        $att = new Attendance();
                        $att->lesson_id = $pl->id;
                        $att->student_id = $student->id;
                        $att->status = ($i == 3) ? Attendance::STATUS_LATE : (($i == 7) ? Attendance::STATUS_EXCUSED : Attendance::STATUS_PRESENT);
                        $att->remarks = ($i == 3) ? 'Kechikdi (5 daqiqa)' : 'Darsda faol';
                        $att->save(false);

                        if ($i % 2 == 0) {
                            $grade = new Grade();
                            $grade->lesson_id = $pl->id;
                            $grade->student_id = $student->id;
                            $grade->teacher_id = $teacher->id;
                            $grade->grade_category_id = $catId;
                            $grade->score = ($i == 2) ? 95 : (($i == 4) ? 100 : 88);
                            $grade->max_score = 100;
                            $grade->comment = "A'lo darajada!";
                            $grade->status = Grade::STATUS_SUBMITTED;
                            $grade->save(false);
                        }
                    }
                }
                $log[] = "Davomat va baholar kiritildi.";
            }

            // 8. Assignments (Homework)
            Assignment::deleteAll(['school_class_id' => $class5A->id]);
            $assignmentsList = [
                ['Kvadrat tenglamalar va diskriminant (45-52 mashq)', $math, 2],
                ['Essay: The Impact of Artificial Intelligence on Future Careers', $eng, 3],
                ['Nyutonning II qonuniga doir laboratoriya hisoboti', $phys, 5],
                ['Python dasturlash: Qidiruv va saralash algoritmlari', $it, 7],
            ];

            foreach ($assignmentsList as $asData) {
                $as = new Assignment();
                $as->school_class_id = $class5A->id;
                $as->subject_id = $asData[1]->id;
                $as->teacher_id = $teacher->id;
                $as->title = $asData[0];
                $as->description = "Topshiriqni to'liq bajaring va belgilangan muddatdan kechikmay topshiring.";
                $as->due_date = date('Y-m-d 23:59:59', strtotime("+{$asData[2]} days"));
                $as->max_score = 100;
                $as->status = Assignment::STATUS_ACTIVE;
                $as->save(false);
            }
            $log[] = "Uy vazifalari qo'shildi.";
        }

        // 9. Invoices
        if ($student) {
            Invoice::deleteAll(['student_id' => $student->id]);
            $inv1 = new Invoice();
            $inv1->student_id = $student->id;
            $inv1->invoice_number = 'INV-2026-09-001';
            $inv1->title = '2026-Sentabr oylik ta\'lim to\'lovi';
            $inv1->amount = 2500000;
            $inv1->paid_amount = 2500000;
            $inv1->due_date = '2026-09-10';
            $inv1->status = Invoice::STATUS_PAID;
            $inv1->save(false);

            $inv2 = new Invoice();
            $inv2->student_id = $student->id;
            $inv2->invoice_number = 'INV-2026-10-002';
            $inv2->title = '2026-Oktabr oylik ta\'lim to\'lovi';
            $inv2->amount = 2500000;
            $inv2->paid_amount = 0;
            $inv2->due_date = '2026-10-10';
            $inv2->status = Invoice::STATUS_PENDING;
            $inv2->save(false);
            $log[] = "To'lov invoyslari qo'shildi.";

            // Coin
            $coinTx = new CoinTransaction();
            $coinTx->student_id = $student->id;
            $coinTx->amount = 350;
            $coinTx->type = 'award';
            $coinTx->reason = "A'lo baholar va olimpiada ishtiroki uchun";
            $coinTx->save(false);
        }

        // 10. Coin Rewards
        $rewards = [
            ['Al-Xorazmiy Smart Termos', 'Harorat datchikli zanglamas po\'lat termos (500ml)', 150],
            ['Maktab logotipli Hoodie', 'Qalin paxtali svitshot', 300],
            ['VIP Kutubxona abonementi', 'Shaxsiy tinch o\'qish zali va bepul ichimliklar', 80],
            ['Arduino Robototexnika to\'plami', 'Uyda mustaqil robot yasash uchun to\'plam', 500],
        ];

        foreach ($rewards as $rw) {
            $exRw = CoinReward::findOne(['title' => $rw[0]]);
            if (!$exRw) {
                $cr = new CoinReward();
                $cr->title = $rw[0];
                $cr->description = $rw[1];
                $cr->coin_price = $rw[2];
                $cr->stock_quantity = 25;
                $cr->status = 10;
                $cr->save(false);
            }
        }

        return [
            'success' => true,
            'message' => "Barcha test ma'lumotlari muvaffaqiyatli yuklandi!",
            'log' => $log,
        ];
    }
}
