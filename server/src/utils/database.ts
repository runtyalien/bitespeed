// utils/database.js

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: "postgres://default:nqsh9toG5Kfr@ep-falling-bonus-a1u2t3qx-pooler.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
