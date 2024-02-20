let http = require("http");
let express = require("express");
let app = express();

app.use(express.static("public"));
app.use(express.bodyParser());
app.use(app.router)

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const mypw = "madang"  // set mypw to the hr schema password

async function connections(){
    const conn = await oracledb.getConnection({
        user:"c##madang",
        password:mypw,
        connectionString:"localhost:1521/xe"
    });
    return await conn
}

async function listBook() {
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

async function getNextBookID(){
    const connection = await connections();

    const result = await connection.execute(
        `SELECT nvl(max(bookid),0)+1 BOOKID from book`
    );
    await connection.close();
    return await result.rows[0].BOOKID
}

async function insert(req) {
    const connection = await connections();

    const result = await connection.execute(
        `insert into BOOK(BOOKID,BOOKNAME,PRICE,PUBLISHER) values(:bookid,:bookname,:price,:publisher)`, req.body
    );
    await connection.commit();
    await connection.close();
    return result.rowsAffected;
}

async function update(req){
    const connection = await connections();
    const result = await connection.execute(
        `update book set bookname= :bookname, price= :price, publisher= :publisher where bookid = :bookid`,req.body
    );
    await connection.commit();
    await connection.close();
    return result.rowsAffected;
}

async function del(bookid){
    const conn = await connections();
    const result = await conn.execute(`delete book where bookid=:bookid`,bookid);
    await conn.commit();
    await conn.close();
    return result.rowsAffected;
}


app.get("/listBook", async function (req, res) {
    let arr = await listBook();
    res.send(arr)
})

app.post("/insert", function (req, res) {
    var re = insert(req);
    res.send(re)
})

app.post("/update", function(req,res){
    var re = update(req)
    res.send(re)
})

app.post("/delete", function(req,res){
    var re = del(req.body)
    res.send(re)
})

http.createServer(app).listen(52273, "192.168.0.57", function () {
    console.log("서버 가동됨")
})