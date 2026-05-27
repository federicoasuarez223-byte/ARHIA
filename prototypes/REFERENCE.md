# ARHIA — Referencia de Prototipo

Empresa demo: **TechSur S.A.** · 38 empleados · Buenos Aires

---

## DESIGN TOKENS (del prototipo)

```
navy:       #0F172A  → primario, sidebar, headers
gold:       #D4A843  → acento, CTAs, ARHIA
surface:    #F8FAFC
border:     #E2E8F0
dangerBg:   #FEF2F2 / dangerText: #991B1B
warningBg:  #FFFBEB / warningText: #92400E
successBg:  #ECFDF5 / successText: #065F46
infoBg:     #EFF6FF / infoText:    #1E40AF
purpleBg:   #F5F3FF / purpleText:  #4C1D95
```

Fuentes: Montserrat (títulos 700/800) + Inter (cuerpo 400/500/600)

---

## MÓDULO DASHBOARD

**KPIs:**
- Empleados: 38 (+2 este mes)
- People Risk Score: 67/100
- Clima laboral: 64/100 (+5 vs abril)
- Rotación: 14.2% (mejorando)
- Masa salarial: ARS 19.8M (+18% julio)

**Alertas activas:**
1. 🔥 Laura Méndez — burnout 91/100 [Riesgo]
2. 📄 Javier López — contrato vence en 2d [Contratos]
3. ⚠️ Anomalía liquidación — 20hs extra [Liquidaciones]
4. 📅 Vacaciones solapadas agosto [Asistencia]

**Asistencia hoy:**
- Presentes: 25/38
- Ausentes: 3/38
- Con tardanza: 2/38
- Vac/Lic: 8/38

**Automatizaciones activas:**
- Horario semanal → WhatsApp (12x)
- Alerta riesgo renuncia (8x)
- Control anomalías liquidación (5x)
- Reporte ejecutivo lunes (20x)

**Chat ARHIA — mood states:**
- neutral → "Lista para ayudarte" [verde]
- worried → "Detecté algo urgente" [amarillo]
- alert   → "Acción requerida" [rojo]
- pondering → "Analizando opciones..." [purple]

---

## MÓDULO EMPLEADOS — Dataset completo TechSur S.A.

| id | name              | role                | dept        | seniority | status   | risk | perf | att | quota | tenure | salary      | vacDays | docsOk |
|----|-------------------|---------------------|-------------|-----------|----------|------|------|-----|-------|--------|-------------|---------|--------|
| 1  | Laura Méndez      | Líder de Ventas     | Ventas      | Senior    | active   | 87   | 82   | 71  | 91    | 2a 2m  | 1.850.000   | 10      | false  |
| 2  | Carlos Ibáñez     | Dev Senior          | Tecnología  | Senior    | active   | 72   | 78   | 88  | -     | 3a 2m  | 2.200.000   | 6       | true   |
| 3  | Sofía Reyes       | Analista RRHH       | RRHH        | SSr       | active   | 61   | 74   | 90  | -     | 2a 8m  | 1.420.000   | 14      | true   |
| 4  | Matías Torres     | SDR                 | Ventas      | Jr        | active   | 58   | 66   | 79  | 62    | 0a 8m  | 980.000     | 4       | false  |
| 5  | Diego Mora        | Tech Lead           | Tecnología  | Senior    | active   | 55   | 88   | 95  | -     | 4a 1m  | 2.650.000   | 8       | true   |
| 6  | Valeria Cruz      | Account Executive   | Ventas      | SSr       | active   | 76   | 71   | 82  | 78    | 1a 4m  | 1.380.000   | 10      | true   |
| 7  | Lucía Paredes     | Dev Junior          | Tecnología  | Jr        | active   | 41   | 70   | 93  | -     | 0a 6m  | 890.000     | 2       | true   |
| 8  | Jorge Vega        | HRBP                | RRHH        | Senior    | active   | 32   | 91   | 97  | -     | 5a 0m  | 1.950.000   | 18      | true   |
| 9  | Claudia Soto      | Contadora           | Finanzas    | Senior    | active   | 28   | 85   | 96  | -     | 6a 2m  | 2.100.000   | 21      | true   |
| 10 | Pablo Herrera     | SDR                 | Ventas      | Jr        | active   | 74   | 62   | 74  | 55    | 0a 5m  | 920.000     | 2       | false  |
| 11 | Camila Torres     | Brand Manager       | Marketing   | SSr       | active   | 35   | 80   | 92  | -     | 1a 7m  | 1.560.000   | 12      | true   |
| 12 | Marcos Suárez     | Dev Senior          | Tecnología  | Senior    | vacation | 38   | 84   | 89  | -     | 2a 9m  | 2.050.000   | 0       | true   |
| 13 | Patricia Castro   | Account Executive   | Ventas      | SSr       | leave    | 44   | 75   | 77  | 84    | 3a 1m  | 1.490.000   | 6       | true   |
| 14 | Ramón Flores      | Analista Finanzas   | Finanzas    | Jr        | active   | 31   | 72   | 91  | -     | 2a 0m  | 1.120.000   | 8       | true   |
| 15 | Andrés Gil        | Designer            | Marketing   | Jr        | active   | 27   | 79   | 94  | -     | 0a 9m  | 1.050.000   | 4       | true   |
| 16 | Ignacio Paz       | Ops Manager         | Operaciones | Senior    | active   | 44   | 83   | 93  | -     | 3a 5m  | 1.780.000   | 10      | true   |
| 17 | Beatriz Leal      | Coordinadora Ops    | Operaciones | SSr       | active   | 39   | 77   | 88  | -     | 2a 3m  | 1.350.000   | 9       | false  |
| 18 | Fernanda Ruiz     | QA Engineer         | Tecnología  | SSr       | active   | 38   | 81   | 92  | -     | 1a 1m  | 1.580.000   | 7       | true   |
| 19 | Ana Ríos          | Account Executive   | Ventas      | SSr       | active   | 69   | 73   | 83  | 88    | 1a 9m  | 1.420.000   | 8       | true   |
| 20 | Tomás Wick        | Analista Finanzas   | Finanzas    | Jr        | permit   | 22   | 68   | 85  | -     | 1a 2m  | 1.080.000   | 6       | true   |

**Empleado adicional: Gustavo Reyes** (CEO, id=0 en org chart)
- performance: 94, risk: 15, attendance: 98
- No aparece en la tabla de empleados, solo en el org chart como raíz

**Empleado referenciado: Javier López** (en alertas de contratos)
- Contrato vence en 2 días (alert en dashboard y chat)

---

## ESTRUCTURA JERÁRQUICA (Organigrama)

```
Gustavo Reyes (CEO)
├── Jorge Vega (Dir. RRHH)
│   └── Sofía Reyes (Analista RRHH)
├── Laura Méndez (Líder Ventas)
│   ├── Valeria Cruz (Account Exec)
│   ├── Ana Ríos (Account Exec)
│   ├── Patricia Castro (Account Exec)
│   ├── Matías Torres (SDR)
│   └── Pablo Herrera (SDR)
├── Diego Mora (Tech Lead)
│   ├── Carlos Ibáñez (Dev Senior)
│   ├── Marcos Suárez (Dev Senior)
│   ├── Lucía Paredes (Dev Junior)
│   └── Fernanda Ruiz (QA Engineer)
├── Claudia Soto (Dir. Finanzas)
│   ├── Ramón Flores (Analista Fin.)
│   └── Tomás Wick (Analista Fin.)
├── Camila Torres (Brand Manager)
│   └── Andrés Gil (Designer)
└── Ignacio Paz (Ops Manager)
    └── Beatriz Leal (Coordinadora)
```

---

## MÓDULO CHAT

**Threads de demostración:**
1. Laura Méndez — employee/Ventas — URGENTE (burnout 91, risk 91)
2. Diego Mora — manager/Tecnología
3. Carlos Ibáñez — employee/Tecnología (riesgo 72)
4. ARHIA · Alerta — proactive — URGENTE (Valeria Cruz: 8 ausencias)
5. Sofía Reyes — employee/RRHH
6. Jorge Vega — manager/RRHH
7. Matías Torres — employee/Ventas
8. ARHIA · Contrato — proactive — URGENTE (Javier López: vence en 2d)

**Modo EMPLEADO (quick replies):**
- ¿Cuántos días de vacaciones tengo?
- Necesito un certificado laboral
- No entiendo mi recibo de sueldo
- Quiero reportar un conflicto
- ¿Cuándo es el próximo feriado?
- Ver mi horario esta semana

**Modo MANAGER (quick replies):**
- Estado del equipo esta semana
- ¿Quién está en riesgo de renuncia?
- Necesito hacer una desvinculación
- Revisar desempeño del equipo
- Planificar vacaciones del equipo
- Simular costo de un aumento

**Features del chat:**
- Streaming con "thinking steps": Contextualizando → Cruzando datos → Evaluando impacto → Preparando opciones
- Modo confidencial (badge naranja, fondo amarillo)
- Escalación a humano
- Upload drag & drop con clasificación IA (legajo/reclutamiento/liquidaciones/foto)
- Grabación de voz (Whisper)
- Panel derecho de contexto (solo admin): risk/burnout, key facts, tono sugerido, acciones rápidas
- Mensajes proactivos de ARHIA (tipo "proactive")
- Actions buttons con confirmación (⚡ → ✓ Hecho)
- Mini metrics chips dentro de mensajes
- Insight cards (fondo navy)

---

## THINKING STEPS (animación)
1. "Contextualizando..."
2. "Cruzando datos internos..."
3. "Evaluando impacto legal y cultural..."
4. "Preparando múltiples caminos..."

---

## LÓGICA DE RIESGO (colores)

| Score | Label    | bg         | text      | bar      |
|-------|----------|------------|-----------|----------|
| ≥75   | Crítico  | #FEF2F2    | #991B1B   | #EF4444  |
| ≥55   | Alto     | #FFFBEB    | #92400E   | #F59E0B  |
| ≥35   | Moderado | #FFF7ED    | #9A3412   | #F97316  |
| <35   | Bajo     | #ECFDF5    | #065F46   | #10B981  |

## LÓGICA DE PERFORMANCE
| Score | color   | bg       | bar      |
|-------|---------|----------|----------|
| ≥80   | #065F46 | #ECFDF5  | #10B981  |
| ≥65   | #92400E | #FFFBEB  | #F59E0B  |
| <65   | #991B1B | #FEF2F2  | #EF4444  |
