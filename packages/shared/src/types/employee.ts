import type { EmploymentStatus, ContractType, RiskLevel, PerformanceRating } from './enums';
import type { AuditFields, Address, MoneyAmount } from './common';

export interface Employee extends AuditFields {
  id: string;
  companyId: string;
  legajo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  birthDate?: Date;
  dni?: string;
  cuil?: string;
  address?: Address;
  departmentId: string;
  departmentName: string;
  position: string;
  managerId?: string;
  managerName?: string;
  hireDate: Date;
  terminationDate?: Date;
  status: EmploymentStatus;
  contractType: ContractType;
  salary: MoneyAmount;
  riskScore?: number;
  riskLevel?: RiskLevel;
  performanceRating?: PerformanceRating;
  skills: string[];
  tags: string[];
}

export interface CreateEmployeeRequest {
  legajo?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  dni?: string;
  cuil?: string;
  departmentId: string;
  position: string;
  managerId?: string;
  hireDate: string;
  contractType: ContractType;
  salary: MoneyAmount;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: EmploymentStatus;
  terminationDate?: string;
}

export interface EmployeeListItem {
  id: string;
  legajo: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  position: string;
  departmentName: string;
  status: EmploymentStatus;
  riskLevel?: RiskLevel;
  hireDate: Date;
}

export interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string;
  departmentName: string;
  children: OrgChartNode[];
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  probation: number;
  newThisMonth: number;
  terminatedThisMonth: number;
  avgTenureYears: number;
  byDepartment: { name: string; count: number }[];
  byContractType: { type: ContractType; count: number }[];
}
