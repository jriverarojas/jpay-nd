# Authentication Module

This module implements dual authentication system supporting both JWT (Supabase) and API Key authentication.

## Configuration

Add the following environment variables to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` now contains the **Secret Key** from Supabase (formerly called Service Role Key). You can find it in Supabase Dashboard → Settings → API → Secret Key.

## Usage

### Protecting Routes with MultiAuthGuard

The `MultiAuthGuard` supports both authentication methods:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { MultiAuthGuard } from '../auth/guards/multi-auth.guard';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(MultiAuthGuard)
  getProtectedData(@Request() req) {
    const user: AuthUser = req.user;
    return { message: 'Protected data', user };
  }
}
```

### JWT Authentication

Send the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/protected
```

### API Key Authentication

Send the API key in the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/protected
```

## Database Schema

The `user_api_keys` table stores hashed API keys:

- `user_id`: UUID reference to Supabase Auth user
- `key_hash`: SHA-256 hash of the API key
- `is_active`: Boolean flag to enable/disable keys
- `last_used_at`: Timestamp of last usage

## Creating API Keys

To create an API key for a user, you need to:

1. Generate a secure random key
2. Hash it using SHA-256
3. Store the hash in the `jpay.user_api_keys` table
4. Return the plain key to the user (only shown once)

Example:

```typescript
import { createHash, randomBytes } from 'crypto';

const apiKey = randomBytes(32).toString('hex');
const keyHash = createHash('sha256').update(apiKey).digest('hex');

// Store keyHash in database
// Return apiKey to user
```
