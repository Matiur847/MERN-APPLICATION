const nodemailer = require('nodemailer')
const { smptService, smptMail, smptPassword } = require('../config/config')

const sendEmail = async (options) => {

    // console.log('SendMail function is called', options)

    const transporter = nodemailer.createTransport({
        service: smptService,
        auth: {
            user: smptMail,
            pass: smptPassword
        }
    })

    const mailOption = {
        from: smptMail,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOption)

}

module.exports = sendEmail;