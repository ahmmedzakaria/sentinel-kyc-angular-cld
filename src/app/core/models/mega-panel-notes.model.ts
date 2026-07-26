/**
 * Descriptive blurb shown in the mega panel's context pane, keyed by
 * Module Group label. Ported from the source POC's `notes` lookup.
 */
export const MODULE_GROUP_NOTES: Record<string, string> = {
  Banking: 'Work through customer, account, loan, transaction, cheque, and remittance tasks from one operational surface.',
  Survey: 'Capture field information, verify boundaries or assets, and continue into GIS-backed survey workflows.',
  POS: 'Move quickly through sales, cash desk, inventory, settlement, and retail service actions.',
  'Health & Medical': 'Access patient, appointment, clinic, and pharmacy operations grouped for front-desk teams.',
  Education: 'Manage student, academic, attendance, fee, and guardian workflows from the selected category.',
  'E-Commerce': 'Review marketplace, catalog, order, fulfillment, and delivery actions in a single panel.',
  Administration: 'Configure users, tenants, branches, roles, and platform settings for controlled operations.',
  Security: 'Review access, sessions, privileges, devices, and audit activity for secure administration.',
  Reporting: 'Open operational, management, compliance, and analytics reports by business area.'
};

export const DEFAULT_MODULE_GROUP_NOTE =
  'Use these grouped actions to open the right workflow without leaving the current page context.';
