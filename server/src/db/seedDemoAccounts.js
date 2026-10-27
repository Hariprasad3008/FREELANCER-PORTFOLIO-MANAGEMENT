import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function seedDemoAccounts() {
  console.log('[Seed] Setting up base skills and demo login accounts...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert base skills
    const skillsList = [
      'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Docker',
      'GraphQL', 'Figma', 'UI/UX Design', 'Design Systems', 'User Research',
      'Python', 'PyTorch', 'LangChain', 'FastAPI', 'AWS', 'Kubernetes', 'Terraform',
      'CI/CD', 'React Native', 'Flutter', 'iOS', 'Android', 'Next.js'
    ];

    const skillMap = {};
    for (const skillName of skillsList) {
      const res = await client.query(
        'INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name',
        [skillName]
      );
      skillMap[res.rows[0].name] = res.rows[0].id;
    }

    const passwordHash = await bcrypt.hash('demo123', 10);

    // 2. Insert Demo Freelancer (if not exists)
    let fUserRes = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['freelancer@demo.com']);
    let freelancerUserId;

    if (fUserRes.rows.length === 0) {
      const insRes = await client.query(
        `INSERT INTO users (name, email, password_hash, age, gender, role, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          'Alex Morgan',
          'freelancer@demo.com',
          passwordHash,
          29,
          'Male',
          'FREELANCER',
          'Full-Stack Developer specializing in modern web applications, scalable APIs, and clean UX.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
        ]
      );
      freelancerUserId = insRes.rows[0].id;
    } else {
      freelancerUserId = fUserRes.rows[0].id;
    }

    // Ensure freelancer profile exists
    let fpRes = await client.query('SELECT id FROM freelancer_profiles WHERE user_id = $1', [freelancerUserId]);
    let freelancerProfileId;
    if (fpRes.rows.length === 0) {
      const insFp = await client.query(
        `INSERT INTO freelancer_profiles (
          user_id, title, hourly_rate, experience_years, experience_level,
          location, availability_status, response_time_minutes, projects_completed,
          success_rate, average_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          freelancerUserId,
          'Senior Full-Stack Developer',
          85.00,
          6,
          'SENIOR',
          'Remote',
          'AVAILABLE',
          30,
          0,
          100.00,
          5.00
        ]
      );
      freelancerProfileId = insFp.rows[0].id;

      // Assign initial skills to demo freelancer
      const initialSkills = ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Next.js'];
      for (const s of initialSkills) {
        if (skillMap[s]) {
          await client.query(
            'INSERT INTO freelancer_skills (freelancer_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [freelancerProfileId, skillMap[s]]
          );
        }
      }
    }

    // 3. Insert Demo Client (if not exists)
    let cUserRes = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['client@demo.com']);
    let clientUserId;

    if (cUserRes.rows.length === 0) {
      const insRes = await client.query(
        `INSERT INTO users (name, email, password_hash, age, gender, role, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          'David Kim',
          'client@demo.com',
          passwordHash,
          35,
          'Male',
          'CLIENT',
          'Product Lead looking for skilled engineering and design talent to build high-impact digital products.',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        ]
      );
      clientUserId = insRes.rows[0].id;
    } else {
      clientUserId = cUserRes.rows[0].id;
    }

    // Ensure client profile exists
    let cpRes = await client.query('SELECT id FROM client_profiles WHERE user_id = $1', [clientUserId]);
    if (cpRes.rows.length === 0) {
      await client.query(
        `INSERT INTO client_profiles (
          user_id, company_name, company_location, company_description, website
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          clientUserId,
          'NexusTech Innovations',
          'San Francisco, CA',
          'Innovative tech team hiring developers and designers for high-impact projects.',
          'https://example.com'
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[Seed] Successfully created demo accounts:');
    console.log('  - Freelancer: freelancer@demo.com / demo123');
    console.log('  - Client:     client@demo.com / demo123');
    console.log('  - Projects/Proposals/Messages kept empty.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Failed to seed demo accounts:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoAccounts();
