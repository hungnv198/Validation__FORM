//Quy ước: để ngăn cách rule dùng dấu '|', để truyền thêm giá trị dùng dấu ':'.
function Validation(formSelector){
    var _this = this;
    // Gán giá trị mặc định cho tham số khi định nghĩa
    // Function tìm Parert element
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            } else {
                element = element.parentElement;
            }
        }
    }
    var formRules = {};
    /*
    --Quy ước tạo rules:
    - Nếu có lỗi, return lỗi
    - Nếu không có lỗi, return undefined
    */
    // Tạo ra các rules:
    var validationRules = {
        required: function(value) {
            return value ? undefined : "Vui lòng nhập trường này!"
        },
        email: function(value) {
            var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            return regex.test(value) ? undefined : "Vui lòng nhập Email!"
        },
        min: function(min) {
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        }
    };

    // Lấy ra form element trong DOM
    var formElement = document.querySelector(formSelector);
    // Chỉ xử lý khi có form trong DOM
    if(formElement){
        console.log(formElement);
        // Lấy ra các input có attribute name, rules
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs){
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules){
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];

                    // console.log(validationRules[rule](ruleInfo[1]))
                }
                var ruleFunc = validationRules[rule];

                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // Lắng nghe sự kiện để validation (blur, change,...)
            input.onblur = handleValidation;
            input.oninput = handleClearError;

        }
        // Hàm thực hiện validation
        function handleValidation(event){
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }
            // Nếu có lỗi thì hiển thị lỗi ra UI
            if(errorMessage){
                var formGroup = getParent(event.target, '.form__group');
                if(formGroup){
                    var formMessage = formGroup.querySelector('.form__group--message');
                    if(formMessage){
                        formMessage.innerHTML = errorMessage;
                        formGroup.classList.add('show-error');
                    }
                }
                console.log(formGroup);
            }
            return !errorMessage;
            // console.log(errorMessage);
        }

        // Clear Error Message
        function handleClearError(event){
            var formGroup = getParent(event.target, '.form__group');
            if(formGroup.classList.contains('show-error')){
                formGroup.classList.remove('show-error');
                var formMessage = formGroup.querySelector('.form__group--message');
                if(formMessage){
                    formMessage.innerHTML = '';
                }
            }
        }
        // console.log(formRules);
    }
    // Xử lý hành vi submit form 
    formElement.onsubmit = function(event){
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true;
        for(var input of inputs){
            console.log(input.name);
            if(!handleValidation({target: input})){
                isValid = false;
            };
        }
        console.log(isValid);
        // Khi không có lỗi thì submit form
        if(isValid){
            if(typeof _this.onSubmit === 'function'){
                var enableInput = formElement.querySelectorAll('[name]');
                    var formValue = Array.from(enableInput).reduce(function(value, input){
                        switch(input.type){
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    value[input.name] = [];
                                    return value;
                                };
                                if(!Array.isArray(value[input.name])){
                                    value[input.name] = [];
                                }
                                value[input.name].push(input.value);
                                break;
                            case 'radio':
                                value[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').value;
                                break;
                            case 'file':
                                value[input.name] = input.files;
                                break;
                            default: 
                                value[input.name] = input.value;
                        }
                        return value;
                    }, {});
                _this.onSubmit(formValue);
            } else {
                formElement.submit();
            }
        }
    }
}