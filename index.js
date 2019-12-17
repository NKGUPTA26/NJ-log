// Module imports
var express = require('express');
const bp = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const notifier = require('node-notifier');
const PORT = process.env.PORT || 8000;

console.log(`PORT PORT ---> ${PORT}`)

var client = mysql.createConnection({
    host : 'us-cdbr-iron-east-05.cleardb.net',
    user : 'b13db25aed92fd',
    password : '56505be9',
    database : 'heroku_2241285cf37f761'
});

const app = express();

app.use(bp.json());
app.use(express.static("public"));
app.use(bp.urlencoded({
    extended:true
}));

//Home page redirection
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get("/subscribe", (req, res) => {
    notifier.notify('Message');
    notifier.notify({
        title: 'My notification',
        message: 'Hello, there!'
    });
});

// List down available courses
app.post('/show_courses', (req, res) => {
    client.connect((err) => {
        if(err)
        {
            console.log(err);
            return;
        }
        var qr = "select cname from courses";
        client.query(qr, (e, result) => {
            if(e)
            {
                console.log(e);
                return;
            }
            
            res.writeHead(200,{'Content-Type':'text/html'});
            res.write("<html>");
            res.write("<body>");
            res.write("<table>");
            for(var i = 0; i < result.length; i++)
            {
                res.write("<tr>");
                    res.write("<td>");
                        res.write(result[i].cname);
                    res.write("</td>");
                    res.write("<td>");
                        res.write("<a href='/subscribe?cid="+result[i].cid+"'>Subscribe</a>");
                    res.write("</td>");
                res.write("</tr>");
            }
        res.write("</table>");
        res.write("</body>");
        res.write("</html>");
        res.end();
        });
    });
});


// Register user
app.post("/register", (req, res) => {
    var qr = "insert into users values(?)";
    tmp = [req.body.id, req.body.name, req.body.contact, req.body.email, req.body.pwd];
    client.connect((err) => {
        if(err)
        {
            console.log(err);
            return
        }
        client.query(qr, [tmp], (error, result) => {
            if(error)
            {
                console.log(error);
                return;
            }
            console.log("user entered...");
        });
    });
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

//Login handling
app.post("/login", (req, res) => {
    var id = req.body.id;
    var pwd = req.body.pwd;
    client.connect(function(err){
        if(err)
        {
            console.log(err);
        }
        const qr = 'select * from users where id = ? and pwd = ?';
        client.query(qr, [id, pwd], function(err, result){
            if(err)
            {
                console.log(err);
                res.sendFile(path.join(__dirname+'/Login.html'));
                res.end();
            }
            else if(result.length > 0)
            {
                res.sendFile(path.join(__dirname+'/user.html'));
            }
            else
            {
                res.send("invalid id or password... Please try again");
            }
        });
    });
});

// Display courses active for a user
app.post('/allot_courses', (req, res) => {
    client.connect((err) => {
        if(err)
        {
            console.log(err);
            return;
        }
        var qr = "select cname from allot,courses where allot.cid = courses.cid and id = ?";
        client.query(qr, [req.body.id], (e, result) => {
            if(e)
            {
                console.log(e);
                return;
            }
            
            res.writeHead(200,{'Content-Type':'text/html'});
            res.write("<html>");
            res.write("<body>");
            res.write("<table>");
            for(var i = 0; i < result.length; i++)
            {
                res.write("<tr>");
                    res.write("<td>");
                        res.write(result[i].cname);
                    res.write("</td>");
                res.write("</tr>");
            }
        res.write("</table>");
        res.write("</body>");
        res.write("</html>");
        res.end();
        });
    });
});

app.listen(PORT,()=>{
    console.log(`Listening on port : ${PORT}`);
});