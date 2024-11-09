import * as Joi from "joi";
import { ConfigModuleOptions } from "@nestjs/config";

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(1), // 0 === production & 1 === development
    PROJECT_NAME: Joi.string().required(),
    SIGNER_KEY: Joi.string().required(),
  }),
};
