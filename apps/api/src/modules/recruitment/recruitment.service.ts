import type { Prisma } from '@prisma/client';

import type {
  ListSearchesDto,
  CreateSearchDto,
  UpdateSearchDto,
  ListCandidatesDto,
  CreateCandidateDto,
  UpdateCandidateDto,
} from './recruitment.schemas';

import { prisma } from '@/config/database';

export class RecruitmentError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

// ─── Selects ────────────────────────────────────────────────────────────────

const searchListSelect = {
  id: true,
  title: true,
  departmentId: true,
  seniority: true,
  type: true,
  status: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  location: true,
  remote: true,
  openedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { candidates: true } },
} satisfies Prisma.RecruitmentSearchSelect;

const searchDetailSelect = {
  id: true,
  title: true,
  departmentId: true,
  seniority: true,
  type: true,
  status: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  location: true,
  remote: true,
  openedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  description: true,
  requirements: true,
  competencies: true,
  createdBy: true,
  _count: { select: { candidates: true } },
} satisfies Prisma.RecruitmentSearchSelect;

const candidateListSelect = {
  id: true,
  searchId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  cvUrl: true,
  stage: true,
  score: true,
  aiScore: true,
  source: true,
  salary: true,
  currency: true,
  notes: true,
  skills: true,
  hiredAt: true,
  createdAt: true,
  updatedAt: true,
  search: { select: { id: true, title: true } },
} satisfies Prisma.CandidateSelect;

// ─── Searches ────────────────────────────────────────────────────────────────

export async function listSearches(companyId: string, query: ListSearchesDto) {
  const { page, limit, status, departmentId, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.RecruitmentSearchWhereInput = { companyId };

  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [searches, total] = await Promise.all([
    prisma.recruitmentSearch.findMany({
      where,
      select: searchListSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.recruitmentSearch.count({ where }),
  ]);

  return { searches, total };
}

export async function createSearch(companyId: string, dto: CreateSearchDto) {
  if (dto.departmentId) {
    const dept = await prisma.department.findFirst({
      where: { id: dto.departmentId, companyId },
    });
    if (!dept) {
      throw new RecruitmentError('DEPT_NOT_FOUND', 'Departamento no encontrado', 404);
    }
  }

  const search = await prisma.recruitmentSearch.create({
    data: {
      companyId,
      title: dto.title,
      departmentId: dto.departmentId,
      seniority: dto.seniority,
      type: dto.type,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      currency: dto.currency,
      description: dto.description,
      location: dto.location,
      remote: dto.remote,
      requirements: dto.requirements ?? [],
      competencies: dto.competencies ?? [],
    },
    select: searchDetailSelect,
  });

  return search;
}

export async function updateSearch(companyId: string, id: string, dto: UpdateSearchDto) {
  const existing = await prisma.recruitmentSearch.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new RecruitmentError('NOT_FOUND', 'Búsqueda no encontrada', 404);
  }

  if (dto.departmentId && dto.departmentId !== existing.departmentId) {
    const dept = await prisma.department.findFirst({ where: { id: dto.departmentId, companyId } });
    if (!dept) {
      throw new RecruitmentError('DEPT_NOT_FOUND', 'Departamento no encontrado', 404);
    }
  }

  const updated = await prisma.recruitmentSearch.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
      ...(dto.seniority !== undefined && { seniority: dto.seniority }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
      ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
      ...(dto.currency !== undefined && { currency: dto.currency }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.remote !== undefined && { remote: dto.remote }),
      ...(dto.requirements !== undefined && { requirements: dto.requirements }),
      ...(dto.competencies !== undefined && { competencies: dto.competencies }),
      ...(dto.status === 'CLOSED' && { closedAt: new Date() }),
    },
    select: searchDetailSelect,
  });

  return updated;
}

export async function deleteSearch(companyId: string, id: string) {
  const existing = await prisma.recruitmentSearch.findFirst({
    where: { id, companyId },
    select: { id: true },
  });
  if (!existing) {
    throw new RecruitmentError('NOT_FOUND', 'Búsqueda no encontrada', 404);
  }

  // Soft delete: set status to CLOSED
  await prisma.recruitmentSearch.update({
    where: { id },
    data: { status: 'CLOSED', closedAt: new Date() },
  });
}

// ─── Candidates ──────────────────────────────────────────────────────────────

export async function listCandidates(companyId: string, query: ListCandidatesDto) {
  const { page, limit, stage, searchId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CandidateWhereInput = { companyId };

  if (stage) where.stage = stage;
  if (searchId) where.searchId = searchId;

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      select: candidateListSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.candidate.count({ where }),
  ]);

  return { candidates, total };
}

export async function createCandidate(companyId: string, dto: CreateCandidateDto) {
  // Validate search exists and belongs to company
  const search = await prisma.recruitmentSearch.findFirst({
    where: { id: dto.searchId, companyId },
    select: { id: true },
  });
  if (!search) {
    throw new RecruitmentError('SEARCH_NOT_FOUND', 'Búsqueda no encontrada', 404);
  }

  const candidate = await prisma.candidate.create({
    data: {
      companyId,
      searchId: dto.searchId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      linkedinUrl: dto.linkedinUrl,
      stage: dto.stage,
      source: dto.source,
      salary: dto.salary,
      notes: dto.notes,
      skills: dto.skills ?? [],
    },
    select: candidateListSelect,
  });

  return candidate;
}

export async function updateCandidate(companyId: string, id: string, dto: UpdateCandidateDto) {
  const existing = await prisma.candidate.findFirst({
    where: { id, companyId },
    select: { id: true, searchId: true },
  });
  if (!existing) {
    throw new RecruitmentError('NOT_FOUND', 'Candidato no encontrado', 404);
  }

  if (dto.searchId && dto.searchId !== existing.searchId) {
    const search = await prisma.recruitmentSearch.findFirst({
      where: { id: dto.searchId, companyId },
      select: { id: true },
    });
    if (!search) {
      throw new RecruitmentError('SEARCH_NOT_FOUND', 'Búsqueda no encontrada', 404);
    }
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
      ...(dto.stage !== undefined && { stage: dto.stage }),
      ...(dto.source !== undefined && { source: dto.source }),
      ...(dto.salary !== undefined && { salary: dto.salary }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.skills !== undefined && { skills: dto.skills }),
      ...(dto.searchId !== undefined && { searchId: dto.searchId }),
      ...(dto.stage === 'HIRED' && { hiredAt: new Date() }),
      ...(dto.stage === 'REJECTED' && { rejectedAt: new Date() }),
    },
    select: candidateListSelect,
  });

  return updated;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getStats(companyId: string) {
  const [totalSearches, openSearches, totalCandidates, byStageCounts, byStatusCounts] =
    await Promise.all([
      prisma.recruitmentSearch.count({ where: { companyId } }),
      prisma.recruitmentSearch.count({ where: { companyId, status: 'OPEN' } }),
      prisma.candidate.count({ where: { companyId } }),
      prisma.candidate.groupBy({
        by: ['stage'],
        where: { companyId },
        _count: { stage: true },
      }),
      prisma.recruitmentSearch.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { status: true },
      }),
    ]);

  const byStage: Record<string, number> = {
    SOURCING: 0,
    SCREENING: 0,
    INTERVIEW: 0,
    TECHNICAL: 0,
    OFFER: 0,
    HIRED: 0,
    REJECTED: 0,
  };
  for (const row of byStageCounts) {
    byStage[row.stage] = row._count.stage;
  }

  const byStatus: Record<string, number> = {
    OPEN: 0,
    PAUSED: 0,
    CLOSED: 0,
    FILLED: 0,
  };
  for (const row of byStatusCounts) {
    byStatus[row.status] = row._count.status;
  }

  return {
    totalSearches,
    openSearches,
    totalCandidates,
    byStageCounts: byStage,
    byStatusCounts: byStatus,
  };
}
