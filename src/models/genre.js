export class Genre {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    static fromJson(json) {
        return new Genre(
            json.id,
            json.name,
            json.description
        )
    }
}