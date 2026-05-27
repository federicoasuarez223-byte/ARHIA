export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface MoneyAmount {
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}
