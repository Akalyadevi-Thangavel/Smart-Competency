import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';

export function seedDatabase() {
  initDatabase();

  // Check if already seeded
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck.count > 0) {
    console.log('[Seed] Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('[Seed] Seeding database with comprehensive curriculum, roles, questions, and students...');

  const passwordStudent = bcrypt.hashSync('password123', 10);
  const passwordAdmin = bcrypt.hashSync('admin123', 10);

  // 1. Career Roles
  const roles = [
    {
      id: 'role-fullstack',
      name: 'Full Stack Developer',
      slug: 'full-stack-developer',
      description: 'Builds end-to-end modern web applications spanning responsive frontends, scalable REST/GraphQL APIs, relational and NoSQL databases, and cloud deployment pipelines.',
      category: 'Software Engineering',
      min_readiness_score: 75.0,
    },
    {
      id: 'role-frontend',
      name: 'Frontend Developer',
      slug: 'frontend-developer',
      description: 'Crafts accessible, high-performance user interfaces using modern JavaScript/TypeScript, React, modern state management, and responsive CSS architectures.',
      category: 'Software Engineering',
      min_readiness_score: 70.0,
    },
    {
      id: 'role-backend',
      name: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Designs reliable microservices, database schemas, authentication systems, caching strategies, and event-driven architectures with high throughput.',
      category: 'Software Engineering',
      min_readiness_score: 75.0,
    },
    {
      id: 'role-data-analyst',
      name: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Extracts actionable business insights using SQL, Python, exploratory data analysis, statistical modeling, and interactive dashboards (Power BI / Tableau).',
      category: 'Data & Analytics',
      min_readiness_score: 70.0,
    },
    {
      id: 'role-ml-engineer',
      name: 'Machine Learning Engineer',
      slug: 'machine-learning-engineer',
      description: 'Develops and deploys machine learning models, neural networks, predictive pipelines, and integrates AI capabilities into production products.',
      category: 'Artificial Intelligence',
      min_readiness_score: 80.0,
    },
    {
      id: 'role-devops',
      name: 'DevOps / Cloud Engineer',
      slug: 'devops-cloud-engineer',
      description: 'Automates CI/CD deployment pipelines, manages containerized infrastructure with Docker and Kubernetes, and orchestrates AWS/GCP cloud environments.',
      category: 'Cloud & Infrastructure',
      min_readiness_score: 75.0,
    },
    {
      id: 'role-cybersecurity',
      name: 'Cybersecurity Analyst',
      slug: 'cybersecurity-analyst',
      description: 'Protects systems from vulnerabilities, conducts penetration testing, ensures OWASP security compliance, and monitors network threat vectors.',
      category: 'Security',
      min_readiness_score: 75.0,
    },
  ];

  const insertRole = db.prepare(`
    INSERT INTO career_roles (id, name, slug, description, category, min_readiness_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const r of roles) {
    insertRole.run(r.id, r.name, r.slug, r.description, r.category, r.min_readiness_score);
  }

  // 2. Skills
  const skills = [
    // Technical
    { id: 'skill-js', name: 'JavaScript (ES6+)', category: 'Technical', description: 'Modern JavaScript features including async/await, closures, prototypes, DOM manipulation, and event loop mechanics.' },
    { id: 'skill-ts', name: 'TypeScript', category: 'Technical', description: 'Static typing, generics, interfaces, unions, utility types, and strict type checking in enterprise applications.' },
    { id: 'skill-react', name: 'React.js', category: 'Technical', description: 'Component architecture, custom hooks, virtual DOM reconciliation, state management, and rendering optimization.' },
    { id: 'skill-node', name: 'Node.js & Express', category: 'Technical', description: 'Event-driven server runtime, middleware architectures, RESTful API design, stream processing, and JWT authentication.' },
    { id: 'skill-sql', name: 'SQL & Relational Databases', category: 'Technical', description: 'Complex joins, subqueries, indexing strategies, transactions, ACID compliance, and schema normalization.' },
    { id: 'skill-dsa', name: 'Data Structures & Algorithms', category: 'Core CS', description: 'Arrays, hash maps, linked lists, trees, graphs, dynamic programming, sorting, and Big-O computational complexity.' },
    { id: 'skill-git', name: 'Git & Version Control', category: 'Tools', description: 'Branching workflows, pull requests, merge conflict resolution, rebasing, and repository hygiene.' },
    { id: 'skill-system-design', name: 'System Design Fundamentals', category: 'Core CS', description: 'Horizontal vs vertical scaling, load balancing, caching (Redis), CDNs, and database sharding principles.' },
    { id: 'skill-cs-fundamentals', name: 'CS Fundamentals (OS, DBMS, CN)', category: 'Core CS', description: 'Processes vs threads, memory management, TCP/IP, HTTP/3, DNS, and database concurrency isolation levels.' },
    { id: 'skill-python', name: 'Python for Data', category: 'Technical', description: 'Pandas, NumPy, data wrangling, vectorization, and statistical exploratory analysis.' },
    { id: 'skill-data-viz', name: 'Data Visualization & BI', category: 'Technical', description: 'Building interactive executive dashboards using tools like PowerBI, Tableau, and Matplotlib/Seaborn.' },
    { id: 'skill-docker', name: 'Docker & Containerization', category: 'Tools', description: 'Dockerfile optimization, multi-stage builds, docker-compose, and microservice container deployment.' },
    // Aptitude
    { id: 'skill-quant', name: 'Quantitative Aptitude', category: 'Aptitude', description: 'Mathematical speed arithmetic, ratios, percentages, time & work, probability, and algebra problem solving.' },
    { id: 'skill-logic', name: 'Logical Reasoning', category: 'Aptitude', description: 'Deductive reasoning, pattern recognition, syllogisms, blood relations, and coding-decoding puzzles.' },
    { id: 'skill-verbal', name: 'Verbal Ability & Comprehension', category: 'Aptitude', description: 'Grammar mechanics, vocabulary in context, reading comprehension, and error spotting in business English.' },
    // Soft Skills
    { id: 'skill-comm', name: 'Technical Communication', category: 'Soft Skills', description: 'Ability to explain complex architectural decisions concisely to non-technical stakeholders and engineers.' },
    { id: 'skill-teamwork', name: 'Agile & Team Collaboration', category: 'Soft Skills', description: 'Sprint planning participation, constructive code reviews, conflict mediation, and cross-functional empathy.' },
    { id: 'skill-interview', name: 'Interview Readiness & Presentation', category: 'Soft Skills', description: 'Behavioral STAR methodology responses, confidence, professional framing, and clear problem articulation.' },
  ];

  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category, description)
    VALUES (?, ?, ?, ?)
  `);
  for (const s of skills) {
    insertSkill.run(s.id, s.name, s.category, s.description);
  }

  // 3. Role Skills Matrix
  const roleSkills = [
    // Full Stack Developer
    { roleId: 'role-fullstack', skillId: 'skill-js', level: 'Advanced', weight: 1.2, priority: 'Critical' },
    { roleId: 'role-fullstack', skillId: 'skill-ts', level: 'Intermediate', weight: 1.0, priority: 'High' },
    { roleId: 'role-fullstack', skillId: 'skill-react', level: 'Advanced', weight: 1.2, priority: 'Critical' },
    { roleId: 'role-fullstack', skillId: 'skill-node', level: 'Advanced', weight: 1.2, priority: 'Critical' },
    { roleId: 'role-fullstack', skillId: 'skill-sql', level: 'Intermediate', weight: 1.1, priority: 'Critical' },
    { roleId: 'role-fullstack', skillId: 'skill-dsa', level: 'Intermediate', weight: 1.0, priority: 'High' },
    { roleId: 'role-fullstack', skillId: 'skill-git', level: 'Advanced', weight: 0.9, priority: 'High' },
    { roleId: 'role-fullstack', skillId: 'skill-system-design', level: 'Intermediate', weight: 0.9, priority: 'Medium' },
    { roleId: 'role-fullstack', skillId: 'skill-cs-fundamentals', level: 'Intermediate', weight: 0.8, priority: 'High' },
    { roleId: 'role-fullstack', skillId: 'skill-comm', level: 'Intermediate', weight: 0.8, priority: 'High' },
    { roleId: 'role-fullstack', skillId: 'skill-quant', level: 'Intermediate', weight: 0.7, priority: 'Medium' },
    { roleId: 'role-fullstack', skillId: 'skill-interview', level: 'Advanced', weight: 1.0, priority: 'High' },

    // Frontend Developer
    { roleId: 'role-frontend', skillId: 'skill-js', level: 'Advanced', weight: 1.3, priority: 'Critical' },
    { roleId: 'role-frontend', skillId: 'skill-ts', level: 'Advanced', weight: 1.1, priority: 'Critical' },
    { roleId: 'role-frontend', skillId: 'skill-react', level: 'Advanced', weight: 1.4, priority: 'Critical' },
    { roleId: 'role-frontend', skillId: 'skill-git', level: 'Advanced', weight: 0.9, priority: 'High' },
    { roleId: 'role-frontend', skillId: 'skill-dsa', level: 'Intermediate', weight: 0.8, priority: 'Medium' },
    { roleId: 'role-frontend', skillId: 'skill-comm', level: 'Intermediate', weight: 0.8, priority: 'High' },

    // Backend Developer
    { roleId: 'role-backend', skillId: 'skill-node', level: 'Advanced', weight: 1.3, priority: 'Critical' },
    { roleId: 'role-backend', skillId: 'skill-sql', level: 'Advanced', weight: 1.3, priority: 'Critical' },
    { roleId: 'role-backend', skillId: 'skill-system-design', level: 'Intermediate', weight: 1.1, priority: 'Critical' },
    { roleId: 'role-backend', skillId: 'skill-cs-fundamentals', level: 'Advanced', weight: 1.1, priority: 'Critical' },
    { roleId: 'role-backend', skillId: 'skill-dsa', level: 'Advanced', weight: 1.2, priority: 'Critical' },
    { roleId: 'role-backend', skillId: 'skill-docker', level: 'Intermediate', weight: 0.9, priority: 'High' },

    // Data Analyst
    { roleId: 'role-data-analyst', skillId: 'skill-sql', level: 'Advanced', weight: 1.4, priority: 'Critical' },
    { roleId: 'role-data-analyst', skillId: 'skill-python', level: 'Advanced', weight: 1.3, priority: 'Critical' },
    { roleId: 'role-data-analyst', skillId: 'skill-data-viz', level: 'Advanced', weight: 1.2, priority: 'Critical' },
    { roleId: 'role-data-analyst', skillId: 'skill-quant', level: 'Advanced', weight: 1.1, priority: 'High' },
    { roleId: 'role-data-analyst', skillId: 'skill-comm', level: 'Intermediate', weight: 0.9, priority: 'High' },
  ];

  const insertRoleSkill = db.prepare(`
    INSERT INTO role_skills (id, role_id, skill_id, required_level, weight, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  let rsCounter = 1;
  for (const rs of roleSkills) {
    insertRoleSkill.run(`rs-${rsCounter++}`, rs.roleId, rs.skillId, rs.level, rs.weight, rs.priority);
  }

  // 4. Assessments & Questions
  const assessments = [
    {
      id: 'asm-fullstack-core',
      title: 'Full Stack Engineering Readiness Assessment',
      slug: 'fullstack-readiness',
      category: 'technical',
      role_id: 'role-fullstack',
      duration_minutes: 25,
      passing_score: 65.0,
      total_questions: 10,
      difficulty: 'Intermediate',
      description: 'Comprehensive diagnostic assessing JavaScript async execution, React component lifecycles, REST APIs, SQL transactions, and data structures.',
    },
    {
      id: 'asm-frontend-deep',
      title: 'React & Modern Frontend Architecture',
      slug: 'frontend-architecture',
      category: 'technical',
      role_id: 'role-frontend',
      duration_minutes: 20,
      passing_score: 70.0,
      total_questions: 8,
      difficulty: 'Advanced',
      description: 'Deep dive into React custom hooks, useCallback/useMemo optimization, virtual DOM diffing, and CSS grid/flexbox mechanics.',
    },
    {
      id: 'asm-database-sql',
      title: 'Database Systems & SQL Optimization',
      slug: 'sql-dbms-mastery',
      category: 'technical',
      role_id: 'role-backend',
      duration_minutes: 20,
      passing_score: 65.0,
      total_questions: 8,
      difficulty: 'Intermediate',
      description: 'Evaluates SQL query formulation, index types (B-Tree vs Hash), normalization forms, transactions, and deadlock handling.',
    },
    {
      id: 'asm-cs-fundamentals',
      title: 'Core Computer Science Fundamentals',
      slug: 'cs-fundamentals',
      category: 'technical',
      role_id: 'role-fullstack',
      duration_minutes: 20,
      passing_score: 60.0,
      total_questions: 8,
      difficulty: 'Intermediate',
      description: 'Covers Operating Systems processes and scheduling, Computer Networks (TCP/IP handshake, DNS), and Object-Oriented Principles.',
    },
    {
      id: 'asm-aptitude-quant',
      title: 'Quantitative & Logical Aptitude Test',
      slug: 'quant-logical-aptitude',
      category: 'aptitude',
      role_id: null,
      duration_minutes: 15,
      passing_score: 60.0,
      total_questions: 8,
      difficulty: 'Intermediate',
      description: 'Standard campus placement aptitude covering work and time, probability, sequence detection, and data sufficiency.',
    },
    {
      id: 'asm-soft-skills',
      title: 'Workplace Communication & Situational Judgment',
      slug: 'soft-skills-situational',
      category: 'soft_skills',
      role_id: null,
      duration_minutes: 15,
      passing_score: 70.0,
      total_questions: 6,
      difficulty: 'Intermediate',
      description: 'Real-world workplace scenarios evaluating technical explanation, disagreement handling, project delay communication, and team leadership.',
    },
  ];

  const insertAssessment = db.prepare(`
    INSERT INTO assessments (id, title, slug, category, role_id, duration_minutes, passing_score, total_questions, difficulty, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of assessments) {
    insertAssessment.run(a.id, a.title, a.slug, a.category, a.role_id, a.duration_minutes, a.passing_score, a.total_questions, a.difficulty, a.description);
  }

  // Questions for Full Stack Assessment
  const fullstackQuestions = [
    {
      id: 'q-fs-1',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-js',
      question_text: 'What will be logged to the console by the following JavaScript snippet?\n\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
      question_type: 'mcq',
      options: JSON.stringify(['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '4, 1, 3, 2']),
      correct_answer: JSON.stringify(0),
      explanation: 'Synchronous operations (1 and 4) execute immediately on the call stack. Microtasks (Promise callback: 3) execute right after synchronous execution before the event loop processes macrotasks (setTimeout: 2).',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-2',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-react',
      question_text: 'When should you choose `useCallback` over regular function definitions in a React component?',
      question_type: 'mcq',
      options: JSON.stringify([
        'Whenever you define any callback function in React',
        'When passing the callback to an optimized child component wrapped in React.memo that relies on reference equality',
        'To speed up asynchronous network requests inside useEffect',
        'To automatically debounce expensive calculation calls'
      ]),
      correct_answer: JSON.stringify(1),
      explanation: 'useCallback preserves referential equality across re-renders. It provides performance benefits when passing callbacks to memoized child components (React.memo) or hook dependency arrays.',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-3',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-sql',
      question_text: 'What is the primary difference between `WHERE` and `HAVING` clauses in SQL?',
      question_type: 'mcq',
      options: JSON.stringify([
        'WHERE filters rows before aggregation; HAVING filters groups after aggregation',
        'WHERE can only be used with numeric columns; HAVING is for string columns',
        'HAVING is faster than WHERE because it skips index lookups',
        'There is no difference; they are interchangeable aliases in ANSI SQL'
      ]),
      correct_answer: JSON.stringify(0),
      explanation: 'WHERE filters individual row records before any GROUP BY aggregation occurs. HAVING is applied after grouping and filtering based on aggregate expressions like COUNT() or AVG().',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-4',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-node',
      question_text: 'In Node.js, what is the purpose of the `process.nextTick()` queue?',
      question_type: 'mcq',
      options: JSON.stringify([
        'It schedules a task to run after the next I/O poll phase completes',
        'It processes callbacks immediately after the current operation finishes, before any other event loop phase or microtask',
        'It pushes execution to a separate worker thread pool',
        'It replaces setInterval for periodic background monitoring'
      ]),
      correct_answer: JSON.stringify(1),
      explanation: 'The nextTickQueue runs immediately after the current phase of execution completes, even before microtasks (Promises). It is useful for firing events synchronously after constructor return.',
      difficulty: 'Advanced',
      points: 10,
    },
    {
      id: 'q-fs-5',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-dsa',
      question_text: 'What is the average time complexity for searching, inserting, and deleting in a Hash Map with a good hash function?',
      question_type: 'mcq',
      options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)']),
      correct_answer: JSON.stringify(0),
      explanation: 'With a uniform hash distribution and appropriate load factor resizing, Hash Maps achieve amortized O(1) constant time complexity for lookup, insert, and deletion.',
      difficulty: 'Easy',
      points: 10,
    },
    {
      id: 'q-fs-6',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-git',
      question_text: 'Which Git command should you use to incorporate commits from a feature branch while maintaining a linear commit history?',
      question_type: 'mcq',
      options: JSON.stringify(['git merge --no-ff', 'git rebase main', 'git cherry-pick --all', 'git revert HEAD']),
      correct_answer: JSON.stringify(1),
      explanation: 'git rebase rewrites the commit history by moving your feature branch commits onto the tip of the target branch (main), creating a clean linear timeline without merge commits.',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-7',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-cs-fundamentals',
      question_text: 'In the context of database transactions, what does the "I" in ACID guarantee?',
      question_type: 'mcq',
      options: JSON.stringify([
        'Immediate execution on disk',
        'Isolation: Concurrent transactions execute without interfering with one another',
        'Index persistence across server restarts',
        'Immutable records that cannot be updated'
      ]),
      correct_answer: JSON.stringify(1),
      explanation: 'Isolation ensures that concurrent transactions behave as if executed sequentially, preventing anomalies such as dirty reads, non-repeatable reads, and phantom reads based on isolation level.',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-8',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-system-design',
      question_text: 'Why would an engineer introduce a Reverse Proxy (such as Nginx) in front of an application cluster?',
      question_type: 'multiple_select',
      options: JSON.stringify([
        'SSL/TLS termination and certificate offloading',
        'Load balancing incoming HTTP requests across backend replicas',
        'Static asset caching and gzip/brotli compression',
        'To write business database records directly to disk'
      ]),
      correct_answer: JSON.stringify([0, 1, 2]),
      explanation: 'Reverse proxies handle SSL termination, load distribution, rate limiting, and static caching, isolating internal backend services from raw client traffic.',
      difficulty: 'Advanced',
      points: 10,
    },
    {
      id: 'q-fs-9',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-comm',
      question_text: 'You discover a critical bug in production on Friday afternoon that will take 4 hours to resolve. What is the most professional initial step?',
      question_type: 'scenario',
      options: JSON.stringify([
        'Silently push an untested hotfix and leave for the weekend',
        'Notify the engineering team and stakeholders immediately with known impact, mitigation options, and roll-back plan',
        'Ignore the issue until Monday standup because deployments are discouraged on Fridays',
        'Blame the intern who merged the commit in the company general channel'
      ]),
      correct_answer: JSON.stringify(1),
      explanation: 'Transparent, proactive communication regarding incident severity, customer impact, and remediation steps is the hallmark of dependable engineering maturity.',
      difficulty: 'Intermediate',
      points: 10,
    },
    {
      id: 'q-fs-10',
      assessment_id: 'asm-fullstack-core',
      skill_id: 'skill-quant',
      question_text: 'A train 180 meters long travelling at 54 km/h crosses a platform in 24 seconds. What is the length of the platform?',
      question_type: 'mcq',
      options: JSON.stringify(['180 meters', '200 meters', '220 meters', '160 meters']),
      correct_answer: JSON.stringify(0),
      explanation: 'Speed = 54 * (5/18) = 15 m/s. Total distance crossed in 24 s = 15 * 24 = 360 m. Platform length = 360 - 180 = 180 m.',
      difficulty: 'Intermediate',
      points: 10,
    }
  ];

  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, assessment_id, skill_id, question_text, question_type, options_json, correct_answer_json, explanation, difficulty, points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const q of fullstackQuestions) {
    insertQuestion.run(q.id, q.assessment_id, q.skill_id, q.question_text, q.question_type, q.options, q.correct_answer, q.explanation, q.difficulty, q.points);
  }

  // 5. Coding Problems (LeetCode Style)
  const codingProblems = [
    {
      id: 'prob-two-sum',
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'Easy',
      topic: 'Arrays & Hash Maps',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      starter_code: JSON.stringify({
        javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        python: 'def twoSum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []',
      }),
      test_cases: JSON.stringify([
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
        { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' },
        { input: 'nums = [3,3], target = 6', expected: '[0, 1]' },
      ]),
      hints: JSON.stringify([
        'A brute force approach checks every pair in O(n^2). Can you do it in one pass with a Hash Table?',
        'As you iterate through the array, check if (target - current_value) is already present in your map.',
      ]),
      solution_approach: 'Maintain a hash map storing value -> index. For each number, calculate target - num and look up in O(1) time.'
    },
    {
      id: 'prob-valid-palindrome',
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: 'Easy',
      topic: 'Strings & Two Pointers',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
      starter_code: JSON.stringify({
        javascript: 'function isPalindrome(s) {\n  // Clean string and check two pointers\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  let left = 0, right = cleaned.length - 1;\n  while (left < right) {\n    if (cleaned[left] !== cleaned[right]) return false;\n    left++;\n    right--;\n  }\n  return true;\n}',
        python: 'def isPalindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]',
      }),
      test_cases: JSON.stringify([
        { input: 's = "A man, a plan, a canal: Panama"', expected: 'true' },
        { input: 's = "race a car"', expected: 'false' },
        { input: 's = " "', expected: 'true' },
      ]),
      hints: JSON.stringify([
        'Filter out whitespace and punctuation using regex or character code checks.',
        'Use two pointers starting from ends moving toward the center.',
      ]),
      solution_approach: 'Sanitize string, then compare character at left and right pointers while incrementing left and decrementing right.'
    },
    {
      id: 'prob-max-subarray',
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      slug: 'maximum-subarray',
      difficulty: 'Medium',
      topic: 'Dynamic Programming',
      description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
      starter_code: JSON.stringify({
        javascript: 'function maxSubArray(nums) {\n  let maxSoFar = nums[0];\n  let currentMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentMax = Math.max(nums[i], currentMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currentMax);\n  }\n  return maxSoFar;\n}',
        python: 'def maxSubArray(nums):\n    max_so_far = current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far',
      }),
      test_cases: JSON.stringify([
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
        { input: 'nums = [1]', expected: '1' },
        { input: 'nums = [5,4,-1,7,8]', expected: '23' },
      ]),
      hints: JSON.stringify([
        'If current running sum falls below 0, it won\'t contribute positively to the next subarray.',
        'Keep track of local maximum ending at current index and global maximum overall.',
      ]),
      solution_approach: 'Kadane algorithm: O(n) single scan keeping track of max current ending at index i.'
    },
    {
      id: 'prob-longest-substring',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating',
      difficulty: 'Medium',
      topic: 'Sliding Window',
      description: 'Given a string `s`, find the length of the longest substring without duplicate characters.',
      starter_code: JSON.stringify({
        javascript: 'function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let start = 0;\n  const charMap = new Map();\n  for (let end = 0; end < s.length; end++) {\n    if (charMap.has(s[end]) && charMap.get(s[end]) >= start) {\n      start = charMap.get(s[end]) + 1;\n    }\n    charMap.set(s[end], end);\n    maxLength = Math.max(maxLength, end - start + 1);\n  }\n  return maxLength;\n}',
        python: 'def lengthOfLongestSubstring(s):\n    char_map = {}\n    max_len = start = 0\n    for end, ch in enumerate(s):\n        if ch in char_map and char_map[ch] >= start:\n            start = char_map[ch] + 1\n        char_map[ch] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len',
      }),
      test_cases: JSON.stringify([
        { input: 's = "abcabcbb"', expected: '3' },
        { input: 's = "bbbbb"', expected: '1' },
        { input: 's = "pwwkew"', expected: '3' },
      ]),
      hints: JSON.stringify([
        'Use a sliding window defined by two pointers [start, end].',
        'Store the most recent index seen for each character in a map.',
      ]),
      solution_approach: 'Sliding window with hash map storing last index of each character for O(n) time complexity.'
    }
  ];

  const insertProblem = db.prepare(`
    INSERT INTO coding_problems (id, title, slug, difficulty, topic, description, starter_code_json, test_cases_json, hints_json, solution_approach)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of codingProblems) {
    insertProblem.run(p.id, p.title, p.slug, p.difficulty, p.topic, p.description, p.starter_code, p.test_cases, p.hints, p.solution_approach);
  }

  // 6. Interview Questions
  const interviewQuestions = [
    {
      id: 'iq-1',
      category: 'Technical',
      role_id: 'role-fullstack',
      question_text: 'Explain the Virtual DOM in React. How does the reconciliation algorithm determine what DOM nodes need updating?',
      sample_answer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When component state changes, React renders a new virtual DOM tree, computes the diff against the previous tree using the heuristic O(n) reconciliation algorithm (comparing element types and unique keys), and batches minimal real DOM mutations via the commit phase.',
      key_points: JSON.stringify(['Lightweight in-memory JS representation', 'Diffing heuristic comparing element types and keys', 'Batching DOM mutations for performance', 'Fiber architecture for interruptible rendering']),
      difficulty: 'Intermediate',
    },
    {
      id: 'iq-2',
      category: 'Technical',
      role_id: 'role-backend',
      question_text: 'How does indexing work in a relational database like PostgreSQL or MySQL? When might an index degrade performance?',
      sample_answer: 'Indexes create balanced tree (B-Tree) data structures holding key values and pointers to data pages, allowing O(log N) searches instead of full table scans (O(N)). However, every INSERT, UPDATE, and DELETE requires updating the index structure, which adds disk I/O overhead. Excessive indexes on high-write tables degrade write throughput.',
      key_points: JSON.stringify(['B-Tree structure pointers to disk pages', 'O(log N) lookup vs O(N) full scan', 'Write overhead on INSERT/UPDATE/DELETE', 'Index selectivity importance']),
      difficulty: 'Intermediate',
    },
    {
      id: 'iq-3',
      category: 'Behavioral',
      role_id: 'role-fullstack',
      question_text: 'Tell me about a time you encountered a stubborn bug right before a project deadline. How did you diagnose and resolve it?',
      sample_answer: 'Using the STAR method: In our capstone project 24 hours before presentation, users experienced silent auth token desynchronization. I isolated the issue by reproducing it with network interception, identified a race condition in the refresh token interceptor, implemented an atomic promise queue to deduplicate refresh calls, and verified it with end-to-end tests before merging.',
      key_points: JSON.stringify(['STAR framework structure', 'Methodical root-cause isolation without panic', 'Solution implementation with verification', 'Key learning and prevention measures']),
      difficulty: 'Intermediate',
    },
    {
      id: 'iq-4',
      category: 'HR',
      role_id: null,
      question_text: 'Why are you targeting the Full Stack Developer role, and where do you envision your technical growth in the next 2-3 years?',
      sample_answer: 'I enjoy the holistic engineering perspective of connecting resilient backend APIs with intuitive user experiences. In the next 2-3 years, I aim to master distributed systems, deepen my knowledge of database indexing and cloud orchestration, and contribute directly to high-impact production features as an autonomous engineer.',
      key_points: JSON.stringify(['Genuine passion for product engineering', 'Clear 2-3 year growth trajectory', 'Alignment with team value delivery', 'Humility and eagerness to learn']),
      difficulty: 'Easy',
    }
  ];

  const insertIQ = db.prepare(`
    INSERT INTO interview_questions (id, category, role_id, question_text, sample_answer, key_points_json, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const iq of interviewQuestions) {
    insertIQ.run(iq.id, iq.category, iq.role_id, iq.question_text, iq.sample_answer, iq.key_points, iq.difficulty);
  }

  // 7. Achievements
  const achievements = [
    { id: 'ach-first-assessment', slug: 'first-assessment', title: 'First Diagnostic', description: 'Completed your very first competency diagnostic assessment.', badge_icon: 'Target', xp_reward: 100, category: 'assessment' },
    { id: 'ach-first-code', slug: 'first-code', title: 'Algorithm Initiated', description: 'Successfully solved your first Coding Lab algorithmic challenge.', badge_icon: 'Code2', xp_reward: 150, category: 'coding' },
    { id: 'ach-7-streak', slug: '7-day-streak', title: 'Consistency Champion', description: 'Maintained a 7-day continuous daily learning and practice streak.', badge_icon: 'Flame', xp_reward: 250, category: 'consistency' },
    { id: 'ach-resume-ready', slug: 'resume-ready', title: 'ATS Optimized', description: 'Achieved an 80+ ATS score on your target role resume analysis.', badge_icon: 'FileCheck', xp_reward: 200, category: 'resume' },
    { id: 'ach-sql-master', slug: 'sql-master', title: 'Query Virtuoso', description: 'Demonstrated Advanced proficiency in relational SQL competencies.', badge_icon: 'Database', xp_reward: 200, category: 'assessment' },
    { id: 'ach-interview-prep', slug: 'interview-ready', title: 'Interview Explorer', description: 'Completed 3 mock technical and behavioral interview sessions.', badge_icon: 'MessageSquareCheck', xp_reward: 200, category: 'interview' },
    { id: 'ach-project-builder', slug: 'project-builder', title: 'Portfolio Builder', description: 'Documented a production-grade full-stack project in your portfolio.', badge_icon: 'FolderGit2', xp_reward: 150, category: 'project' },
    { id: 'ach-placement-star', slug: 'placement-ready', title: 'Placement Ready (80%+)', description: 'Attained an overall placement readiness indicator score above 80%.', badge_icon: 'Award', xp_reward: 500, category: 'placement' },
  ];

  const insertAch = db.prepare(`
    INSERT INTO achievements (id, slug, title, description, badge_icon, xp_reward, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const ach of achievements) {
    insertAch.run(ach.id, ach.slug, ach.title, ach.description, ach.badge_icon, ach.xp_reward, ach.category);
  }

  // 8. Demo Users & Profiles
  // Student 1: Alex Chen (Full Stack)
  const student1Id = 'usr-student-alex';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(student1Id, 'student@smartcompetency.com', passwordStudent, 'student');

  db.prepare(`
    INSERT INTO profiles (
      user_id, full_name, college, degree, branch, year, grad_year,
      target_role_id, secondary_role_id, experience_level, daily_hours,
      learning_style, github_url, linkedin_url, overall_competency,
      placement_readiness, learning_streak, weekly_hours, avatar_url, bio, onboarding_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student1Id,
    'Alex Chen',
    'Apex Institute of Technology',
    'B.Tech',
    'Computer Science & Engineering',
    '3rd Year',
    '2026',
    'role-fullstack',
    'role-backend',
    'Intermediate',
    2.5,
    'Project-Based & Practical Coding',
    'https://github.com/alexchen-dev',
    'https://linkedin.com/in/alexchen-dev',
    72.4, // overall competency
    74.0, // placement readiness %
    6,    // streak
    14.5, // weekly hours
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'Aspiring Full Stack Engineer passionate about TypeScript, React, and scalable cloud architectures.',
    1
  );

  // Admin: Dr. Sarah Jenkins
  const adminId = 'usr-admin-sarah';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(adminId, 'admin@smartcompetency.com', passwordAdmin, 'admin');

  db.prepare(`
    INSERT INTO profiles (
      user_id, full_name, college, degree, branch, year, grad_year,
      target_role_id, overall_competency, placement_readiness, avatar_url, bio, onboarding_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'Dr. Sarah Jenkins',
    'Apex Institute of Technology',
    'Faculty',
    'Director of Placements & Training',
    'Staff',
    '2026',
    null,
    95.0,
    98.0,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'Director of University Placements & Corporate Relations.',
    1
  );

  // Student 2: Priya Sharma (Data Analyst)
  const student2Id = 'usr-student-priya';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(student2Id, 'priya@smartcompetency.com', passwordStudent, 'student');

  db.prepare(`
    INSERT INTO profiles (
      user_id, full_name, college, degree, branch, year, grad_year,
      target_role_id, secondary_role_id, experience_level, daily_hours,
      learning_style, github_url, linkedin_url, overall_competency,
      placement_readiness, learning_streak, weekly_hours, avatar_url, bio, onboarding_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student2Id,
    'Priya Sharma',
    'Apex Institute of Technology',
    'B.Tech',
    'Information Technology',
    '4th Year',
    '2026',
    'role-data-analyst',
    null,
    'Intermediate',
    3.0,
    'Visual & Analytics Driven',
    'https://github.com/priyasharma-data',
    'https://linkedin.com/in/priyasharma-analytics',
    78.5,
    81.0,
    12,
    18.0,
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'Data enthusiast with expertise in SQL, exploratory data analysis, and Tableau visualizations.',
    1
  );

  // Student 3: Rahul Verma (Backend)
  const student3Id = 'usr-student-rahul';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(student3Id, 'rahul@smartcompetency.com', passwordStudent, 'student');

  db.prepare(`
    INSERT INTO profiles (
      user_id, full_name, college, degree, branch, year, grad_year,
      target_role_id, secondary_role_id, experience_level, daily_hours,
      learning_style, github_url, linkedin_url, overall_competency,
      placement_readiness, learning_streak, weekly_hours, avatar_url, bio, onboarding_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student3Id,
    'Rahul Verma',
    'Apex Institute of Technology',
    'B.Tech',
    'Computer Science',
    '3rd Year',
    '2026',
    'role-backend',
    'role-fullstack',
    'Developing',
    2.0,
    'Hands-on Code & Labs',
    'https://github.com/rahulverma-dev',
    'https://linkedin.com/in/rahulverma-tech',
    64.0,
    62.0,
    3,
    11.0,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'Backend architecture enthusiast learning microservices and high-throughput databases.',
    1
  );

  // Seed Alex Chen's Student Skills
  const studentSkillsData = [
    { skillId: 'skill-js', level: 'Advanced', score: 85.0, confidence: 88.0, trend: 'up' },
    { skillId: 'skill-ts', level: 'Intermediate', score: 70.0, confidence: 75.0, trend: 'up' },
    { skillId: 'skill-react', level: 'Advanced', score: 82.0, confidence: 85.0, trend: 'up' },
    { skillId: 'skill-node', level: 'Intermediate', score: 68.0, confidence: 70.0, trend: 'up' },
    { skillId: 'skill-sql', level: 'Intermediate', score: 72.0, confidence: 75.0, trend: 'neutral' },
    { skillId: 'skill-dsa', level: 'Developing', score: 58.0, confidence: 60.0, trend: 'up' },
    { skillId: 'skill-git', level: 'Advanced', score: 88.0, confidence: 90.0, trend: 'up' },
    { skillId: 'skill-system-design', level: 'Beginner', score: 45.0, confidence: 50.0, trend: 'neutral' },
    { skillId: 'skill-cs-fundamentals', level: 'Intermediate', score: 65.0, confidence: 70.0, trend: 'neutral' },
    { skillId: 'skill-comm', level: 'Intermediate', score: 75.0, confidence: 80.0, trend: 'up' },
    { skillId: 'skill-quant', level: 'Developing', score: 60.0, confidence: 65.0, trend: 'neutral' },
    { skillId: 'skill-interview', level: 'Developing', score: 62.0, confidence: 65.0, trend: 'up' },
  ];

  const insertStudentSkill = db.prepare(`
    INSERT INTO student_skills (id, user_id, skill_id, current_level, current_score, confidence, last_assessed_at, assessment_count, trend)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), 2, ?)
  `);
  let sskId = 1;
  for (const sk of studentSkillsData) {
    insertStudentSkill.run(`ssk-${sskId++}`, student1Id, sk.skillId, sk.level, sk.score, sk.confidence, sk.trend);
  }

  // Seed Alex's Learning Path
  const lpId = 'lp-alex-fullstack';
  db.prepare(`
    INSERT INTO learning_paths (id, user_id, role_id, title, current_phase, total_items, completed_items)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(lpId, student1Id, 'role-fullstack', 'Full Stack Developer Mastery Path', 'Intermediate Skills', 12, 5);

  const learningItems = [
    { phase: 'Foundation', skillId: 'skill-js', title: 'ES6+ Execution Context & Closures', desc: 'Master lexical scope, closures, and modern ES2020+ features.', mins: 45, completed: 1, order: 1 },
    { phase: 'Foundation', skillId: 'skill-git', title: 'Interactive Git Workflows & PR Etiquette', desc: 'Branch management, semantic commit messages, and rebasing.', mins: 30, completed: 1, order: 2 },
    { phase: 'Core Skills', skillId: 'skill-react', title: 'Advanced React Hooks & Custom Hook Design', desc: 'Construct resilient custom hooks for data fetching and debounce.', mins: 60, completed: 1, order: 3 },
    { phase: 'Core Skills', skillId: 'skill-sql', title: 'Relational Indexing & Multi-Table Joins', desc: 'Design normalized schemas and write optimized queries with EXPLAIN.', mins: 50, completed: 1, order: 4 },
    { phase: 'Core Skills', skillId: 'skill-node', title: 'Express Middleware & JWT Authentication', desc: 'Build secure stateless authentication with refresh token rotations.', mins: 60, completed: 1, order: 5 },
    { phase: 'Intermediate Skills', skillId: 'skill-dsa', title: 'Two Pointers & Sliding Window Patterns', desc: 'Solve LeetCode Medium array and string problems with optimal complexity.', mins: 90, completed: 0, order: 6 },
    { phase: 'Intermediate Skills', skillId: 'skill-system-design', title: 'Microservices vs Monolith & Caching with Redis', desc: 'Understand latency numbers every programmer should know and cache invalidation.', mins: 60, completed: 0, order: 7 },
    { phase: 'Advanced Skills', skillId: 'skill-docker', title: 'Multi-stage Docker Builds & Container Security', desc: 'Package node microservices into minimal alpine containers.', mins: 45, completed: 0, order: 8 },
    { phase: 'Projects', skillId: 'skill-react', title: 'Build Full-Stack E-Commerce or Collaboration Tool', desc: 'Deploy a live application with payment/webhook integration and CI/CD.', mins: 120, completed: 0, order: 9 },
    { phase: 'Interview Prep', skillId: 'skill-interview', title: 'System Architecture & Behavioral STAR Drills', desc: 'Mock technical whiteboard rounds and behavioral storytelling practice.', mins: 45, completed: 0, order: 10 },
  ];

  const insertLearningItem = db.prepare(`
    INSERT INTO learning_items (id, learning_path_id, phase, skill_id, title, description, learning_objective, practice_task, resource_type, estimated_minutes, is_completed, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let liId = 1;
  for (const li of learningItems) {
    insertLearningItem.run(
      `li-${liId++}`,
      lpId,
      li.phase,
      li.skillId,
      li.title,
      li.desc,
      `Understand and implement ${li.title} in real-world scenarios.`,
      `Complete the hands-on lab exercise for ${li.title}`,
      'article',
      li.mins,
      li.completed,
      li.order
    );
  }

  // Seed Alex's Resume & Analysis
  const resumeId = 'res-alex-1';
  db.prepare(`
    INSERT INTO resumes (id, user_id, filename, file_size, parsed_content, target_role_id, overall_score, keyword_coverage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resumeId,
    student1Id,
    'Alex_Chen_Software_Engineer_Resume.pdf',
    245000,
    'ALEX CHEN | Full Stack Developer\nGitHub: github.com/alexchen-dev | LinkedIn: linkedin.com/in/alexchen-dev\n\nEDUCATION: B.Tech Computer Science, Apex Institute (CGPA: 8.7/10, 2022-2026)\n\nSKILLS: JavaScript (ES6+), TypeScript, React.js, Node.js, Express, PostgreSQL, SQL, Git, REST APIs, HTML/CSS.\n\nPROJECTS:\n1. CloudTask Collaboration Platform (React, Node.js, PostgreSQL): Built a task management app with real-time updates and team workspace permissions.\n2. E-Commerce Microservices Hub (React, Node, Redis): Created product catalog and cart service handling 100+ simulated users.',
    'role-fullstack',
    78.0,
    82.0
  );

  db.prepare(`
    INSERT INTO resume_analyses (id, resume_id, parsed_skills_json, matched_skills_json, missing_skills_json, project_score, formatting_score, improvement_suggestions_json, action_verb_rewrites_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'res-ana-alex-1',
    resumeId,
    JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Git', 'REST APIs']),
    JSON.stringify(['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'SQL & Relational Databases', 'Git & Version Control']),
    JSON.stringify(['System Design Fundamentals', 'Docker & Containerization', 'Automated Unit/Integration Testing']),
    80.0,
    88.0,
    JSON.stringify([
      'Add quantifiable impact metrics to CloudTask (e.g., "Reduced task retrieval latency by 35% using indexing")',
      'Explicitly include Docker and CI/CD pipelines in your skills and project descriptions',
      'Mention unit and integration testing frameworks (Jest, Vitest, Cypress) to stand out to tier-1 recruiters'
    ]),
    JSON.stringify([
      { original: 'Built a task management app with real-time updates', suggested: 'Architected a real-time collaborative workspace utilizing WebSocket feeds and PostgreSQL indexing, handling sub-50ms message delivery' },
      { original: 'Created product catalog and cart service', suggested: 'Engineered an asynchronous microservices-based catalog with Redis in-memory caching, boosting read throughput by 40%' }
    ])
  );

  // Seed Alex's Projects
  db.prepare(`
    INSERT INTO projects (
      id, user_id, title, problem_statement, description, tech_stack_json, github_url, live_demo_url, role, challenges, solutions, outcomes, strength_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'proj-alex-1',
    student1Id,
    'CloudTask - Real-Time Agile Collaboration Platform',
    'Student engineering teams struggled with cluttered communication and missed sprint deadlines.',
    'A high-performance full-stack web application featuring drag-and-drop Kanban boards, team workspaces, activity feeds, and automated deadline notifications.',
    JSON.stringify(['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Socket.io', 'Tailwind CSS']),
    'https://github.com/alexchen-dev/cloudtask',
    'https://cloudtask-demo.dev',
    'Lead Full Stack Architect',
    'Handling concurrent board state updates across multiple active team members without race conditions.',
    'Implemented optimistic UI updates with server-side sequence numbering and rollback support.',
    'Adopted by 12 student project groups with 99.8% uptime during final semester evaluations.',
    86.0
  );

  // Seed Alex's Daily Tasks for Today
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyTasks = [
    { type: 'learning', title: 'Complete "Two Pointers & Sliding Window" Module', desc: 'Focus on subarray sum problems and pointer convergence mechanics.', link: '/learning-path' },
    { type: 'coding', title: 'Solve Medium: Longest Substring Without Repeating Characters', desc: 'Practice sliding window technique with dynamic hash maps.', link: '/coding-lab' },
    { type: 'aptitude', title: 'Practice 5 Probability & Combinatorics Questions', desc: 'Review permutations, independent events, and conditional Bayes theorem.', link: '/aptitude' },
    { type: 'interview', title: 'Record AI Mock Interview Response: Virtual DOM & Diffing', desc: 'Focus on articulating heuristic tree diffing under 2 minutes.', link: '/interview-prep' },
  ];

  const insertTask = db.prepare(`
    INSERT INTO daily_tasks (id, user_id, date, task_type, title, description, link_to_module, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let dtId = 1;
  for (const dt of dailyTasks) {
    insertTask.run(`dt-${dtId++}`, student1Id, todayStr, dt.type, dt.title, dt.desc, dt.link, dtId === 2 ? 1 : 0);
  }

  // Seed User Achievements for Alex
  db.prepare(`
    INSERT INTO user_achievements (id, user_id, achievement_id)
    VALUES (?, ?, ?)
  `).run('uach-1', student1Id, 'ach-first-assessment');
  db.prepare(`
    INSERT INTO user_achievements (id, user_id, achievement_id)
    VALUES (?, ?, ?)
  `).run('uach-2', student1Id, 'ach-first-code');
  db.prepare(`
    INSERT INTO user_achievements (id, user_id, achievement_id)
    VALUES (?, ?, ?)
  `).run('uach-3', student1Id, 'ach-project-builder');

  // Seed Notifications for Alex
  const notifications = [
    { title: 'Diagnostic Assessment Completed', msg: 'You scored 72% in Full Stack Readiness. Review your skill matrix gap report.', type: 'assessment', link: '/assessment/results' },
    { title: 'New Personalized Learning Module Ready', msg: 'Algorithm pattern "Sliding Window" added to your roadmap.', type: 'learning', link: '/learning-path' },
    { title: 'Resume ATS Score: 78/100', msg: '3 high-priority action verb suggestions are ready in Resume Analyzer.', type: 'resume', link: '/resume-analyzer' },
    { title: 'Daily Practice Streak: 6 Days!', msg: 'Keep it going today to earn the 7-Day Consistency Champion badge.', type: 'achievement', link: '/dashboard' }
  ];

  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  let nId = 1;
  for (const n of notifications) {
    insertNotif.run(`notif-${nId++}`, student1Id, n.title, n.msg, n.type, 0, n.link);
  }

  console.log('[Seed] Database successfully populated with realistic full-stack curriculum, roles, problems, and demo profiles.');
}
