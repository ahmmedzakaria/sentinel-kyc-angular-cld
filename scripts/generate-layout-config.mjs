// One-off/dev generator for src/assets/config/layout-config.json.
//
// The nav tree below is a plain-JS port of the builder functions that used to
// live in nav-tree.model.ts (feature/featureGroup/categories/buildModule/
// moduleGroup) — kept here, not in the shipped app, since the tree is now
// data (JSON) rather than code. Re-run this script (`node
// scripts/generate-layout-config.mjs`) and commit the regenerated JSON
// whenever the nav tree, theme primaries, or header/status-bar content lists
// need to change; don't hand-edit the generated JSON's navTree section.
//
// Run: node scripts/generate-layout-config.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Nav tree builders — see nav-tree.model.ts for the NavNode shape these produce.
// ---------------------------------------------------------------------------

function feature(label, route) {
  return { label, type: 'feature', ...(route ? { route } : {}) };
}

function featureGroup(label, features) {
  return {
    label,
    type: 'featureGroup',
    children: features.map((f) => (typeof f === 'string' ? feature(f) : f))
  };
}

const DEFAULT_SETUP_GROUPS = [
  featureGroup('Configuration', ['General Setup', 'Approval Matrix', 'Limit Setup', 'Document Rules', 'Notification Rules']),
  featureGroup('Reference Data', ['Product Setup', 'Branch Setup', 'Code Maintenance', 'Holiday Calendar'])
];

const DEFAULT_REPORT_GROUPS = [
  featureGroup('Operational Reports', ['Daily Summary', 'Exception Report', 'Activity Register', 'Pending Items']),
  featureGroup('Management Reports', ['Performance Dashboard', 'Compliance Summary', 'Aging Analysis', 'Audit Trail'])
];

function categories(operationGroups, setupGroups, reportGroups) {
  return [
    { label: 'Operation', type: 'category', children: operationGroups },
    { label: 'Setup', type: 'category', children: setupGroups ?? DEFAULT_SETUP_GROUPS },
    { label: 'Report', type: 'category', children: reportGroups ?? DEFAULT_REPORT_GROUPS }
  ];
}

function buildModule(label, operationGroups, setupGroups, reportGroups) {
  return { label, type: 'module', children: categories(operationGroups, setupGroups, reportGroups) };
}

function moduleGroup(label, icon, modules) {
  return { label, type: 'group', icon, children: modules };
}

const NAVIGATION_TREE = [
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
  moduleGroup('Compliance', '🛡️', [
    buildModule(
      'KYC',
      [
        featureGroup('Person KYC', [
          'Customer Registration',
          'KYC Profile',
          'Document Capture',
          'Identity Verification',
          'Risk Classification',
          'Approval Review'
        ]),
        featureGroup('Business Verification', [
          'Business Profile',
          'Owner Information',
          'Trade License Check',
          'Address Verification',
          'Business Risk Rating'
        ]),
        featureGroup('KYC Review', ['Pending Review', 'Send Back', 'Approve KYC', 'Reject KYC', 'Review History'])
      ],
      [
        featureGroup('KYC Configuration', ['Document Type Setup', 'Risk Rule Setup', 'Review Frequency', 'Approval Matrix']),
        featureGroup('Verification Setup', ['Provider Mapping', 'Required Field Setup', 'Checklist Setup'])
      ],
      [featureGroup('KYC Reports', ['Customer Register', 'Pending KYC', 'Rejected KYC', 'High Risk Customers', 'Verification Aging'])]
    ),
    buildModule('KYB', [
      featureGroup('Business Onboarding', [
        'Business Registration',
        'Beneficial Owner Capture',
        'Ownership Structure',
        'Entity Verification',
        'KYB Approval'
      ]),
      featureGroup('Legal Document Review', [
        'Registration Certificate',
        'Tax Document',
        'Trade License',
        'Board Resolution',
        'Document Exception'
      ])
    ]),
    buildModule('AML Screening', [
      featureGroup('Watchlist Screening', [
        'Sanction Screening',
        'PEP Screening',
        'Adverse Media Search',
        'Watchlist Match Review',
        'False Positive Marking'
      ]),
      featureGroup('Screening Queue', ['Pending Matches', 'Escalated Matches', 'Batch Screening', 'Screening History'])
    ]),
    buildModule('Customer Due Diligence', [
      featureGroup('CDD Review', [
        'CDD Checklist',
        'Customer Risk Review',
        'Profile Refresh',
        'Source of Fund Review',
        'Review Approval'
      ]),
      featureGroup('Enhanced Due Diligence', ['EDD Request', 'EDD Investigation', 'Senior Approval', 'EDD Closure'])
    ]),
    buildModule('Transaction Monitoring', [
      featureGroup('Monitoring Alerts', [
        'Alert Queue',
        'Alert Assignment',
        'Alert Investigation',
        'Alert Disposition',
        'Alert Escalation'
      ]),
      featureGroup('Scenario Review', ['Threshold Breach', 'Velocity Pattern', 'Structuring Alert', 'Unusual Activity'])
    ]),
    buildModule('Compliance Case Management', [
      featureGroup('Case Operations', [
        'Create Case',
        'Case Search',
        'Case Assignment',
        'Investigation Notes',
        'Case Escalation',
        'Case Closure'
      ]),
      featureGroup('Evidence Management', ['Evidence Upload', 'Evidence Review', 'Linked Alerts', 'Case Timeline'])
    ]),
    buildModule('Regulatory Reporting', [
      featureGroup('Regulatory Submissions', [
        'STR Draft',
        'SAR Draft',
        'CTR Register',
        'Submission Review',
        'Regulator Response'
      ]),
      featureGroup('Compliance Registers', [
        'High Risk Register',
        'PEP Register',
        'Rejected Customer Register',
        'Screening Register'
      ])
    ]),
    buildModule('Compliance Policy & Setup', [
      featureGroup('Policy Configuration', ['Risk Policy', 'Screening Policy', 'CDD Policy', 'EDD Policy', 'Retention Policy']),
      featureGroup('Rule Configuration', ['Risk Score Rule', 'Alert Threshold', 'Escalation Rule', 'Review Calendar'])
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
  moduleGroup('Finance', '💼', [
    buildModule(
      'General Ledger',
      [
        featureGroup('Journal Management', [
          'Journal Entry',
          'Journal Search',
          'Journal Approval',
          'Journal Reversal',
          'Recurring Journal'
        ]),
        featureGroup('Ledger Operation', ['Chart of Accounts', 'Ledger Posting', 'Trial Balance', 'Opening Balance', 'Period Close'])
      ],
      [featureGroup('Ledger Setup', ['Account Group Setup', 'Fiscal Year Setup', 'Posting Rule Setup', 'Currency Setup'])],
      [featureGroup('Ledger Reports', ['General Ledger', 'Trial Balance', 'Journal Register', 'Account Statement'])]
    ),
    buildModule(
      'Accounts Payable',
      [
        featureGroup('Vendor Invoice', ['Invoice Entry', 'Invoice Search', 'Invoice Approval', 'Invoice Hold', 'Payment Request']),
        featureGroup('Vendor Payment', ['Payment Voucher', 'Payment Review', 'Payment Release', 'Advance Adjustment'])
      ],
      [featureGroup('Payable Setup', ['Vendor Setup', 'Payment Term Setup', 'Tax Rule Setup', 'Approval Matrix'])],
      [featureGroup('Payable Reports', ['Vendor Ledger', 'Aging Payable', 'Payment Register', 'Outstanding Invoice'])]
    ),
    buildModule(
      'Accounts Receivable',
      [
        featureGroup('Customer Invoice', ['Invoice Create', 'Invoice Search', 'Invoice Approval', 'Credit Note', 'Receipt Allocation']),
        featureGroup('Collection', ['Receipt Entry', 'Collection Review', 'Deposit Slip', 'Bad Debt Proposal'])
      ],
      [featureGroup('Receivable Setup', ['Customer Setup', 'Collection Rule Setup', 'Credit Term Setup'])],
      [featureGroup('Receivable Reports', ['Customer Ledger', 'Aging Receivable', 'Collection Register', 'Outstanding Bill'])]
    ),
    buildModule('Budget & Cost Control', [
      featureGroup('Budget Operation', [
        'Budget Create',
        'Budget Revision',
        'Budget Approval',
        'Budget Transfer',
        'Budget Utilization'
      ]),
      featureGroup('Cost Center Control', [
        'Cost Center Allocation',
        'Expense Review',
        'Variance Analysis',
        'Commitment Tracking'
      ])
    ]),
    buildModule('Treasury Management', [
      featureGroup('Cash & Bank', [
        'Bank Account Setup',
        'Bank Reconciliation',
        'Cash Forecast',
        'Fund Transfer',
        'Liquidity Position'
      ]),
      featureGroup('Investment & Borrowing', [
        'Investment Register',
        'Maturity Review',
        'Borrowing Register',
        'Interest Accrual'
      ])
    ])
  ]),
  moduleGroup('Administration', '⚙️', [
    buildModule('System Administration', [
      featureGroup('User Administration', ['User Create', 'User Search', 'User Update', 'Deactivate User', 'Password Reset']),
      featureGroup('Role Administration', ['Role Create', 'Role Search', 'Permission Matrix', 'Role Assignment'])
    ]),
    buildModule('Tenant Administration', [
      featureGroup('Tenant Management', ['Tenant Create', 'Tenant Search', 'Tenant Settings', 'Tenant Status']),
      featureGroup('Branch Management', ['Branch Create', 'Branch Search', 'Branch Update', 'Branch Status'])
    ]),
    buildModule(
      'Human Resource Management',
      [
        featureGroup('Employee Management', [
          'Employee Onboarding',
          'Employee Search',
          'Employee Profile',
          'Employment Status',
          'Employee Transfer'
        ]),
        featureGroup('Attendance & Leave', [
          'Attendance Entry',
          'Attendance Review',
          'Leave Application',
          'Leave Approval',
          'Roster Management'
        ])
      ],
      [featureGroup('HR Setup', ['Department Setup', 'Designation Setup', 'Leave Type Setup', 'Shift Setup', 'Holiday Calendar'])],
      [featureGroup('HR Reports', ['Employee Register', 'Attendance Summary', 'Leave Balance', 'Headcount Report'])]
    ),
    buildModule(
      'Payroll Management',
      [
        featureGroup('Payroll Processing', [
          'Salary Structure',
          'Payroll Run',
          'Payroll Review',
          'Payroll Approval',
          'Salary Disbursement'
        ]),
        featureGroup('Payroll Adjustment', [
          'Allowance Entry',
          'Deduction Entry',
          'Overtime Calculation',
          'Bonus Processing',
          'Tax Adjustment'
        ])
      ],
      [featureGroup('Payroll Setup', ['Pay Grade Setup', 'Allowance Setup', 'Deduction Setup', 'Tax Slab Setup', 'Bank Advice Setup'])],
      [featureGroup('Payroll Reports', ['Payslip', 'Salary Register', 'Tax Statement', 'Payroll Summary'])]
    ),
    buildModule(
      'Fixed Asset Management',
      [
        featureGroup('Asset Lifecycle', [
          'Asset Registration',
          'Asset Search',
          'Asset Transfer',
          'Asset Maintenance',
          'Asset Disposal'
        ]),
        featureGroup('Asset Accounting', [
          'Asset Capitalization',
          'Depreciation Run',
          'Depreciation Review',
          'Asset Revaluation'
        ])
      ],
      [featureGroup('Asset Setup', ['Asset Category Setup', 'Location Setup', 'Depreciation Method', 'Custodian Setup'])],
      [featureGroup('Asset Reports', ['Asset Register', 'Depreciation Schedule', 'Asset Movement', 'Disposal Register'])]
    )
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

// ---------------------------------------------------------------------------
// Header content — ported verbatim from header.component.ts's SSO_APPS/
// tenants/languages/SEARCH_TYPES constants.
// ---------------------------------------------------------------------------

const header = {
  searchTypes: ['Customer Name', 'National ID', 'Passport', 'Phone', 'Case Number', 'T Code'],
  apps: [
    { name: 'Case Management', icon: 'folder' },
    { name: 'Document Vault', icon: 'document' },
    { name: 'Risk Analytics', icon: 'bar-chart' },
    { name: 'HR Portal', icon: 'users' },
    { name: 'Loan Origination', icon: 'percent' },
    { name: 'Audit Console', icon: 'search' },
    { name: 'Reporting Suite', icon: 'trend' },
    { name: 'Admin Portal', icon: 'gear' },
    { name: 'Helpdesk', icon: 'help' }
  ],
  tenants: ['Prime Bank Ltd.', 'Northgate Finance', 'Meridian Trust Co.'],
  languages: [
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ar', label: 'العربية' }
  ]
};

// ---------------------------------------------------------------------------
// Status bar content — ported from the static left/right group markup in
// status-bar.component.html (the mid group stays code-driven: T-code/
// favorite vs. last-synced, since that's live session state, not config).
// ---------------------------------------------------------------------------

const statusBar = {
  systemStatusLabel: 'System Operational',
  envLabel: 'Production',
  version: 'v2.4.1'
};

// ---------------------------------------------------------------------------
// Theme primaries — ported verbatim from _tokens.scss's per-theme $text/
// $paper/$card/$accent/$amber/$red/$success/$info primaries. chromeOverrides
// carries the bespoke literal chrome-* values that don't fit the standard
// derivation formula (Navy's distinct blue-black chrome family); everything
// not listed there is computed at runtime by color-math.ts's
// computeThemeTokens(), matching what _tokens.scss's mixing functions compute
// for each theme today.
// ---------------------------------------------------------------------------

const themes = [
  {
    id: 'light',
    label: 'Light',
    base: 'light',
    swatch: 'sun',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'dark',
    label: 'Dark',
    base: 'dark',
    swatch: 'moon',
    primaries: { text: '#e7ebef', paper: '#0d1218', card: '#161d26', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'blue',
    label: 'Blue Enterprise',
    base: 'light',
    swatch: '#2c5aa0',
    // Accent-only variant: every neutral is inherited from Light untouched, only the hue changes.
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#2c5aa0', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'green',
    label: 'Green Compliance',
    base: 'light',
    swatch: '#1c7a4c',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1c7a4c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'purple',
    label: 'Purple Corporate',
    base: 'light',
    swatch: '#6b3fa0',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#6b3fa0', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'gray',
    label: 'Gray Professional',
    base: 'light',
    swatch: '#3f4a54',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#3f4a54', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'navy',
    label: 'Navy Banking',
    base: 'dark',
    swatch: '#0b1a33',
    primaries: { text: '#e9edf3', paper: '#0b1420', card: '#101d30', accent: '#c99a3b', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' },
    chromeOverrides: {
      accentSoft: '#2e2510',
      bg: '#0b1a33',
      border: '#1c2f4d',
      borderStrong: '#081527',
      hoverBg: '#142848',
      activeBg: '#142848',
      searchBg: '#0f2140',
      searchBorder: '#1c2f4d',
      searchText: '#ffffff',
      searchPlaceholder: '#7488a8'
    }
  }
];

// ---------------------------------------------------------------------------
// Size primitives + fixed chrome dimensions — ported from _tokens.scss's
// $space-unit/$radius-base/$font-size-base and --header-height/--statusbar-height.
// ---------------------------------------------------------------------------

const sizes = {
  spaceUnit: 2,
  radiusBase: 8,
  fontSizeBase: 13.5,
  headerHeight: 58,
  statusBarHeight: 28,
  // Left nav (RailNavComponent) width — ported from the local $rail-width-expanded
  // SCSS variable/var(--space-32) that used to live only in rail-nav.component.scss.
  railWidthCollapsed: 64,
  railWidthExpanded: 230
};

const config = { navTree: NAVIGATION_TREE, header, statusBar, themes, sizes };

const outPath = join(__dirname, '..', 'src', 'assets', 'config', 'layout-config.json');
writeFileSync(outPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`navTree: ${NAVIGATION_TREE.length} module groups`);
