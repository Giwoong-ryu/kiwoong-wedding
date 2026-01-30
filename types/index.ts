export interface WeddingInfo {
  date: string;
  time: string;
  venue: string;
  address: string;
  floor?: string;
}

export interface AccountInfo {
  bank: string;
  account: string;
  holder: string;
}

export interface BankAccounts {
  groom: AccountInfo;
  bride: AccountInfo;
}

export type AttendingStatus = 'yes' | 'no';

export interface RSVPFormData {
  name: string;
  attending: AttendingStatus;
  guestCount: number;
  message?: string;
}
