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
