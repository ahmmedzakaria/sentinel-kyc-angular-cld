export type NavNodeType = 'group' | 'module' | 'category' | 'featureGroup' | 'feature';

export interface NavNode {
  label: string;
  type: NavNodeType;
  /** Emoji, only set on level-1 Module Group nodes — see moduleIcon()/categoryIcon() for levels 2/3. */
  icon?: string;
  /** Only set on a handful of feature leaves that have a real routed screen behind them. */
  route?: string;
  children?: NavNode[];
}

function feature(label: string, route?: string): NavNode {
  return { label, type: 'feature', ...(route ? { route } : {}) };
}

function featureGroup(label: string, features: Array<string | NavNode>): NavNode {
  return {
    label,
    type: 'featureGroup',
    children: features.map((f) => (typeof f === 'string' ? feature(f) : f))
  };
}

const DEFAULT_SETUP_GROUPS: NavNode[] = [
  featureGroup('Configuration', ['General Setup', 'Approval Matrix', 'Limit Setup', 'Document Rules', 'Notification Rules']),
  featureGroup('Reference Data', ['Product Setup', 'Branch Setup', 'Code Maintenance', 'Holiday Calendar'])
];

const DEFAULT_REPORT_GROUPS: NavNode[] = [
  featureGroup('Operational Reports', ['Daily Summary', 'Exception Report', 'Activity Register', 'Pending Items']),
  featureGroup('Management Reports', ['Performance Dashboard', 'Compliance Summary', 'Aging Analysis', 'Audit Trail'])
];

/**
 * The source POC built this as [Operation, Report, Setup] — every module in the
 * whole tree used the same two default Setup/Report groups. Fixed to the
 * Operation → Setup → Report order used everywhere else in this app.
 */
function categories(operationGroups: NavNode[]): NavNode[] {
  return [
    { label: 'Operation', type: 'category', children: operationGroups },
    { label: 'Setup', type: 'category', children: DEFAULT_SETUP_GROUPS },
    { label: 'Report', type: 'category', children: DEFAULT_REPORT_GROUPS }
  ];
}

function buildModule(label: string, operationGroups: NavNode[]): NavNode {
  return { label, type: 'module', children: categories(operationGroups) };
}

function moduleGroup(label: string, icon: string, modules: NavNode[]): NavNode {
  return { label, type: 'group', icon, children: modules };
}

export const NAVIGATION_TREE: NavNode[] = [
  moduleGroup('Banking', '🏦', [
    buildModule('Core Banking', [
      featureGroup('Customer Management', [
        'Customer Registration',
        feature('Customer Search', 'customers/list'),
        'Customer Update',
        'Customer Merge',
        'Blacklist Customer',
        'Customer Status',
        'Customer Timeline'
      ]),
      featureGroup('Account Management', ['Open Account', 'Account Search', 'Account Update', 'Account Hold', 'Close Account', 'Account Statement']),
      featureGroup('Loan Management', ['Loan Application', 'Loan Appraisal', 'Loan Approval', 'Disbursement', 'Repayment Schedule', 'Loan Restructure']),
      featureGroup('Transaction', ['Cash Deposit', 'Cash Withdrawal', 'Fund Transfer', 'Transaction Reversal', 'Transaction Authorization']),
      featureGroup('Cheque', ['Cheque Book Request', 'Cheque Issue', 'Stop Cheque', 'Cheque Clearing', 'Cheque Status']),
      featureGroup('Remittance', ['New Remittance', 'Remittance Search', 'Payout', 'Cancel Remittance', 'Remittance Register']),
      featureGroup('Deposit Products', ['Term Deposit Open', 'Deposit Renewal', 'Premature Encashment', 'Interest Instruction', 'Maturity Calendar', 'Lien Marking']),
      featureGroup('Card Services', ['Card Request', 'Card Activation', 'Card Limit Change', 'PIN Reset', 'Card Block', 'Card Replacement']),
      featureGroup('Standing Instruction', ['Instruction Create', 'Instruction Search', 'Instruction Update', 'Instruction Suspend', 'Execution History']),
      featureGroup('Clearing House', ['Inward Clearing', 'Outward Clearing', 'Return Instrument', 'Clearing Batch', 'Settlement Review']),
      featureGroup('Cash Vault', ['Vault Open', 'Vault Transfer', 'Cash Requisition', 'Cash Position', 'Vault Close', 'Cash Insurance']),
      featureGroup('Branch Operations', ['Branch Cash Summary', 'Teller Assignment', 'Service Desk Queue', 'End of Day', 'Branch Exceptions']),
      featureGroup('Compliance Review', ['KYC Exception', 'AML Screening', 'Sanction Hit Review', 'EDD Request', 'Risk Override', 'Review History']),
      featureGroup('Limit Management', ['Customer Limit', 'Account Limit', 'Transaction Limit', 'Temporary Limit', 'Limit Approval', 'Limit Audit']),
      featureGroup('Fee & Charge', ['Charge Assessment', 'Charge Waiver', 'Fee Reversal', 'Tax Calculation', 'Fee Register']),
      featureGroup('Document Service', ['Document Upload', 'Document Checklist', 'Document Verification', 'Document Expiry', 'Document Archive']),
      featureGroup('Notification Service', ['SMS Advice', 'Email Advice', 'Statement Alert', 'Failed Notification', 'Notification Preference']),
      featureGroup('Service Request', ['New Request', 'Request Search', 'Request Assignment', 'Request Escalation', 'Request Closure']),
      featureGroup('Dispute Management', ['Dispute Create', 'Dispute Search', 'Dispute Investigation', 'Provisional Credit', 'Dispute Resolution']),
      featureGroup('Relationship Management', ['RM Assignment', 'Portfolio View', 'Customer Notes', 'Follow-up Task', 'Opportunity Register']),
      featureGroup('Operational Approval', ['Pending Approval', 'Bulk Approval', 'Approval Delegation', 'Approval History', 'Rejected Items'])
    ]),
    buildModule('Agent Banking', [
      featureGroup('Agent Operations', ['Agent Onboarding', 'Agent Search', 'Agent Limit Update', 'Agent Settlement', 'Agent Commission']),
      featureGroup('Outlet Management', ['Outlet Registration', 'Outlet Search', 'Outlet Cash Position', 'Outlet Status'])
    ]),
    buildModule('Mobile Banking', [
      featureGroup('Wallet Management', ['Wallet Registration', 'Wallet Search', 'Wallet Update', 'Wallet Freeze', 'Wallet Statement']),
      featureGroup('Mobile Transactions', ['Cash In', 'Cash Out', 'Merchant Payment', 'Bill Payment', 'Transaction Dispute'])
    ]),
    buildModule('Internet Banking', [
      featureGroup('User Enrollment', ['Enroll Customer', 'Credential Reset', 'Device Approval', 'Access Review']),
      featureGroup('Digital Services', ['Beneficiary Setup', 'Transfer Approval', 'Service Request', 'Session Review'])
    ]),
    buildModule('Merchant Banking', [
      featureGroup('Merchant Management', ['Merchant Registration', 'Merchant Search', 'Merchant Update', 'Settlement Profile']),
      featureGroup('Settlement', ['Batch Settlement', 'Settlement Review', 'Fee Adjustment', 'Dispute Handling'])
    ])
  ]),
  moduleGroup('Survey', '📋', [
    buildModule('Land Survey', [
      featureGroup('Land Information', ['New Survey', 'Search Survey', 'Update Survey', 'GIS Map', 'Boundary Verification', 'Owner History']),
      featureGroup('Plot Management', ['Plot Registration', 'Plot Mutation', 'Plot Merge', 'Plot Split', 'Encumbrance Check'])
    ]),
    buildModule('IT Equipment Survey', [
      featureGroup('Asset Inspection', ['New Inspection', 'Asset Search', 'Condition Update', 'Photo Evidence', 'Warranty Check']),
      featureGroup('Inventory Reconciliation', ['Scan Asset', 'Missing Asset', 'Transfer Request', 'Disposal Request'])
    ]),
    buildModule('Vehicle Survey', [
      featureGroup('Vehicle Inspection', ['New Vehicle Survey', 'Chassis Verification', 'Fitness Check', 'Ownership History', 'Valuation']),
      featureGroup('Route Assessment', ['Route Map', 'Mileage Review', 'Permit Check', 'Risk Notes'])
    ]),
    buildModule('Building Survey', [
      featureGroup('Building Information', ['New Building Survey', 'Floor Details', 'Occupancy Review', 'Safety Checklist', 'Valuation']),
      featureGroup('Utility Review', ['Power Connection', 'Water Supply', 'Fire Safety', 'Maintenance History'])
    ]),
    buildModule('Agricultural Survey', [
      featureGroup('Farm Information', ['New Farm Survey', 'Crop Profile', 'Yield Estimate', 'Irrigation Review', 'Owner History']),
      featureGroup('Field Verification', ['Boundary Walk', 'Soil Notes', 'Photo Capture', 'Seasonal Risk'])
    ])
  ]),
  moduleGroup('POS', '🧾', [
    buildModule('Retail POS', [
      featureGroup('Sales Operation', ['New Sale', 'Return Sale', 'Hold Sale', 'Discount Approval', 'Receipt Reprint']),
      featureGroup('Cash Desk', ['Cash Open', 'Cash Close', 'Cash Transfer', 'Drawer Audit'])
    ]),
    buildModule('Inventory POS', [featureGroup('Stock Operation', ['Stock Receive', 'Stock Transfer', 'Stock Adjustment', 'Stock Count', 'Reorder Review'])])
  ]),
  moduleGroup('Health & Medical', '⚕️', [
    buildModule('Clinic Management', [
      featureGroup('Patient Management', ['Patient Registration', 'Patient Search', 'Visit Update', 'Medical Timeline', 'Referral']),
      featureGroup('Appointment', ['Book Appointment', 'Queue Board', 'Reschedule', 'Cancel Appointment'])
    ]),
    buildModule('Pharmacy', [featureGroup('Prescription', ['New Prescription', 'Prescription Search', 'Dispense Medicine', 'Return Medicine'])])
  ]),
  moduleGroup('Education', '🎓', [
    buildModule('Student Administration', [
      featureGroup('Student Management', ['Student Admission', 'Student Search', 'Student Update', 'Guardian Profile', 'Student Timeline']),
      featureGroup('Academic Operation', ['Class Assignment', 'Attendance Entry', 'Exam Marks', 'Promotion'])
    ]),
    buildModule('Fee Management', [featureGroup('Collection', ['Fee Invoice', 'Payment Entry', 'Waiver Approval', 'Due Follow-up'])])
  ]),
  moduleGroup('E-Commerce', '🛒', [
    buildModule('Marketplace', [
      featureGroup('Order Management', ['Order Search', 'Order Review', 'Order Update', 'Cancellation', 'Return Request']),
      featureGroup('Catalog Management', ['Product Setup', 'Price Update', 'Stock Sync', 'Promotion Setup'])
    ]),
    buildModule('Delivery', [featureGroup('Fulfillment', ['Assign Rider', 'Dispatch Order', 'Delivery Update', 'Failed Delivery', 'Proof of Delivery'])])
  ]),
  moduleGroup('Administration', '⚙️', [
    buildModule('System Administration', [
      featureGroup('User Administration', ['User Create', 'User Search', 'User Update', 'Deactivate User', 'Password Reset']),
      featureGroup('Role Administration', ['Role Create', 'Role Search', 'Permission Matrix', 'Role Assignment'])
    ]),
    buildModule('Tenant Administration', [
      featureGroup('Tenant Management', ['Tenant Create', 'Tenant Search', 'Tenant Settings', 'Tenant Status']),
      featureGroup('Branch Management', ['Branch Create', 'Branch Search', 'Branch Update', 'Branch Status'])
    ])
  ]),
  moduleGroup('Security', '🔐', [
    buildModule('Access Control', [
      featureGroup('Privilege Management', ['Menu Privilege', 'API Privilege', 'Data Scope', 'Approval Rule', 'Access Review']),
      featureGroup('Session Security', ['Active Sessions', 'Force Logout', 'Device Trust', 'Login History'])
    ]),
    buildModule('Audit Security', [featureGroup('Audit Review', ['Audit Search', 'Sensitive Action Review', 'Exception Review', 'Export Audit'])])
  ]),
  moduleGroup('Reporting', '📊', [
    buildModule('Enterprise Reports', [
      featureGroup('KYC Reports', ['Customer Register', 'Pending KYC', 'Rejected KYC', 'High Risk Customers', 'Verification Aging']),
      featureGroup('Security Reports', ['User Access Report', 'Role Matrix', 'Login Report', 'Privilege Changes'])
    ]),
    buildModule('Analytics', [featureGroup('Dashboards', ['Executive Dashboard', 'Branch Dashboard', 'Risk Dashboard', 'Operational KPI'])])
  ])
];

/** Level-2 (Module) icon, matched by keyword — ported from the source POC's moduleIcon(). */
export function moduleIcon(label: string): string {
  const key = label.toLowerCase();
  if (key.includes('banking')) return 'bank';
  if (key.includes('survey')) return 'compass';
  if (key.includes('pos')) return 'shop-front';
  if (key.includes('clinic') || key.includes('pharmacy')) return 'health';
  if (key.includes('student') || key.includes('fee')) return 'graduation-cap';
  if (key.includes('marketplace') || key.includes('delivery')) return 'cart';
  if (key.includes('administration')) return 'gear';
  if (key.includes('security') || key.includes('control')) return 'shield-check';
  if (key.includes('report') || key.includes('analytics')) return 'analytics';
  if (key.includes('retail') || key.includes('inventory')) return 'shopping-bag';
  return 'generic-module';
}

/** Level-3 (Category) icon — reuses the Operation/Setup/Report icons already established elsewhere in the app. */
export function categoryIcon(label: string): string {
  return { Operation: 'bolt', Setup: 'gear', Report: 'bar-chart' }[label] ?? 'generic-module';
}
