exports.validateLetters = (fra, name)=>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 30) {
            resolve(name + " no puede estar vacio o tener mas de 30 caracteres");
        } else {
            let OK = /^[A-Za-záéíóúÁÉÍÓÚ\s\xF1\xD1]+$/;
            if(!OK.test(frase)){
                resolve(name + " solo puede contener letras");
            }
            else{
                resolve(true);
            }
        }
    })

}

exports.validateLettersWithSpace = (fra, name) =>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 30) {
            resolve(name + " no puede estar vacio o tener mas de 30 caracteres");
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
                resolve(name + " solo puede contener letras");
            } else {
                resolve(true);
            }
        }
    })

}

exports.validateEmail = (fra) =>{
    return new Promise((resolve, reject)=>{
    let frase = String(fra);
        if (frase.length < 1 || frase.length > 50) {
            resolve("El email no puede estar vacio o tener mas de 50 caracteres");
        } else {
            let expre = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (expre.test(frase)) {
                resolve(true);
            } else {
                resolve('No es un formato coorecto de email, el email no debe contener letras acentuadas, espacios, ni caracteres especiales como ()<>@,;:"[]ç%&');
            }

        }
    })
}

exports.validatePass = (fra) =>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 16) {
            resolve("La contraseña no puede estar vacia o tener mas de 16 caracteres");
        } else {
            let expre = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d$@$!%*?&]|[^ ]){8,16}$/;
            if (expre.test(frase)) {
                resolve(true);
            } else {
                resolve("La contraseña debe tener entre 8 y 16 caracteres, debe contener al menos: 1 letra mayúscula, 1 letra minúscula, 1 digito, y no tener espacios");
            }
        }
    })
}

exports.validatePassLogin = (fra) =>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 16) {
            resolve("La contraseña no puede estar vacia o tener mas de 16 caracteres");
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
                resolve(true);
            } else {
                resolve(`La contraseña no puede tener '<>"`);
            }
        }
    })
}

exports.validateNumbers = (fra, name) =>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 20) {
            resolve(name + " no puede estar vacio o ser mayor a 20 caracteres");
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
                        resolve(name + " no puede ser menor o igual a 0 ni mayor a 1000000");
                    }else{
                        resolve(true);
                    }
                }catch(err){
                    resolve(name + " debe ser un numero real valido");
                }
            }else{
                resolve(name + " debe ser un numero");
            }
        }
    })
}

exports.onlyNumbers = (fra, name)=>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if (frase.length < 1 || frase.length > 20) {
            resolve(name + " no puede estar vacio o ser mayor a 20 caracteres");
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
                        resolve(name + " no puede ser menor o igual a 0 ni mayor a 1000000");
                    }else{
                        resolve(true);
                    }
                }catch(err){
                    resolve(name + " debe ser un numero entero real valido");
                }
            }else{
                resolve(name + " debe ser un numero entero");
            }
        }
    })
}

exports.onlyLettersAndSpace = (fra, name)=>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra).replace(/^\s+|\s+$|\s+(?=\s)/g, "");
        if (frase.length < 1 || frase.length > 30) {
            resolve(name + " no puede estar vacio o tener mas de 30 caracteres");
        } else {
            let expre = /^[a-zA-Z\ áéíóúÁÉÍÓÚñÑ\s]*$/;
            if (expre.test(frase.trim())) {
                resolve(true);
            } else {
                resolve(name + " solo puede contener letras y espacios");
            }
        }
    })
}

exports.validateDescription = (fra)=>{
    return new Promise((resolve, reject)=>{
        let frase = String(fra);
        if(frase.length < 1 || frase.length > 200){
            resolve("La descripción no puede estar vacia ni tener mas de 200 caracteres");
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
                resolve(true);
            }else{
                resolve("La descripcion solo puede contener letras y numeros");
            }
        }
    })
}
