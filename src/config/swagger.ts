import { OAS3Options } from "swagger-jsdoc";

const definition = {
  openapi: "3.0.0",
  info: {
    title: "ColorHunt API",
    version: "1.0.0",
    description: "API para gerenciamento de paletas e usuários",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Servidor local",
    },
    {
      url: "https://colorhunt-api-1br0.onrender.com",
      description: "Servidor remoto (Render)"
    }
  ],
};

export const swaggerOptions: OAS3Options = {
  definition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};
