
var helper = {

    init: function() {

        document.getElementById('state').setAttribute('tabindex', '9');

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        //var code = helper.getCookies('id'); 

        $('[name="displayname"]').prop('required', true);
        $('[name="email"]').prop('required', true);
        $('[name="confirmEmail"]').prop('required', true);
        $('[name="password"]').prop('required', true);
        $('[name="confirmPassword"]').prop('required', true);
        $('[name="firstname"]').prop('required', true);
        $('[name="lastname"]').prop('required', true);
        $('[name="city"]').prop('required', true);
        $('[name="state"]').prop('required', true);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        var emailPattern = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        var emailPattern2 = /\S+@\S+\.\S+/;
        //var passwordPattern = /^\S{4,127}$/;
        var passwordPattern = /^\S{4,}$/;

        $('#displayname').on('input change', function() {
            var thisElement = $(this);
            var pattern = /^[a-zA-Z0-9_]{4,21}$/;
            var thisElementValue = thisElement.val();
            var isThisElementValueValid = pattern.test(thisElementValue);
            var errorElement = $('#usernameError');
            var charCount = thisElement.val().length;
            var noSafariText;

            if(thisElementValue !== ''){
                if(charCount < 4) {
                    is_safari ? errorElement.text('Please enter at least 4 character(s). You entered '+charCount+'. Username must be 4-21 characters long. Letters, numbers, underscores only, no whitespace') : null;
                    is_safari ? errorElement.removeClass('hide').addClass('show') : null;
                }else{
                    if(!isThisElementValueValid){
                        is_safari ? errorElement.text('Invalid input. Username must be 4-21 characters long. Letters, numbers, underscores only, no whitespace') : null;
                        is_safari ? errorElement.removeClass('hide').addClass('show') : null;
                    }else{
                        is_safari ? errorElement.text('') : null;
                        is_safari ? errorElement.removeClass('show').addClass('hide') : null;
                        !is_safari ? thisElement.get(0).setCustomValidity('') : null;
                    }
                }
            }else{
                is_safari ? errorElement.text('Please fill out this field. Username must be 4-21 characters long. Letters, numbers, underscores only, no whitespace') : null;
                is_safari ? errorElement.removeClass('hide').addClass('show') : null; 
            }
        });

        $('#state').on('change', function() {
            var thisElement = $(this);
            var thisElementValue = thisElement.val();

            if(thisElementValue !== ''){
                is_safari ? $('#stateError').text('') : null;
                is_safari ? $('#stateError').removeClass('show').addClass('hide') : null;
                !is_safari ? thisElement.get(0).setCustomValidity('') : null;

            }else{
                is_safari ? $('#stateError').text('Please select an option. Please select a State') : null;
                is_safari ? $('#stateError').removeClass('hide').addClass('show') : null; 
            }
        });

        $('#signUpSubmitBtn').on('click', function(e) {
            e.preventDefault();
            showLoading();
            $('.formerror').addClass('hide');
            var formData = $('#signUpForm').serializeArray();
            var formValid = true;
            var emalVal;

            for (var itemConstraint in formData){
                var element = $('#'+formData[itemConstraint]['name']);
                var constraintSatisfied = element.checkValidity();
                formData[itemConstraint].name === 'email' ? emalVal = formData[itemConstraint].value : null;
                if(constraintSatisfied === false){
                    formValid = false;
                }
            }

            if (!formValid){
                console.log('+++++++++++ BAD FORM!')
                hideLoading();
                if(is_safari){
                    for (var elementValue in formData){
                        var element = $('#'+formData[elementValue]['name']);
                        $(element).trigger('change');
                    }
                }else{
                    $('<input type="submit">').hide().appendTo($('#signUpForm')).click().remove();
                }
                return false;
            }else{
                console.log('+++++++++++ GOOD FORM!')
                hideLoading();

                var serviceUrl = 'https://localhost:3000/api/evaluateuseremail';
                var data = {};

                data = { 
                    email: emalVal, 
                    expectedResponse: false
                };

                $.ajax({
                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                
                    success: function(data, status) {
                        if (data.message === 'success') {
                            console.log('signUpSubmitBtn > ajax > success > success')
                            $('#signUpForm').submit();
                        } else {
                            console.log('signUpSubmitBtn > ajax > success > error')
                            $('#email').addClass('has-error');
                            $('#confirmEmail').addClass('has-error');
                            $('#emailError').text('Please enter a different Email Address')
                            $('#confirmEmailError').text('Please enter a different Email Address')
                            $('#emailError').removeClass('hide').addClass('show'); 
                            $('#confirmEmailError').removeClass('hide').addClass('show');
                            $('.formerror').text('Your email address is already in our system. Log in, or enter a new email address');
                            $('.formerror').removeClass('hide');
                            hideLoading();
                            return false;
                        }
                    },
                    error: function(xhr, status) {
                        console.log('signUpSubmitBtn > ajax > error')
                        $('#signUpForm .form-control').addClass('has-error');
                        $('.formerror').text('Could not register your information, try again or contact customer service.');
                        $('.formerror').removeClass('hide');
                        hideLoading();
                        return false;
                    }
                });
            } 
        });

    },

    evaluateBasicTextSelectField: function(thisField) {
        var thisElementValue = $('#'+thisField).val();
        var property1 = document.getElementsByName(thisField)[0];

        if(thisElementValue !== ''){
            is_safari ? $('#'+thisField+'Error').text('') : null;
            is_safari ? $('#'+thisField+'Error').removeClass('show').addClass('hide') : null;
            !is_safari ? $('#'+thisField).get(0).setCustomValidity('') : null;

        }else{
            if (is_safari) {
                $('#'+thisField+'Error').text('Please fill out this field. ' + property1.title);
                $('#'+thisField+'Error').removeClass('hide').addClass('show'); 
            }
        }
    },

    unBindField: function(id) {
        $('#' + id).off('change');
        $('#' + id).unbind('change');
        $('#' + id).get(0).setCustomValidity('');
    },

    validateEmailValue: function(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    },

    toTitleCase: function(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    // BUG/ERROR is here. 
    // in above comparison:
    //  if (validValueName.value !== comparedValueName.value) {
    // this line is problem:
    //  $('#'+ comparedValue).get(0).setCustomValidity(helper.toTitleCase(inputType) + 's don\'t match');
    // GOOD: $('#' + comparedValue).get(0).setCustomValidity('');
    // BAD: $('#' + validValue).get(0).setCustomValidity('');

    //   validValue      comparedValue
    //   ----------      -------------
    //     email          confirmEmail      (email)
    //  confirmEmail         email          (confirmEmail)
    //    password       confirmPassword

    evaluateValidInputValues: function(validValue, comparedValue) {
        var validValueName = document.getElementsByName(validValue)[0];
        var comparedValueName = document.getElementsByName(comparedValue)[0];

        if ($('#' + comparedValue).val() !== '') {
            var inputType = validValueName.type
            
            if (validValueName.value !== comparedValueName.value) {
                if (is_safari) {
                    if (comparedValue === 'email') {
                        $('#' + validValue + 'Match').removeClass('hide').addClass('show');
                    } else {
                        $('#' + comparedValue + 'Match').removeClass('hide').addClass('show');
                    }
                } else {
                    $('#'+ comparedValue).get(0).setCustomValidity(helper.toTitleCase(inputType) + 's don\'t match');
                }
                return false;
            } 
          
            if (validValueName.value === comparedValueName.value) {
                if (is_safari) {
                    if (comparedValue === 'email') {
                        $('#' + validValue + 'Match').removeClass('show').addClass('hide');
                    } else {
                        $('#' + comparedValue + 'Match').removeClass('show').addClass('hide');
                    }
                } else {
                    if (comparedValue === 'email') {
                        $('#' + comparedValue).get(0).setCustomValidity('');
                    } else {
                        $('#'+ comparedValue).get(0).setCustomValidity('');
                    }
                }
                return true;
            }
        }        
        if (is_safari) {
            if($('#' + validValue).val() === ''){
                $('#'+validValue+'Error').text('Please fill out this field. ' + validValueName.title);
                $('#'+validValue+'Error').removeClass('hide').addClass('show');
            }
            if($('#' + comparedValue).val() === ''){
                $('#'+comparedValue+'Error').text('Please fill out this field. ' + comparedValueName.title);
                $('#'+comparedValue+'Error').removeClass('hide').addClass('show'); 
            }
        }
    },
    
    validateEmailField: function(thisFieldInput, thisField, comparedField) {
        var thisElementValue = $('#'+thisField).val();
        var comparedElementValue = $('#'+comparedField).val();
        var property1 = document.getElementsByName(thisField)[0];
        var inputPlaceholder = property1.placeholder;

        if(helper.validateEmailValue(thisFieldInput)){
        
            if (is_safari) {
                $('#'+thisField+'Improper').removeClass('show').addClass('hide')
            } else {
                $('#'+thisField).get(0).setCustomValidity('');
            }

            if(helper.evaluateValidInputValues(thisField, comparedField)){
                helper.unBindField(thisField);
                return true;
            } else{
                return false;
            }

        }else{
            if (thisElementValue === '' && is_safari) {
                $('#'+thisField+'Error').text('Please fill out this field. Please type a valid Email Address');
                $('#'+thisField+'Error').removeClass('hide').addClass('show'); 
            }else{
                is_safari ? $('#'+thisField+'Improper').removeClass('hide').addClass('show') : null; 
                !is_safari ? $('#'+thisField).get(0).setCustomValidity(inputPlaceholder+' is in improper format') : null;
            }
            return false;
        }
    },

    evaluatePasswordField: function(thisField) {
        var thisElementValue = $('#'+thisField).val();
        var passwordPattern = /^\S{4,}$/;
        var isThisElementValueValid = passwordPattern.test(thisElementValue);
        var charCount = $('#'+thisField).val().length;
        var errorElement = $('#'+thisField+'Error');

        if(thisElementValue !== ''){
            if(charCount < 4 && thisField === 'password') {
                is_safari ? errorElement.text('Please enter at least 4 character(s). You entered '+charCount+'. Password must be at least 4 characters long. No whitespace allowed') : null;
                is_safari ? errorElement.removeClass('hide').addClass('show') : null;
                //!is_safari ? $('#'+thisField).get(0).setCustomValidity('Please enter at least 4 character(s). You entered '+charCount+'. Password must be at least 4 characters long. No whitespace allowed') : null;
            }else{
                if(isThisElementValueValid){
                    is_safari ? errorElement.text('') : null;
                    is_safari ? errorElement.removeClass('show').addClass('hide') : null;
                    !is_safari ? $('#'+thisField).get(0).setCustomValidity('') : null;
                }else{
                    is_safari ? errorElement.text('Invalid input. Password must be at least 4 characters long. No whitespace allowed') : null;
                    is_safari ? errorElement.removeClass('hide').addClass('show') : null;
                    !is_safari ? $('#'+thisField).get(0).setCustomValidity('Invalid input. Password must be at least 4 characters long. No whitespace allowed') : null;
                }
            }
        }else{
            is_safari ? errorElement.text('Please fill out this field. Password must be at least 4 characters long. No whitespace allowed') : null;
            is_safari ? errorElement.removeClass('hide').addClass('show') : null; 
            //!is_safari ? $('#'+thisField).get(0).setCustomValidity('Please fill out this field. Password must be at least 4 characters long. No whitespace allowed') : null;
        }
    },

    evaluateEmailField: function(thisField, comparedField) {
        var thisElementValue = $('#'+thisField).val();
        var thisErrorElement = $('#'+thisField+'Error');

        if(thisElementValue !== ''){
          
            if($('#'+thisField).hasClass('has-error')){
                $('#'+thisField).removeClass('has-error');
                thisErrorElement.removeClass('show').addClass('hide');
                thisErrorElement.text('Please fill out this field.');

                if(!$('#'+comparedField).hasClass('has-error')){
                    $('.formerror').text('');
                    $('.formerror').removeClass('show');
                }

            }
         
            if (helper.validateEmailValue(thisElementValue)) {
                is_safari ? thisErrorElement.text('') : null;
                is_safari ? thisErrorElement.removeClass('show').addClass('hide') : null;
            }else{
                is_safari ? thisErrorElement.text('Please enter an email address. Please type a valid Email Address') : null;
                is_safari ? thisErrorElement.removeClass('hide').addClass('show') : null;
            }

        }else{
            is_safari ? thisErrorElement.text('Please fill out this field. Please type a valid Email Address') : null;
            is_safari ? thisErrorElement.removeClass('hide').addClass('show') : null; 
        }
    },
}

$(function () {
    helper.init();
});
