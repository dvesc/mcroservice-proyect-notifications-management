import express from "express"
import * as dotenv from "dotenv"
import { init_rabbitmq } from "./utils/Rabbitmq";
import { consume_msg } from "./utils/sqs";

const init_app = ()=>{
  dotenv.config();
  const app = express();

  //---------------------------------------------------------------------------
  app.listen(process.env.PORT, ()=> console.log("Running in port 7000"));

  consume_msg()
  init_rabbitmq();



}

init_app();