export interface MemberInterface {
  firstName: string,
  lastName: string,
  middleName?: string,
  party?: string,
  elected?: Date,
  cabinet?: string,
  riding?: string
}

export interface CommitteeInterface {
    date: Date,
    partyInPower?: string,
    name: string,
    abbreviation: string,
    country?: string,
    jurisdiction?: string,
    description?: string,
    notes?: string,
    membership: Member[]
  }

export class Member implements MemberInterface {
    firstName: string;
    lastName: string;
    middleName: string;
    party: string;
    elected: Date;
    cabinet: string;
    riding: string;
    displayName: string;
    constructor (
      firstName: string,
      lastName: string,
      middleName?: string,
      party?: string,
      elected?: Date,
      cabinet?: string,
      riding?: string,
    ) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.middleName = middleName;
      this.party = party;
      this.elected = elected;
      this.cabinet = cabinet;
      this.riding = riding;
      this.displayName = lastName + ", " + firstName[0] + middleName[0]
    }
  }

export class Committee implements CommitteeInterface {
  date:Date;
  partyInPower: string;
  name: string;
  abbreviation: string;
  country: string;
  jurisdiction: string;
  description: string;
  notes: string;
  membership: Member[];

  constructor (
    date: Date,
    partyInPower: string,
    name: string,
    abbreviation: string,
    country: string,
    jurisdiction: string,
    membership: Member[]

  ) {
    this.date = date;
    this.partyInPower = partyInPower;
    this.name = name;
    this.abbreviation = abbreviation;
    this.country = country;
    this.jurisdiction = jurisdiction;
    this.membership = membership;

  }
}
