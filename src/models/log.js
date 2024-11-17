export class Log {
    constructor(id, user_id, user, action, details, date) {
        this.id = id;
        this.user_id = user_id
        this.user = user
        this.action = action
        this.details = details
        this.date = date
    }

    static fromJson(json) {
        return new Log(
            json.id,
            json.user_id,
            json.user,
            json.action,
            json.details,
            json.date
        )
    }
}