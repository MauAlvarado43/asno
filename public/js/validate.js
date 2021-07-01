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

function validateLetters(fra, name, doom) {
    let frase = String(fra);
    console.log(doom);
    if (frase.length < 1 || frase.length > 30) {
        $(doom).html(getAlert(name + " no puede estar vacio o tener mas de 30 caracteres"));
        return false;
    } else {
        let OK = /^[A-Za-záéíóúÁÉÍÓÚ\s\xF1\xD1]+$/;
        console.log(OK.test(frase));
        if(!OK.test(frase)){
            $(doom).html(getAlert(name + " solo puede contener letras"))
            return false;
        }
        else{
            return true;
        }
    }
}

function validateLettersWithSpace(fra, name, doom) {
    let frase = String(fra);
    console.log(doom);
    if (frase.length < 1 || frase.length > 30) {
        $(doom).html(getAlert(name + " no puede estar vacio o tener mas de 30 caracteres"));
        return false;
    } else {
        let OK = "ABCDEFGHIJKLMNÑOPQRST UVWXYZÁÉÍÓÚ"
        var int = 0;
        for (var i = 0; i < frase.length; i++) {
            for (var j = 0; j < OK.length; j++) {
                if (OK.toUpperCase().charAt(j) == frase.toUpperCase().charAt(i)) {
                    int++;
                }
            }
        }
        if (int != frase.length) {
            $(doom).html(getAlert(name + " solo puede contener letras"))
            return false;
        } else {
            return true;
        }
    }
}

function validateEmail(fra, doom) {
    let frase = String(fra);
    if (frase.length < 1 || frase.length > 50) {
        $(doom).html(getAlert("El email no puede estar vacio o tener mas de 50 caracteres"));
        return false;
    } else {
        let expre = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (expre.test(frase)) {
            return true;
        } else {
            $(doom).html(getAlert('No es un formato coorecto de email, el email no debe contener letras acentuadas, espacios, ni caracteres especiales como ()<>@,;:"[]ç%&'));
            return false;
        }

    }
}

function validatePass(fra, doom) {
    let frase = String(fra);
    if (frase.length < 1 || frase.length > 16) {
        $(doom).html(getAlert("La contraseña no puede estar vacia o tener mas de 16 caracteres"));
        return false;
    } else {
        let expre = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d$@$!%*?&]|[^ ]){8,16}$/;
        if (expre.test(frase)) {
            return true;
        } else {
            $(doom).html(getAlert("La contraseña debe tener entre 8 y 16 caracteres, debe contener al menos: 1 letra mayúscula, 1 letra minúscula, 1 digito, y no tener espacios"));
            return false;
        }
    }
}

function validatePassLogin(fra, doom) {
    let frase = String(fra);
    if (frase.length < 1 || frase.length > 16) {
        $(doom).html(getAlert("La contraseña no puede estar vacia o tener mas de 16 caracteres"));
        return false;
    } else {
        let NOT = `'"<>`;
        let int = 0;
        for (var i = 0; i < frase.length; i++) {
            for (var j = 0; j < NOT.length; j++) {
                if (frase.charAt(i) == NOT.charAt(j)) {
                    int++;
                }
            }
        }
        if (int == 0) {
            return true;
        } else {
            $(doom).html(getAlert(`La contraseña no puede tener '<>"`));
            return false;
        }
    }
}

function validateNumbers(fra, name, doom) {
    let frase = String(fra);
    if (frase.length < 1 || frase.length > 20) {
        $(doom).html(getAlert(name + " no puede estar vacio o ser mayor a 20 caracteres"));
        return false;
    } else {
        let OK = "0123456789.";
        let int = 0;
        for (var i = 0; i < frase.length; i++) {
            for (var j = 0; j < OK.length; j++) {
                if(frase.charAt(i) == OK.charAt(j)){
                    int++;
                }
            }
        }
        if(int == frase.length){
            try{
                let number = parseFloat(frase);
                if(number <= 0 || number > 1000000){
                    $(doom).html(getAlert(name + " no puede ser menor o igual a 0 ni mayor a 1000000"));
                    return false;
                }else{
                    return true;
                }
            }catch(err){
                $(doom).html(getAlert(name + " debe ser un numero real valido"));
                return false;
            }
        }else{
            $(doom).html(getAlert(name + " debe ser un numero"));
            return false;
        }
    }
}

function onlyNumbers(fra, name, doom){
    let frase = String(fra);
    if (frase.length < 1 || frase.length > 20) {
        $(doom).html(getAlert(name + " no puede estar vacio o ser mayor a 20 caracteres"));
        return false;
    } else {
        let OK = "0123456789";
        let int = 0;
        for (var i = 0; i < frase.length; i++) {
            for (var j = 0; j < OK.length; j++) {
                if(frase.charAt(i) == OK.charAt(j)){
                    int++;
                }
            }
        }
        if(int == frase.length){
            try{
                let number = parseInt(frase);
                if(number <= 0 || number > 1000000){
                    $(doom).html(getAlert(name + " no puede ser menor o igual a 0 ni mayor a 1000000"));
                    return false;
                }else{
                    return true;
                }
            }catch(err){
                $(doom).html(getAlert(name + " debe ser un numero entero real valido"));
                return false;
            }
        }else{
            $(doom).html(getAlert(name + " debe ser un numero entero"));
            return false;
        }
    }
}

function onlyLettersAndSpace(fra, name, doom) {
    let frase = String(fra).replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    if (frase.length < 1 || frase.length > 30) {
        $(doom).html(getAlert(name + " no puede estar vacio o tener mas de 30 caracteres"));
        return false;
    } else {
        let expre = /^[a-zA-Z\ áéíóúÁÉÍÓÚñÑ\s]*$/;
        if (expre.test(frase.trim())) {
            return true;
        } else {
            $(doom).html(getAlert(name + " solo puede contener letras y espacios"))
            return false;
        }
    }
}

function validateDescription(fra, doom){
    let frase = String(fra);
    if(frase.length < 1 || frase.length > 200){
        $(doom).html(getAlert("La descripción no puede estar vacia ni tener mas de 200 caracteres"));
        return false;
    }else{
        let OK = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ00123456789 ,.";
        let int = 0;
        for(var i = 0; i<frase.length; i++){
            for(var j = 0; j<OK.length; j++){
                if(frase.toUpperCase().charAt(i) == OK.toUpperCase().charAt(j)){
                    int++;
                }
            }
        }
        if(int == frase.length){
            return true;
        }else{
            $(doom).html(getAlert("La descripcion solo puede contener letras y numeros"));
            return false;
        }
    }
}