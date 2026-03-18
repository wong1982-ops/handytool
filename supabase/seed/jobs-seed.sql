-- Seed data for Job Radar local testing
-- Clear existing seed data first
DELETE FROM public.jobs WHERE source_id LIKE 'seek-%' OR source_id LIKE 'indeed-%' OR source_id LIKE 'linkedin-%' OR source_id LIKE 'trademe-%';

INSERT INTO public.jobs (source, source_id, source_url, title, title_normalised, company, company_normalised, location, location_normalised, category, country, employment_type, work_mode, salary_min, salary_max, hourly_rate_min, hourly_rate_max, salary_currency, description, tags, posted_at, scraped_at)
VALUES
  ('seek', 'seek-001', 'https://www.seek.com.au/software-engineer-jobs/in-Sydney-NSW', 'Senior Software Engineer', 'software engineer', 'Atlassian', 'atlassian', 'Sydney, NSW', 'sydney', 'it', 'AU', 'full-time', 'hybrid', 180000, 220000, NULL, NULL, 'AUD',
   'About the role

We are looking for a Senior Software Engineer to join our Developer Experience team in Sydney. You will be responsible for building next-generation developer tools that empower millions of software teams worldwide.

Key responsibilities:
- Design and implement scalable microservices using TypeScript, Node.js, and React
- Collaborate with product managers and designers to deliver high-quality user experiences
- Mentor junior engineers and contribute to engineering culture
- Participate in on-call rotation and incident response

Requirements:
- 5+ years of experience in software engineering
- Strong proficiency in React, TypeScript, and modern frontend frameworks
- Experience with distributed systems and cloud-native architectures (AWS preferred)
- Excellent communication skills and ability to work in cross-functional teams

Nice to have:
- Experience with GraphQL, Kafka, or event-driven architectures
- Contributions to open-source projects
- Experience with CI/CD pipelines and infrastructure as code

Benefits:
- Flexible hybrid working (3 days office, 2 days remote)
- 20 days annual leave + 5 wellness days
- Professional development budget of $3,000/year
- Stock options and competitive salary package',
   ARRAY['React', 'TypeScript', 'Node.js', 'AWS', 'Distributed Systems'], now() - interval '1 day', now()),

  ('indeed', 'indeed-001', 'https://au.indeed.com/jobs?q=devops+engineerhttps://indeed.com.au/job/001l=Sydney', 'DevOps Engineer', 'devops engineer', 'Canva Pty Ltd', 'canva', 'Sydney CBD', 'sydney', 'it', 'AU', 'full-time', 'remote', 160000, 200000, NULL, NULL, 'AUD',
   'About Canva

At Canva, our mission is to empower the world to design. We are looking for a DevOps Engineer to join our Platform Engineering team.

What you will do:
- Build and maintain CI/CD pipelines serving 1000+ deployments per day
- Manage and optimise Kubernetes clusters across multiple AWS regions
- Implement infrastructure as code using Terraform and CloudFormation
- Design monitoring and alerting solutions using Datadog and PagerDuty
- Collaborate with development teams to improve deployment reliability and speed

What we are looking for:
- 3+ years in DevOps, SRE, or Platform Engineering roles
- Deep experience with AWS services (EKS, EC2, RDS, S3, Lambda)
- Proficiency with Kubernetes, Docker, and container orchestration
- Experience with Terraform or similar IaC tools
- Strong scripting skills (Python, Bash, or Go)
- Understanding of networking, security, and compliance best practices

This is a fully remote role open to candidates anywhere in Australia.',
   ARRAY['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Python'], now() - interval '2 days', now()),

  ('linkedin', 'linkedin-001', 'https://www.linkedin.com/jobs/search/?keywords=frontend+developerhttps://linkedin.com/jobs/001location=Melbourne', 'Frontend Developer', 'frontend developer', 'The Iconic', 'iconic', 'Melbourne, VIC', 'melbourne', 'it', 'AU', 'contract', 'onsite', NULL, NULL, 95, 120, 'AUD',
   'Contract: 6 months with potential extension

The Iconic is Australia''s leading online fashion retailer. We are seeking a skilled Frontend Developer to join our e-commerce platform team on a contract basis.

You will:
- Build responsive, high-performance e-commerce experiences using React and Next.js
- Implement pixel-perfect designs from Figma mockups
- Optimise Core Web Vitals and page load performance
- Write comprehensive unit and integration tests
- Work closely with UX designers and backend engineers

Required skills:
- 3+ years of frontend development experience
- Expert-level React and Next.js (App Router)
- Strong CSS/Tailwind skills with responsive design expertise
- Experience with e-commerce platforms or high-traffic consumer applications
- Git, code review, and agile development practices

Rate: $95-$120/hr + super, paid weekly',
   ARRAY['React', 'Next.js', 'TypeScript', 'CSS', 'Tailwind', 'E-commerce'], now() - interval '3 days', now()),

  ('trademe', 'trademe-001', 'https://www.trademe.co.nz/a/jobs/it/search?search_string=full+stack+developer', 'Full Stack Developer', 'fullstack developer', 'Xero Limited', 'xero', 'Wellington', 'wellington', 'it', 'NZ', 'full-time', 'hybrid', 120000, 160000, NULL, NULL, 'NZD',
   'About Xero

Xero is a global small business platform with 3.95 million subscribers. We are hiring a Full Stack Developer for our Wellington office.

The role:
- Develop features for our cloud accounting platform used by millions of small businesses
- Work across the full stack: React frontend, Node.js/TypeScript backend, PostgreSQL database
- Participate in agile ceremonies and contribute to sprint planning
- Write clean, well-tested, and documented code
- Collaborate with product owners to understand and refine requirements

About you:
- 2-5 years of full-stack development experience
- Proficiency in TypeScript, React, and Node.js
- Experience with relational databases (PostgreSQL preferred)
- Understanding of RESTful API design and microservices architecture
- Strong problem-solving skills and attention to detail

We offer:
- Hybrid working (2-3 days in our Wellington CBD office)
- 4 weeks annual leave + Wellbeing Day each month
- Share options and competitive salary
- Learning & development budget',
   ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST API'], now() - interval '1 day', now()),

  ('seek', 'seek-002', 'https://www.seek.com.au/data-engineer-jobs/in-Sydney-NSW', 'Data Engineer', 'data engineer', 'Commonwealth Bank', 'commonwealth bank', 'Sydney, NSW', 'sydney', 'it', 'AU', 'full-time', 'hybrid', 150000, 190000, NULL, NULL, 'AUD',
   'Commonwealth Bank — Data & Analytics Division

We are seeking a Data Engineer to design, build, and maintain data pipelines that power real-time analytics and machine learning across our banking platform.

Responsibilities:
- Build and optimise ETL/ELT pipelines using Apache Spark and Airflow
- Design data models for our data lakehouse on AWS (S3, Glue, Athena)
- Implement real-time streaming solutions with Kafka and Flink
- Ensure data quality, governance, and compliance with banking regulations
- Collaborate with data scientists and analysts to deliver actionable insights

Requirements:
- 3+ years experience as a Data Engineer or similar role
- Strong Python and SQL skills
- Experience with Apache Spark, Airflow, or similar big data frameworks
- Familiarity with cloud data platforms (AWS, GCP, or Azure)
- Understanding of data modelling, warehousing, and lake architectures

Security clearance may be required for this role.',
   ARRAY['Python', 'Spark', 'Airflow', 'SQL', 'AWS', 'Kafka'], now() - interval '5 days', now()),

  ('indeed', 'indeed-002', 'https://au.indeed.com/jobs?q=qa+test+engineerhttps://indeed.com.au/job/002l=Melbourne', 'QA Test Engineer', 'qa test engineer', 'REA Group', 'rea group', 'Melbourne, VIC', 'melbourne', 'it', 'AU', 'contract', 'remote', NULL, NULL, 80, 100, 'AUD',
   'Contract: 12 months | Fully Remote

REA Group (realestate.com.au) is looking for a QA Test Engineer to join our Quality Engineering team.

What you will do:
- Design and implement automated test suites using Playwright and Jest
- Create and maintain test plans, test cases, and test data
- Perform API testing using Postman and custom scripts
- Integrate automated tests into CI/CD pipelines (GitHub Actions)
- Collaborate with developers to identify and resolve defects early
- Advocate for quality best practices across the engineering team

What you need:
- 3+ years in QA/Test Engineering with a focus on automation
- Strong experience with Playwright, Cypress, or Selenium
- Proficiency in TypeScript or JavaScript
- Experience with REST API testing
- Understanding of agile methodologies (Scrum/Kanban)
- Excellent analytical and communication skills

Rate: $80-$100/hr inclusive of super',
   ARRAY['Playwright', 'Jest', 'TypeScript', 'API Testing', 'QA', 'GitHub Actions'], now() - interval '7 days', now()),

  ('seek', 'seek-003', 'https://www.seek.com.au/cloud-security-analyst-jobs/in-Melbourne-VIC', 'Cloud Security Analyst', 'cloud security analyst', 'NAB', 'nab', 'Melbourne CBD', 'melbourne', 'it', 'AU', 'full-time', 'onsite', 140000, 170000, NULL, NULL, 'AUD',
   'National Australia Bank — Cyber Security Division

NAB is seeking a Cloud Security Analyst to protect our cloud infrastructure and ensure compliance with regulatory requirements.

Key responsibilities:
- Monitor and respond to security threats across AWS and Azure cloud environments
- Conduct vulnerability assessments and penetration testing
- Manage SIEM tools (Splunk, Microsoft Sentinel) for threat detection
- Develop and maintain security policies, procedures, and runbooks
- Investigate security incidents and coordinate response activities
- Work with development teams to implement secure coding practices

Requirements:
- 3+ years in cybersecurity or information security
- Experience with cloud security (AWS Security Hub, Azure Security Center)
- Knowledge of SIEM platforms (Splunk, Sentinel, or similar)
- Understanding of NIST, ISO 27001, and APRA CPS 234 frameworks
- Relevant certifications (CISSP, CISM, AWS Security Specialty) preferred
- Australian citizenship required (security clearance)',
   ARRAY['AWS', 'Azure', 'SIEM', 'Splunk', 'Security', 'CISSP'], now() - interval '10 days', now()),

  ('seek', 'seek-f01', 'https://www.seek.com.au/french-speaking-jobs/in-Sydney-NSW', 'French Speaking Customer Support', 'french speaking customer support', 'Airbus Pacific', 'airbus pacific', 'Sydney, NSW', 'sydney', 'french', 'AU', 'full-time', 'hybrid', 70000, 85000, NULL, NULL, 'AUD',
   'Airbus Pacific — Customer Support Centre

We are looking for a French Speaking Customer Support Specialist to join our Asia-Pacific customer support centre in Sydney.

The role:
- Provide first-level technical and commercial support to French-speaking customers across the Pacific region
- Handle customer enquiries via phone, email, and live chat in both French and English
- Escalate complex issues to engineering and commercial teams
- Maintain accurate records in Salesforce CRM
- Contribute to knowledge base articles in French and English

Requirements:
- Fluent in French and English (written and spoken) — native-level French preferred
- 2+ years in customer support or client-facing roles
- Strong communication and problem-solving skills
- Experience with CRM systems (Salesforce preferred)
- Knowledge of aviation industry is a plus but not required

Working hours: Monday-Friday, 8am-5pm AEST with occasional evening shifts for European coverage',
   ARRAY['French', 'Customer Support', 'Bilingual', 'Salesforce', 'CRM'], now() - interval '2 days', now()),

  ('trademe', 'trademe-f01', 'https://www.trademe.co.nz/a/jobs/education/search?search_string=french+teacher', 'French Language Teacher', 'french language teacher', 'Alliance Française', 'alliance francaise', 'Auckland', 'auckland', 'french', 'NZ', 'part-time', 'onsite', 55000, 70000, NULL, NULL, 'NZD',
   'Alliance Française Auckland

We are seeking a passionate French Language Teacher to deliver engaging French language courses to adult learners at our Auckland campus.

Responsibilities:
- Teach beginner to advanced French classes (A1 to C1 levels)
- Prepare lesson plans aligned with CEFR standards
- Assess student progress through regular testing and feedback
- Organise cultural events and conversation clubs
- Maintain student records and attendance

Requirements:
- Native or near-native French speaker
- Teaching qualification (DAEFLE, FLE, or equivalent)
- 2+ years of French language teaching experience
- Engaging and interactive teaching style
- Experience with online teaching platforms (Zoom, Teams) is a plus

This is a part-time position (20 hours/week) with the possibility of increasing to full-time.',
   ARRAY['French', 'Teaching', 'Education', 'CEFR', 'Language'], now() - interval '4 days', now()),

  ('indeed', 'indeed-f01', 'https://au.indeed.com/jobs?q=french+translatorhttps://indeed.com.au/job/f01l=Melbourne', 'French-English Translator', 'french english translator', 'SBS Australia', 'sbs australia', 'Melbourne, VIC', 'melbourne', 'french', 'AU', 'contract', 'remote', NULL, NULL, 55, 75, 'AUD',
   'SBS Australia — Language Services

SBS is seeking a French-English Translator to support our multilingual media content production.

Contract: Ongoing casual / freelance basis

The role:
- Translate news articles, subtitles, and digital content from French to English
- Ensure translations are accurate, culturally appropriate, and maintain editorial tone
- Proofread and edit translated content for quality assurance
- Work to tight deadlines in a fast-paced newsroom environment
- Collaborate with journalists and producers on French-language stories

Requirements:
- Fluent in French and English with excellent written skills in both languages
- Degree in Translation, Linguistics, Journalism, or related field
- 2+ years of professional translation experience
- Experience with subtitling tools (Aegisub, EZTitles) is an advantage
- NAATI accreditation (Professional Translator) preferred
- Strong knowledge of current affairs and international news

This is a remote position. Work is assigned on a per-project basis.',
   ARRAY['French', 'Translation', 'Media', 'Journalism', 'Subtitling', 'NAATI'], now() - interval '6 days', now());
