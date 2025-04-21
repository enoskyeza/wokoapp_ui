// types.tsx
export interface PaymentMethod {
    id: number;
    payment_method: string;
}

//   export interface Participant {
//     id: number;
//     created_at: string;
//     identifier: string;
//     first_name: string;
//     last_name: string;
//     email: string;
//     age: number;
//     gender: "M" | "F";
//     school: string;
//     payment_status: "paid" | "not_paid";
//     payment_method: PaymentMethod;
//     parent: number;
//     parent_name: number;
//     age_category: "junior" |"intermediate"| "senior";
//     scores: Score[],
// }

export interface Participant {
    id: number;
    created_at: string;
    identifier: string;
    first_name: string;
    last_name: string;
    email: string;
    age: number;
    gender: "M" | "F";
    school: string;
    payment_status: "paid" | "not_paid";
    payment_method: PaymentMethod;
    parent: number;
    parent_name: number;
    age_category: "junior" |"intermediate"| "senior";
    has_scores: boolean
    scores: Score[],
}

export interface FormParticipant {
    first_name: string;
    last_name: string;
    email: string;
    age: number;
    gender: 'M' | 'F';
    school: string;
}

export interface Parent {
    id: number;
    'first_name': string;
    'last_name': string;
    'profession': string;
    'address': string;
    'email': string;
    'phone_number': string;
    contestants: Participant[]
}

export interface Category {
  id: number;
  name: string;
}

export interface Criteria {
  id: number;
  name: string;
  category: Category;
}

export interface Score {
  id: number;
  judge: number;
  contestant: number;
  criteria: Criteria;
  score: string;
}

export interface ScoreViewOnly {
  id: number;
  judge: number;
  contestant: number;
  criteria: number;
  score: string;
}

  export interface Comment {
    id: number;
    judge: number;
    judge_name: string;
    contestant: number;
    contestant_full_name: string;
    comment: string;
  }

  export interface ParticipantDetails {
    id: number;
    first_name: string;
    last_name: string;
    identifier: string;
    age: number;
    gender: string;
    scores: Score[];
    comments: Comment[];
  }


// RESULTS TYPES
// Represents a single score given by a judge
export interface JudgeScore {
  judge_name: string; // The username of the judge
  score: number; // The score given by the judge
}

// Represents scores and averages for a single criterion
export interface CriteriaScores {
  judge_scores: JudgeScore[]; // Array of scores by individual judges for this criterion
  average: number; // Average score for this criterion
}

// Represents totals for a category
export interface CategoryTotals {
  judges: { [judge_name: string]: number }; // Total scores per judge for this category
  average: number; // Average score across all criteria in this category
}

// Represents a single category's data, including its criteria and totals
export interface ResultCategory {
  criteria: {
    [criteriaName: string]: CriteriaScores; // Criteria name as key, with its scores and average
  };
  totals: CategoryTotals; // Totals for the category
}

// Represents a contestant's full data, including scores and personal details
export interface Contestant {
  name: string; // Full name of the contestant
  identifier: string; // Unique identifier for the contestant
  age: number; // Age of the contestant
  age_category: string; // Age category of the contestant
  gender: string; // Gender of the contestant
  categories: {
    [categoryName: string]: ResultCategory; // Category name as key, with criteria and totals
  };
  overall_total: number; // Sum of averages of all categories for the contestant
}

// Represents the structure for paginated API responses
export interface PaginatedResults {
  count: number; // Total number of contestants
  next: string | null; // URL for the next page of results
  previous: string | null; // URL for the previous page of results
  results: Contestant[]; // Array of contestant data
}

export interface School {
  id: number;
  name: string;
  address?: string;
  email?: string;
  phone_number?: string;
  created_at: string;  // ISO date string
  updated_at: string;
}

export interface Guardian {
  id: number;
  first_name: string;
  last_name: string;
  profession?: string;
  address?: string;
  email?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface NewParticipant {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  date_of_birth: string;  // ISO date string
  gender: 'M' | 'F';
  current_school?: number;
  guardians?: Guardian[];
  created_at: string;
  updated_at: string;
}

export interface ParticipantGuardian {
  id: number;
  participant: NewParticipant;
  guardian: number;
  relationship: 'mother' | 'father' | 'aunt' | 'uncle' | 'other';
  isPrimary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramType {
  id: number;
  name: string;
  description?: string;
  form_key: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  type?: ProgramType;
  year?: number;
  name: string;
  description?: string;
  start_date?: string;  // ISO date string
  end_date?: string;
  registration_fee?: number;
  age_min?: number;
  age_max?: number;
  capacity?: number;
  requires_ticket: boolean;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  participant: number;
  program: number;
  age_at_registration: number;
  school_at_registration?: number;
  guardian_at_registration?: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: number;
  registration: number;
  issued_by: number;
  amount: number;
  status: 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  registration: number;
  qrCodeUrl?: string;
  status: 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: number;
  registrationId: number;
  status: 'paid' | 'cancelled' | 'refunded';
  created_by: number;
  receipt?: Receipt;
  coupon?: Coupon;
  created_at: string;
  updated_at: string;
}

export interface SentMessage {
  id: number
  to: string
  body: string
  dateSent: string
}
