# Data Models

This directory contains TypeScript interfaces and types for all database entities in the Placement Preparation Platform.

## User Model

### Files
- `User.ts`: User entity model with interfaces and transformation functions

### Interfaces

#### `User`
Main user entity representing a student account.

**Fields**:
- **Identity**: id, email, passwordHash, fullName, college, graduationYear, avatarUrl
- **OAuth**: oauthProvider, oauthId
- **Gamification**: currentStreak, longestStreak, lastActivityDate, totalXp, currentLevel, streakFreezes
- **Preferences**: dailyGoal, timezone, notificationTime, theme
- **Metadata**: createdAt, updatedAt

#### `CreateUserInput`
Input for creating a new user (registration).

#### `UpdateUserInput`
Input for updating user profile information.

#### `UserRow`
Database row type matching PostgreSQL schema (snake_case fields).

### Transformation Functions

#### `rowToUser(row: UserRow): User`
Converts a database row to a User entity (snake_case → camelCase).

#### `userToInsertValues(input: CreateUserInput): Partial<UserRow>`
Converts CreateUserInput to database insert values.

## Usage Examples

### Creating a User

```typescript
import { createUser } from '../repositories/UserRepository.js';
import { CreateUserInput } from '../models/User.js';

const input: CreateUserInput = {
  email: 'student@example.com',
  passwordHash: await bcrypt.hash('password123', 12),
  fullName: 'John Doe',
  college: 'MIT',
  graduationYear: 2025,
  timezone: 'America/New_York',
};

const user = await createUser(input);
console.log(`User created with ID: ${user.id}`);
```

### Finding a User

```typescript
import { findUserByEmail } from '../repositories/UserRepository.js';

const user = await findUserByEmail('student@example.com');
if (user) {
  console.log(`Found user: ${user.fullName}`);
  console.log(`Current streak: ${user.currentStreak} days`);
  console.log(`Level: ${user.currentLevel}, XP: ${user.totalXp}`);
}
```

### Updating a User

```typescript
import { updateUser } from '../repositories/UserRepository.js';
import { UpdateUserInput } from '../models/User.js';

const updates: UpdateUserInput = {
  college: 'Stanford University',
  dailyGoal: 3,
  timezone: 'America/Los_Angeles',
};

const updatedUser = await updateUser(userId, updates);
```

### OAuth User Creation

```typescript
const oauthInput: CreateUserInput = {
  email: 'user@gmail.com',
  fullName: 'Jane Smith',
  oauthProvider: 'google',
  oauthId: 'google-oauth-id-123456',
  timezone: 'Asia/Kolkata',
};

const user = await createUser(oauthInput);
```

## Repository Pattern

The User model is accessed through the `UserRepository` which provides:

- `createUser(input)`: Create new user
- `findUserById(id)`: Find by UUID
- `findUserByEmail(email)`: Find by email
- `findUserByOAuth(provider, oauthId)`: Find OAuth user
- `updateUser(id, updates)`: Update profile
- `updateUserStreak(id, currentStreak, longestStreak, lastActivityDate)`: Update streak data
- `updateUserXP(id, totalXp, currentLevel)`: Update XP and level
- `decrementStreakFreezes(id)`: Use a streak freeze
- `getUsersByCollege(college, limit, offset)`: Get users for leaderboard
- `getUserRankInCollege(userId, college)`: Get user's rank
- `isEmailRegistered(email)`: Check email availability
- `deleteUser(id)`: Delete user (testing only)

## Database Schema

The User model maps to the `users` table in PostgreSQL. See `database/migrations/001_create_users_table.sql` for the complete schema definition.

## Testing

Unit tests for the User model are in `__tests__/User.test.ts`.

Run tests:
```bash
npm test -- User.test.ts
```

Tests cover:
- Row to entity transformation
- Entity to insert values transformation
- Null/undefined handling
- OAuth user handling
