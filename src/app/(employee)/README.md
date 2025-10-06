# Employee Route Group - (employee)

Route group cho Employee Portal, cung cấp giao diện làm việc cho nhân viên với các công cụ quản lý task và workflow.

## Mục đích

Employee Portal bao gồm:

- Dashboard nhân viên với task overview
- Quản lý công việc và dự án được giao
- Timesheet và báo cáo thời gian làm việc
- Communication tools và team collaboration
- Document management và file sharing
- Performance tracking và KPIs
- Training materials và resources

## Cấu trúc Route dự kiến

### Routing Structure

```
(employee)/
├── layout.tsx                      # Employee layout với sidebar
├── page.tsx                        # Employee dashboard redirect
├── login/
│   └── page.tsx                    # Employee login page
├── dashboard/
│   ├── page.tsx                    # Dashboard overview
│   ├── tasks/
│   │   ├── page.tsx               # Tasks assigned to employee
│   │   ├── [taskId]/
│   │   │   ├── page.tsx           # Task detail view
│   │   │   └── edit/
│   │   │       └── page.tsx       # Edit task status/notes
│   │   └── completed/
│   │       └── page.tsx           # Completed tasks
│   ├── projects/
│   │   ├── page.tsx               # Projects overview
│   │   ├── [projectId]/
│   │   │   ├── page.tsx           # Project detail
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx       # Project tasks
│   │   │   └── files/
│   │   │       └── page.tsx       # Project files
│   │   └── archived/
│   │       └── page.tsx           # Archived projects
│   └── calendar/
│       ├── page.tsx               # Work calendar
│       └── events/
│           ├── page.tsx           # Events list
│           └── [eventId]/
│               └── page.tsx       # Event detail
├── timesheet/
│   ├── page.tsx                    # Current timesheet
│   ├── history/
│   │   └── page.tsx               # Timesheet history
│   ├── reports/
│   │   ├── page.tsx               # Time reports
│   │   └── export/
│   │       └── page.tsx           # Export timesheet
│   └── settings/
│       └── page.tsx               # Timesheet preferences
├── customers/
│   ├── page.tsx                    # Assigned customers
│   ├── [customerId]/
│   │   ├── page.tsx               # Customer detail
│   │   ├── orders/
│   │   │   └── page.tsx           # Customer orders
│   │   ├── tickets/
│   │   │   ├── page.tsx           # Support tickets
│   │   │   └── [ticketId]/
│   │   │       └── page.tsx       # Ticket detail
│   │   └── communication/
│   │       └── page.tsx           # Communication history
│   └── search/
│       └── page.tsx               # Customer search
├── orders/
│   ├── page.tsx                    # Orders to process
│   ├── pending/
│   │   └── page.tsx               # Pending orders
│   ├── processing/
│   │   └── page.tsx               # Processing orders
│   ├── [orderId]/
│   │   ├── page.tsx               # Order detail
│   │   ├── fulfill/
│   │   │   └── page.tsx           # Order fulfillment
│   │   └── tracking/
│   │       └── page.tsx           # Shipping tracking
│   └── reports/
│       ├── page.tsx               # Order reports
│       └── analytics/
│           └── page.tsx           # Order analytics
├── inventory/
│   ├── page.tsx                    # Inventory overview
│   ├── products/
│   │   ├── page.tsx               # Products list
│   │   ├── [productId]/
│   │   │   ├── page.tsx           # Product inventory
│   │   │   └── update/
│   │   │       └── page.tsx       # Update stock
│   │   └── low-stock/
│   │       └── page.tsx           # Low stock alerts
│   ├── suppliers/
│   │   ├── page.tsx               # Suppliers list
│   │   └── [supplierId]/
│   │       └── page.tsx           # Supplier detail
│   └── reports/
│       ├── page.tsx               # Inventory reports
│       └── movements/
│           └── page.tsx           # Stock movements
├── communications/
│   ├── page.tsx                    # Communications center
│   ├── messages/
│   │   ├── page.tsx               # Internal messages
│   │   ├── compose/
│   │   │   └── page.tsx           # Compose message
│   │   └── [messageId]/
│   │       └── page.tsx           # Message detail
│   ├── announcements/
│   │   └── page.tsx               # Company announcements
│   └── chat/
│       └── page.tsx               # Team chat
├── documents/
│   ├── page.tsx                    # Document library
│   ├── shared/
│   │   └── page.tsx               # Shared documents
│   ├── personal/
│   │   └── page.tsx               # Personal documents
│   ├── templates/
│   │   └── page.tsx               # Document templates
│   └── upload/
│       └── page.tsx               # Upload documents
├── reports/
│   ├── page.tsx                    # Reports dashboard
│   ├── performance/
│   │   └── page.tsx               # Performance reports
│   ├── productivity/
│   │   └── page.tsx               # Productivity metrics
│   └── custom/
│       ├── page.tsx               # Custom reports
│       └── builder/
│           └── page.tsx           # Report builder
├── training/
│   ├── page.tsx                    # Training materials
│   ├── courses/
│   │   ├── page.tsx               # Available courses
│   │   └── [courseId]/
│   │       ├── page.tsx           # Course content
│   │       └── progress/
│   │           └── page.tsx       # Course progress
│   ├── certifications/
│   │   └── page.tsx               # Certifications
│   └── resources/
│       └── page.tsx               # Learning resources
└── profile/
    ├── page.tsx                    # Employee profile
    ├── settings/
    │   └── page.tsx               # Profile settings
    ├── performance/
    │   └── page.tsx               # Performance review
    └── benefits/
        └── page.tsx               # Employee benefits
```

## Ví dụ Implementation

### Employee Layout

```typescript
// (employee)/layout.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmployeeSidebar } from "../../presentation/layouts/EmployeeSidebar";
import { EmployeeHeader } from "../../presentation/layouts/EmployeeHeader";
import { ProtectedRoute } from "../../presentation/components/common/ProtectedRoute";
import { getCurrentUser } from "../../application/services/AuthService";

export const metadata: Metadata = {
  title: {
    template: "%s | Employee Portal",
    default: "Employee Portal",
  },
  description: "Employee workspace for task management and collaboration",
};

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect if not authenticated or not employee
  if (!user || user.role !== "EMPLOYEE") {
    redirect("/employee/login");
  }

  return (
    <ProtectedRoute requiredRoles={["EMPLOYEE"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Employee Header */}
        <EmployeeHeader user={user} />

        <div className="flex">
          {/* Sidebar */}
          <EmployeeSidebar />

          {/* Main Content */}
          <main className="flex-1 p-6 ml-64">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### Employee Dashboard

```typescript
// (employee)/dashboard/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "../../../application/services/AuthService";
import { EmployeeStats } from "../../../presentation/components/features/dashboard/EmployeeStats";
import { TasksOverview } from "../../../presentation/components/features/tasks/TasksOverview";
import { UpcomingDeadlines } from "../../../presentation/components/features/tasks/UpcomingDeadlines";
import { RecentActivity } from "../../../presentation/components/features/dashboard/RecentActivity";
import { QuickActions } from "../../../presentation/components/features/dashboard/QuickActions";
import { WorkCalendar } from "../../../presentation/components/features/calendar/WorkCalendar";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Employee dashboard with tasks and work overview",
};

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.firstName || user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's on your agenda today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <QuickActions />
        </div>
      </div>

      {/* Employee Stats */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <EmployeeStats employeeId={user?.id} />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
            </div>
            <Suspense
              fallback={
                <div className="h-64 p-6">
                  <LoadingSpinner />
                </div>
              }
            >
              <TasksOverview employeeId={user?.id} />
            </Suspense>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Deadlines
              </h2>
            </div>
            <Suspense
              fallback={
                <div className="h-48 p-6">
                  <LoadingSpinner />
                </div>
              }
            >
              <UpcomingDeadlines employeeId={user?.id} />
            </Suspense>
          </div>
        </div>

        {/* Right Column - Calendar & Activity */}
        <div className="space-y-6">
          {/* Work Calendar */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
            </div>
            <div className="p-6">
              <Suspense
                fallback={
                  <div className="h-64">
                    <LoadingSpinner />
                  </div>
                }
              >
                <WorkCalendar employeeId={user?.id} />
              </Suspense>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h2>
            </div>
            <Suspense
              fallback={
                <div className="h-64 p-6">
                  <LoadingSpinner />
                </div>
              }
            >
              <RecentActivity employeeId={user?.id} limit={10} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Tasks Management

```typescript
// (employee)/dashboard/tasks/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "../../../../application/services/AuthService";
import { TasksList } from "../../../../presentation/components/features/tasks/TasksList";
import { TasksFilters } from "../../../../presentation/components/features/tasks/TasksFilters";
import { TasksStats } from "../../../../presentation/components/features/tasks/TasksStats";
import { BreadcrumbNav } from "../../../../presentation/components/common/BreadcrumbNav";
import { LoadingSpinner } from "../../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "My Tasks",
  description: "Manage and track your assigned tasks",
};

interface TasksPageProps {
  searchParams: {
    page?: string;
    status?: string;
    priority?: string;
    project?: string;
    search?: string;
    sort?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await getCurrentUser();
  const {
    page = "1",
    status,
    priority,
    project,
    search,
    sort = "dueDate",
  } = searchParams;

  const breadcrumbs = [
    { label: "Dashboard", href: "/employee/dashboard" },
    { label: "Tasks", href: "/employee/dashboard/tasks" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbs} />

      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your assigned tasks and deadlines
          </p>
        </div>
      </div>

      {/* Tasks Stats */}
      <Suspense
        fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}
      >
        <TasksStats employeeId={user?.id} />
      </Suspense>

      {/* Filters */}
      <TasksFilters
        status={status}
        priority={priority}
        project={project}
        search={search}
        sort={sort}
      />

      {/* Tasks List */}
      <div className="bg-white shadow rounded-lg">
        <Suspense
          fallback={
            <div className="p-6">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <TasksList
            employeeId={user?.id}
            page={Number(page)}
            status={status}
            priority={priority}
            project={project}
            search={search}
            sort={sort}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

### Timesheet Management

```typescript
// (employee)/timesheet/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "../../../application/services/AuthService";
import { TimesheetEntry } from "../../../presentation/components/features/timesheet/TimesheetEntry";
import { TimesheetSummary } from "../../../presentation/components/features/timesheet/TimesheetSummary";
import { WeeklyTimesheet } from "../../../presentation/components/features/timesheet/WeeklyTimesheet";
import { BreadcrumbNav } from "../../../presentation/components/common/BreadcrumbNav";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Timesheet",
  description: "Track your work hours and submit timesheets",
};

interface TimesheetPageProps {
  searchParams: {
    week?: string;
  };
}

export default async function TimesheetPage({
  searchParams,
}: TimesheetPageProps) {
  const user = await getCurrentUser();
  const { week } = searchParams;

  const breadcrumbs = [
    { label: "Dashboard", href: "/employee/dashboard" },
    { label: "Timesheet", href: "/employee/timesheet" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbs} />

      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Timesheet
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your work hours and manage time entries
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Submit Timesheet
          </button>
        </div>
      </div>

      {/* Timesheet Summary */}
      <Suspense
        fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}
      >
        <TimesheetSummary employeeId={user?.id} week={week} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timesheet */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Weekly Hours
              </h2>
            </div>
            <Suspense
              fallback={
                <div className="h-96 p-6">
                  <LoadingSpinner />
                </div>
              }
            >
              <WeeklyTimesheet employeeId={user?.id} week={week} />
            </Suspense>
          </div>
        </div>

        {/* Quick Time Entry */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Entry</h2>
            </div>
            <div className="p-6">
              <TimesheetEntry employeeId={user?.id} />
            </div>
          </div>

          {/* Time Tracking Tips */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-900 mb-3">
              Time Tracking Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Log time daily for accuracy
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Include detailed descriptions
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Submit by Friday end of day
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Use project codes correctly
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Customer Management

```typescript
// (employee)/customers/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "../../../application/services/AuthService";
import { CustomersTable } from "../../../presentation/components/features/customers/CustomersTable";
import { CustomersFilters } from "../../../presentation/components/features/customers/CustomersFilters";
import { CustomersStats } from "../../../presentation/components/features/customers/CustomersStats";
import { BreadcrumbNav } from "../../../presentation/components/common/BreadcrumbNav";
import { TableSkeleton } from "../../../presentation/components/common/LoadingStates";

export const metadata: Metadata = {
  title: "Customers",
  description: "Manage your assigned customers and their accounts",
};

interface CustomersPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    segment?: string;
    sort?: string;
  };
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const user = await getCurrentUser();
  const { page = "1", search, status, segment, sort = "name" } = searchParams;

  const breadcrumbs = [
    { label: "Dashboard", href: "/employee/dashboard" },
    { label: "Customers", href: "/employee/customers" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbs} />

      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your assigned customer accounts and relationships
          </p>
        </div>
      </div>

      {/* Customer Stats */}
      <Suspense
        fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}
      >
        <CustomersStats employeeId={user?.id} />
      </Suspense>

      {/* Filters */}
      <CustomersFilters
        search={search}
        status={status}
        segment={segment}
        sort={sort}
      />

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg">
        <Suspense
          fallback={<TableSkeleton rows={10} columns={6} className="p-6" />}
        >
          <CustomersTable
            employeeId={user?.id}
            page={Number(page)}
            search={search}
            status={status}
            segment={segment}
            sort={sort}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

## Features & Components

### Task Management

- **TasksList**: Assigned tasks với status tracking
- **TaskDetail**: Comprehensive task information với comments
- **TasksCalendar**: Visual task scheduling và deadlines
- **TasksStats**: Personal productivity metrics

### Time Tracking

- **WeeklyTimesheet**: Visual time entry grid
- **TimesheetEntry**: Quick time logging form
- **TimesheetSummary**: Hours summary với approval status
- **TimeReports**: Detailed time analysis và export

### Customer Relationship

- **CustomersTable**: Assigned customers list
- **CustomerProfile**: Detailed customer information
- **CustomerOrders**: Order history và status
- **CustomerCommunication**: Interaction tracking

### Order Processing

- **OrdersQueue**: Orders awaiting processing
- **OrderDetail**: Comprehensive order information
- **OrderFulfillment**: Picking, packing, shipping workflow
- **OrderTracking**: Shipping status updates

### Inventory Management

- **InventoryOverview**: Stock levels và alerts
- **ProductInventory**: Individual product stock management
- **StockMovements**: Inventory transaction history
- **LowStockAlerts**: Reorder notifications

### Communication Tools

- **MessageCenter**: Internal messaging system
- **TeamChat**: Real-time team communication
- **Announcements**: Company-wide notifications
- **NotificationCenter**: System và task notifications

## Workflow Features

### Task Workflow

- Task assignment và acceptance
- Progress tracking với status updates
- Time logging integration
- Completion approval process

### Order Processing Workflow

- Order queue management
- Priority-based processing
- Quality check steps
- Shipping integration

### Customer Service Workflow

- Ticket assignment và escalation
- Response time tracking
- Customer satisfaction surveys
- Follow-up automation

## Performance & Analytics

### Personal Metrics

- Task completion rates
- Time utilization analysis
- Customer satisfaction scores
- Performance goal tracking

### Team Collaboration

- Shared project visibility
- Team workload balancing
- Knowledge sharing tools
- Peer feedback system

## Best Practices

### User Interface

1. **Task-Focused Design**: Prioritize daily work activities
2. **Quick Actions**: Easy access to common operations
3. **Progress Tracking**: Visual indicators for work status
4. **Mobile Responsive**: Support for field work

### Productivity

1. **Time Tracking**: Accurate work hour logging
2. **Priority Management**: Clear task prioritization
3. **Deadline Awareness**: Proactive deadline monitoring
4. **Resource Access**: Quick access to tools và documents

### Communication

1. **Clear Notifications**: Relevant và actionable alerts
2. **Status Updates**: Regular progress communication
3. **Documentation**: Proper work documentation
4. **Feedback Loops**: Continuous improvement processes

## Security & Access Control

### Role-Based Access

- Department-specific features
- Customer assignment restrictions
- Sensitive data protection
- Audit trail maintenance

### Data Security

- Secure customer information handling
- Encrypted communication
- Access logging
- Regular security training

## Testing Strategy

```typescript
// (employee)/dashboard/__tests__/page.test.tsx
import { render, screen } from "@testing-library/react";
import { getCurrentUser } from "../../../../application/services/AuthService";
import EmployeeDashboard from "../page";

jest.mock("../../../../application/services/AuthService");
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

describe("EmployeeDashboard", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue({
      id: "1",
      email: "employee@example.com",
      role: "EMPLOYEE",
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("should render dashboard correctly", async () => {
    render(<EmployeeDashboard />);

    expect(screen.getByText(/Welcome back, John/)).toBeInTheDocument();
    expect(screen.getByText("My Tasks")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("should display task overview", async () => {
    render(<EmployeeDashboard />);

    expect(screen.getByTestId("tasks-overview")).toBeInTheDocument();
  });
});
```

## Lưu ý

- Employee routes yêu cầu authentication với role EMPLOYEE
- Focus on productivity và task completion
- Implement proper time tracking và reporting
- Provide mobile-friendly interface cho field employees
- Ensure data security cho customer information
- Regular performance reviews và feedback
- Training materials integration
- Real-time collaboration tools
- Comprehensive audit logging cho compliance
