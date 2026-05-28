import { Decimal } from '@prisma/client/runtime/library';

import { prisma } from '@/config/database';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export async function headcountByDepartment(companyId: string) {
  const rows = await prisma.employee.groupBy({
    by: ['departmentId'],
    where: { companyId, isActive: true, employmentStatus: 'ACTIVE' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const deptIds = rows.map((r) => r.departmentId).filter(Boolean) as string[];
  const depts = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const deptMap = new Map(depts.map((d) => [d.id, d.name]));

  return rows.map((r) => ({
    department: r.departmentId
      ? (deptMap.get(r.departmentId) ?? 'Sin departamento')
      : 'Sin departamento',
    count: r._count.id,
  }));
}

export async function turnoverReport(companyId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [hires, terminations] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId, hireDate: { gte: since } },
      select: { hireDate: true },
    }),
    prisma.employee.findMany({
      where: {
        companyId,
        terminationDate: { gte: since },
        employmentStatus: 'TERMINATED',
      },
      select: { terminationDate: true },
    }),
  ]);

  // Build 12-month grid
  const grid: { month: string; hires: number; terminations: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    grid.push({ month: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, hires: 0, terminations: 0 });
  }

  for (const e of hires) {
    const d = new Date(e.hireDate);
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const entry = grid.find((g) => g.month === label);
    if (entry) entry.hires++;
  }
  for (const e of terminations) {
    if (!e.terminationDate) continue;
    const d = new Date(e.terminationDate);
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const entry = grid.find((g) => g.month === label);
    if (entry) entry.terminations++;
  }

  return grid;
}

export async function seniorityReport(companyId: string) {
  const rows = await prisma.employee.groupBy({
    by: ['seniority'],
    where: { companyId, isActive: true, employmentStatus: 'ACTIVE' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const ORDER = ['JUNIOR', 'SEMI_SENIOR', 'SENIOR', 'LEAD', 'MANAGER'];
  const LABELS: Record<string, string> = {
    JUNIOR: 'Junior',
    SEMI_SENIOR: 'Semi Senior',
    SENIOR: 'Senior',
    LEAD: 'Lead',
    MANAGER: 'Manager',
  };

  const sorted = [...rows].sort((a, b) => {
    const ai = ORDER.indexOf(a.seniority ?? '');
    const bi = ORDER.indexOf(b.seniority ?? '');
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return sorted.map((r) => ({
    seniority: r.seniority ? (LABELS[r.seniority] ?? r.seniority) : 'Sin especificar',
    count: r._count.id,
  }));
}

export async function payrollMonthlySalaryReport(companyId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);

  const records = await prisma.payrollRecord.findMany({
    where: {
      companyId,
      OR: [
        { periodYear: { gt: since.getFullYear() } },
        { periodYear: since.getFullYear(), periodMonth: { gte: since.getMonth() + 1 } },
      ],
    },
    select: {
      periodYear: true,
      periodMonth: true,
      grossSalary: true,
      netSalary: true,
      totalDeductions: true,
    },
    orderBy: [{ periodYear: 'asc' }, { periodMonth: 'asc' }],
  });

  const map = new Map<
    string,
    { month: string; grossSalary: number; netSalary: number; deductions: number }
  >();
  for (const r of records) {
    const key = `${r.periodYear}-${String(r.periodMonth).padStart(2, '0')}`;
    const label = `${MONTHS[r.periodMonth - 1]} ${r.periodYear}`;
    const entry = map.get(key) ?? { month: label, grossSalary: 0, netSalary: 0, deductions: 0 };
    entry.grossSalary += Number(r.grossSalary);
    entry.netSalary += Number(r.netSalary);
    entry.deductions += Number(r.totalDeductions);
    map.set(key, entry);
  }

  return Array.from(map.values());
}

export async function payrollReceiptsReport(companyId: string) {
  const records = await prisma.payrollRecord.findMany({
    where: { companyId },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    select: {
      periodYear: true,
      periodMonth: true,
      grossSalary: true,
      netSalary: true,
      totalDeductions: true,
      jubilacion: true,
      obraSocial: true,
      anssal: true,
      ley19032: true,
      status: true,
      currency: true,
      employee: {
        select: {
          firstName: true,
          lastName: true,
          legajo: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  return records.map((r) => ({
    legajo: r.employee.legajo,
    apellido: r.employee.lastName,
    nombre: r.employee.firstName,
    departamento: r.employee.department?.name ?? '',
    periodo: `${MONTHS[r.periodMonth - 1]} ${r.periodYear}`,
    bruto: Number(r.grossSalary),
    jubilacion: Number(r.jubilacion),
    obraSocial: Number(r.obraSocial),
    anssal: Number(r.anssal),
    ley19032: Number(r.ley19032),
    retenciones: Number(r.totalDeductions),
    neto: Number(r.netSalary),
    moneda: r.currency,
    estado: r.status,
  }));
}

export async function absenteeismReport(companyId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const absences = await prisma.attendanceRecord.findMany({
    where: { companyId, status: 'ABSENT', date: { gte: since } },
    select: {
      date: true,
      employee: { select: { department: { select: { name: true } } } },
    },
  });

  const totals = await prisma.attendanceRecord.findMany({
    where: { companyId, date: { gte: since } },
    select: { employee: { select: { department: { select: { name: true } } } } },
  });

  const absMap = new Map<string, number>();
  const totalMap = new Map<string, number>();

  for (const a of absences) {
    const dept = a.employee.department?.name ?? 'Sin departamento';
    absMap.set(dept, (absMap.get(dept) ?? 0) + 1);
  }
  for (const t of totals) {
    const dept = t.employee.department?.name ?? 'Sin departamento';
    totalMap.set(dept, (totalMap.get(dept) ?? 0) + 1);
  }

  return Array.from(totalMap.entries())
    .map(([department, totalDays]) => {
      const absentDays = absMap.get(department) ?? 0;
      const rate = totalDays > 0 ? Math.round((absentDays / totalDays) * 1000) / 10 : 0;
      return { department, absentDays, totalDays, rate };
    })
    .sort((a, b) => b.rate - a.rate);
}

export async function overtimeReport(companyId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      companyId,
      date: { gte: since },
      hoursWorked: { gt: new Decimal(8) },
    },
    select: {
      date: true,
      hoursWorked: true,
      employee: {
        select: {
          firstName: true,
          lastName: true,
          legajo: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return records.map((r) => ({
    legajo: r.employee.legajo,
    apellido: r.employee.lastName,
    nombre: r.employee.firstName,
    departamento: r.employee.department?.name ?? '',
    fecha: r.date.toISOString().slice(0, 10),
    horasTrabajadas: Number(r.hoursWorked),
    horasExtra: Math.max(0, Number(r.hoursWorked) - 8),
  }));
}
