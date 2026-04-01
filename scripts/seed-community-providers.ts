/**
 * Seed community providers from SkyKiwi BBS forum data
 * Run: npx tsx scripts/seed-community-providers.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Category ID mapping (matches local-services-categories.ts foursquareId)
const CAT = {
  moving: '11178',      // maps to plumber (reuse for general services)
  electrician: '11176',
  plumber: '11178',
  cleaning: '11174',
  mechanic: '11029',
  doctor: '15014',
  dentist: '15010',
  restaurant: '13065',
  cafe: '13032',
  gym: '18021',
  laundry: '11185',
  locksmith: '11183',
  hairdresser: '11057',
  lawn: '11182',
}

interface Provider {
  name: string
  category_id: string
  description: string
  phone: string
  service_area: string[]
  availability?: string
  pricing_info?: string
  social_links?: Record<string, string>
  is_verified: boolean
  lat?: number
  lng?: number
  address?: string
}

const providers: Provider[] = [
  // ── Moving Services ──
  {
    name: 'PF Moving Ltd / 奔福搬家',
    category_id: CAT.moving,
    description: 'Government-partnered, highly-rated moving company. Full-service: moving, cleaning, garbage removal. Multiple truck sizes available. 政府合作网红好评搬家清洁清垃圾，多种车型可选。',
    phone: '021-333333',
    service_area: ['Auckland', 'Auckland CBD', 'North Shore', 'South Auckland'],
    pricing_info: 'Fixed pricing available',
    is_verified: true,
  },
  {
    name: 'KNC Professional Moving / 康楠专业搬家货运',
    category_id: CAT.moving,
    description: 'Professional moving with fixed pricing. Services include furniture assembly, customs pickup, simplified moves. 专业搬家，一口价。包括家具安装、海关提货、简易搬家。',
    phone: '021983960',
    service_area: ['Auckland', 'Hamilton', 'Tauranga'],
    pricing_info: 'Fixed price quotes',
    social_links: { wechat: '021983960' },
    is_verified: false,
  },
  {
    name: 'Brother Moving / 兄弟搬家货运',
    category_id: CAT.moving,
    description: 'Shipping logistics, long-distance transport, garbage disposal, house cleaning. 海运物流、长途运输、垃圾处理、房屋清洁。',
    phone: '0223280551',
    service_area: ['Auckland', 'New Zealand wide'],
    is_verified: false,
  },
  {
    name: 'Elephant Moving / 大象搬家',
    category_id: CAT.moving,
    description: '17-year established registered moving company. One of Auckland\'s most experienced Chinese moving services. 正规注册十七年老牌搬家公司。',
    phone: '',
    service_area: ['Auckland'],
    pricing_info: '$60-80/hour',
    is_verified: true,
  },
  {
    name: 'Star Moving / 明星搬家',
    category_id: CAT.moving,
    description: 'Full-service moving: all sizes, shipping pickup, long-distance, garbage disposal, furniture assembly, piano moving. 大小型搬家、海运代取、长途运输、垃圾处理、家具安装、钢琴搬运。',
    phone: '021 270 0316',
    service_area: ['Auckland', 'New Zealand wide'],
    is_verified: false,
  },
  {
    name: 'Rainbow Moving / 彩虹搬家',
    category_id: CAT.moving,
    description: 'Moving, shipping pickup, office relocation, garbage cleanup. 搬家运输、海运提货、公司乔迁、清理垃圾。',
    phone: '0272186789',
    service_area: ['Auckland'],
    is_verified: false,
  },
  {
    name: 'Reliable Moving / 靠谱搬家',
    category_id: CAT.moving,
    description: 'Flexible options: half-hour minimum, student moves, self-service. Budget-friendly. 半小时起、学生搬家、自助搬家。',
    phone: '027-553-9999',
    service_area: ['Auckland'],
    pricing_info: 'From 30min minimum',
    is_verified: false,
  },

  // ── Electrician ──
  {
    name: 'NZ Licensed Electrician / 新西兰持牌电工',
    category_id: CAT.electrician,
    description: 'Licensed NZ electrician. Services: new/old homes, AC installation, electrical panel upgrades, EV chargers, CCTV, commercial, solar PV. 新房旧房、空调制冷、电箱升级、充电桩、CCTV、商业、太阳能光伏。',
    phone: '',
    service_area: ['Auckland', 'North Shore', 'East Auckland'],
    availability: 'Mon-Sat',
    is_verified: true,
  },

  // ── Plumbing ──
  {
    name: 'NZ Chinese Plumbing / 华人水管工',
    category_id: CAT.plumber,
    description: 'Drain clearing, toilet repair, CCTV pipe inspection. Chinese-speaking licensed plumber. 下水管道疏通、马桶维修、CCTV管道检查。',
    phone: '0224942436',
    service_area: ['Auckland'],
    pricing_info: 'From $80 NZD',
    is_verified: false,
  },

  // ── Home Renovation ──
  {
    name: 'Kiwiland Construction',
    category_id: CAT.plumber, // closest category
    description: 'Full home renovation: licensed plumbing, electrical, carpentry. Council compliance. Fix leaks, aging, structural issues. 旧房翻新扩建、水电木持牌施工、Council合规报批、漏水老化结构问题。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: true,
  },
  {
    name: 'Premier Cabinets / 至尊橱柜',
    category_id: CAT.plumber,
    description: 'High-end custom kitchen specialist. Bespoke kitchen design and installation. 高端定制厨房专家。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },

  // ── Cleaning ──
  {
    name: 'Auckland Chinese Cleaning / 奥克兰华人清洁',
    category_id: CAT.cleaning,
    description: 'Moving cleaning, exit cleaning, carpet cleaning, pest control. Professional team. 搬家清洁、退房清洁、地毯清洗、杀虫除鼠。',
    phone: '',
    service_area: ['Auckland', 'Auckland CBD', 'North Shore', 'South Auckland'],
    is_verified: false,
  },
  {
    name: 'Home & Rental Cleaning / 家庭民宿保洁',
    category_id: CAT.cleaning,
    description: 'Home cleaning, apartment exit cleaning, holiday rental cleaning. Reliable and thorough. 家庭清洁、公寓退租清洁、民宿保洁。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },

  // ── Lawn & Garden ──
  {
    name: 'Auckland Garden Services / 奥克兰花园服务',
    category_id: CAT.lawn,
    description: 'Lawn mowing, licensed tree cutting, hedge trimming, fencing, decking, repairs. 割草、持牌砍树、修树墙、fence、deck、维修。',
    phone: '',
    service_area: ['Auckland', 'North Shore', 'West Auckland'],
    is_verified: false,
  },

  // ── IT & Tech ──
  {
    name: 'Auckland Computer Repair / 奥克兰电脑维修',
    category_id: CAT.mechanic, // closest category
    description: 'Computer & laptop repair, no diagnostic fee. Router, WiFi, CCTV installation. 7 days/week. 电脑维修、笔记本维修、维修免检测费。路由器安装、WiFi增强、CCTV安装。',
    phone: '',
    service_area: ['Auckland'],
    availability: '7 days/week',
    pricing_info: 'No diagnostic fee',
    is_verified: false,
  },
  {
    name: 'Megabit Digital Solutions',
    category_id: CAT.mechanic,
    description: 'POS systems, website design & development, app development, WeChat mini-programs, SEO. POS系统、网站设计开发、APP开发、微信小程序、搜索引擎优化。',
    phone: '',
    service_area: ['Auckland', 'New Zealand wide'],
    is_verified: false,
  },

  // ── Professional Services ──
  {
    name: 'NZ Chinese Translation / 新西兰华人翻译',
    category_id: CAT.locksmith, // closest category
    description: 'Certified translation: driver license, immigration documents, official documents. Chinese-English. 认证翻译、驾照翻译、移民文件翻译。',
    phone: '',
    service_area: ['Auckland', 'New Zealand wide'],
    is_verified: false,
  },
  {
    name: 'HNH Associate / 华人注册会计师',
    category_id: CAT.locksmith,
    description: 'Senior NZ CPA. Tax optimization, tax planning, accounting services. Chinese-speaking. 资深NZ CPA特许注册会计师，合理避税、税务规划。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: true,
  },

  // ── Medical ──
  {
    name: 'Caring Clinic / 华人家庭医生诊所',
    category_id: CAT.doctor,
    description: 'Chinese family medical clinic in Auckland CBD. Free Chinese consultation available. 华人家庭医生诊所，中文免费问诊。',
    phone: '',
    service_area: ['Auckland CBD'],
    address: '175 Queen Street, Auckland CBD',
    lat: -36.8485,
    lng: 174.7633,
    is_verified: true,
  },
  {
    name: 'Clinical Smiles Denture Clinic / 义齿诊所',
    category_id: CAT.dentist,
    description: 'Denture consultation and services. Free Chinese consultation. 假牙问题咨询，中文免费问诊。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },

  // ── Specialized ──
  {
    name: 'SoulFlow Creative / 灵动创意',
    category_id: CAT.mechanic,
    description: 'Graphic design, video production, web development. Bilingual Chinese-English creative services. 平面设计、视频制作、网站开发。',
    phone: '',
    service_area: ['Auckland', 'New Zealand wide'],
    is_verified: false,
  },
  {
    name: 'Star Bins / 垃圾箱出租',
    category_id: CAT.cleaning,
    description: 'Skip bin rental. Small green boxes, safe, efficient. Great for renovations and cleanups. 垃圾箱skip bin出租，小绿箱、安全、高效。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },
  {
    name: 'Fence & Deck Specialist / 围栏露台专家',
    category_id: CAT.lawn,
    description: 'Fencing, decking, retaining walls. No markup on materials — fair pricing. Fence、Deck、挡土墙，材料零差价。',
    phone: '',
    service_area: ['Auckland'],
    pricing_info: 'No markup on materials',
    is_verified: false,
  },
  {
    name: 'Auckland Roof Specialists / 奥克兰屋顶专家',
    category_id: CAT.plumber,
    description: 'Roof repair, leak fixing, tile cleaning, roof painting, gutter cleaning, external wall cleaning. 屋顶维修漏水、瓦片清洗、喷漆、雨水槽清理、外墙清洗。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },
  {
    name: 'Auckland Painting Services / 奥克兰油漆服务',
    category_id: CAT.plumber,
    description: 'Interior and exterior painting, renovation painting, roof painting. Quality workmanship. 室内外油漆、翻新、屋顶喷漆。',
    phone: '',
    service_area: ['Auckland'],
    is_verified: false,
  },
  {
    name: 'Carpet Court & Curtain Studio / 地板窗帘一站式',
    category_id: CAT.plumber,
    description: 'Integrated flooring and curtain solutions. Free on-site measurement. 地板+窗帘一体化解决方案，免费上门测量。',
    phone: '',
    service_area: ['Auckland'],
    pricing_info: 'Free on-site measurement',
    is_verified: false,
  },
]

async function seed() {
  console.log(`Seeding ${providers.length} community providers...`)

  let success = 0
  let failed = 0

  for (const p of providers) {
    const { error } = await supabase.from('community_providers').upsert({
      name: p.name,
      category_id: p.category_id,
      description: p.description,
      phone: p.phone || null,
      service_area: p.service_area,
      availability: p.availability || null,
      pricing_info: p.pricing_info || null,
      social_links: p.social_links || {},
      is_verified: p.is_verified,
      is_approved: true,
      status: 'active',
      lat: p.lat || null,
      lng: p.lng || null,
      address: p.address || null,
    }, { onConflict: 'id' })

    if (error) {
      console.error(`  ❌ ${p.name}: ${error.message}`)
      failed++
    } else {
      console.log(`  ✅ ${p.name}`)
      success++
    }
  }

  console.log(`\nDone! ${success} added, ${failed} failed.`)
}

seed()
