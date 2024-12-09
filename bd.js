const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');
const bd = require("./bd");
let regular = require('./regular');
const cipher = require('./encrypt');

let connection = mysql.createConnection({
	host     : '',
	user     : '',
	password : '',
	database : ''
});

const token = 198723;

exports.getLevel = function(email){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM musuario WHERE cor_use = ?",[email],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res[0]);
            });
        });
    }catch(err){console.log(err);}
};

exports.getChief = function(email){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM dnegocio natural join musuario WHERE id_neg = (SELECT tel_use FROM musuario WHERE cor_use = ?)",[email],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res[0]);
            });
        });
    }catch(err){console.log(err);}
};

exports.getCodeSlave = function(email){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM musuario WHERE cor_use = ?",[email],(err,res1,fields)=>{
                if(err)console.log(err);
                resolve(res1);
            });
        });
    }catch(err){console.log(err);}
};

exports.getSlaveByName = function(emailChief,name){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM musuario where tel_use IN (SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ?) and nom_use = ?",[emailChief,name],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res[0]);
            });
        });
    }catch(err){console.log(err);}
};

exports.dropSlave = function(email,deal,code){
    try{
        return new Promise(function(resolve,reject){
            bd.getDealID(email,deal).then(function(resolve1){
                if(resolve1==0){
                    resolve("!");
                }
                else{
                    connection.query("UPDATE musuario SET tel_use = 0 WHERE code_use = ? AND tel_use = ?",[code,resolve1],(err,res,fields)=>{
                        resolve("");
                    });
                }
            });   
        });
    }catch(err){console.log(err);}
};

exports.registerSlave = function(email,deal,code){
    try{
        return new Promise(function(resolve,reject){
            bd.getDealID(email,deal).then(function(resolve1){
                if(resolve1==0){
                    resolve("!");
                }
                else{
                    connection.query("UPDATE musuario SET tel_use = ? WHERE code_use = ? AND caneg_use = 0",[resolve1,code],(err,res,fields)=>{
                        resolve("");
                    });
                }
            });   
        });
    }catch(err){console.log(err);}
};

exports.getSlaveByCode = function(code){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM musuario WHERE code_use = ?",[code],(err,res,fields)=>{
                resolve(res[0]);
            });
        });
    }catch(err){console.log(err);}
};

exports.getSlaveByIdAndName = function(id,name){
    try{
        return new Promise(function(resolve,reject){
            var temp = Math.sqrt(id);
            connection.query("SELECT * FROM musuario WHERE id_use = ? AND nom_use = ?",[token-temp,name],(err,res,fields)=>{
                resolve(res[0]);
            });
        });
    }catch(err){console.log(err);}
};

exports.getSlaves = function(email,deal){
    try{
        return new Promise(function(resolve,reject){
            connection.query(`SELECT * FROM musuario WHERE tel_use = (SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE cor_use= ? AND nom_neg= ? )`,[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                var table = `<table class="table">
                                <tbody>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Acción</th>
                                    </tr>`;
                if(res.length==0){
                    table += `<tr>No hay trabajadores registrados</tr>`;
                }
                var i = 0;
                res.forEach(element => {
                    if(element.cor_use == email){}
                    else{
                        var id = parseFloat(Math.pow(token-element.id_use,2));
                        i++;
                        table+=`
                        <tr>
                            <td>${i}</td>
                            <td>${require('./encrypt').decryptAES(element.nom_use)}</td>
                            <td>${require('./encrypt').decryptAES(element.cor_use)}</td>
                            <td><input type="button" value="Dar de baja" onclick="deleteSlave(${id},'${require('./encrypt').decryptAES(element.nom_use)}');" class="btn btn-danger"></td>
                        </tr>`;
                    }
                });
                table += `</tbody></table>`;
                resolve(table);
            });
        });
    }catch(err){console.log(err);}
};

exports.deleteUser = function(id,name){
    try{
        var temp = Math.sqrt(id);
        connection.query("DELETE FROM musuario WHERE id_use = ? AND nom_use = ?",[token-temp,name]);    
    }catch(err){console.log(err);}
};

exports.unregisterSlave = function(id,name){
    try{
        var temp = Math.sqrt(id);
        connection.query("UPDATE musuario SET tel_use = 0 WHERE id_use = ? AND nom_use = ?",[token-temp,name]);    
    }catch(err){console.log(err);}
};

exports.getUsers = function(){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM musuario NATURAL JOIN dtipo_usuario ORDER BY id_tus,RAND()",(err,res,fields)=>{
                if(err)console.log(err);
                var table = `			
                <table class="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>
                                #
                            </th>
                            <th>
                                Nombre
                            </th>
                            <th>
                                Correo
                            </th>
                            <th>
                                Última conexión
                            </th> 
                            <th>
                                Privilegio
                            </th>
                            <th>
                                Eliminar
                            </th>
                        </tr>
                    </thead>
                <tbody>`;
                var i = 0;
                res.forEach(element => {              
                    if(element.id_use==1){}
                    else{
                        i++;
                        if(element.id_tus==1){
                            table+=`
                            <tr>
                            <td>${i}</td>
                            <td>${require("./encrypt").decryptAES(element.nom_use)}</td>
                            <td>${require("./encrypt").decryptAES(element.cor_use)}</td>
                            <td>${element.con_use}</td>
                            <td>${element.nom_tus}</td>
                            <td><a href="#" class="btn btn-success">Sin acción</a></td>
                            </tr>
                            `;
                        }
                        else{
                            
                            var id = parseFloat(Math.pow(token-element.id_use,2));
                            table+=`
                            <tr>
                            <td>${i}</td>
                            <td>${require("./encrypt").decryptAES(element.nom_use)}</td>
                            <td>${require("./encrypt").decryptAES(element.cor_use)}</td>
                            <td>${element.con_use}</td>
                            <td>${element.nom_tus}</td>
                            <td><input type="button" value="Eliminar" onclick="deleteUser('${id}','${element.nom_use}');" class="btn btn-danger"></td>
                            </tr>
                            `;
                        }
                        
                    }   
                });
                table+="</tbody></table>"
                resolve(table);
            });
        }catch(err){console.log(err);}
    });
};

exports.getDeals = function(email){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ?",[email],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res);
            });
        }catch(err){console.log(err);}
    });  
};

exports.findEmail = function(email){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM musuario WHERE cor_use = ?",[email],(err,res,fields)=>{
                resolve(res);
            });
        }catch(err){console.log(err);}
    });
};

exports.getDealID = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve(0);
                    return;
                }
                else{
                    resolve(res[0].id_neg);
                }
            });
        }catch(err){console.log(err);}
    });
};
/*
exports.getInventory = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM mproducto NATURAL JOIN musuario NATURAL JOIN dnegocio WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay productos registrados");
                    return;
                }
                else{
                    var html = `			
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>
                                <th>
                                    Nombre
                                </th>
                                <th>
                                    Descripción
                                </th>
                                <th>
                                    Cantidad
                                </th> 
                                <th>
                                    Ventas en el último mes
                                </th>
                                <th>
                                    Editar
                                </th>
                                <th>
                                    Eliminar
                                </th>
                            </tr>
                        </thead>
                        <tbody>`;
                        var i = 0;
                    res.forEach(element => {
                        i++;
                        if(i%2==0){
                            html += `<tr class="table-active">`;
                        }
                        else{
                            html +="<tr>";
                        }
                        html +=`
                            <td>
                                1
                            </td>
                            <td>
                                ${element.nom_pro}
                            </td>
                            <td>
                                ${element.des_pro}
                            </td>
                            <td>
                                ${element.canivt_pro}
                            </td>
                            <td>
                                Ventas en el último mes.
                            </td>
                            <td>
                                <a href="#">Editar</a>
                            </td>
                            <td><a href="#">Eliminar</a></td>
                        </tr>`;
                    });
                    html+="</tbody></table>"
                    resolve(html);
                }
            });
        }catch(err){console.log(err);}
    });
};*/

exports.registerUser = function (user, email, password) {
    return new Promise(function (resolve, reject) {
        try{

            connection.query("SELECT * FROM musuario WHERE cor_use = ?", [email], (err2, results2, fields2) => {
                if(err2){
                    console.log(err2);
                }
                if(results2.length == 0){

                    var date = regular.getDate();

                    var code = regular.codeUser();

                    connection.query("SELECT * FROM musuario WHERE code_use = ? ",[code],(err,res,fields)=>{
                        
                        if(err)console.log(err);
                        if(res==null || res==undefined || res.length==0){
                            connection.query("INSERT INTO musuario SET ?", {
                            "nom_use": user, "cor_use": email, "pas_use": password,"tel_use": 0, "caneg_use": 0, "con_use": date, "id_tus": 4,"code_use":code
                            },(err3, results3, fields3) => {
                                if(err3){
                                    console.log(err3);
                                }
                                else{
                                    resolve("Registro completado, Inicie sesión para continuar");
                                    return;
                                }
                            });
                               
                        }
                        else{
                            code = regular.codeUser();
                        }
                    });
                
                }
                else{
                    resolve("El correo ya está registrado");
                }
            });

        }catch(err){
            console.log(err);
        }
    });
};

exports.loginUser = function(email, pass) {
    return new Promise(function(resolve, reject) {
        try{

            connection.query("SELECT * FROM musuario", [], (e,r,f) => {
                r.forEach(element => {
                    console.log(cipher.decryptAES(element["pas_use"]));
                });
            });

            connection.query("SELECT * FROM musuario WHERE cor_use = ?",[email],(err,results,fields)=>{
                if(err)console.log(err);
                if(results.length == 0){
                    resolve("El usuario no existe");
                }
                else{
                    if(results[0].pas_use == pass){

                        var date = regular.getDate();

                        connection.query("UPDATE musuario SET con_use = ? WHERE cor_use = ?",[date,email]);
                        resolve(results[0]);
                    }
                    else{
                        resolve("Contraseña incorrecta");
                    }
                }
            });

        }catch(err){
            console.log(err);
        }
    });
};

exports.updateLevelUser = function(email,level){
    try{

        connection.query("UPDATE musuario SET id_tus = ? WHERE cor_use = ?",[level,email],(err,results,fields)=>{
            if(err)console.log(err);
        });

    }catch(err){
        console.log(err);
    }
};

exports.updatePassword = function(email,pass){
    try{

        connection.query("UPDATE musuario SET pas_use = ? WHERE cor_use = ?",[pass,email],(err,results,fields)=>{
            if(err)console.log(err);
        });

    }catch(err){
        console.log(err);
    }
};

exports.loadCSV = function(email,file,deal){

    return new Promise(function(resolve, reject) {

        try{
            
            var i = 0;
            connection.query("DELETE FROM mproducto WHERE id_neg= ?",[deal],(err,results,fields)=>{

                if(err)console.log(err);

                var readStream = fs.createReadStream(file);

                var rd = readline.createInterface({
                    input: readStream,
                    console: false
                });

                rd.on('line', function(line) {
            
                    if(line.length==0){
                        rd.close();
                        rd.removeAllListeners();
                        readStream.destroy();
                        resolve("");
                    }

                    var date = regular.getDate();

                    var name = line.split(",")[0];
                    var sell = line.split(",")[1];
                    var buy = line.split(",")[2];
                    var quantity = line.split(",")[3];
                    var description = line.split(",")[4];
                    var type = 1;
                    var unm = 1;
                    
                    if(i!=0){

                        if(!regular.onlyLetters.test(name)){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("Hay un error en los nombres del archivo");
                            return;
                        }
                        else if(!regular.decimal.test(sell)){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("Hay un error en el precio de venta del archivo");
                            return;
                        }
                        else if(!regular.decimal.test(buy)){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("Hay un error en el precio de compra del archivo");
                            return;
                        }
                        else if(!regular.onlyNumbers.test(quantity)){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("Hay un error en la cantidad de producto del archivo");
                            return;
                        }
                        else{
                            sell = parseFloat(sell).toFixed(2);
                            buy = parseFloat(buy).toFixed(2);
    
                            connection.query("INSERT INTO mproducto SET ?",{"nom_pro":name,"preven_pro":sell,"precom_pro":buy,"fecivt_pro":date,"canivt_pro":quantity,
                            "des_pro":description,"id_unm":unm,"id_tpo":type,"id_neg":deal},(err1,results1,fields1)=>{
                                if(err1)console.log(err1);     
                            });
    
                        }
                    }
                    else{
                        if(name!="nombre"){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("No está el formato especificado, revisa el encabezado de nombre");
                        }
                        if(sell!="venta"){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("No está el formato especificado, revisa el encabezado de venta");}
                        if(buy!="compra"){
                            rd.close();resolve("No está el formato especificado, revisa el encabezado de compra");}
                        if(quantity!="cantidad"){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("No está el formato especificado, revisa el encabezado de cantidad");}
                        if(description!="descripcion"){
                            rd.close();
                            rd.removeAllListeners();
                            readStream.destroy();
                            resolve("No está el formato especificado, revisa el encabezado de descripción");}
                    }

                    i++;

                });

                rd.on("close",()=>{
                    resolve("");
                });
                    
            });

        }catch(err){
            console.log(err);
            resolve("El archivo subido no es un csv");
        }

    });

};

//Este es el proyecto Final

/*-------------Parte de Angel----------------*/
exports.getSales = function (user, deal, flag, after, before) {
    try{
        return new Promise((resolve, reject) => {
            //Si tiene rango de fechas
            if (flag != 'Todo') {
                connection.query("select * from eventa natural join mproducto natural join dnegocio natural join musuario where id_neg=? and cor_use=? and fecven_eve >= ? and fecven_eve <= ?",
                    [deal, user, before, after], (err, results, fields) => {
                        if (err) console.log(err);
                        resolve(results);
                    });
            } else {
                connection.query("select * from eventa natural join mproducto natural join dnegocio natural join musuario where id_neg=? and cor_use=?",
                    [deal, user], (err, results, fields) => {
                        if (err) console.log(err);
                        resolve(results);
                    });
            }

        });
    }catch(err){
        console.log(err);
    }
}

exports.getProductsToGraphics = function(user, deal, product, after, before, flag){
    try{
        return new Promise((resolve, reject)=>{
            if(flag != 'Todo'){
                connection.query('select * from eventa natural join mproducto natural join dnegocio natural join musuario where id_neg=? and cor_use=? and nom_pro=? and fecven_eve >= ? and fecven_eve <= ?',
                [deal, user, product, before, after], (err, results, fields)=>{
                    if(err){console.log(err);}
                    resolve(results);
                })
            }else{
                connection.query('select * from eventa natural join mproducto natural join dnegocio natural join musuario where id_neg=? and cor_use=? and nom_pro=?',
                [deal, user, product], (err,results,fields)=>{
                    if(err){console.log(err);}
                    resolve(results);
                }); 
            }
        });
    }catch(err){
        console.log(err);
    }
}

exports.getProducts = function(user, deal){
    try{
        return new Promise((resolve, reject)=>{
            connection.query("select * from mproducto natural join dnegocio natural join musuario where cor_use=? and id_neg=?", [user, deal],
            (err, results, fields)=>{
                if(err)console.log(err);
                resolve(results);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.getInventory = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM mproducto NATURAL JOIN musuario NATURAL JOIN dnegocio WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay productos registrados");
                    return;
                }
                else{
                    var html = `			
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>
                                <th>
                                    Nombre
                                </th>
                                <th>
                                    Descripción
                                </th>
                                <th>
                                    Precio de Venta
                                </th>
                                <th>
                                    Precio de Compra
                                </th>
                                <th>
                                    Cantidad Actual
                                </th> 
                                <th>
                                    Ventas en el último mes
                                </th>
                                <th>
                                    Editar
                                </th>
                                <th>
                                    Eliminar
                                </th>
                                <th>
                                    Cantidad a Añadir
                                </th>
                                <th>
                                    Añadir
                                </th>
                            </tr>
                        </thead>
                        <tbody>`;
                        var i = 0;
                    res.forEach(element => {
                        i++;
                        if(i%2==0){
                            html += `<tr class="table-active">`;
                        }
                        else{
                            html +="<tr>";
                        }
                        html +=`
                            <td>
                                ${i}
                            </td>
                            <td>
                               ${element.nom_pro}
                            </td>
                            <td>
                                ${element.des_pro}
                            </td>
                            <td>
                                $${element.preven_pro}
                            </td>
                            <td>
                                $${element.precom_pro}
                            </td>
                            <td>
                                ${element.canivt_pro}
                            </td>
                            <td>
                                Ventas en el último mes.
                            </td>
                            <td>
                                <input type="button" value="Editar" onclick="editProduct(${element.id_pro});" class="btn btn-warning">
                            </td>
                            <td>
                                <input type="button" value="Eliminar" onclick="deleteProduct(${element.id_pro});" class="btn btn-danger">
                            </td>
                            <td>
                                <input type="button" value="-" onclick="reduceQuantity(${element.id_pro});" class="btn btn-secondary"><input type="text" id="${element.id_pro}" disabled class="form-control"><input type="button" value="+" onclick="addQuantity(${element.id_pro});" class="btn btn-light">
                            </td>
                            <td>
                                <input type="button" value="Añadir" onclick="addActualQuantity(${element.id_pro});" class="btn btn-success">
                            </td>
                        </tr>`;
                    });
                    html+="</tbody></table>"
                    resolve(html);
                }
            });
        }catch(err){console.log(err);}
    });
};

exports.getTypeProducts = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM ctipo_producto NATURAL JOIN dnegocio NATURAL JOIN musuario where cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay tipos de producto registrados");
                    return;
                }
                else{
                    let htmlTypeProduct = `<table class="table table-bordered table-hover">
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Nombre Tipo Producto</th>
                            <th>Editar</th>
                            <th>Eliminar</th>
                        </tr>`;
                        var i = 0;
                        res.forEach(element => {
                        i++;
                        if(i%2==0){
                            htmlTypeProduct += `<tr class="table-active">`;
                        }
                        else{
                            htmlTypeProduct +="<tr>";
                        }
                        htmlTypeProduct +=`
                            <td>
                                ${i}
                            </td>
                            <td>
                                ${element.nom_tpo}
                            </td>
                            <td>
                                <input type="button" value="Editar" onclick="editType(${element.id_tpo});" class="btn btn-warning">
                            </td>
                            <td>
                                <input type="button" value="Eliminar" onclick="deleteType(${element.id_tpo});" class="btn btn-danger">
                            </td>
                        </tr>`;
                    });
                    htmlTypeProduct+="</tbody></table>";
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}

exports.getSelectTypeProducts = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM ctipo_producto NATURAL JOIN dnegocio NATURAL JOIN musuario where cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay tipos de producto registrados");
                    return;
                }
                else{
                    let htmlTypeProduct = `<select id="tpo" size=1>`;
                        var i = 0;
                        res.forEach(element => {
                        htmlTypeProduct += `<option value="${element.nom_tpo}">${element.nom_tpo}</option>`;
                        i++;
                    });
                    htmlTypeProduct +="</select>";
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}
exports.getMetricUnits = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM cunidad_medida NATURAL JOIN dnegocio NATURAL JOIN musuario where cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay unidades de medida registradas");
                    return;
                }
                else{
                    let htmlTypeProduct = `<table class="table table-bordered table-hover" id="tableUnitMetric">
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Nombre Unidad Medida</th>
                            <th>Editar</th>
                            <th>Eliminar</th>
                        </tr>`;
                        var i = 0;
                        res.forEach(element => {
                        i++;
                        if(i%2==0){
                            htmlTypeProduct += `<tr class="table-active">`;
                        }
                        else{
                            htmlTypeProduct +="<tr>";
                        }
                        htmlTypeProduct +=`
                            <td>
                                ${i}
                            </td>
                            <td class="unit">
                                ${element.nom_unm}
                            </td>
                            <td>
                                <input type="button" value="Editar" class="updateButton btn btn-warning" onclick="editUnity(${element.id_unm});">
                            </td>
                            <td>
                                <input type="button" value="Eliminar" onclick="deleteUnity(${element.id_unm});" class="btn btn-danger">
                            </td>
                            
                        </tr>`;
                    });
                    htmlTypeProduct += `</tbody></table>`; 
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}

exports.getSelectMetricUnits = function(email,deal){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM dnegocio NATURAL JOIN musuario WHERE cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("El negocio no está registrado");
                    return;
                }
            });
            connection.query("SELECT * FROM cunidad_medida NATURAL JOIN dnegocio NATURAL JOIN musuario where cor_use = ? and nom_neg = ?",[email,deal],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay unidades de medida registradas");
                    return;
                }
                else{
                    let htmlTypeProduct = `<select id="mun" size=1>`;
                        var i = 0;
                        res.forEach(element => {
                        htmlTypeProduct += `<option value="${element.nom_unm}">${element.nom_unm}</option>`;
                        i++;
                    });
                    htmlTypeProduct +="</select>";
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}

exports.getIdTypeProduct = function(nom_tpo,id_neg){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT id_tpo FROM ctipo_producto WHERE id_neg = ? and nom_tpo = ?",[id_neg,nom_tpo],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    resolve(res[0].id_tpo);
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.getIdMetricUnit = function(nom_unm,id_neg){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT id_unm FROM cunidad_medida WHERE id_neg = ? and nom_unm = ?",[id_neg,nom_unm],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    resolve(res[0].id_unm);
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.addProduct = function(product,date,id_unm,id_tpo,id_neg){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT nom_pro FROM mproducto WHERE id_neg = ? and nom_pro = ?",[id_neg, product.name],(err,res,fields)=>{
                if(err){console.log(err)}
                if(res.length == 0){
                    connection.query("INSERT INTO mproducto(nom_pro,preven_pro,fecivt_pro,precom_pro,canivt_pro,des_pro,id_unm,id_tpo,id_neg) VALUES(?,?,?,?,?,?,?,?,?)",[product.name,product.preven,date,product.precom,product.canivt,product.des,id_unm,id_tpo,id_neg],(err,res,fields)=>{
                        if(err){
                            resolve("Producto No Registrado");
                        }
                        else{
                            resolve("Producto Registrado Éxitosamente");
                        }
                    });                    
                }else{
                    resolve("Producto ya Registrado");
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.addMetricUnit = function(nomu,id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT nom_unm FROM cunidad_medida WHERE id_neg = ? AND nom_unm = ?",[id_neg, nomu],(err,res,fields)=>{
                if(err){console.log(err)}
                let i = 0;
                if(res.length == 0){
                    connection.query("INSERT INTO cunidad_medida(nom_unm,id_neg) values(?,?)", [nomu,id_neg], (err,results,fields)=>{
                        if(err){console.log(err)}
                        else{
                            resolve("Unidad de Medida Registrada Exitosamente");
                        }
                    })
                }else{
                    resolve("Unidad de Medida ya registrada")
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.addTypeProduct = function(nomt, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT nom_tpo FROM ctipo_producto WHERE id_neg = ? and nom_tpo = ?",[id_neg, nomt],(err,res,fields)=>{
                if(err){console.log(err)}
                let i = 0;
                if(res.length == 0){
                    connection.query("INSERT INTO ctipo_producto(nom_tpo,id_neg) values(?,?)", [nomt,id_neg], (err,results,fields)=>{
                        if(err){console.log(err)}
                        else{
                            resolve("Tipo de Producto Registrado Exitosamente");
                        }
                    })
                }else{
                    resolve("Tipo de Producto ya registrado");
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.editProduct = function(id_pro, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT * FROM mproducto WHERE id_pro = ? AND id_neg = ?",[id_pro,id_neg],(err,res,fields)=>{
                if(err){console.log(err);}
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    resolve(res);
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.updateProduct = function(product,date,id_unm,id_tpo,id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT nom_pro FROM mproducto WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                if(err){console.log(err)}
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    let i = 0;
                    res.forEach(element =>{
                        if(element.nom_pro.toLowerCase() == product.name.toLowerCase()){
                            resolve("Producto ya Registrado");
                        }
                        else{
                            i++;
                            if(i == res.length){
                                connection.query("UPDATE mproducto SET nom_pro = ?, preven_pro = ?, fecivt_pro = ?, precom_pro = ?, canivt_pro = ?, des_pro = ?, id_unm = ?, id_tpo = ? WHERE id_pro = ? AND id_neg = ?",[product.name, product.preven, date, product.precom, product.canivt, product.des, id_unm, id_tpo, product.id, id_neg],(err,res,fields)=>{
                                    if(err){console.log(err);}
                                    if(res==null || res==undefined || res.length==0){
                                        resolve("Empty set");
                                    }
                                    else{
                                        resolve("Producto modificado");
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.editMetricUnit = function(id_unm, id_neg){
    return new Promise((resolve,rejext)=>{
        try{
            connection.query("SELECT * FROM cunidad_medida WHERE id_unm = ? AND id_neg = ?",[id_unm, id_neg],(err,res,fields)=>{
                if(err){console.log(err);}
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    resolve(res);
                }
            });
        }catch(err){console.log(err);}
    });  
}

exports.updateMetricUnit = function(unity,id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT nom_unm FROM cunidad_medida WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                let i = 0;
                res.forEach(element =>{
                    if(element.nom_unm.toLowerCase() == unity.nomu.toLowerCase()){
                        resolve("Unidad de Medida ya registrada");
                    }
                    else{
                        i++;
                        if(i == res.length){
                            connection.query("UPDATE cunidad_medida SET nom_unm = ? WHERE id_unm = ? AND id_neg = ?",[unity.nomu,unity.id,id_neg],(err,res,fields)=>{
                                if(err){
                                    resolve("Unidad de Medidia No Modificada");
                                }
                                else{
                                    resolve("Unidad de Medida Modificada Exitosamente");
                                }
                            })
                        }
                    }
                });
            });
        }catch(err){console.log(err);}
    });
};

exports.editTypeProduct = function(id_tpo, id_neg){
    return new Promise((resolve,rejext)=>{
        try{
            connection.query("SELECT * FROM ctipo_producto WHERE id_tpo = ? AND id_neg = ?",[id_tpo, id_neg],(err,res,fields)=>{
                if(err){console.log(err);}
                if(res==null || res==undefined || res.length==0){
                    resolve("Empty set");
                }
                else{
                    resolve(res);
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.updateTypeProduct = function(tipo, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT nom_tpo FROM ctipo_producto WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                let i = 0;
                res.forEach(element =>{
                    if(element.nom_tpo.toLowerCase() == tipo.nomt.toLowerCase()){
                        resolve("Tipo de Producto ya registrado");
                    }
                    else{
                        i++;
                        if(i == res.length){
                            connection.query("UPDATE ctipo_producto SET nom_tpo = ? WHERE id_tpo = ? AND id_neg = ?",[tipo.nomt,tipo.id,id_neg],(err,res,fields)=>{
                                if(err){
                                    resolve("Tipo de Producto No Modificado");
                                }
                                else{
                                    resolve("Tipo de Producto modificado");
                                }
                            })
                        }
                    }
                });
            });
        }catch(err){console.log(err);}
    });
}

exports.deleteProduct = function(product, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("DELETE FROM mproducto where id_pro = ? AND id_neg = ?",[product.id,id_neg],(err,res,fields)=>{
                if(err){
                    resolve("No se puede Eliminar");
                }
                else{
                    resolve("Producto Eliminado");
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.deleteType = function(type, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("DELETE FROM ctipo_producto where id_tpo = ? AND id_neg = ?",[type.id,id_neg],(err,res,fields)=>{
                if(err){
                    resolve("No se puede Eliminar");
                }
                else{
                    resolve("Tipo de Producto Eliminado");
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.deleteUnity = function(unity, id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("DELETE FROM cunidad_medida where id_unm = ? AND id_neg = ?",[unity.id,id_neg],(err,res,fields)=>{
                if(err){
                    resolve("No se puede Eliminar");
                }
                else{
                    resolve("Unidad de Medida Eliminada");
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.addQuantityProduct = function(product,deal){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT canivt_pro FROM mproducto WHERE id_pro = ? AND id_neg = ?",[product.id,deal],(err,res,fields)=>{
                if(err){console.log(err)}
                if(res==null || res==undefined || res.length==0){
                    resolve("No existe el producto");
                }
                else{
                    var quantity = res[0].canivt_pro;
                    var newInsert = (parseInt(quantity) + parseInt(product.can));
                    connection.query("UPDATE mproducto SET canivt_pro = ? WHERE id_pro = ? AND id_neg = ?",[newInsert,product.id,deal],(err,res,fields)=>{
                        if(err){
                            resolve("Cantidad no añadida");
                        }
                        else{
                            resolve("Cantidad Añadida");
                        }
                    })
                }
            });
        }catch(err){console.log(err);}
    });
}

exports.consultProductsHTML = function(product,id_neg){
    return new Promise((resolve,reject)=>{
        try{
            connection.query("SELECT * FROM mproducto WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay productos registrados");
                    return;
                }
                else{
                    var html = `			
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>
                                <th>
                                    Nombre
                                </th>
                                <th>
                                    Descripción
                                </th>
                                <th>
                                    Precio de Venta
                                </th>
                                <th>
                                    Precio de Compra
                                </th>
                                <th>
                                    Cantidad Actual
                                </th> 
                                <th>
                                    Ultima modificación
                                </th>
                                <th>
                                    Editar
                                </th>
                                <th>
                                    Eliminar
                                </th>
                                <th>
                                    Cantidad a Añadir
                                </th>
                                <th>
                                    Añadir
                                </th>
                            </tr>
                        </thead>
                        <tbody>`;
                        var i = 0;
                    res.forEach(element => {
                        i++;
                        if(product.text.toLowerCase() == element.nom_pro.substring(0,product.text.length).toLowerCase()){
                            if(i%2==0){
                                html += `<tr class="table-active">`;
                            }
                            else{
                                html +="<tr>";
                            }
                            html +=`
                                <td>
                                    ${i}
                                </td>
                                <td>
                                   ${element.nom_pro}
                                </td>
                                <td>
                                    ${element.des_pro}
                                </td>
                                <td>
                                    $${element.preven_pro}
                                </td>
                                <td>
                                    $${element.precom_pro}
                                </td>
                                <td>
                                    ${element.canivt_pro}
                                </td>
                                <td>
                                    aaaaaaaaaaaa >:v
                                </td>
                                <td>
                                    <input type="button" value="Editar" onclick="editProduct(${element.id_pro});">
                                </td>
                                <td>
                                    <input type="button" value="Eliminar" onclick="deleteProduct(${element.id_pro});">
                                </td>
                                <td>
                                    <input type="button" value="-" onclick="reduceQuantity(${element.id_pro});"><input type="text" id="${element.id_pro}" disabled><input type="button" value="+" onclick="addQuantity(${element.id_pro});">
                                </td>
                                <td>
                                    <input type="button" value="Añadir" onclick="addActualQuantity(${element.id_pro});">
                                </td>
                            </tr>`;
                        }
                        else{
                        }
                    });
                    html+="</tbody></table>"
                    resolve(html);
                }
            });

        }catch(err){console.log(err);}
    });
}

exports.consultTypeHTML = function(search,id_neg){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM ctipo_producto WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay tipos de producto registrados");
                    return;
                }
                else{
                    let htmlTypeProduct = `<table class="table table-bordered table-hover">
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Nombre Tipo Producto</th>
                            <th>Editar</th>
                            <th>Eliminar</th>
                        </tr>`;
                        var i = 0;
                        res.forEach(element => {
                        i++;
                        if(search.text.toLowerCase() == element.nom_tpo.substring(0,search.text.length).toLowerCase()){
                            if(i%2==0){
                                htmlTypeProduct += `<tr class="table-active">`;
                            }
                            else{
                                htmlTypeProduct +="<tr>";
                            }
                            htmlTypeProduct +=`
                                <td>
                                    ${i}
                                </td>
                                <td>
                                    ${element.nom_tpo}
                                </td>
                                <td>
                                    <input type="button" value="Editar" onclick="editType(${element.id_tpo});">
                                </td>
                                <td>
                                    <input type="button" value="Eliminar" onclick="deleteType(${element.id_tpo});">
                                </td>
                            </tr>`;
                        }
                        else{}
                    });
                    htmlTypeProduct+="</tbody></table>";
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}

exports.consultUnityHTML = function(search,id_neg){
    return new Promise(function(resolve,reject){
        try{
            connection.query("SELECT * FROM cunidad_medida WHERE id_neg = ?",[id_neg],(err,res,fields)=>{
                if(err)console.log(err);
                if(res==null || res==undefined || res.length==0){
                    resolve("No hay unidades de medida registradas");
                    return;
                }
                else{
                    let htmlTypeProduct = `<table class="table table-bordered table-hover">
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Nombre Unidad Medida</th>
                            <th>Editar</th>
                            <th>Eliminar</th>
                        </tr>`;
                        var i = 0;
                        res.forEach(element => {
                        i++;
                        if(search.text.toLowerCase() == element.nom_unm.substring(0,search.text.length).toLowerCase()){
                            if(i%2==0){
                                htmlTypeProduct += `<tr class="table-active">`;
                            }
                            else{
                                htmlTypeProduct +="<tr>";
                            }
                            htmlTypeProduct +=`
                                <td>
                                    ${i}
                                </td>
                                <td>
                                    ${element.nom_unm}
                                </td>
                                <td>
                                    <input type="button" value="Editar" onclick="editUnity(${element.id_unm});">
                                </td>
                                <td>
                                    <input type="button" value="Eliminar" onclick="deleteUnity(${element.id_unm});">
                                </td>
                            </tr>`;
                        }
                        else{}                     
                    });
                    htmlTypeProduct+="</tbody></table>";
                    resolve(htmlTypeProduct);
                }
            });
        }catch(err){
            console.log(err);
        }
    });
}
/*----------------------------------------Parte de Damián que no hizo Damián----------------------------------- */
exports.getProductsSell = function(id_neg,cor_use){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM mproducto NATURAL JOIN dnegocio NATURAL JOIN ctipo_producto NATURAL JOIN cunidad_medida NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ?",[id_neg,cor_use],(err,res,fileds)=>{
                if(err)console.log(err);
                resolve(res);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.getUnitySell = function(id_neg,cor_use){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM cunidad_medida NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ?",[id_neg,cor_use],(err,res,fileds)=>{
                if(err)console.log(err);
                resolve(res);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.getTypeSell = function(id_neg,cor_use){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM ctipo_producto NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ?",[id_neg,cor_use],(err,res,fileds)=>{
                if(err)console.log(err);
                resolve(res);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.filterProductsSell = function(type,unity,like,products,deal,email){
    try{
        return new Promise(function(resolve,reject){
            var array = [deal,email,"%"+type+"%","%"+unity+"%","%"+like+"%"];
            var query =  `SELECT * FROM mproducto NATURAL JOIN cunidad_medida NATURAL JOIN ctipo_producto NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ? AND  nom_tpo LIKE ? AND nom_unm LIKE ? AND nom_pro LIKE ?`;
            if(products==null || products == undefined){
                connection.query(query,array,(err,res,fields)=>{
                    if(err)console.log(err);
                    resolve(res);
                });
            }
            else{
                products.forEach(element => {
                    query += ` AND nom_pro != ?`;
                    array.push(element.nom_pro);
                });
                connection.query(query,array,(err,res,fields)=>{
                    if(err)console.log(err);
                    resolve(res);
                });
            } 
        });
    }catch(err){
        console.log(err);
    }
};

exports.getUserIdByEmail = function(email){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM musuario WHERE cor_use = ?",[email],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res[0].id_use);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.getProductByName = function(nom_pro,cor_use,id_neg){
    try{
        return new Promise(function(resolve,reject){
            connection.query("SELECT * FROM mproducto NATURAL JOIN dnegocio NATURAL JOIN musuario WHERE cor_use = ? AND id_neg = ? AND nom_pro = ?",[cor_use,id_neg,nom_pro],(err,res,fields)=>{
                if(err)console.log(err);
                resolve(res[0]);
            });
        });
    }catch(err){
        console.log(err);
    }
};

exports.registerSell = function(email,id_neg,id_use,product,hour,date){
    try{
        bd.getProductByName(product.nom_pro,email,id_neg).then((resolve)=>{     
            if(resolve.canivt_pro<product.can_ivt){
                var price = parseFloat(resolve.canivt_pro)*parseFloat(resolve.preven_pro);
                connection.query("INSERT INTO eventa SET ?",{tot_eve:price,can_eve:resolve.canivt_pro,fecven_eve:date,horven_eve:hour,id_pro:resolve.id_pro,id_use:id_use},(err,res,fields)=>{
                    if(err)console.log(err);
                    connection.query("UPDATE mproducto SET canivt_pro = ? WHERE id_pro = ?",[0,resolve.id_pro],(err2,res2,fields2)=>{
                        if(err2)console.log(err2);
                    });
                });
            }
            else{
                var price = parseFloat(product.can_ivt)*parseFloat(resolve.preven_pro);
                connection.query("INSERT INTO eventa SET ?",{tot_eve:price,can_eve:product.can_ivt,fecven_eve:date,horven_eve:hour,id_pro:resolve.id_pro,id_use:id_use},(err,res,fields)=>{
                    if(err)console.log(err);
                    var left = resolve.canivt_pro-product.can_ivt;
                    connection.query("UPDATE mproducto SET canivt_pro = ? WHERE id_pro = ?",[left,resolve.id_pro],(err2,res2,fields2)=>{
                        if(err2)console.log(err2);
                    });
                });
            }
        });
    }catch(err){
        console.log(err);
    }
};

exports.deleteDeal = function (pass, email, id_n) {
    return new Promise(function (resolve, reject) {
        try {
            let mensaje;
            connection.query("SELECT pas_use FROM musuario WHERE cor_use = ?", [email], (err, res, fields) => {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    const password = res[0].pas_use;
                    if (password === pass) {
                        connection.query("SELECT id_neg FROM dnegocio natural join musuario where nom_neg=? and cor_use=?", [id_n, email], (err2,results,fields)=>{
                            if(err2){console.log(err2)}
                            let id = 0;
                            results.forEach(element=>{
                                id = element.id_neg;
                            })
                            if(id!=0){
                                connection.query("DELETE FROM dnegocio WHERE id_neg = ?", [id], (err2, res2, fields2) => {
                                    if (err2) {
                                        console.log(err2);
                                    }
                                    else {
                                        resolve("Negocio eliminado correctamente");
                                    }
                                });
                            }else{
                                resolve("El negocio no existe, por favor no modifique el script");
                            }

                        });
                    }
                    else {
                        mensaje = "La contraseña ingresada es incorrecta";
                        resolve(mensaje);
                    }
                }
                else {
                    mensaje = "No existe usuario con aquel correo";
                    resolve(mensaje);
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
};

exports.editDeal = function (email, pass, oldName, newName) {
    return new Promise(function (resolve, reject) {
        try {
            let mensaje;
            connection.query("SELECT id_use, pas_use FROM musuario WHERE cor_use = ?", [email], (err, res, fields) => {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    let password = "";
                    res.forEach(element=>{
                        password = element.pas_use;
                    })
                    if (password === pass) {
                        connection.query("SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE nom_neg = ? AND cor_use = ?",
                            [oldName, email], (err2, res2, fields2) => {
                                if (err2) {
                                    console.log(err2);
                                }
                                if (res2.length == 1) {
                                    let id = 0;
                                    res2.forEach(element=>{
                                        id = element.id_neg;
                                    })
                                    connection.query("SELECT id_neg FROM dnegocio WHERE nom_neg = ?", [newName], (err,resul, fields)=>{
                                        if(err){console.log(err)}
                                        if(resul.length == 0){
                                            connection.query("UPDATE dnegocio SET nom_neg = ? WHERE id_neg = ?", [newName, id],
                                                (err3, res3, fields3) => {
                                                if (err3) {
                                                    console.log(err3);
                                                }
                                                else {
                                                    resolve("Negocio modificado exitosamente");
                                                }
                                            });
                                        }else{
                                            resolve("Ese negocio ya esta registrado");
                                        }
                                    });
                                }else if(res2.length == 0){
                                    resolve("No existe ningun neogico con ese nombre, por favor no modifiques el script");
                                }else {
                                    mensaje = "No puede cambiar el nombre: ya existe un negocio con este nombre";
                                    resolve(mensaje);
                                }
                            });
                    }
                    else {
                        mensaje = "La contraseña ingresada es incorrecta";
                        resolve(mensaje);
                    }
                }
                else {
                    mensaje = "No existe un usuario con tal contraseña";
                    resolve(mensaje);
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
};

exports.createDeal = function (email, pass, nombre) {
    return new Promise(function (resolve, reject) {
        try {
            let mensaje;
            let id;
            connection.query("SELECT id_use FROM musuario WHERE cor_use = ?", [email], (err, res, fields) => {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    id = res[0].id_use;
                    connection.query("SELECT pas_use FROM musuario WHERE id_use = ?", [id], (err2, res2, fields2) => {
                        if (err2) {
                            console.log(err2);
                        }
                        if (res2) {
                            const password = res2[0].pas_use;
                            if (password === pass) {
                                connection.query("SELECT nom_neg FROM dnegocio NATURAL JOIN musuario WHERE id_use= ?",
                                    [id], (err5, results, fields) => {
                                        if (err5) { console.log(err5) };
                                        if (results.length < 5) {
                                            //********************** */
                                            connection.query("SELECT nom_neg FROM dnegocio WHERE nom_neg = ? AND id_use = ?", [nombre, id],
                                                (err3, res3, fields3) => {
                                                    if (err3) {
                                                        console.log(err3);
                                                    }
                                                    if (res3.length == 0) {
                                                        connection.query("INSERT INTO dnegocio SET ?", { "nom_neg": nombre, "id_use": id },
                                                            (err4, results4, fields4) => {
                                                                if (err4) {
                                                                    console.log(err4);
                                                                }
                                                                else {
                                                                    resolve("");
                                                                }
                                                            });
                                                    }
                                                    else {
                                                        mensaje = "Ya tienes un negocio con este nombre";
                                                        resolve(mensaje);
                                                    }
                                                });
                                        } else {
                                            resolve("Llegaste al limites de negocios");
                                        }
                                    })

                            }
                            else {
                                mensaje = "La contraseña ingresada es incorrecta";
                                resolve(mensaje);
                            }
                        }
                        else {
                            mensaje = "Error: no hay usuario con ese correo";
                            resolve(mensaje);
                        }
                    });
                }
                else {
                    mensaje = "Error: no existe este usuario";
                    resolve(mensaje);
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
};

exports.getSells = function(email,id_neg){
    return new Promise(function(resolve,reject){
        connection.query("SELECT nom_pro,nom_use,tot_eve,can_eve,preven_pro,horven_eve,DATE_FORMAT(fecven_eve, '%d/%m/%Y') as fecven_eve  FROM eventa NATURAL JOIN mproducto NATURAL JOIN musuario WHERE id_neg = (SELECT id_neg FROM dnegocio NATURAL JOIN musuario WHERE id_neg = ? AND cor_use = ?) GROUP BY id_eve",[id_neg,email],(err,res,fields)=>{
            resolve(res);
        });
    });
};

exports.getUsersByDate = function(){
    return new Promise(function(resolve,reject){
        connection.query("SELECT COUNT(*) as Número,DATE_FORMAT(con_use, '%d/%c/%Y') as Fecha FROM musuario WHERE con_use <= CURDATE()  AND con_use >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK) group by con_use",(err,res,fields)=>{
            resolve(res);
        });
    });
};

exports.getTotalSells = function(){
    return new Promise(function(resolve,reject){
        connection.query("SELECT SUM(can_eve) AS venta,DATE_FORMAT(fecven_eve, '%d/%c/%Y') as date FROM eventa GROUP BY fecven_eve",(err,res,fields)=>{
            resolve(res);
        });
    });
};