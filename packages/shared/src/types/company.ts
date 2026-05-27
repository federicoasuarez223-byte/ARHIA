import type { PlanTier } from './enums';
import type { AuditFields, Address } from './common';

export interface Company extends AuditFields {
  id: string;
  name: string;
  cuit: string;
  legalName: string;
  industry: string;
  size: CompanySize;
  plan: PlanTier;
  planExpiresAt?: Date;
  tenantSchema: string;
  logo?: string;
  address?: Address;
  phone?: string;
  website?: string;
  isActive: boolean;
  settings: CompanySettings;
}

export type CompanySize = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';

export interface CompanySettings {
  timezone: string;
  currency: 'ARS' | 'USD';
  language: 'es-AR' | 'es-MX' | 'pt-BR';
  workingDays: number[];
  workingHours: { start: string; end: string };
  cct?: string;
  afipCuit?: string;
  mfaRequired: boolean;
  chatEnabled: boolean;
  aiAssistantName: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  parentId?: string;
  headCount: number;
  budget?: number;
}
