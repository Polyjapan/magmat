
export class UserDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export class UserProfile {
  id: number;
  email: string;
  details: UserDetails;
  staffNumber?: number;
}
