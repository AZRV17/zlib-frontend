export class Review {
    constructor(id, message, book_id, rating, user, createdAt) {
        this.id = id
        this.message = message
        this.book_id = book_id
        this.rating = rating
        this.user = user
        this.createdAt = createdAt
    }

    static fromJson(json) {
        return new Review(
            json.id,
            json.message,
            json.book_id,
            json.rating,
            json.user,
            json.createdAt
        )
    }
}