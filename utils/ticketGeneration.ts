/**
 * Generates a ticket email using Nodemailer's syntax.
 * @param text The message to send to the team.
 * @param author The author of the message.
 * @param category The category under which this ticket falls.
 * @param priority The priority of the issue.
 * @returns A Nodemailer mail options object.
 */

export default function ticketGeneration(text: string, author: string, category: string = "geninq", priority: number = 0, self?: boolean) {
    const frame = "------------------------------------------"
    let ctgText = ""
    switch (category) {
        case "bot":
            ctgText = "Bot Inquiry"
            break;
        case "database":
            ctgText = "Database Inquiry"
            break;
        case "bug-report":
            ctgText = "Bug Report"
            break;
        default:
            ctgText = "General Inquiry"
    }
    let subject = ""
    let pvalue
    if (!priority) pvalue = 0; else pvalue = priority
    if (priority && priority > 3) subject = `URGENT: ${ctgText} - ${author}`; else subject = `${ctgText} - ${author}`
    return {
from: `${process.env.USER}`,
to: `(${ !self ? `${process.env.REC1}, ${process.env.REC2}` : `${author}`})`,
subject: `${subject}`,
text: (`${!self ? `Hello,
A new Support Ticket has been opened at ${new Date()}. The details are attached:
${frame}
Category: ${ctgText}
Author: ${author}
Priority: ${pvalue}
Attached Message:
${text}
${frame}`: `Hello,

Your ticket has been received and processed by our staff team.
Your ticket reference number is 

For any inquiries related to your ticket, please make sure you have your ticket number ready to present. Unless otherwise directed, please do not message support staff.

Thank you,

HR Automations.
---------------

Your ticket details:

| Name on File: ${author}
| Category: ${ctgText}
| Priority: ${pvalue}

Ticket Comments:
${text}`}`)
    }
}