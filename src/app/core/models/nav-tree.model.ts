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

/*
 * The tree data itself (module groups → modules → categories → feature
 * groups → features) now lives in src/assets/config/layout-config.json's
 * `navTree`, loaded at runtime by LayoutConfigService — see AGENTS.md's
 * "Layout Config" section. This file only keeps the shared shape (NavNode)
 * and the icon-lookup functions below, which are presentation logic, not
 * data, and stay in code.
 *
 * That JSON is generated, not hand-written — scripts/generate-layout-config.mjs
 * ports the same builder functions (feature/featureGroup/categories/
 * buildModule/moduleGroup) that used to live here to plain JS. Re-run it and
 * commit the regenerated JSON when the tree needs to change; don't hand-edit
 * the generated navTree section.
 */

/** Level-2 (Module) icon, matched by keyword — ported from the source POC's moduleIcon(). */
export function moduleIcon(label: string): string {
  const key = label.toLowerCase();
  if (key.includes('banking')) return 'bank';
  if (key.includes('transaction monitoring') || key.includes('case management')) return 'clipboard';
  if (key.includes('regulatory') || key.includes('policy')) return 'document';
  if (key.includes('kyc') || key.includes('kyb') || key.includes('aml') || key.includes('diligence') || key.includes('compliance')) {
    return 'id-card';
  }
  if (key.includes('survey')) return 'compass';
  if (key.includes('pos')) return 'shop-front';
  if (key.includes('clinic') || key.includes('pharmacy')) return 'health';
  if (key.includes('student') || key.includes('fee')) return 'graduation-cap';
  if (key.includes('marketplace') || key.includes('delivery')) return 'cart';
  if (key.includes('ledger') || key.includes('payable') || key.includes('receivable') || key.includes('budget') || key.includes('treasury')) {
    return 'bank';
  }
  if (key.includes('human resource') || key.includes('employee')) return 'users';
  if (key.includes('payroll')) return 'percent';
  if (key.includes('fixed asset') || key.includes('asset')) return 'building';
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
