# Snack Management System

A comprehensive snack management system built with Next.js, TypeScript, Tailwind CSS, and Supabase. This MVP allows users to manage snacks, track sales, handle debts, and generate reports.

## Features

- **Snack Management**: Add, edit, and delete snacks with automatic profit margin calculation
- **People Management**: Manage coworkers and customers
- **Sales Tracking**: Record sales with payment status tracking
- **Debt Management**: Track and manage outstanding debts
- **Reports & Analytics**: Comprehensive financial reports and insights
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Instant feedback with toast notifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Custom components with Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toast notifications

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd snack_system
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the following database tables:

#### Snack Table
```sql
CREATE TABLE snack (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  profit_margin DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Person Table
```sql
CREATE TABLE person (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Sale Table
```sql
CREATE TABLE sale (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snack_id UUID REFERENCES snack(id) ON DELETE CASCADE,
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Debt Table
```sql
CREATE TABLE debt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sale(id) ON DELETE CASCADE,
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── snacks/            # Snack management page
│   ├── people/            # People management page
│   ├── sales/             # Sales management page
│   ├── debts/             # Debt management page
│   ├── reports/           # Reports and analytics page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   └── layout/           # Layout components
│       └── Navigation.tsx
├── lib/                  # Utility functions and API
│   ├── api.ts           # CRUD operations
│   └── supabase.ts      # Supabase client
└── types/               # TypeScript type definitions
    └── index.ts
```

## Usage

### Adding Snacks
1. Navigate to the Snacks page
2. Click "Add Snack"
3. Enter snack name, purchase price, and sale price
4. The system automatically calculates the profit margin

### Managing People
1. Go to the People page
2. Add coworkers or customers with their names and optional email

### Recording Sales
1. Visit the Sales page
2. Click "Record Sale"
3. Select a snack and person
4. Enter quantity and mark as paid/unpaid
5. Unpaid sales automatically create debt records

### Managing Debts
1. Check the Debts page for outstanding payments
2. Click "Mark as Paid" to update debt status
3. View both outstanding and paid debts

### Viewing Reports
1. Go to the Reports page for comprehensive analytics
2. View key metrics, top-selling snacks, and customer insights
3. Monitor profit margins and debt rates

## API Functions

The system includes comprehensive CRUD operations for all entities:

- `snackApi`: Create, read, update, delete snacks
- `personApi`: Manage people/customers
- `saleApi`: Record and manage sales
- `debtApi`: Handle debt tracking and payments
- `reportsApi`: Generate financial reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
