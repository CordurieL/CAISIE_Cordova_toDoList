export class Todo {
  constructor(id, title, date, done = false) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.done = done;
  }
}
