import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function seedDatabase() {
  console.log('[Seed] Starting database seeding for normalized schema...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Truncate all tables
    console.log('[Seed] Cleaning existing data...');
    await client.query(`
      TRUNCATE TABLE messages, conversation_participants, conversations,
      saved_freelancers, saved_projects, reviews, contracts, proposals,
      project_skills, projects, portfolio_projects, freelancer_skills, skills,
      client_profiles, freelancer_profiles, users
      RESTART IDENTITY CASCADE;
    `);

    const passwordHash = await bcrypt.hash('demo123', 10);

    // 2. Insert Skills
    console.log('[Seed] Inserting skills...');
    const skillsList = [
      'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Docker',
      'GraphQL', 'Figma', 'UI/UX Design', 'Design Systems', 'User Research',
      'Python', 'PyTorch', 'LangChain', 'FastAPI', 'AWS', 'Kubernetes', 'Terraform',
      'CI/CD', 'React Native', 'Flutter', 'iOS', 'Android', 'Next.js'
    ];

    const skillMap = {};
    for (const skillName of skillsList) {
      const res = await client.query(
        'INSERT INTO skills (name) VALUES ($1) RETURNING id, name',
        [skillName]
      );
      skillMap[res.rows[0].name] = res.rows[0].id;
    }

    // 3. Insert Users
    console.log('[Seed] Inserting users...');
    const usersResult = await client.query(`
      INSERT INTO users (name, email, password_hash, age, gender, role, bio, avatar_url) VALUES
      (
        'Alex Morgan', 'freelancer@demo.com', $1, 29, 'Male', 'FREELANCER',
        '10+ years architecting scalable SaaS platforms, high-throughput microservices, and slick React interfaces. Passionate about performant database design and clean modular code.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'Sarah Chen', 'sarah@design.io', $1, 28, 'Female', 'FREELANCER',
        'Ex-Stripe designer crafting intuitive, accessible, and conversion-driven digital experiences for mobile and web. Specialized in Figma design systems and user research.',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'Dr. Elena Rostova', 'elena@ai.io', $1, 34, 'Female', 'FREELANCER',
        'PhD in Computer Science focusing on generative AI, fine-tuning open-source LLMs, RAG pipelines, and deploying low-latency AI microservices on Kubernetes.',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'Marcus Vance', 'marcus@cloud.io', $1, 32, 'Male', 'FREELANCER',
        'Certified AWS Solutions Architect helping fast-moving startups automate CI/CD pipelines, configure Kubernetes clusters, and optimize cloud infrastructure costs.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'David Kim', 'david@mobile.io', $1, 27, 'Male', 'FREELANCER',
        'Built and shipped 15+ award-winning iOS and Android mobile apps with 500k+ downloads. Deep expertise in smooth 60fps animations and offline-first sync.',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'Jordan Lee', 'client@demo.com', $1, 36, 'Non-Binary', 'CLIENT',
        'Founder & CEO at Apex Ventures. Building next-generation fintech and enterprise collaborative software.',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
      ),
      (
        'Clara Henderson', 'clara@growthco.com', $1, 38, 'Female', 'CLIENT',
        'VP of Engineering at NovaCommerce. Leading hyper-growth e-commerce brand scaling from $10M to $100M ARR.',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
      )
      RETURNING id, email, role, name;
    `, [passwordHash]);

    const userMap = {};
    usersResult.rows.forEach(u => {
      userMap[u.email] = u.id;
    });

    // 4. Insert Freelancer Profiles
    console.log('[Seed] Inserting freelancer profiles...');
    const freelancerProfilesRes = await client.query(`
      INSERT INTO freelancer_profiles (
        user_id, title, hourly_rate, experience_years, experience_level, 
        location, availability_status, response_time_minutes, projects_completed, 
        success_rate, average_rating
      ) VALUES
      (
        $1, 'Senior Full-Stack Architect & React Specialist', 85.00, 8, 'SENIOR',
        'San Francisco, CA, USA', 'AVAILABLE', 30, 48, 99.00, 4.90
      ),
      (
        $2, 'Lead Product Designer (UI/UX) & Design Systems Lead', 95.00, 7, 'SENIOR',
        'Seattle, WA, USA', 'AVAILABLE', 45, 62, 100.00, 5.00
      ),
      (
        $3, 'AI & Machine Learning Engineer | LLM Agents & NLP', 120.00, 9, 'EXPERT',
        'Boston, MA, USA', 'AVAILABLE', 60, 31, 98.00, 4.90
      ),
      (
        $4, 'Cloud Infrastructure & DevOps Engineer | AWS / K8s', 90.00, 8, 'SENIOR',
        'Austin, TX, USA', 'BUSY', 120, 42, 97.00, 4.80
      ),
      (
        $5, 'Cross-Platform Mobile Engineer (React Native & Flutter)', 75.00, 5, 'MID',
        'Toronto, ON, Canada', 'AVAILABLE', 30, 27, 100.00, 4.90
      )
      RETURNING id, user_id;
    `, [
      userMap['freelancer@demo.com'],
      userMap['sarah@design.io'],
      userMap['elena@ai.io'],
      userMap['marcus@cloud.io'],
      userMap['david@mobile.io']
    ]);

    const fpMap = {};
    freelancerProfilesRes.rows.forEach((fp, idx) => {
      const emails = [
        'freelancer@demo.com',
        'sarah@design.io',
        'elena@ai.io',
        'marcus@cloud.io',
        'david@mobile.io'
      ];
      fpMap[emails[idx]] = fp.id;
    });

    // 5. Insert Client Profiles
    console.log('[Seed] Inserting client profiles...');
    const clientProfilesRes = await client.query(`
      INSERT INTO client_profiles (
        user_id, company_name, company_location, company_description, website
      ) VALUES
      (
        $1, 'Apex Ventures', 'New York, NY, USA',
        'Venture-backed startup studio building fintech and collaborative software platforms.',
        'https://apexventures.example.com'
      ),
      (
        $2, 'NovaCommerce', 'Chicago, IL, USA',
        'Global digital commerce retail group operating high-traffic omnichannel storefronts.',
        'https://novacommerce.example.com'
      )
      RETURNING id, user_id;
    `, [
      userMap['client@demo.com'],
      userMap['clara@growthco.com']
    ]);

    const cpMap = {
      'client@demo.com': clientProfilesRes.rows[0].id,
      'clara@growthco.com': clientProfilesRes.rows[1].id,
    };

    // 6. Insert Freelancer Skills
    console.log('[Seed] Linking freelancer skills...');
    const freelancerSkillsData = [
      { fpId: fpMap['freelancer@demo.com'], skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Docker', 'GraphQL', 'Next.js'] },
      { fpId: fpMap['sarah@design.io'], skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Tailwind CSS'] },
      { fpId: fpMap['elena@ai.io'], skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'AWS', 'PostgreSQL'] },
      { fpId: fpMap['marcus@cloud.io'], skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'] },
      { fpId: fpMap['david@mobile.io'], skills: ['React Native', 'Flutter', 'TypeScript', 'iOS', 'Android', 'GraphQL'] }
    ];

    for (const item of freelancerSkillsData) {
      for (const skillName of item.skills) {
        if (skillMap[skillName]) {
          await client.query(
            'INSERT INTO freelancer_skills (freelancer_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [item.fpId, skillMap[skillName]]
          );
        }
      }
    }

    // 7. Insert Portfolio Projects
    console.log('[Seed] Inserting portfolio projects...');
    await client.query(`
      INSERT INTO portfolio_projects (freelancer_id, title, description, project_url, image_url) VALUES
      (
        $1, 'FinFlow - Real-Time Crypto Analytics Dashboard',
        'A high-frequency financial analytics dashboard built with React 19, Tailwind, WebSockets, and TimescaleDB, rendering 60fps candlestick charts.',
        'https://github.com/alexmorgan/finflow',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
      ),
      (
        $1, 'DocuSynapse - Collaborative Workspace Platform',
        'Notion-style rich markdown collaborative editor with real-time cursor tracking and conflict-free replicated data types.',
        'https://github.com/alexmorgan/docusynapse',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
      ),
      (
        $2, 'Lumina - Accessible Design System & UI Kit',
        'Complete accessible design system with 200+ Figma components, WCAG AAA contrast guidelines, and tokens for dark/light themes.',
        'https://figma.com/@sarahchen/lumina',
        'https://images.unsplash.com/photo-1581291518655-9523c932deda?w=800&auto=format&fit=crop&q=80'
      ),
      (
        $3, 'AgentCraft - Autonomous Support Agent Platform',
        'Enterprise customer service agent leveraging multi-step reasoning, semantic vector search, and automatic tool calling.',
        'https://github.com/elenarostova/agentcraft',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
      ),
      (
        $4, 'ZeroDowntime - GitOps Multi-Region Cluster',
        'Automated Kubernetes multi-region failover pipeline using Terraform, ArgoCD, and AWS EKS with canary deployments.',
        'https://github.com/marcusvance/zerodowntime',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
      ),
      (
        $5, 'FitPulse - AI Fitness & Workout Tracker App',
        'iOS & Android mobile fitness tracker featuring computer-vision rep counting, offline logging, and Apple HealthKit integration.',
        'https://github.com/davidkim/fitpulse',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=80'
      );
    `, [
      fpMap['freelancer@demo.com'],
      fpMap['sarah@design.io'],
      fpMap['elena@ai.io'],
      fpMap['marcus@cloud.io'],
      fpMap['david@mobile.io']
    ]);

    // 8. Insert Projects
    console.log('[Seed] Inserting projects...');
    const projRes = await client.query(`
      INSERT INTO projects (
        client_id, title, description, category, budget_min, budget_max, 
        budget_type, deadline, status
      ) VALUES
      (
        $1, 'Full-Stack Developer for AI Workflow Automation Platform',
        'We need an experienced full-stack engineer to build an interactive canvas workflow builder where users can connect AI nodes, data transformations, and webhook endpoints.',
        'Web Development', 4500.00, 8000.00, 'FIXED', CURRENT_DATE + 30, 'OPEN'
      ),
      (
        $1, 'Figma UI/UX Redesign for Enterprise SaaS Dashboard',
        'Looking for a top-tier product designer to redesign our core SaaS analytics and team management dashboards with tokens and interactive prototypes.',
        'Design & Creative', 75.00, 110.00, 'HOURLY', CURRENT_DATE + 20, 'OPEN'
      ),
      (
        $2, 'Cross-Platform Mobile App for Global E-Commerce Store',
        'Seeking an expert mobile engineer to build a flagship React Native mobile shopping app with push notifications, Apple Pay, and localized multilingual catalogs.',
        'Mobile Development', 6000.00, 12000.00, 'FIXED', CURRENT_DATE + 45, 'OPEN'
      ),
      (
        $2, 'Production AWS EKS Infrastructure & CI/CD Pipeline',
        'Setup production-grade Kubernetes cluster on AWS using Terraform. Must configure zero-trust ingress, SSL certificates, and Datadog monitoring.',
        'DevOps & Cloud', 3500.00, 6000.00, 'FIXED', CURRENT_DATE + 15, 'OPEN'
      ),
      (
        $1, 'Custom RAG Pipeline & Document Extraction Microservice',
        'Develop an automated document processing service using Python, LangChain, and vector embeddings to extract financial metrics from 100+ page PDF reports.',
        'AI & Machine Learning', 5000.00, 9500.00, 'FIXED', CURRENT_DATE + 25, 'IN_PROGRESS'
      )
      RETURNING id, title;
    `, [
      cpMap['client@demo.com'],
      cpMap['clara@growthco.com']
    ]);

    const project1Id = projRes.rows[0].id;
    const project2Id = projRes.rows[1].id;
    const project3Id = projRes.rows[2].id;
    const project4Id = projRes.rows[3].id;
    const project5Id = projRes.rows[4].id;

    // 9. Link Project Skills
    console.log('[Seed] Linking project skills...');
    const projectSkillsData = [
      { pId: project1Id, skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'] },
      { pId: project2Id, skills: ['Figma', 'UI/UX Design', 'Design Systems'] },
      { pId: project3Id, skills: ['React Native', 'iOS', 'Android', 'GraphQL'] },
      { pId: project4Id, skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker'] },
      { pId: project5Id, skills: ['Python', 'LangChain', 'FastAPI', 'PostgreSQL'] },
    ];

    for (const item of projectSkillsData) {
      for (const skillName of item.skills) {
        if (skillMap[skillName]) {
          await client.query(
            'INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [item.pId, skillMap[skillName]]
          );
        }
      }
    }

    // 10. Insert Proposals
    console.log('[Seed] Inserting proposals...');
    const propRes = await client.query(`
      INSERT INTO proposals (
        project_id, freelancer_id, cover_letter, bid_amount, estimated_days, status
      ) VALUES
      (
        $1, $2,
        'I have built 3 similar interactive node canvas workflow systems in React. I can deliver a prototype within 10 days.',
        5500.00, 21, 'PENDING'
      ),
      (
        $3, $4,
        'I specialize in SaaS design systems and have created dashboards for multi-billion dollar enterprise platforms.',
        85.00, 14, 'PENDING'
      ),
      (
        $5, $6,
        'Completed 10+ production RAG systems with LangChain and vector databases with sub-second retrieval accuracy.',
        6500.00, 20, 'ACCEPTED'
      )
      RETURNING id, project_id, status;
    `, [
      project1Id, fpMap['freelancer@demo.com'],
      project2Id, fpMap['sarah@design.io'],
      project5Id, fpMap['elena@ai.io']
    ]);

    const proposal3Id = propRes.rows[2].id;

    // 11. Insert Contracts
    console.log('[Seed] Inserting contracts...');
    const contractRes = await client.query(`
      INSERT INTO contracts (
        project_id, proposal_id, client_id, freelancer_id, agreed_amount, start_date, end_date, status, completed_at
      ) VALUES
      (
        $1, $2, $3, $4, 6500.00, CURRENT_DATE - 15, CURRENT_DATE + 10, 'ACTIVE', NULL
      ),
      (
        $5, NULL, $3, $6, 4800.00, CURRENT_DATE - 60, CURRENT_DATE - 10, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '10 days'
      )
      RETURNING id;
    `, [
      project5Id, proposal3Id, cpMap['client@demo.com'], fpMap['elena@ai.io'],
      project1Id, fpMap['freelancer@demo.com']
    ]);

    const completedContractId = contractRes.rows[1].id;

    // 12. Insert Reviews
    console.log('[Seed] Inserting reviews...');
    await client.query(`
      INSERT INTO reviews (contract_id, client_id, freelancer_id, rating, comment) VALUES
      (
        $1, $2, $3, 5,
        'Alex delivered exceptional work on our real-time portal. Communication was flawless, code quality is top-notch, and he finished ahead of deadline.'
      ),
      (
        NULL, $4, $3, 5,
        'Alex solved a complex database deadlock issue for us in 24 hours. Incredible technical acumen and very pleasant to work with.'
      ),
      (
        NULL, $2, $5, 5,
        'Sarah is easily one of the best designers we have ever worked with. Her design system simplified our product development significantly.'
      );
    `, [
      completedContractId,
      cpMap['client@demo.com'],
      fpMap['freelancer@demo.com'],
      cpMap['clara@growthco.com'],
      fpMap['sarah@design.io']
    ]);

    // 13. Insert Bookmarks
    console.log('[Seed] Inserting bookmarks...');
    await client.query(`
      INSERT INTO saved_freelancers (client_id, freelancer_id) VALUES
      ($1, $2),
      ($1, $3)
      ON CONFLICT DO NOTHING;
    `, [
      cpMap['client@demo.com'],
      fpMap['freelancer@demo.com'],
      fpMap['sarah@design.io']
    ]);

    await client.query(`
      INSERT INTO saved_projects (freelancer_id, project_id) VALUES
      ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [
      fpMap['freelancer@demo.com'],
      project1Id
    ]);

    // 14. Insert Conversations & Messages
    console.log('[Seed] Inserting conversations and messages...');
    const convRes = await client.query(`
      INSERT INTO conversations (project_id, created_at, last_message_at)
      VALUES ($1, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '10 minutes')
      RETURNING id;
    `, [project1Id]);
    const convId = convRes.rows[0].id;

    await client.query(`
      INSERT INTO conversation_participants (conversation_id, user_id) VALUES
      ($1, $2),
      ($1, $3);
    `, [
      convId,
      userMap['client@demo.com'],
      userMap['freelancer@demo.com']
    ]);

    await client.query(`
      INSERT INTO messages (conversation_id, sender_id, body, created_at, read_at) VALUES
      (
        $1, $2,
        'Hi Alex! I reviewed your portfolio on the real-time crypto platform. We are building an interactive AI workflow tool and would love to collaborate with you.',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '50 minutes'
      ),
      (
        $1, $3,
        'Hello Jordan! Thank you for reaching out. The AI workflow builder sounds like a fantastic match for my skill set. When are you looking to kick off the project?',
        CURRENT_TIMESTAMP - INTERVAL '40 minutes',
        CURRENT_TIMESTAMP - INTERVAL '30 minutes'
      ),
      (
        $1, $2,
        'We would love to start next Monday. I just posted the job details on the platform. Looking forward to discussing the milestones!',
        CURRENT_TIMESTAMP - INTERVAL '10 minutes',
        NULL
      );
    `, [
      convId,
      userMap['client@demo.com'],
      userMap['freelancer@demo.com']
    ]);

    await client.query('COMMIT');
    console.log('[Seed] Database seeded successfully with normalized relational schema!');
    console.log('  Freelancer: freelancer@demo.com / demo123');
    console.log('  Client:     client@demo.com     / demo123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
