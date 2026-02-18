const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const students = [
  {
    name: "דניאל כהן",
    school: "תיכון הראשונים",
    grade: 'י"א',
    avatarColor: "bg-blue-100",
    points: 60,
    volunteerHours: 12,
    strongSubjects: ["אנגלית", "מדעי המחשב"],
    weakSubjects: ["היסטוריה"],
    interests: ["gaming", "sport"],
  },
  {
    name: "רועי כהן",
    school: "תיכון הראשונים",
    grade: "י'",
    avatarColor: "bg-blue-100",
    points: 30,
    volunteerHours: 8,
    strongSubjects: ["היסטוריה", "אזרחות"],
    weakSubjects: ['מתמטיקה 5 יח"ל'],
    interests: ["gaming", "sport"],
  },
  {
    name: "נועה לוי",
    school: "תיכון בן גוריון",
    grade: 'י"א',
    avatarColor: "bg-purple-100",
    points: 120,
    volunteerHours: 42,
    strongSubjects: ["היסטוריה", "ספרות"],
    weakSubjects: ["אנגלית"],
    interests: ["music", "travel"],
  },
  {
    name: "עומר יוסף",
    school: "תיכון הראשונים",
    grade: "י'",
    avatarColor: "bg-orange-100",
    points: 95,
    volunteerHours: 35,
    strongSubjects: ['מתמטיקה 5 יח"ל', "פיזיקה", "מדעי המחשב"],
    weakSubjects: ["היסטוריה", 'תנ"ך'],
    interests: ["sport", "gaming"],
  },
  {
    name: "מיכאל אבני",
    school: "תיכון הרצל",
    grade: 'י"ב',
    avatarColor: "bg-green-100",
    points: 30,
    volunteerHours: 8,
    strongSubjects: ['מתמטיקה 5 יח"ל', "כימיה"],
    weakSubjects: ["לשון"],
    interests: ["gaming"],
  },
  {
    name: "דנה פרידמן",
    school: "תיכון בגין",
    grade: 'י"ב',
    avatarColor: "bg-red-100",
    points: 45,
    volunteerHours: 10,
    strongSubjects: ["אנגלית", "צרפתית"],
    weakSubjects: ['מתמטיקה 3 יח"ל'],
    interests: ["travel", "music"],
  },
  {
    name: "שירה גולן",
    school: "תיכון הראשונים",
    grade: "י'",
    avatarColor: "bg-yellow-100",
    points: 45,
    volunteerHours: 10,
    strongSubjects: ["ערבית", "לשון"],
    weakSubjects: ["פיזיקה"],
    interests: ["music"],
  },
  {
    name: "רונית שחר",
    school: "תיכון רבין",
    grade: 'י"א',
    avatarColor: "bg-teal-100",
    points: 20,
    volunteerHours: 5,
    strongSubjects: ["גיאוגרפיה", 'תנ"ך'],
    weakSubjects: ['מתמטיקה 4 יח"ל'],
    interests: ["travel", "sport"],
  },
  {
    name: "דניאל גל",
    school: "תיכון הרצל",
    grade: 'י"ב',
    avatarColor: "bg-indigo-100",
    points: 15,
    volunteerHours: 3,
    strongSubjects: ["ביולוגיה", "כימיה"],
    weakSubjects: ["ספרות"],
    interests: ["gaming", "sport"],
  },
  {
    name: "יעל כהן",
    school: "תיכון רבין",
    grade: "י'",
    avatarColor: "bg-pink-100",
    points: 10,
    volunteerHours: 2,
    strongSubjects: ["אומנות"],
    weakSubjects: ["היסטוריה", "לשון", "גיאוגרפיה"],
    interests: ["travel"],
  },
];

const rewards = [
  { name: "משולש פיצה", cost: 40, icon: "🍕", color: "bg-orange-100 text-orange-600" },
  { name: "כרטיס לקולנוע", cost: 100, icon: "🎬", color: "bg-purple-100 text-purple-600" },
  { name: "שובר לגלידה", cost: 80, icon: "🍦", color: "bg-pink-100 text-pink-600" },
  { name: "בונוס 5 נק׳ במבחן", cost: 500, icon: "💯", color: "bg-blue-100 text-blue-600" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.safetyReport.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.message.deleteMany();
  await prisma.threadParticipant.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.session.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const createdUsers = [];
  for (const student of students) {
    const user = await prisma.user.create({ data: student });
    createdUsers.push(user);
  }

  console.log(`✅ Created ${createdUsers.length} users`);

  // Find specific users for seed posts
  const noaUser = createdUsers.find((u) => u.name === "נועה לוי");
  const omerUser = createdUsers.find((u) => u.name === "עומר יוסף");
  const michaelUser = createdUsers.find((u) => u.name === "מיכאל אבני");
  const shiraUser = createdUsers.find((u) => u.name === "שירה גולן");

  // Create seed posts
  const posts = [
    {
      authorId: noaUser.id,
      text: "מישהו מבין איך לגשת לתרגיל הזה? המורה אמרה שזה יהיה במבחן...\n\nנתונה הפונקציה: f(x) = (x² - 9) / (x - 3)\n\nא. מצאו את תחום ההגדרה.\nב. האם לפונקציה יש חור? אם כן, מצאו את שיעוריו.\nג. שרטטו סקיצה של הפונקציה.",
    },
    {
      authorId: omerUser.id,
      text: "חייב עזרה בהיסטוריה! 😅\nמישהו יכול להסביר לי בקצרה את הגורמים למרד הגדול? אני מתבלבל בין הסיבות הדתיות לכלכליות.",
    },
    {
      authorId: michaelUser.id,
      text: "טיפ ללמידה לאנגלית 🇬🇧\nמצאתי אתר מטורף שמתקן לכם חיבורים (Essays) בחינם. קוראים לו Hemingway Editor. ממליץ בחום!",
    },
    {
      authorId: shiraUser.id,
      text: 'למישהו יש סיכום טוב על "בעלת הארמון"? אנחנו לומדים את זה לבגרות בספרות וחסר לי החלק על הסמליות של השעון במחזה 🕰️',
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log(`✅ Created ${posts.length} posts`);

  // Create rewards
  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }

  console.log(`✅ Created ${rewards.length} rewards`);

  // Create a sample session
  const danielUser = createdUsers.find((u) => u.name === "דניאל כהן");
  const roiUser = createdUsers.find((u) => u.name === "רועי כהן");

  if (danielUser && roiUser) {
    await prisma.session.create({
      data: {
        mentorId: danielUser.id,
        studentId: roiUser.id,
        subject: "אנגלית",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        durationMinutes: 60,
        location: "ספריית בית הספר",
        status: "SCHEDULED",
      },
    });
    console.log("✅ Created sample session");
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
