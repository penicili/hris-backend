import 'dotenv/config'
import bcrypt from 'bcrypt'
import prisma from '../src/lib/prisma.js'
import type { EmploymentStatus, Status, UserRole } from '../src/generated/prisma/enums'

/**
 * Seed data for a digital agency / small software house.
 *
 * Re-running the script wipes and recreates all seeded tables
 * (Department -> Employee -> User -> Position), so it is idempotent.
 *
 * Login accounts share one password: SEED_PASSWORD env var (default: password123).
 */

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'password123'
const PASSWORD_HASH = await bcrypt.hash(SEED_PASSWORD, 10)

type SeedEmployee = {
  fullName: string
  position: string
  hireDate: string
  status: Status
  employment: EmploymentStatus
  salary: number
  isLead?: boolean
  account?: { email: string; role: UserRole }
}

type SeedDepartment = {
  name: string
  positions: string[]
  employees: SeedEmployee[]
}

type SeedLeaveType = {
  name: string
  defaultQuota: number
}

const leaveTypes: SeedLeaveType[] = [
  { name: 'Annual Leave', defaultQuota: 12 },
  { name: 'Sick Leave', defaultQuota: 12 },
  { name: 'Maternity Leave', defaultQuota: 90 },
  { name: 'Paternity Leave', defaultQuota: 14 },
]

const departments: SeedDepartment[] = [
  {
    name: 'Engineering',
    positions: [
      'Head of Engineering',
      'Senior Software Engineer',
      'Software Engineer',
      'QA Engineer',
      'DevOps Engineer',
    ],
    employees: [
      { fullName: 'Arif Nugroho', position: 'Head of Engineering', hireDate: '2021-03-01', status: 'active', employment: 'permanent', salary: 28_000_000, isLead: true, account: { email: 'arif@example.com', role: 'management' } },
      { fullName: 'Dewi Lestari', position: 'Senior Software Engineer', hireDate: '2022-01-10', status: 'active', employment: 'permanent', salary: 18_000_000, account: { email: 'dewi@example.com', role: 'user' } },
      { fullName: 'Fajar Hidayat', position: 'DevOps Engineer', hireDate: '2023-11-06', status: 'active', employment: 'permanent', salary: 16_000_000 },
      { fullName: 'Raka Pratama', position: 'Software Engineer', hireDate: '2023-06-05', status: 'active', employment: 'permanent', salary: 12_000_000 },
      { fullName: 'Bima Santoso', position: 'QA Engineer', hireDate: '2024-02-19', status: 'active', employment: 'contract', salary: 10_000_000 },
      { fullName: 'Nadia Kusuma', position: 'Software Engineer', hireDate: '2026-05-04', status: 'active', employment: 'probation', salary: 10_500_000 },
      { fullName: 'Rizky Ananda', position: 'Software Engineer', hireDate: '2026-08-03', status: 'active', employment: 'intern', salary: 4_000_000 },
      { fullName: 'Yoga Prakoso', position: 'Software Engineer', hireDate: '2022-08-15', status: 'resigned', employment: 'permanent', salary: 11_000_000 },
    ],
  },
  {
    name: 'Creative',
    positions: ['Creative Director', 'UI/UX Designer', 'Graphic Designer', 'Motion Designer'],
    employees: [
      { fullName: 'Sinta Maharani', position: 'Creative Director', hireDate: '2021-07-05', status: 'active', employment: 'permanent', salary: 24_000_000, isLead: true, account: { email: 'sinta@example.com', role: 'management' } },
      { fullName: 'Gilang Ramadhan', position: 'UI/UX Designer', hireDate: '2022-10-03', status: 'active', employment: 'permanent', salary: 13_000_000 },
      { fullName: 'Ayu Wulandari', position: 'Graphic Designer', hireDate: '2024-04-15', status: 'active', employment: 'contract', salary: 9_500_000 },
      { fullName: 'Reza Firmansyah', position: 'Motion Designer', hireDate: '2025-02-03', status: 'on_leave', employment: 'contract', salary: 10_000_000 },
    ],
  },
  {
    name: 'Digital Marketing',
    positions: ['Marketing Manager', 'SEO Specialist', 'Content Writer', 'Social Media Specialist'],
    employees: [
      { fullName: 'Bagus Saputra', position: 'Marketing Manager', hireDate: '2021-05-17', status: 'active', employment: 'permanent', salary: 20_000_000, isLead: true, account: { email: 'bagus@example.com', role: 'management' } },
      { fullName: 'Citra Anggraini', position: 'SEO Specialist', hireDate: '2023-03-06', status: 'active', employment: 'permanent', salary: 9_000_000 },
      { fullName: 'Tono Wijaya', position: 'Content Writer', hireDate: '2024-08-01', status: 'active', employment: 'contract', salary: 7_500_000 },
      { fullName: 'Intan Permata', position: 'Social Media Specialist', hireDate: '2026-06-01', status: 'active', employment: 'probation', salary: 7_000_000 },
      { fullName: 'Dimas Putra', position: 'Content Writer', hireDate: '2026-08-17', status: 'active', employment: 'intern', salary: 4_000_000 },
    ],
  },
  {
    name: 'HR',
    positions: ['HR Manager', 'HR Generalist', 'Talent Recruiter'],
    employees: [
      { fullName: 'Rani Oktaviani', position: 'HR Manager', hireDate: '2021-02-01', status: 'active', employment: 'permanent', salary: 18_000_000, isLead: true, account: { email: 'admin@example.com', role: 'admin' } },
      { fullName: 'Maya Sari', position: 'HR Generalist', hireDate: '2023-09-11', status: 'active', employment: 'permanent', salary: 9_000_000 },
      { fullName: 'Doni Kurniawan', position: 'Talent Recruiter', hireDate: '2024-12-02', status: 'active', employment: 'contract', salary: 8_000_000 },
    ],
  },
  {
    name: 'Finance',
    positions: ['Finance Manager', 'Accountant', 'Financial Analyst'],
    employees: [
      { fullName: 'Hendra Salim', position: 'Finance Manager', hireDate: '2021-01-11', status: 'active', employment: 'permanent', salary: 19_000_000, isLead: true, account: { email: 'hendra@example.com', role: 'management' } },
      { fullName: 'Lina Hartono', position: 'Accountant', hireDate: '2022-05-16', status: 'active', employment: 'permanent', salary: 11_000_000 },
      { fullName: 'Yuni Safitri', position: 'Financial Analyst', hireDate: '2026-07-06', status: 'active', employment: 'probation', salary: 10_000_000 },
    ],
  },
]

// --- sanity checks -----------------------------------------------------

const emails = new Set<string>()
for (const dept of departments) {
  const leads = dept.employees.filter((e) => e.isLead)
  if (leads.length !== 1) throw new Error(`Department "${dept.name}" must have exactly one lead`)

  for (const emp of dept.employees) {
    if (!dept.positions.includes(emp.position)) {
      throw new Error(`Position "${emp.position}" of ${emp.fullName} is not listed in "${dept.name}" positions`)
    }
    if (emp.account) {
      if (emails.has(emp.account.email)) throw new Error(`Duplicate account email: ${emp.account.email}`)
      emails.add(emp.account.email)
    }
  }
}

// --- seed --------------------------------------------------------------

try {
  console.log('Seeding database...')
  console.log('(running inside a transaction: existing rows are reset first)\n')

  await prisma.$transaction(async (tx) => {
    // Order matters: drop children before parents.
    await tx.department.updateMany({ data: { leadId: null } })
    await tx.leaveRequest.deleteMany()
    await tx.leaveBalance.deleteMany()
    await tx.employee.deleteMany()
    await tx.user.deleteMany()
    await tx.position.deleteMany()
    await tx.department.deleteMany()

    const leaveTypeByName = new Map<string, number>()
    for (const leaveTypeData of leaveTypes) {
      const leaveType = await tx.leaveType.create({ data: leaveTypeData })
      leaveTypeByName.set(leaveType.name, leaveType.id)
    }

    // Users first, so employees can link straight to userId.
    const userIdByEmail = new Map<string, number>()
    for (const dept of departments) {
      for (const emp of dept.employees) {
        if (!emp.account) continue
        const user = await tx.user.create({
          data: {
            email: emp.account.email,
            name: emp.fullName,
            passwordHash: PASSWORD_HASH,
            role: emp.account.role,
          },
        })
        userIdByEmail.set(emp.account.email, user.id)
      }
    }

    let nikSeq = 1
    const employeeIdByName = new Map<string, number>()
    for (const dept of departments) {
      const department = await tx.department.create({ data: { name: dept.name } })

      const positionIds = new Map<string, number>()
      for (const title of dept.positions) {
        const position = await tx.position.create({
          data: { title, departmentId: department.id },
        })
        positionIds.set(title, position.id)
      }

      let leadId: number | undefined
      for (const emp of dept.employees) {
        const employee = await tx.employee.create({
          data: {
            nik: `327301${String(nikSeq++).padStart(10, '0')}`,
            fullName: emp.fullName,
            hireDate: new Date(emp.hireDate),
            status: emp.status,
            employment: emp.employment,
            salary: emp.salary,
            departmentId: department.id,
            positionId: positionIds.get(emp.position)!,
            userId: emp.account ? userIdByEmail.get(emp.account.email) : undefined,
          },
        })
        employeeIdByName.set(employee.fullName, employee.id)
        if (emp.isLead) leadId = employee.id
      }

      await tx.department.update({ where: { id: department.id }, data: { leadId } })
    }

    for (const [, employeeId] of employeeIdByName) {
      for (const leaveTypeData of leaveTypes) {
        const used =
          (leaveTypeData.name === 'Annual Leave' && employeeId === employeeIdByName.get('Dewi Lestari'))
            ? 3
            : (leaveTypeData.name === 'Sick Leave' && employeeId === employeeIdByName.get('Reza Firmansyah'))
              ? 2
              : 0
        await tx.leaveBalance.create({
          data: {
            employeeId,
            leaveTypeId: leaveTypeByName.get(leaveTypeData.name)!,
            year: 2026,
            quota: leaveTypeData.defaultQuota,
            used,
          },
        })
      }
    }

    const annualLeaveId = leaveTypeByName.get('Annual Leave')!
    const sickLeaveId = leaveTypeByName.get('Sick Leave')!
    const leaveRequests = [
      {
        employeeName: 'Dewi Lestari',
        leaveTypeId: annualLeaveId,
        startDate: '2026-01-12',
        endDate: '2026-01-14',
        days: 3,
        status: 'APPROVED' as const,
        reason: 'Family vacation',
      },
      {
        employeeName: 'Reza Firmansyah',
        leaveTypeId: sickLeaveId,
        startDate: '2026-09-21',
        endDate: '2026-09-22',
        days: 2,
        status: 'APPROVED' as const,
        reason: 'Medical recovery',
      },
      {
        employeeName: 'Maya Sari',
        leaveTypeId: annualLeaveId,
        startDate: '2026-10-19',
        endDate: '2026-10-20',
        days: 2,
        status: 'PENDING' as const,
        reason: 'Personal matters',
      },
    ]

    for (const request of leaveRequests) {
      await tx.leaveRequest.create({
        data: {
          employeeId: employeeIdByName.get(request.employeeName)!,
          leaveTypeId: request.leaveTypeId,
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
          days: request.days,
          status: request.status,
          reason: request.reason,
        },
      })
    }
  })

  // --- summary ---------------------------------------------------------
  const [deptCount, empCount, posCount, userCount, leaveTypeCount, leaveBalanceCount, leaveRequestCount] = await Promise.all([
    prisma.department.count(),
    prisma.employee.count(),
    prisma.position.count(),
    prisma.user.count(),
    prisma.leaveType.count(),
    prisma.leaveBalance.count(),
    prisma.leaveRequest.count(),
  ])

  console.log('Seeded:')
  console.log(`  departments: ${deptCount}`)
  console.log(`  positions:   ${posCount}`)
  console.log(`  employees:   ${empCount}`)
  console.log(`  users:       ${userCount}`)
  console.log(`  leave types: ${leaveTypeCount}`)
  console.log(`  balances:    ${leaveBalanceCount}`)
  console.log(`  requests:    ${leaveRequestCount}`)
  console.log('\nLogin accounts (password: ' + SEED_PASSWORD + '):')
  for (const dept of departments) {
    for (const emp of dept.employees) {
      if (emp.account) console.log(`  ${emp.account.email.padEnd(24)} [${emp.account.role}]  ${emp.fullName} (${dept.name})`)
    }
  }
} catch (error) {
  console.error('Seed failed:', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
