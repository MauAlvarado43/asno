function loginUser() {
    $.ajax({
        url: "/login",
        data: {
            email_usu_log: encrypt($("#email_log").val()),
            pass_usu_log: encrypt($("#pass_log").val()),
            saveSession:  encrypt($("#checkbox").is(':checked').toString())
        },
        type: "POST",
        success: function (response) {
            if (response == "1") {
                window.location.href = "admin/inicio.html";
            }
            else if (response == "2") {
                window.location.href = "dueno/inicio.html";
            }
            else if (response == "3") {
                window.location.href = "empleado/inicio.html";
            }
            else if (response == "4") {
                window.location.href = "register.html";
            }
            else {
                $(".divErrorLogin").html(getAlert(response));
            }
        }
    });
}

function register() {

    $("#pass1_error").text("");
    $("#pass2_error").text("");
    $("#user_error").text("");
    $("#email_error").text("");

    var pass = $("#pass1").val();
    var confirmPass = $("#pass2").val();

    if (pass != confirmPass) {
        $(".divError").html(getAlert("Las contraseñas no coinciden"));
        return false;
    } else {
        $.ajax({
            url: "/register",
            data: {
                nom_usu_reg:encrypt($("#user").val()),
                email_usu_reg:encrypt($("#email").val()),
                pass_usu_reg_1:encrypt($("#pass1").val()),
                pass_usu_reg_conf:encrypt($("#pass2").val())
            },
            type: "POST",
            success: function (response) {
                $(".divError").html(getAlert(response));
            }
        });
    }
}

function validatePassword(field) {

    var pass = field.value;
    var color = "";
    var strength = "";

    var score = 0;
    if (!pass)
        return score;

    var letters = new Object();

    for (var i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    if (score > 0) {
        color = "red";
        strength = "Muy Débil";
    }
    if (score > 30) {
        color = "red";
        strength = "Débil";
    }
    if (score > 60) {
        color = "orange";
        strength = "Buena";
    }
    if (score > 80) {
        color = "green";
        strength = "Fuerte";
    }

    $("#pass1_error").text("");
    $("#pass1_error").html("<font color='" + color + "'><h6>" + strength + "</h6></font>");

}

function finalizeRegister() {
    if (getRadioButtonSelectedValue(document.getElementsByName("rol")) == null) {
        alert("Seleccione un rol");
        return;
    }
    if ($("#code").val() == "") {
        alert("Ingrese su código de verificación");
    }
    $.ajax({
        url: "/finalizeRegister",
        data: {
            code: $("#code").val(),
            rol: getRadioButtonSelectedValue(document.getElementsByName("rol"))
        },
        type: "POST",
        success: function (response) {
            if (response == "") {
                $.ajax({
                    url: "/getUser",
                    type: "POST",
                    success: function (response1) {
                        if (response1.level == 2) {
                            window.location.href = "admin/inicio.html";
                        }
                        else if (response1.level == 3) {
                            window.location.href = "empleado/inicio.html";
                        }
                    }
                });
            }
            else {
                alert(response);
            }
        }
    });
}

function getRadioButtonSelectedValue(ctrl) {
    for (i = 0; i < ctrl.length; i++)
        if (ctrl[i].checked) return ctrl[i].value;
}

function getDate() {
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

function validarL(e, field) {
    key = e.keyCode ? e.keyCode : e.which;
    fieldv = field.value;
    if (fieldv.indexOf(" ") >= 0) {
        fieldv = fieldv.replace("  ", " ");
    }
    if ((key >= 65 && key <= 90) || (key >= 96 && key <= 122)) return true
    if (key == 8) return true;
    if (field.value == "") return false;
    if (fieldv.substring(fieldv.length - 1, fieldv.length) == " ") return false;
    if (field.value.substring(0, field.value.length) != " ") return true;
    else return false;
}

function validarN(e, field) {
    var keyboard = (document.all) ? e.keyCode : e.which;
    if (keyboard == 8) return true;
    if (field.value.length > 3) return false;
    else
        var patron = /[0-9]/;
    var test = String.fromCharCode(keyboard);
    return patron.test(test);
}

function addProduct() {

    var Rname = $("#nomp").val();
    var Rpreven = $("#preven").val();
    var Rprecom = $("#precom").val();
    var Rcanivt = $("#canivt").val();
    var Rdes = $("#des").val();
    var Rtpo = $("#tpo option:selected").val();
    var Rmun = $("#mun option:selected").val();
    var product = {
        name: Rname,
        preven: Rpreven,
        precom: Rprecom,
        canivt: Rcanivt,
        des: Rdes,
        tpo: Rtpo,
        mun: Rmun
    };
    $.ajax({
        url: "/addProduct",
        data: product,
        type: "POST",
        success: function (response) {
            // $(".errorProduct").html(getAlert(response));
            $.ajax({
                url: "/getInventory",
                type: "POST",
                data: { "deal": sessionStorage.getItem("deal") },
                success: function (response) {
                    $("#inventory").html(response);

                    $("#nomp").val("");
                    $("#preven").val("");
                    $("#precom").val("");
                    $("#canivt").val("");
                    $("#des").val("");
                    $("#tpo option:selected").val("");
                    $("#mun option:selected").val("");

                }
            });
        }
    });

}

function addType() {
    var Rnomt = $("#nomt").val();
    var tipo = {
        nomt: Rnomt
    };
    $.ajax({
        url: "/addTypeProduct",
        data: tipo,
        type: "POST",
        success: function (response) {
            // $(".errorTypeProduct").html(getAlert(response));
            $("#nomt").val("")
            $.ajax({
                url: "/getTypeProducts",
                type: "POST",
                data: { "deal": sessionStorage.getItem("deal") },
                success: function (response) {
                    $("#type_products").html(response);
                }
            });
        }
    });
}

function addUnit() {
    var Rnomu = $("#nomu").val();
    var unit = {
        nomu: Rnomu
    };
    $.ajax({
        url: "/addMetricUnit",
        data: unit,
        type: "POST",
        success: function (response) {
            // $(".errorUM").html(getAlert(response));
            $("#nomu").val("")
            $.ajax({
                url: "/getMetricUnits",
                type: "POST",
                data: { "deal": sessionStorage.getItem("deal") },
                success: function (response) {
                    $("#metric_units").html(response);
                }
            });
        }
    });
}

function editProduct(Rid) {
    product = {
        id: Rid
    };
    $.ajax({
        url: "/editProduct",
        data: product,
        type: "POST",
        success: function (response) {
            if (response == "No existe el producto") {
                alert(response);
            }
            else {
                $("#nomp").val(response.nom_pro);
                $("#preven").val(response.preven_pro);
                $("#precom").val(response.precom_pro);
                $("#canivt").val(response.canivt_pro);
                $("#des").val(response.des_pro);
                $("#addP").attr("onclick", "modifyProduct(" + Rid + ")");
                $("#addP").attr("value", "Modificar");
            }
        }
    });
}

function editType(Rid) {
    tipo = { id: Rid };
    $.ajax({
        url: "/editTypeProduct",
        data: tipo,
        type: "POST",
        success: function (response) {
            if (response == "No existe el Tipo de Producto") {
                alert(response);
            }
            else {
                $("#nomt").val(response.nom_tpo);
                $("#addT").attr("onclick", "modifyType(" + Rid + ")");
                $("#addT").attr("value", "Modificar");
            }
        }
    });
}

function editUnity(Rid) {
    unity = { id: Rid };
    $.ajax({
        url: "/editMetricUnit",
        data: unity,
        type: "POST",
        success: function (response) {
            if (response == "No existe el Tipo de Producto") {
                $(".divUnity").html(getAlert(response));
            }
            else {
                $("#nomu").val(response.nom_unm);
                $("#addU").attr("onclick", "modifyUnity(" + Rid + ")");
                $("#addU").attr("value", "Modificar");
            }
        }
    });
}

function modifyProduct(Rid) {

    var Rname = $("#nomp").val();
    var Rpreven = $("#preven").val();
    var Rprecom = $("#precom").val();
    var Rcanivt = $("#canivt").val();
    var Rdes = $("#des").val();
    var Rtpo = $("#tpo option:selected").val();
    var Rmun = $("#mun option:selected").val();

    if (Rname == "" || Rpreven == "" || Rprecom == "" || Rcanivt == "" || Rdes == "" || Rtpo == "" || Rmun == "") {
        alert("Coloca los datos correctamente");
    }
    else {
        var product = {
            id: Rid,
            name: Rname,
            preven: Rpreven,
            precom: Rprecom,
            canivt: Rcanivt,
            des: Rdes,
            tpo: Rtpo,
            mun: Rmun
        };
        $.ajax({
            url: "/modifyProduct",
            data: product,
            type: "POST",
            success: function (response) {
                if (response == "Producto modificado") {
                    alert(response);
                    location.reload();
                    $("#nomp").text("");
                    $("#preven").text("");
                    $("#precom").text("");
                    $("#canivt").text("");
                    $("#des").text("");
                }
                else {
                    alert(response);
                }
            }
        });
    }
}

function modifyType(Rid) {
    var Rnomt = $("#nomt").val();
    if (Rnomt == "" || Rnomt == null) {
        alert("Coloca los datos correctamente");
    }
    else {
        var tipo = {
            nomt: Rnomt,
            id: Rid
        };
        $.ajax({
            url: "/modifyTypeProduct",
            data: tipo,
            type: "POST",
            success: function (response) {
                if (response == "Tipo de Producto modificado") {
                    // alert(response);
                    location.reload();
                    $("#nomt").text("");
                }
                else {
                    // alert(response);
                }
            }
        });
    }
}

function modifyUnity(nomn, nomo) {
    var Rnomu = $("#nomu").val();
    var unity = {
        nomu: Rnomu,
        nomo: nomo
    };
    $.ajax({
        url: "/modifyMetricUnit",
        data: unity,
        type: "POST",
        success: function (response) {
            if (response == "Unidad de Medida Modificada Exitosamente") {
                alert(response);
                location.reload();
                $("#nomu").text("");
            }
            else {
                alert(response);
            }
        }
    });
}

function deleteProduct(Rid) {
    let product = {
        id: Rid
    };
    $.ajax({
        url: "/deleteProduct",
        data: product,
        type: "POST",
        success: function (response) {
            if (response != "No se puede Eliminar") {
                alert(response);
                location.reload();
            }
            else {
                alert(response);
            }
        }
    });
}

function deleteType(Rid) {
    let type = {
        id: Rid
    };
    $.ajax({
        url: "/deleteType",
        data: type,
        type: "POST",
        success: function (response) {
            if (response != "No se puede Eliminar") {
                alert(response);
                $.ajax({
                    url: "/getTypeProducts",
                    type: "POST",
                    data: { "deal": sessionStorage.getItem("deal") },
                    success: function (response) {
                        $("#type_products").html(response);
                    }
                });
            }
            else {
                alert(response);
            }
        }
    });
}

function deleteUnity(Rid) {
    let unity = {
        id: Rid
    };
    $.ajax({
        url: "/deleteUnity",
        data: unity,
        type: "POST",
        success: function (response) {
            $(".divUnity").html(getAlert(response));
            $.ajax({
                url: "/getMetricUnits",
                type: "POST",
                data: { "deal": sessionStorage.getItem("deal") },
                success: function (response) {
                    $("#metric_units").html(response);
                }
            });
        }
    });
}

function reduceQuantity(Rid) {
    var id = "#" + Rid;
    let quan = $(id).val();
    if (quan == "" || quan == "1") {
        $(id).val("");
    }
    else {
        if (isNaN(quan)) {
            location.reload();
            $(id).val("");
        }
        else {
            if (quan == "") {
                $(id).val("");
            }
            else {
                quan--;
                $(id).val(quan);
            }
        }
    }
}

function addQuantity(Rid) {
    var id = "#" + Rid;
    let quan = $(id).val();
    if (quan == "") {
        $(id).val("1");
    }
    else {
        if (isNaN(quan)) {
            location.reload();
            $(id).val("");
        }
        else {
            quan++;
            $(id).val(quan);
        }
    }
}

function addActualQuantity(Rid) {
    var id = "#" + Rid;
    let quan = $(id).val();
    if (quan == "") {
        alert("No se puede añadir");
    }
    else {
        let product = {
            id: Rid,
            can: quan
        };
        $.ajax({
            url: "/addQuantityProduct",
            data: product,
            type: "POST",
            success: function (response) {
                if (response == "Cantidad Añadida") {
                    alert(response);
                    location.reload();
                }
                else {
                    alert(response);
                }
            }
        });
    }
}

function searchProduct(field) {
    var str = field.value;
    var search = { text: str };
    $.ajax({
        url: "/consultProduct",
        type: "POST",
        data: search,
        success: function (resolve) {
            $("#inventory").html(resolve);
        }
    });
}

function searchUnity(field) {
    var str = field.value;
    var search = { text: str };
    $.ajax({
        url: "/consultUnity",
        type: "POST",
        data: search,
        success: function (resolve) {
            $("#metric_units").html(resolve);
        }
    });
}

function searchType(field) {
    var str = field.value;
    var search = { text: str };
    $.ajax({
        url: "/consultType",
        type: "POST",
        data: search,
        success: function (resolve) {
            $("#type_products").html(resolve);
        }
    });
}

function crearNegocio(name, password) {
        $.ajax({
            url: "/createDeal",
            type: "POST",
            data: {
                nombre: encrypt(name),
                pass: encrypt(password)
            },
            success: function (response) {
                $(".errorCreate").html(getAlert(response));
                $.ajax({
                    url: "/getAllDeals",
                    type: "POST",
                    success: function (response) {
                        if (response == "0") {
                            $("#negocios").html("<label class='text-center'>Registra un negocio antes</label>");
                        } else {
                            $("#negocios").html(response);
                        }
                    }
                });
            }
        });
}

function editNegocio(password, newName) {
        $.ajax({
            url: "/editDeal",
            type: "POST",
            data: {
                nuevo: newName,
                pass: password
            },
            success: function (response) {
                $(".errorUpdate").html(getAlert(response));
                $.ajax({
                    url: "/getAllDeals",
                    type: "POST",
                    success: function (response) {
                        if (response == "0") {
                            $("#negocios").html("<label class='text-center'>Registra un negocio antes</label>");
                        } else {
                            $("#negocios").html(response);
                        }
                    }
                });
            }
        });
}

function deleteNegocio(password) {
        $.ajax({
            url: "/deleteDeal",
            type: "POST",
            data: {
                pass: password
            },
            success: function (response) {
                $(".errorDeleteDeal").html(getAlert(response));
                $.ajax({
                    url: "/getAllDeals",
                    type: "POST",
                    success: function (response) {
                        if (response == "0") {
                            $("#negocios").html("<label class='text-center'>Registra un negocio antes</label>");
                        } else {
                            $("#negocios").html(response);
                        }
                    }
                });
            }
        });
}

function getAlert(args) {
    let alert = `
    <div class="row">
        <div class="col-md-12">
            <div class="alert alert-dismissable alert-info">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                <h6>${args}</h6>
            </div>
        </div>
    </div>`;
    return alert;
}


const privateKeyUser = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`;

const publicKeyuser = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`;


function encrypt(txt){
    var cipher = new JSEncrypt();
    cipher.setPublicKey(publicKeyuser);    
    var encrypt = cipher.encrypt(txt); 
    return encrypt;
}

function decrypt(txt){
    var cipher = new JSEncrypt();
    cipher.setPrivateKey(privateKeyUser); 
    var decrypt = cipher.decrypt(txt);
    return decrypt;
}