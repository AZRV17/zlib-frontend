export class UniqueCode {
    constructor(id, code, book, is_available) {
        this.id = id;
        this.code = code;
        this.book = book
        this.is_available = is_available
    }

    static fromJson(json) {
        return new UniqueCode(
            json.id,
            json.code,
            json.book,
            json.is_available
        );
    }
}