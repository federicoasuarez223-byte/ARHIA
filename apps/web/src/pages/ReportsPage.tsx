import { Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import {
  BarChart3,
  Download,
  FileText,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── CSV helper ────────────────────────────────────────────────────────────────

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Report download handlers ──────────────────────────────────────────────────

async function downloadHeadcount() {
  const r = await apiClient.get<{
    success: boolean;
    data: { department: string; count: number }[];
  }>('/api/reports/headcount');
  const csv = toCsv(
    ['Departamento', 'Cantidad de empleados'],
    r.data.data.map((row) => [row.department, row.count]),
  );
  downloadCsv('headcount_por_departamento.csv', csv);
}

async function downloadTurnover() {
  const r = await apiClient.get<{
    success: boolean;
    data: { month: string; hires: number; terminations: number }[];
  }>('/api/reports/turnover');
  const csv = toCsv(
    ['Mes', 'Altas', 'Bajas'],
    r.data.data.map((row) => [row.month, row.hires, row.terminations]),
  );
  downloadCsv('rotacion_personal.csv', csv);
}

async function downloadSeniority() {
  const r = await apiClient.get<{ success: boolean; data: { seniority: string; count: number }[] }>(
    '/api/reports/seniority',
  );
  const csv = toCsv(
    ['Seniority', 'Cantidad de empleados'],
    r.data.data.map((row) => [row.seniority, row.count]),
  );
  downloadCsv('piramide_seniority.csv', csv);
}

async function downloadPayrollMonthly() {
  const r = await apiClient.get<{
    success: boolean;
    data: { month: string; grossSalary: number; netSalary: number; deductions: number }[];
  }>('/api/reports/payroll-monthly');
  const csv = toCsv(
    ['Período', 'Masa bruta (ARS)', 'Masa neta (ARS)', 'Retenciones (ARS)'],
    r.data.data.map((row) => [row.month, row.grossSalary, row.netSalary, row.deductions]),
  );
  downloadCsv('masa_salarial_mensual.csv', csv);
}

async function downloadPayrollReceipts() {
  const r = await apiClient.get<{
    success: boolean;
    data: {
      legajo: string;
      apellido: string;
      nombre: string;
      departamento: string;
      periodo: string;
      bruto: number;
      jubilacion: number;
      obraSocial: number;
      anssal: number;
      ley19032: number;
      retenciones: number;
      neto: number;
      moneda: string;
      estado: string;
    }[];
  }>('/api/reports/payroll-receipts');
  const csv = toCsv(
    [
      'Legajo',
      'Apellido',
      'Nombre',
      'Departamento',
      'Período',
      'Bruto',
      'Jubilación',
      'Obra Social',
      'ANSSAL',
      'Ley 19032',
      'Retenciones',
      'Neto',
      'Moneda',
      'Estado',
    ],
    r.data.data.map((row) => [
      row.legajo,
      row.apellido,
      row.nombre,
      row.departamento,
      row.periodo,
      row.bruto,
      row.jubilacion,
      row.obraSocial,
      row.anssal,
      row.ley19032,
      row.retenciones,
      row.neto,
      row.moneda,
      row.estado,
    ]),
  );
  downloadCsv('recibos_de_haberes.csv', csv);
}

async function downloadAbsenteeism() {
  const r = await apiClient.get<{
    success: boolean;
    data: { department: string; absentDays: number; totalDays: number; rate: number }[];
  }>('/api/reports/absenteeism');
  const csv = toCsv(
    ['Departamento', 'Días ausentes', 'Total registros', 'Índice de ausentismo (%)'],
    r.data.data.map((row) => [row.department, row.absentDays, row.totalDays, row.rate]),
  );
  downloadCsv('ausentismo_por_departamento.csv', csv);
}

async function downloadOvertime() {
  const r = await apiClient.get<{
    success: boolean;
    data: {
      legajo: string;
      apellido: string;
      nombre: string;
      departamento: string;
      fecha: string;
      horasTrabajadas: number;
      horasExtra: number;
    }[];
  }>('/api/reports/overtime');
  const csv = toCsv(
    ['Legajo', 'Apellido', 'Nombre', 'Departamento', 'Fecha', 'Horas trabajadas', 'Horas extra'],
    r.data.data.map((row) => [
      row.legajo,
      row.apellido,
      row.nombre,
      row.departamento,
      row.fecha,
      row.horasTrabajadas,
      row.horasExtra,
    ]),
  );
  downloadCsv('horas_extras.csv', csv);
}

// ── Report card ───────────────────────────────────────────────────────────────

interface ReportItem {
  icon: typeof Users;
  title: string;
  desc: string;
  tag: string;
  onDownload?: () => Promise<void>;
}

function ReportCard({ item }: { item: ReportItem }) {
  const [loading, setLoading] = useState(false);
  const available = item.tag === 'Disponible';

  const handleDownload = async () => {
    if (!item.onDownload) return;
    setLoading(true);
    try {
      await item.onDownload();
      toast.success(`Reporte "${item.title}" descargado`);
    } catch {
      toast.error('No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        available ? 'hover:border-navy-300 hover:bg-surface' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="bg-navy-50 flex h-10 w-10 items-center justify-center rounded-lg">
          <item.icon size={18} className="text-navy-600" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            available ? 'bg-green-100 text-green-700' : 'bg-surface-hover text-navy-400'
          }`}
        >
          {item.tag}
        </span>
      </div>
      <div>
        <p className="text-navy-900 font-semibold">{item.title}</p>
        <p className="text-navy-500 mt-0.5 text-sm">{item.desc}</p>
      </div>
      {available && item.onDownload && (
        <Button
          variant="outline"
          size="xs"
          className="self-start"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          {loading ? 'Generando...' : 'Descargar CSV'}
        </Button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    category: 'Recursos Humanos',
    items: [
      {
        icon: Users,
        title: 'Headcount por departamento',
        desc: 'Distribución de empleados activos por área',
        tag: 'Disponible',
        onDownload: downloadHeadcount,
      },
      {
        icon: TrendingUp,
        title: 'Rotación de personal',
        desc: 'Altas y bajas de los últimos 12 meses',
        tag: 'Disponible',
        onDownload: downloadTurnover,
      },
      {
        icon: Users,
        title: 'Pirámide de seniority',
        desc: 'Distribución de empleados por nivel de experiencia',
        tag: 'Disponible',
        onDownload: downloadSeniority,
      },
    ] satisfies ReportItem[],
  },
  {
    category: 'Liquidaciones',
    items: [
      {
        icon: DollarSign,
        title: 'Masa salarial mensual',
        desc: 'Evolución de costos laborales últimos 12 meses',
        tag: 'Disponible',
        onDownload: downloadPayrollMonthly,
      },
      {
        icon: FileText,
        title: 'Recibos de haberes',
        desc: 'Exportación completa de recibos con detalle de deducciones',
        tag: 'Disponible',
        onDownload: downloadPayrollReceipts,
      },
    ] satisfies ReportItem[],
  },
  {
    category: 'Asistencia',
    items: [
      {
        icon: Clock,
        title: 'Ausentismo',
        desc: 'Índice de inasistencias por departamento (últimos 6 meses)',
        tag: 'Disponible',
        onDownload: downloadAbsenteeism,
      },
      {
        icon: Clock,
        title: 'Horas extras',
        desc: 'Registros con más de 8 hs trabajadas (últimos 6 meses)',
        tag: 'Disponible',
        onDownload: downloadOvertime,
      },
    ] satisfies ReportItem[],
  },
];

export function ReportsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-navy-900 text-2xl font-bold">Reportes</h1>
        <p className="text-navy-500 mt-1 text-sm">Informes y exportaciones de datos en CSV</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={16} className="text-navy-500" />
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <ReportCard key={item.title} item={item} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
