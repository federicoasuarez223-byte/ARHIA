-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."PlanTier" AS ENUM ('STARTER', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "tenant"."EmploymentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "tenant"."ContractType" AS ENUM ('INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL');

-- CreateEnum
CREATE TYPE "tenant"."ContractStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "tenant"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'REMOTE', 'HOLIDAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "tenant"."LeaveType" AS ENUM ('VACACIONES', 'ENFERMEDAD', 'LICENCIA_PERSONAL', 'LICENCIA_MATERNIDAD', 'LICENCIA_PATERNIDAD', 'ESTUDIO', 'DUELO');

-- CreateEnum
CREATE TYPE "tenant"."LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "tenant"."Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERO_NO_DECIR');

-- CreateEnum
CREATE TYPE "tenant"."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "tenant"."ChatMode" AS ENUM ('ASSISTANT', 'ANALYTICS', 'CONTRACTS', 'RECRUITMENT', 'PERFORMANCE', 'PAYROLL', 'CULTURE');

-- CreateEnum
CREATE TYPE "tenant"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "tenant"."AutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "tenant"."AutomationTrigger" AS ENUM ('SCHEDULE', 'EVENT', 'THRESHOLD', 'MANUAL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "tenant"."TrainingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "tenant"."RecruitmentStatus" AS ENUM ('OPEN', 'PAUSED', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "tenant"."CandidateStage" AS ENUM ('SOURCING', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "tenant"."RecognitionType" AS ENUM ('LOGRO', 'ANTIGUEDAD', 'COMPANERO', 'LIDERAZGO', 'INNOVACION', 'CLIENTE');

-- CreateEnum
CREATE TYPE "tenant"."PerformancePotential" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'STAR');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "industry" TEXT,
    "size" "public"."CompanySize" NOT NULL DEFAULT 'SMALL',
    "plan" "public"."PlanTier" NOT NULL DEFAULT 'STARTER',
    "planExpiresAt" TIMESTAMP(3),
    "tenantSchema" TEXT NOT NULL,
    "logoUrl" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "employeeId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."departments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "headcount" INTEGER NOT NULL DEFAULT 0,
    "budget" DECIMAL(15,2),
    "costCenter" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "managerId" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "departmentId" TEXT,
    "legajo" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dni" TEXT,
    "cuil" TEXT,
    "birthDate" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "position" TEXT NOT NULL,
    "seniority" TEXT,
    "employmentStatus" "tenant"."EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "contractType" "tenant"."ContractType" NOT NULL DEFAULT 'INDEFINIDO',
    "salary" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "cct" TEXT,
    "cctCategory" TEXT,
    "gender" "tenant"."Gender",
    "avatarUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "emergencyContact" JSONB,
    "bankAccount" JSONB,
    "documents" JSONB NOT NULL DEFAULT '{}',
    "vacationDays" INTEGER NOT NULL DEFAULT 14,
    "usedVacationDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."contracts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "tenant"."ContractType" NOT NULL,
    "status" "tenant"."ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "position" TEXT NOT NULL,
    "salary" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "cct" TEXT,
    "cctCategory" TEXT,
    "workingHours" INTEGER NOT NULL DEFAULT 48,
    "trialPeriod" INTEGER,
    "fileUrl" TEXT,
    "signedAt" TIMESTAMP(3),
    "signerName" TEXT,
    "notes" TEXT,
    "legalBasis" TEXT,
    "complianceData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."attendance_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "tenant"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "hoursWorked" DECIMAL(5,2),
    "overtime" DECIMAL(5,2),
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."leave_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "tenant"."LeaveType" NOT NULL,
    "status" "tenant"."LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."payroll_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "grossSalary" DECIMAL(15,2) NOT NULL,
    "jubilacion" DECIMAL(15,2) NOT NULL,
    "obraSocial" DECIMAL(15,2) NOT NULL,
    "anssal" DECIMAL(15,2) NOT NULL,
    "ley19032" DECIMAL(15,2) NOT NULL,
    "totalDeductions" DECIMAL(15,2) NOT NULL,
    "netSalary" DECIMAL(15,2) NOT NULL,
    "extras" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "processedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."payroll_anomalies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."performance_reviews" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ANNUAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "potential" "tenant"."PerformancePotential",
    "goals" JSONB NOT NULL DEFAULT '[]',
    "competencies" JSONB NOT NULL DEFAULT '{}',
    "strengths" TEXT[],
    "improvements" TEXT[],
    "developmentPlan" TEXT,
    "comments" TEXT,
    "employeeComments" TEXT,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."risk_scores" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "level" "tenant"."RiskLevel" NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "burnoutScore" INTEGER NOT NULL DEFAULT 0,
    "flightRiskScore" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "satisfactionScore" INTEGER NOT NULL DEFAULT 0,
    "factors" JSONB NOT NULL DEFAULT '[]',
    "trend" TEXT NOT NULL DEFAULT 'STABLE',
    "aiAnalysis" TEXT,
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."chat_threads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "title" TEXT,
    "mode" "tenant"."ChatMode" NOT NULL DEFAULT 'ASSISTANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."chat_messages" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "tenant"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."automation_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "tenant"."AutomationTrigger" NOT NULL,
    "triggerConfig" JSONB NOT NULL DEFAULT '{}',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "status" "tenant"."AutomationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."automation_executions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "triggeredBy" TEXT,
    "result" JSONB NOT NULL DEFAULT '{}',
    "errorMessage" TEXT,
    "duration" INTEGER,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."training_plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SKILL',
    "provider" TEXT,
    "skills" TEXT[],
    "duration" INTEGER,
    "durationUnit" TEXT NOT NULL DEFAULT 'HOURS',
    "cost" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."training_enrollments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "tenant"."TrainingStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "score" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."recruitment_searches" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT,
    "title" TEXT NOT NULL,
    "seniority" TEXT,
    "type" "tenant"."ContractType" NOT NULL DEFAULT 'INDEFINIDO',
    "status" "tenant"."RecruitmentStatus" NOT NULL DEFAULT 'OPEN',
    "salaryMin" DECIMAL(15,2),
    "salaryMax" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "competencies" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."candidates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "cvUrl" TEXT,
    "stage" "tenant"."CandidateStage" NOT NULL DEFAULT 'SOURCING',
    "score" INTEGER,
    "aiScore" INTEGER,
    "source" TEXT,
    "salary" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "notes" TEXT,
    "aiAnalysis" TEXT,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "interviews" JSONB NOT NULL DEFAULT '[]',
    "hiredAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."recognitions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "tenant"."RecognitionType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."integrations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."audit_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cuit_key" ON "public"."companies"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenantSchema_key" ON "public"."companies"("tenantSchema");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "public"."users"("companyId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "public"."sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "public"."sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "public"."sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "departments_companyId_idx" ON "tenant"."departments"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_companyId_code_key" ON "tenant"."departments"("companyId", "code");

-- CreateIndex
CREATE INDEX "employees_companyId_idx" ON "tenant"."employees"("companyId");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "tenant"."employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_employmentStatus_idx" ON "tenant"."employees"("employmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_email_key" ON "tenant"."employees"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_legajo_key" ON "tenant"."employees"("companyId", "legajo");

-- CreateIndex
CREATE INDEX "contracts_companyId_idx" ON "tenant"."contracts"("companyId");

-- CreateIndex
CREATE INDEX "contracts_employeeId_idx" ON "tenant"."contracts"("employeeId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "tenant"."contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_endDate_idx" ON "tenant"."contracts"("endDate");

-- CreateIndex
CREATE INDEX "attendance_records_companyId_idx" ON "tenant"."attendance_records"("companyId");

-- CreateIndex
CREATE INDEX "attendance_records_employeeId_idx" ON "tenant"."attendance_records"("employeeId");

-- CreateIndex
CREATE INDEX "attendance_records_date_idx" ON "tenant"."attendance_records"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_companyId_employeeId_date_key" ON "tenant"."attendance_records"("companyId", "employeeId", "date");

-- CreateIndex
CREATE INDEX "leave_requests_companyId_idx" ON "tenant"."leave_requests"("companyId");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_idx" ON "tenant"."leave_requests"("employeeId");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "tenant"."leave_requests"("status");

-- CreateIndex
CREATE INDEX "payroll_records_companyId_idx" ON "tenant"."payroll_records"("companyId");

-- CreateIndex
CREATE INDEX "payroll_records_employeeId_idx" ON "tenant"."payroll_records"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_records_periodYear_periodMonth_idx" ON "tenant"."payroll_records"("periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_records_companyId_employeeId_periodYear_periodMonth_key" ON "tenant"."payroll_records"("companyId", "employeeId", "periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "payroll_anomalies_companyId_idx" ON "tenant"."payroll_anomalies"("companyId");

-- CreateIndex
CREATE INDEX "payroll_anomalies_payrollRecordId_idx" ON "tenant"."payroll_anomalies"("payrollRecordId");

-- CreateIndex
CREATE INDEX "payroll_anomalies_resolved_idx" ON "tenant"."payroll_anomalies"("resolved");

-- CreateIndex
CREATE INDEX "performance_reviews_companyId_idx" ON "tenant"."performance_reviews"("companyId");

-- CreateIndex
CREATE INDEX "performance_reviews_employeeId_idx" ON "tenant"."performance_reviews"("employeeId");

-- CreateIndex
CREATE INDEX "performance_reviews_period_idx" ON "tenant"."performance_reviews"("period");

-- CreateIndex
CREATE INDEX "risk_scores_companyId_idx" ON "tenant"."risk_scores"("companyId");

-- CreateIndex
CREATE INDEX "risk_scores_employeeId_idx" ON "tenant"."risk_scores"("employeeId");

-- CreateIndex
CREATE INDEX "risk_scores_level_idx" ON "tenant"."risk_scores"("level");

-- CreateIndex
CREATE INDEX "risk_scores_calculatedAt_idx" ON "tenant"."risk_scores"("calculatedAt");

-- CreateIndex
CREATE INDEX "chat_threads_companyId_idx" ON "tenant"."chat_threads"("companyId");

-- CreateIndex
CREATE INDEX "chat_threads_userId_idx" ON "tenant"."chat_threads"("userId");

-- CreateIndex
CREATE INDEX "chat_threads_mode_idx" ON "tenant"."chat_threads"("mode");

-- CreateIndex
CREATE INDEX "chat_messages_threadId_idx" ON "tenant"."chat_messages"("threadId");

-- CreateIndex
CREATE INDEX "chat_messages_companyId_idx" ON "tenant"."chat_messages"("companyId");

-- CreateIndex
CREATE INDEX "automation_rules_companyId_idx" ON "tenant"."automation_rules"("companyId");

-- CreateIndex
CREATE INDEX "automation_rules_status_idx" ON "tenant"."automation_rules"("status");

-- CreateIndex
CREATE INDEX "automation_rules_trigger_idx" ON "tenant"."automation_rules"("trigger");

-- CreateIndex
CREATE INDEX "automation_executions_companyId_idx" ON "tenant"."automation_executions"("companyId");

-- CreateIndex
CREATE INDEX "automation_executions_automationId_idx" ON "tenant"."automation_executions"("automationId");

-- CreateIndex
CREATE INDEX "automation_executions_executedAt_idx" ON "tenant"."automation_executions"("executedAt");

-- CreateIndex
CREATE INDEX "training_plans_companyId_idx" ON "tenant"."training_plans"("companyId");

-- CreateIndex
CREATE INDEX "training_enrollments_companyId_idx" ON "tenant"."training_enrollments"("companyId");

-- CreateIndex
CREATE INDEX "training_enrollments_employeeId_idx" ON "tenant"."training_enrollments"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_companyId_employeeId_planId_key" ON "tenant"."training_enrollments"("companyId", "employeeId", "planId");

-- CreateIndex
CREATE INDEX "recruitment_searches_companyId_idx" ON "tenant"."recruitment_searches"("companyId");

-- CreateIndex
CREATE INDEX "recruitment_searches_status_idx" ON "tenant"."recruitment_searches"("status");

-- CreateIndex
CREATE INDEX "candidates_companyId_idx" ON "tenant"."candidates"("companyId");

-- CreateIndex
CREATE INDEX "candidates_searchId_idx" ON "tenant"."candidates"("searchId");

-- CreateIndex
CREATE INDEX "candidates_stage_idx" ON "tenant"."candidates"("stage");

-- CreateIndex
CREATE INDEX "recognitions_companyId_idx" ON "tenant"."recognitions"("companyId");

-- CreateIndex
CREATE INDEX "recognitions_recipientId_idx" ON "tenant"."recognitions"("recipientId");

-- CreateIndex
CREATE INDEX "recognitions_giverId_idx" ON "tenant"."recognitions"("giverId");

-- CreateIndex
CREATE INDEX "integrations_companyId_idx" ON "tenant"."integrations"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_companyId_slug_key" ON "tenant"."integrations"("companyId", "slug");

-- CreateIndex
CREATE INDEX "audit_logs_companyId_idx" ON "tenant"."audit_logs"("companyId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "tenant"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "tenant"."audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "tenant"."audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "tenant"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "tenant"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."contracts" ADD CONSTRAINT "contracts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."attendance_records" ADD CONSTRAINT "attendance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."payroll_records" ADD CONSTRAINT "payroll_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."payroll_anomalies" ADD CONSTRAINT "payroll_anomalies_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "tenant"."payroll_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."performance_reviews" ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "tenant"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."risk_scores" ADD CONSTRAINT "risk_scores_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."chat_messages" ADD CONSTRAINT "chat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "tenant"."chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."automation_executions" ADD CONSTRAINT "automation_executions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "tenant"."automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."training_enrollments" ADD CONSTRAINT "training_enrollments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."training_enrollments" ADD CONSTRAINT "training_enrollments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tenant"."training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."candidates" ADD CONSTRAINT "candidates_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "tenant"."recruitment_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."recognitions" ADD CONSTRAINT "recognitions_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "tenant"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."recognitions" ADD CONSTRAINT "recognitions_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "tenant"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."audit_logs" ADD CONSTRAINT "audit_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "tenant"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
