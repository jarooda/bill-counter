# Bill Counter

A Nuxt.js application for tracking and managing recurring bills with monthly payment calculations. Built with TypeScript, Supabase, and Vue 3.

## Features

- ✨ Add, edit, and delete bills
- 📊 Automatic monthly payment calculation
- 📅 Track bills across multiple years
- 💰 Monthly payment overview
- 🔒 Supabase integration for data persistence

## Database Setup

This application uses Supabase as the backend. You'll need to create two tables in your Supabase database:

### Bills Table Schema

```sql
CREATE TABLE bills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  desc TEXT,
  amount NUMERIC NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  count INTEGER NOT NULL,
  started_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
CREATE POLICY "Users can view their own bills"
  ON bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
  ON bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
  ON bills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
  ON bills FOR DELETE
  USING (auth.uid() = user_id);
```

### User Settings Table Schema

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_threshold BIGINT NOT NULL DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for bills (if not exists)
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Bills Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `user_id` | UUID | Reference to authenticated user |
| `name` | TEXT | Name of the bill (required) |
| `desc` | TEXT | Description of the bill (optional) |
| `amount` | NUMERIC | Total amount of the bill (required) |
| `monthly_amount` | NUMERIC | Calculated monthly payment amount |
| `count` | INTEGER | Number of months to pay the bill (required) |
| `started_at` | DATE | Start date for the bill payments (required) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

### User Settings Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to authenticated user (unique) |
| `monthly_threshold` | BIGINT | Monthly payment threshold for highlighting |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

**Note:** The `monthly_amount` is automatically calculated as `amount / count` and rounded to the nearest integer.

## Configuration

1. Create a new project on [Supabase](https://supabase.com)
2. Enable authentication (email/password or social providers)
3. Create the `bills` and `user_settings` tables using the SQL schemas provided above
4. Create a `.env` file in the root directory with your configuration:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `SUPABASE_KEY` | Your Supabase anonymous key | Yes | - |

**Note:** The `MONTHLY_THRESHOLD` environment variable has been removed. Each user can now set their own monthly threshold through the Settings menu in the app.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Tech Stack

- **Framework:** Nuxt 3
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** CSS
- **Package Manager:** pnpm

## Project Structure

```
app/
├── components/          # Vue components
│   ├── BillDetailModal.vue
│   ├── BillFormModal.vue
│   └── BillTable.vue
├── composables/         # Composable functions
│   └── useBills.ts     # Bills management logic
└── app.vue             # Main app component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
