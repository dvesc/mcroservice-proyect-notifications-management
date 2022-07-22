import * as nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST, //establemcemos el tipo de envio
  port: 587, //no se por que es este puerto en especifico
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});


export const send_email = (
  email:string, 
  html:string, 
subject:string):void => {
  const  mailDetails = {
    from: 'libreriaghandiapi@gmail.com', //Nosotros, correo emisor
    to: email, //El correro destinatario
    subject: subject, //Titulo del email
    html: html
  }

  //Enviamos el email
  transporter.sendMail(mailDetails, function(err,data){
    if(err) console.log('Nodemailer Error!');
    else console.log('Email sent successfully');
  });
}

