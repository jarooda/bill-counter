# Bill Counter

A Nuxt.js application for tracking and managing recurring bills with monthly payment calculations. Built with TypeScript, Supabase, and Vue 3.

## Features

- ✨ Add, edit, and delete bills
- 📊 Automatic monthly payment calculation
- 📅 Track bills across multiple years
- 💰 Monthly payment overview
- 🔒 Supabase integration for data persistence

## Database Setup

This application uses Supabase as the backend. You'll need to create a `bills` table in your Supabase database with the following structure:

### Bills Table Schema

```sql
CREATE TABLE bills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  desc TEXT,
  amount NUMERIC NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  count INTEGER NOT NULL,
  started_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies as needed
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Simple policy to allow all operations (no authentication required)
CREATE POLICY "Allow all operations on bills" ON bills
  FOR ALL USING (true);
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `name` | TEXT | Name of the bill (required) |
| `desc` | TEXT | Description of the bill (optional) |
| `amount` | NUMERIC | Total amount of the bill (required) |
| `monthly_amount` | NUMERIC | Calculated monthly payment amount |
| `count` | INTEGER | Number of months to pay the bill (required) |
| `started_at` | DATE | Start date for the bill payments (required) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

**Note:** The `monthly_amount` is automatically calculated as `amount / count` and rounded to the nearest integer.

## Configuration

1. Create a new project on [Supabase](https://supabase.com)
2. Create the `bills` table using the SQL schema provided above
3. Create a `.env` file in the root directory with your configuration:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MONTHLY_THRESHOLD=your_monthly_threshold_amount
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `MONTHLY_THRESHOLD` | Monthly payment threshold amount | Yes |

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
