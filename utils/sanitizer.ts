export default function sanitizer(type: "number" | "StaffFileId" | "name" | "discordId" | "timestamp" | "discordUser" | "date" | "link" | "bearer", ...args: string[]): void {
    let pass = true
    switch (type) {
        case "number":
            const numreg = new RegExp("^[0-9]+$", "gm")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(numreg)) pass = false
            }
            break;
        case "StaffFileId":
            const sfireg = new RegExp("^[0-9]{1,6}+$", "gm")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(sfireg)) pass = false
            }
            break;
        case "name":
            const namereg = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$", "gmu")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(namereg)) pass = false
            }
            break;
        case "discordId":
            const direg = new RegExp(/[0-9]{17,20}/, "gm")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(direg)) pass = false
            }
            break;
        case "timestamp":
            const tsreg = new RegExp(/[0-9]{10,13}/, "gm")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(tsreg)) pass = false
            }
            break;
        case "discordUser":
            const dureg = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+#[0-9]{4}$", "gmu")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(dureg)) pass = false
            }
            break;
        case "date":
            const datereg1 = new RegExp(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/)
            const datereg2 = new RegExp(/[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}/)
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(datereg1) && !args[i].match(datereg2)) pass = false
            }
            break;
        case "link":
            const linkreg = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, "gm")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(linkreg)) pass = false
            }
            break;
        case "bearer":
            const bearerreg = new RegExp(/^[a-zA-Z0-9-]+$/, "gmu")
            for (let i = 0; i < args.length; i++) {
                if (!args[i].match(bearerreg)) pass = false
            }
            break;
    }
    class SecurityError extends Error {
        constructor(message: string) {
            super(message)
            this.name = "SecurityError"
        }
    }

    if (!pass) {
        throw new SecurityError("Security: Input did not pass sanitization.")
    }
}