export class User {
    constructor(id, login, full_name, password, email, role, phone_number, passport_number) {
        this.id = id
        this.login = login
        this.full_name = full_name
        this.password = password
        this.email = email
        this.role = role
        this.phone_number = phone_number
        this.passport_number = passport_number
    }

    static fromJson(user) {
        return new User(
            user.id,
            user.login,
            user.full_name,
            user.password,
            user.email,
            user.role,
            user.phone_number,
            user.passport_number
        )
    }
}