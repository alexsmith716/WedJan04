
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        //var code = helper.getCookies('id'); 

        $('[name="forgotEmail"]').prop('required', true);
        $('[name="email"]').prop('required', true);
        $('[name="password"]').prop('required', true);

        //meta(name="csrf-token", content=`${csrfToken}`)
        //helper.setCSRFToken($('meta[name="csrf-token"]').attr('content'));

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        var emailPattern = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        var passwordPattern = /[\S]{1,127}/;

        $('#forgotPasswordAnchor').click(function(){
            $('#forgotPasswordFormModal').modal({
                keyboard: false,
                backdrop: 'static'
            })
        });

        $('#forgotPasswordFormModal').on('hidden.bs.modal', function () {
            $("#forgotPasswordForm").get(0).reset();
            $('#forgotEmail').val('');
            $('#forgotPasswordForm .loginerror').addClass('hide');
            $('#forgotPasswordForm .loginerror').text('');
            $('#forgotEmail').removeClass('invalid');
            $('.alert-warning').hide();
            $('.forgotOkBtn').hide();
            $('.forgotCSBtns').show();
        });

/* ====================================================================================== */

        $('#forgotPasswordSubmitBtn').on('click', function(e) {
            e.preventDefault();
            $('#forgotPasswordForm .loginerror').addClass('hide');
            $('#forgotEmail').get(0).setCustomValidity('');
            $('#forgotEmail').removeClass('invalid');
            var serviceUrl = 'https://localhost:3000/api/evaluateuseremail';
            var data = {};
            var email = $('#forgotEmail').val();
            var isEmailValid = emailPattern.test(email);

            if (email === '' || !isEmailValid) {

                if(is_safari && (email !== '' && !isEmailValid)){
                    $('#forgotPasswordForm .loginerror').text('Email is incorrect format. Please try again.');
                }else if(email === ''){
                    $('#forgotPasswordForm .loginerror').text('Email is required. Please try again.');
                }

                is_safari ? $('#forgotPasswordForm .loginerror').removeClass('hide').addClass('show') : null;

                !is_safari ? $('<input type="submit">').hide().appendTo($('#forgotPasswordForm')).click().remove() : null;
                
                return false;
            }

            is_safari ? $('#forgotPasswordForm .loginerror').removeClass('show').addClass('hide') : null;

            $('.loading').show();
     
            data = {
                email: email,
                expectedResponse: true
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
                        $('.alert-warning').show();
                        $('.forgotOkBtn').show();
                        $('.forgotCSBtns').hide();
                        $('.loading').hide();
                    } else {
                        $('#forgotPasswordForm .loginerror').text('Could not validate your email.');
                        $('#forgotPasswordForm .loginerror').removeClass('hide');
                        $('.loading').hide();
                        return false;
                    }
                },
                error: function(xhr, status) {
                    $('#forgotPasswordForm .loginerror').text('Could not validate your email, try again or contact customer service.');
                    $('#forgotPasswordForm .loginerror').removeClass('hide');
                    $('.loading').hide();
                    return false;
                }
            });
        });

/* ====================================================================================== */

        $('#loginSubmitBtn').on('click', function(e) {
            e.preventDefault();
            $('#loginForm .loginerror').addClass('hide');
            var serviceUrl = 'https://localhost:3000/api/evaluateregistereduser';
            var data = {};
            var email = $('#email').val();
            var password = $('#password').val();
            var isEmailValid = emailPattern.test(email);
            var formData = $('#loginForm').serializeArray();
            var element;
              
            for (var userValue in formData){
                element = $('#'+formData[userValue]['name']);
                element.get(0).setCustomValidity('');
                element.removeClass('invalid');
            }
                
            if (email === '' || password === '' || !isEmailValid) {

                if(email !== '' && !isEmailValid){

                    if (is_safari) {
                        $('#loginForm .loginerror').text('Email is incorrect format. Please try again.');
                    }else{
                        $('#email').get(0).setCustomValidity('Email is incorrect format. Please try again.');
                    }
                    $('#email').removeClass('valid').addClass('invalid');

                }else if(email === ''){

                    if (is_safari) {
                        $('#loginForm .loginerror').text('Email is required. Please try again.');
                    }else{
                        $('#email').get(0).setCustomValidity('Email is required. Please try again.');
                    }
                    $('#email').removeClass('valid').addClass('invalid');

                }else if(password === ''){

                    if (is_safari) {
                        $('#loginForm .loginerror').text('Password is required. Please try again.');
                    }else{
                        $('#password').get(0).setCustomValidity('Password is required. Please try again.');
                    }
                    $('#password').removeClass('valid').addClass('invalid');

                }

                !is_safari ? $('<input type="submit">').hide().appendTo($('#loginForm')).click().remove() : null;
                is_safari ? $('#loginForm .loginerror').addClass('show') : null;
                return false;
            }

            showLoading();
            data = {
                email: email,
                password: password
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
                        $('#loginForm').submit();
                    } else {
                        $('#loginForm .form-control').addClass('has-error');
                        $('#loginForm .loginerror').text('Email and Password don\'t match. Please try again.');
                        $('#loginForm .loginerror').removeClass('hide');
                        hideLoading();
                        return false;
                    }
                },
                error: function(xhr, status) {
                    $('#loginForm .form-control').addClass('has-error');
                    $('#loginForm .loginerror').text('Email and Password don\'t match. Please try again.');
                    $('#loginForm .loginerror').removeClass('hide');
                    hideLoading();
                    return false;
                }
            });
        });
    },

    setCSRFToken: function (securityToken) {
      $.ajaxPrefilter(function (options, _, xhr) {
        if (!xhr.crossDomain) {
          xhr.setRequestHeader('X-CSRF-Token', securityToken);
        }
      });
    },

    clearForgotPassword: function() {
        $("#forgotPasswordForm").get(0).reset();
        $('#forgotEmail').val('');
        $('#forgotPasswordForm .loginerror').addClass('hide');
        $('#forgotPasswordForm .loginerror').text('');
        $('#forgotEmail').removeClass('invalid');
        $('.alert-warning').hide();
        $('.forgotOkBtn').hide();
        $('.forgotCSBtns').show();
    },
    showLoading: function() {
        $('.modal-backdrop').show();
    },

    hideLoading: function() {
        $('.modal-backdrop').hide();
    },

}

$(function () {
    helper.init();
});

