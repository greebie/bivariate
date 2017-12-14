export interface MemberInterface {
  firstName: string,
  lastName: string,
  middleName?: string,
  party?: string,
  elected?: Date,
  finished?: Date,
  profession?: string,
  riding?: string
}

export interface CommitteeInterface {
    session: string,
    date: Date,
    enddate: Date,
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
    finished: Date;
    profession: string;
    riding: string;
    displayName: string;
    constructor (
      firstName: string,
      lastName: string,
      middleName?: string,
      party?: string,
      elected?: Date,
      finished?: Date,
      profession?: string,
      riding?: string,
    ) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.middleName = middleName;
      this.party = party;
      this.elected = elected;
      this.finished = finished;
      this.profession = profession;
      this.riding = riding;
      this.displayName = lastName + ", " + firstName[0] + middleName[0]
    }
  }

export class Committee implements CommitteeInterface {
  session: string;
  date:Date;
  enddate: Date;
  partyInPower: string;
  name: string;
  abbreviation: string;
  country: string;
  jurisdiction: string;
  description: string;
  notes: string;
  membership: Member[];

  constructor (
    session: string,
    date: Date,
    enddate: Date,
    partyInPower: string,
    name: string,
    abbreviation: string,
    country: string,
    jurisdiction: string,
    description: string,
    notes: string,
    membership: Member[]

  ) {
    this.session = session;
    this.date = date;
    this.enddate = enddate;
    this.partyInPower = partyInPower;
    this.name = name;
    this.abbreviation = abbreviation;
    this.country = country;
    this.jurisdiction = jurisdiction;
    this.description = description;
    this.membership = membership;
    this.notes = notes;

  }
}
