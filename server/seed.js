const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  // Check if already seeded
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount > 0) {
    console.log('数据库已有数据，跳过种子数据导入。');
    // Still seed honor wall if table is empty
    const honorCount = db.prepare('SELECT COUNT(*) as count FROM honor_wall').get().count;
    if (honorCount === 0) {
      seedHonorWall();
    }
    // Still seed users if table is empty
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      const userPasswordHash = bcrypt.hashSync('user123', 10);
      db.prepare('INSERT INTO users (username, email, password_hash, name, student_id, phone, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        'testuser', 'test@example.com', userPasswordHash, '测试用户', '20240001', '13800138000', '电子信息工程', '大二'
      );
      console.log('  ✓ 测试用户已创建 (testuser / user123)');
    }
    return;
  }

  console.log('开始导入种子数据...');

  // Admin user
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
  console.log('  ✓ 管理员账号已创建');

  // Test user
  const userPasswordHash = bcrypt.hashSync('user123', 10);
  db.prepare('INSERT INTO users (username, email, password_hash, name, student_id, phone, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    'testuser', 'test@example.com', userPasswordHash, '测试用户', '20240001', '13800138000', '电子信息工程', '大二'
  );
  console.log('  ✓ 测试用户已创建 (testuser / user123)');

  // Club info
  db.prepare(
    'INSERT INTO club_info (name, slogan, description, founded_date, stats_members, stats_awards, stats_events, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    '智赛宏芯社',
    '芯怀梦想，智创未来',
    '智赛宏芯社是一个专注于芯片设计与智能硬件创新的科技社团，致力于为对集成电路、嵌入式系统、FPGA等方向感兴趣的同学提供学习、实践和交流的平台。社团定期组织技术培训、项目实践和竞赛辅导，助力成员在各类科技竞赛中取得优异成绩。',
    '2020-09',
    128,
    45,
    32,
    'zhisai@example.com'
  );
  console.log('  ✓ 社团信息已创建');

  // Core members
  const membersData = [
    {
      name: '张明远',
      role: '社长',
      department: '技术部',
      avatar: '',
      bio: '电子信息工程专业大三学生，主攻数字IC设计方向。曾获全国大学生电子设计竞赛国家一等奖，集成电路创新创业大赛赛区特等奖。负责社团整体规划与技术指导，带领团队完成多个芯片设计项目。',
      sort_order: 1
    },
    {
      name: '李思涵',
      role: '副社长',
      department: '竞赛部',
      avatar: '',
      bio: '微电子科学与工程专业大三学生，擅长模拟IC设计和版图绘制。获得"挑战杯"省级金奖，主持省级大创项目一项。负责竞赛组织、团队培训和对外联络工作。',
      sort_order: 2
    },
    {
      name: '王浩然',
      role: '技术总监',
      department: '研发部',
      avatar: '',
      bio: '计算机科学与技术专业研二学生，研究方向为AI芯片架构设计。在FPGA创新设计竞赛、嵌入式芯片设计竞赛中多次获奖。负责社团技术研发方向把控和重大项目技术攻关。',
      sort_order: 3
    }
  ];

  const insertMember = db.prepare(
    'INSERT INTO core_members (name, role, department, avatar, bio, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const m of membersData) {
    insertMember.run(m.name, m.role, m.department, m.avatar, m.bio, m.sort_order);
  }
  console.log('  ✓ 核心成员已创建（3人）');

  // Timeline
  const timelineData = [
    { year: '2020', title: '社团成立', description: '智赛宏芯社正式成立，首批成员15人，设立技术部和竞赛部两个部门。', sort_order: 1 },
    { year: '2021', title: '首次参赛获奖', description: '社团成员首次参加省级电子设计竞赛，获得二等奖2项、三等奖3项，实现零的突破。', sort_order: 2 },
    { year: '2022', title: '获评优秀社团', description: '获评校级"优秀学生社团"称号，成员规模突破60人，新增研发部。', sort_order: 3 },
    { year: '2023', title: '国家级奖项突破', description: '在全国大学生电子设计竞赛中斩获国家级一等奖，标志着社团技术水平迈上新台阶。', sort_order: 4 },
    { year: '2024', title: '百人规模', description: '社团成员突破100人，全年获得省级以上奖项15项，成为校内最具影响力的科技社团之一。', sort_order: 5 }
  ];

  const insertTimeline = db.prepare(
    'INSERT INTO timeline (year, title, description, sort_order) VALUES (?, ?, ?, ?)'
  );
  for (const t of timelineData) {
    insertTimeline.run(t.year, t.title, t.description, t.sort_order);
  }
  console.log('  ✓ 时间线已创建（5条）');

  // Events
  const eventsData = [
    {
      title: '全国大学生集成电路创新创业大赛',
      description: '全国大学生集成电路创新创业大赛是由工业和信息化部人才交流中心主办的国家级A类赛事。大赛以服务产业发展需求为导向，以提升我国集成电路产业人才培养质量为目标，打造产学研用协同创新平台。赛事涵盖集成电路设计、制造、封装测试、EDA工具开发等方向，面向全国高校学生开放报名。',
      type: 'chip_design',
      status: 'open',
      start_date: '2026-07-15',
      end_date: '2026-09-30',
      location: '线上+线下赛区',
      registration_open: 1,
      max_participants: 50
    },
    {
      title: '嵌入式芯片与系统设计竞赛',
      description: '嵌入式芯片与系统设计竞赛聚焦RISC-V架构处理器、AIoT智能终端、边缘计算等前沿方向。参赛选手需完成从芯片架构设计到应用系统开发的全流程实践，考验硬件设计与软件开发的综合能力。竞赛面向全国高校本科生和研究生开放，优秀作品将获得行业专家指导和产业孵化机会。',
      type: 'chip_design',
      status: 'upcoming',
      start_date: '2026-08-01',
      end_date: '2026-10-15',
      location: '全国各大赛区',
      registration_open: 1,
      max_participants: 40
    },
    {
      title: '社团内部技术培训Workshop',
      description: '本次Workshop面向社团全体成员，由技术总监王浩然和资深成员联合授课。内容涵盖：Verilog HDL基础与进阶、FPGA开发流程实操、嵌入式系统设计入门（STM32/ESP32）、PCB设计与焊接实训。采用"理论讲解+动手实践"的模式，每位参与者将完成一个完整的硬件小项目。',
      type: 'training',
      status: 'ongoing',
      start_date: '2026-06-20',
      end_date: '2026-07-20',
      location: '工科实验楼A201',
      registration_open: 1,
      max_participants: 60
    }
  ];

  const insertEvent = db.prepare(
    'INSERT INTO events (title, description, type, status, start_date, end_date, location, registration_open, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const e of eventsData) {
    insertEvent.run(e.title, e.description, e.type, e.status, e.start_date, e.end_date, e.location, e.registration_open, e.max_participants);
  }
  console.log('  ✓ 活动已创建（3个）');

  // Achievements
  const achievementsData = [
    {
      title: '全国大学生电子设计竞赛一等奖',
      competition: '全国大学生电子设计竞赛',
      award_level: '国家级',
      award_rank: '一等奖',
      project_name: '基于RISC-V的智能SoC芯片设计',
      description: '本团队设计了一款基于RISC-V开源指令集架构的智能SoC芯片，集成了AI加速模块、低功耗蓝牙通信和传感器接口，可应用于可穿戴健康监测设备。芯片采用28nm工艺节点，核心频率200MHz，待机功耗低于1mW。作品从全国8000余支队伍中脱颖而出，荣获本科组国家一等奖。',
      team_members: '张明远、李思涵、王浩然、陈宇航',
      award_date: '2024-08'
    },
    {
      title: '集成电路创新创业大赛赛区特等奖',
      competition: '全国大学生集成电路创新创业大赛',
      award_level: '赛区级',
      award_rank: '特等奖',
      project_name: '高性能AI加速芯片设计',
      description: '针对边缘端AI推理场景，设计了一款高能效的神经网络加速芯片。采用脉动阵列架构，支持INT8/INT16混合精度计算，峰值算力达到4TOPS，能效比为8TOPS/W。芯片内置自研的张量处理单元（TPU），可高效运行ResNet-50、MobileNet等主流模型，在图像分类任务中实现实时推理。',
      team_members: '王浩然、张明远、赵文博',
      award_date: '2024-07'
    },
    {
      title: '"挑战杯"大学生课外学术科技作品竞赛省级金奖',
      competition: '"挑战杯"全国大学生课外学术科技作品竞赛',
      award_level: '省级',
      award_rank: '金奖',
      project_name: '可穿戴健康监测芯片',
      description: '本项目设计了一款超低功耗的可穿戴健康监测SoC芯片，集成了心电（ECG）、血氧（SpO2）、体温多模态生理信号采集前端，以及基于轻量级神经网络的异常检测算法硬件加速器。芯片功耗低于500μW，支持长达30天的连续监测。',
      team_members: '李思涵、陈宇航、孙晓萌',
      award_date: '2023-11'
    },
    {
      title: '中国"互联网+"大学生创新创业大赛省级银奖',
      competition: '中国国际"互联网+"大学生创新创业大赛',
      award_level: '省级',
      award_rank: '银奖',
      project_name: '低功耗物联网通信芯片',
      description: '面向智慧农业和工业物联网场景，本团队开发了一款支持LoRa和NB-IoT双模通信的低功耗物联网SoC芯片。芯片在Sub-GHz频段下通信距离超过10公里，休眠功耗仅为2μA，配套提供开放的SDK和云平台接入方案，具有良好的产业化前景。',
      team_members: '赵文博、孙晓萌、张明远',
      award_date: '2023-10'
    },
    {
      title: '全国大学生FPGA创新设计竞赛国家二等奖',
      competition: '全国大学生FPGA创新设计竞赛',
      award_level: '国家级',
      award_rank: '二等奖',
      project_name: '自适应图像处理加速器',
      description: '基于Xilinx Zynq平台设计了一款自适应图像处理加速器，支持实时视频流的边缘检测、图像增强和目标识别。通过动态部分重配置技术，可根据场景自适应切换不同算法IP核，在1080P@60fps下实现低于10ms的处理延迟。',
      team_members: '王浩然、李思涵',
      award_date: '2022-09'
    }
  ];

  const insertAchievement = db.prepare(
    'INSERT INTO achievements (title, competition, award_level, award_rank, project_name, description, team_members, award_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const a of achievementsData) {
    insertAchievement.run(a.title, a.competition, a.award_level, a.award_rank, a.project_name, a.description, a.team_members, a.award_date);
  }
  console.log('  ✓ 成果已创建（5条）');

  // News
  const newsData = [
    {
      title: '智赛宏芯社荣获2024年全国大学生电子设计竞赛一等奖',
      content: '在刚刚结束的2024年全国大学生电子设计竞赛中，智赛宏芯社参赛团队凭借"基于RISC-V的智能SoC芯片设计"项目，从全国8000余支参赛队伍中脱颖而出，荣获本科组国家一等奖。这是社团成立四年来首次斩获该项赛事的国家级最高奖项。\n\n本次获奖项目由社长张明远带队，团队成员包括副社长李思涵、技术总监王浩然和核心成员陈宇航。他们历时六个月，从芯片架构设计、RTL编码验证到物理实现和板级测试，完成了完整的芯片设计全流程。\n\n指导老师刘教授表示，这一成绩的取得体现了社团在芯片设计方向扎实的技术积累和卓越的创新能力。社团将继续深耕芯片设计领域，争取在更高水平的赛事和科研项目中创造更多佳绩。',
      summary: '社团参赛团队凭借基于RISC-V的智能SoC芯片设计项目，荣获本科组国家一等奖，实现社团成立以来国家级最高奖项的突破。',
      category: 'achievement',
      published_at: '2024-09-15'
    },
    {
      title: '2026年春季招新正式启动——芯怀梦想，智创未来',
      content: '智赛宏芯社2026年春季招新正式启动！无论你是电子信息、微电子、计算机专业的同学，还是对芯片设计、嵌入式开发感兴趣的其他专业同学，只要你怀揣对科技的热爱和创新的激情，我们都欢迎你的加入。\n\n社团提供：\n• 系统的技术培训体系（Verilog、FPGA、嵌入式开发、PCB设计）\n• 丰富的竞赛参与机会（全国大学生电子设计竞赛、集成电路创新创业大赛等）\n• 扎实的项目实践平台（SoC芯片设计、AI加速器、物联网终端等方向）\n• 优秀的技术导师团队和学长指导\n\n报名方式：\n1. 扫描下方二维码填写报名表\n2. 关注社团公众号获取最新资讯\n3. 加入招新QQ群：XXXXXXXX\n\n招新面试时间：2026年3月15日-20日\n面试地点：工科实验楼A305\n\n芯怀梦想，智创未来——我们在这里等你！',
      summary: '智赛宏芯社2026年春季招新正式启动，面向全校各专业同学开放报名，欢迎对芯片设计和智能硬件感兴趣的同学加入。',
      category: 'notice',
      published_at: '2026-03-01'
    },
    {
      title: '社团举办"芯片设计前沿技术"系列讲座',
      content: '为拓展社团成员的学术视野，了解芯片设计领域的前沿技术动态，智赛宏芯社将于本学期举办"芯片设计前沿技术"系列讲座，拟邀请校内外专家学者进行技术分享。\n\n首场讲座将于2025年11月10日（周一）晚19:00在工科实验楼A201举行，主题为"从EDA到AI：芯片设计自动化的新范式"，主讲人为电子科学与工程学院刘教授。\n\n后续讲座预告：\n• 第二讲：RISC-V处理器架构与开源生态建设（12月初）\n• 第三讲：先进封装技术与Chiplet设计方法（12月底）\n• 第四讲：存算一体芯片——打破冯·诺依曼瓶颈（1月中旬）\n\n所有讲座面向全校师生开放，欢迎各位同学踊跃参加！',
      summary: '社团举办"芯片设计前沿技术"系列讲座，首场讲座将于11月10日举行，主题为芯片设计自动化与AI的融合。',
      category: 'event',
      published_at: '2025-11-05'
    }
  ];

  const insertNews = db.prepare(
    'INSERT INTO news (title, content, summary, category, published_at) VALUES (?, ?, ?, ?, ?)'
  );
  for (const n of newsData) {
    insertNews.run(n.title, n.content, n.summary, n.category, n.published_at);
  }
  console.log('  ✓ 新闻已创建（3条）');

  // Honor Wall data
  seedHonorWall();

  console.log('种子数据导入完成！');
}

function seedHonorWall() {
  const honorCount = db.prepare('SELECT COUNT(*) as count FROM honor_wall').get().count;
  if (honorCount > 0) {
    console.log('  荣誉墙数据已存在，跳过。');
    return;
  }
  const honorWallData = [
    // ===== 2025届（最新） =====
    {
      name: '张明远', cohort: '2025', role: '社长 / 创始人', member_type: 'founder',
      achievements: '全国大学生电子设计竞赛国家一等奖 | 主持RISC-V SoC芯片设计项目',
      full_achievements: JSON.stringify([
        '2024年全国大学生电子设计竞赛国家一等奖',
        '2023年集成电路创新创业大赛全国二等奖',
        '2022年全国大学生FPGA创新设计竞赛省级一等奖',
        '发表SCI论文1篇（芯片设计方向）',
        '国家发明专利2项（芯片架构相关）'
      ]),
      projects: JSON.stringify([
        '基于RISC-V的智能SoC芯片设计（项目负责人）',
        '低功耗NB-IoT通信芯片设计（核心架构师）',
        '开源RISC-V处理器IP核开发（发起人）'
      ]),
      message: '希望社团能成为每一个热爱芯片设计的同学的起点，芯怀梦想，脚踏实地，用技术改变世界。',
      destination: '保送至清华大学集成电路学院攻读博士学位',
      sort_order: 1
    },
    {
      name: '李思涵', cohort: '2025', role: '副社长 / 竞赛领军者', member_type: 'competition',
      achievements: '中国"互联网+"创新创业大赛省级金奖 | 全国大学生电子设计竞赛国家一等奖',
      full_achievements: JSON.stringify([
        '中国国际"互联网+"大学生创新创业大赛省级金奖',
        '2024年全国大学生电子设计竞赛国家一等奖',
        '2023年"挑战杯"全国大学生课外学术科技作品竞赛省级特等奖',
        '全国大学生集成电路创新创业大赛全国三等奖',
        '校级优秀毕业论文'
      ]),
      projects: JSON.stringify([
        'AI加速器芯片设计（项目负责人）',
        '智能视觉处理SoC系统设计（核心成员）',
        '边缘计算AI推理框架开发（负责人）'
      ]),
      message: '比赛是检验技术的最好方式，每一场比赛都让我成长。希望学弟学妹们勇敢参赛，不惧挑战。',
      destination: '入职华为海思半导体，从事AI芯片架构设计',
      sort_order: 2
    },
    {
      name: '王浩然', cohort: '2025', role: '技术总监 / 技术骨干', member_type: 'tech',
      achievements: 'FPGA创新设计竞赛国家二等奖 | 开源硬件社区贡献者',
      full_achievements: JSON.stringify([
        '2023年全国大学生FPGA创新设计竞赛国家二等奖',
        '2024年全国大学生电子设计竞赛省级一等奖',
        '2022年全国大学生数学建模竞赛省级二等奖',
        'GitHub开源项目累计Star 500+',
        '在RISC-V国际基金会贡献多组IP核验证代码'
      ]),
      projects: JSON.stringify([
        '自适应图像处理加速器（FPGA实现）',
        '开源RISC-V处理器验证平台（发起人）',
        '基于FPGA的实时视频流处理系统'
      ]),
      message: '开源精神是我们技术人的信仰。希望社团的技术氛围越来越好，让更多人爱上底层技术。',
      destination: '保送至中国科学院计算技术研究所攻读硕士学位',
      sort_order: 3
    },
    {
      name: '陈宇航', cohort: '2025', role: '核心成员 / 竞赛领军者', member_type: 'competition',
      achievements: '全国大学生嵌入式芯片与系统设计竞赛国家一等奖 | 蓝桥杯全国总决赛一等奖',
      full_achievements: JSON.stringify([
        '2024年全国大学生嵌入式芯片与系统设计竞赛国家一等奖',
        '2023年蓝桥杯全国软件和信息技术专业人才大赛全国总决赛一等奖',
        '2022年全国大学生智能汽车竞赛省级二等奖',
        '工信部嵌入式系统设计师认证'
      ]),
      projects: JSON.stringify([
        '基于ARM Cortex-M4的智能家居控制系统',
        '自动驾驶小车视觉感知系统',
        '工业物联网数据采集终端'
      ]),
      message: '从焊第一块电路板到设计完整系统，社团给了一个让我疯狂成长的平台。',
      destination: '入职小米科技，担任嵌入式系统工程师',
      sort_order: 4
    },
    {
      name: '赵雨桐', cohort: '2025', role: '核心成员 / 技术骨干', member_type: 'tech',
      achievements: '全国大学生集成电路创新创业大赛省级一等奖 | 校级优秀毕业生',
      full_achievements: JSON.stringify([
        '2023年全国大学生集成电路创新创业大赛省级一等奖',
        '2024年校级优秀毕业设计',
        '2022年校级电子设计竞赛一等奖',
        '参与国家重点研发计划子课题1项'
      ]),
      projects: JSON.stringify([
        '高性能DDR4内存控制器IP设计',
        '基于UVM的SoC验证平台搭建',
        '低功耗SRAM编译器设计'
      ]),
      message: '实验服上的松香味和屏幕上的波形图，是青春最酷的印记。',
      destination: '考研至电子科技大学微电子与固体电子学专业',
      sort_order: 5
    },
    // ===== 2024届 =====
    {
      name: '刘子轩', cohort: '2024', role: '联合创始人 / 技术骨干', member_type: 'founder',
      achievements: '全国大学生电子设计竞赛国家二等奖 | 社团硬件实验室奠基人',
      full_achievements: JSON.stringify([
        '2023年全国大学生电子设计竞赛国家二等奖',
        '2022年全国大学生FPGA创新设计竞赛省级一等奖',
        '2021年"挑战杯"省级二等奖',
        '社团硬件实验室建设负责人'
      ]),
      projects: JSON.stringify([
        '社团硬件实验室从零搭建（负责人）',
        '高速SerDes接口IP设计',
        '基于FPGA的软件定义无线电平台'
      ]),
      message: '从几个人凑钱买第一块开发板，到拥有完整的芯片设计实验室，每一步都弥足珍贵。',
      destination: '入职中兴微电子，从事高速接口芯片设计',
      sort_order: 1
    },
    {
      name: '周晓萌', cohort: '2024', role: '副社长 / 竞赛领军者', member_type: 'competition',
      achievements: '集成电路创新创业大赛国家二等奖 | 全国大学生电子设计竞赛省级一等奖',
      full_achievements: JSON.stringify([
        '2023年集成电路创新创业大赛全国二等奖',
        '2022年全国大学生电子设计竞赛省级一等奖',
        '2021年全国大学生数学建模竞赛国家二等奖',
        '校级一等奖学金（连续3年）'
      ]),
      projects: JSON.stringify([
        '低功耗蓝牙SoC芯片设计（项目负责人）',
        '智能穿戴设备心率监测算法开发',
        '物联网终端安全认证芯片设计'
      ]),
      message: '女子也能顶起芯片设计的半边天。希望更多女生加入这个充满魅力的领域。',
      destination: '保送至东南大学信息科学与工程学院攻读硕士学位',
      sort_order: 2
    },
    {
      name: '吴志远', cohort: '2024', role: '技术部长 / 技术骨干', member_type: 'tech',
      achievements: '全国大学生嵌入式设计大赛国家一等奖 | 多项实用发明专利',
      full_achievements: JSON.stringify([
        '2023年全国大学生嵌入式芯片与系统设计竞赛国家一等奖',
        '2022年TI杯全国大学生电子设计竞赛省级一等奖',
        '持有3项国家实用新型专利',
        '校园创客空间联合创始人'
      ]),
      projects: JSON.stringify([
        '基于STM32的智能农业灌溉系统',
        '便携式心电监测设备原型开发',
        '开源3D打印机控制板设计'
      ]),
      message: '从单片机到SoC，从面包板到流片，这是一条艰辛但充满成就感的道路。',
      destination: '创业成立智能硬件公司，获得天使轮融资',
      sort_order: 3
    },
    {
      name: '郑雨萱', cohort: '2024', role: '宣传部部长 / 竞赛领军者', member_type: 'competition',
      achievements: '中国大学生计算机设计大赛国家一等奖 | 多项省级竞赛获奖',
      full_achievements: JSON.stringify([
        '2023年中国大学生计算机设计大赛国家一等奖',
        '2022年全国大学生物联网设计竞赛省级一等奖',
        '2021年省级大学生创新创业训练计划优秀项目',
        '多次获得校级优秀学生干部'
      ]),
      projects: JSON.stringify([
        '智慧校园物联网平台（前端+嵌入式）',
        '基于ESP32的环境监测系统',
        '校园二手交易小程序开发'
      ]),
      message: '社团不仅教会了我技术，更让我学会了如何组织团队、传播技术文化。',
      destination: '入职字节跳动，担任前端开发工程师',
      sort_order: 4
    },
    {
      name: '孙浩宇', cohort: '2024', role: '核心成员 / 技术骨干', member_type: 'tech',
      achievements: '全国大学生集成电路创新创业大赛省级一等奖 | 数字IC设计方向突出贡献',
      full_achievements: JSON.stringify([
        '2023年集成电路创新创业大赛省级一等奖',
        '2022年全国大学生电子设计竞赛省级二等奖',
        'EDA工具脚本开发与维护（社团项目）',
        'Synopsys工具链校园推广负责人'
      ]),
      projects: JSON.stringify([
        '基于Verilog的RISC-V五级流水线CPU设计',
        'AHB-APB总线桥接器IP设计',
        '自动化芯片设计流程脚本开发'
      ]),
      message: '数字IC设计需要十年磨一剑的耐心。你现在敲的每一行RTL代码，都在为未来的芯片大厦添砖加瓦。',
      destination: '入职紫光展锐，从事5G基带芯片设计',
      sort_order: 5
    },
    // ===== 2023届（最早） =====
    {
      name: '赵文博', cohort: '2023', role: '创始社长 / 创始人', member_type: 'founder',
      achievements: '社团创始人 | 全国大学生电子设计竞赛国家二等奖 | 带领社团从0到1',
      full_achievements: JSON.stringify([
        '2022年全国大学生电子设计竞赛国家二等奖',
        '2021年省级大学生创新创业训练计划优秀结题',
        '2020年校级创新之星',
        '智赛宏芯社创始社长（2020年创立社团）'
      ]),
      projects: JSON.stringify([
        '智赛宏芯社创立与初期建设',
        '基于FPGA的简易CPU设计（社团启蒙项目）',
        '无线传感器网络节点设计'
      ]),
      message: '2020年秋天，我和几个志同道合的同学在实验室里写下了社团的第一份章程。从零开始，到今天硕果累累，这是我大学生涯最大的骄傲。',
      destination: '保送至北京大学软件与微电子学院攻读硕士学位',
      sort_order: 1
    },
    {
      name: '孙晓萌', cohort: '2023', role: '联合创始人 / 竞赛领军者', member_type: 'founder',
      achievements: '中国"互联网+"创新创业大赛省级银奖 | 社团首批核心成员',
      full_achievements: JSON.stringify([
        '2022年中国国际"互联网+"大学生创新创业大赛省级银奖',
        '2021年全国大学生电子设计竞赛省级一等奖',
        '2020年省级大学生创新创业训练计划立项',
        '社团首批核心成员，参与社团章程制定'
      ]),
      projects: JSON.stringify([
        '低功耗物联网通信芯片（项目负责人）',
        '社团首次参加电子设计竞赛的参赛项目',
        '智能停车管理系统'
      ]),
      message: '作为社团的第一批成员，看着它从无到有、从小到大，感觉就像看着自己的孩子长大。',
      destination: '入职阿里巴巴达摩院，从事芯片设计自动化研究',
      sort_order: 2
    },
    {
      name: '林志远', cohort: '2023', role: '首任技术部部长 / 技术骨干', member_type: 'tech',
      achievements: '全国大学生FPGA竞赛省级一等奖 | 社团技术培训体系奠基人',
      full_achievements: JSON.stringify([
        '2022年全国大学生FPGA创新设计竞赛省级一等奖',
        '2021年蓝桥杯省级二等奖',
        '2020年校级ACM程序设计竞赛铜奖',
        '设计社团首套技术培训课程体系'
      ]),
      projects: JSON.stringify([
        '社团首套技术培训课程体系设计与授课',
        '基于FPGA的数字示波器设计',
        '简易逻辑分析仪开发'
      ]),
      message: '技术培训和传承是社团持续发展的根基。很高兴看到现在社团的技术水平比我当年强太多了。',
      destination: '考研至华中科技大学光学与电子信息学院',
      sort_order: 3
    },
    {
      name: '黄思宇', cohort: '2023', role: '首任外联部部长 / 竞赛领军者', member_type: 'competition',
      achievements: '全国大学生电子设计竞赛省级一等奖 | 社团首个校企合作项目推动者',
      full_achievements: JSON.stringify([
        '2022年全国大学生电子设计竞赛省级一等奖',
        '2021年集成电路创新创业大赛省级二等奖',
        '推动社团与3家企业建立合作关系',
        '校级优秀毕业生'
      ]),
      projects: JSON.stringify([
        '基于STM32的智能小车竞赛平台',
        '电力线载波通信模块设计',
        '社团首场校企合作技术沙龙组织'
      ]),
      message: '技术之外，沟通和资源整合能力同样重要。希望社团能继续深化校企合作，为成员创造更多机会。',
      destination: '入职大疆创新，担任硬件工程师',
      sort_order: 4
    },
    {
      name: '许佳琪', cohort: '2023', role: '核心成员 / 技术骨干', member_type: 'tech',
      achievements: '全国大学生集成电路创新创业大赛省级二等奖 | 模拟IC设计方向',
      full_achievements: JSON.stringify([
        '2022年全国大学生集成电路创新创业大赛省级二等奖',
        '2021年校级电子设计竞赛一等奖',
        '2020年国家励志奖学金',
        'Cadence Virtuoso工具链熟练掌握'
      ]),
      projects: JSON.stringify([
        '低噪声运算放大器芯片设计',
        '带隙基准电压源设计',
        'LDO线性稳压器芯片设计'
      ]),
      message: '模拟IC设计是芯片设计中最具艺术性的方向，需要耐心和灵感的完美结合。',
      destination: '保送至复旦大学微电子学院攻读硕士学位',
      sort_order: 5
    }
  ];

  const insertHonor = db.prepare(
    `INSERT INTO honor_wall (name, avatar, cohort, role, member_type, achievements, full_achievements, projects, message, destination, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const h of honorWallData) {
    insertHonor.run(
      h.name, '', h.cohort, h.role, h.member_type,
      h.achievements, h.full_achievements, h.projects,
      h.message, h.destination, h.sort_order
    );
  }
  console.log('  ✓ 荣誉墙数据已创建（15条，3届）');
}

// Run if executed directly
if (require.main === module) {
  db.init().then(() => {
    seed().then(() => {
      console.log('完成。');
      process.exit(0);
    });
  }).catch(err => {
    console.error('种子数据导入失败:', err);
    process.exit(1);
  });
}

module.exports = seed;