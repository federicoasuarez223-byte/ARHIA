import {
  PrismaClient,
  UserRole,
  PlanTier,
  CompanySize,
  EmploymentStatus,
  ContractType,
  ContractStatus,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  Gender,
  RiskLevel,
  ChatMode,
  MessageRole,
  AutomationStatus,
  AutomationTrigger,
  TrainingStatus,
  RecruitmentStatus,
  CandidateStage,
  RecognitionType,
  PerformancePotential,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Arhia2026!';

async function hashPassword(pw: string) {
  return bcrypt.hash(pw, HASH_ROUNDS);
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function d(iso: string) {
  return new Date(iso);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱  Seeding ARHIA — TechSur S.A. demo dataset...');

  // Ensure tenant schema exists (Prisma migrations create it, but just in case)
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS tenant`);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. COMPANY
  // ───────────────────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { cuit: '30-71234567-8' },
    update: {},
    create: {
      id: 'c1-techsur-00000000-0000-0000',
      name: 'TechSur S.A.',
      legalName: 'TechSur Soluciones Tecnológicas S.A.',
      cuit: '30-71234567-8',
      industry: 'Tecnología / Software B2B',
      size: CompanySize.MEDIUM,
      plan: PlanTier.BUSINESS,
      planExpiresAt: d('2027-01-01'),
      tenantSchema: 'tenant',
      phone: '+54 11 4567-8900',
      address: 'Av. Corrientes 1234, Piso 8, CABA',
      website: 'https://techsur.com.ar',
      isActive: true,
      settings: {
        cct: 'SECOP',
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        fiscalYear: 'CALENDAR',
        language: 'es-AR',
        eNPS: 34,
        climateScore: 64,
        masaSalarial: 19800000,
        headcount: 38,
      },
    },
  });
  console.log('  ✓ Company: TechSur S.A.');

  // ───────────────────────────────────────────────────────────────────────────
  // 2. USERS (system access — from settings prototype)
  // ───────────────────────────────────────────────────────────────────────────
  const pwHash = await hashPassword(DEFAULT_PASSWORD);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'mvidal@techsur.com' },
      update: {},
      create: {
        id: 'u1-marcos-vidal-000000000000',
        companyId: company.id,
        email: 'mvidal@techsur.com',
        passwordHash: pwHash,
        name: 'Marcos Vidal',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        lastLoginAt: d('2026-05-27T09:00:00Z'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'jvega@techsur.com' },
      update: {},
      create: {
        id: 'u2-jorge-vega-0000000000000',
        companyId: company.id,
        email: 'jvega@techsur.com',
        passwordHash: pwHash,
        name: 'Jorge Vega',
        role: UserRole.HR_MANAGER,
        isActive: true,
        lastLoginAt: d('2026-05-27T08:30:00Z'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'lmendez@techsur.com' },
      update: {},
      create: {
        id: 'u3-laura-mendez-00000000000',
        companyId: company.id,
        email: 'lmendez@techsur.com',
        passwordHash: pwHash,
        name: 'Laura Méndez',
        role: UserRole.MANAGER,
        isActive: true,
        lastLoginAt: d('2026-05-26T17:00:00Z'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'dmora@techsur.com' },
      update: {},
      create: {
        id: 'u4-diego-mora-000000000000',
        companyId: company.id,
        email: 'dmora@techsur.com',
        passwordHash: pwHash,
        name: 'Diego Mora',
        role: UserRole.MANAGER,
        isActive: true,
        lastLoginAt: d('2026-05-27T08:00:00Z'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'csoto@techsur.com' },
      update: {},
      create: {
        id: 'u5-claudia-soto-000000000',
        companyId: company.id,
        email: 'csoto@techsur.com',
        passwordHash: pwHash,
        name: 'Claudia Soto',
        role: UserRole.MANAGER,
        isActive: true,
        lastLoginAt: d('2026-05-27T09:15:00Z'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'ipaz@techsur.com' },
      update: {},
      create: {
        id: 'u6-ignacio-paz-000000000000',
        companyId: company.id,
        email: 'ipaz@techsur.com',
        passwordHash: pwHash,
        name: 'Ignacio Paz',
        role: UserRole.MANAGER,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ctorres@techsur.com' },
      update: {},
      create: {
        id: 'u7-camila-torres-00000000',
        companyId: company.id,
        email: 'ctorres@techsur.com',
        passwordHash: pwHash,
        name: 'Camila Torres',
        role: UserRole.MANAGER,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'vmunoz@techsur.com' },
      update: {},
      create: {
        id: 'u8-valentina-munoz-0000000',
        companyId: company.id,
        email: 'vmunoz@techsur.com',
        passwordHash: pwHash,
        name: 'Valentina Muñoz',
        role: UserRole.EMPLOYEE,
        isActive: true,
      },
    }),
  ]);
  console.log('  ✓ Users: 8 creados');

  // ───────────────────────────────────────────────────────────────────────────
  // 3. DEPARTMENTS (with placeholder managerId — updated after employees)
  // ───────────────────────────────────────────────────────────────────────────
  const depts = {
    tecnologia: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'TEC' } },
      update: {},
      create: {
        id: 'd1-tecnologia-000000000000',
        companyId: company.id,
        name: 'Tecnología',
        code: 'TEC',
        description: 'Desarrollo de producto y plataforma',
        headcount: 12,
        budget: 8500000,
        costCenter: 'CC-001',
      },
    }),
    ventas: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'VEN' } },
      update: {},
      create: {
        id: 'd2-ventas-0000000000000000',
        companyId: company.id,
        name: 'Ventas',
        code: 'VEN',
        description: 'Ventas y desarrollo de negocio',
        headcount: 6,
        budget: 2100000,
        costCenter: 'CC-002',
      },
    }),
    rrhh: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'RRH' } },
      update: {},
      create: {
        id: 'd3-rrhh-00000000000000000',
        companyId: company.id,
        name: 'RRHH',
        code: 'RRH',
        description: 'Recursos Humanos',
        headcount: 2,
        budget: 650000,
        costCenter: 'CC-003',
      },
    }),
    finanzas: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'FIN' } },
      update: {},
      create: {
        id: 'd4-finanzas-0000000000000',
        companyId: company.id,
        name: 'Finanzas',
        code: 'FIN',
        description: 'Finanzas y administración',
        headcount: 3,
        budget: 980000,
        costCenter: 'CC-004',
      },
    }),
    operaciones: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'OPE' } },
      update: {},
      create: {
        id: 'd5-operaciones-000000000',
        companyId: company.id,
        name: 'Operaciones',
        code: 'OPE',
        description: 'Operaciones e infraestructura',
        headcount: 2,
        budget: 730000,
        costCenter: 'CC-005',
      },
    }),
    marketing: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'MKT' } },
      update: {},
      create: {
        id: 'd6-marketing-00000000000',
        companyId: company.id,
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing y comunicaciones',
        headcount: 2,
        budget: 560000,
        costCenter: 'CC-006',
      },
    }),
    direccion: await prisma.department.upsert({
      where: { companyId_code: { companyId: company.id, code: 'DIR' } },
      update: {},
      create: {
        id: 'd7-direccion-00000000000',
        companyId: company.id,
        name: 'Dirección',
        code: 'DIR',
        description: 'Dirección General',
        headcount: 1,
        costCenter: 'CC-007',
      },
    }),
  };
  console.log('  ✓ Departamentos: 7 creados');

  // ───────────────────────────────────────────────────────────────────────────
  // 4. EMPLOYEES — datos completos del prototipo
  // ───────────────────────────────────────────────────────────────────────────
  const empDefs = [
    // ── Dirección ────────────────────────────────────────────────────────────
    {
      id: 'e00-gustavo-reyes-000000000',
      legajo: 'TS-001',
      firstName: 'Gustavo',
      lastName: 'Reyes',
      email: 'greyes@techsur.com',
      position: 'CEO',
      seniority: 'Executive',
      departmentId: depts.direccion.id,
      hireDate: d('2018-03-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 620000,
      vacationDays: 21,
      usedVacationDays: 5,
      gender: Gender.MASCULINO,
      cctCategory: 'Fuera de convenio',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── Tecnología ───────────────────────────────────────────────────────────
    {
      id: 'e01-diego-mora-0000000000',
      legajo: 'TS-012',
      firstName: 'Diego',
      lastName: 'Mora',
      email: 'dmora@techsur.com',
      position: 'Tech Lead',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2020-06-15'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 350000,
      vacationDays: 21,
      usedVacationDays: 3,
      gender: Gender.MASCULINO,
      cctCategory: 'B3',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e02-carlos-ibanez-00000000',
      legajo: 'TS-015',
      firstName: 'Carlos',
      lastName: 'Ibáñez',
      email: 'cibanez@techsur.com',
      position: 'Dev Senior',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2021-03-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 260000,
      vacationDays: 21,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: false },
    },
    {
      id: 'e03-martin-sosa-000000000',
      legajo: 'TS-031',
      firstName: 'Martín',
      lastName: 'Sosa',
      email: 'msosa@techsur.com',
      position: 'Dev Junior',
      seniority: 'Junior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2023-11-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 165000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'A2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e04-pablo-herrera-00000000',
      legajo: 'TS-018',
      firstName: 'Pablo',
      lastName: 'Herrera',
      email: 'pherrera@techsur.com',
      position: 'Dev Senior Backend',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2021-08-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 275000,
      vacationDays: 21,
      usedVacationDays: 7,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e05-florencia-paz-00000000',
      legajo: 'TS-022',
      firstName: 'Florencia',
      lastName: 'Paz',
      email: 'fpaz@techsur.com',
      position: 'Diseñadora UX/UI',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2022-02-14'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 240000,
      vacationDays: 21,
      usedVacationDays: 14,
      gender: Gender.FEMENINO,
      cctCategory: 'B1',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e06-rodrigo-villar-0000000',
      legajo: 'TS-019',
      firstName: 'Rodrigo',
      lastName: 'Villar',
      email: 'rvillar@techsur.com',
      position: 'DevOps Engineer',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2021-06-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 280000,
      vacationDays: 21,
      usedVacationDays: 5,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e07-tomas-vera-000000000',
      legajo: 'TS-028',
      firstName: 'Tomás',
      lastName: 'Vera',
      email: 'tvera@techsur.com',
      position: 'Dev Frontend',
      seniority: 'Semi-Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2023-01-15'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 210000,
      vacationDays: 14,
      usedVacationDays: 7,
      gender: Gender.MASCULINO,
      cctCategory: 'B1',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e08-lucia-fernandez-000000',
      legajo: 'TS-025',
      firstName: 'Lucía',
      lastName: 'Fernández',
      email: 'lfernandez@techsur.com',
      position: 'Product Manager',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2022-07-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 310000,
      vacationDays: 21,
      usedVacationDays: 0,
      gender: Gender.FEMENINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e09-sebastian-ruiz-000000',
      legajo: 'TS-033',
      firstName: 'Sebastián',
      lastName: 'Ruiz',
      email: 'sruiz@techsur.com',
      position: 'Dev Backend',
      seniority: 'Semi-Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2024-02-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 195000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'A3',
      documents: { contrato: true, recibos: false, constancias: false },
    },
    // ── Ventas ───────────────────────────────────────────────────────────────
    {
      id: 'e10-laura-mendez-00000000',
      legajo: 'TS-008',
      firstName: 'Laura',
      lastName: 'Méndez',
      email: 'lmendez@techsur.com',
      position: 'Gerenta de Ventas',
      seniority: 'Senior',
      departmentId: depts.ventas.id,
      hireDate: d('2019-05-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 285000,
      vacationDays: 21,
      usedVacationDays: 0,
      gender: Gender.FEMENINO,
      cctCategory: 'C3',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e11-valeria-cruz-00000000',
      legajo: 'TS-021',
      firstName: 'Valeria',
      lastName: 'Cruz',
      email: 'vcruz@techsur.com',
      position: 'Ejecutiva de Ventas',
      seniority: 'Semi-Senior',
      departmentId: depts.ventas.id,
      hireDate: d('2022-01-10'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 195000,
      vacationDays: 21,
      usedVacationDays: 8,
      gender: Gender.FEMENINO,
      cctCategory: 'B1',
      documents: { contrato: true, recibos: true, constancias: false },
    },
    {
      id: 'e12-natalia-gomez-0000000',
      legajo: 'TS-029',
      firstName: 'Natalia',
      lastName: 'Gómez',
      email: 'ngomez@techsur.com',
      position: 'Ejecutiva de Cuentas',
      seniority: 'Junior',
      departmentId: depts.ventas.id,
      hireDate: d('2023-08-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 165000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.FEMENINO,
      cctCategory: 'A3',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── RRHH ─────────────────────────────────────────────────────────────────
    {
      id: 'e13-jorge-vega-000000000',
      legajo: 'TS-006',
      firstName: 'Jorge',
      lastName: 'Vega',
      email: 'jvega@techsur.com',
      position: 'Jefe de RRHH',
      seniority: 'Senior',
      departmentId: depts.rrhh.id,
      hireDate: d('2019-09-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 245000,
      vacationDays: 21,
      usedVacationDays: 10,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e14-ana-rios-000000000000',
      legajo: 'TS-027',
      firstName: 'Ana',
      lastName: 'Ríos',
      email: 'arios@techsur.com',
      position: 'Analista de RRHH',
      seniority: 'Semi-Senior',
      departmentId: depts.rrhh.id,
      hireDate: d('2022-11-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 210000,
      vacationDays: 21,
      usedVacationDays: 5,
      gender: Gender.FEMENINO,
      cctCategory: 'B1',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── Finanzas ─────────────────────────────────────────────────────────────
    {
      id: 'e15-claudia-soto-00000000',
      legajo: 'TS-009',
      firstName: 'Claudia',
      lastName: 'Soto',
      email: 'csoto@techsur.com',
      position: 'Gerenta de Finanzas',
      seniority: 'Senior',
      departmentId: depts.finanzas.id,
      hireDate: d('2019-11-15'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 320000,
      vacationDays: 21,
      usedVacationDays: 7,
      gender: Gender.FEMENINO,
      cctCategory: 'C2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e16-federico-alvarez-000',
      legajo: 'TS-026',
      firstName: 'Federico',
      lastName: 'Álvarez',
      email: 'falvarez@techsur.com',
      position: 'Analista Contable',
      seniority: 'Semi-Senior',
      departmentId: depts.finanzas.id,
      hireDate: d('2022-04-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 220000,
      vacationDays: 21,
      usedVacationDays: 14,
      gender: Gender.MASCULINO,
      cctCategory: 'B1',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── Operaciones ──────────────────────────────────────────────────────────
    {
      id: 'e17-ignacio-paz-000000000',
      legajo: 'TS-011',
      firstName: 'Ignacio',
      lastName: 'Paz',
      email: 'ipaz@techsur.com',
      position: 'Jefe de Operaciones',
      seniority: 'Senior',
      departmentId: depts.operaciones.id,
      hireDate: d('2020-03-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 290000,
      vacationDays: 21,
      usedVacationDays: 3,
      gender: Gender.MASCULINO,
      cctCategory: 'B3',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── Marketing ────────────────────────────────────────────────────────────
    {
      id: 'e18-carmen-lopez-00000000',
      legajo: 'TS-014',
      firstName: 'Carmen',
      lastName: 'López',
      email: 'clopez@techsur.com',
      position: 'Gerenta de Marketing',
      seniority: 'Senior',
      departmentId: depts.marketing.id,
      hireDate: d('2020-10-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 270000,
      vacationDays: 21,
      usedVacationDays: 0,
      gender: Gender.FEMENINO,
      cctCategory: 'B2',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e19-camila-torres-0000000',
      legajo: 'TS-024',
      firstName: 'Camila',
      lastName: 'Torres',
      email: 'ctorres@techsur.com',
      position: 'Analista de Marketing Digital',
      seniority: 'Junior',
      departmentId: depts.marketing.id,
      hireDate: d('2022-09-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 175000,
      vacationDays: 14,
      usedVacationDays: 7,
      gender: Gender.FEMENINO,
      cctCategory: 'A3',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    // ── Contratos plazo fijo (Tecnología/Finanzas/Marketing) ─────────────────
    {
      id: 'e20-javier-lopez-00000000',
      legajo: 'TS-036',
      firstName: 'Javier',
      lastName: 'López',
      email: 'jlopez@techsur.com',
      position: 'Dev Junior',
      seniority: 'Junior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2025-11-29'),
      contractType: ContractType.PLAZO_FIJO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 150000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'A1',
      documents: { contrato: true, recibos: true, constancias: false },
    },
    {
      id: 'e21-martina-gomez-0000000',
      legajo: 'TS-037',
      firstName: 'Martina',
      lastName: 'Gómez',
      email: 'mgomez@techsur.com',
      position: 'Analista de Marketing',
      seniority: 'Junior',
      departmentId: depts.marketing.id,
      hireDate: d('2026-02-01'),
      contractType: ContractType.PLAZO_FIJO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 155000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.FEMENINO,
      cctCategory: 'A1',
      documents: { contrato: true, recibos: true, constancias: true },
    },
    {
      id: 'e22-pablo-castro-0000000',
      legajo: 'TS-038',
      firstName: 'Pablo',
      lastName: 'Castro',
      email: 'pcastro@techsur.com',
      position: 'Analista de Finanzas',
      seniority: 'Junior',
      departmentId: depts.finanzas.id,
      hireDate: d('2026-01-15'),
      contractType: ContractType.PLAZO_FIJO,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 145000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'A1',
      documents: { contrato: true, recibos: false, constancias: false },
    },
    // ── Onboarding / Nuevos ──────────────────────────────────────────────────
    {
      id: 'e23-alejandro-ponce-000000',
      legajo: 'TS-039',
      firstName: 'Alejandro',
      lastName: 'Ponce',
      email: 'aponce@techsur.com',
      position: 'Dev Senior React',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2026-06-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.INACTIVE,
      salary: 290000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: false, recibos: false, constancias: false },
      notes: 'Onboarding en curso — inicio 01/06/2026',
    },
    {
      id: 'e24-rodrigo-alvarez-000000',
      legajo: 'TS-040',
      firstName: 'Rodrigo',
      lastName: 'Álvarez',
      email: 'ralvarez@techsur.com',
      position: 'Dev Senior React',
      seniority: 'Senior',
      departmentId: depts.tecnologia.id,
      hireDate: d('2026-07-01'),
      contractType: ContractType.INDEFINIDO,
      employmentStatus: EmploymentStatus.INACTIVE,
      salary: 285000,
      vacationDays: 14,
      usedVacationDays: 0,
      gender: Gender.MASCULINO,
      cctCategory: 'B2',
      documents: { contrato: false, recibos: false, constancias: false },
      notes: 'Contrato en borrador — pendiente de firma',
    },
  ] as const;

  const employees: Record<string, { id: string }> = {};
  for (const def of empDefs) {
    const emp = await prisma.employee.upsert({
      where: { companyId_email: { companyId: company.id, email: def.email } },
      update: {},
      create: {
        ...def,
        companyId: company.id,
        city: 'Buenos Aires',
        province: 'CABA',
        cct: 'SECOP',
        currency: 'ARS',
      },
    });
    employees[def.id] = emp;
  }
  console.log(`  ✓ Empleados: ${empDefs.length} creados`);

  // Update department managers
  await Promise.all([
    prisma.department.update({
      where: { id: depts.tecnologia.id },
      data: { managerId: employees['e01-diego-mora-0000000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.ventas.id },
      data: { managerId: employees['e10-laura-mendez-00000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.rrhh.id },
      data: { managerId: employees['e13-jorge-vega-000000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.finanzas.id },
      data: { managerId: employees['e15-claudia-soto-00000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.operaciones.id },
      data: { managerId: employees['e17-ignacio-paz-000000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.marketing.id },
      data: { managerId: employees['e18-carmen-lopez-00000000'].id },
    }),
    prisma.department.update({
      where: { id: depts.direccion.id },
      data: { managerId: employees['e00-gustavo-reyes-000000000'].id },
    }),
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CONTRACTS
  // ───────────────────────────────────────────────────────────────────────────
  const contractDefs = [
    {
      id: 'ct01-laura-mendez-indefinido',
      employeeId: employees['e10-laura-mendez-00000000'].id,
      type: ContractType.INDEFINIDO,
      status: ContractStatus.ACTIVE,
      startDate: d('2019-05-01'),
      position: 'Gerenta de Ventas',
      salary: 285000,
      cctCategory: 'C3',
      workingHours: 48,
      signedAt: d('2019-04-28'),
      signerName: 'Laura Méndez',
      legalBasis: 'Art. 90 LCT N°20.744',
    },
    {
      id: 'ct02-diego-mora-indefinido',
      employeeId: employees['e01-diego-mora-0000000000'].id,
      type: ContractType.INDEFINIDO,
      status: ContractStatus.ACTIVE,
      startDate: d('2020-06-15'),
      position: 'Tech Lead',
      salary: 350000,
      cctCategory: 'B3',
      workingHours: 48,
      signedAt: d('2020-06-12'),
      signerName: 'Diego Mora',
      legalBasis: 'Art. 90 LCT N°20.744',
    },
    {
      id: 'ct03-carlos-ibanez-indefinido',
      employeeId: employees['e02-carlos-ibanez-00000000'].id,
      type: ContractType.INDEFINIDO,
      status: ContractStatus.ACTIVE,
      startDate: d('2021-03-01'),
      position: 'Dev Senior',
      salary: 260000,
      cctCategory: 'B2',
      workingHours: 48,
      signedAt: d('2021-02-26'),
      signerName: 'Carlos Ibáñez',
      legalBasis: 'Art. 90 LCT N°20.744',
    },
    {
      id: 'ct04-javier-lopez-plazofijo',
      employeeId: employees['e20-javier-lopez-00000000'].id,
      type: ContractType.PLAZO_FIJO,
      status: ContractStatus.ACTIVE,
      startDate: d('2025-11-29'),
      endDate: d('2026-05-29'),
      position: 'Dev Junior',
      salary: 150000,
      cctCategory: 'A1',
      workingHours: 48,
      trialPeriod: 90,
      signedAt: d('2025-11-25'),
      signerName: 'Javier López',
      legalBasis: 'Art. 93 LCT N°20.744',
      notes: '⚠️ Vence en 2 días — evaluar renovación o indemnización Art. 250 LCT',
      complianceData: {
        preaviso: { dias: 15, vence: '2026-05-14', notificado: false },
        articulo250: { aplica: true, monto: 37500 },
      },
    },
    {
      id: 'ct05-martina-gomez-plazofijo',
      employeeId: employees['e21-martina-gomez-0000000'].id,
      type: ContractType.PLAZO_FIJO,
      status: ContractStatus.ACTIVE,
      startDate: d('2026-02-01'),
      endDate: d('2026-07-31'),
      position: 'Analista de Marketing',
      salary: 155000,
      cctCategory: 'A1',
      workingHours: 48,
      signedAt: d('2026-01-28'),
      signerName: 'Martina Gómez',
      legalBasis: 'Art. 93 LCT N°20.744',
    },
    {
      id: 'ct06-pablo-castro-plazofijo',
      employeeId: employees['e22-pablo-castro-0000000'].id,
      type: ContractType.PLAZO_FIJO,
      status: ContractStatus.ACTIVE,
      startDate: d('2026-01-15'),
      endDate: d('2026-06-30'),
      position: 'Analista de Finanzas',
      salary: 145000,
      cctCategory: 'A1',
      workingHours: 48,
      signedAt: d('2026-01-12'),
      signerName: 'Pablo Castro',
      legalBasis: 'Art. 93 LCT N°20.744',
    },
    {
      id: 'ct07-alejandro-ponce-pending',
      employeeId: employees['e23-alejandro-ponce-000000'].id,
      type: ContractType.INDEFINIDO,
      status: ContractStatus.PENDING_SIGNATURE,
      startDate: d('2026-06-01'),
      position: 'Dev Senior React',
      salary: 290000,
      cctCategory: 'B2',
      workingHours: 48,
      legalBasis: 'Art. 90 LCT N°20.744',
      notes: 'Enviado por DocuSign — pendiente firma del empleado',
    },
    {
      id: 'ct08-rodrigo-alvarez-draft',
      employeeId: employees['e24-rodrigo-alvarez-000000'].id,
      type: ContractType.INDEFINIDO,
      status: ContractStatus.DRAFT,
      startDate: d('2026-07-01'),
      position: 'Dev Senior React',
      salary: 285000,
      cctCategory: 'B2',
      workingHours: 48,
      legalBasis: 'Art. 90 LCT N°20.744',
      notes: 'Borrador — pendiente revisión RRHH',
    },
  ];

  for (const ct of contractDefs) {
    await prisma.contract.upsert({
      where: { id: ct.id },
      update: {},
      create: {
        ...ct,
        companyId: company.id,
        cct: 'SECOP',
        currency: 'ARS',
        complianceData: (ct as { complianceData?: Record<string, unknown> }).complianceData ?? {},
      },
    });
  }
  console.log('  ✓ Contratos: 8 creados');

  // ───────────────────────────────────────────────────────────────────────────
  // 6. RISK SCORES — empleados críticos y de riesgo
  // ───────────────────────────────────────────────────────────────────────────
  const riskDefs = [
    {
      employeeId: employees['e10-laura-mendez-00000000'].id,
      level: RiskLevel.CRITICAL,
      overallScore: 87,
      burnoutScore: 91,
      flightRiskScore: 82,
      engagementScore: 35,
      satisfactionScore: 28,
      trend: 'RISING',
      factors: ['sobrecarga_horaria', 'falta_reconocimiento', 'conflicto_equipo'],
      aiAnalysis:
        'Laura muestra señales críticas de burnout. Lleva 3 semanas con horas extra superiores al 40%. Engagement cayó 15 puntos en el último mes. Riesgo de renuncia muy alto.',
      recommendations: [
        { accion: 'Reunión urgente 1:1 con su manager', prioridad: 'ALTA', plazo: '48hs' },
        {
          accion: 'Redistribuir carga de trabajo del equipo de ventas',
          prioridad: 'ALTA',
          plazo: '1 semana',
        },
        {
          accion: 'Evaluar aumento salarial — actualmente 12% por debajo del mercado',
          prioridad: 'MEDIA',
          plazo: '2 semanas',
        },
      ],
    },
    {
      employeeId: employees['e02-carlos-ibanez-00000000'].id,
      level: RiskLevel.HIGH,
      overallScore: 72,
      burnoutScore: 68,
      flightRiskScore: 75,
      engagementScore: 45,
      satisfactionScore: 42,
      trend: 'RISING',
      factors: ['falta_desarrollo', 'salario_mercado', 'absentismo_leve'],
      aiAnalysis:
        'Carlos muestra señales de estancamiento profesional. No ha recibido aumento en 18 meses y su salario está 15% por debajo del mercado para Dev Senior.',
      recommendations: [
        { accion: 'Plan de carrera y promoción a Tech Lead', prioridad: 'ALTA', plazo: '1 mes' },
        { accion: 'Ajuste salarial a mercado', prioridad: 'ALTA', plazo: '2 semanas' },
      ],
    },
    {
      employeeId: employees['e11-valeria-cruz-00000000'].id,
      level: RiskLevel.HIGH,
      overallScore: 76,
      burnoutScore: 72,
      flightRiskScore: 70,
      engagementScore: 40,
      satisfactionScore: 38,
      trend: 'STABLE',
      factors: ['absentismo_alto', 'baja_productividad', 'conflicto_equipo'],
      aiAnalysis:
        'Valeria registró 8 ausencias en los últimos 90 días. Patrón de lunes/viernes. Bajo rendimiento en cuota de ventas (58% del objetivo).',
      recommendations: [
        { accion: 'Entrevista de permanencia', prioridad: 'ALTA', plazo: '1 semana' },
        { accion: 'Revisión del plan de comisiones', prioridad: 'MEDIA', plazo: '2 semanas' },
      ],
    },
    {
      employeeId: employees['e14-ana-rios-000000000000'].id,
      level: RiskLevel.HIGH,
      overallScore: 69,
      burnoutScore: 65,
      flightRiskScore: 72,
      engagementScore: 48,
      satisfactionScore: 44,
      trend: 'RISING',
      factors: ['sobrecarga_laboral', 'falta_reconocimiento'],
      aiAnalysis:
        'Ana gestiona sola múltiples procesos de RRHH con poco apoyo. Engagement bajando consistentemente.',
      recommendations: [
        { accion: 'Contratar asistente de RRHH', prioridad: 'MEDIA', plazo: '1 mes' },
        {
          accion: 'Capacitación en automatización de procesos',
          prioridad: 'BAJA',
          plazo: '2 meses',
        },
      ],
    },
    {
      employeeId: employees['e03-martin-sosa-000000000'].id,
      level: RiskLevel.MEDIUM,
      overallScore: 45,
      burnoutScore: 40,
      flightRiskScore: 48,
      engagementScore: 65,
      satisfactionScore: 62,
      trend: 'STABLE',
      factors: ['falta_desarrollo', 'salario_mercado'],
      aiAnalysis:
        'Martín está en una meseta de aprendizaje. Sin plan de crecimiento claro podría buscar oportunidades externas en 6-12 meses.',
      recommendations: [
        { accion: 'Asignar mentor técnico', prioridad: 'MEDIA', plazo: '2 semanas' },
        { accion: 'Plan de capacitación React/Node', prioridad: 'MEDIA', plazo: '1 mes' },
      ],
    },
    {
      employeeId: employees['e12-natalia-gomez-0000000'].id,
      level: RiskLevel.MEDIUM,
      overallScore: 55,
      burnoutScore: 50,
      flightRiskScore: 58,
      engagementScore: 60,
      satisfactionScore: 55,
      trend: 'STABLE',
      factors: ['cuota_ventas_baja', 'falta_capacitacion'],
      aiAnalysis: 'Natalia tiene potencial pero necesita más acompañamiento en cierre de deals.',
      recommendations: [
        {
          accion: 'Capacitación en técnicas de venta consultiva',
          prioridad: 'MEDIA',
          plazo: '1 mes',
        },
      ],
    },
  ];

  for (const r of riskDefs) {
    await prisma.riskScore.create({
      data: {
        ...r,
        companyId: company.id,
        factors: r.factors,
        recommendations: r.recommendations,
        calculatedAt: new Date(),
      },
    });
  }
  console.log('  ✓ Risk scores: 6 calculados');

  // ───────────────────────────────────────────────────────────────────────────
  // 7. PAYROLL RECORDS — Mayo 2026
  // ───────────────────────────────────────────────────────────────────────────
  const payrollDefs = [
    {
      eid: 'e10-laura-mendez-00000000',
      gross: 285000,
      extras: [{ tipo: 'Horas extra', monto: 38000, descripcion: '76hs extras — anómalo (+142%)' }],
    },
    { eid: 'e01-diego-mora-0000000000', gross: 350000, extras: [] },
    {
      eid: 'e04-pablo-herrera-00000000',
      gross: 275000,
      extras: [{ tipo: 'Comisión', monto: 45000, descripcion: 'Comisión proyecto cliente' }],
    },
    { eid: 'e02-carlos-ibanez-00000000', gross: 260000, extras: [] },
    {
      eid: 'e11-valeria-cruz-00000000',
      gross: 195000,
      extras: [{ tipo: 'Comisión', monto: 28000, descripcion: 'Comisión ventas' }],
    },
    { eid: 'e05-florencia-paz-00000000', gross: 240000, extras: [] },
    { eid: 'e06-rodrigo-villar-0000000', gross: 280000, extras: [] },
    { eid: 'e18-carmen-lopez-00000000', gross: 270000, extras: [] },
    { eid: 'e03-martin-sosa-000000000', gross: 165000, extras: [] },
    { eid: 'e14-ana-rios-000000000000', gross: 210000, extras: [] },
  ];

  // Argentine payroll deductions (SECOP employee contribution rates)
  // Jubilación: 11%, Obra Social: 3%, ANSSAL: 0.5%, Ley 19032: 3%
  const calcDeductions = (gross: number) => {
    const jubilacion = Math.round(gross * 0.11);
    const obraSocial = Math.round(gross * 0.03);
    const anssal = Math.round(gross * 0.005);
    const ley19032 = Math.round(gross * 0.03);
    return {
      jubilacion,
      obraSocial,
      anssal,
      ley19032,
      total: jubilacion + obraSocial + anssal + ley19032,
    };
  };

  for (const p of payrollDefs) {
    const ded = calcDeductions(p.gross);
    const net = p.gross - ded.total;
    await prisma.payrollRecord.upsert({
      where: {
        companyId_employeeId_periodYear_periodMonth: {
          companyId: company.id,
          employeeId: employees[p.eid].id,
          periodYear: 2026,
          periodMonth: 5,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        employeeId: employees[p.eid].id,
        period: '2026-05',
        periodYear: 2026,
        periodMonth: 5,
        grossSalary: p.gross,
        jubilacion: ded.jubilacion,
        obraSocial: ded.obraSocial,
        anssal: ded.anssal,
        ley19032: ded.ley19032,
        totalDeductions: ded.total,
        netSalary: net,
        extras: p.extras,
        status: 'PROCESSED',
        processedAt: d('2026-05-25T10:00:00Z'),
        currency: 'ARS',
      },
    });
  }
  console.log('  ✓ Liquidaciones: 10 procesadas (Mayo 2026)');

  // Payroll anomalies
  const lauraPay = await prisma.payrollRecord.findFirst({
    where: {
      companyId: company.id,
      employeeId: employees['e10-laura-mendez-00000000'].id,
      periodYear: 2026,
      periodMonth: 5,
    },
  });
  if (lauraPay) {
    await prisma.payrollAnomaly.create({
      data: {
        companyId: company.id,
        payrollRecordId: lauraPay.id,
        type: 'HORAS_EXTRA_EXCESIVAS',
        severity: 'CRITICAL',
        description:
          'Laura Méndez registró 76 horas extra en mayo (+142% del límite legal). Riesgo de infracción LCT Art. 201.',
        amount: 38000,
        resolved: false,
      },
    });
  }

  const pabloHPay = await prisma.payrollRecord.findFirst({
    where: {
      companyId: company.id,
      employeeId: employees['e04-pablo-herrera-00000000'].id,
      periodYear: 2026,
      periodMonth: 5,
    },
  });
  if (pabloHPay) {
    await prisma.payrollAnomaly.create({
      data: {
        companyId: company.id,
        payrollRecordId: pabloHPay.id,
        type: 'COMISION_FUERA_RANGO',
        severity: 'HIGH',
        description:
          'Comisión de Pablo Herrera (ARS 45.000) supera el 25% del salario base — requiere validación gerencial.',
        amount: 45000,
        resolved: false,
      },
    });
  }
  console.log('  ✓ Anomalías de liquidación: 2 detectadas');

  // ───────────────────────────────────────────────────────────────────────────
  // 8. PERFORMANCE REVIEWS — 2026
  // ───────────────────────────────────────────────────────────────────────────
  const perfDefs = [
    {
      eid: 'e00-gustavo-reyes-000000000',
      score: 94,
      potential: PerformancePotential.STAR,
      status: 'COMPLETED',
    },
    {
      eid: 'e01-diego-mora-0000000000',
      score: 91,
      potential: PerformancePotential.STAR,
      status: 'COMPLETED',
    },
    {
      eid: 'e04-pablo-herrera-00000000',
      score: 84,
      potential: PerformancePotential.HIGH,
      status: 'COMPLETED',
    },
    {
      eid: 'e05-florencia-paz-00000000',
      score: 88,
      potential: PerformancePotential.HIGH,
      status: 'COMPLETED',
    },
    {
      eid: 'e06-rodrigo-villar-0000000',
      score: 82,
      potential: PerformancePotential.HIGH,
      status: 'COMPLETED',
    },
    {
      eid: 'e14-ana-rios-000000000000',
      score: 78,
      potential: PerformancePotential.MEDIUM,
      status: 'COMPLETED',
    },
    {
      eid: 'e18-carmen-lopez-00000000',
      score: 79,
      potential: PerformancePotential.MEDIUM,
      status: 'COMPLETED',
    },
    {
      eid: 'e10-laura-mendez-00000000',
      score: 72,
      potential: PerformancePotential.HIGH,
      status: 'COMPLETED',
    },
    {
      eid: 'e11-valeria-cruz-00000000',
      score: 68,
      potential: PerformancePotential.MEDIUM,
      status: 'PENDING',
    },
    {
      eid: 'e02-carlos-ibanez-00000000',
      score: 65,
      potential: PerformancePotential.MEDIUM,
      status: 'PENDING',
    },
    {
      eid: 'e03-martin-sosa-000000000',
      score: 55,
      potential: PerformancePotential.LOW,
      status: 'PENDING',
    },
  ];

  for (const p of perfDefs) {
    await prisma.performanceReview.create({
      data: {
        companyId: company.id,
        employeeId: employees[p.eid].id,
        reviewerId: employees['e13-jorge-vega-000000000'].id,
        period: '2026-H1',
        type: 'SEMESTRAL',
        status: p.status,
        score: p.score,
        potential: p.potential,
        goals: [
          { descripcion: 'KPI departamental Q1-Q2', peso: 40, logrado: p.score >= 80 },
          { descripcion: 'Colaboración y trabajo en equipo', peso: 30, logrado: p.score >= 70 },
          { descripcion: 'Desarrollo profesional', peso: 30, logrado: p.score >= 75 },
        ],
        competencies: {
          liderazgo: Math.min(100, p.score + 5),
          comunicacion: p.score,
          innovacion: Math.max(0, p.score - 10),
          ejecucion: p.score + 3,
        },
        submittedAt: p.status === 'COMPLETED' ? d('2026-05-20T12:00:00Z') : null,
        completedAt: p.status === 'COMPLETED' ? d('2026-05-22T16:00:00Z') : null,
      },
    });
  }
  console.log('  ✓ Evaluaciones de desempeño: 11 cargadas');

  // ───────────────────────────────────────────────────────────────────────────
  // 9. ATTENDANCE RECORDS — últimas 2 semanas
  // ───────────────────────────────────────────────────────────────────────────
  const attendanceDates = [
    '2026-05-13',
    '2026-05-14',
    '2026-05-15',
    '2026-05-16',
    '2026-05-19',
    '2026-05-20',
    '2026-05-21',
    '2026-05-22',
    '2026-05-23',
    '2026-05-26',
    '2026-05-27',
  ];

  // Valeria Cruz — 3 ausencias en este período
  const valeriaAbsences = new Set(['2026-05-19', '2026-05-23', '2026-05-26']);

  const attRecords = [
    ...[
      'e01-diego-mora-0000000000',
      'e04-pablo-herrera-00000000',
      'e05-florencia-paz-00000000',
      'e06-rodrigo-villar-0000000',
      'e13-jorge-vega-000000000',
      'e15-claudia-soto-00000000',
    ].flatMap((eid) =>
      attendanceDates.map((date) => ({
        companyId: company.id,
        employeeId: employees[eid].id,
        date: d(date),
        status: AttendanceStatus.PRESENT,
        checkIn: d(`${date}T09:00:00Z`),
        checkOut: d(`${date}T18:00:00Z`),
        hoursWorked: 9,
        overtime: 1,
        source: 'BIOMETRICO',
      })),
    ),
    // Laura — presente con overtime masivo
    ...attendanceDates.map((date) => ({
      companyId: company.id,
      employeeId: employees['e10-laura-mendez-00000000'].id,
      date: d(date),
      status: AttendanceStatus.PRESENT,
      checkIn: d(`${date}T08:30:00Z`),
      checkOut: d(`${date}T21:00:00Z`),
      hoursWorked: 12.5,
      overtime: 4.5,
      source: 'BIOMETRICO',
    })),
    // Valeria — con ausencias
    ...attendanceDates.map((date) => ({
      companyId: company.id,
      employeeId: employees['e11-valeria-cruz-00000000'].id,
      date: d(date),
      status: valeriaAbsences.has(date) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
      checkIn: valeriaAbsences.has(date) ? null : d(`${date}T09:15:00Z`),
      checkOut: valeriaAbsences.has(date) ? null : d(`${date}T18:00:00Z`),
      hoursWorked: valeriaAbsences.has(date) ? null : 8.75,
      overtime: null,
      source: 'BIOMETRICO',
    })),
    // Martín Sosa — algunos tardanzas
    ...attendanceDates.map((date, i) => ({
      companyId: company.id,
      employeeId: employees['e03-martin-sosa-000000000'].id,
      date: d(date),
      status: i % 4 === 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      checkIn: d(`${date}T${i % 4 === 0 ? '09:45' : '09:00'}:00Z`),
      checkOut: d(`${date}T18:00:00Z`),
      hoursWorked: i % 4 === 0 ? 8.25 : 9,
      overtime: 1,
      source: 'BIOMETRICO',
    })),
  ];

  for (const rec of attRecords) {
    await prisma.attendanceRecord.upsert({
      where: {
        companyId_employeeId_date: {
          companyId: rec.companyId,
          employeeId: rec.employeeId,
          date: rec.date,
        },
      },
      update: {},
      create: {
        companyId: rec.companyId,
        employeeId: rec.employeeId,
        date: rec.date,
        status: rec.status,
        checkIn: rec.checkIn ?? null,
        checkOut: rec.checkOut ?? null,
        hoursWorked: rec.hoursWorked ?? null,
        overtime: rec.overtime ?? null,
        source: rec.source,
      },
    });
  }
  console.log(`  ✓ Asistencia: ${attRecords.length} registros cargados`);

  // ───────────────────────────────────────────────────────────────────────────
  // 10. LEAVE REQUESTS — vacaciones pendientes agosto
  // ───────────────────────────────────────────────────────────────────────────
  const leaveRequests = [
    {
      employeeId: employees['e05-florencia-paz-00000000'].id,
      type: LeaveType.VACACIONES,
      status: LeaveStatus.APPROVED,
      startDate: d('2026-08-04'),
      endDate: d('2026-08-14'),
      days: 9,
      reason: 'Vacaciones de invierno',
      approvedBy: employees['e13-jorge-vega-000000000'].id,
      approvedAt: d('2026-05-10T14:00:00Z'),
    },
    {
      employeeId: employees['e07-tomas-vera-000000000'].id,
      type: LeaveType.VACACIONES,
      status: LeaveStatus.PENDING,
      startDate: d('2026-08-04'),
      endDate: d('2026-08-18'),
      days: 11,
      reason: 'Vacaciones con familia',
    },
    {
      employeeId: employees['e06-rodrigo-villar-0000000'].id,
      type: LeaveType.VACACIONES,
      status: LeaveStatus.PENDING,
      startDate: d('2026-08-11'),
      endDate: d('2026-08-21'),
      days: 9,
      reason: 'Viaje al exterior',
    },
    {
      employeeId: employees['e04-pablo-herrera-00000000'].id,
      type: LeaveType.VACACIONES,
      status: LeaveStatus.PENDING,
      startDate: d('2026-08-10'),
      endDate: d('2026-08-17'),
      days: 6,
    },
    {
      employeeId: employees['e19-camila-torres-0000000'].id,
      type: LeaveType.VACACIONES,
      status: LeaveStatus.APPROVED,
      startDate: d('2026-07-21'),
      endDate: d('2026-08-01'),
      days: 10,
      reason: 'Vacaciones julio/agosto',
      approvedBy: employees['e13-jorge-vega-000000000'].id,
      approvedAt: d('2026-05-15T09:00:00Z'),
    },
    {
      employeeId: employees['e11-valeria-cruz-00000000'].id,
      type: LeaveType.ENFERMEDAD,
      status: LeaveStatus.APPROVED,
      startDate: d('2026-05-19'),
      endDate: d('2026-05-19'),
      days: 1,
      reason: 'Certificado médico',
      approvedBy: employees['e13-jorge-vega-000000000'].id,
      approvedAt: d('2026-05-19T10:00:00Z'),
    },
  ];

  for (const lr of leaveRequests) {
    await prisma.leaveRequest.create({
      data: { ...lr, companyId: company.id },
    });
  }
  console.log('  ✓ Solicitudes de licencias: 6 cargadas');

  // ───────────────────────────────────────────────────────────────────────────
  // 11. RECRUITMENT SEARCHES & CANDIDATES
  // ───────────────────────────────────────────────────────────────────────────
  const searchDevSenior = await prisma.recruitmentSearch.create({
    data: {
      id: 'rs01-dev-senior-react',
      companyId: company.id,
      departmentId: depts.tecnologia.id,
      title: 'Dev Senior React',
      seniority: 'Senior',
      type: ContractType.INDEFINIDO,
      status: RecruitmentStatus.FILLED,
      salaryMin: 250000,
      salaryMax: 320000,
      currency: 'ARS',
      requirements: ['React 18+', 'TypeScript', 'Node.js', 'PostgreSQL', '3+ años exp'],
      competencies: ['trabajo_en_equipo', 'autonomia', 'comunicacion'],
      description:
        'Buscamos Dev Senior React para equipo de producto. Stack: React + Node + PostgreSQL.',
      location: 'Buenos Aires / Híbrido',
      remote: true,
      openedAt: d('2026-04-01'),
      closedAt: d('2026-05-20'),
      createdBy: employees['e13-jorge-vega-000000000'].id,
    },
  });

  const searchDevSenior2 = await prisma.recruitmentSearch.create({
    data: {
      id: 'rs02-dev-senior-react-2',
      companyId: company.id,
      departmentId: depts.tecnologia.id,
      title: 'Dev Senior React',
      seniority: 'Senior',
      type: ContractType.INDEFINIDO,
      status: RecruitmentStatus.OPEN,
      salaryMin: 250000,
      salaryMax: 310000,
      currency: 'ARS',
      requirements: ['React 18+', 'TypeScript', 'GraphQL', '3+ años exp'],
      competencies: ['liderazgo_tecnico', 'mentoring'],
      description: 'Segunda posición Dev Senior React — foco en arquitectura frontend.',
      location: 'Buenos Aires / Remoto',
      remote: true,
      openedAt: d('2026-05-01'),
      createdBy: employees['e13-jorge-vega-000000000'].id,
    },
  });

  const searchAnalista = await prisma.recruitmentSearch.create({
    data: {
      id: 'rs03-analista-datos',
      companyId: company.id,
      departmentId: depts.finanzas.id,
      title: 'Analista de Datos',
      seniority: 'Semi-Senior',
      type: ContractType.INDEFINIDO,
      status: RecruitmentStatus.OPEN,
      salaryMin: 180000,
      salaryMax: 240000,
      currency: 'ARS',
      requirements: ['Python', 'SQL', 'Power BI', 'Estadística'],
      location: 'Buenos Aires',
      remote: false,
      openedAt: d('2026-05-10'),
      createdBy: employees['e13-jorge-vega-000000000'].id,
    },
  });

  // Candidates
  await prisma.candidate.createMany({
    data: [
      {
        id: 'cand-alejandro-ponce',
        companyId: company.id,
        searchId: searchDevSenior.id,
        firstName: 'Alejandro',
        lastName: 'Ponce',
        email: 'aponce@gmail.com',
        stage: CandidateStage.HIRED,
        score: 92,
        aiScore: 94,
        source: 'LinkedIn',
        salary: 280000,
        currency: 'ARS',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
        hiredAt: d('2026-05-20'),
        notes: 'Excelente candidato. Acepta oferta. Inicio 01/06.',
        aiAnalysis: 'Perfil técnico sólido. Encaje cultural alto. Muy recomendado.',
      },
      {
        id: 'cand-rodrigo-alvarez',
        companyId: company.id,
        searchId: searchDevSenior2.id,
        firstName: 'Rodrigo',
        lastName: 'Álvarez',
        email: 'ralvarez@gmail.com',
        stage: CandidateStage.OFFER,
        score: 88,
        aiScore: 90,
        source: 'Referido',
        salary: 275000,
        currency: 'ARS',
        skills: ['React', 'TypeScript', 'GraphQL', 'Docker'],
        notes: 'Oferta enviada 26/05. Esperando respuesta.',
        aiAnalysis: 'Experiencia en arquitectura frontend. Liderazgo técnico probado.',
      },
      {
        id: 'cand-sofia-blanco',
        companyId: company.id,
        searchId: searchDevSenior2.id,
        firstName: 'Sofía',
        lastName: 'Blanco',
        email: 'sblanco@gmail.com',
        stage: CandidateStage.TECHNICAL,
        score: 79,
        aiScore: 82,
        source: 'Indeed',
        salary: 260000,
        currency: 'ARS',
        skills: ['React', 'Vue', 'TypeScript'],
        notes: 'Prueba técnica enviada el 25/05.',
      },
      {
        id: 'cand-lucas-martin',
        companyId: company.id,
        searchId: searchAnalista.id,
        firstName: 'Lucas',
        lastName: 'Martín',
        email: 'lmartin@gmail.com',
        stage: CandidateStage.INTERVIEW,
        score: 74,
        aiScore: 76,
        source: 'LinkedIn',
        salary: 200000,
        currency: 'ARS',
        skills: ['Python', 'SQL', 'Power BI'],
        notes: 'Entrevista técnica programada 30/05.',
      },
      {
        id: 'cand-paola-ferreyra',
        companyId: company.id,
        searchId: searchAnalista.id,
        firstName: 'Paola',
        lastName: 'Ferreyra',
        email: 'pferreyra@gmail.com',
        stage: CandidateStage.SCREENING,
        score: 65,
        aiScore: 68,
        source: 'ZonaJobs',
        salary: 190000,
        currency: 'ARS',
        skills: ['SQL', 'Excel', 'Tableau'],
      },
      {
        id: 'cand-ivan-ramos',
        companyId: company.id,
        searchId: searchDevSenior2.id,
        firstName: 'Iván',
        lastName: 'Ramos',
        email: 'iramos@gmail.com',
        stage: CandidateStage.REJECTED,
        score: 45,
        aiScore: 48,
        source: 'LinkedIn',
        salary: 250000,
        currency: 'ARS',
        skills: ['React', 'JavaScript'],
        rejectedAt: d('2026-05-15'),
        rejectionReason: 'Nivel técnico insuficiente para la posición senior',
      },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Búsquedas: 3 | Candidatos: 6 cargados');

  // ───────────────────────────────────────────────────────────────────────────
  // 12. TRAINING PLANS & ENROLLMENTS
  // ───────────────────────────────────────────────────────────────────────────
  const trainingPlans = await Promise.all([
    prisma.trainingPlan.create({
      data: {
        id: 'tp01-react-avanzado',
        companyId: company.id,
        title: 'React Avanzado + TypeScript',
        description: 'Patrones avanzados, performance, testing',
        type: 'TECHNICAL',
        provider: 'Platzi for Teams',
        skills: ['React', 'TypeScript', 'Testing'],
        duration: 40,
        durationUnit: 'HOURS',
        cost: 85000,
        currency: 'ARS',
      },
    }),
    prisma.trainingPlan.create({
      data: {
        id: 'tp02-liderazgo',
        companyId: company.id,
        title: 'Liderazgo y Gestión de Equipos',
        description: 'Habilidades de liderazgo, feedback, comunicación',
        type: 'LEADERSHIP',
        provider: 'Udemy Business',
        skills: ['liderazgo', 'comunicacion', 'feedback'],
        duration: 20,
        durationUnit: 'HOURS',
        cost: 45000,
        currency: 'ARS',
      },
    }),
    prisma.trainingPlan.create({
      data: {
        id: 'tp03-python-data',
        companyId: company.id,
        title: 'Python para Análisis de Datos',
        description: 'Pandas, NumPy, visualización, ML básico',
        type: 'TECHNICAL',
        provider: 'DataCamp',
        skills: ['Python', 'Pandas', 'SQL', 'Visualización'],
        duration: 60,
        durationUnit: 'HOURS',
        cost: 72000,
        currency: 'ARS',
      },
    }),
    prisma.trainingPlan.create({
      data: {
        id: 'tp04-ventas-consultiva',
        companyId: company.id,
        title: 'Venta Consultiva B2B',
        description: 'Metodología SPIN, negociación, cierre',
        type: 'SALES',
        provider: 'Mercado Academy',
        skills: ['ventas', 'negociacion', 'crm'],
        duration: 16,
        durationUnit: 'HOURS',
        cost: 38000,
        currency: 'ARS',
      },
    }),
    prisma.trainingPlan.create({
      data: {
        id: 'tp05-aws-cloud',
        companyId: company.id,
        title: 'AWS Cloud Practitioner',
        description: 'Fundamentos cloud, servicios AWS principales',
        type: 'TECHNICAL',
        provider: 'AWS Training',
        skills: ['AWS', 'Cloud', 'DevOps'],
        duration: 30,
        durationUnit: 'HOURS',
        cost: 95000,
        currency: 'ARS',
      },
    }),
    prisma.trainingPlan.create({
      data: {
        id: 'tp06-ux-research',
        companyId: company.id,
        title: 'UX Research & Design Systems',
        description: 'Research methods, design tokens, component libraries',
        type: 'DESIGN',
        provider: 'Interaction Design Foundation',
        skills: ['UX', 'Research', 'Design Systems', 'Figma'],
        duration: 35,
        durationUnit: 'HOURS',
        cost: 62000,
        currency: 'ARS',
      },
    }),
  ]);

  const enrollmentDefs = [
    {
      empKey: 'e03-martin-sosa-000000000',
      planIdx: 0,
      progress: 35,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-05-01'),
    },
    {
      empKey: 'e03-martin-sosa-000000000',
      planIdx: 1,
      progress: 0,
      status: TrainingStatus.PENDING,
    },
    {
      empKey: 'e02-carlos-ibanez-00000000',
      planIdx: 1,
      progress: 60,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-04-15'),
    },
    {
      empKey: 'e12-natalia-gomez-0000000',
      planIdx: 3,
      progress: 25,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-05-10'),
    },
    {
      empKey: 'e11-valeria-cruz-00000000',
      planIdx: 3,
      progress: 80,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-04-01'),
    },
    {
      empKey: 'e07-tomas-vera-000000000',
      planIdx: 0,
      progress: 100,
      status: TrainingStatus.COMPLETED,
      startDate: d('2026-03-01'),
      completedAt: d('2026-04-30'),
      score: 88,
    },
    {
      empKey: 'e06-rodrigo-villar-0000000',
      planIdx: 4,
      progress: 70,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-05-01'),
    },
    {
      empKey: 'e05-florencia-paz-00000000',
      planIdx: 5,
      progress: 90,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-04-01'),
    },
    {
      empKey: 'e16-federico-alvarez-000',
      planIdx: 2,
      progress: 45,
      status: TrainingStatus.IN_PROGRESS,
      startDate: d('2026-04-15'),
    },
  ];

  for (const en of enrollmentDefs) {
    await prisma.trainingEnrollment.upsert({
      where: {
        companyId_employeeId_planId: {
          companyId: company.id,
          employeeId: employees[en.empKey].id,
          planId: trainingPlans[en.planIdx].id,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        employeeId: employees[en.empKey].id,
        planId: trainingPlans[en.planIdx].id,
        status: en.status,
        progress: en.progress,
        startDate: en.startDate ?? null,
        completedAt: en.completedAt ?? null,
        score: en.score ?? null,
      },
    });
  }
  console.log('  ✓ Capacitaciones: 6 planes | 9 inscripciones');

  // ───────────────────────────────────────────────────────────────────────────
  // 13. RECOGNITIONS
  // ───────────────────────────────────────────────────────────────────────────
  await prisma.recognition.createMany({
    data: [
      {
        companyId: company.id,
        giverId: employees['e01-diego-mora-0000000000'].id,
        recipientId: employees['e05-florencia-paz-00000000'].id,
        type: RecognitionType.LOGRO,
        title: '🚀 Launch del nuevo dashboard',
        message:
          'Florencia hizo un trabajo excepcional diseñando el nuevo dashboard analytics. El cliente quedó encantado.',
        isPublic: true,
        points: 500,
        createdAt: d('2026-05-20T15:00:00Z'),
      },
      {
        companyId: company.id,
        giverId: employees['e13-jorge-vega-000000000'].id,
        recipientId: employees['e04-pablo-herrera-00000000'].id,
        type: RecognitionType.COMPANERO,
        title: '🤝 Mentoría a nuevos devs',
        message:
          'Pablo dedicó horas de su tiempo para acompañar a los devs junior. Espíritu de equipo ejemplar.',
        isPublic: true,
        points: 300,
        createdAt: d('2026-05-15T10:00:00Z'),
      },
      {
        companyId: company.id,
        giverId: employees['e00-gustavo-reyes-000000000'].id,
        recipientId: employees['e01-diego-mora-0000000000'].id,
        type: RecognitionType.LIDERAZGO,
        title: '⭐ Liderazgo en proyecto crítico',
        message:
          'Diego lideró con excelencia la migración a la nueva arquitectura. Sin interrupciones. En tiempo y costo.',
        isPublic: true,
        points: 750,
        createdAt: d('2026-05-10T09:00:00Z'),
      },
      {
        companyId: company.id,
        giverId: employees['e15-claudia-soto-00000000'].id,
        recipientId: employees['e16-federico-alvarez-000'].id,
        type: RecognitionType.LOGRO,
        title: '📊 Cierre contable impecable',
        message:
          'Federico cerró el período contable Q1 con cero errores y 2 días antes de la fecha límite.',
        isPublic: true,
        points: 400,
        createdAt: d('2026-04-30T16:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Reconocimientos: 4 publicados');

  // ───────────────────────────────────────────────────────────────────────────
  // 14. AUTOMATION RULES
  // ───────────────────────────────────────────────────────────────────────────
  const automationDefs = [
    {
      id: 'auto-01-horario-whatsapp',
      name: 'Horario semanal por WhatsApp',
      description: 'Envía el horario de la semana a todos los empleados cada lunes 7:00 AM',
      trigger: AutomationTrigger.SCHEDULE,
      triggerConfig: { cron: '0 7 * * MON', timezone: 'America/Argentina/Buenos_Aires' },
      actions: [{ tipo: 'whatsapp', template: 'horario_semanal', destinatarios: 'todos' }],
      status: AutomationStatus.ACTIVE,
      runCount: 12,
      tags: ['comunicacion', 'whatsapp'],
    },
    {
      id: 'auto-02-alerta-riesgo',
      name: 'Alerta riesgo de renuncia',
      description: 'Notifica a RRHH cuando un empleado supera score de riesgo 75',
      trigger: AutomationTrigger.THRESHOLD,
      triggerConfig: { metric: 'riskScore', threshold: 75, direction: 'ABOVE' },
      actions: [
        { tipo: 'email', destinatario: 'jvega@techsur.com', template: 'alerta_riesgo' },
        { tipo: 'slack', canal: '#rrhh-alertas', mensaje: '⚠️ Empleado con riesgo alto detectado' },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 8,
      tags: ['riesgo', 'retencion', 'ia'],
    },
    {
      id: 'auto-03-anomalia-liquidacion',
      name: 'Control de anomalías en liquidación',
      description: 'Detecta anomalías en liquidación antes del cierre y notifica al área contable',
      trigger: AutomationTrigger.EVENT,
      triggerConfig: { evento: 'payroll.pre_close', umbral_anomalia: 0.2 },
      actions: [
        { tipo: 'email', destinatario: 'csoto@techsur.com', template: 'anomalias_liquidacion' },
        { tipo: 'dashboard_alert', severidad: 'HIGH' },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 5,
      tags: ['liquidacion', 'compliance', 'ia'],
    },
    {
      id: 'auto-04-reporte-ejecutivo',
      name: 'Reporte ejecutivo lunes',
      description: 'Genera y envía reporte ejecutivo HR cada lunes a la dirección',
      trigger: AutomationTrigger.SCHEDULE,
      triggerConfig: { cron: '0 8 * * MON', timezone: 'America/Argentina/Buenos_Aires' },
      actions: [
        { tipo: 'report_generate', formato: 'PDF', template: 'ejecutivo_semanal' },
        {
          tipo: 'email',
          destinatarios: ['greyes@techsur.com', 'csoto@techsur.com'],
          adjuntar: true,
        },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 20,
      tags: ['reportes', 'direccion'],
    },
    {
      id: 'auto-05-vencimiento-contrato',
      name: 'Alerta vencimiento contratos',
      description: 'Alerta 30/15/7 días antes del vencimiento de contratos plazo fijo',
      trigger: AutomationTrigger.SCHEDULE,
      triggerConfig: {
        cron: '0 9 * * *',
        timezone: 'America/Argentina/Buenos_Aires',
        diasAlerta: [30, 15, 7],
      },
      actions: [
        { tipo: 'email', destinatario: 'jvega@techsur.com', template: 'vencimiento_contrato' },
        { tipo: 'dashboard_alert', severidad: 'WARNING' },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 15,
      tags: ['contratos', 'legal', 'compliance'],
    },
    {
      id: 'auto-06-bienvenida-onboarding',
      name: 'Bienvenida y onboarding digital',
      description: 'Envía kit de bienvenida y activa checklist de onboarding al nuevo empleado',
      trigger: AutomationTrigger.EVENT,
      triggerConfig: { evento: 'employee.created', dias_anticipacion: 3 },
      actions: [
        { tipo: 'email', template: 'bienvenida', destinatario: '{{employee.email}}' },
        { tipo: 'whatsapp', template: 'bienvenida_wa', destinatario: '{{employee.phone}}' },
        { tipo: 'crear_checklist', template: 'onboarding_tech' },
        { tipo: 'crear_accesos', sistemas: ['slack', 'github', 'jira'] },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 3,
      tags: ['onboarding', 'comunicacion'],
    },
    {
      id: 'auto-07-encuesta-clima',
      name: 'Encuesta de clima mensual',
      description: 'Envía encuesta de clima laboral el primer lunes de cada mes',
      trigger: AutomationTrigger.SCHEDULE,
      triggerConfig: { cron: '0 10 1-7 * MON', timezone: 'America/Argentina/Buenos_Aires' },
      actions: [
        { tipo: 'encuesta', plataforma: 'EncuestasDeClima.com', template: 'clima_mensual' },
        { tipo: 'email', template: 'invitacion_encuesta', destinatarios: 'todos' },
      ],
      status: AutomationStatus.ACTIVE,
      runCount: 5,
      tags: ['cultura', 'clima', 'encuestas'],
    },
    {
      id: 'auto-08-sync-afip',
      name: 'Sincronización AFIP/SiRAP',
      description: 'Sincroniza novedades de empleados con AFIP WebService cada viernes',
      trigger: AutomationTrigger.SCHEDULE,
      triggerConfig: { cron: '0 18 * * FRI', timezone: 'America/Argentina/Buenos_Aires' },
      actions: [
        { tipo: 'api_call', servicio: 'AFIP_SIRAP', operacion: 'sync_novedades' },
        { tipo: 'log', nivel: 'INFO', mensaje: 'Sync AFIP completado' },
      ],
      status: AutomationStatus.PAUSED,
      runCount: 10,
      errorCount: 2,
      tags: ['integraciones', 'afip', 'legal'],
    },
  ];

  for (const a of automationDefs) {
    await prisma.automationRule.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...a,
        companyId: company.id,
        lastRunAt: a.runCount > 0 ? d('2026-05-26T08:00:00Z') : null,
        nextRunAt: a.status === AutomationStatus.ACTIVE ? d('2026-06-02T08:00:00Z') : null,
        tags: a.tags,
      },
    });
  }
  console.log('  ✓ Automatizaciones: 8 configuradas (7 activas, 1 pausada)');

  // ───────────────────────────────────────────────────────────────────────────
  // 15. INTEGRATIONS
  // ───────────────────────────────────────────────────────────────────────────
  const integrations = [
    {
      slug: 'biometrik-pro',
      name: 'Biometrik Pro',
      category: 'ASISTENCIA',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-27T09:00:00Z'),
    },
    {
      slug: 'salesforce',
      name: 'Salesforce CRM',
      category: 'CRM',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-27T06:00:00Z'),
    },
    {
      slug: 'afip-sirap',
      name: 'AFIP / SiRAP',
      category: 'GOBIERNO',
      isConnected: true,
      status: 'WARNING',
      lastSyncAt: d('2026-05-23T18:00:00Z'),
    },
    {
      slug: 'gmail',
      name: 'Gmail / Google Workspace',
      category: 'COMUNICACION',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-27T09:05:00Z'),
    },
    {
      slug: 'whatsapp-business',
      name: 'WhatsApp Business',
      category: 'COMUNICACION',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-27T07:00:00Z'),
    },
    {
      slug: 'slack',
      name: 'Slack',
      category: 'COMUNICACION',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-27T09:00:00Z'),
    },
    {
      slug: 'docusign',
      name: 'DocuSign',
      category: 'DOCUMENTOS',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-26T16:00:00Z'),
    },
    {
      slug: 'turecibo',
      name: 'TuRecibo.com',
      category: 'LIQUIDACION',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-25T12:00:00Z'),
    },
    {
      slug: 'encuestas-clima',
      name: 'EncuestasDeClima.com',
      category: 'CULTURA',
      isConnected: true,
      status: 'ACTIVE',
      lastSyncAt: d('2026-05-05T10:00:00Z'),
    },
    {
      slug: 'mercadopago',
      name: 'Mercado Pago',
      category: 'PAGOS',
      isConnected: false,
      status: 'INACTIVE',
    },
  ];

  for (const int of integrations) {
    await prisma.integration.upsert({
      where: { companyId_slug: { companyId: company.id, slug: int.slug } },
      update: {},
      create: { ...int, companyId: company.id, config: {} },
    });
  }
  console.log('  ✓ Integraciones: 10 configuradas (9 activas, 1 inactiva)');

  // ───────────────────────────────────────────────────────────────────────────
  // 16. CHAT THREADS — conversaciones demo con ARHIA
  // ───────────────────────────────────────────────────────────────────────────
  const thread1 = await prisma.chatThread.create({
    data: {
      id: 'thread-01-dashboard-riesgo',
      companyId: company.id,
      userId: users[1].id,
      title: 'Análisis de riesgo Laura Méndez',
      mode: ChatMode.ASSISTANT,
      isActive: true,
      createdAt: d('2026-05-27T09:00:00Z'),
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        companyId: company.id,
        threadId: thread1.id,
        role: MessageRole.USER,
        content: '¿Cuál es el estado actual de los empleados en riesgo crítico?',
        createdAt: d('2026-05-27T09:00:00Z'),
      },
      {
        companyId: company.id,
        threadId: thread1.id,
        role: MessageRole.ASSISTANT,
        content:
          'Hay **1 empleado en riesgo crítico** y **5 en riesgo alto** en TechSur S.A.\n\n**Laura Méndez** (Gerenta de Ventas) está en estado **CRÍTICO** con score 87/100:\n- Burnout: 91 🔴 — lleva 3 semanas con horas extra >40%\n- Riesgo de renuncia: 82 — engagement cayó 15 puntos en el último mes\n- Satisfacción: 28/100\n\n**Recomendaciones urgentes:**\n1. Reunión 1:1 con su manager en las próximas 48hs\n2. Redistribuir carga del equipo de ventas\n3. Evaluar ajuste salarial (actualmente 12% bajo mercado)\n\n¿Querés que prepare un plan de acción detallado para retener a Laura?',
        inputTokens: 45,
        outputTokens: 187,
        createdAt: d('2026-05-27T09:00:10Z'),
      },
      {
        companyId: company.id,
        threadId: thread1.id,
        role: MessageRole.USER,
        content: 'Sí, generame el plan de acción',
        createdAt: d('2026-05-27T09:01:00Z'),
      },
      {
        companyId: company.id,
        threadId: thread1.id,
        role: MessageRole.ASSISTANT,
        content:
          '## Plan de Acción — Retención Laura Méndez\n\n**Objetivo:** Reducir riesgo de renuncia de 82 → <40 en 30 días\n\n### Semana 1 (Urgente)\n- [ ] Reunión 1:1 confidencial con Jorge Vega (RRHH) — *viernes 30/05*\n- [ ] Mapear causas raíz del burnout con la propia Laura\n- [ ] Redistribuir 3 cuentas del portfolio a Valeria Cruz y Natalia Gómez\n\n### Semana 2\n- [ ] Propuesta formal de ajuste salarial (+15% → ARS 327.750)\n- [ ] Asignar 1 asistente de ventas para tareas operativas\n- [ ] Establecer límite de horas extra: máx 20hs/mes\n\n### Semana 3-4\n- [ ] Check-in de seguimiento con encuesta de bienestar\n- [ ] Reconocimiento público en la jornada de team building\n- [ ] Definir plan de carrera: ¿Dirección Comercial?\n\n**Costo estimado:** ARS 680.000/año (ajuste + asistente)\n**ROI:** Evitar costo de reemplazo ≈ ARS 1.9M (6-7 meses salario)',
        inputTokens: 52,
        outputTokens: 312,
        createdAt: d('2026-05-27T09:01:12Z'),
      },
    ],
    skipDuplicates: true,
  });

  const thread2 = await prisma.chatThread.create({
    data: {
      id: 'thread-02-contrato-vencimiento',
      companyId: company.id,
      userId: users[1].id,
      title: 'Vencimiento contrato Javier López',
      mode: ChatMode.CONTRACTS,
      isActive: true,
      createdAt: d('2026-05-26T14:00:00Z'),
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        companyId: company.id,
        threadId: thread2.id,
        role: MessageRole.USER,
        content: 'El contrato de Javier López vence en 2 días. ¿Qué opciones tenemos?',
        createdAt: d('2026-05-26T14:00:00Z'),
      },
      {
        companyId: company.id,
        threadId: thread2.id,
        role: MessageRole.ASSISTANT,
        content:
          'El contrato de **Javier López** (Dev Junior, Plazo Fijo) vence el **29/05/2026** — en 2 días.\n\n**Marco legal aplicable:** Art. 93 y 250 LCT N°20.744\n\nTenés **3 opciones:**\n\n### Opción A — Renovar contrato plazo fijo\n- Máximo legal: 5 años acumulados\n- Javier lleva 6 meses → podés renovar hasta 54 meses más\n- ⚠️ Debés notificar con 15 días de anticipación (Art. 94 LCT)\n- **El preaviso ya venció el 14/05** — hay riesgo de indemnización adicional\n\n### Opción B — Convertir a relación indefinida\n- Se aplica automáticamente si no notificás el no-renovación\n- Opción recomendada si la performance es positiva\n\n### Opción C — No renovar (despido sin causa)\n- Indemnización Art. 250 LCT: 50% de Art. 245\n- Monto estimado: **ARS 37.500**\n- Requiere notificación escrita al empleado HOY\n\n¿Qué opción preferís? Puedo generar el documento legal correspondiente.',
        inputTokens: 68,
        outputTokens: 298,
        createdAt: d('2026-05-26T14:00:15Z'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Chat threads: 2 | Mensajes: 6');

  // ───────────────────────────────────────────────────────────────────────────
  // DONE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed completado — TechSur S.A. demo dataset listo');
  console.log('   Empresa: TechSur S.A. | CUIT: 30-71234567-8');
  console.log('   Empleados: 25 | Departamentos: 7 | Contratos: 8');
  console.log('   Usuarios del sistema: 8 (contraseña: Arhia2026!)');
}

main()
  .catch((e) => {
    console.error('❌  Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
