export default interface Payload {
  id: string,
  url: string,
  created: number,
  title: string,
  body: string,
};

export type DbEntry = Omit<Payload, 'id'>;
export interface DbEntries {
  [key: string]: DbEntry
}
