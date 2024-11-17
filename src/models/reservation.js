export class Reservation {
    constructor(id, user, book, date_of_issue, date_of_return, status, unique_code) {
        this.id = id;
        this.user = user;
        this.book = book
        this.date_of_issue = date_of_issue
        this.date_of_return = date_of_return
        this.status = status
        this.unique_code = unique_code
    }

    static fromJson(json) {
        return new Reservation(
            json.id,
            json.user,
            json.book,
            json.date_of_issue,
            json.date_of_return,
            json.status,
            json.unique_code
        );
    }
}