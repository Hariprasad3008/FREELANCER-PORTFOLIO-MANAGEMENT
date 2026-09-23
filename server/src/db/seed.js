import bcrypt from "bcryptjs";
import pool from "../config/db.js";

async function seedDatabase() {
  console.log("🌱 Seeding database with demo data...");
  try {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    // 1. Seed Freelancers
    const freelancer1 = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name, title, bio, hourly_rate, experience_level, location, skills, category, gender, rating, success_rate, projects_completed, availability_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id;`,
      [
        "alex.rivera@example.com",
        passwordHash,
        "freelancer",
        "Alex Rivera",
        "Senior Full-Stack Developer & Cloud Architect",
        "Specializing in modern React, Next.js, Node.js, and high-throughput PostgreSQL systems. 7+ years of experience building production web applications.",
        85.0,
        "senior",
        "San Francisco, CA",
        ["React", "Node.js", "PostgreSQL", "Tailwind CSS", "TypeScript", "Socket.IO", "Docker"],
        "Development",
        "male",
        4.9,
        98,
        24,
        "Available Full-Time",
      ]
    );

    const freelancer2 = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name, title, bio, hourly_rate, experience_level, location, skills, category, gender, rating, success_rate, projects_completed, availability_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id;`,
      [
        "elena.rostova@example.com",
        passwordHash,
        "freelancer",
        "Elena Rostova",
        "UI/UX Product Designer & Design Systems Lead",
        "Passionate about creating intuitive user flows, polished glassmorphism aesthetics, design systems, and responsive interfaces in Figma and Tailwind.",
        75.0,
        "senior",
        "London, UK",
        ["Figma", "UI/UX Design", "Wireframing", "Tailwind CSS", "Design Systems", "Prototyping"],
        "Design",
        "female",
        5.0,
        100,
        18,
        "Part-Time (20 hrs/week)",
      ]
    );

    const freelancer3 = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name, title, bio, hourly_rate, experience_level, location, skills, category, gender, rating, success_rate, projects_completed, availability_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id;`,
      [
        "dev.sharma@example.com",
        passwordHash,
        "freelancer",
        "Dev Sharma",
        "Full-Stack Python & AI/ML Engineer",
        "Building intelligent workflows, LangChain integrations, FastAPI microservices, and React dashboards.",
        65.0,
        "mid",
        "Bengaluru, India",
        ["Python", "FastAPI", "React", "Machine Learning", "PostgreSQL", "Redis"],
        "AI / Data",
        "male",
        4.8,
        96,
        14,
        "Available",
      ]
    );

    // 2. Seed Clients
    const client1 = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name, title, bio, location, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id;`,
      [
        "sarah.connor@cyberdyne.io",
        passwordHash,
        "client",
        "Sarah Connor",
        "CTO at Cyberdyne Systems",
        "Looking for top-tier full stack engineers and UI/UX masters for high-impact web and enterprise products.",
        "Austin, TX",
        "Technology",
      ]
    );

    const client2 = await pool.query(
      `INSERT INTO profiles (email, password_hash, role, full_name, title, bio, location, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id;`,
      [
        "marcus.vance@finflow.co",
        passwordHash,
        "client",
        "Marcus Vance",
        "Founder & CEO at FinFlow",
        "Bootstrapping high-velocity fintech products. Seeking creative designers and backend wizards.",
        "New York, NY",
        "Fintech",
      ]
    );

    const clientId = client1.rows[0].id;
    const freelancerId = freelancer1.rows[0].id;

    // 3. Seed Projects
    const project1 = await pool.query(
      `INSERT INTO projects (client_id, title, description, category, budget_min, budget_max, budget_type, required_skills, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id;`,
      [
        clientId,
        "Full-Stack SaaS Analytics Dashboard with Real-Time WebSockets",
        "We are looking for an experienced full-stack engineer to build a high-performance analytics dashboard featuring JWT authentication, role management, interactive charting, and real-time live updates via WebSockets.",
        "Web Development",
        3000.0,
        5500.0,
        "fixed",
        ["React", "Node.js", "PostgreSQL", "Socket.IO", "Tailwind CSS"],
        "30 Days",
        "open",
      ]
    );

    await pool.query(
      `INSERT INTO projects (client_id, title, description, category, budget_min, budget_max, budget_type, required_skills, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        client2.rows[0].id,
        "Fintech Mobile App UI/UX Redesign & Figma Design System",
        "Complete overhaul of our core mobile banking experience. Deliverables include modern wireframes, interactive high-fidelity Figma components, design tokens, and user testing documentation.",
        "UI/UX Design",
        2000.0,
        4000.0,
        "fixed",
        ["Figma", "UI/UX Design", "Design Systems", "Mobile Design"],
        "21 Days",
        "open",
      ]
    );

    // 4. Seed Reviews
    await pool.query(
      `INSERT INTO reviews (client_id, freelancer_id, project_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (client_id, freelancer_id) DO NOTHING;`,
      [
        clientId,
        freelancerId,
        project1.rows[0].id,
        5.0,
        "Alex delivered exceptional work ahead of schedule! Flawless code quality, crisp documentation, and great communication.",
      ]
    );

    // 5. Seed Portfolio Items
    await pool.query(
      `INSERT INTO portfolio_items (freelancer_id, title, description, image_url, project_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        freelancerId,
        "Enterprise E-Commerce Engine",
        "Multi-vendor marketplace platform handling 50k+ daily transactions with microsecond search filters.",
        "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&auto=format&fit=crop&q=80",
        "https://example.com/project-demo",
        ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
      ]
    );

    console.log(" Demo data seeded successfully!");
    console.log("👉 Demo Logins:");
    console.log("   Client: sarah.connor@cyberdyne.io | Password: Password123!");
    console.log("   Freelancer: alex.rivera@example.com | Password: Password123!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();
