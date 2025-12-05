// swagger.js
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API Documentation",
      version: "1.0.0",
      description: "API tài khoản người dùng (register, login, refresh token, logout, getMe)"
    },
    servers: [
      { url: process.env.API_URL }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string" },
            password: { type: "string", minLength: 6 },
            name: { type: "string" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            errorcode: { type: "string" }
          }
        }
      }
    }
  },

  apis: ["./src/routes/*.js"], // Đọc JSDoc từ route
};

const swaggerSpec = swaggerJsDoc(options);

export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger Docs: http://localhost:3001/api-docs");
};
