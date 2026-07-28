export type KycEntityType = 'individual' | 'business';
export type KycStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'escalated';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface KycIndividualDetails {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  nationality: string;
}

export interface KycBusinessDetails {
  businessName: string;
  registrationNumber: string;
  tradeLicenseNumber: string;
  ownerName: string;
}

export interface KycDocument {
  id: number;
  type: string;
  fileName: string;
  url: string;
  mimeType: string;
  uploadedAt: string;
}

export interface KycActivityEntry {
  id: number;
  label: string;
  actor: string;
  timestamp: string;
}

export interface KycCase {
  id: number;
  entityType: KycEntityType;
  individual: KycIndividualDetails | null;
  business: KycBusinessDetails | null;
  email: string;
  mobile: string;
  address: string;
  riskLevel: RiskLevel;
  status: KycStatus;
  documents: KycDocument[];
  activity: KycActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

export type KycCaseDraft = Pick<
  KycCase,
  'entityType' | 'individual' | 'business' | 'email' | 'mobile' | 'address' | 'riskLevel'
>;

export const RISK_LEVEL_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const ENTITY_TYPE_OPTIONS: { value: KycEntityType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' }
];

export const EMPTY_INDIVIDUAL_DETAILS: KycIndividualDetails = {
  fullName: '',
  nationalId: '',
  dateOfBirth: '',
  nationality: ''
};

export const EMPTY_BUSINESS_DETAILS: KycBusinessDetails = {
  businessName: '',
  registrationNumber: '',
  tradeLicenseNumber: '',
  ownerName: ''
};

export const EMPTY_DRAFT: KycCaseDraft = {
  entityType: 'individual',
  individual: { ...EMPTY_INDIVIDUAL_DETAILS },
  business: null,
  email: '',
  mobile: '',
  address: '',
  riskLevel: 'low'
};

export function displayName(c: Pick<KycCase, 'entityType' | 'individual' | 'business'>): string {
  return c.entityType === 'individual' ? (c.individual?.fullName ?? '') : (c.business?.businessName ?? '');
}
