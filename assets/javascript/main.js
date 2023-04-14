// Get các element trong form

// Đối tượng Validator
function Validator(object) {
    //Function get parent
    function getParent(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };

    var selectorRules = {};
    // Tạo hàm validate
    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, object.formGroup).querySelector(object.errorSelector);
        var rules = selectorRules[rule.selector];
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    var errorMessage = rules[i](inputElement.value);
                    break;
                default:
                    var errorMessage = rules[i](inputElement.value);
                    
            }
            if(errorMessage) break;

        };
        if(errorMessage){
            errorElement.innerHTML = errorMessage;
            getParent(inputElement, object.formGroup).classList.add('show-error');
        } else{
            errorElement.innerHTML = '';
            getParent(inputElement, object.formGroup).classList.remove('show-error');

        }
        return !errorMessage;
    }
    // Lấy ra form 
    var formElement = document.querySelector(object.form);
    if(formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            // Lặp qua từng rule và thực hiện
            object.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                validate(inputElement, rule);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            
            console.log(formValue);
            if(isFormValid){
                console.log('Không có lỗi');
                if(typeof object.onSubmit === 'function'){
                    var enableInput = formElement.querySelectorAll('[name]');
                    var formValue = Array.from(enableInput).reduce(function(values, input){
                        values[input.name] = input.value
                        return values;
                    }, {}); 

                    object.onSubmit(formValue);
                } else {
                    // Submit với html
                    formElement.submit();
                }
            }
        }
        // Xử lý lặp qua mỗi Rule và xử lý
        object.rules.forEach(function(rule){
            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);
            if(inputElement){
                inputElement.onblur = function(){
                    //Lấy đc giá trị nhập vào: value = inputElement.value
                    //Kiểm tra giá trị người dùng nhập vào
                    validate(inputElement, rule);
                }
                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, object.formGroup).querySelector(object.errorSelector);
                    errorElement.innerHTML = '';
                    getParent(inputElement, object.formGroup).classList.remove('show-error');
                }
            }

        })
        console.log(selectorRules);
    }
}
// Định nghĩa các rules
//Nguyên tắc các rules:
//1. Khi có lỗi => trả ra message lỗi
//2. Khi ko có lỗi => trả về undefine
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value.trim() ? undefined :message ||  'Vui lòng nhập trường này';
        }
    };
}
Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)? undefined: message || 'Vui lòng nhập email';
            
        }
    };
}
Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined:message ||  `Vui lòng nhập tối thiểu ${min} kí tự`;
            
        }
    };
}
Validator.isConfirm = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined: message || 'Giá trị nhập vào không chính xác';
            
        }
    };
}