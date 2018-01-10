export interface MemberInterface {
  firstName: string,
  lastName: string,
  middleName?: string,
  party?: string,
  elected?: Date,
  finished?: Date | Present | string,
  profession?: string,
  riding?: string,
  weight?: number,
}

export interface CommitteeInterface {
    key: string,
    session: string,
    date: Date,
    enddate: Date | Present,
    partyInPower?: string,
    name: string,
    abbreviation: string,
    country?: string,
    jurisdiction?: string,
    description?: string,
    notes?: string,
    membership: Member[],
    tags?: string[],
    weight?: number
  }

  export class Present {
    display = "present";
    date = new Date();
    getDate = this.date.getFullYear() + "-" + (this.date.getMonth()<10?'0':'') + (this.date.getMonth() + 1) + "-" + (this.date.getDate()<10?'0':'') + this.date.getDate();
    }

export class Member implements MemberInterface {
    firstName: string;
    lastName: string;
    middleName: string;
    party: string;
    elected: Date;
    finished: Date | Present | string;
    profession: string;
    riding: string;
    displayName: string;
    weight: number;
    constructor (
      firstName: string,
      lastName: string,
      middleName?: string,
      party?: string,
      elected?: Date,
      finished?: Date | Present | "present",
      profession?: string,
      riding?: string,
      weight?: number,
    ) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.middleName = middleName;
      this.party = party;
      this.elected = elected;
      if (finished == null) {
        this.finished = new Present().display;
      }
      else {
        this.finished = <Date>finished;
      }
      this.profession = profession;
      this.riding = riding;
      let middle = middleName ? middleName[0] : "";
      this.displayName = lastName + ", " + firstName[0] + middle;
      this.weight = weight ? weight : 0;
    }
  }

export class Committee implements CommitteeInterface {
  session: string;
  date:Date;
  enddate: Date | Present;
  name: string;
  abbreviation: string;
  membership: Member[];
  partyInPower: string;
  country: string;
  jurisdiction: string;
  description: string;
  notes: string;
  tags: string[];
  key: string;


  constructor (
    key: string,
    session: string,
    date: Date,
    enddate: Date | Present,
    name: string,
    abbreviation: string,
    membership: Member[],
    partyInPower?: string,
    country?: string,
    jurisdiction?: string,
    description?: string,
    notes?: string,
    tags?:string[]
  ) {
    this.key = key;
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
    this.tags = tags;
  }
}
