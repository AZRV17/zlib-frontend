export class Publisher {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static fromJson(json) {
        return new Publisher(
            json.id,
            json.name
        )
    }
}