//Inicialización del servidor
const session = require('express-session');
const express = require('express');
const upload = require('express-fileupload');
const path = require('path');
const exec = require('child_process').exec;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const util = require('util');
var CronJob = require('cron').CronJob;
const validate = require("./validate");

const sharedsession = require("express-socket.io-session");

let cipher = require('./encrypt');
let mail = require('./mail');
let bd = require('./bd');
let regular = require('./regular');

let app = express();

var credentials = {
    ca: fs.readFileSync("./keys/ca.ca", 'utf8'),
    key: fs.readFileSync("./keys/key.key", 'utf8'), //la clave SSL, que es el primer archivo que generamos ;)
    cert: fs.readFileSync("./keys/certificate.crt", 'utf8') //el certificado
};

var http = require('http').createServer(app);
//var http = require('https').createServer(credentials,app);

var io = require('socket.io')(http);

app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json());

app.use(cookieParser());

app.use(upload());

var sessionMiddleware = session({
    secret: '{qp}gEtS$C2b!=3T',
    resave: true,
    saveUninitialized: true
});

io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

app.use(sessionMiddleware);

app.use(express.static('public'));

/*-------------------------------Sesiones-----------------------------------*/

app.post("/register", (req, res) => {

    try {

        var user = cipher.decryptInfo(req.body.nom_usu_reg).trim();
        var pass = cipher.decryptInfo(req.body.pass_usu_reg_1).trim();
        var checkPass = cipher.decryptInfo(req.body.pass_usu_reg_conf).trim();
        var email = cipher.decryptInfo(req.body.email_usu_reg).trim();

        validate.validateLetters(user).then(resolve => {
            if (resolve == true) {
                validate.validateEmail(email).then(resolve => {
                    if (resolve == true) {
                        validate.validatePass(pass).then(resolve => {
                            if (resolve == true) {
                                if (pass != checkPass) {
                                    res.send("Las contraseñas no coinciden");
                                } else {
                                    bd.registerUser(cipher.encryptAES(regular.replaceSpaces(user)), cipher.encryptAES(email), cipher.encryptAES(pass)).then((resolve) => {
                                        res.send(resolve);
                                    });
                                }
                            } else {
                                res.send(resolve);
                            }
                        })
                    } else {
                        res.send(resolve);
                    }
                })
            } else {
                res.send(resolve);
            }
        })
    } catch (err) {
        console.log(err);
    }

});

app.post("/finalizeRegister", (req, res) => {

    try {

        var rol = req.body.rol;
        var code = req.body.code;

        if (code == "" || rol == "" || rol == null || code == null || rol == undefined || code == undefined) {
            res.send("Ingrese los datos correctamente");
            return;
        }

        var level = (rol == "owner") ? 2 : 3;

        if (code == req.session.code) {
            bd.updateLevelUser(req.session.email, level);
            req.session.level = level;
            var dir = "./users/" + cipher.decryptAES(req.session.email).split("@")[0];
            fs.mkdirSync(dir);
            res.send("");
        }
        else {
            res.send("El código es incorrecto");
        }

    } catch (err) {
        console.log(err);
    }

});

app.post("/login", (req, res) => {

    try {

        if (req.cookies["userData"] == null) {
            var email = cipher.decryptInfo(req.body.email_usu_log);
            var pass = cipher.decryptInfo(req.body.pass_usu_log);
            var check = (cipher.decryptInfo(req.body.saveSession)) == "true" ? "on" : false;
        }
        else {
            var email = req.cookies["userData"].email;
            var pass = req.cookies["userData"].pass;
            var check = "on";
        }

        validate.validateEmail(email).then(resolve => {
            if (resolve) {
                validate.validatePassLogin(pass).then(resolve => {
                    if (resolve) {
                        res.cookie("email", cipher.encryptAES(email), { maxAge: 9000000, httpOnly: true });

                        bd.loginUser(cipher.encryptAES(email), cipher.encryptAES(pass)).then((resolve) => {

                            var level = resolve;

                            if (level == "El usuario no existe") {
                                req.session.valid = false;
                                req.session.level = 0;
                                res.send("El usuario no existe");
                            }
                            else if (level == "Contraseña incorrecta") {
                                req.session.valid = false;
                                req.session.level = 0;
                                res.send("Contraseña incorrecta");
                            }
                            else {
                                if (level.id_tus == 4) {

                                    var character = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMÑOPQRSTUVWXYZ0123456789";

                                    var code = "";

                                    for (var i = 0; i < 8; i++) {
                                        var j = Math.floor(Math.random() * (character.length - 1)) + 1;
                                        code += character[j];
                                    }

                                    req.session.valid = true;
                                    req.session.level = 4;
                                    req.session.user = level.nom_use;
                                    req.session.code = code;

                                    req.session.email = cipher.encryptAES(email);

                                    if (check == "on") {

                                        var user = {
                                            email: email,
                                            pass: pass
                                        };

                                        res.cookie("userData", user, { maxAge: 9000000000, httpOnly: true });

                                    }

                                    mail.sendEmail(email, "Ingresa este código para verificar tu cuenta: " + code, "Verificar cuenta");

                                    res.send("4");

                                }
                                else {

                                    req.session.valid = true;
                                    req.session.level = level.id_tus;
                                    req.session.user = level.nom_use;
                                    req.session.email = cipher.encryptAES(email);

                                    if (check == "on") {
                                        var user = {
                                            email: email,
                                            pass: pass
                                        };
                                        res.cookie("userData", user, { maxAge: 9000000, httpOnly: true });
                                    }
                                    res.send(level.id_tus + "");
                                }
                            }
                        });
                    } else {
                        res.send(resolve);
                    }
                })
            } else {
                res.send(resolve)
            }
        })

    } catch (err) {
        console.log(err);
    }
});

app.post("/getUserName", (req, res) => {
    try {
        res.send(cipher.decryptAES(req.session.user));
    } catch (err) {
        console.log(err);
    }
});

app.post("/getUser", (req, res) => {
    try {
        if (req.session.email == null || req.session.email == undefined) {
            res.send("");
        }
        else {
            var user = {
                valid: req.session.valid,
                level: req.session.level,
                user: cipher.encryptInfo(cipher.decryptAES(req.session.user)),
                email: cipher.encryptInfo(req.session.email)
            };
            res.send(user);
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/getCode", (req, res) => {
    try {
        bd.getCodeSlave(req.session.email).then((resolve) => {
            resolve.forEach(element => {
                if (element.tel_use != 0) {
                    res.send("");
                }
                else {
                    res.send(element.code_use);
                }
            });
        });
    } catch (err) { console.log(err); }
});

app.post('/getActiveUser', (req, res) => {
    try {
        if (req.session.user != undefined) {
            res.send(cipher.encryptInfo(cipher.decryptAES(req.session.user)));
        }
        else {
            res.send("");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/sendRecoverEmail", (req, res) => {

    try {

        var email = req.body.email;

        if (email == null || email == undefined) {
            res.send("Ingrese su correo electrónico vinculado a ASNO");
            return;
        }

        bd.findEmail(email).then((resolve) => {
            if (resolve.length == 0) {
                res.send("El correo no está registrado");
            }
            else {
                var character = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMÑOPQRSTUVWXYZ0123456789";
                var code = "";

                for (var i = 0; i < 8; i++) {
                    var j = Math.floor(Math.random() * (character.length - 1)) + 1;
                    code += character[j];
                }

                req.session.code = code;
                req.session.email = email;

                mail.sendEmail(email, "Ingresa este código para recuperar tu cuenta: " + code, "Recuperar cuenta");

                res.send("Se ha enviado un código de verificación a tu correo, ingrésalo para continuar");
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/sendRecoverCode", (req, res) => {
    try {
        var code = req.body.code;

        if (req.session.code == null || req.session.code == undefined) {
            res.send("El código no ha sido definido, recarga la página para continuar");
        }
        else if (code == null || code == undefined) {
            res.send("Ingrese el código de verificación");
            return;
        }
        else if (code != req.session.code) {
            req.session.ok = false;
            res.send("El código es incorrecto");
        }
        else {
            req.session.ok = true;
            res.send("Ingrese la nueva contraseña para continuar");
        }
    } catch (err) { console.log(err); }
});

app.post("/sendRecoverPassword", (req, res) => {
    try {
        var pass = req.body.pass;
        var cpass = req.body.cpass;

        if (req.session.ok == null || req.session.ok == undefined) {
            res.send("El código no ha sido verificado, recarga la página para continuar");
        }
        else if (pass == null || pass == undefined) {
            res.send("Ingrese el código de verificación");
            return;
        }
        else if (false == req.session.ok) {
            res.send("El código no fue verificado");
        }
        else if (req.session.email == null || req.session.email == undefined) {
            res.send("El correo electrónico no fue ingresado");
        }
        else if (pass != cpass) {
            res.send("Las contraseñas no coinciden");
        }
        else {
            bd.updatePassword(req.session.email, pass);
            res.send("Contraseña modificada, inicie sesión ahora");
        }
    } catch (err) { console.log(err); }
});

app.post('/logOut', (req, res) => {
    try {

        req.session.destroy();

        res.clearCookie("userData");
        res.clearCookie("email");

        res.send("Sesión Cerrada Exitosamente");

    } catch (err) {
        console.log(err);
    }
});

/*-------------------------------Chat-----------------------------------*/

var online = [];
var rooms = [];

io.on('connection', function (socket) {

    socket.on('loadSession', function (user) {
        try {
            socket.handshake.session.email = cipher.decryptInfoUser(user.email);
            socket.handshake.session.user = cipher.decryptInfoUser(user.user);
            socket.handshake.session.save();
        } catch (err) { console.log(err); }
    });

    socket.on('loadUser', function (id, name) {
        try {

            online.push({
                socketID: id,
                name: name
            });

            io.emit('chatgUsers', online);

        } catch (err) { console.log(err); }
    });

    socket.on('createRoom', function () {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            bd.getLevel(email).then((resolve) => {
                if (resolve == null || resolve == undefined) {
                }
                else if (resolve.id_tus == 2) {
                    var already = false;
                    var i = 0;
                    var aux = 0;
                    rooms.forEach((element) => {
                        if (element["room"] == resolve.nom_use) {
                            already = true;
                            aux = i;
                        }
                        else {
                            i++;
                        }
                    });
                    if (!already) {
                        rooms.push({
                            room: user,
                            users: [{
                                name: user,
                                id: socket.id
                            }]
                        });
                    }
                    else {
                        var j = 0;
                        var aux2 = 0;
                        var exist = false;
                        rooms[i]["users"].forEach(element => {
                            if (element.name == user) {
                                exist = true;
                                aux2 = j;
                            } else {
                                j++;
                            }
                        });
                        if (exist) {
                            rooms[i]["users"].splice(aux2, 1);
                        }
                        rooms[aux]["users"].push({
                            name: user,
                            id: socket.id
                        });
                    }

                    socket.join(user);

                    rooms[aux]["users"].forEach(element => {
                        if (element["name"] != user) {
                            io.sockets.in(user).emit('chatOnline', element["name"]);
                        }
                    });
                }
                else {
                }
            });
        } catch (err) { console.log(err); }
    });

    socket.on('joinRoom', function () {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            bd.getChief(email).then((resolve) => {
                if (resolve == null || resolve == undefined) {
                }
                else {
                    var already = false;
                    var i = 0;
                    var aux = 0;
                    rooms.forEach((element) => {
                        if (element["room"] == cipher.decryptAES(resolve.nom_use)) {
                            already = true;
                            aux = i;
                        }
                        else {
                            i++;
                        }
                    });
                    if (!already) {
                        rooms.push({
                            room: cipher.decryptAES(resolve.nom_use),
                            users: [{
                                name: user,
                                id: socket.id
                            }]
                        });
                        socket.join(cipher.decryptAES(resolve.nom_use));
                        io.sockets.in(cipher.decryptAES(resolve.nom_use)).emit("chiefOffline");
                    }
                    else {
                        var j = 0;
                        var aux2 = 0;
                        var exist = false;
                        rooms[aux]["users"].forEach(element => {
                            if (element.name == user) {
                                exist = true;
                                aux2 = j;
                            } else {
                                j++;
                            }
                        });
                        if (exist) {
                            rooms[i]["users"].splice(aux2, 1);
                        }
                        rooms[aux]["users"].push({
                            name: user,
                            id: socket.id
                        });
                        socket.join(cipher.decryptAES(resolve.nom_use));
                        io.sockets.in(cipher.decryptAES(resolve.nom_use)).emit('chatOnline', user);
                        io.sockets.in(cipher.decryptAES(resolve.nom_use)).emit('chiefOnline');
                    }
                }
            });
        } catch (err) { console.log(err); }
    });

    socket.on('leaveRoom', function () {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            bd.getChief(email).then((resolve) => {
                if (resolve == null || resolve == undefined) {
                }
                else {
                    var i = 0;
                    var k = 0;
                    var j = 0;
                    var aux = 0;
                    rooms.forEach((element) => {
                        if (element["room"] == cipher.decryptAES(resolve.nom_use)) {
                            already = true;
                            i = k;
                        }
                        else {
                            k++;
                        }
                    });
                    rooms[i]["users"].forEach(element => {
                        if (element.name == user) {
                            aux = j;
                        } else {
                            j++;
                        }
                    });
                    rooms[i]["users"].splice(aux, 1);
                    socket.leave(cipher.decryptAES(resolve.nom_use));
                    io.sockets.in(cipher.decryptAES(resolve.nom_use)).emit('chatOffline', user);
                }
            });
        } catch (err) { console.log(err); }
    });

    socket.on('chatE', function (msg1) {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            var msg = decodeURIComponent(msg1);
            rooms.forEach(element => {
                element["users"].forEach((element2) => {
                    if (element2.name == user) {
                        bd.getChief(email).then((resolve) => {
                            var emailChief = cipher.decryptAES(resolve.cor_use);
                            var path = "./users/" + emailChief.split("@")[0] + "/" + emailChief.split("@")[0] + "-" + cipher.decryptAES(email).split("@")[0] + ".json";
                            var messages = require(path);
                            var message = {
                                "sender": user,
                                "message": msg,
                                "date": regular.getDate()
                            };
                            if (messages.length == 200) {
                                message.splice(0, 1);
                                messages.push(message);
                                fs.writeFile(path, '', function (err) { if (err) { console.log(err) } });
                                fs.writeFile(path, JSON.stringify(messages), function (err) { if (err) { console.log(err) } });
                            }
                            else {
                                messages.push(message);
                                fs.writeFile(path, '', function (err) { if (err) { console.log(err) } });
                                fs.writeFile(path, JSON.stringify(messages), function (err) { if (err) { console.log(err) } });
                            }
                        });
                        io.sockets.in(element.room).emit('chatUD', encodeURIComponent(user), encodeURIComponent(msg));
                    }
                });
            });
        } catch (err) { console.log(err); }
    });

    socket.on('chatD', function (msg1, destiny1) {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            var msg = decodeURIComponent(msg1);
            var destiny = decodeURIComponent(destiny1);
            bd.getSlaveByName(email, cipher.encryptAES(destiny)).then((resolve) => {
                var emailSlave = cipher.decryptAES(resolve.cor_use);
                var path = "./users/" + cipher.decryptAES(email).split("@")[0] + "/" + cipher.decryptAES(email).split("@")[0] + "-" + emailSlave.split("@")[0] + ".json";
                var messages = require(path);
                var message = {
                    "sender": user,
                    "message": msg,
                    "date": regular.getDate()
                };
                if (messages.length == 200) {
                    message.splice(0, 1);
                    messages.push(message);
                    fs.writeFile(path, '', function (err) { if (err) { console.log(err) } });
                    fs.writeFile(path, JSON.stringify(messages), function (err) { if (err) { console.log(err) } });
                }
                else {
                    messages.push(message);
                    fs.writeFile(path, '', function (err) { if (err) { console.log(err) } });
                    fs.writeFile(path, JSON.stringify(messages), function (err) { if (err) { console.log(err) } });
                }
            });
            io.sockets.in(user).emit('chatUE' + decodeURIComponent(destiny), encodeURIComponent(msg), encodeURIComponent(user), regular.getDate());
        } catch (err) { console.log(err); }
    });

    socket.on('getMessagesE', () => {
        try {
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            rooms.forEach(element => {
                element["users"].forEach((element2) => {
                    if (element2.name == user) {
                        bd.getChief(email).then((resolve) => {
                            var emailChief = cipher.decryptAES(resolve.cor_use);
                            var path = "./users/" + emailChief.split("@")[0] + "/" + emailChief.split("@")[0] + "-" + cipher.decryptAES(email).split("@")[0] + ".json";
                            var messages = require(path);
                            io.sockets.in(element.room).emit('getMessagesUE' + user, encodeURIComponent(JSON.stringify(messages)));
                        });
                    }
                });
            });
        } catch (err) { console.log(err); }
    });

    socket.on('getMessagesD', (destiny1) => {
        try {
            var destiny = decodeURIComponent(destiny1);
            var user = socket.handshake.session.user;
            var email = socket.handshake.session.email;
            bd.getSlaveByName(email, cipher.encryptAES(destiny)).then((resolve) => {
                var emailSlave = cipher.decryptAES(resolve.cor_use);
                var path = "./users/" + cipher.decryptAES(email).split("@")[0] + "/" + cipher.decryptAES(email).split("@")[0] + "-" + emailSlave.split("@")[0] + ".json";
                var messages = require(path);
                io.sockets.in(user).emit('getMessagesUD', encodeURIComponent(JSON.stringify(messages)));
            });
        } catch (err) { console.log(err); }
    });

    socket.on('disconnect', function () {
        try {
            var i = 0;
            online.forEach(element => {
                if (element["socketID"] == socket.id) {
                    i = online.indexOf(element);
                }
            });

            online.splice(i, i);

            io.emit('chatgUsers', online);

        } catch (err) { console.log(err); }
    });

    socket.on('chatg', function (msg, user) {
        try {

            date = regular.getDate();

            var msgTemp = msg;

            msgTemp = msgTemp.replace(/</g, "");
            msgTemp = msgTemp.replace(/>/g, "");

            msgTemp = decodeURIComponent(escape(msgTemp));

            io.emit('chatgg', user, encodeURIComponent(msgTemp), date);

        } catch (err) { console.log(err); }
    });

});

/*----------------------Admin-------------------*/

app.post("/getUsers", (req, res) => {
    try {
        if (req.session.level != 1) {
            res.redirect("../index.html");
            return;
        }
        bd.getUsers().then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

app.post("/getUserByDate",(req,res)=>{
    try{
        if (req.session.level != 1) {
            res.redirect("../index.html");
            return;
        }
        bd.getUsersByDate().then((resolve)=>{
            res.send(resolve);
        });
    }catch(err){
        console.log(err);
    }
});

app.post("/getTotalSells",(req,res)=>{
    try{
        if (req.session.level != 1) {
            res.redirect("../index.html");
            return;
        }
        bd.getTotalSells().then((resolve)=>{
            res.send(resolve);
        });
    }catch(err){
        console.log(err);
    }
});

app.post("/deleteUser", (req, res) => {
    try {
        if (req.session.level != 1) {
            res.redirect("../index.html");
            return;
        }
        var id = req.body.id;
        var name = req.body.name;
        bd.deleteUser(id, name);
        res.send("");
    } catch (err) { console.log(err); }
});

/*-------------------------------Negocios-----------------------------------*/

app.post("/registerSlave", (req, res) => {
    try {
        bd.registerSlave(req.session.email, cipher.encryptAES(req.session.deal), req.body.code).then(function (resolve) {
            if (resolve == "!") {
                res.send("Ha ocurrido un error, intentelo de nuevo");
            }
            else {
                bd.getSlaveByCode(req.body.code).then((resolve1) => {
                    if (resolve1 == null || resolve1 == undefined || resolve1.length == 0) {
                        res.send("Empleado no registrado, revise el código e inténtelo de nuevo");
                    }
                    else {
                        fs.writeFileSync("./users/" + cipher.decryptAES(req.session.email).split("@")[0] + "/" + cipher.decryptAES(req.session.email).split("@")[0] + "-" + cipher.decryptAES(resolve1.cor_use).split("@")[0] + ".json", "[]", (err) => {
                            if (err) { console.log(err); }
                        });
                        res.send("Empleado añadido correctamente");
                    }
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/unregisterSlave", (req, res) => {
    try {
        if (req.session.level != 2) {
            res.redirect("../index.html");
            return;
        }
        var id = req.body.id;
        var name = cipher.encryptAES(cipher.decryptInfo(req.body.name));
        bd.getSlaveByIdAndName(id, name).then((resolve) => {
            fs.unlinkSync("./users/" + cipher.decryptAES(req.session.email).split("@")[0] + "/" + cipher.decryptAES(req.session.email).split("@")[0] + "-" + cipher.decryptAES(resolve.cor_use).split("@")[0] + ".json", (err) => {
                if (err) console.log(err);
            });
            bd.unregisterSlave(id, name);
            res.send("Empleado dado de baja");
        });
    } catch (err) { console.log(err); }
});

app.post("/getSlaves", (req, res) => {
    try {
        var deal = req.body.deal;
        if (req.session.level == 2) {
            if (req.session.email == null || req.session.email == undefined) {
                res.redirect("index.html");
            }
            else {
                req.session.deal = deal;
                bd.getSlaves(req.session.email, cipher.encryptAES(deal)).then((resolve) => {
                    res.send(resolve);
                });
            }
        }
        else {
            res.redirect("index.html");
        }
    } catch (err) { console.log(err); }
});

app.post('/getDealsUsers', (req, res) => {
    try {
        bd.getDeals(req.session.email).then((resolve) => {
            var html = `	
                    <option>Seleccione un negocio</option>`;

            resolve.forEach(element => {
                html += `<option>${element.nom_neg}</option>`;
            })
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/isDeal", (req, res) => {
    res.send(true);
});

app.post("/getDeals", (req, res) => {
    try {
        bd.getDeals(req.session.email).then((resolve) => {
            var deals = resolve;
            if (deals == null || deals == undefined || deals.length == 0) {
                res.send("0");
            }
            else if (deals.length == 1) {
                var txt = "";
                deals.forEach(element => {
                    txt += cipher.decryptAES(element.nom_neg);
                });
                res.send(cipher.encryptInfo(txt));
            }
            else {
                var txt = "";
                deals.forEach(element => {
                    txt += cipher.decryptAES(element.nom_neg) + ",";
                });
                res.send(cipher.encryptInfo(txt.substring(0, txt.length - 1)));
            }
        });
    } catch (err) { console.log(err); }
});

app.post('/getDealSession', (req, res) => {
    try {
        if (req.session.deal == null || req.session.deal == "Seleccione") {
            res.send("no");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post('/putDeal', (req, res) => {
    try {
        const deal = cipher.encryptAES(cipher.decryptInfo(req.body.deal));
        bd.getDealID(req.session.email, deal).then((resolve) => {
            if (resolve.length == 0) {
                req.session.deal == "Seleccione";
            } else {
                req.session.deal = resolve;
                res.send("Mensaje subliminal");
            }

        });
    } catch (err) {
        console.log(err);
    }
});

app.post('/putDealSession', (req, res) => {
    const { deal } = req.body;
    req.session.pruebaDeal = deal;
    res.send("");
});

app.post('/putDealSession2', (req, res) => {
    const { deal } = req.body;
    req.session.pruebaUpdateDeal = deal;
    res.send("");
});

app.post("/getAllDeals", (req, res) => {
    try {
        bd.getDeals(req.session.email).then((resolve) => {
            let deals = resolve;
            if (deals == null || deals == undefined || deals.length == 0) {
                res.send("0");
            } else {
                let html = ``;
                deals.forEach(element => {
                    html += `<div class="col-md-6 mx-auto">
                        <div class='card text-center'>
                            <div class='card-body'>`;
                    html += `<h3 class='card-title text-uppercase' id="dealName">${cipher.decryptAES(element.nom_neg)}</h3 > `;
                    html += `<button type="button" class="deal btn btn-danger mb-3 d-inline-block" value="${cipher.decryptAES(element.nom_neg)}" id='modal-857424' href='#modal-container-857465' role='button' data-toggle='modal'>Eliminar negocio</button>
                            <button type="button" class="updateDeal btn btn-secondary mb-3 d-inline-block" value="${cipher.decryptAES(element.nom_neg)}" id='modal-857465' href='#modal-container-857424' role='button' data-toggle='modal'>Editar negocio</button>
                            `;
                    html += `</div></div></div> <br>`;
                });
                html += `<script>        
                $(".deal").on('click', function(){
                    $.ajax({
                        url: '/putDealSession',
                        method: 'POST',
                        data: {
                            deal: $(this).val()
                        },
                        success: function(response){}
                    })
                })

                $(".updateDeal").on('click', function(){
                    $.ajax({
                        url: '/putDealSession2',
                        method: 'POST',
                        data: {
                            deal: $(this).val()
                        }, 
                        success: function(response){}
                    })
                });
                </script>`;
                res.send(html);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/createDeal", (req, res) => {
    try {
        const pass = cipher.decryptInfo(req.body.pass);
        const nombre = cipher.decryptInfo(req.body.nombre);
        const email = req.session.email;

        validate.onlyLettersAndSpace(nombre, "El nombre del negocio").then(response => {
            if (response) {
                validate.validatePassLogin(pass).then(response => {
                    if (response) {
                        bd.createDeal(email, cipher.encryptAES(pass), cipher.encryptAES(nombre)).then((resolve) => {
                            if (resolve == "") {
                                res.send(`Negocio ${nombre} registrado exitosamente`);
                            } else {
                                res.send(resolve);
                            }
                        });
                    } else {
                        res.send(response);
                    }
                })
            } else {
                res.send(response);
            }
        })

    } catch (err) {
        console.log(err);
    }
});

app.post("/editDeal", (req, res) => {
    try {
        const oldName = req.session.pruebaUpdateDeal;
        const { nuevo, pass } = req.body;
        const email = req.session.email;

        validate.onlyLettersAndSpace(nuevo, "El nombre del negocio").then(response => {
            if (response) {
                validate.validatePassLogin(pass).then(response => {
                    if (response) {
                        bd.editDeal(email, cipher.encryptAES(pass), cipher.encryptAES(oldName), cipher.encryptAES(nuevo)).then((resolve) => {
                            req.session.pruebaUpdateDeal = nuevo;
                            res.send(resolve);
                        });
                    } else {
                        res.send(response);
                    }
                })
            } else {
                res.send(response);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/deleteDeal", (req, res) => {
    try {
        const deal = req.session.pruebaDeal;
        const { pass } = req.body;
        let email = req.session.email;

        validate.validatePassLogin(pass).then(resolve => {
            if (resolve) {
                bd.deleteDeal(cipher.encryptAES(pass), email, cipher.encryptAES(deal)).then((resolve) => {
                    res.send(resolve);
                });
            } else {
                res.send(resolve);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
});

/*-------------------------------Análisis-----------------------------------*/

app.post("/generatePDF", (req, res) => {
    regular.generatePDF(req.session.email, req.session.deal).then((resolve) => {
        res.type('txt');
        res.send(Buffer.from(resolve));
    });
});

app.post("/getInventory", (req, res) => {
    try {
        if (req.session.level != 2 && req.session.level != 3) {
            res.redirect("../index.html");
            return;
        }
        var deal = req.body.deal;
        bd.getInventory(req.session.email, cipher.encryptAES(deal)).then((resolve) => {
            if (resolve == "El negocio no está registrado") {
                res.send(resolve);
            }
            else {
                bd.getDealID(req.session.email, deal).then((resolve1) => {
                    req.session.deal = resolve1;
                    res.send(resolve);
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post('/createChart', (req, res) => {
    try {
        const { time } = req.body;
        const { graphic } = req.body;
        let deals = [];
        let afterDate = new Date();
        let beforeDate;
        if (time == 'Este dia') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Esta semana') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 7));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Este mes') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 30));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Este año') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 365));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        }
        afterDate = afterDate.getFullYear() + "-" + (afterDate.getMonth() + 1) + "-" + afterDate.getDate()
        bd.getSales(req.session.email, req.session.deal, time, afterDate, beforeDate).then((resolve) => {
            resolve.forEach((element) => {
                let name = element.nom_pro;
                let count = 0;
                let cant = 0;
                let i = 0;
                let index = [];
                resolve.forEach((element) => {
                    if (name == element.nom_pro) {
                        cant += element.can_eve;
                        if (count != 0) {
                            let dataI = { i };
                            index.push(dataI);
                        }
                        count++;
                        i++;
                    }
                });
                index.forEach((element) => {
                    resolve.splice(element, 1);
                })
                let data = { nombre: name, cantidad: cant };
                deals.push(data);
            });
            deals.sort(function (a, b) {
                return b.cantidad - a.cantidad;
            });
            var html = ``;
            if (deals.length != 0) {
                if (graphic == 'Barras') {
                    html += `
                    <div id="labels"></div>
                    <script>
                        new Morris.Line({
                            element: 'trendsChart',
                            resize: true,
                            data: [`;

                    let timer = 0;
                    deals.forEach((element) => {
                        if (timer < 10) {
                            if (timer != 9) {
                                html += `{y: "${timer + 1}", value: ${element.cantidad}, label: "${element.nombre}"},`
                            } else if (timer == 9) {
                                html += `{y: "${timer + 1}", value: ${element.cantidad}, label: "${element.nombre}"}`
                            }
                        }
                        timer++;

                    })
                    html += `],
                            hoverCallback: function (index, options, content) {
                                var data = options.data[index];
                                $("#labels").html('Producto: ' + data.label + ' , Cantidad: '+data.value);
                            },
                            gridTextSize: 0,
                            xkey: 'y',
                            ykeys: ['value'],
                            stacked: true,
                            labels: ['']
                        });     
                    </script>              
                `;
                } else if (graphic == 'Pastel') {
                    html += `
                    <script>
                        new Morris.Donut({
                            element: 'trendsChart',
                            colors: ["#6E6F6F", "#B4B4B4"],
                            resize: true,
                            data: [`;

                    let timer = 0;
                    deals.forEach((element) => {
                        if (timer < 10) {
                            if (timer != 9) {
                                html += `{label: "${element.nombre}", value: ${element.cantidad}},`
                            } else if (timer == 9) {
                                html += `{label: "${element.nombre}", value: ${element.cantidad}}`
                            }
                        }
                        timer++;

                    })
                    html += `]
                    });     
                    </script>              
                `;
                }
            } else {
                html += `<center><h1>No hay nada que mostrar</h1></center>`;
            }
            let package = [];
            let table = `<table class="table">
                            <thead>
                                <tr>
                                    <td>Prodcuto</td>
                                    <td>Cantidad</td>
                                </tr>
                            </thead> 
                            <tbody>
                            `;
            deals.forEach((element) => {
                table += `<tr>
                    <td>${element.nombre}</td>
                    <td>${element.cantidad}</td>    
                </tr>`;
            });
            table += `</tbody>
            </table>`;
            package.push(html);
            package.push(table);
            res.send(package);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post('/getEarnings', (req, res) => {
    try {
        const { product } = req.body;
        const { time } = req.body;
        let afterDate = new Date();
        let beforeDate;
        if (time == 'Este dia') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Esta semana') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 7));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Este mes') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 30));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        } else if (time == 'Este año') {
            beforeDate = new Date(afterDate.getTime() - (1000 * 60 * 60 * 24 * 365));
            beforeDate = beforeDate.getFullYear() + "-" + (beforeDate.getMonth() + 1) + "-" + beforeDate.getDate();
        }
        afterDate = afterDate.getFullYear() + "-" + (afterDate.getMonth() + 1) + "-" + afterDate.getDate()

        bd.getProductsToGraphics(req.session.email, req.session.deal, product, afterDate, beforeDate, time).then(resolve => {
            let html = `<table class="table">
                <thead>
                    <tr>
                        <td>Producto</td>
                        <td>Cantidad</td>
                        <td>Ganancia</td>
                        <td>Fecha</td>
                    </tr>
                </thead>
                <tbody>
                `;
            var meses = [
                "Enero", "Febrero", "Marzo",
                "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre",
                "Noviembre", "Diciembre"
            ]
            let gananciaVar = 0;
            resolve.forEach(element => {
                var fec = new Date(element.fecven_eve);
                var dia = fec.getDate();
                var mes = fec.getMonth();
                var yyy = fec.getFullYear();
                var fecha_formateada = dia + ' de ' + meses[mes] + ' de ' + yyy;
                html += `<tr>
                    <td>${element.nom_pro}</td>
                    <td>${(element.can_eve)}</td>
                    <td>${element.tot_eve * (element.preven_pro - element.precom_pro)}</td>
                    <td>${fecha_formateada}</td>
                </tr>`;
                gananciaVar += (element.tot_eve * (element.preven_pro - element.precom_pro));
            });
            html += `<tr>
                        <td colspan="3">Ganancia Total</td> 
                        <td>${gananciaVar}</td>
                    </tr>
            </tbody>
                </table>`;
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

/*-------------------------------Productos-----------------------------------*/

app.post("/uploadCSV", (req, res) => {
    try {
        if (req.session.level == 2) {
            if (req.session.valid) {
                if (req.files == undefined || req.files == null) {
                    res.send("Sube un archivo primero");
                }
                else {
                    let file = req.files.file;
                    if (file.name.substring(file.name.length - 4, file.name.length) == ".csv") {
                        file.mv(`./users/${req.session.email.split('@')[0]}/inventory.csv`, (err) => {
                            if (err) console.log(err);
                            var base = path.resolve('.');
                            var filePath = `${base}/users/${req.session.email.split("@")[0]}/inventory.csv`;
                            filePath = filePath.replace(/\\/g, "/");
                            bd.loadCSV(req.session.email, filePath, req.session.deal).then((resolve) => {
                                if (resolve == "") { res.send(""); }
                                else { res.send(resolve); }
                            });
                        });
                    }
                    else {
                        res.send("El archivo debe ser un csv");
                    }

                }
            }
            else {
                res.redirect("index.html");
            }
        }
        else {
            res.redirect("index.html");
        }
    } catch (err) { console.log(err); }
});

app.post('/getProducts', (req, res) => {
    try {
        bd.getProducts(req.session.email, req.session.deal).then(resolve => {
            let html = ``;
            resolve.forEach(element => {
                html += `<option>${element.nom_pro}</option>`;
            })
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/consultProduct", (req, res) => {
    try {
        var search = req.body;
        var deal = req.session.deal;
        bd.consultProductsHTML(search, deal).then((result) => {
            res.send(result);
        });
    } catch (err) { console.log(err); }
});

app.post("/addProduct", (req, res) => {
    try {
        var producto = req.body;
        var date = regular.getDate();
        var deal = req.session.deal;
        bd.getIdTypeProduct(producto.tpo, deal).then((resolve1) => {
            if (resolve1 == "Empty set") {
                res.send("No modifiques las cosas");
            }
            else {
                var id_tpo = resolve1;
                bd.getIdMetricUnit(producto.mun, deal).then((resolve2) => {
                    if (resolve2 == "Empty set") {
                        res.send("No modifiques las cosas");
                    }
                    else {
                        var id_unm = resolve2;
                        bd.addProduct(producto, date, id_unm, id_tpo, deal).then((resolve3) => {
                            if (resolve3 == "Empty set") {
                                res.send("Producto No Registrado");
                            }
                            if (resolve3 == "Producto ya Registrado") {
                                res.send("Producto ya Registrado");
                            }
                            if (resolve3 == "Producto No Registrado") {
                                res.send("Producto No Registrado");
                            }
                            else {
                                res.send("Producto Registrado Éxitosamente");
                            }
                        });
                    }
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/editProduct", (req, res) => {
    try {
        var id_pro = req.body.id;
        var id_neg = req.session.deal;
        bd.editProduct(id_pro, id_neg).then((resolve) => {
            if (resolve == "Empty set") {
                res.send("No existe el producto");
            }
            else {
                res.send(resolve[0]);
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/modifyProduct", (req, res) => {
    try {
        var producto = req.body;
        var date = regular.getDate();
        var deal = req.session.deal;
        bd.getIdTypeProduct(producto.tpo, deal).then((resolve1) => {
            if (resolve1 == "Empty set") {
                res.send("No modifiques las cosas");
            }
            else {
                var id_tpo = resolve1;
                bd.getIdMetricUnit(producto.mun, deal).then((resolve2) => {
                    if (resolve2 == "Empty set") {
                        res.send("No modifiques las cosas");
                    }
                    else {
                        var id_unm = resolve2;
                        bd.updateProduct(producto, date, id_unm, id_tpo, deal).then((resolve3) => {
                            if (resolve3 == "Empty set") {
                                res.send("No se puede registrar");
                            }
                            if (resolve3 == "Producto ya Registrado") {
                                res.send(resolve3);
                            }
                            else {
                                res.send(resolve3);
                            }
                        });
                    }
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/deleteProduct", (req, res) => {
    try {
        var producto = req.body;
        var deal = req.session.deal;
        bd.deleteProduct(producto, deal).then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

/*-------------------------------Categorías-----------------------------------*/

app.post("/putSelectOptionsTyP", (req, res) => {
    try {
        if (req.session.level != 2 && req.session.level != 3) {
            res.redirect("../index.html");
            return;
        }
        var deal = cipher.encryptAES(req.body.deal);
        bd.getSelectTypeProducts(req.session.email, deal).then((resolve) => {
            if (resolve == "El negocio no está registrado") {
                res.send(resolve);
            }
            else {
                bd.getDealID(req.session.email, deal).then((resolve1) => {
                    req.session.deal = resolve1;
                    res.send(resolve);
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/getTypeProducts", (req, res) => {
    try {
        if (req.session.level != 2 && req.session.level != 3) {
            res.redirect("../index.html");
            return;
        }
        var deal = req.body.deal;
        bd.getTypeProducts(req.session.email, cipher.encryptAES(deal)).then((resolve) => {
            if (resolve == "El negocio no está registrado") {
                res.send(resolve);
            }
            else {
                bd.getDealID(req.session.email, cipher.encryptAES(deal)).then((resolve1) => {
                    req.session.deal = resolve1;
                    res.send(resolve);
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/addTypeProduct", (req, res) => {
    try {
        var tipo = req.body;
        var deal = req.session.deal;
        bd.addTypeProduct(tipo.nomt, deal).then((resolve) => {
            if (resolve == "Tipo de Producto ya registrado") {
                res.send("Tipo de Producto ya registrado");
            }
            if (resolve == "Tipo de Producto No Registrado") {
                res.send("Tipo de Producto No Registrado");
            }
            else {
                res.send("Tipo de Producto Registrado Exitosamente");
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/editTypeProduct", (req, res) => {
    try {
        var id_tpo = req.body.id;
        var id_neg = req.session.deal;
        bd.editTypeProduct(id_tpo, id_neg).then((resolve) => {
            if (resolve == "Empty set") {
                res.send("No existe el Tipo de Producto");
            }
            else {
                res.send(resolve[0]);
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/modifyTypeProduct", (req, res) => {
    try {
        var tipo = req.body;
        var deal = req.session.deal;
        bd.updateTypeProduct(tipo, deal).then((resolve) => {
            if (resolve == "Tipo de Producto ya registrado") {
                res.send(resolve);
            }
            if (resolve == "Tipo de No Modificado") {
                res.send(resolve);
            }
            else {
                res.send(resolve);
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/deleteType", (req, res) => {
    try {
        var type = req.body;
        var deal = req.session.deal;
        bd.deleteType(type, deal).then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

app.post("/consultType", (req, res) => {
    try {
        var search = req.body;
        var deal = req.session.deal;
        bd.consultTypeHTML(search, deal).then((result) => {
            res.send(result);
        });
    } catch (err) { console.log(err); }
});

/*-------------------------------Unidades de medida-----------------------------------*/

app.post("/putSelectOptionsUnM", (req, res) => {
    try {
        if (req.session.level != 2 && req.session.level != 3) {
            res.redirect("../index.html");
            return;
        }
        var deal = cipher.encryptAES(req.body.deal);
        bd.getSelectMetricUnits(req.session.email, deal).then((resolve) => {
            if (resolve == "El negocio no está registrado") {
                res.send(resolve);
            }
            else {
                bd.getDealID(req.session.email, deal).then((resolve1) => {
                    req.session.deal = resolve1;
                    res.send(resolve);
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/getMetricUnits", (req, res) => {
    try {
        if (req.session.level != 2 && req.session.level != 3) {
            res.redirect("../index.html");
            return;
        }
        var deal = req.body.deal;
        bd.getMetricUnits(req.session.email, cipher.encryptAES(deal)).then((resolve) => {
            if (resolve == "El negocio no está registrado") {
                res.send(resolve);
            }
            else {
                bd.getDealID(req.session.email, cipher.encryptAES(deal)).then((resolve1) => {
                    req.session.deal = resolve1;
                    res.send(resolve);
                });
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/addMetricUnit", (req, res) => {
    try {
        var unit = req.body;
        var deal = req.session.deal;
        bd.addMetricUnit(unit.nomu, deal).then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

app.post("/editMetricUnit", (req, res) => {
    try {
        var id_unm = req.body.id;
        var id_neg = req.session.deal;
        bd.editMetricUnit(id_unm, id_neg).then((resolve) => {
            if (resolve == "Empty set") {
                res.send("No existe la Unidad de Medida");
            }
            else {
                res.send(resolve[0]);
            }
        });
    } catch (err) { console.log(err); }
});

app.post("/modifyMetricUnit", (req, res) => {
    try {
        var unit = req.body;
        var deal = req.session.deal;
        bd.updateMetricUnit(unit, deal).then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

app.post("/deleteUnity", (req, res) => {
    try {
        var unity = req.body;
        var deal = req.session.deal;
        bd.deleteUnity(unity, deal).then((resolve) => {
            res.send(resolve);
        });
    } catch (err) { console.log(err); }
});

app.post("/addQuantityProduct", (req, res) => {
    try {
        var product = req.body;
        var deal = req.session.deal;
        bd.addQuantityProduct(product, deal).then((result) => {
            res.send(result);
        });
    } catch (err) { console.log(err); }
});

app.post("/consultUnity", (req, res) => {
    try {
        var search = req.body;
        var deal = req.session.deal;
        bd.consultUnityHTML(search, deal).then((result) => {
            res.send(result);
        });
    } catch (err) { console.log(err); }
});

/*----------------------------------------Ventas----------------------------------- */
app.post("/getSellProducts", (req, res) => {
    try {
        bd.getProductsSell(req.session.deal, req.session.email).then((resolve) => {
            var html = `<table class="table"><thead>
            <tr>
                <th>Nombre</th>
                <th>Precio de venta</th>
                <th>Cantidad disponible</th>
                <th>Descripción</th>
                <th>Unidad de medida</th>
                <th>Categoría</th>
                <th>Acción</th>
            </tr>
            </thead><tbody id="allProducts">`;
            resolve.forEach(element => {
                html += `<tr id='${element.nom_pro.replace(/\s/g, "")}Table'>
                    <td>${element.nom_pro}</td>
                    <td>${element.preven_pro}</td>
                    <td>${element.canivt_pro}</td>
                    <td>${element.des_pro}</td>
                    <td>${element.nom_unm}</td>
                    <td>${element.nom_tpo}</td>
                    <td><input type="button" value="Agregar" class="btn btn-success" 
                    onclick="addProductToSell('${element.nom_pro}',${element.preven_pro},1,'${element.nom_pro.replace(/\s/g, "")}Table','${element.nom_unm}','${element.nom_tpo}','${element.des_pro}',${element.canivt_pro})"></td>
                    </tr>`;
            });
            html += "</tbody></table>"
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/getUnitySell", (req, res) => {
    try {
        bd.getUnitySell(req.session.deal, req.session.email).then((resolve) => {
            var html = "";
            resolve.forEach(element => {
                html += `<option>${element.nom_unm}</option>`;
            });
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/getTypeSell", (req, res) => {
    try {
        bd.getTypeSell(req.session.deal, req.session.email).then((resolve) => {
            var html = "";
            resolve.forEach(element => {
                html += `<option>${element.nom_tpo}</option>`;
            });
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/filterProductsSell", (req, res) => {
    try {
        var type = req.body.type;
        var unity = req.body.unity;
        var like = req.body.like;
        var products = req.body.p;
        bd.filterProductsSell(type, unity, like, products, req.session.deal, req.session.email).then((resolve) => {
            var html = `<table class="table"><thead>
            <tr>
                <th>Nombre</th>
                <th>Precio de venta</th>
                <th>Cantidad disponible</th>
                <th>Descripción</th>
                <th>Unidad de medida</th>
                <th>Categoría</th>
                <th>Acción</th>
            </tr>
            </thead><tbody id="allProducts">`;
            resolve.forEach(element => {
                html += `<tr id='${element.nom_pro.replace(/\s/g, "")}Table'>
                    <td>${element.nom_pro}</td>
                    <td>${element.precom_pro}</td>
                    <td>${element.canivt_pro}</td>
                    <td>${element.des_pro}</td>
                    <td>${element.nom_unm}</td>
                    <td>${element.nom_tpo}</td>
                    <td><input type="button" value="Agregar" 
                    onclick="addProductToSell('${element.nom_pro}',${element.precom_pro},1,'${element.nom_pro.replace(/\s/g, "")}Table','${element.nom_unm}','${element.nom_tpo}','${element.des_pro}',${element.canivt_pro})"></td>
                    </tr>`;
            });
            html += "</tbody></table>"
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/registerSell", (req, res) => {
    try {
        var sell = [];
        var hour = regular.getOnlyHour();
        var date = regular.getOnlyDate();
        if (req.body.data.length == 0) {
            res.send("Llene todos los campos");
        } else {
            req.body.data.forEach(element1 => {
                var x = -1;
                var i = 0;
                sell.forEach(element2 => {
                    if (element2.nom_pro == element1.nom_pro) {
                        x = i;
                    }
                    else {
                        i++;
                    }
                });
                if (x != -1) {
                    sell[x].can_ivt += Math.round(element1.can_ivt);
                }
                else {
                    sell.push({
                        nom_pro: element1.nom_pro,
                        can_ivt: Math.round(element1.can_ivt)
                    });
                }
            });
            bd.getUserIdByEmail(req.session.email).then((resolve) => {
                sell.forEach(element => {
                    bd.registerSell(req.session.email, req.session.deal, resolve, element, hour, date);
                });
                res.send("");
            });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/setDataSell", (req, res) => {
    try {
        bd.getChief(req.session.email).then((resolve) => {
            req.session.chiefEmail = resolve.cor_use;
            req.session.deal = resolve.id_neg;
            res.send("");
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/getSellProductsSlave", (req, res) => {
    try {
        bd.getProductsSell(req.session.deal, req.session.chiefEmail).then((resolve) => {
            var html = `<table class="table"><thead>
            <tr>
                <th>Nombre</th>
                <th>Precio de venta</th>
                <th>Cantidad disponible</th>
                <th>Descripción</th>
                <th>Unidad de medida</th>
                <th>Categoría</th>
                <th>Acción</th>
            </tr>
            </thead><tbody id="allProducts">`;
            resolve.forEach(element => {
                html += `<tr id='${element.nom_pro.replace(/\s/g, "")}Table'>
                    <td>${element.nom_pro}</td>
                    <td>${element.precom_pro}</td>
                    <td>${element.canivt_pro}</td>
                    <td>${element.des_pro}</td>
                    <td>${element.nom_unm}</td>
                    <td>${element.nom_tpo}</td>
                    <td><input type="button" value="Agregar" 
                    onclick="addProductToSell('${element.nom_pro}',${element.precom_pro},1,'${element.nom_pro.replace(/\s/g, "")}Table','${element.nom_unm}','${element.nom_tpo}','${element.des_pro}',${element.canivt_pro})"></td>
                    </tr>`;
            });
            html += "</tbody></table>"
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/getUnitySellSlave", (req, res) => {
    try {
        bd.getUnitySell(req.session.deal, req.session.chiefEmail).then((resolve) => {
            var html = "";
            resolve.forEach(element => {
                html += `<option>${element.nom_unm}</option>`;
            });
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/getTypeSellSlave", (req, res) => {
    try {
        bd.getTypeSell(req.session.deal, req.session.chiefEmail).then((resolve) => {
            var html = "";
            resolve.forEach(element => {
                html += `<option>${element.nom_tpo}</option>`;
            });
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/filterProductsSellSlave", (req, res) => {
    try {
        var type = req.body.type;
        var unity = req.body.unity;
        var like = req.body.like;
        var products = req.body.p;
        bd.filterProductsSell(type, unity, like, products, req.session.deal, req.session.chiefEmail).then((resolve) => {
            var html = `<table class="table"><thead>
            <tr>
                <th>Nombre</th>
                <th>Precio de venta</th>
                <th>Cantidad disponible</th>
                <th>Descripción</th>
                <th>Unidad de medida</th>
                <th>Categoría</th>
                <th>Acción</th>
            </tr>
            </thead><tbody id="allProducts">`;
            resolve.forEach(element => {
                html += `<tr id='${element.nom_pro.replace(/\s/g, "")}Table'>
                    <td>${element.nom_pro}</td>
                    <td>${element.precom_pro}</td>
                    <td>${element.canivt_pro}</td>
                    <td>${element.des_pro}</td>
                    <td>${element.nom_unm}</td>
                    <td>${element.nom_tpo}</td>
                    <td><input type="button" value="Agregar" 
                    onclick="addProductToSell('${element.nom_pro}',${element.precom_pro},1,'${element.nom_pro.replace(/\s/g, "")}Table','${element.nom_unm}','${element.nom_tpo}','${element.des_pro}',${element.canivt_pro})"></td>
                    </tr>`;
            });
            html += "</tbody></table>"
            res.send(html);
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/registerSellSlave", (req, res) => {
    try {
        var sell = [];
        var hour = regular.getOnlyHour();
        var date = regular.getOnlyDate();
        req.body.data.forEach(element1 => {
            var x = -1;
            var i = 0;
            sell.forEach(element2 => {
                if (element2.nom_pro == element1.nom_pro) {
                    x = i;
                }
                else {
                    i++;
                }
            });
            if (x != -1) {
                sell[x].can_ivt += Math.round(element1.can_ivt);
            }
            else {
                sell.push({
                    nom_pro: element1.nom_pro,
                    can_ivt: Math.round(element1.can_ivt)
                });
            }
        });
        bd.getUserIdByEmail(req.session.email).then((resolve) => {
            sell.forEach(element => {
                bd.registerSell(req.session.chiefEmail, req.session.deal, resolve, element, hour, date);
            });
            res.send("");
        });
    } catch (err) {
        console.log(err);
    }
});

/*----------------------------------------Android------------------------------*/

const verification = "!FSDG%$/FSD3245tsasdsawetyh";

app.post("/login_Android", (req, res) => {
    try {
        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        }
        else {
            let email = cipher.encryptAES(cipher.decryptA(req.body.data2));
            let pass = cipher.encryptAES(cipher.decryptA(req.body.data3));
            getUser(email).then((resolve) => {
                if (resolve == null || resolve == undefined || resolve.length == 0) {
                    res.send("!exist");
                }
                else {
                    if (resolve[0].id_tus != 2) {
                        res.send("!level");
                    } else {
                        if (resolve[0].pas_use != pass) {
                            res.send("!pass");
                        }
                        else {
                            res.send(resolve[0].id_neg);
                        }
                    }
                }
            });
        }
    } catch (e) { console.log(e); }
});

app.post("/getDeals_Android", (req, res) => {
    try {
        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        } else {

            let email = cipher.encryptAES(cipher.decryptA(req.body.data2));

            getDeals(email).then((resolve) => {
                let json = [];
                resolve.forEach(element => {
                    json.push({
                        nom_neg: cipher.decryptAES(element.nom_neg),
                        id_neg: element.id_neg
                    });
                });
                res.send(cipher.encryptA(JSON.stringify(json)));
            });
        }
    } catch (e) { console.log(e); }
});

app.post("/getSlaves_Android", (req, res) => {
    try {
        let email = cipher.encryptAES(cipher.decryptA(req.body.data3));
        let id_neg = req.body.data2.trim();
        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        } else {

            getSlaves(email, id_neg).then((resolve) => {
                let json = [];
                resolve.forEach(element => {
                    json.push({
                        id_use: element.id_use,
                        nom_use: cipher.decryptAES(element.nom_use),
                        cor_use: cipher.decryptAES(element.cor_use)
                    });
                });
                res.send(json);
            });


        }
    } catch (e) { console.log(e); }
});

app.post("/registerSlave_Android", (req, res) => {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });
        let code = req.body.data4.trim();
        let email = cipher.decryptA(req.body.data3);
        let id_neg = req.body.data2;

        connection.query("SELECT * FROM musuario WHERE code_use = ?", [code], (e, r, f) => {
            if (e) { console.log(e); }
            if (r == null || r == undefined || r.length == 0) {
                res.send("?");
            }
            else {
                if (r[0].tel_use == 0) {
                    connection.query("UPDATE musuario SET tel_use = ? WHERE code_use = ? AND caneg_use = 0", [id_neg, code], (err, res1, fields) => {
                        if (err) { console.log(err); }
                        bd.getSlaveByCode(code).then((resolve1) => {
                            fs.writeFileSync("./users/" + email.split("@")[0] + "/" + email.split("@")[0] + "-" + cipher.decryptAES(resolve1.cor_use).split("@")[0] + ".json", "[]", (err) => {
                                if (err) { console.log(err); }
                            });
                            res.send("");
                        });
                    });
                }
                else {
                    res.send("!");
                }
            }
        });


    } catch (e) { console.log(e); }
});

app.post("/getSells_Android", (req, res) => {
    try {
        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        } else {
            let email = cipher.encryptAES(cipher.decryptA(req.body.data3));
            let id_neg = req.body.data2;

            getSells(email, id_neg).then((resolve) => {
                res.send(resolve);

            });
        }
    } catch (e) { console.log(e); }
});

app.post("/verifyDigitalSign_Android", (req, res) => {
    try {
        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        } else {
            let email = cipher.decryptA(req.body.data3);
            let path = "./users/"+email.split("@")[0] + "/";
            fs.readFile(path+"sign"+req.body.data2+".sign",(err,data)=>{
                if(err){res.send("ok?");}
                if (data.toString("utf8") != req.body.data4) {
                    res.send("ok!");
                }
                else {
                    res.send("ok=");
                }
            });
        }
    } catch (e) { console.log(e); }
});

app.post("/unregisterSlave_Android", (req, res) => {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });

        if (req.body.data1 != verification) {
            res.send("Intentalo más tarde");
        } else {

            var id = req.body.data2;
            var name = cipher.decryptA(req.body.data3);
            var email = cipher.decryptA(req.body.data4);
            var nameA = cipher.encryptAES(cipher.decryptA(req.body.data5));

            bd.getSlaveByIdAndName(id, nameA).then((resolve) => {
                fs.unlinkSync("./users/" + email.split("@")[0] + "/" + email.split("@")[0] + "-" + name.split("@")[0] + ".json", (err) => {
                    if (err) console.log(err);
                });
                connection.query("UPDATE musuario SET tel_use = 0 WHERE id_use = ? AND nom_use = ?", [id, nameA]);
                res.send("");
            });
        }
    } catch (err) { console.log(err); }
});

function getUser(email) {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });

        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM musuario WHERE cor_use = ?", [email], (err, res, fields) => {
                resolve(res);
            });
        });
    } catch (e) { console.log(e); }
}

function getSlaves(email, id_neg) {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });

        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM musuario WHERE tel_use = (SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE cor_use= ? AND id_neg= ?)", [email, id_neg], (err, res, fields) => {
                resolve(res);
            });
        });
    } catch (e) { console.log(e); }
}

function getSells(email, id_neg) {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });

        return new Promise(function (resolve, reject) {
            connection.query("SELECT nom_pro,sum(can_eve) as can_eve FROM eventa NATURAL JOIN mproducto NATURAL JOIN musuario WHERE id_neg = (SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ?) GROUP BY nom_pro", [id_neg, email], (err, res, fields) => {
                resolve(res);
            });
        });
    } catch (e) { console.log(e); }
}

function getDeals(email) {
    try {
        const mysql = require('mysql');
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'asnoga_asnoga',
            password : '7ULy,xSxv%!=',
            database : 'asnoga_asno'
        });

        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ?", [email], (err, res, fields) => {
                if (res == null || res == undefined) {
                    resolve("-");
                }
                else {
                    resolve(res);
                }
            });
        });
    } catch (e) { console.log(e); }
}

/*----------------------------------------Automatización------------------------------*/

new CronJob('0 0 0 * * *', function () {
    exec("mysqldump -u -p -B > /bd/ASNO" + regular.getDateDumpFormat() + ".sql", (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
        }
    });
}, null, true, 'America/Los_Angeles');

http.listen(app.get('port'),'0.0.0.0', () => {
    console.log('Server on port', app.get('port'))
})