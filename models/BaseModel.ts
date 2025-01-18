import { Pool } from 'pg';

export class BaseModel {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
}
