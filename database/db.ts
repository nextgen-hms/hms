import {Pool} from 'pg';

 const pool=new Pool(
    {
      user:'postgres',
      host:'localhost',
      database:'hms',
      password:'123',
      port:5432,
    }
);



export const query=(text:string,params?:any[])=>{
    return pool.query(text,params);
}
export default pool;