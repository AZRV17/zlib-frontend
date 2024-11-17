export class Author {
    constructor(id, name, lastname, biography, birthdate, books) {
        this.id = id
        this.name = name
        this.lastname = lastname
        this.biography = biography
        this.birthdate = birthdate
        this.books = books
    }

    static fromJson(json) {
        return new Author(
            json.id,
            json.name,
            json.lastname,
            json.biography,
            json.birthdate,
            json.books
        )
    }
}