const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const mypw = "madang"  // set mypw to the hr schema password

let connections = async () => {
    const conn = await oracledb.getConnection({
        user:"c##madang",
        password:mypw,
        connectionString:"localhost:1521/xe"
    });
    return await conn
}

 let listBook = async () => {
    const connection = await connections();

    const result = await connection.execute(
        `SELECT * from book order by bookid desc`
    );
    let data = result.rows;
    var nextNO = await getNextBookID();
    let arr = {
        data,
        nextNO
    }
    await connection.close();
    return arr;
}

let getNextBookID = async () => {
    const connection = await connections();

    const result = await connection.execute(
        `SELECT nvl(max(bookid),0)+1 BOOKID from book`
    );
    await connection.close();
    return await result.rows[0].BOOKID
}

let insert = async (req)=> {
    const connection = await connections();

    const result = await connection.execute(
        `insert into BOOK(BOOKID,BOOKNAME,PRICE,PUBLISHER) values(:bookid,:bookname,:price,:publisher)`, req.body
    );
    await connection.commit();
    await connection.close();
    return result.rowsAffected;
}

let update = async (req) =>{
    const connection = await connections();
    const result = await connection.execute(
        `update book set bookname= :bookname, price= :price, publisher= :publisher where bookid = :bookid`,req.body
    );
    await connection.commit();
    await connection.close();
    return result.rowsAffected;
}

let del = async (bookid) => {
    const conn = await connections();
    const result = await conn.execute(`delete book where bookid=:bookid`,bookid);
    await conn.commit();
    await conn.close();
    return result.rowsAffected;
}

module.exports={listBook,insert,update,del}