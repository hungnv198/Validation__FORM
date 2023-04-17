//validation: chức năng xác thực để đảm bảo sự hợp lý của dữ liệu
//Đối tượng Validation
// đối tượng vào là 1 object
function Validation(options){
    // Get parent của element:
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };
    var selectorRule = {};
    // Lấy form elements trong html
    var formElement = document.querySelector(options.form)
    // function validate: Hàm thực hiện validate
    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;
        var rules = selectorRule[rule.selector];
        // Vòng lặp chạy các rule, nếu có lỗi dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++){
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                        break;
                default:
                    errorMessage = rules[i](inputElement.value);

            }
            if(errorMessage) break;
        }

        if(errorMessage){
            //Khi có lỗi, nhập message
            errorElement.innerHTML = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('show-error');
        } else {
            // Khi không có lỗi, nhập mảng rỗng
            errorElement.innerHTML = [];
            getParent(inputElement, options.formGroupSelector).classList.remove('show-error');

        }
        return !errorMessage;
    };
    if(formElement){
        // Xử lý lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
        formElement.onsubmit = function(e){
            // Đặt biến để check lỗi
            // Loại bỏ hành vi mặc định khi submit
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);

                if(!isValid) {
                    isFormValid = false;
                }
            });
            if(isFormValid) {
                console.log("Không có lỗi");
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === "function"){
                    // TRả về data của input
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
                    options.onSubmit(formValue);
                } else {
                    // Trường hợp submit với html
                    formElement.submit();
                }
            } else {
                console.log("Có lỗi")
            }
            // 
        }


        options.rules.forEach(function(rule){
            // Lưu lại các rule trong mỗi input
            // Kiểm tra phần tử của object
            if(Array.isArray(selectorRule[rule.selector])){
                selectorRule[rule.selector].push(rule.test);
            } else {
                selectorRule[rule.selector] = [rule.test];
            }
            
            // Lấy ra input element trong form
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

                if(inputElement){
                    //Xử lý trường hợp mỗi khi người dùng nhập vào input
                    inputElement.oninput = function(){
                        errorElement.innerHTML = [];
                        getParent(inputElement, options.formGroupSelector).classList.remove('show-error');
                    }
                    // Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement, rule);
                    };
                }
            });
            
        });
    }
}
//Định nghĩa các rules: các điều luật quy định
// Nguyên tắc các rule:
//1. Khi có lỗi trả ra message lỗi
//2. Khi hợp lệ, không trả ra gì cả
// Hàm không được để trống
Validation.isRequired = function (selector, message){
    return{
        selector: selector,
        test: function(value){
            return value ? undefined : message || "Vui lòng nhập trường này!";
        }
    }
}
// Hàm phải là email
Validation.isEmail = function (selector, message){
    return{
        selector: selector,
        test: function(value){
            var regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            return regex.test(value) ? undefined : message || "Trường này phải là email";
        }
    }
}
// Rule: Minlength Password
Validation.minLength = function(selector, min, message){
    return{
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập từ ${min} kí tự trở lên!`
        }
    }
}
// Rule: CheckPass
Validation.checkPassword = function(selector, getPassword, message) {
    return{
        selector: selector,
        test: function(value){
            return value === getPassword() ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}