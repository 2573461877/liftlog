// Curated and translated from Free Exercise DB (Unlicense). No runtime API requests.
// Source revision and license are retained in THIRD_PARTY_NOTICES.md.
export const CATALOG_SOURCE = Object.freeze({
  name: 'Free Exercise DB', revision: 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5',
  url: 'https://github.com/yuhonas/free-exercise-db', license: 'Unlicense', reviewedAt: '2026-10-12'
});
export const BODY_PARTS = Object.freeze({
  "chest": "胸部",
  "back": "背部",
  "shoulders": "肩部",
  "biceps": "肱二头肌",
  "triceps": "肱三头肌",
  "forearms": "前臂",
  "core": "腹部 / 核心",
  "glutes": "臀部",
  "quads": "大腿前侧",
  "hamstrings": "大腿后侧",
  "adductors": "大腿内侧",
  "calves": "小腿",
  "fullbody": "全身复合",
  "legs": "腿部（未细分）",
  "arms": "手臂（未细分）",
  "upperbody": "上肢（未细分）",
  "lowerbody": "下肢（未细分）"
});
export const EQUIPMENT = Object.freeze({
  "barbell": "杠铃",
  "dumbbell": "哑铃",
  "cable": "绳索 / 龙门架",
  "machine": "固定器械",
  "smith": "史密斯",
  "bodyweight": "徒手 / 自重",
  "bars": "单杠 / 双杠",
  "bands": "弹力带",
  "kettlebell": "壶铃",
  "ezbar": "EZ 杠 / 曲杠",
  "ball": "健身球",
  "suspension": "悬挂带 / TRX",
  "other": "其他辅助器械"
});
export const EXERCISES = Object.freeze([
  Object.freeze({"id":"Barbell_Bench_Press_-_Medium_Grip","name":"杠铃卧推","english":"Barbell Bench Press - Medium Grip","aliases":"平板卧推","parts":["chest"],"equipment":"barbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Bench_Press","name":"哑铃卧推","english":"Dumbbell Bench Press","aliases":"平板哑铃卧推","parts":["chest"],"equipment":"dumbbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Barbell_Incline_Bench_Press_-_Medium_Grip","name":"上斜杠铃卧推","english":"Barbell Incline Bench Press - Medium Grip","aliases":"","parts":["chest"],"equipment":"barbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Incline_Dumbbell_Press","name":"上斜哑铃卧推","english":"Incline Dumbbell Press","aliases":"","parts":["chest"],"equipment":"dumbbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Decline_Barbell_Bench_Press","name":"下斜杠铃卧推","english":"Decline Barbell Bench Press","aliases":"","parts":["chest"],"equipment":"barbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Decline_Dumbbell_Bench_Press","name":"下斜哑铃卧推","english":"Decline Dumbbell Bench Press","aliases":"","parts":["chest"],"equipment":"dumbbell","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Flyes","name":"哑铃飞鸟","english":"Dumbbell Flyes","aliases":"平板飞鸟","parts":["chest"],"equipment":"dumbbell","primary":["胸肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Incline_Dumbbell_Flyes","name":"上斜哑铃飞鸟","english":"Incline Dumbbell Flyes","aliases":"","parts":["chest"],"equipment":"dumbbell","primary":["胸肌"],"secondary":["肩部"],"level":"基础"}),
  Object.freeze({"id":"Cable_Crossover","name":"绳索夹胸","english":"Cable Crossover","aliases":"龙门架夹胸","parts":["chest"],"equipment":"cable","primary":["胸肌"],"secondary":["肩部"],"level":"基础"}),
  Object.freeze({"id":"Low_Cable_Crossover","name":"低位绳索夹胸","english":"Low Cable Crossover","aliases":"","parts":["chest"],"equipment":"cable","primary":["胸肌"],"secondary":["肩部"],"level":"基础"}),
  Object.freeze({"id":"Butterfly","name":"蝴蝶机夹胸","english":"Butterfly","aliases":"器械夹胸","parts":["chest"],"equipment":"machine","primary":["胸肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Machine_Bench_Press","name":"器械推胸","english":"Machine Bench Press","aliases":"坐姿推胸","parts":["chest"],"equipment":"machine","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Leverage_Incline_Chest_Press","name":"器械上斜推胸","english":"Leverage Incline Chest Press","aliases":"","parts":["chest"],"equipment":"machine","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Smith_Machine_Bench_Press","name":"史密斯卧推","english":"Smith Machine Bench Press","aliases":"","parts":["chest"],"equipment":"smith","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Smith_Machine_Incline_Bench_Press","name":"史密斯上斜卧推","english":"Smith Machine Incline Bench Press","aliases":"","parts":["chest"],"equipment":"smith","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Pushups","name":"俯卧撑","english":"Pushups","aliases":"标准俯卧撑","parts":["chest"],"equipment":"bodyweight","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Incline_Push-Up","name":"上斜俯卧撑","english":"Incline Push-Up","aliases":"高位俯卧撑","parts":["chest"],"equipment":"bodyweight","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Push-Ups_With_Feet_Elevated","name":"下斜俯卧撑","english":"Push-Ups With Feet Elevated","aliases":"脚抬高俯卧撑","parts":["chest"],"equipment":"bodyweight","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Dips_-_Chest_Version","name":"双杠臂屈伸（胸部）","english":"Dips - Chest Version","aliases":"","parts":["chest"],"equipment":"bars","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"进阶"}),
  Object.freeze({"id":"Suspended_Push-Up","name":"悬挂俯卧撑","english":"Suspended Push-Up","aliases":"TRX俯卧撑","parts":["chest"],"equipment":"suspension","primary":["胸肌"],"secondary":["肩部","肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Wide-Grip_Lat_Pulldown","name":"高位下拉","english":"Wide-Grip Lat Pulldown","aliases":"宽握下拉","parts":["back"],"equipment":"cable","primary":["背阔肌"],"secondary":["肱二头肌","中背部","肩部"],"level":"基础"}),
  Object.freeze({"id":"Close-Grip_Front_Lat_Pulldown","name":"窄握高位下拉","english":"Close-Grip Front Lat Pulldown","aliases":"","parts":["back"],"equipment":"cable","primary":["背阔肌"],"secondary":["肱二头肌","中背部","肩部"],"level":"基础"}),
  Object.freeze({"id":"Underhand_Cable_Pulldowns","name":"反握高位下拉","english":"Underhand Cable Pulldowns","aliases":"","parts":["back"],"equipment":"cable","primary":["背阔肌"],"secondary":["肱二头肌","中背部","肩部"],"level":"基础"}),
  Object.freeze({"id":"One_Arm_Lat_Pulldown","name":"单臂高位下拉","english":"One Arm Lat Pulldown","aliases":"","parts":["back"],"equipment":"cable","primary":["背阔肌"],"secondary":["肱二头肌","中背部"],"level":"基础"}),
  Object.freeze({"id":"Pullups","name":"引体向上","english":"Pullups","aliases":"正握引体","parts":["back"],"equipment":"bars","primary":["背阔肌"],"secondary":["肱二头肌","中背部"],"level":"基础"}),
  Object.freeze({"id":"Chin-Up","name":"反手引体向上","english":"Chin-Up","aliases":"反握引体","parts":["back"],"equipment":"bars","primary":["背阔肌"],"secondary":["肱二头肌","前臂","中背部"],"level":"基础"}),
  Object.freeze({"id":"Seated_Cable_Rows","name":"坐姿划船","english":"Seated Cable Rows","aliases":"坐姿绳索划船","parts":["back"],"equipment":"cable","primary":["中背部"],"secondary":["肱二头肌","背阔肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Bent_Over_Barbell_Row","name":"杠铃划船","english":"Bent Over Barbell Row","aliases":"俯身杠铃划船","parts":["back"],"equipment":"barbell","primary":["中背部"],"secondary":["肱二头肌","背阔肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Reverse_Grip_Bent-Over_Rows","name":"反握杠铃划船","english":"Reverse Grip Bent-Over Rows","aliases":"","parts":["back"],"equipment":"barbell","primary":["中背部"],"secondary":["肱二头肌","背阔肌","肩部"],"level":"进阶"}),
  Object.freeze({"id":"One-Arm_Dumbbell_Row","name":"单臂哑铃划船","english":"One-Arm Dumbbell Row","aliases":"","parts":["back"],"equipment":"dumbbell","primary":["中背部"],"secondary":["肱二头肌","背阔肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Incline_Row","name":"上斜凳哑铃划船","english":"Dumbbell Incline Row","aliases":"胸托哑铃划船","parts":["back"],"equipment":"dumbbell","primary":["中背部"],"secondary":["肱二头肌","前臂","背阔肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"T-Bar_Row_with_Handle","name":"T杠划船","english":"T-Bar Row with Handle","aliases":"T杆划船 地雷杆划船","parts":["back"],"equipment":"barbell","primary":["中背部"],"secondary":["肱二头肌","背阔肌"],"level":"基础"}),
  Object.freeze({"id":"Lying_T-Bar_Row","name":"胸托T杠划船","english":"Lying T-Bar Row","aliases":"","parts":["back"],"equipment":"machine","primary":["中背部"],"secondary":["肱二头肌","背阔肌"],"level":"进阶"}),
  Object.freeze({"id":"Leverage_High_Row","name":"器械高位划船","english":"Leverage High Row","aliases":"","parts":["back"],"equipment":"machine","primary":["中背部"],"secondary":["背阔肌"],"level":"基础"}),
  Object.freeze({"id":"Smith_Machine_Bent_Over_Row","name":"史密斯划船","english":"Smith Machine Bent Over Row","aliases":"","parts":["back"],"equipment":"smith","primary":["中背部"],"secondary":["肱二头肌","背阔肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Straight-Arm_Pulldown","name":"直臂下拉","english":"Straight-Arm Pulldown","aliases":"绳索直臂下压","parts":["back"],"equipment":"cable","primary":["背阔肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Inverted_Row","name":"反向划船","english":"Inverted Row","aliases":"澳式引体","parts":["back"],"equipment":"bars","primary":["中背部"],"secondary":["背阔肌"],"level":"基础"}),
  Object.freeze({"id":"Suspended_Row","name":"悬挂划船","english":"Suspended Row","aliases":"TRX划船","parts":["back"],"equipment":"suspension","primary":["中背部"],"secondary":["肱二头肌","背阔肌"],"level":"基础"}),
  Object.freeze({"id":"Barbell_Shrug","name":"杠铃耸肩","english":"Barbell Shrug","aliases":"","parts":["back"],"equipment":"barbell","primary":["斜方肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Shrug","name":"哑铃耸肩","english":"Dumbbell Shrug","aliases":"","parts":["back"],"equipment":"dumbbell","primary":["斜方肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Hyperextensions_Back_Extensions","name":"背部挺身","english":"Hyperextensions (Back Extensions)","aliases":"山羊挺身 罗马椅","parts":["back"],"equipment":"other","primary":["下背部"],"secondary":["臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Barbell_Deadlift","name":"杠铃硬拉","english":"Barbell Deadlift","aliases":"传统硬拉","parts":["back"],"equipment":"barbell","primary":["下背部"],"secondary":["小腿肌群","前臂","臀肌","腘绳肌","背阔肌","中背部","股四头肌","斜方肌"],"level":"进阶"}),
  Object.freeze({"id":"Dumbbell_Shoulder_Press","name":"哑铃推举","english":"Dumbbell Shoulder Press","aliases":"肩推 哑铃肩上推举","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":["肱三头肌"],"level":"进阶"}),
  Object.freeze({"id":"Seated_Barbell_Military_Press","name":"坐姿杠铃推举","english":"Seated Barbell Military Press","aliases":"坐姿肩推","parts":["shoulders"],"equipment":"barbell","primary":["肩部"],"secondary":["肱三头肌"],"level":"进阶"}),
  Object.freeze({"id":"Standing_Military_Press","name":"站姿杠铃推举","english":"Standing Military Press","aliases":"实力举 OHP","parts":["shoulders"],"equipment":"barbell","primary":["肩部"],"secondary":["肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Arnold_Dumbbell_Press","name":"阿诺德推举","english":"Arnold Dumbbell Press","aliases":"阿诺德肩推","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":["肱三头肌"],"level":"进阶"}),
  Object.freeze({"id":"Side_Lateral_Raise","name":"哑铃侧平举","english":"Side Lateral Raise","aliases":"","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Seated_Side_Lateral_Raise","name":"坐姿哑铃侧平举","english":"Seated Side Lateral Raise","aliases":"","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Low-Pulley_Deltoid_Raise","name":"单臂绳索侧平举","english":"Standing Low-Pulley Deltoid Raise","aliases":"","parts":["shoulders"],"equipment":"cable","primary":["肩部"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Front_Dumbbell_Raise","name":"哑铃前平举","english":"Front Dumbbell Raise","aliases":"","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Reverse_Flyes","name":"反向飞鸟","english":"Reverse Flyes","aliases":"俯身哑铃飞鸟 后束飞鸟","parts":["shoulders"],"equipment":"dumbbell","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Reverse_Machine_Flyes","name":"器械反向飞鸟","english":"Reverse Machine Flyes","aliases":"反向蝴蝶机 后束","parts":["shoulders"],"equipment":"machine","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Cable_Rear_Delt_Fly","name":"绳索反向飞鸟","english":"Cable Rear Delt Fly","aliases":"绳索后束飞鸟","parts":["shoulders"],"equipment":"cable","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Face_Pull","name":"绳索面拉","english":"Face Pull","aliases":"面拉","parts":["shoulders"],"equipment":"cable","primary":["肩部"],"secondary":["中背部"],"level":"进阶"}),
  Object.freeze({"id":"Machine_Shoulder_Military_Press","name":"器械推肩","english":"Machine Shoulder (Military) Press","aliases":"固定器械肩推","parts":["shoulders"],"equipment":"machine","primary":["肩部"],"secondary":["肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Smith_Machine_Overhead_Shoulder_Press","name":"史密斯推肩","english":"Smith Machine Overhead Shoulder Press","aliases":"","parts":["shoulders"],"equipment":"smith","primary":["肩部"],"secondary":["肱三头肌"],"level":"基础"}),
  Object.freeze({"id":"Band_Pull_Apart","name":"弹力带拉开","english":"Band Pull Apart","aliases":"弹力带肩部拉开","parts":["shoulders"],"equipment":"bands","primary":["肩部"],"secondary":["中背部","斜方肌"],"level":"基础"}),
  Object.freeze({"id":"Lateral_Raise_-_With_Bands","name":"弹力带侧平举","english":"Lateral Raise - With Bands","aliases":"","parts":["shoulders"],"equipment":"bands","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"External_Rotation_with_Band","name":"弹力带肩外旋","english":"External Rotation with Band","aliases":"","parts":["shoulders"],"equipment":"bands","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"External_Rotation_with_Cable","name":"绳索肩外旋","english":"External Rotation with Cable","aliases":"","parts":["shoulders"],"equipment":"cable","primary":["肩部"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Barbell_Curl","name":"杠铃弯举","english":"Barbell Curl","aliases":"","parts":["biceps"],"equipment":"barbell","primary":["肱二头肌"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Bicep_Curl","name":"哑铃弯举","english":"Dumbbell Bicep Curl","aliases":"","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Alternate_Bicep_Curl","name":"交替哑铃弯举","english":"Dumbbell Alternate Bicep Curl","aliases":"","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Hammer_Curls","name":"锤式弯举","english":"Hammer Curls","aliases":"哑铃锤式弯举","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"EZ-Bar_Curl","name":"EZ杠弯举","english":"EZ-Bar Curl","aliases":"曲杆弯举 曲杠弯举","parts":["biceps"],"equipment":"ezbar","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Incline_Dumbbell_Curl","name":"上斜哑铃弯举","english":"Incline Dumbbell Curl","aliases":"","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Concentration_Curls","name":"集中弯举","english":"Concentration Curls","aliases":"集中哑铃弯举","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Preacher_Curl","name":"牧师凳弯举","english":"Preacher Curl","aliases":"托臂弯举","parts":["biceps"],"equipment":"barbell","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Machine_Preacher_Curls","name":"器械牧师凳弯举","english":"Machine Preacher Curls","aliases":"","parts":["biceps"],"equipment":"machine","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Biceps_Cable_Curl","name":"绳索弯举","english":"Standing Biceps Cable Curl","aliases":"","parts":["biceps"],"equipment":"cable","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Cable_Hammer_Curls_-_Rope_Attachment","name":"绳索锤式弯举","english":"Cable Hammer Curls - Rope Attachment","aliases":"","parts":["biceps"],"equipment":"cable","primary":["肱二头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Zottman_Curl","name":"佐特曼弯举","english":"Zottman Curl","aliases":"","parts":["biceps"],"equipment":"dumbbell","primary":["肱二头肌"],"secondary":["前臂"],"level":"进阶"}),
  Object.freeze({"id":"Triceps_Pushdown_-_Rope_Attachment","name":"绳索下压","english":"Triceps Pushdown - Rope Attachment","aliases":"绳索臂屈伸 三头下压","parts":["triceps"],"equipment":"cable","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Triceps_Pushdown","name":"直杆下压","english":"Triceps Pushdown","aliases":"直杆三头下压","parts":["triceps"],"equipment":"cable","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Cable_Rope_Overhead_Triceps_Extension","name":"绳索过顶臂屈伸","english":"Cable Rope Overhead Triceps Extension","aliases":"","parts":["triceps"],"equipment":"cable","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Dumbbell_Triceps_Extension","name":"哑铃过顶臂屈伸","english":"Standing Dumbbell Triceps Extension","aliases":"","parts":["triceps"],"equipment":"dumbbell","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"EZ-Bar_Skullcrusher","name":"EZ杠仰卧臂屈伸","english":"EZ-Bar Skullcrusher","aliases":"碎颅者 仰卧曲杠臂屈伸","parts":["triceps"],"equipment":"ezbar","primary":["肱三头肌"],"secondary":["前臂"],"level":"基础"}),
  Object.freeze({"id":"Close-Grip_Barbell_Bench_Press","name":"窄握杠铃卧推","english":"Close-Grip Barbell Bench Press","aliases":"","parts":["triceps"],"equipment":"barbell","primary":["肱三头肌"],"secondary":["胸肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Tricep_Dumbbell_Kickback","name":"哑铃后踢","english":"Tricep Dumbbell Kickback","aliases":"哑铃俯身臂屈伸","parts":["triceps"],"equipment":"dumbbell","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Machine_Triceps_Extension","name":"器械臂屈伸","english":"Machine Triceps Extension","aliases":"","parts":["triceps"],"equipment":"machine","primary":["肱三头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Dips_-_Triceps_Version","name":"双杠臂屈伸（三头）","english":"Dips - Triceps Version","aliases":"","parts":["triceps"],"equipment":"bars","primary":["肱三头肌"],"secondary":["胸肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Push-Ups_-_Close_Triceps_Position","name":"窄距俯卧撑","english":"Push-Ups - Close Triceps Position","aliases":"窄握俯卧撑","parts":["triceps"],"equipment":"bodyweight","primary":["肱三头肌"],"secondary":["胸肌","肩部"],"level":"进阶"}),
  Object.freeze({"id":"Palms-Up_Barbell_Wrist_Curl_Over_A_Bench","name":"杠铃腕弯举","english":"Palms-Up Barbell Wrist Curl Over A Bench","aliases":"","parts":["forearms"],"equipment":"barbell","primary":["前臂"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Palms-Down_Wrist_Curl_Over_A_Bench","name":"杠铃反向腕弯举","english":"Palms-Down Wrist Curl Over A Bench","aliases":"","parts":["forearms"],"equipment":"barbell","primary":["前臂"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench","name":"哑铃腕弯举","english":"Palms-Up Dumbbell Wrist Curl Over A Bench","aliases":"","parts":["forearms"],"equipment":"dumbbell","primary":["前臂"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench","name":"哑铃反向腕弯举","english":"Palms-Down Dumbbell Wrist Curl Over A Bench","aliases":"","parts":["forearms"],"equipment":"dumbbell","primary":["前臂"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Barbell_Squat","name":"杠铃深蹲","english":"Barbell Squat","aliases":"后蹲","parts":["quads"],"equipment":"barbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌","下背部"],"level":"基础"}),
  Object.freeze({"id":"Front_Barbell_Squat","name":"颈前深蹲","english":"Front Barbell Squat","aliases":"前蹲 杠铃前蹲","parts":["quads"],"equipment":"barbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"高阶"}),
  Object.freeze({"id":"Goblet_Squat","name":"高脚杯深蹲","english":"Goblet Squat","aliases":"壶铃深蹲","parts":["quads"],"equipment":"kettlebell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌","肩部"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Squat","name":"哑铃深蹲","english":"Dumbbell Squat","aliases":"","parts":["quads"],"equipment":"dumbbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌","下背部"],"level":"基础"}),
  Object.freeze({"id":"Bodyweight_Squat","name":"徒手深蹲","english":"Bodyweight Squat","aliases":"自重深蹲","parts":["quads"],"equipment":"bodyweight","primary":["股四头肌"],"secondary":["臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Leg_Press","name":"腿举","english":"Leg Press","aliases":"倒蹬","parts":["quads"],"equipment":"machine","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Hack_Squat","name":"哈克深蹲","english":"Hack Squat","aliases":"哈克机深蹲","parts":["quads"],"equipment":"machine","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Smith_Machine_Squat","name":"史密斯深蹲","english":"Smith Machine Squat","aliases":"","parts":["quads"],"equipment":"smith","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌","下背部"],"level":"基础"}),
  Object.freeze({"id":"Leg_Extensions","name":"腿屈伸","english":"Leg Extensions","aliases":"坐姿腿屈伸","parts":["quads"],"equipment":"machine","primary":["股四头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Single-Leg_Leg_Extension","name":"单腿腿屈伸","english":"Single-Leg Leg Extension","aliases":"","parts":["quads"],"equipment":"machine","primary":["股四头肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Barbell_Lunge","name":"杠铃弓步蹲","english":"Barbell Lunge","aliases":"箭步蹲","parts":["quads"],"equipment":"barbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Dumbbell_Lunges","name":"哑铃弓步蹲","english":"Dumbbell Lunges","aliases":"哑铃箭步蹲","parts":["quads"],"equipment":"dumbbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Rear_Lunge","name":"哑铃后撤弓步蹲","english":"Dumbbell Rear Lunge","aliases":"","parts":["quads"],"equipment":"dumbbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Split_Squat_with_Dumbbells","name":"哑铃保加利亚分腿蹲","english":"Split Squat with Dumbbells","aliases":"保加利亚深蹲","parts":["quads"],"equipment":"dumbbell","primary":["股四头肌"],"secondary":["臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Step_Ups","name":"哑铃上台阶","english":"Dumbbell Step Ups","aliases":"哑铃登阶","parts":["quads"],"equipment":"dumbbell","primary":["股四头肌"],"secondary":["小腿肌群","臀肌","腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Romanian_Deadlift","name":"罗马尼亚硬拉","english":"Romanian Deadlift","aliases":"RDL","parts":["hamstrings"],"equipment":"barbell","primary":["腘绳肌"],"secondary":["小腿肌群","臀肌","下背部"],"level":"进阶"}),
  Object.freeze({"id":"Stiff-Legged_Dumbbell_Deadlift","name":"哑铃直腿硬拉","english":"Stiff-Legged Dumbbell Deadlift","aliases":"","parts":["hamstrings"],"equipment":"dumbbell","primary":["腘绳肌"],"secondary":["臀肌","下背部"],"level":"基础"}),
  Object.freeze({"id":"Lying_Leg_Curls","name":"俯卧腿弯举","english":"Lying Leg Curls","aliases":"","parts":["hamstrings"],"equipment":"machine","primary":["腘绳肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Seated_Leg_Curl","name":"坐姿腿弯举","english":"Seated Leg Curl","aliases":"","parts":["hamstrings"],"equipment":"machine","primary":["腘绳肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Leg_Curl","name":"站姿腿弯举","english":"Standing Leg Curl","aliases":"","parts":["hamstrings"],"equipment":"machine","primary":["腘绳肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Ball_Leg_Curl","name":"健身球腿弯举","english":"Ball Leg Curl","aliases":"","parts":["hamstrings"],"equipment":"ball","primary":["腘绳肌"],"secondary":["小腿肌群","臀肌"],"level":"基础"}),
  Object.freeze({"id":"Kettlebell_One-Legged_Deadlift","name":"单腿壶铃硬拉","english":"Kettlebell One-Legged Deadlift","aliases":"","parts":["hamstrings"],"equipment":"kettlebell","primary":["腘绳肌"],"secondary":["臀肌","下背部"],"level":"进阶"}),
  Object.freeze({"id":"Butt_Lift_Bridge","name":"臀桥","english":"Butt Lift (Bridge)","aliases":"自重臀桥","parts":["glutes"],"equipment":"bodyweight","primary":["臀肌"],"secondary":["腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Single_Leg_Glute_Bridge","name":"单腿臀桥","english":"Single Leg Glute Bridge","aliases":"","parts":["glutes"],"equipment":"bodyweight","primary":["臀肌"],"secondary":["腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"One-Legged_Cable_Kickback","name":"绳索后踢腿","english":"One-Legged Cable Kickback","aliases":"绳索臀后踢","parts":["glutes"],"equipment":"cable","primary":["臀肌"],"secondary":["腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Pull_Through","name":"绳索胯下拉","english":"Pull Through","aliases":"绳索拉臀","parts":["glutes"],"equipment":"cable","primary":["臀肌"],"secondary":["腘绳肌","下背部"],"level":"基础"}),
  Object.freeze({"id":"Hip_Extension_with_Bands","name":"弹力带髋伸展","english":"Hip Extension with Bands","aliases":"弹力带后踢腿","parts":["glutes"],"equipment":"bands","primary":["臀肌"],"secondary":["腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Thigh_Abductor","name":"器械髋外展","english":"Thigh Abductor","aliases":"坐姿髋外展 臀外展","parts":["glutes"],"equipment":"machine","primary":["髋外展肌"],"secondary":["臀肌"],"level":"基础"}),
  Object.freeze({"id":"Thigh_Adductor","name":"器械髋内收","english":"Thigh Adductor","aliases":"坐姿夹腿 内收肌","parts":["adductors"],"equipment":"machine","primary":["髋内收肌"],"secondary":["臀肌","腘绳肌"],"level":"基础"}),
  Object.freeze({"id":"Band_Hip_Adductions","name":"弹力带髋内收","english":"Band Hip Adductions","aliases":"","parts":["adductors"],"equipment":"bands","primary":["髋内收肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Calf_Raises","name":"站姿提踵","english":"Standing Calf Raises","aliases":"器械站姿提踵","parts":["calves"],"equipment":"machine","primary":["小腿肌群"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Seated_Calf_Raise","name":"坐姿提踵","english":"Seated Calf Raise","aliases":"","parts":["calves"],"equipment":"machine","primary":["小腿肌群"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Calf_Press_On_The_Leg_Press_Machine","name":"腿举机提踵","english":"Calf Press On The Leg Press Machine","aliases":"","parts":["calves"],"equipment":"machine","primary":["小腿肌群"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Dumbbell_Calf_Raise","name":"哑铃站姿提踵","english":"Standing Dumbbell Calf Raise","aliases":"","parts":["calves"],"equipment":"dumbbell","primary":["小腿肌群"],"secondary":[],"level":"进阶"}),
  Object.freeze({"id":"Smith_Machine_Calf_Raise","name":"史密斯提踵","english":"Smith Machine Calf Raise","aliases":"","parts":["calves"],"equipment":"smith","primary":["小腿肌群"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Crunches","name":"卷腹","english":"Crunches","aliases":"仰卧卷腹","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Reverse_Crunch","name":"反向卷腹","english":"Reverse Crunch","aliases":"","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Cable_Crunch","name":"绳索卷腹","english":"Cable Crunch","aliases":"跪姿绳索卷腹","parts":["core"],"equipment":"cable","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Ab_Crunch_Machine","name":"器械卷腹","english":"Ab Crunch Machine","aliases":"","parts":["core"],"equipment":"machine","primary":["腹肌"],"secondary":[],"level":"进阶"}),
  Object.freeze({"id":"Hanging_Leg_Raise","name":"悬垂举腿","english":"Hanging Leg Raise","aliases":"","parts":["core"],"equipment":"bars","primary":["腹肌"],"secondary":[],"level":"高阶"}),
  Object.freeze({"id":"Knee_Hip_Raise_On_Parallel_Bars","name":"双杠举膝","english":"Knee/Hip Raise On Parallel Bars","aliases":"","parts":["core"],"equipment":"bars","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Flat_Bench_Lying_Leg_Raise","name":"仰卧举腿","english":"Flat Bench Lying Leg Raise","aliases":"平凳举腿","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Air_Bike","name":"空中自行车","english":"Air Bike","aliases":"自行车卷腹","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Dead_Bug","name":"死虫式","english":"Dead Bug","aliases":"","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Russian_Twist","name":"俄罗斯转体","english":"Russian Twist","aliases":"","parts":["core"],"equipment":"bodyweight","primary":["腹肌"],"secondary":["下背部"],"level":"进阶"}),
  Object.freeze({"id":"Ab_Roller","name":"健腹轮卷出","english":"Ab Roller","aliases":"腹肌轮","parts":["core"],"equipment":"other","primary":["腹肌"],"secondary":["肩部"],"level":"进阶"}),
  Object.freeze({"id":"Exercise_Ball_Crunch","name":"健身球卷腹","english":"Exercise Ball Crunch","aliases":"","parts":["core"],"equipment":"ball","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Standing_Cable_Wood_Chop","name":"绳索伐木","english":"Standing Cable Wood Chop","aliases":"绳索转体","parts":["core"],"equipment":"cable","primary":["腹肌"],"secondary":["肩部"],"level":"基础"}),
  Object.freeze({"id":"Dumbbell_Side_Bend","name":"哑铃侧屈","english":"Dumbbell Side Bend","aliases":"","parts":["core"],"equipment":"dumbbell","primary":["腹肌"],"secondary":[],"level":"基础"}),
  Object.freeze({"id":"Kettlebell_Thruster","name":"壶铃深蹲推举","english":"Kettlebell Thruster","aliases":"壶铃火箭推","parts":["shoulders","fullbody"],"equipment":"kettlebell","primary":["肩部"],"secondary":["股四头肌","肱三头肌"],"level":"进阶"}),
  Object.freeze({"id":"One-Arm_Kettlebell_Swings","name":"单臂壶铃摆荡","english":"One-Arm Kettlebell Swings","aliases":"壶铃摇摆","parts":["hamstrings","fullbody"],"equipment":"kettlebell","primary":["腘绳肌"],"secondary":["小腿肌群","臀肌","下背部","肩部"],"level":"进阶"}),
  Object.freeze({"id":"Barbell_Hip_Thrust","name":"杠铃臀推","english":"Barbell Hip Thrust","aliases":"臀推","parts":["glutes"],"equipment":"barbell","primary":["臀肌"],"secondary":["小腿肌群","腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Barbell_Glute_Bridge","name":"杠铃臀桥","english":"Barbell Glute Bridge","aliases":"负重臀桥","parts":["glutes"],"equipment":"barbell","primary":["臀肌"],"secondary":["小腿肌群","腘绳肌"],"level":"进阶"}),
  Object.freeze({"id":"Sumo_Deadlift","name":"相扑硬拉","english":"Sumo Deadlift","aliases":"宽站距硬拉","parts":["hamstrings"],"equipment":"barbell","primary":["腘绳肌"],"secondary":["髋内收肌","前臂","臀肌","下背部","中背部","股四头肌","斜方肌"],"level":"进阶"}),
]);
const normalized = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[-_／/（）()]/g, ' ').replace(/\s+/g, ' ').trim();
const searchable = new Map(EXERCISES.map(e => [e.id, normalized([e.name,e.english,e.aliases,...e.primary,...e.secondary,EQUIPMENT[e.equipment],...e.parts.map(p=>BODY_PARTS[p])].join(' '))]));
// Filters are ANDed. Body filter describes primary targets, not every assisting muscle.
export function filterExercises({query='',part='',equipment=''}={}, catalog=EXERCISES) {
  const tokens=normalized(query).split(' ').filter(Boolean);
  const broader={legs:['legs','quads','hamstrings','adductors','calves'],arms:['arms','biceps','triceps','forearms'],upperbody:['upperbody','chest','back','shoulders','arms','biceps','triceps','forearms'],lowerbody:['lowerbody','legs','glutes','quads','hamstrings','adductors','calves']};
  return catalog.filter(e => (!part || e.parts.some(p=>(broader[part]||[part]).includes(p))) && (!equipment || e.equipment===equipment) && tokens.every(t=>(searchable.get(e.id)||normalized([e.name,e.english,e.aliases,...e.primary,...e.secondary,EQUIPMENT[e.equipment],...e.parts.map(p=>BODY_PARTS[p])].join(' '))).includes(t)));
}

// Local suggestions, not an anatomical diagnosis. Explicit names win over plan labels.
export function inferExerciseTags(name,group='') {
  const equipmentRules=[['smith',/史密斯|smith/i],['ezbar',/曲[杠杆]|ez[ -]?(bar|杠)?/i],['bands',/弹力带|阻力带|resistance.?band/i],['suspension',/悬挂|trx/i],['cable',/绳索|龙门架|滑轮|拉力器|cable/i],['dumbbell',/哑铃|dumbbell/i],['kettlebell',/壶铃|kettlebell/i],['barbell',/杠铃|barbell/i],['ball',/健身球|瑞士球|瑜伽球/],['machine',/器械|固定器材|哈克|蝴蝶机|推胸机|腿举机|machine/i],['bars',/单杠|双杠|引体/],['bodyweight',/自重|徒手|俯卧撑/]];
  const partRules=[['hamstrings',/腿弯举|腘绳|罗马尼亚|直腿硬拉/],['forearms',/前臂|腕弯举|腕屈|腕伸/],['calves',/提踵|小腿/],['adductors',/夹腿|内收/],['glutes',/臀|髋外展/],['quads',/腿屈伸|伸腿|腿举|深蹲|股四头/],['biceps',/二头|弯举/],['triceps',/三头|臂屈伸|下压/],['core',/卷腹|举腿|腹|核心/],['shoulders',/反向飞鸟|侧平举|肩|推举/],['chest',/卧推|推胸|夹胸|胸|飞鸟/],['back',/划船|下拉|引体|背/]];
  const groups={'胸':'chest','背':'back','肩':'shoulders','腿':'legs','手臂':'arms','核心':'core','臀':'glutes','小腿':'calves','上肢':'upperbody','下肢':'lowerbody','全身':'fullbody'};
  const part=partRules.find(([,r])=>r.test(name))?.[0]||groups[group];
  return {equipment:equipmentRules.find(([,r])=>r.test(name))?.[0]||'other',parts:part?[part]:[]};
}
export function registerCustomExercise(state,name,group,makeId,tags=null) {
  name=name.trim();if(!name||EXERCISES.some(e=>e.name===name))return false;
  state.customExercises ||= [];
  const existing=state.customExercises.find(e=>e.name===name);
  if(existing){if(!tags)return false;Object.assign(existing,{equipment:tags.equipment,parts:[...tags.parts],tagSource:tags.tagSource||'manual'});return true;}
  if(state.customExercises.length>=10000)return false;
  const inferred=tags||inferExerciseTags(name,group);
  state.customExercises.push({id:makeId(),name,equipment:inferred.equipment,parts:[...inferred.parts],tagSource:tags?.tagSource||'auto'});return true;
}
export function syncCustomExercises(state,makeId) {
  let changed=false;
  // Prefer the latest use when upgrading an old library, then unfinished plans.
  for(const context of [state.active,...[...state.history].sort((a,b)=>b.finishedAt-a.finishedAt),...state.templates].filter(Boolean))
    for(const e of context.exercises)changed=registerCustomExercise(state,e.name,context.group,makeId)||changed;
  return changed;
}
export function customCatalog(state) {
  return (state.customExercises||[]).map(e=>({id:`custom-${encodeURIComponent(e.id)}`,name:e.name,english:'',aliases:'',equipment:e.equipment,parts:e.parts,primary:e.parts.map(p=>BODY_PARTS[p]),secondary:[],level:e.tagSource==='manual'?'自定义':'自动标签'}));
}
