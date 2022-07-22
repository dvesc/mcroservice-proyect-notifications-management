import amqp from "amqplib/callback_api"; //nos permitira reconectar
import { send_email } from "./nodemailer";
let amqp_conn: amqp.Connection, publisher_channel: amqp.Channel;

//CONECTARSE A RABBITMQ--------------------------------------------------------
export const init_rabbitmq = () => {
  //establecemos conexion con el contenedor de rabbit
  amqp.connect("amqp://localhost", (err: Error, conn: amqp.Connection) => {
    //si existe un error intentaremos la reconecion con recursividad
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(init_rabbitmq, 1000);
    }
    //on establece listener cuando ocurren errores
    conn.on("error", (err) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] connection error:", err.message);
      }
    });
    //cuando se pierde la coneccion intenta conectar nuevamente
    conn.on("close", () => {
      console.error("[AMQP] reconnecting...");
      return setTimeout(init_rabbitmq, 1000);
    });

    console.log("[AMQP] connected");
    amqp_conn = conn;
    //Luego de establecer coneccion creamos el channel 
    create_publisher_channel();
  });
};
//-----------------------------------------------------------------------------
const close_for_err = (err: Error) => {
  if (!err) return false;
  console.error("[AMQP] error: ", err);
  amqp_conn.close();
  return true;
};
//ESTABLECER UN CANAL----------------------------------------------------------
const create_publisher_channel = async (): Promise<void> => {
  amqp_conn.createConfirmChannel((err, ch) => {
    if (close_for_err(err)) return;
    ch.on("error", (err) => {
      console.error("[AMQP] channel error:", err.message);
    });
    ch.on("close", () => {
      console.log("[AMQP] publisher channel closed");
    });
    publisher_channel = ch;
    
    //Ejecutamos los "consumidores"
    consumer(publisher_channel);
  });
};

//CONSUMIR COLAS---------------------------------------------------------------
const consumer = (channel:amqp.Channel )=>{
  const exchange = "user_notifications"; //compruaba existencia del exchange
  channel.assertExchange(exchange, "topic", { durable: true });
 
  //Una cola.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
  const email_msg = "email_msg"; 
  channel.assertQueue(email_msg, { durable: true }); //comprueba que exista
  channel.bindQueue(email_msg, exchange,"email.*"); //vincula la cola al exchange

  channel.consume(
    email_msg, 
    function (msg) {
      console.log('Consuming msg from queue "forgotten_password"');
      setTimeout(function(){
        //Aqui obtenemos ya el mensaje
        const string_msg: string = msg!.content.toString(),
          obj_msg: any = JSON.parse(string_msg);

          
        send_email(
          obj_msg.email, 
          obj_msg.html,
          obj_msg.subject
        );

        
      },1000);
      },{ noAck: true }
  );
  
  //Otras colas.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

}




