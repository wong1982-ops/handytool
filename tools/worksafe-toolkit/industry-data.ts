import type { Industry, IndustryId, WorkplaceQuestion, HazardEntry, EngagementItem } from './types'

// ─── Industries ───────────────────────────────────────────────────────────────

export const INDUSTRIES: Industry[] = [
  {
    id: 'construction',
    name: 'Construction',
    icon: '🏗️',
    description: 'Building, civil works, and trade contractors',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    icon: '🍽️',
    description: 'Restaurants, cafes, bars, hotels, and accommodation',
  },
  {
    id: 'office',
    name: 'Office',
    icon: '🏢',
    description: 'Corporate offices, admin, and professional services',
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: '🛒',
    description: 'Shops, supermarkets, and customer-facing stores',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    description: 'Farming, horticulture, forestry, and primary industries',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: '🏭',
    description: 'Production facilities, factories, and processing plants',
  },
]

// ─── Workplace Questions ──────────────────────────────────────────────────────

export const WORKPLACE_QUESTIONS: WorkplaceQuestion[] = [
  {
    id: 'hazard_register',
    question: 'Do you have a current hazard register for your workplace?',
    industries: ['construction', 'hospitality', 'office', 'retail', 'agriculture', 'manufacturing'],
  },
  {
    id: 'induction_process',
    question: 'Do all new workers receive a health and safety induction before starting work?',
    industries: ['construction', 'hospitality', 'office', 'retail', 'agriculture', 'manufacturing'],
  },
  {
    id: 'ppe_provided',
    question: 'Is appropriate personal protective equipment (PPE) provided and maintained?',
    industries: ['construction', 'hospitality', 'agriculture', 'manufacturing'],
  },
  {
    id: 'emergency_plan',
    question: 'Do you have a documented emergency response plan and evacuation procedure?',
    industries: ['construction', 'hospitality', 'office', 'retail', 'agriculture', 'manufacturing'],
  },
  {
    id: 'incident_reporting',
    question: 'Is there a clear process for reporting incidents, near misses, and hazards?',
    industries: ['construction', 'hospitality', 'office', 'retail', 'agriculture', 'manufacturing'],
  },
  {
    id: 'contractor_management',
    question: 'Do you manage the H&S of contractors and subcontractors working on-site?',
    industries: ['construction', 'agriculture', 'manufacturing'],
  },
  {
    id: 'chemical_register',
    question: 'Do you maintain a chemical register and current Safety Data Sheets (SDS)?',
    industries: ['construction', 'hospitality', 'agriculture', 'manufacturing'],
  },
  {
    id: 'regular_reviews',
    question: 'Do you conduct regular workplace inspections and H&S reviews?',
    industries: ['construction', 'hospitality', 'office', 'retail', 'agriculture', 'manufacturing'],
  },
]

// ─── Industry Hazards ─────────────────────────────────────────────────────────

type PreBuiltHazard = Omit<HazardEntry, 'id' | 'responsible' | 'reviewDate' | 'createdAt'>

export const INDUSTRY_HAZARDS: Record<IndustryId, PreBuiltHazard[]> = {
  construction: [
    {
      hazard: 'Falls from height (scaffolding, ladders, roofs, elevated platforms)',
      riskLevel: 'critical',
      likelihood: 'Possible',
      consequence: 'Fatality or permanent disability',
      controls:
        'Edge protection, safety nets, harness systems, scaffold inspections, working at heights training, permit-to-work system',
    },
    {
      hazard: 'Electrocution (live electrical work, overhead powerlines, temporary supply)',
      riskLevel: 'critical',
      likelihood: 'Unlikely',
      consequence: 'Fatality or serious burns',
      controls:
        'Isolation and lockout/tagout procedures, licensed electricians only, safe approach distances, RCDs on all circuits',
    },
    {
      hazard: 'Manual handling (lifting heavy materials, awkward postures, repetitive tasks)',
      riskLevel: 'high',
      likelihood: 'Likely',
      consequence: 'Musculoskeletal injury, back strain',
      controls:
        'Mechanical aids (trolleys, forklifts), team lifts, manual handling training, job rotation',
    },
    {
      hazard: 'Noise exposure (power tools, compressors, concrete cutting)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Permanent hearing loss',
      controls:
        'Engineering controls, hearing protection (Class 4/5), noise monitoring, health surveillance',
    },
    {
      hazard: 'Falling objects (tools, materials, debris from height)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Serious head or body injury',
      controls:
        'Exclusion zones, barricades, toe boards on scaffolding, hard hats mandatory, tool tethering',
    },
    {
      hazard: 'Trench and excavation collapse',
      riskLevel: 'critical',
      likelihood: 'Unlikely',
      consequence: 'Fatality by asphyxiation or crushing',
      controls:
        'Shoring systems, battering or benching, competent person inspection, no entry > 1.5m without protection',
    },
    {
      hazard: 'Hot works (welding, cutting, grinding — fire and burn risk)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Burns, fire, explosion',
      controls:
        'Hot works permit system, fire watch, fire extinguisher on-hand, combustible material cleared 3m radius',
    },
    {
      hazard: 'Asbestos-containing materials (ACM) disturbance',
      riskLevel: 'critical',
      likelihood: 'Possible',
      consequence: 'Mesothelioma and lung disease (latent)',
      controls:
        'Asbestos survey before demolition/refurbishment, licensed removalist for friable ACM, air monitoring, disposal to licensed facility',
    },
  ],

  hospitality: [
    {
      hazard: 'Burns and scalds (hot surfaces, steam, boiling liquids, fryers)',
      riskLevel: 'high',
      likelihood: 'Likely',
      consequence: 'Serious burns requiring hospital treatment',
      controls:
        'Oven mitts and heat-resistant gloves, splash guards on fryers, clear communication of hot items, first aid kit',
    },
    {
      hazard: 'Slips, trips and falls (wet floors, spills, uneven surfaces)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Fractures, head injuries',
      controls:
        'Anti-slip matting, immediate spill clean-up, wet floor signs, non-slip footwear policy',
    },
    {
      hazard: 'Knife and sharp implement injuries',
      riskLevel: 'medium',
      likelihood: 'Possible',
      consequence: 'Lacerations requiring stitches',
      controls:
        'Cut-resistant gloves, proper knife storage (magnetic strips/knife blocks), knife skills training, no rushing with knives',
    },
    {
      hazard: 'Manual handling (lifting kegs, stock, furniture)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Back and shoulder injuries',
      controls:
        'Mechanical aids (trolleys, sack trucks), team lifts for loads > 16kg, manual handling training',
    },
    {
      hazard: 'Chemical cleaning product exposure (skin, eye, respiratory)',
      riskLevel: 'medium',
      likelihood: 'Possible',
      consequence: 'Chemical burns, respiratory irritation',
      controls:
        'SDS available, PPE (gloves, eye protection), dilution instructions followed, adequate ventilation',
    },
    {
      hazard: 'Worker fatigue (long shifts, split shifts, late nights)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Impaired judgement, increased accident risk',
      controls:
        'Maximum shift length policy, adequate break times, rostering review, encourage workers to report fatigue',
    },
  ],

  office: [
    {
      hazard: 'Ergonomic injury (poor workstation setup, prolonged sitting)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Repetitive strain injury, back/neck pain',
      controls:
        'Workstation assessments, height-adjustable desks, ergonomic chairs, regular micro-breaks, DSE training',
    },
    {
      hazard: 'Trips and falls (cables, clutter, wet floors)',
      riskLevel: 'low',
      likelihood: 'Possible',
      consequence: 'Minor to moderate injury',
      controls:
        'Cable management, clear walkways, no boxes in aisles, wet floor signs, good housekeeping',
    },
    {
      hazard: 'Electrical hazards (faulty equipment, overloaded power boards)',
      riskLevel: 'low',
      likelihood: 'Unlikely',
      consequence: 'Electric shock, fire',
      controls:
        'Regular electrical inspections (Test and Tag), no overloaded boards, report faulty equipment immediately',
    },
    {
      hazard: 'Work-related stress, mental fatigue and burnout',
      riskLevel: 'medium',
      likelihood: 'Possible',
      consequence: 'Mental health harm, reduced productivity',
      controls:
        'Workload management, flexible work options, EAP (Employee Assistance Programme), regular check-ins with managers',
    },
    {
      hazard: 'Fire risk (electrical faults, kitchen areas)',
      riskLevel: 'low',
      likelihood: 'Unlikely',
      consequence: 'Injury, property damage',
      controls:
        'Fire alarms tested regularly, evacuation drills, fire extinguishers maintained, no flammable material near heat sources',
    },
  ],

  retail: [
    {
      hazard: 'Manual handling (stock lifting, shelf stacking, receiving deliveries)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Back and shoulder injuries',
      controls:
        'Mechanical aids, team lifts, manual handling training, limit individual lift weight to 16kg',
    },
    {
      hazard: 'Slips, trips and falls (spills, wet floors, stock in aisles)',
      riskLevel: 'medium',
      likelihood: 'Possible',
      consequence: 'Fractures, head injuries',
      controls:
        'Immediate spill response procedures, wet floor signs, clear aisles, anti-slip matting at entrances',
    },
    {
      hazard: 'Customer aggression, robbery and violence',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Physical injury, psychological trauma',
      controls:
        'De-escalation training, duress alarms, cash minimisation, buddy system for closing, security cameras',
    },
    {
      hazard: 'Repetitive strain injury (checkout scanning, stacking)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Upper limb disorders',
      controls:
        'Job rotation, ergonomic checkout equipment, micro-break exercises, workstation assessment',
    },
    {
      hazard: 'Fire risk (storerooms, electrical faults)',
      riskLevel: 'low',
      likelihood: 'Unlikely',
      consequence: 'Injury, stock and property loss',
      controls:
        'Clear fire exits, fire extinguishers serviced annually, no smoking policy, evacuation plan posted',
    },
  ],

  agriculture: [
    {
      hazard: 'Machinery entanglement (PTO shafts, augers, harvesters)',
      riskLevel: 'critical',
      likelihood: 'Possible',
      consequence: 'Fatality or serious amputation',
      controls:
        'Guarding on all power take-off points, lockout/tagout before maintenance, no loose clothing near machinery, training',
    },
    {
      hazard: 'Agricultural chemical spray (pesticides, herbicides, fungicides)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Poisoning, respiratory and skin damage',
      controls:
        'Chemical register and SDS, PPE (respirator, chemical-resistant gloves and suit), re-entry intervals observed, GROWSAFE certification',
    },
    {
      hazard: 'Animal handling (cattle, horses, sheep — kicks, crush, bite)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Serious crush injuries, fractures',
      controls:
        'Proper yards and race design, no lone working with dangerous animals, training, escape routes identified',
    },
    {
      hazard: 'Quad bike and ATV rollovers',
      riskLevel: 'critical',
      likelihood: 'Possible',
      consequence: 'Fatality or serious head injury',
      controls:
        'Operator protection device (OPD) fitted, helmets mandatory, no passengers, speed management, terrain assessment',
    },
    {
      hazard: 'Manual handling (lifting produce, bending, harvesting)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Back and joint injuries',
      controls:
        'Mechanical lifting aids, job rotation, manual handling training, ergonomic tool design',
    },
    {
      hazard: 'Sun and heat exposure (outdoor work, long hours)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Heat stroke, sunburn, long-term skin cancer risk',
      controls:
        'Sun protection policy (hat, sunscreen, long sleeves), shade structures, cool water available, heat monitoring, early starts in summer',
    },
  ],

  manufacturing: [
    {
      hazard: 'Machine guarding failures (unguarded moving parts, nip points)',
      riskLevel: 'critical',
      likelihood: 'Possible',
      consequence: 'Amputation, crush or degloving injury',
      controls:
        'Fixed guards on all moving parts, interlocked guards on access panels, lockout/tagout procedures, daily pre-start checks',
    },
    {
      hazard: 'Noise-induced hearing loss (machinery, compressors, presses)',
      riskLevel: 'high',
      likelihood: 'Likely',
      consequence: 'Permanent hearing loss',
      controls:
        'Engineering noise controls, hearing protection zones, Class 4/5 hearing protection, audiometric testing',
    },
    {
      hazard: 'Chemical exposure (solvents, acids, dusts, fumes)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Respiratory disease, chemical burns, long-term illness',
      controls:
        'Substitution with safer alternatives, local exhaust ventilation, respiratory protection, SDS available, air monitoring',
    },
    {
      hazard: 'Manual handling (heavy components, repetitive assembly tasks)',
      riskLevel: 'medium',
      likelihood: 'Likely',
      consequence: 'Musculoskeletal disorders',
      controls:
        'Hoists, jigs and fixtures, job rotation, ergonomic workstation design, manual handling training',
    },
    {
      hazard: 'Forklift and vehicle operations (pedestrian strikes, load drops)',
      riskLevel: 'high',
      likelihood: 'Possible',
      consequence: 'Fatality or serious injury',
      controls:
        'Separated pedestrian and vehicle zones, speed limits, spotters, licensed operators only, pre-start checks, load securing',
    },
    {
      hazard: 'Confined space entry (tanks, vessels, pits)',
      riskLevel: 'critical',
      likelihood: 'Unlikely',
      consequence: 'Fatality by asphyxiation or gas exposure',
      controls:
        'Confined space register, permit-to-work system, atmospheric testing, attendant on standby, rescue plan, trained entrants',
    },
  ],
}

// ─── Engagement Items ─────────────────────────────────────────────────────────

export const ENGAGEMENT_ITEMS: EngagementItem[] = [
  {
    id: 'hs_rep_elected',
    question: 'Has a Health and Safety Representative (HSR) been elected by workers?',
    status: null,
    recommendation:
      'Facilitate an HSR election. Workers have the right to elect an HSR under the Health and Safety at Work Act 2015. The HSR provides a formal voice for worker concerns.',
  },
  {
    id: 'regular_meetings',
    question: 'Are regular H&S meetings or toolbox talks held with workers?',
    status: null,
    recommendation:
      'Schedule regular H&S meetings (at least quarterly) or weekly toolbox talks. Document attendance and discussion topics. This is a key requirement for demonstrating worker engagement.',
  },
  {
    id: 'hazard_reporting',
    question: 'Is there a clear, accessible process for workers to report hazards and near misses?',
    status: null,
    recommendation:
      'Implement a simple hazard reporting system (paper form, app, or online). Ensure all workers know how to use it and that reports are acted on and fed back to the reporter.',
  },
  {
    id: 'induction_process',
    question: 'Do all new workers and contractors receive a H&S induction before starting work?',
    status: null,
    recommendation:
      'Develop a formal induction checklist covering emergency procedures, hazards specific to the role, PPE requirements, and reporting processes. Keep signed records of completed inductions.',
  },
  {
    id: 'ppe_provided',
    question: 'Is appropriate PPE provided free of charge to all workers who need it?',
    status: null,
    recommendation:
      'Under HSWA 2015, workers must be provided with appropriate PPE at no cost. Conduct a PPE needs assessment, maintain stock, and ensure workers are trained in correct use and maintenance.',
  },
  {
    id: 'task_training',
    question: 'Are workers trained and competent before undertaking hazardous tasks?',
    status: null,
    recommendation:
      'Identify all hazardous tasks in your workplace and ensure a formal training/competency assessment is completed before workers perform them independently. Keep training records.',
  },
  {
    id: 'consulted_on_changes',
    question: 'Are workers consulted before changes are made that affect their health and safety?',
    status: null,
    recommendation:
      'HSWA 2015 requires you to engage with workers before making decisions that could affect their H&S. Establish a clear consultation process and document that consultation occurred.',
  },
  {
    id: 'emergency_procedures',
    question: 'Do all workers know the emergency procedures and evacuation assembly point?',
    status: null,
    recommendation:
      'Post emergency procedures in prominent locations. Conduct at least one evacuation drill per year. Ensure all workers including new starters and contractors know the assembly point.',
  },
  {
    id: 'first_aid_kit',
    question: 'Is there an adequate first aid kit on-site and are workers aware of its location?',
    status: null,
    recommendation:
      'Ensure a fully stocked first aid kit is available and accessible. Check contents monthly and restock as needed. Nominate first aiders and ensure their training is current (3-yearly refresher).',
  },
  {
    id: 'hs_noticeboard',
    question: 'Is there a H&S noticeboard displayed in the workplace with current information?',
    status: null,
    recommendation:
      'Maintain a H&S noticeboard with: emergency contacts, first aider names, evacuation plan, HSR details, recent inspection results, and any WorkSafe NZ notices. Update regularly.',
  },
]
