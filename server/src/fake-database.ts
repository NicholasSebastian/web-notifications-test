export type WithId<T> = T & { id: number };

export default class Database<T> {
  private data: Array<WithId<T>>;
  public constructor() {
    this.data = [];
  }
  public async selectAll() {
    return this.data;
  }
  public async insert(item: T) {
    const id = this.data.length;
    this.data.push({ ...item, id });
    return id;
  }
  public async delete(id: number) {
    this.data.splice(id, 1);
    return id;
  }
}
