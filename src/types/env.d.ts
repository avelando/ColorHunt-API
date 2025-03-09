declare namespace NodeJS {
  interface ProcessEnv {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_API_KEY: string;
    JWT_SECRET: string;
    PORT: number;
  }
}
