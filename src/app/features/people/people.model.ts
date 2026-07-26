export type Gender = 'Male' | 'Female' | 'Other';
export type Education = 'High School' | "Bachelor's" | "Master's" | 'Doctorate' | 'Other';

export interface Person {
  id: number;
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: Gender;
  education: Education;
}

export type PersonDraft = Omit<Person, 'id'>;

export const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];
export const EDUCATION_OPTIONS: Education[] = ['High School', "Bachelor's", "Master's", 'Doctorate', 'Other'];

export const EMPTY_DRAFT: PersonDraft = {
  photoUrl: null,
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: 'Male',
  education: "Bachelor's"
};
