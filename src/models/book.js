export class Book {
    constructor(id, title, author, genre, publisher, isbn, year_of_publication, description, picture, rating, unique_codes) {
        this.id = id
        this.title = title
        this.author = author
        this.description = description
        this.genre = genre
        this.publisher = publisher
        this.isbn = isbn
        this.year_of_publication = year_of_publication
        this.picture = picture
        this.rating = rating
        this.unique_codes = unique_codes
    }

    static fromJson(json) {
        return new Book(
            json.id,
            json.title,
            json.author,
            json.genre,
            json.publisher,
            json.isbn,
            json.year_of_publication,
            json.description,
            json.picture,
            json.rating,
            json.unique_codes
        )
    }
}