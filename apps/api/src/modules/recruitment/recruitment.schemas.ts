import { z } from 'zod';

const recruitmentStatusEnum = z.enum(['OPEN', 'PAUSED', 'CLOSED', 'FILLED']);
const contractTypeEnum = z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']);
const candidateStageEnum = z.enum([
  'SOURCING',
  'SCREENING',
  'INTERVIEW',
  'TECHNICAL',
  'OFFER',
  'HIRED',
  'REJECTED',
]);

export const listSearchesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: recruitmentStatusEnum.optional(),
  departmentId: z.string().optional(),
  search: z.string().optional(),
});

export const createSearchSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  departmentId: z.string().optional(),
  seniority: z.string().optional(),
  type: contractTypeEnum.default('INDEFINIDO'),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default('ARS'),
  description: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  requirements: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
});

export const updateSearchSchema = createSearchSchema.partial().extend({
  status: recruitmentStatusEnum.optional(),
});

export const listCandidatesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  stage: candidateStageEnum.optional(),
  searchId: z.string().optional(),
});

export const createCandidateSchema = z.object({
  searchId: z.string().min(1, 'Búsqueda requerida'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  stage: candidateStageEnum.default('SOURCING'),
  source: z.string().optional(),
  salary: z.number().positive().optional(),
  notes: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  stage: candidateStageEnum.optional(),
});

export type ListSearchesDto = z.infer<typeof listSearchesSchema>;
export type CreateSearchDto = z.infer<typeof createSearchSchema>;
export type UpdateSearchDto = z.infer<typeof updateSearchSchema>;
export type ListCandidatesDto = z.infer<typeof listCandidatesSchema>;
export type CreateCandidateDto = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateDto = z.infer<typeof updateCandidateSchema>;
