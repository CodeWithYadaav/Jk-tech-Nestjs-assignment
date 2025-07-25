const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedData() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'nestjs',
            password: 'nestjspassword',
            database: 'nestjs_app'
        });

        console.log('Connected to MySQL database');

        // Hash passwords
        const hashedPassword1 = await bcrypt.hash('SecurePass123!', 10);
        const hashedPassword2 = await bcrypt.hash('MyPassword456@', 10);
        const hashedPassword3 = await bcrypt.hash('DevLife789#', 10);

        // Insert realistic users
        const [userResult1] = await connection.execute(
            'INSERT INTO users (email, firstName, lastName, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            ['alex.johnson@techcorp.com', 'Alex', 'Johnson', hashedPassword1, true]
        );

        const [userResult2] = await connection.execute(
            'INSERT INTO users (email, firstName, lastName, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            ['sarah.williams@startup.io', 'Sarah', 'Williams', hashedPassword2, true]
        );

        const [userResult3] = await connection.execute(
            'INSERT INTO users (email, firstName, lastName, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            ['mike.chen@freelancer.dev', 'Mike', 'Chen', hashedPassword3, true]
        );

        console.log('Sample users created');

        // Insert genuine, meaningful posts
        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'Building Scalable APIs with NestJS: A Production Journey',
                'After migrating our monolithic application to NestJS microservices, we saw a 40% improvement in response times and much better code maintainability. Here are the key lessons learned from our 6-month journey: 1) Proper dependency injection saves tons of debugging time, 2) Guards and interceptors are game-changers for cross-cutting concerns, 3) The built-in validation with class-validator prevents so many runtime errors. The learning curve is steep but absolutely worth it for any serious Node.js backend development.',
                true,
                userResult1.insertId
            ]
        );

        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'Why We Chose Sequelize Over Prisma for Our Startup',
                'As a startup CTO, choosing the right ORM was crucial for our MVP development speed. After testing both Prisma and Sequelize extensively, we went with Sequelize for three main reasons: 1) More mature ecosystem with better community support, 2) Flexible query building that doesn\'t lock us into generated types, 3) Better performance for complex queries with raw SQL fallback. While Prisma has excellent TypeScript support, Sequelize\'s flexibility won out for our rapidly changing data models. The migration system, though not as elegant as Prisma\'s, has proven reliable in production.',
                true,
                userResult2.insertId
            ]
        );

        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'Docker in Development: Beyond the Hype',
                'Three years ago, I was skeptical about Docker for local development. "Just another layer of complexity," I thought. How wrong I was. Docker has transformed how our team collaborates and deploys. The game-changer was docker-compose with hot reloading - suddenly, onboarding new developers went from 2 days to 30 minutes. No more "works on my machine" issues. The real win came during production deployments: identical environments from dev to prod eliminated 90% of deployment-related bugs. Yes, there\'s a learning curve, but the productivity gains are massive.',
                true,
                userResult3.insertId
            ]
        );

        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'JWT Authentication: Security Best Practices I Wish I Knew Earlier',
                'Implementing JWT authentication seems straightforward until you hit production. Here are the hard-learned lessons: 1) Always use short-lived access tokens (15-30 minutes) with refresh tokens, 2) Store refresh tokens securely (httpOnly cookies, not localStorage), 3) Implement proper token rotation, 4) Use strong, rotating secrets and consider asymmetric signing for microservices. The biggest mistake I made early on was storing JWTs in localStorage - a perfect target for XSS attacks. Moving to httpOnly cookies with CSRF protection was a game-changer for security.',
                false,
                userResult1.insertId
            ]
        );

        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'The Hidden Costs of Technical Debt: A Real-World Case Study',
                'Last quarter, we spent 60% of our development time fixing bugs instead of building features. This post breaks down how technical debt accumulated in our codebase and the systematic approach we used to pay it down. The biggest culprits were: lack of proper testing (especially integration tests), inconsistent error handling, and tight coupling between modules. Our solution involved: 1) Implementing comprehensive testing with 80%+ coverage, 2) Standardizing error handling across all services, 3) Refactoring to dependency injection patterns. The result? Bug reports dropped 70% and feature development speed doubled.',
                true,
                userResult2.insertId
            ]
        );

        await connection.execute(
            'INSERT INTO posts (title, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [
                'From Freelancer to Tech Lead: Lessons in Code Review Culture',
                'Transitioning from solo freelancing to leading a development team taught me that code reviews are about much more than catching bugs. They\'re about knowledge sharing, maintaining code quality, and building team culture. Here\'s what I learned: 1) Focus on teaching, not just finding issues, 2) Establish clear standards and document them, 3) Review for security, performance, and maintainability - not just functionality, 4) Make reviews a learning opportunity for everyone. The best code reviews I\'ve seen include explanations of why certain approaches were chosen and suggestions for improvement.',
                false,
                userResult3.insertId
            ]
        );

        console.log('Sample posts created');

        // Display the data
        const [users] = await connection.execute('SELECT id, email, firstName, lastName, isActive FROM users');
        const [posts] = await connection.execute('SELECT id, title, LEFT(content, 100) as content_preview, isPublished, authorId FROM posts');

        console.log('\n=== USERS ===');
        console.table(users);

        console.log('\n=== POSTS ===');
        console.table(posts);

        await connection.end();
        console.log('\nRealistic sample data added successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seedData();