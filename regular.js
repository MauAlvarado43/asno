exports.onlyLetters = /^[A-Za-záéíóú\_\-\.\s\xF1\xD1]+$/;
exports.onlyNumbers = /^([0-9])*$/;
exports.email = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
exports.decimal = /^[0-9]?([.])?([0-9]+){1,2}?$/;

exports.replaceSpaces = function(txt){
    return txt.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
}

exports.codeUser = function(){
    var letter = "QWERTYUIOPASDFGHJKLÑZXCVBNM";
    var numbers = "0123456789";
    var code = "";

    for(var i = 0; i < 10; i++){
        if(i<3){
            var j = Math.floor(Math.random() * (letter.length - 1)) + 1;
            code += letter[j];
        }
        else if(i==3){
            code += "-";
        }
        else if(i>3 && i<8){
            var j = Math.floor(Math.random() * (numbers.length - 1)) + 1;
            code += numbers[j];
        }
        else if(i==8){
            code += "-";
        }
        else{
            var j = Math.floor(Math.random() * (letter.length - 1)) + 1;
            code += letter[j];
        }
    }
    return code;
}

exports.getDate = function(){
    var dateTemp = new Date();

    var day = dateTemp.getDate();
    var month = dateTemp.getMonth() + 1;
    var year = dateTemp.getFullYear();

    var seconds = dateTemp.getSeconds();
    var minutes = dateTemp.getMinutes();
    var hour = dateTemp.getHours();

    var date = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;

    return date;
}

exports.getDateDumpFormat = function(){
    var dateTemp = new Date();

    var day = dateTemp.getDate();
    var month = dateTemp.getMonth() + 1;
    var year = dateTemp.getFullYear();

    var seconds = dateTemp.getSeconds();
    var minutes = dateTemp.getMinutes();
    var hour = dateTemp.getHours();

    var date = hour+minutes+seconds+"_"+year+month+day;

    return date;
}

exports.getOnlyDate = function(){

    var dateTemp = new Date();

    var day = dateTemp.getDate();
    var month = dateTemp.getMonth() + 1;
    var year = dateTemp.getFullYear();

    var date = year + "-" + month + "-" + day;

    return date;

}

exports.getOnlyHour = function(){

    var dateTemp = new Date();

    var seconds = dateTemp.getSeconds();
    var minutes = dateTemp.getMinutes();
    var hour = dateTemp.getHours();

    var date = hour + ":" + minutes + ":" + seconds;

    return date;

}

exports.generatePDF = function(email,id_neg){
    return new Promise(function(resolve,reject){

        var fs = require('fs')
        var pdf = require('html-pdf');
        var encrypt = require('./encrypt');
        var bd = require('./bd');

        var path = "./users/" + require('./encrypt').decryptAES(email).split("@")[0] + "/";
        
        bd.getSells(email,id_neg).then((resolve1)=>{
            var txt = `
            <html>\n
            <head>\n               
                <link rel="stylesheet" href="${"file:///"+__dirname.replace(/\\/g,"/")}/public/css/tablePDF.css" type="text/css">\n
            </head>\n
            <body>\n
                <table id='table' class='table'>\n
                    <tr class="header" style="background-color: #000000;">\n
                        <th style="text-align:center;">Vendedor</th>\n
                        <th style="text-align:center;">Fecha y hora</th>\n
                        <th style="text-align:center;">Producto</th>\n
                        <th style="text-align:center;">Cantidad</th>\n
                        <th style="text-align:center;">Precio</th>\n
                        <th style="text-align:center;">Total</th>\n
                    </tr>\n
            `;
            var toSing = "";
            var tempDate = "";
            var tempHour = "";
            var tempUse = "";
            var json = [];
            var objectTemp = [];
            resolve1.forEach(element => {
                if(element.fecven_eve==tempDate && element.horven_eve==tempHour){
                    tempHour = element.horven_eve;
                    tempUse = element.nom_use;
                    tempDate = element.fecven_eve;
                    objectTemp.push({
                        product: element.nom_pro,
                        cant: element.can_eve,
                        total: element.tot_eve,
                        price: element.preven_pro
                    });
                }
                else if(element.fecven_eve!=tempDate || element.horven_eve!=tempHour){
                    json.push({
                        user: tempUse,
                        date: tempDate,
                        hour: tempHour,
                        products:objectTemp
                    });
                    objectTemp = [];
                    
                    tempHour = element.horven_eve;
                    tempUse = element.nom_use;
                    tempDate = element.fecven_eve;
                    objectTemp.push({
                        product: element.nom_pro ,
                        cant: element.can_eve,
                        total: element.tot_eve,
                        price: element.preven_pro
                    });
                }             
                toSing+=element.nom_use+element.nom_pro+element.canivt_pro;
            });

            json.push({
                user: tempUse,
                date: tempDate,
                hour: tempHour,
                products:objectTemp
            });

            
            json.splice(0,1);

            var j = 1;
            var color = "white";
            json.forEach(element => {
                if(j==0){
                    j = 1;
                    color = "white";
                }
                else{
                    j = 0;
                    color = "gray";
                }
                txt+=`<tr class='${color}'>\n
                    <td style="text-align:center;vertical-align: middle;" rowspan='${element.products.length}'>${require('./encrypt').decryptAES(element.user)}</td> \n
                    <td style="text-align:center;vertical-align: middle;" rowspan='${element.products.length}'>${element.date + " " + element.hour}</td>\n
                    <td style="text-align:center;vertical-align: middle;">${element.products[0].product}</td>\n
                    <td style="text-align:center;vertical-align: middle;">${element.products[0].cant}</td>\n
                    <td style="text-align:center;vertical-align: middle;">$${element.products[0].price}</td>\n
                    <td style="text-align:center;vertical-align: middle;">$${element.products[0].total}</td>\n
                </tr>\n`;
                var t = element.products[0].total;
                for(var i = 1; i < element.products.length ; i++){
                    txt += 
                        `<tr class='${color}'>\n
                            <td style="text-align:center;vertical-align: middle;">${element.products[i].product}</td>\n
                            <td style="text-align:center;vertical-align: middle;">${element.products[i].cant}</td>\n
                            <td style="text-align:center;vertical-align: middle;">$${element.products[i].price}</td>\n
                            <td style="text-align:center;vertical-align: middle;">$${element.products[i].total}</td>\n
                        </tr>\n`;
                        t += element.products[i].total;
                }
                txt+="<tr class='total' id='table'><td colspan='5' style='text-align:right;vertical-align: middle;'>Total de venta:</td><td style='text-align:center;vertical-align: middle;'>$"+t+"</td></tr>";
            });
            encrypt.sign(toSing).then((resolve2)=>{
                if(resolve2!=""){
                    fs.writeFileSync(path+"sign"+id_neg+".sign",resolve2,(err)=>{
                        if(err){console.log(err);}
                    });
                    txt += "</table>\n";
                    var qr = require('qr-image');
                    var qr_svg = qr.image(resolve2, { type: 'png' });
                    var fileStream = require('fs').createWriteStream(path+'qr.png');
                    qr_svg.pipe(fileStream);
                    fileStream.on('finish',()=>{
                        txt += "<div id='pageFooter'>\n<table class='tableQR'>\n<tr>\n<td style='vertical-align: middle;'>\n<img src='file:///"+__dirname.replace(/\\/g,"/")+path.replace(".","")+"qr.png' width='150' height='150' align='middle'>\n</td>\n<td style='vertical-align: middle;width:30%;' class='qr_txt'>\n"+resolve2.substring(0,63)+"<br>"+resolve2.substring(64,127)+"<br>"+resolve2.substring(128,191)+"<br>"+resolve2.substring(192,257)+"</td>\n</tr>\n</table>\n</div>";
                        txt += "</body>\n</html>\n";
                        fs.writeFileSync(path+'reporte.html',txt,(err)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                        var html = fs.readFileSync(path+'reporte.html', 'utf8');
                        var options = {    
                            format: 'Letter',
                            base: "file:///"+__dirname.replace(/\\/,"/"),
                            type: "pdf",
                            orientation: "portrait",
                            border: {
                                top: "0.5in",
                                right: "0.5in",
                                bottom: "5in",
                                left: "0.5in"
                            },
                            footer: {
                                height: "0.01in",
                            }
                        };
                        pdf.create(html, options).toBuffer((err,res)=>{
                            resolve(res);
                        });
                    });
                }
            });

        });
    });
}


