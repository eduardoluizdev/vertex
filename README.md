<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</div>

<br />

# VertexHub

VertexHub is a modern, powerful platform designed for agencies and developers, providing tools to streamline business processes, manage proposals, handle integrations seamlessly, and deliver custom campaigns efficiently.

## 🚀 Key Features

*   **Multi-tenant Architecture**: Robust support for diverse client setups with dynamic custom domains via Easypanel.
*   **Proposals & Campaigns**: Create and manage highly-converting proposals with integrated payment tracking and real-time statuses.
*   **WhatsApp Integration**: Instant connection via QR code interface and automated message triggers with predefined templates for notifications.
*   **Payment Gateways**: Native integration with Asaas and AbacatePay for automated invoice management and smooth payment flows.
*   **Email Delivery**: Leverage Resend for reliable transactional email delivery and domain configuration.

## 🏗 Architecture

This project is structured as a monorepo using [Turborepo](https://turbo.build/repo), consisting of the following core components:

*   `apps/web`: The interactive frontend application built with Next.js 15, React 19, Tailwind CSS, and shadcn/ui.
*   `apps/api`: The performant backend application powered by NestJS, Prisma ORM, and PostgreSQL.
*   `packages/*`: Shared utilities and TypeScript configurations across the monorepo applications.

## 💻 Tech Stack

### Frontend (`apps/web`)
*   Next.js (App Router, Turbopack)
*   React 19
*   Tailwind CSS
*   shadcn/ui
*   React Hook Form + Zod
*   NextAuth.js

### Backend (`apps/api`)
*   NestJS
*   Prisma ORM
*   PostgreSQL
*   Class Validator & Class Transformer
*   JWT Authentication

## 🛠 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm
*   PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/vertexhub.git
    cd vertexhub
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Copy the sample environment file to `.env` and configure the essential database credentials and API keys.
    ```bash
    cp .env.example .env
    ```

4.  **Database Setup**
    Navigate to the `api` app or use workspace commands to generate the Prisma client and run initial migrations:
    ```bash
    npm run prisma:generate --workspace=@vertexhub/api
    npm run prisma:migrate --workspace=@vertexhub/api
    ```

5.  **Start the Development Server**
    Run the monorepo locally with Turborepo:
    ```bash
    npm run dev
    ```

    This command will concurrently spin up both the Next.js `web` server and NestJS `api` dependencies.

## 🧪 Testing

```bash
# General formatting and linting
npm run lint

# Run type checking across workspaces
npm run check-types

# Navigate to `apps/api` to run backend unit tests
cd apps/api
npm run test
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
