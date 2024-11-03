// types.tsx
export interface PaymentMethod {
    id: number;
    payment_method: string;
}

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