var nodemailer = require('nodemailer');

exports.sendEmail = function(destiny, text,topic){

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: '',
            pass: ''
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    var mailOptions = {
        from: '',
        to: destiny,
        subject: topic,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
        }
    });
    
};