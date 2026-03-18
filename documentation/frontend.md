# HMS Frontend

## Frontend Stack

- Next.js App Router
- React client components
- Tailwind CSS 4
- Radix UI primitives
- Lucide icons
- React Hook Form + Zod
- `react-hot-toast`

## UI Organization

### App routes

- `(auth)` for login
- `doctor`, `lab`, `pharmacy`, `receptionist` for role workspaces
- `api` for backend endpoints

### Feature modules

- `src/features/Login`
- `src/features/doctor`
- `src/features/laboratory`
- `src/features/pharmacy`
- `src/features/reception`
- `src/features/shared`

### Shared UI

- `src/components/ui/*` provides common controls like `Button`, `Input`, `Label`, `Card`

## Frontend Patterns

- Role dashboards are layout-driven and mostly client-rendered
- Cross-panel state relies on React context instead of a global state library
- Many operational forms are `react-hook-form` based
- Pharmacy POS is the most advanced current frontend workflow and includes keyboard shortcuts, cart state, and search integration

## Current Frontend Caveats

- The visual language differs between modules; pharmacy and receptionist are more polished than doctor and lab
- Some components still use older naming and structure patterns
- The docs should not claim a fully standardized design system yet
