import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Uni Portal 360 API',
      version: '1.0.0',
      description: 'API documentation for Uni Portal 360 backend',
    },
  },
  apis: ['./src/modules/**/*.route.ts', './src/modules/**/*.controller.ts', './src/modules/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;

