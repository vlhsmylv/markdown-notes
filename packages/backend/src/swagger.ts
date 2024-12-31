import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "API documentation for the Notes application",
    },
    servers: [
      {
        url: "http://127.0.0.1:4500",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
