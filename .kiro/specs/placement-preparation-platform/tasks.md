# Implementation Plan: Placement Preparation Platform

## Overview

This implementation plan breaks down the Placement Preparation Platform into discrete, incremental coding tasks. The platform will be built using TypeScript for both frontend (React) and backend (Node.js/Express). Tasks are organized to build foundational infrastructure first, then layer in features progressively, with testing integrated throughout.

## Tasks

- [x] 1. Initialize project structure and core infrastructure
  - Set up monorepo structure with separate frontend and backend packages
  - Configure TypeScript for both frontend and backend
  - Set up ESLint, Prettier, and basic CI/CD with GitHub Actions
  - Initialize PostgreSQL database with docker-compose
  - Initialize Redis with docker-compose
  - Create base Express.js server with health check endpoint
  - Set up Jest testing framework for backend
  - _Requirements: 19.1, 19.2, 21.4_

- [-] 2. Implement authentication service
  - [x] 2.1 Create user database models and migrations
    - Implement User entity with all fields from design
    - Create database migration scripts using a migration tool (e.g., Knex or TypeORM)
    - _Requirements: 1.1, 1.6_

  - [x] 2.2 Implement email/password registration
    - Create registration endpoint with email format validation
    - Implement password strength validation (min 8 chars, 1 uppercase, 1 number, 1 special)
    - Hash passwords with bcrypt (12 salt rounds)
    - _Requirements: 1.1, 1.3, 1.6_

  - [x]* 2.3 Write property test for password validation
    - **Property 11: Password Strength Validation**
    - **Validates: Requirements 1.3**

  - [x]* 2.4 Write property test for email validation
    - **Property 12: Email Format Validation**
    - **Validates: Requirements 1.3**

  - [x] 2.5 Implement JWT authentication
    - Generate JWT tokens with 7-day expiry on successful login
    - Create login endpoint with email/password validation
    - Implement JWT verification middleware for protected routes
    - _Requirements: 1.4, 1.7_

  - [x]* 2.6 Write property test for JWT token expiry
    - **Property 15: JWT Token Expiry**
    - **Validates: Requirements 1.4, 1.5**

  - [ ] 2.7 Implement Google OAuth 2.0 integration
    - Set up OAuth client configuration
    - Create OAuth callback endpoint
    - Link or create user accounts on OAuth login
    - _Requirements: 1.2_

  - [ ] 2.8 Implement password reset flow
    - Create password reset request endpoint with email sending
    - Generate time-limited reset tokens (1 hour expiry)
    - Create password reset completion endpoint
    - _Requirements: 1.8_

  - [ ]* 2.9 Write unit tests for authentication service
    - Test registration with valid and invalid inputs
    - Test login success and failure scenarios
    - Test JWT generation and validation
    - Test OAuth flow
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement DSA pattern and problem management
  - [ ] 4.1 Create database models for patterns and problems
    - Implement Pattern entity with all fields
    - Implement Problem entity with all fields
    - Implement TestCase entity
    - Create database migrations
    - _Requirements: 2.1, 2.2_

  - [ ] 4.2 Seed database with 20 DSA patterns
    - Create seed script for 20 patterns (Sliding Window, Two Pointers, etc.)
    - Populate pattern descriptions and metadata
    - _Requirements: 2.1_

  - [ ] 4.3 Implement pattern listing API
    - Create GET /api/patterns endpoint
    - Return pattern name, description, difficulty range, total problems
    - Include user's solved count per pattern
    - _Requirements: 2.2_

  - [ ] 4.4 Implement problem listing API
    - Create GET /api/patterns/:id/problems endpoint
    - Return problems with difficulty, company tags, solved status
    - Implement pagination (50 items per page)
    - _Requirements: 2.3, 2.4, 2.5, 19.5_

  - [ ] 4.5 Implement problem detail API
    - Create GET /api/problems/:id endpoint
    - Return full problem details including description, constraints, examples, hints
    - Return starter code templates for all supported languages
    - _Requirements: 2.3_

  - [ ]* 4.6 Write unit tests for DSA endpoints
    - Test pattern listing with correct data
    - Test problem filtering and pagination
    - Test problem detail retrieval
    - _Requirements: 2.2, 2.3, 2.4_

- [ ] 5. Implement code execution service
  - [ ] 5.1 Create Judge0 API integration layer
    - Set up Judge0 client with API configuration
    - Implement code submission to Judge0
    - Implement polling for execution results
    - Map languages to Judge0 language IDs (C++: 54, Java: 62, Python: 71, JS: 63)
    - _Requirements: 3.1, 2.7_

  - [ ] 5.2 Implement test case execution logic
    - Execute code against all test cases for a problem
    - Enforce time limit (2000ms per test case)
    - Enforce memory limit (256MB per test case)
    - Aggregate results across all test cases
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 5.3 Implement submission status handling
    - Return "Accepted" when all test cases pass
    - Return "Wrong Answer" with first failing test case details
    - Return "Time Limit Exceeded" when time exceeded
    - Return "Memory Limit Exceeded" when memory exceeded
    - Return "Runtime Error" with error message
    - Return "Compilation Error" with compiler output
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ] 5.4 Create submission API endpoint
    - Create POST /api/problems/:id/submit endpoint
    - Validate code submission (max 50k characters, UTF-8 only)
    - Save submission to database
    - Execute code and return results within 3 seconds
    - _Requirements: 3.1, 19.3_

  - [ ]* 5.5 Write property test for execution status consistency
    - **Property 14: Code Execution Status Consistency**
    - **Validates: Requirements 3.7, 3.8**

  - [ ]* 5.6 Write property test for test case execution completeness
    - **Property 17: Test Case Execution Completeness**
    - **Validates: Requirements 3.2**

  - [ ]* 5.7 Write unit tests for code execution service
    - Test Judge0 integration with mock responses
    - Test time limit enforcement
    - Test memory limit enforcement
    - Test error handling for Judge0 failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Checkpoint - Ensure code execution tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement user problem progress tracking
  - [ ] 7.1 Create UserProblemProgress model and migrations
    - Implement entity with status, attempts, bookmarks, notes
    - Include spaced repetition fields (easiness factor, interval, next revision date)
    - _Requirements: 4.2, 17.1, 17.3_

  - [ ] 7.2 Update submission endpoint to track progress
    - Mark problem as solved on first successful submission
    - Increment attempt counter
    - Initialize spaced repetition schedule (1 day interval)
    - _Requirements: 4.2_

  - [ ] 7.3 Implement problem bookmark API
    - Create POST /api/problems/:id/bookmark endpoint
    - Toggle bookmark status
    - _Requirements: 17.1, 17.2_

  - [ ]* 7.4 Write property test for bookmark idempotence
    - **Property 18: Bookmark Idempotence**
    - **Validates: Requirements 17.1, 17.2**

  - [ ] 7.5 Implement problem notes API
    - Create POST /api/problems/:id/notes endpoint
    - Auto-save notes with 2-second debounce
    - _Requirements: 17.3, 17.4_

  - [ ] 7.6 Implement bookmarked problems listing
    - Create GET /api/problems/bookmarked endpoint
    - Support filtering by pattern and difficulty
    - _Requirements: 17.5, 17.6_

  - [ ]* 7.7 Write unit tests for problem progress tracking
    - Test bookmark toggle functionality
    - Test notes auto-save
    - Test bookmarked list filtering
    - _Requirements: 17.1, 17.3, 17.5_

- [ ] 8. Implement spaced repetition engine
  - [ ] 8.1 Implement SM-2 algorithm calculation function
    - Create calculateNextRevision function
    - Handle confidence levels 1-4
    - Apply easiness factor adjustments
    - Maintain easiness factor bounds [1.3, 2.5]
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 8.2 Write property test for SM-2 algorithm correctness
    - **Property 4: SM-2 Algorithm Correctness**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8**

  - [ ]* 8.3 Write property test for easiness factor invariant
    - **Property 5: SM-2 Easiness Factor Invariant**
    - **Validates: Requirements 4.8**

  - [ ]* 8.4 Write property test for revision due date calculation
    - **Property 20: Revision Due Date Calculation**
    - **Validates: Requirements 4.2, 4.3, 4.6, 4.7**

  - [ ] 8.5 Implement revision completion API
    - Create POST /api/revisions/:problemId/complete endpoint
    - Accept confidence level (1-4)
    - Calculate next revision date using SM-2
    - Update user problem progress
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 8.6 Implement due revisions API
    - Create GET /api/revisions/due endpoint
    - Query problems with next_revision_date <= today
    - Filter by user's timezone
    - _Requirements: 4.9, 4.10_

  - [ ] 8.7 Implement revision statistics API
    - Create GET /api/revisions/stats endpoint
    - Return total due revisions, completed revisions
    - _Requirements: 4.10_

  - [ ]* 8.8 Write unit tests for spaced repetition engine
    - Test SM-2 calculation with different confidence levels
    - Test revision scheduling
    - Test due revisions query
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Checkpoint - Ensure spaced repetition tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement streak system
  - [ ] 10.1 Create StreakHistory model and migrations
    - Implement entity with date, problems_solved, xp_earned, freeze_used
    - Add indexes for user_id and date queries
    - _Requirements: 5.1, 5.8_

  - [ ] 10.2 Implement streak tracking logic
    - Create recordActivity function with timezone awareness
    - Check for consecutive day activity
    - Increment streak on consecutive activity
    - Reset streak on gap without freeze
    - Update longest streak when surpassed
    - _Requirements: 5.1, 5.2, 5.3, 5.8_

  - [ ]* 10.3 Write property test for streak increment correctness
    - **Property 6: Streak Increment Correctness**
    - **Validates: Requirements 5.1**

  - [ ]* 10.4 Write property test for longest streak invariant
    - **Property 7: Longest Streak Invariant**
    - **Validates: Requirements 5.3**

  - [ ] 10.5 Implement streak freeze functionality
    - Apply freeze when user has no activity on a day
    - Maintain current streak when freeze applied
    - Deduct one freeze from user's available freezes
    - Provide 2 freezes per month
    - _Requirements: 5.4, 5.5_

  - [ ]* 10.6 Write property test for streak freeze preservation
    - **Property 16: Streak Freeze Preservation**
    - **Validates: Requirements 5.5**

  - [ ] 10.7 Implement streak API endpoints
    - Create GET /api/streak endpoint (current streak, longest, freezes)
    - Create POST /api/streak/freeze endpoint
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 10.8 Implement contribution heatmap API
    - Create GET /api/streak/heatmap endpoint
    - Return problem count for each day in past 365 days
    - Format as date -> count mapping
    - _Requirements: 5.9_

  - [ ]* 10.9 Write unit tests for streak system
    - Test streak increment on consecutive days
    - Test streak reset on gap
    - Test streak freeze application
    - Test longest streak tracking
    - Test timezone handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_

- [ ] 11. Implement gamification system
  - [ ] 11.1 Create Badge model and seed milestone badges
    - Implement Badge entity
    - Create UserBadge join table
    - Seed 10 predefined badges (Week Warrior, Month Master, etc.)
    - _Requirements: 5.7_

  - [ ] 11.2 Implement XP award logic
    - Create awardXP function
    - Award 10 XP for Easy, 20 for Medium, 30 for Hard
    - Award 5 XP for revisions completed
    - Award 100 XP for mock test completion
    - Award 10 XP for daily streak maintenance
    - Award 50 bonus XP for first-attempt solve
    - _Requirements: 5.10, 6.2, 6.6_

  - [ ]* 11.3 Write property test for XP award correctness
    - **Property 8: XP Award Correctness**
    - **Validates: Requirements 5.10**

  - [ ]* 11.4 Write property test for first attempt bonus XP
    - **Property 9: First Attempt Bonus XP**
    - **Validates: Requirements 6.6**

  - [ ] 11.5 Implement level calculation
    - Create calculateLevel function using formula: 100 * level^1.5
    - Check for level-up after XP awards
    - Update user's current level
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ]* 11.6 Write property test for level calculation formula consistency
    - **Property 10: Level Calculation Formula Consistency**
    - **Validates: Requirements 6.4**

  - [ ]* 11.7 Write property test for XP to level monotonicity
    - **Property 19: XP to Level Monotonicity**
    - **Validates: Requirements 6.4**

  - [ ] 11.8 Implement badge awarding logic
    - Check milestone conditions after activities
    - Award badges when conditions met (7-day streak, 30-day streak, etc.)
    - _Requirements: 5.7_

  - [ ] 11.9 Implement gamification API endpoints
    - Create GET /api/gamification/stats endpoint (level, XP, badges)
    - Create GET /api/gamification/badges endpoint (available and earned)
    - _Requirements: 6.5_

  - [ ]* 11.10 Write unit tests for gamification service
    - Test XP awards for different activities
    - Test level calculation
    - Test badge awarding
    - Test first-attempt bonus
    - _Requirements: 5.10, 6.1, 6.2, 6.3, 6.6_

- [ ] 12. Checkpoint - Ensure gamification tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement leaderboard system
  - [ ] 13.1 Set up Redis for leaderboard caching
    - Configure Redis client connection
    - Create leaderboard data structures (sorted sets)
    - _Requirements: 14.7_

  - [ ] 13.2 Implement leaderboard update logic
    - Update Redis sorted set when user earns XP
    - Organize by college
    - Update every 5 minutes with batch processing
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 13.3 Implement leaderboard API endpoints
    - Create GET /api/leaderboard/:college endpoint
    - Return top 100 users with rank and XP
    - Return current user's rank even if outside top 100
    - Support weekly and all-time views
    - Cache responses for 5 minutes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [ ]* 13.4 Write unit tests for leaderboard service
    - Test leaderboard ranking by XP
    - Test college filtering
    - Test weekly vs all-time views
    - Test user rank retrieval
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [ ] 14. Implement aptitude module
  - [ ] 14.1 Create aptitude database models
    - Implement AptitudeCategory model
    - Implement AptitudeQuestion model
    - Implement UserMockAttempt model
    - Create migrations
    - _Requirements: 7.1_

  - [ ] 14.2 Seed aptitude questions
    - Create seed script for quantitative, logical, and verbal categories
    - Add sample questions with answers and explanations
    - Tag questions with companies
    - _Requirements: 7.1, 7.9_

  - [ ] 14.3 Implement aptitude practice API
    - Create GET /api/aptitude/categories endpoint
    - Create GET /api/aptitude/questions endpoint with category filtering
    - Create POST /api/aptitude/answer endpoint for practice mode
    - Return immediate feedback with correct answer and explanation
    - _Requirements: 7.1, 7.2, 7.6_

  - [ ] 14.4 Implement aptitude mock test API
    - Create POST /api/aptitude/tests/:id/start endpoint
    - Create POST /api/aptitude/tests/:id/submit endpoint
    - Implement countdown timer (60 seconds per question)
    - Auto-submit on timer expiry
    - Calculate score, accuracy, time taken
    - Provide category-wise breakdown
    - _Requirements: 7.3, 7.4, 7.5, 7.7, 7.8_

  - [ ]* 14.5 Write unit tests for aptitude module
    - Test practice mode with feedback
    - Test mock test flow
    - Test timer and auto-submit
    - Test scoring calculation
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.7_

- [ ] 15. Implement Core CS module
  - [ ] 15.1 Create Core CS database models
    - Implement CSTopic model with content field (markdown)
    - Implement CSMCQ model
    - Create migrations
    - _Requirements: 8.1, 8.3_

  - [ ] 15.2 Seed Core CS topics and content
    - Create seed script for 6 subjects (OS, DBMS, Networks, OOP, System Design, Data Structures)
    - Add theory content in markdown format
    - Add code examples for each topic
    - Organize by difficulty (Beginner, Intermediate, Advanced)
    - _Requirements: 8.1, 8.2, 8.6_

  - [ ] 15.3 Implement Core CS content API
    - Create GET /api/core-cs/subjects endpoint
    - Create GET /api/core-cs/topics endpoint with filtering by subject and difficulty
    - Create GET /api/core-cs/topics/:id endpoint for full content
    - Track topic completion status
    - _Requirements: 8.1, 8.2, 8.6, 8.7_

  - [ ] 15.4 Implement MCQ practice API
    - Create GET /api/core-cs/topics/:id/mcqs endpoint
    - Create POST /api/core-cs/mcqs/:id/answer endpoint
    - _Requirements: 8.3_

  - [ ] 15.5 Implement SQL editor sandbox
    - Create isolated PostgreSQL schema per user session
    - Populate with sample tables (employees, departments, etc.)
    - Create POST /api/core-cs/sql/execute endpoint
    - Whitelist only SELECT, INSERT, UPDATE, DELETE operations
    - Reject DROP, TRUNCATE, ALTER, CREATE operations
    - Enforce 5-second query timeout
    - Reset schema after 1 hour of inactivity
    - _Requirements: 8.4, 8.5, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7_

  - [ ]* 15.6 Write property test for SQL query security restriction
    - **Property 13: SQL Query Security Restriction**
    - **Validates: Requirements 23.2, 23.3**

  - [ ]* 15.7 Write unit tests for Core CS module
    - Test topic content retrieval
    - Test MCQ practice
    - Test SQL sandbox execution
    - Test SQL dangerous operation rejection
    - Test SQL timeout enforcement
    - _Requirements: 8.1, 8.3, 8.4, 23.1, 23.2, 23.4_

- [ ] 16. Checkpoint - Ensure Core CS and aptitude tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement AI service with Claude API
  - [ ] 17.1 Set up Claude API client
    - Configure Anthropic SDK with API key
    - Set up rate limiting for AI requests
    - _Requirements: 9.4, 10.4_

  - [ ] 17.2 Implement progressive hint system
    - Create POST /api/ai/hint endpoint
    - Accept problemId, userCode, and hintLevel (1-3)
    - Generate hints without revealing solution
    - Use Claude 3.5 Sonnet with structured prompts
    - Respond within 5 seconds
    - Track hint count per problem per user
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 17.3 Implement AI code review
    - Create POST /api/ai/review endpoint
    - Accept code and problemId
    - Analyze time complexity, space complexity, code smells
    - Provide optimization suggestions and alternative approaches
    - Return structured JSON response
    - Respond within 8 seconds
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 17.4 Create AI interview session model
    - Implement AIInterviewSession model with transcript storage
    - Support three types: coding, behavioral, system_design
    - Create migrations
    - _Requirements: 11.1, 11.2_

  - [ ] 17.5 Implement AI mock interview endpoints
    - Create POST /api/ai/interview/start endpoint (selects appropriate question)
    - Create POST /api/ai/interview/message endpoint (continues conversation)
    - Implement session state management
    - Generate summary with score and feedback on completion
    - Store interview transcript
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ] 17.6 Implement AI study planner
    - Create POST /api/ai/study-plan endpoint
    - Accept target date, hours per day, skill level, weak areas
    - Generate day-by-day plan with specific topics and problems
    - Allocate time based on weak areas
    - Return within 15 seconds
    - Allow marking daily tasks as complete
    - Adjust recommendations based on completion rate
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 17.7 Write unit tests for AI service
    - Test hint generation with mock Claude responses
    - Test code review with mock responses
    - Test interview session flow
    - Test study plan generation
    - Test rate limiting
    - Test error handling for API failures
    - _Requirements: 9.1, 10.1, 11.1, 12.1_

- [ ] 18. Implement analytics dashboard
  - [ ] 18.1 Implement analytics aggregation service
    - Calculate total problems solved by difficulty
    - Calculate pattern-wise completion percentages
    - Calculate time spent on platform
    - Calculate average daily problems
    - Identify weak areas based on success rates
    - _Requirements: 13.1, 13.2, 13.6, 13.7_

  - [ ] 18.2 Implement company readiness calculation
    - Create calculateCompanyReadiness function
    - Match user's solved problems with company-tagged problems
    - Calculate base score from problem overlap
    - Add difficulty distribution bonus
    - Add recency bonus for recent activity
    - _Requirements: 13.4, 13.5_

  - [ ] 18.3 Implement analytics API endpoints
    - Create GET /api/analytics/dashboard endpoint
    - Create GET /api/analytics/company/:name/readiness endpoint
    - Create GET /api/analytics/weak-areas endpoint
    - Create GET /api/analytics/progress endpoint (progress over time)
    - Cache analytics data with 5-minute TTL
    - Respond within 2 seconds
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ]* 18.4 Write unit tests for analytics service
    - Test dashboard data aggregation
    - Test company readiness calculation
    - Test weak area identification
    - Test progress tracking
    - _Requirements: 13.1, 13.2, 13.4, 13.6_

- [ ] 19. Implement resume tools
  - [ ] 19.1 Implement PDF text extraction
    - Integrate PDF parsing library (e.g., pdf-parse)
    - Create extractTextFromPDF utility function
    - Validate PDF format and size (max 5MB)
    - _Requirements: 15.1_

  - [ ] 19.2 Implement ATS compatibility checker
    - Create POST /api/resume/analyze endpoint
    - Use Claude API to analyze resume content
    - Check formatting, keyword usage, structure
    - Return score (0-100) with breakdown
    - Provide keyword improvement suggestions
    - Respond within 10 seconds
    - _Requirements: 15.2, 15.3, 15.4, 15.5_

  - [ ] 19.3 Implement bullet point improver
    - Create POST /api/resume/improve-bullet endpoint
    - Accept bullet text and target role
    - Use Claude API to rewrite with action verbs and metrics
    - Return improved version within 5 seconds
    - _Requirements: 15.6, 15.7_

  - [ ]* 19.4 Write unit tests for resume tools
    - Test PDF text extraction
    - Test ATS scoring with mock responses
    - Test bullet point improvement
    - Test file size validation
    - _Requirements: 15.1, 15.2, 15.6_

- [ ] 20. Checkpoint - Ensure AI, analytics, and resume tools tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Implement notification system
  - [ ] 21.1 Set up Firebase Cloud Messaging and Nodemailer
    - Configure Firebase Admin SDK
    - Configure Nodemailer with SMTP settings
    - Create email templates for notifications
    - _Requirements: 16.4, 16.5_

  - [ ] 21.2 Create notification preferences model
    - Implement NotificationPreferences in user settings
    - Support enabling/disabling push and email
    - Configure notification time and enabled types
    - _Requirements: 16.6_

  - [ ] 21.3 Implement notification scheduling service
    - Create scheduleNotification function
    - Create sendImmediateNotification function
    - Implement notification delivery via FCM and email
    - Respect user's timezone for timing
    - _Requirements: 16.1, 16.6, 16.7_

  - [ ] 21.4 Implement notification jobs
    - Create daily reminder job (runs at user's configured time)
    - Create revision reminder job (runs every 6 hours)
    - Create streak warning job (runs 2 hours before midnight in user's timezone)
    - Create leaderboard update job (runs Monday mornings)
    - _Requirements: 16.1, 16.2, 16.3, 16.7_

  - [ ] 21.5 Implement notification API endpoints
    - Create GET /api/notifications/preferences endpoint
    - Create PUT /api/notifications/preferences endpoint
    - Create POST /api/notifications/fcm-token endpoint
    - _Requirements: 16.6_

  - [ ]* 21.6 Write unit tests for notification service
    - Test notification delivery with mocked FCM and email
    - Test preference updates
    - Test timezone handling
    - Test notification scheduling
    - _Requirements: 16.1, 16.4, 16.5, 16.6, 16.7_

- [ ] 22. Implement data backup and monitoring
  - [ ] 22.1 Set up automated database backups
    - Configure daily PostgreSQL backup script
    - Retain backups for 30 days
    - Encrypt backups at rest
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ] 22.2 Implement health check and monitoring
    - Create /health endpoint
    - Check database connection health
    - Check Redis connection health
    - Check Judge0 API availability
    - Implement exponential backoff retry on failures
    - _Requirements: 21.4, 21.5_

  - [ ] 22.3 Implement error handling and logging
    - Set up centralized error handler middleware
    - Configure Winston for structured logging
    - Implement consistent error response format
    - Log security events separately
    - Set up alerts for critical errors
    - _Requirements: 21.5_

  - [ ]* 22.4 Write unit tests for error handling
    - Test 4xx error responses
    - Test 5xx error handling
    - Test validation errors
    - Test rate limiting errors
    - _Requirements: 21.5_

- [ ] 23. Build React frontend foundation
  - [ ] 23.1 Initialize React application with TypeScript
    - Set up React 18 with Vite
    - Configure TypeScript strict mode
    - Set up Tailwind CSS
    - Configure ESLint and Prettier
    - Set up React Router for navigation
    - _Requirements: 18.1, 18.4_

  - [ ] 23.2 Create authentication UI
    - Build registration form with validation
    - Build login form
    - Build Google OAuth button
    - Build password reset flow
    - Implement JWT storage in httpOnly cookies
    - Create protected route wrapper
    - _Requirements: 1.1, 1.2, 1.3, 1.8_

  - [ ] 23.3 Set up global state management
    - Configure React Context for auth state
    - Configure Zustand for complex app state
    - Create auth context provider
    - _Requirements: 19.1, 19.2_

  - [ ] 23.4 Create layout and navigation components
    - Build app header with navigation
    - Build sidebar navigation
    - Implement mobile hamburger menu (< 768px)
    - Create responsive layout wrapper
    - _Requirements: 18.4, 18.5_

  - [ ] 23.5 Implement dark mode toggle
    - Create theme context
    - Build theme toggle component
    - Persist theme preference to localStorage
    - Set dark mode as default
    - Ensure WCAG AA contrast in both themes
    - _Requirements: 18.1, 18.2, 18.3, 18.6_

  - [ ]* 23.6 Write unit tests for frontend auth components
    - Test registration form validation
    - Test login flow
    - Test protected routes
    - Use React Testing Library
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 24. Build DSA practice UI
  - [ ] 24.1 Create pattern listing page
    - Build pattern cards with name, description, problem count
    - Display user's solved count per pattern
    - Implement grid layout responsive design
    - _Requirements: 2.1, 2.2_

  - [ ] 24.2 Create problem listing page
    - Build problem table with title, difficulty, acceptance rate, company tags
    - Implement filtering by difficulty
    - Implement pagination (50 items per page)
    - Show solved/unsolved status indicators
    - _Requirements: 2.3, 2.4, 2.5, 19.5_

  - [ ] 24.3 Integrate Monaco Editor
    - Install and configure Monaco Editor for React
    - Support syntax highlighting for C++, Java, Python, JavaScript
    - Implement language selector
    - Implement font size adjustment
    - Load starter code templates
    - _Requirements: 2.6, 2.7_

  - [ ] 24.4 Build problem detail page
    - Display problem description with markdown rendering
    - Display constraints and examples
    - Integrate Monaco Editor
    - Build test case results display
    - Show runtime and memory statistics
    - Implement hint request button
    - Implement bookmark button
    - Implement notes section with auto-save
    - _Requirements: 2.3, 2.6, 17.3, 17.4_

  - [ ] 24.5 Implement code submission flow
    - Build submit button with loading state
    - Call submission API
    - Display execution results (Accepted, Wrong Answer, TLE, etc.)
    - Show test cases passed/failed
    - Display XP earned
    - Update problem status UI
    - _Requirements: 3.1, 3.7, 3.8_

  - [ ]* 24.6 Write integration tests for DSA UI
    - Test problem listing and filtering
    - Test Monaco Editor integration
    - Test code submission flow
    - _Requirements: 2.3, 2.6, 3.1_

- [ ] 25. Checkpoint - Ensure frontend DSA features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Build gamification UI
  - [ ] 26.1 Create streak display component
    - Build flame icon animation that grows with streak
    - Display current streak and longest streak
    - Show available streak freezes
    - Implement streak freeze button
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [ ] 26.2 Create contribution heatmap component
    - Build GitHub-style heatmap for past 365 days
    - Color-code by problem count per day
    - Show tooltip on hover with date and count
    - _Requirements: 5.9_

  - [ ] 26.3 Create XP and level display component
    - Show current level and XP
    - Display progress bar toward next level
    - Show XP required for next level
    - _Requirements: 6.1, 6.5_

  - [ ] 26.4 Create badge display component
    - Display earned badges with icons
    - Show locked badges with requirements
    - Implement badge detail modal
    - _Requirements: 5.7_

  - [ ] 26.5 Build leaderboard page
    - Display top 100 users in table format
    - Show rank, name, college, XP
    - Highlight current user's row
    - Implement weekly/all-time toggle
    - Filter by college
    - _Requirements: 14.1, 14.2, 14.4, 14.5, 14.6_

  - [ ]* 26.6 Write integration tests for gamification UI
    - Test streak display and freeze
    - Test heatmap rendering
    - Test level display
    - Test leaderboard
    - _Requirements: 5.1, 5.4, 5.9, 6.5, 14.1_

- [ ] 27. Build spaced repetition UI
  - [ ] 27.1 Create revision queue page
    - Display problems due for revision
    - Show next revision date for each problem
    - Provide link to solve problem again
    - _Requirements: 4.9_

  - [ ] 27.2 Create confidence rating modal
    - Show modal after revision completion
    - Provide 4 buttons for confidence levels (1: Difficult, 2: Moderate, 3: Good, 4: Easy)
    - Submit confidence level to API
    - Show next revision date
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 27.3 Write integration tests for revision UI
    - Test revision queue display
    - Test confidence rating submission
    - _Requirements: 4.3, 4.9_

- [ ] 28. Build aptitude module UI
  - [ ] 28.1 Create aptitude categories page
    - Display three categories: Quantitative, Logical, Verbal
    - Show problem count per category
    - Provide buttons for practice and mock test
    - _Requirements: 7.1_

  - [ ] 28.2 Create aptitude practice page
    - Display question with 4 options
    - Implement option selection
    - Show immediate feedback on answer
    - Display correct answer and explanation
    - Provide next question button
    - _Requirements: 7.2, 7.6_

  - [ ] 28.3 Create mock test interface
    - Display countdown timer
    - Show question navigation grid
    - Prevent feedback until test completion
    - Auto-submit on timer expiry
    - Display results page with score, accuracy, time taken
    - Show category-wise breakdown
    - _Requirements: 7.3, 7.4, 7.5, 7.7, 7.8_

  - [ ]* 28.4 Write integration tests for aptitude UI
    - Test practice mode flow
    - Test mock test timer
    - Test auto-submit
    - Test results display
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 29. Build Core CS module UI
  - [ ] 29.1 Create Core CS subjects page
    - Display 6 subject cards (OS, DBMS, Networks, OOP, System Design, Data Structures)
    - Show topic count per subject
    - _Requirements: 8.1_

  - [ ] 29.2 Create topic listing page
    - Display topics organized by difficulty
    - Filter by subject
    - Show completion status
    - _Requirements: 8.2, 8.6, 8.7_

  - [ ] 29.3 Create topic detail page
    - Render markdown content
    - Display code examples with syntax highlighting
    - Show diagrams
    - Mark as complete button
    - Link to related topics
    - _Requirements: 8.2_

  - [ ] 29.4 Create SQL editor for DBMS practice
    - Integrate Monaco Editor with SQL language support
    - Build execute query button
    - Display query results in table format
    - Show execution time
    - Display error messages for failed queries
    - _Requirements: 8.4, 8.5, 23.5, 23.6_

  - [ ] 29.5 Create MCQ practice page
    - Display MCQ questions for selected topic
    - Show 4 options
    - Provide immediate feedback
    - Display explanation
    - _Requirements: 8.3_

  - [ ]* 29.6 Write integration tests for Core CS UI
    - Test topic content rendering
    - Test SQL editor execution
    - Test MCQ practice
    - _Requirements: 8.2, 8.3, 8.4_

- [ ] 30. Checkpoint - Ensure aptitude and Core CS UI work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 31. Build AI features UI
  - [ ] 31.1 Create hint request interface
    - Add hint button to problem page
    - Show hint level indicator (1/3, 2/3, 3/3)
    - Display hint in modal or expandable section
    - Disable button when all hints viewed
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ] 31.2 Create code review interface
    - Add code review button to problem page
    - Display review results with sections: time complexity, space complexity, code smells, optimizations
    - Show overall score
    - Provide alternative approaches
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 31.3 Create mock interview interface
    - Build interview type selection (coding, behavioral, system design)
    - Create chat interface for interview conversation
    - Display AI questions and user responses
    - Show typing indicator while AI generates response
    - Display final score and feedback
    - Store interview transcript
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 31.4 Create study planner interface
    - Build form for target date, hours per day, skill level, weak areas
    - Display generated day-by-day plan
    - Show tasks for each day with checkboxes
    - Track completion rate
    - Provide regenerate button
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

  - [ ]* 31.5 Write integration tests for AI features UI
    - Test hint request
    - Test code review display
    - Test interview flow
    - Test study planner
    - _Requirements: 9.1, 10.1, 11.1, 12.1_

- [ ] 32. Build analytics dashboard UI
  - [ ] 32.1 Create dashboard overview page
    - Display total problems solved by difficulty (cards with counts)
    - Show pattern completion chart (pie or bar chart)
    - Display current streak and XP
    - Show time spent and average daily problems
    - _Requirements: 13.1, 13.2, 13.3, 13.7_

  - [ ] 32.2 Create company readiness section
    - Build company selector
    - Display readiness score as progress bar or gauge
    - Show problems matched vs total
    - List recommended problems for target company
    - _Requirements: 13.4, 13.5_

  - [ ] 32.3 Create weak areas visualization
    - Display weak patterns with success rates
    - Show problems attempted and average attempts
    - Provide links to practice weak patterns
    - _Requirements: 13.6_

  - [ ] 32.4 Implement progress over time chart
    - Build line chart showing problems solved over time
    - Allow date range selection
    - _Requirements: 13.7_

  - [ ]* 32.5 Write integration tests for analytics UI
    - Test dashboard data display
    - Test company readiness calculation
    - Test weak areas visualization
    - _Requirements: 13.1, 13.4, 13.6_

- [ ] 33. Build resume tools UI
  - [ ] 33.1 Create resume upload page
    - Build file upload component (max 5MB, PDF only)
    - Show upload progress
    - Display uploaded file name
    - _Requirements: 15.1_

  - [ ] 33.2 Create ATS analysis results page
    - Display ATS score with breakdown (formatting, keywords, structure)
    - Show issues list with severity indicators
    - Display keyword suggestions
    - Provide improvement recommendations
    - _Requirements: 15.2, 15.3, 15.4, 15.5_

  - [ ] 33.3 Create bullet point improver interface
    - Build text input for original bullet
    - Add role/position field
    - Display improved bullet point
    - Provide copy to clipboard button
    - _Requirements: 15.6, 15.7_

  - [ ]* 33.4 Write integration tests for resume tools UI
    - Test file upload
    - Test ATS analysis display
    - Test bullet point improvement
    - _Requirements: 15.1, 15.2, 15.6_

- [ ] 34. Build notification preferences UI
  - [ ] 34.1 Create settings page
    - Build notification preferences form
    - Toggle switches for push and email notifications
    - Time picker for daily notification time
    - Checkboxes for notification types
    - Save preferences button
    - _Requirements: 16.6_

  - [ ] 34.2 Implement push notification registration
    - Request notification permission on first visit
    - Register FCM token with backend
    - Handle notification display in browser
    - _Requirements: 16.4_

  - [ ]* 34.3 Write integration tests for notification UI
    - Test preference updates
    - Test notification permission flow
    - _Requirements: 16.6_

- [ ] 35. Implement accessibility features
  - [ ] 35.1 Add ARIA labels and keyboard navigation
    - Add aria-label to all interactive elements
    - Ensure all forms have proper labels
    - Implement keyboard shortcuts for common actions
    - Ensure focus indicators are visible (2px outline minimum)
    - _Requirements: 20.2, 20.3, 20.4_

  - [ ] 35.2 Test screen reader compatibility
    - Test navigation with NVDA/JAWS
    - Ensure all content is accessible via screen reader
    - Add alt text for all images
    - _Requirements: 20.1, 20.5, 20.6_

  - [ ] 35.3 Implement font size adjustment
    - Add font size controls in settings
    - Support 100% to 200% zoom without layout breaking
    - _Requirements: 20.7_

  - [ ]* 35.4 Write accessibility tests
    - Test keyboard navigation
    - Test ARIA labels presence
    - Test contrast ratios meet WCAG AA
    - _Requirements: 20.1, 20.2, 20.3, 20.6_

- [ ] 36. Checkpoint - Ensure all UI features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 37. Implement Progressive Web App features
  - [ ] 37.1 Create service worker for offline support
    - Set up Workbox for service worker generation
    - Cache static assets (JS, CSS, images)
    - Implement offline fallback page
    - _Requirements: 19.4_

  - [ ] 37.2 Add PWA manifest
    - Create manifest.json with app metadata
    - Add icons for different device sizes
    - Configure display mode and theme colors
    - _Requirements: 18.1_

  - [ ] 37.3 Implement lazy loading
    - Lazy load Monaco Editor
    - Lazy load route components with React.lazy
    - Lazy load images with loading="lazy"
    - _Requirements: 19.4_

  - [ ]* 37.4 Write tests for PWA features
    - Test service worker registration
    - Test offline fallback
    - Test manifest validity
    - _Requirements: 19.4_

- [ ] 38. Implement rate limiting and security
  - [ ] 38.1 Add rate limiting middleware
    - Implement rate limiter (100 requests per 15 minutes)
    - Return 429 status on limit exceeded
    - Store rate limit counters in Redis
    - Apply stricter limits to auth endpoints (20 per hour)
    - _Requirements: 1.3_

  - [ ] 38.2 Implement input validation and sanitization
    - Validate all input fields
    - Sanitize user-generated content to prevent XSS
    - Use parameterized queries for SQL injection prevention
    - _Requirements: 1.7, 23.2_

  - [ ] 38.3 Add CSRF protection
    - Implement CSRF tokens for state-changing operations
    - Validate tokens on POST/PUT/DELETE requests
    - _Requirements: 1.7_

  - [ ] 38.4 Configure security headers
    - Set Content-Security-Policy headers
    - Set X-Content-Type-Options: nosniff
    - Set X-Frame-Options: DENY
    - Enable HTTPS/TLS 1.3
    - _Requirements: 1.7_

  - [ ] 38.5 Implement account lockout
    - Lock account after 5 failed login attempts within 15 minutes
    - Send unlock email with time-limited token
    - _Requirements: 1.3_

  - [ ]* 38.6 Write security tests
    - Test rate limiting enforcement
    - Test XSS prevention
    - Test CSRF protection
    - Test SQL injection prevention
    - _Requirements: 1.3, 1.7, 23.2_

- [ ] 39. Implement configuration parsers
  - [ ] 39.1 Create Configuration model and parser
    - Define Configuration interface with all user preference fields
    - Implement parseConfiguration function to parse JSON
    - Implement serializeConfiguration function to format to JSON
    - Validate all required fields
    - Return descriptive errors for missing fields
    - _Requirements: 22.1, 22.2, 22.5, 22.6_

  - [ ]* 39.2 Write property test for configuration round-trip integrity
    - **Property 1: Configuration Round-Trip Integrity**
    - **Validates: Requirements 22.4**

  - [ ]* 39.3 Write property test for configuration parser validation
    - **Property 2: Configuration Parser Validation**
    - **Validates: Requirements 22.5, 22.6**

  - [ ] 39.4 Create Problem parser
    - Define Problem interface for structured problem statements
    - Implement parseProblem function to parse markdown
    - Implement formatProblem function to convert to markdown
    - Extract code examples with language metadata
    - _Requirements: 24.1, 24.2, 24.5_

  - [ ]* 39.5 Write property test for problem statement round-trip integrity
    - **Property 3: Problem Statement Round-Trip Integrity**
    - **Validates: Requirements 24.4, 24.5**

  - [ ]* 39.6 Write unit tests for parsers
    - Test configuration parsing with valid and invalid JSON
    - Test problem parsing with valid markdown
    - Test error messages for malformed input
    - _Requirements: 22.1, 22.2, 24.1, 24.2_

- [ ] 40. Checkpoint - Ensure security and parsers work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 41. Performance optimization
  - [ ] 41.1 Implement database connection pooling
    - Configure PostgreSQL connection pool (max 20 connections)
    - Implement connection health checks
    - _Requirements: 19.1, 19.2_

  - [ ] 41.2 Add caching layer
    - Cache problem metadata in Redis (1 hour TTL)
    - Cache leaderboard data in Redis (5 minute TTL)
    - Cache user stats in Redis (5 minute TTL)
    - Set HTTP cache headers for static assets (7 days)
    - _Requirements: 14.7, 19.6_

  - [ ] 41.3 Optimize database queries
    - Add indexes to frequently queried columns (already in schema)
    - Optimize analytics queries with aggregation
    - Ensure all queries complete within 100ms
    - _Requirements: 19.2_

  - [ ] 41.4 Implement code splitting and bundle optimization
    - Configure Vite for code splitting
    - Analyze bundle size and optimize
    - Use dynamic imports for large libraries
    - _Requirements: 19.1, 19.4_

  - [ ]* 41.5 Write performance tests
    - Test page load time (target < 2 seconds)
    - Test API response times (target < 100ms for most endpoints)
    - Test code execution response (target < 3 seconds)
    - _Requirements: 19.1, 19.2, 19.3_

- [ ] 42. Integration and end-to-end testing
  - [ ] 42.1 Set up Playwright for E2E tests
    - Install and configure Playwright
    - Set up test database and seed data
    - _Requirements: 19.1_

  - [ ] 42.2 Write critical path E2E tests
    - Test complete user journey: register → solve problem → get XP → level up
    - Test spaced repetition flow: solve → mark for revision → complete revision
    - Test streak flow: solve daily → maintain streak → apply freeze
    - Test aptitude mock test flow
    - Test AI features: hint, code review, interview
    - _Requirements: 1.1, 2.3, 3.1, 4.3, 5.1, 7.3, 9.1, 10.1, 11.1_

  - [ ]* 42.3 Write integration tests for external services
    - Test Judge0 integration with mock server
    - Test Claude API integration with mock server
    - Test Firebase messaging with mock
    - Test OAuth flow with mock provider
    - _Requirements: 1.2, 3.1, 9.1, 16.4_

- [ ] 43. Deployment and DevOps
  - [ ] 43.1 Create Docker containers
    - Create Dockerfile for backend (Node.js)
    - Create Dockerfile for frontend (Nginx serving static build)
    - Update docker-compose.yml to orchestrate all services
    - _Requirements: 19.1_

  - [ ] 43.2 Set up CI/CD pipeline
    - Configure GitHub Actions workflow
    - Run linting, type checking, tests on every push
    - Build and push Docker images on main branch
    - Deploy to staging environment automatically
    - Require manual approval for production
    - _Requirements: 19.1_

  - [ ] 43.3 Configure environment variables
    - Set up .env files for development, staging, production
    - Document all required environment variables
    - Use secrets management for sensitive values
    - _Requirements: 1.7_

  - [ ] 43.4 Set up monitoring and logging
    - Configure application logging with Winston
    - Set up error tracking with Sentry or similar
    - Configure uptime monitoring
    - Set up alerts for critical failures
    - _Requirements: 21.4, 21.5_

  - [ ]* 43.5 Write deployment verification tests
    - Test health check endpoint
    - Test database connectivity
    - Test Redis connectivity
    - Test external API connectivity
    - _Requirements: 21.4_

- [ ] 44. Documentation and final polish
  - [ ] 44.1 Write API documentation
    - Document all REST API endpoints with request/response formats
    - Use OpenAPI/Swagger specification
    - Include authentication requirements
    - Provide example requests and responses
    - _Requirements: All API requirements_

  - [ ] 44.2 Write developer setup guide
    - Document local development setup steps
    - Include prerequisites (Node.js, PostgreSQL, Redis)
    - Document environment variable configuration
    - Provide troubleshooting section
    - _Requirements: 19.1_

  - [ ] 44.3 Write user guide
    - Document all platform features for end users
    - Include screenshots and step-by-step instructions
    - Explain gamification mechanics
    - Provide tips for effective preparation
    - _Requirements: All user-facing requirements_

  - [ ] 44.4 Conduct final manual testing
    - Test all features across browsers (Chrome, Firefox, Safari, Edge)
    - Test responsive design on mobile devices
    - Test dark mode and light mode
    - Verify accessibility with screen reader
    - Test performance on 4G connection
    - _Requirements: 18.1, 18.4, 18.5, 19.1, 20.1, 20.6_

- [ ] 45. Final checkpoint - Full system verification
  - Ensure all tests pass (unit, integration, property-based, E2E)
  - Verify all features work as specified
  - Check code coverage meets 80% threshold
  - Review security measures
  - Confirm accessibility compliance
  - Ask the user if questions arise or if ready for deployment.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation is organized to build foundational services first, then layer in features
- Frontend development begins after core backend services are stable
- Security and performance are integrated throughout rather than added at the end

## Implementation Language

**TypeScript** will be used for both frontend (React) and backend (Node.js/Express) implementation.

## Testing Configuration

- **Unit Testing**: Jest with minimum 80% code coverage
- **Property-Based Testing**: fast-check with minimum 100 iterations per property
- **E2E Testing**: Playwright for browser automation
- **Integration Testing**: Supertest for API testing

## External Services Required

- **Judge0 API**: Code execution sandbox
- **Claude API (Anthropic)**: AI-powered features
- **Firebase Cloud Messaging**: Push notifications
- **SMTP Server**: Email notifications
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
