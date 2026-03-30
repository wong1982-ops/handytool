import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  // Page
  pageTitle: '简历助手',
  pageDescription: 'AI 智能辅助，打造专业简历',

  // Sidebar modes
  sidebar: {
    edit: '编辑',
    modules: '模块管理',
    beautify: '排版美化',
    toolbox: '工具箱',
    export: '导出简历',
  },

  // Module names
  modules: {
    baseInfo: '基本信息',
    jobIntention: '求职意向',
    education: '教育经历',
    workExperience: '工作经历',
    projects: '项目经历',
    skillsCertificates: '技能证书',
    selfEvaluation: '自我评价',
    training: '培训经历',
    awards: '荣誉奖项',
    internships: '实习经历',
    custom: '自定义模块',
  },

  // Base info fields
  baseInfo: {
    name: '姓名',
    namePlaceholder: '请输入姓名',
    photo: '照片',
    photoHint: '点击或拖拽上传',
    phone: '手机',
    phonePlaceholder: '请输入手机号',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    wechat: '微信',
    wechatPlaceholder: '请输入微信号',
    dateOfBirth: '出生日期',
    dateOfBirthPlaceholder: '请选择',
  },

  // Job intention fields
  jobIntention: {
    position: '求职岗位',
    positionPlaceholder: '请输入岗位',
    jobType: '求职类型',
    jobTypePlaceholder: '请选择',
    expectedSalary: '期望薪资',
    expectedSalaryPlaceholder: '如 8k-10k',
    targetCity: '意向城市',
    targetCityPlaceholder: '请输入城市',
    moreInfo: '更多信息（选填）',
    currentStatus: '当前状态',
    currentStatusPlaceholder: '请选择',
    desiredIndustry: '期望行业',
    desiredIndustryPlaceholder: '请输入',
    currentLocation: '现居住地',
    currentLocationPlaceholder: '请输入',
    hukou: '户口所在地',
    hukouPlaceholder: '请输入',
    workStartDate: '参加工作时间',
    workStartDatePlaceholder: '请选择',
  },

  // Education fields
  education: {
    school: '学校',
    schoolPlaceholder: '请输入学校名称',
    major: '专业',
    majorPlaceholder: '请输入专业',
    degree: '学历',
    degreePlaceholder: '请输入学历',
    startDate: '开始时间',
    endDate: '结束时间',
    datePlaceholder: '请选择',
    description: '详细描述',
    descriptionPlaceholder: '描述你的学术成就...',
  },

  // Work experience fields
  workExperience: {
    company: '公司',
    companyPlaceholder: '请输入公司名称',
    position: '职位',
    positionPlaceholder: '请输入职位',
    industry: '行业',
    industryPlaceholder: '请输入行业',
    startDate: '开始时间',
    endDate: '结束时间',
    datePlaceholder: '请选择',
    description: '详细描述',
    descriptionPlaceholder: '描述你的工作职责和成就...',
  },

  // Project fields
  projects: {
    projectName: '项目',
    projectNamePlaceholder: '请输入项目名称',
    role: '职位',
    rolePlaceholder: '请输入你的角色',
    startDate: '开始时间',
    endDate: '结束时间',
    datePlaceholder: '请选择',
    description: '详细描述',
    descriptionPlaceholder: '描述项目内容和你的贡献...',
  },

  // Skills
  skillsCertificates: {
    placeholder: '填写你的技能和证书...\n• 工作技能：熟练掌握PS、PR、视频拍摄剪辑\n• 语言能力：CET-6 英语证书\n• 计算机：计算机二级证书，熟练掌握Office软件',
  },

  // Self evaluation
  selfEvaluation: {
    placeholder: '总结自己的经验和特长...\n• 突出与申请岗位相关的经验和优势\n• 辅助案例说明可让内容更有说服力',
  },

  // Training fields
  training: {
    institution: '培训机构',
    institutionPlaceholder: '请输入机构名称',
    course: '培训课程',
    coursePlaceholder: '请输入课程名称',
    startDate: '开始时间',
    endDate: '结束时间',
    datePlaceholder: '请选择',
    description: '详细描述',
    descriptionPlaceholder: '描述培训内容...',
  },

  // Awards fields
  awards: {
    name: '奖项名称',
    namePlaceholder: '请输入奖项名称',
    issuer: '颁发机构',
    issuerPlaceholder: '请输入颁发机构',
    date: '获奖日期',
    datePlaceholder: '请选择',
    description: '描述',
    descriptionPlaceholder: '描述该奖项...',
  },

  // Internship fields
  internships: {
    company: '公司',
    companyPlaceholder: '请输入公司名称',
    position: '职位',
    positionPlaceholder: '请输入职位',
    startDate: '开始时间',
    endDate: '结束时间',
    datePlaceholder: '请选择',
    description: '详细描述',
    descriptionPlaceholder: '描述你的实习经历...',
  },

  // Custom section
  customSection: {
    title: '模块标题',
    titlePlaceholder: '请输入标题',
    typeRichtext: '自由文本',
    typeStructured: '结构化字段',
    addField: '添加字段',
    label: '字段名',
    labelPlaceholder: '字段名称',
    value: '字段值',
    valuePlaceholder: '字段内容',
    placeholder: '请输入内容...',
  },

  // Common actions
  actions: {
    add: '添加',
    delete: '删除',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    saveToCloud: '保存到云端',
    loginToSync: '登录后可将简历同步到云端',
    addEntry: '添加条目',
    collapse: '收起',
    expand: '展开',
  },

  // AI actions
  ai: {
    polish: 'AI 润色',
    continue: 'AI 续写',
    expand: 'AI 扩写',
    analyzing: '分析中...',
    polishing: '润色中...',
    generating: '生成中...',
    analyze: 'AI 简历分析',
    score: '简历评分',
    strengths: '优势',
    improvements: '待改进',
    suggestions: '建议',
  },

  // Module management
  moduleManagement: {
    title: '模块管理',
    description: '开关和排序简历模块',
    mandatory: '必填',
    dragHint: '拖拽排序',
  },

  // Beautify
  beautify: {
    title: '排版美化',
    themes: '模板风格',
    classic: '经典纯色',
    blueMinimal: '蓝色简约',
    yellowMinimal: '明黄简约',
    primaryColor: '主题色',
    fontFamily: '字体',
    fontFamilySystem: '系统默认',
    fontFamilySerif: '衬线体',
    fontFamilyMono: '等宽体',
    fontSize: '字号',
    fontSizeSm: '小',
    fontSizeMd: '中',
    fontSizeLg: '大',
  },

  // Toolbox
  toolbox: {
    title: '工具箱',
    samples: '简历范文',
    samplesDescription: '浏览示例简历获取灵感',
    aiAnalysis: 'AI 简历分析',
    aiAnalysisDescription: '获取 AI 驱动的简历反馈',
  },

  // Export
  export: {
    title: '导出简历',
    exportPdf: '导出为 PDF',
    exporting: '导出中...',
    zoom: '预览缩放',
    fileName: '文件名',
  },

  // Preview
  preview: {
    title: '预览',
    noContent: '开始编辑以查看简历预览',
  },
} as const
