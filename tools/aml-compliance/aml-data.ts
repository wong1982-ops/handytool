import type {
  BusinessTypeInfo,
  RiskQuestion,
  CDDItem,
  SARIndicator,
  SARCategory,
  ProgrammeSection,
  RiskLevel,
  RiskAssessmentAnswers,
  RiskAssessmentResult,
  RiskAreaResult,
} from './types'

// ─── Business Types ──────────────────────────────────────────────────────────

export const BUSINESS_TYPES: BusinessTypeInfo[] = [
  {
    id: 'accountant',
    name: 'Accountant',
    regulator: 'DIA (Department of Internal Affairs)',
    description: 'AML/CFT reporting entity since Phase 2. Must have compliance programme and conduct CDD on clients.',
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    regulator: 'NZ Law Society + DIA',
    description: 'Trust account monitoring, property transactions, and company formation are key risk areas.',
  },
  {
    id: 'real-estate',
    name: 'Real Estate Agent',
    regulator: 'REA + DIA',
    description: 'Property transaction monitoring. Must verify buyer and seller identities for all transactions.',
  },
  {
    id: 'conveyancer',
    name: 'Conveyancer',
    regulator: 'DIA',
    description: 'Property transfers and high-value transactions. CDD required for all parties in conveyancing.',
  },
  {
    id: 'financial-adviser',
    name: 'Financial Adviser',
    regulator: 'FMA (Financial Markets Authority)',
    description: 'FMA-regulated. Must assess client risk for investment and insurance transactions.',
  },
]

// ─── Risk Assessment Questions ───────────────────────────────────────────────

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: 'business-type',
    question: 'What type of business do you operate?',
    helpText: 'Select the category that best describes your primary business activity.',
    options: [
      { label: 'Accountant / Tax Agent', value: 'accountant', riskWeight: 2 },
      { label: 'Lawyer / Law Firm', value: 'lawyer', riskWeight: 2 },
      { label: 'Real Estate Agent', value: 'real-estate', riskWeight: 3 },
      { label: 'Conveyancer', value: 'conveyancer', riskWeight: 3 },
      { label: 'Financial Adviser', value: 'financial-adviser', riskWeight: 2 },
    ],
  },
  {
    id: 'client-base',
    question: 'What is your typical client base?',
    helpText: 'Consider the majority of your clients over the past 12 months.',
    options: [
      { label: 'Mostly individuals (PAYE employees)', value: 'individuals', riskWeight: 1 },
      { label: 'Small businesses (under $2M turnover)', value: 'small-business', riskWeight: 2 },
      { label: 'Medium-large businesses or trusts', value: 'medium-large', riskWeight: 2 },
      { label: 'Mix including high-net-worth individuals', value: 'hnw-mix', riskWeight: 3 },
    ],
  },
  {
    id: 'transaction-types',
    question: 'What types of transactions do you commonly handle?',
    helpText: 'Select the highest-risk transaction type you regularly deal with.',
    options: [
      { label: 'Standard tax returns and bookkeeping', value: 'standard-tax', riskWeight: 1 },
      { label: 'Property transactions or conveyancing', value: 'property', riskWeight: 3 },
      { label: 'Trust formation or company incorporation', value: 'trust-company', riskWeight: 3 },
      { label: 'Financial planning and investments', value: 'investments', riskWeight: 2 },
    ],
  },
  {
    id: 'transaction-value',
    question: 'What is the typical value of transactions you handle?',
    options: [
      { label: 'Under $50,000', value: 'under-50k', riskWeight: 1 },
      { label: '$50,000 – $250,000', value: '50k-250k', riskWeight: 2 },
      { label: '$250,000 – $1,000,000', value: '250k-1m', riskWeight: 2 },
      { label: 'Over $1,000,000', value: 'over-1m', riskWeight: 3 },
    ],
  },
  {
    id: 'geographic-exposure',
    question: 'Do your clients have significant overseas connections?',
    helpText: 'Consider clients with overseas bank accounts, foreign income, or international business dealings.',
    options: [
      { label: 'No — almost all NZ-based clients', value: 'nz-only', riskWeight: 1 },
      { label: 'Some clients with Australia/UK ties', value: 'aus-uk', riskWeight: 1 },
      { label: 'Clients with connections to multiple countries', value: 'multi-country', riskWeight: 2 },
      { label: 'Clients with high-risk jurisdiction connections', value: 'high-risk-jurisdictions', riskWeight: 3 },
    ],
  },
  {
    id: 'pep-exposure',
    question: 'Do you deal with Politically Exposed Persons (PEPs)?',
    helpText: 'PEPs include foreign government officials, senior politicians, judges, or their close associates/family.',
    options: [
      { label: 'No PEP clients that I am aware of', value: 'no-peps', riskWeight: 1 },
      { label: 'Domestic PEPs only (NZ politicians, etc.)', value: 'domestic-peps', riskWeight: 2 },
      { label: 'Foreign PEPs or associates of PEPs', value: 'foreign-peps', riskWeight: 3 },
    ],
  },
  {
    id: 'cash-handling',
    question: 'How much cash do you handle or encounter in client transactions?',
    options: [
      { label: 'No cash — everything is electronic', value: 'no-cash', riskWeight: 1 },
      { label: 'Occasional small cash amounts', value: 'occasional-cash', riskWeight: 2 },
      { label: 'Regular or large cash transactions', value: 'regular-cash', riskWeight: 3 },
    ],
  },
  {
    id: 'new-technology',
    question: 'Do your clients use cryptocurrency or other new payment methods?',
    options: [
      { label: 'No — traditional banking only', value: 'traditional', riskWeight: 1 },
      { label: 'Some clients have minor crypto holdings', value: 'minor-crypto', riskWeight: 2 },
      { label: 'Significant crypto or virtual asset activity', value: 'significant-crypto', riskWeight: 3 },
    ],
  },
  {
    id: 'delivery-channel',
    question: 'How do you typically interact with clients?',
    helpText: 'Non-face-to-face interactions carry higher risk as identity verification is more difficult.',
    options: [
      { label: 'Mostly face-to-face meetings', value: 'face-to-face', riskWeight: 1 },
      { label: 'Mix of in-person and remote (video/phone)', value: 'mixed', riskWeight: 2 },
      { label: 'Mostly remote — rarely meet clients in person', value: 'mostly-remote', riskWeight: 3 },
    ],
  },
  {
    id: 'compliance-maturity',
    question: 'What is your current AML/CFT compliance status?',
    helpText: 'Be honest — this helps determine what you need to work on.',
    options: [
      { label: 'Full programme in place, regularly reviewed', value: 'mature', riskWeight: 1 },
      { label: 'Basic programme exists but needs updating', value: 'basic', riskWeight: 2 },
      { label: 'Minimal or no AML/CFT programme in place', value: 'minimal', riskWeight: 3 },
    ],
  },
]

// ─── Risk Calculation ────────────────────────────────────────────────────────

const RISK_AREAS: { area: string; questionIds: string[] }[] = [
  { area: 'Business & Client Risk', questionIds: ['business-type', 'client-base'] },
  { area: 'Transaction Risk', questionIds: ['transaction-types', 'transaction-value'] },
  { area: 'Geographic & PEP Risk', questionIds: ['geographic-exposure', 'pep-exposure'] },
  { area: 'Channel & Technology Risk', questionIds: ['cash-handling', 'new-technology', 'delivery-channel'] },
  { area: 'Compliance Maturity', questionIds: ['compliance-maturity'] },
]

function scoreToLevel(score: number): RiskLevel {
  if (score <= 1.5) return 'low'
  if (score <= 2.3) return 'medium'
  return 'high'
}

const AREA_RECOMMENDATIONS: Record<string, Record<RiskLevel, string[]>> = {
  'Business & Client Risk': {
    low: ['Maintain standard CDD procedures', 'Annual client risk review is sufficient'],
    medium: ['Consider enhanced CDD for higher-risk client segments', 'Review client onboarding procedures every 6 months'],
    high: ['Implement enhanced CDD for all new clients', 'Quarterly client risk reviews required', 'Consider external AML/CFT audit'],
  },
  'Transaction Risk': {
    low: ['Standard transaction monitoring is adequate', 'Document unusual transactions as they occur'],
    medium: ['Implement transaction monitoring thresholds', 'Flag property transactions over $1M for enhanced review'],
    high: ['Automated transaction monitoring recommended', 'All high-value transactions require senior sign-off', 'Monthly transaction pattern review'],
  },
  'Geographic & PEP Risk': {
    low: ['Standard geographic screening sufficient', 'No additional PEP screening required beyond standard CDD'],
    medium: ['Screen clients against PEP databases', 'Enhanced due diligence for clients with overseas connections'],
    high: ['Mandatory PEP screening for all clients', 'Enhanced CDD for all foreign-connected clients', 'Subscribe to a PEP/sanctions screening service'],
  },
  'Channel & Technology Risk': {
    low: ['Standard identity verification procedures adequate', 'No special crypto/cash monitoring needed'],
    medium: ['Consider electronic identity verification for remote clients', 'Monitor cash transactions and crypto holdings'],
    high: ['Mandatory electronic identity verification', 'Implement crypto transaction monitoring', 'Cash transaction reporting required for amounts over $10,000'],
  },
  'Compliance Maturity': {
    low: ['Schedule annual programme review', 'Continue staff training programme'],
    medium: ['Update compliance programme within 3 months', 'Conduct staff training refresh', 'Consider engaging AML/CFT compliance consultant'],
    high: ['Urgently establish AML/CFT compliance programme', 'Engage specialist AML/CFT consultant', 'Prioritise staff training', 'Register with your supervisor (DIA/FMA)'],
  },
}

export function calculateRiskAssessment(answers: RiskAssessmentAnswers): RiskAssessmentResult {
  const areas: RiskAreaResult[] = RISK_AREAS.map(({ area, questionIds }) => {
    const scores = questionIds
      .map((qid) => {
        const question = RISK_QUESTIONS.find((q) => q.id === qid)
        const answer = answers[qid]
        if (!question || !answer) return null
        const option = question.options.find((o) => o.value === answer)
        return option?.riskWeight ?? null
      })
      .filter((s): s is number => s !== null)

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 1
    const level = scoreToLevel(avgScore)

    return {
      area,
      level,
      score: Math.round(avgScore * 10) / 10,
      recommendations: AREA_RECOMMENDATIONS[area]?.[level] ?? [],
    }
  })

  const allScores = areas.map((a) => a.score)
  const overallScore = allScores.length > 0
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : 1

  return {
    overallLevel: scoreToLevel(overallScore),
    overallScore,
    areas,
    completedAt: new Date().toISOString(),
    businessType: (answers['business-type'] as RiskAssessmentResult['businessType']) ?? null,
  }
}

// ─── CDD Checklist Items ─────────────────────────────────────────────────────

export const CDD_ITEMS: CDDItem[] = [
  // Standard CDD (8 items)
  {
    id: 'std-1',
    level: 'standard',
    label: 'Verify full legal name',
    description: 'Obtain and verify the customer\'s full legal name using a reliable, independent source document (e.g., NZ passport, driver licence).',
    required: true,
  },
  {
    id: 'std-2',
    level: 'standard',
    label: 'Verify date of birth',
    description: 'Confirm date of birth from an official government-issued document.',
    required: true,
  },
  {
    id: 'std-3',
    level: 'standard',
    label: 'Verify address',
    description: 'Obtain current residential address and verify using a utility bill, bank statement, or government correspondence (within last 3 months).',
    required: true,
  },
  {
    id: 'std-4',
    level: 'standard',
    label: 'Determine nature and purpose of business relationship',
    description: 'Understand why the client is seeking your services and what the expected pattern of activity will be.',
    required: true,
  },
  {
    id: 'std-5',
    level: 'standard',
    label: 'Verify company/trust details (if applicable)',
    description: 'For legal entities: obtain incorporation documents, trust deeds, or partnership agreements. Verify on the Companies Register.',
    required: true,
  },
  {
    id: 'std-6',
    level: 'standard',
    label: 'Identify beneficial owners',
    description: 'Identify all individuals who own or control 25% or more of the entity, or who exercise effective control.',
    required: true,
  },
  {
    id: 'std-7',
    level: 'standard',
    label: 'Screen against sanctions lists',
    description: 'Check client name against NZ designated persons list and UN Security Council consolidated list.',
    required: true,
  },
  {
    id: 'std-8',
    level: 'standard',
    label: 'Obtain source of funds information',
    description: 'Understand the origin of funds for the transaction or business relationship.',
    required: true,
  },
  // Enhanced CDD (6 items)
  {
    id: 'enh-1',
    level: 'enhanced',
    label: 'Obtain senior management approval',
    description: 'Senior management must approve the establishment or continuation of the business relationship.',
    required: true,
  },
  {
    id: 'enh-2',
    level: 'enhanced',
    label: 'Verify source of wealth',
    description: 'Determine and verify the source of the client\'s overall wealth, not just the funds for the specific transaction.',
    required: true,
  },
  {
    id: 'enh-3',
    level: 'enhanced',
    label: 'Conduct PEP screening',
    description: 'Screen client and beneficial owners against Politically Exposed Persons databases.',
    required: true,
  },
  {
    id: 'enh-4',
    level: 'enhanced',
    label: 'Enhanced ongoing monitoring',
    description: 'Increase the frequency and intensity of transaction monitoring and periodic reviews.',
    required: true,
  },
  {
    id: 'enh-5',
    level: 'enhanced',
    label: 'Obtain additional identity documents',
    description: 'Require a second form of photo ID or additional verification beyond standard CDD.',
    required: true,
  },
  {
    id: 'enh-6',
    level: 'enhanced',
    label: 'Document risk assessment rationale',
    description: 'Record the specific reasons why enhanced CDD is being applied and the risk factors identified.',
    required: true,
  },
  // Simplified CDD (4 items)
  {
    id: 'sim-1',
    level: 'simplified',
    label: 'Verify client is eligible for simplified CDD',
    description: 'Confirm the client is a listed entity (e.g., NZ government body, NZ-listed company, regulated financial institution).',
    required: true,
  },
  {
    id: 'sim-2',
    level: 'simplified',
    label: 'Obtain basic identification',
    description: 'Collect minimum identification information — name and entity type may be sufficient.',
    required: true,
  },
  {
    id: 'sim-3',
    level: 'simplified',
    label: 'Document basis for simplified CDD',
    description: 'Record why simplified CDD is appropriate and which exemption category applies.',
    required: true,
  },
  {
    id: 'sim-4',
    level: 'simplified',
    label: 'Monitor for changes in risk',
    description: 'Even with simplified CDD, monitor for any changes that might require standard or enhanced CDD.',
    required: true,
  },
]

// ─── SAR Indicators ──────────────────────────────────────────────────────────

export const SAR_CATEGORIES: { id: SARCategory; label: string; icon: string }[] = [
  { id: 'unusual-transactions', label: 'Unusual Transactions', icon: '💰' },
  { id: 'client-behaviour', label: 'Client Behaviour', icon: '👤' },
  { id: 'document-concerns', label: 'Document Red Flags', icon: '📄' },
  { id: 'geographic-concerns', label: 'Geographic Concerns', icon: '🌏' },
]

export const SAR_INDICATORS: SARIndicator[] = [
  // Unusual Transactions
  {
    id: 'ut-1',
    category: 'unusual-transactions',
    title: 'Unusually large or complex transactions',
    description: 'Transactions that are significantly larger than expected for the client\'s profile or that involve unnecessarily complex structures.',
    whatToDo: 'Compare against the client\'s known profile. Document the transaction details and your concerns. Consider filing a SAR.',
  },
  {
    id: 'ut-2',
    category: 'unusual-transactions',
    title: 'Structuring or "smurfing"',
    description: 'Multiple transactions just below reporting thresholds, or splitting a large transaction into several smaller ones.',
    whatToDo: 'This is a strong indicator of money laundering. File a SAR immediately. Do not tip off the client.',
  },
  {
    id: 'ut-3',
    category: 'unusual-transactions',
    title: 'Rapid movement of funds',
    description: 'Funds are received and immediately transferred elsewhere with no apparent business reason.',
    whatToDo: 'Document the flow of funds. Consider whether the account is being used as a pass-through. File a SAR.',
  },
  {
    id: 'ut-4',
    category: 'unusual-transactions',
    title: 'Round-sum transactions',
    description: 'Frequent transactions in round numbers (e.g., exactly $10,000, $50,000) which don\'t correspond to normal business activity.',
    whatToDo: 'Assess whether the amounts align with the client\'s known business activity. Document and consider filing a SAR.',
  },
  {
    id: 'ut-5',
    category: 'unusual-transactions',
    title: 'Inconsistent source of funds',
    description: 'Funds originate from sources that don\'t match the client\'s stated occupation, business activity, or known wealth.',
    whatToDo: 'Ask the client to explain the source of funds. If unsatisfied with the explanation, file a SAR.',
  },
  {
    id: 'ut-6',
    category: 'unusual-transactions',
    title: 'Use of third-party accounts',
    description: 'Client uses accounts held by other persons or entities without clear business justification.',
    whatToDo: 'Seek explanation for the arrangement. Verify the relationship between parties. File a SAR if suspicious.',
  },
  // Client Behaviour
  {
    id: 'cb-1',
    category: 'client-behaviour',
    title: 'Reluctance to provide information',
    description: 'Client is unwilling to provide standard identification documents or information about the transaction.',
    whatToDo: 'Explain your legal obligations. If the client still refuses, you must not proceed with the transaction. File a SAR.',
  },
  {
    id: 'cb-2',
    category: 'client-behaviour',
    title: 'Unusual interest in your AML procedures',
    description: 'Client asks detailed questions about your reporting thresholds, record-keeping, or compliance procedures.',
    whatToDo: 'Do not reveal specific thresholds or procedures. Document the conversation. Consider filing a SAR.',
  },
  {
    id: 'cb-3',
    category: 'client-behaviour',
    title: 'Urgency without business reason',
    description: 'Client insists on completing transactions unusually quickly without a legitimate commercial reason.',
    whatToDo: 'Take time to conduct proper due diligence regardless of pressure. Document the urgency. File a SAR if warranted.',
  },
  {
    id: 'cb-4',
    category: 'client-behaviour',
    title: 'Changes in transaction patterns',
    description: 'Existing client suddenly changes their transaction behaviour — larger amounts, different destinations, new types of activity.',
    whatToDo: 'Review the client\'s transaction history. Ask about the reason for changes. Update CDD and consider filing a SAR.',
  },
  {
    id: 'cb-5',
    category: 'client-behaviour',
    title: 'Use of nominees or agents',
    description: 'Client conducts transactions through nominees, agents, or associates without clear business purpose.',
    whatToDo: 'Identify the ultimate beneficial party. Conduct CDD on all parties involved. File a SAR if concerned.',
  },
  {
    id: 'cb-6',
    category: 'client-behaviour',
    title: 'Attempting to avoid record-keeping',
    description: 'Client requests transactions to be conducted off the books, in cash, or without proper documentation.',
    whatToDo: 'Refuse the request. Explain your legal obligations. File a SAR. Consider ending the business relationship.',
  },
  // Document Red Flags
  {
    id: 'dc-1',
    category: 'document-concerns',
    title: 'Suspicious identity documents',
    description: 'Documents that appear altered, forged, or inconsistent. Different documents show different details.',
    whatToDo: 'Do not accept suspicious documents. Request original or alternative forms of ID. File a SAR.',
  },
  {
    id: 'dc-2',
    category: 'document-concerns',
    title: 'Mismatched business records',
    description: 'Financial records don\'t match the client\'s stated business activity, or there are significant unexplained discrepancies.',
    whatToDo: 'Ask the client to explain discrepancies. Engage forensic accountant if necessary. File a SAR if explanations are inadequate.',
  },
  {
    id: 'dc-3',
    category: 'document-concerns',
    title: 'Shell company indicators',
    description: 'Company has no physical address, no employees, nominal directors, or share capital inconsistent with its transactions.',
    whatToDo: 'Conduct enhanced due diligence on the company and its beneficial owners. File a SAR if concerned.',
  },
  {
    id: 'dc-4',
    category: 'document-concerns',
    title: 'Complex ownership structures',
    description: 'Multiple layers of companies, trusts, or nominees that obscure the true beneficial owner.',
    whatToDo: 'Trace through all layers to identify the ultimate beneficial owner. If unable to identify, do not proceed. File a SAR.',
  },
  {
    id: 'dc-5',
    category: 'document-concerns',
    title: 'Backdated or falsified invoices',
    description: 'Invoices or contracts that appear to have been created after the fact to justify a transaction.',
    whatToDo: 'Verify invoices independently where possible. Document your concerns. File a SAR.',
  },
  // Geographic Concerns
  {
    id: 'gc-1',
    category: 'geographic-concerns',
    title: 'High-risk jurisdiction connections',
    description: 'Client has connections to countries identified by FATF as having weak AML/CFT controls (FATF grey/black list).',
    whatToDo: 'Check the current FATF list. Apply enhanced CDD. File a SAR if the connection is unexplained or suspicious.',
  },
  {
    id: 'gc-2',
    category: 'geographic-concerns',
    title: 'Sanctions-listed country connections',
    description: 'Transactions involving countries subject to NZ, UN, or other sanctions programmes.',
    whatToDo: 'Check NZ sanctions list and UN consolidated list. Do not proceed with sanctioned transactions. Report immediately.',
  },
  {
    id: 'gc-3',
    category: 'geographic-concerns',
    title: 'Tax haven connections without business purpose',
    description: 'Use of entities in known tax haven jurisdictions without a clear legitimate business reason.',
    whatToDo: 'Ask client to explain the business purpose. Assess whether the structure is legitimate. File a SAR if concerned.',
  },
  {
    id: 'gc-4',
    category: 'geographic-concerns',
    title: 'Multiple cross-border transactions',
    description: 'Frequent international transfers that don\'t align with the client\'s known business operations.',
    whatToDo: 'Review the pattern and destinations. Request explanation from client. Apply enhanced monitoring. File a SAR if suspicious.',
  },
  {
    id: 'gc-5',
    category: 'geographic-concerns',
    title: 'Unusual real estate purchases by foreign buyers',
    description: 'Overseas persons purchasing NZ property through complex structures, at significantly above or below market value.',
    whatToDo: 'Verify the buyer\'s identity and source of funds. Check OIO requirements. File a SAR if the transaction is suspicious.',
  },
]

// ─── Compliance Programme Template ───────────────────────────────────────────

export const PROGRAMME_SECTIONS: ProgrammeSection[] = [
  {
    id: 'scope',
    title: '1. Scope and Purpose',
    content: [
      'This AML/CFT compliance programme has been prepared in accordance with the Anti-Money Laundering and Countering Financing of Terrorism Act 2009 (the Act) and the Anti-Money Laundering and Countering Financing of Terrorism (Requirements and Compliance) Regulations 2011.',
      'The purpose of this programme is to detect, deter, and manage the risk of money laundering and terrorism financing in connection with the services provided by this business.',
      'This programme applies to all staff, contractors, and agents of the business who are involved in providing services to customers.',
    ],
  },
  {
    id: 'risk-assessment',
    title: '2. Risk Assessment Summary',
    content: [
      'A risk assessment has been conducted to identify and assess the money laundering and terrorism financing risks faced by this business.',
      'The risk assessment considers: the nature, size, and complexity of the business; the products and services offered; the delivery channels used; the types of customers dealt with; the countries and geographic areas of operation.',
      'The risk assessment is reviewed and updated at least annually, or whenever there is a material change in the nature or operations of the business.',
    ],
  },
  {
    id: 'cdd-procedures',
    title: '3. Customer Due Diligence (CDD) Procedures',
    content: [
      'Standard CDD is conducted for all new customers before establishing a business relationship or carrying out an occasional transaction. This includes: verifying the customer\'s identity using reliable, independent source documents; determining the nature and purpose of the business relationship; identifying beneficial owners.',
      'Enhanced CDD is applied when: dealing with a Politically Exposed Person (PEP); the customer is from a high-risk country; the transaction is complex, unusually large, or follows an unusual pattern; there are any other grounds for suspicion.',
      'Simplified CDD may be applied when the customer is: a listed entity (NZ government body, NZ-listed company); a regulated financial institution; or otherwise assessed as presenting a low risk of money laundering or terrorism financing.',
      'CDD must be completed before services are provided. If CDD cannot be completed, the business relationship must not be established.',
    ],
  },
  {
    id: 'ongoing-monitoring',
    title: '4. Ongoing Monitoring',
    content: [
      'All business relationships are subject to ongoing monitoring proportionate to the risk level of the customer.',
      'Monitoring includes: reviewing transactions to ensure consistency with the customer\'s known profile; keeping CDD information up to date; and detecting any suspicious activity.',
      'Higher-risk customers are subject to more frequent and intensive monitoring.',
    ],
  },
  {
    id: 'sar-reporting',
    title: '5. Suspicious Activity Reporting',
    content: [
      'Any staff member who suspects or has reasonable grounds to suspect that a transaction or activity may be related to money laundering or terrorism financing must immediately report the matter internally to the AML/CFT Compliance Officer.',
      'The Compliance Officer will assess the report and, if satisfied there are reasonable grounds for suspicion, will file a Suspicious Activity Report (SAR) with the NZ Police Financial Intelligence Unit (FIU) as soon as practicable.',
      'Tipping off is a criminal offence under the Act. No staff member may disclose to any person that a SAR has been or is being filed, or that an investigation is being or may be conducted.',
      'SARs are filed via the goAML system operated by the NZ Police FIU.',
    ],
  },
  {
    id: 'record-keeping',
    title: '6. Record Keeping',
    content: [
      'All records obtained through CDD and transaction monitoring must be retained for at least 5 years after the end of the business relationship or the completion of the occasional transaction.',
      'SAR records must be retained for at least 5 years after the date of the report.',
      'Records must be sufficient to permit reconstruction of individual transactions so as to provide evidence for prosecution of any offence.',
      'Records may be kept in electronic form provided they are readily accessible and can be made available to the supervisor on request.',
    ],
  },
  {
    id: 'staff-training',
    title: '7. Staff Training',
    content: [
      'All staff involved in providing services to customers must receive AML/CFT training before commencing their duties and at regular intervals thereafter (at least annually).',
      'Training covers: the requirements of the Act and regulations; this compliance programme; how to identify suspicious activity; how to report suspicious activity internally; the offence of tipping off.',
      'Training records are maintained, including the date, content, and attendees of each training session.',
    ],
  },
  {
    id: 'programme-review',
    title: '8. Programme Review',
    content: [
      'This compliance programme is reviewed at least every 2 years, or more frequently if there are material changes to the business or the regulatory environment.',
      'The programme is independently audited at least every 3 years in accordance with the Act.',
      'The AML/CFT Compliance Officer is responsible for ensuring the programme remains up to date and effective.',
      'Any changes to this programme are documented and communicated to all relevant staff.',
    ],
  },
]
