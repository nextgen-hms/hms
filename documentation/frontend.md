# 🎨 HMS Frontend Documentation

The HMS frontend is a modern, reactive interface built with **Next.js 15** and **Tailwind CSS 4**. It prioritizes a premium aesthetic and smooth user experience for clinical staff.

## 🛠️ Core Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla Tailwind CSS 4 with HSL variables
- **Forms**: React Hook Form + Zod
- **Notifications**: React Hot Toast

## 📂 Logical Structure

The frontend is split into **Pages** (in `src/app`) and **Feature Logic** (in `src/features`).

### 1. App Router (`src/app`)
- `(auth)/`: Login and registration routes.
- `dashboard/`: Main application shell with sidebar.
- `doctor/`, `pharmacy/`, `lab/`, `receptionist/`: Module-specific route handles.
- `api/`: Backend endpoints (though Server Actions are preferred for mutations).

### 2. Features (`src/features`)
Each feature folder contains:
- `components/`: UI specific to that feature (e.g., `PrescriptionCard`, `StockUpdater`).
- `hooks/`: Custom React hooks for data fetching (e.g., `usePatients`, `useMedicines`).
- `types/`: TypeScript interfaces and Zod schemas.
- `utils/`: Formatting and calculation helpers.

### 3. Shared Components (`src/components` & `src/features/shared`)
Generic UI elements like `Button`, `Input`, `Dialog`, and `DataTable`.

## 🔄 State Management

- **Server State**: Managed by Next.js. We use `revalidatePath` and `revalidateTag` to keep data fresh after mutations.
- **Global State**: Minimal use of React Context for `AuthContext` (User session) and `ThemeContext`.
- **Form State**: Fully managed by `react-hook-form` to ensure high performance and validation.

## 🌈 Styling Guidelines

- **Colors**: Use HSL variables (e.g., `--primary`, `--background`) to support easy theme switching and accessible contrast.
- **Glassmorphism**: Subtle backgrounds with `backdrop-blur` for a premium "Apple-like" feel.
- **Transitions**: Every interactive element should have a `transition-all` or `transition-colors` with a `duration-200`.

---

> [!TIP]
> Use the `DataTable` component from `src/features/shared` for all listings. It includes built-in pagination, sorting, and filtering logic.
