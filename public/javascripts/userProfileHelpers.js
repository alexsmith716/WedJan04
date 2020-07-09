
var helper = {

    init: function() {

        /*
        if(userProfileChangeConfirmed === true){
            $('#forgotPasswordConfirmModal').modal({
                keyboard: false,
                backdrop: 'static'
            });
        };
        */

        //$('<div class="modal-backdrop"></div>').appendTo(document.body);
        //$('.modal-backdrop').remove();

        // $('[name='inputElement']').prop('required', true);
        // $('[name='state']').prop('required', true);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        $('.modal').on('shown.bs.modal', function() {
          $(this).find('[autofocus]').focus();
          var hasFocus = $('#state').is(':focus');
          var hasFocus2 = $('#inputElement').is(':focus');
        });

        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

        $('#personalInfo').click(function(){
            helper.toggleEditBtn(false, 'personalInfo', true);
        });

        $('#accountInfo').click(function(){
            helper.toggleEditBtn(false, 'accountInfo', true);
        });

        $('#personalInfoUpdate').click(function(){
            helper.toggleEditBtn(false, 'personalInfo', false);
        });

        $('#accountInfoUpdate').click(function(){
            helper.toggleEditBtn(false, 'accountInfo', false);
        });

        /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

        $('#firstNameBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        $('#lastNameBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        $('#cityBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        $('#stateBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        $('#emailBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        $('#passwordBtn').click(function(){
            helper.doUserProfileEditModal('userProfileForm', this);
        });

        /*
        $('#inputElement').on('change', function() {
            helper.evaluateInput(this);
        });

        $('#state').on('change', function() {
            helper.evaluateInput(this);
        });
        */


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
                            //$('#signUpForm').submit();
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



        $('#userProfileFormXXXXXX').on('submit', function(e) {
            e.preventDefault();
            //showLoading();
            /*
            var inputAttr1 = $(activeElement).attr('id');
            var sl = (inputAttr1.length)-3;
            var inputAttr = inputAttr1.slice(0,sl);
            var titleText = inputAttr.replace(/([A-Z])/g, ' $1');
            titleText = titleText.replace(/^./, function(str){return str.toUpperCase();});
            console.log('#### userProfileForm > submit > activeElement ID: ', inputAttr1);
            console.log('#### userProfileForm > submit > activeElement Name: ', titleText);
            */
            var activeEdit = $(this).attr('activeProfileEdit');
            var activeEditType = $(this).attr('activeProfileType');
            console.log('#### userProfileForm > submit > activeProfileEdit: ', activeEdit);
            console.log('#### userProfileForm > submit > activeProfileType: ', activeEditType);
            
            var isFormValid = helper.evaluateInput(activeEdit,activeEditType);

            if(!isFormValid){
                console.log('#### userProfileForm > submit > BAD FORM: ', isFormValid);

            }else{
                console.log('#### userProfileForm > submit > GOOD FORM: ', isFormValid);

                var data = {};
                data.title = "title";
                data.message = "message";
                    
                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: 'http://localhost:3000/endpoint',                      
                    success: function(data) {
                        console.log('success');
                        console.log(JSON.stringify(data));
                    }
                });
            }
        });

        $('#userProfileConfirmModal').on('hidden.bs.modal', function (e) {
            //passwordResetConfirmed = false;
        });

        $('#userProfileFormModal').on('hidden.bs.modal', function (e) {
            document.getElementById('userProfileForm').reset();
            $('#state').val('').trigger('change');
            $('#inputElement').val('');

            $('#userProfileFormError').removeClass('show').addClass('hide');
            $('#userProfileFormError').text('');
            /*
            var thisSpanErrorElement = $(this).find('span');
            thisSpanErrorElement.removeClass('show').addClass('hide');
            $('#inputElement').removeClass('invalid');
            $('#inputElement').val('');
            */
        });

    },

    evaluateInput: function(what, whatType) {

        var emailPattern = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        var passwordPattern = /[\S]{4,127}/;

        var inputAttr1 = $(what).attr('id');
        var inputAttr2 = $(whatType).attr('id');
        var whatTypeVal = $(whatType).val();
        var uppStr1 = inputAttr1.charAt(0).toUpperCase() + inputAttr1.substr(1).toLowerCase();

        var sl = (inputAttr1.length)-3;
        var inputAttr = inputAttr1.slice(0,sl);
        var titleText = inputAttr.replace(/([A-Z])/g, ' $1');
        var isThisElementValueValid;
        var pattern;
        titleText = titleText.replace(/^./, function(str){return str.toUpperCase();});

        console.log('#### evaluateInput > what: ', what);
        console.log('#### evaluateInput > inputAttr1: ', inputAttr1);
        console.log('#### evaluateInput > inputAttr2: ', inputAttr2);
        console.log('#### evaluateInput > theFormVal: ', whatTypeVal);
        console.log('#### evaluateInput > whatType: ', whatType);
        console.log('#### evaluateInput > emailPattern: ', emailPattern);
        
        if(inputAttr1 === 'emailBtn' || inputAttr1 === 'passwordBtn'){

            inputAttr1 === 'emailBtn' ? pattern = emailPattern : pattern = passwordPattern;

            isThisElementValueValid = pattern.test(whatTypeVal);
            console.log('evaluateInput > whatEdit1: ', inputAttr1);
            console.log('evaluateInput > isThisElementValueValid: ', isThisElementValueValid);

            if(isThisElementValueValid){
                $(whatType).removeClass('invalid').addClass('valid');
                $('#userProfileFormError').removeClass('show').addClass('hide');
                $('#userProfileFormError').text(''); 
                return true;
            }else{
                $(whatType).removeClass('valid').addClass('invalid');
                $('#userProfileFormError').removeClass('hide').addClass('show');
                $('#userProfileFormError').text(titleText + ' is required');
                return false;
            }

        }else{
            console.log('evaluateInput > whatEdit3: ', inputAttr1);
            if(whatTypeVal && whatTypeVal !== ''){
                console.log('evaluateInput > thisElementValue2: ', whatTypeVal);
                $(whatType).removeClass('invalid').addClass('valid');
                $('#userProfileFormError').removeClass('show').addClass('hide');
                $('#userProfileFormError').text(''); 
                return true;
            }else{
                console.log('evaluateInput > thisElementValue3: ', whatTypeVal);
                $(whatType).removeClass('valid').addClass('invalid');
                $('#userProfileFormError').removeClass('hide').addClass('show');
                $('#userProfileFormError').text(titleText + ' is required'); 
                return false;
            }
        }

    },

    toggleEditBtn: function(a,what,tab) {

        var cd, i, e;
        cd = $('#' + what);
        cd = document.getElementsByClassName(what);

        for(i=0; i < cd.length; i++) {
            e = cd[i]; 
            if(tab){
                e.style.display = 'none';
            }else{
                if(e.style.display == 'none') {
                    e.style.display = 'inline';
                } else {
                    e.style.display = 'none';
                }
            }
        }
        if(e.style.display === 'inline'){
            what === 'accountInfo' ? $('#updateAccountBtnv').text('Done') : null;
            what === 'personalInfo' ? $('#updatePersonalBtn').text('Done') : null;
        }
        if(e.style.display === 'none'){
            what === 'accountInfo' ? $('#updateAccountBtn').text('Update Account info') : null;
            what === 'personalInfo' ? $('#updatePersonalBtn').text('Update Personal info') : null;
        }
    },

    doUserProfileEditModal: function(formID,whatElem) {

        var inputAttr1 = $(whatElem).attr('id');
        var sl = (inputAttr1.length)-3;
        var inputAttr = inputAttr1.slice(0,sl);
        var titleText = inputAttr.replace(/([A-Z])/g, ' $1');
        titleText = titleText.replace(/^./, function(str){return str.toUpperCase();});

        var thisElement = $('#' + inputAttr1);
        var inputType = $(thisElement.parent().attr('data-type'));
        var currentValue = $(thisElement).parent().attr('data-value');
        thisElement = thisElement.selector;
        inputType = inputType.selector;

        /*
        console.log('whatElem: ', whatElem);
        console.log('formID+++++++++++++++++: ', formID);
        console.log('titleText++++++++++++++++: ', titleText);
        console.log('inputAttr++++++++++++++++: ', inputAttr);
        console.log('thisElement: ', thisElement);
        console.log('inputType++++++++++++++++: ', inputType);
        console.log('currentValue+++++++++++++: ', currentValue);
        */
    
        var formLabelUpdate = document.getElementById(formID).getElementsByTagName( 'label' )[1];
    
        var ie = document.getElementById('inputElement');
        var iparent = ie.closest('div');  
        var se = document.getElementById('state');
        var sparent = se.closest('div');
        var formInput;
    
        iparent.style.visibility = 'hidden';
        sparent.style.visibility = 'hidden';
        $( '#inputElement' ).prop( 'disabled', true );
        $( '#state' ).prop( 'disabled', true );
    
        if (inputType === 'select'){
            sparent.style.visibility = 'visible';
            $( '#state' ).prop( 'disabled', false );
            $( '#state' ).find('[option]').focus();
            formInput = 'state';
        }else{
            iparent.style.visibility = 'visible';
            $( '#inputElement' ).prop( 'disabled', false );
            var formInputUpdate = document.getElementById('inputElement');

            formInputUpdate.setAttribute('placeholder', titleText);
            formLabelUpdate.setAttribute('for', inputAttr);
            formInputUpdate.setAttribute('name', inputAttr);
            formInputUpdate.setAttribute('type', inputType);

            switch (inputAttr1) {
                case 'firstNameBtn':
                    formInputUpdate.setAttribute('maxlength', '21');
                    formInputUpdate.setAttribute('title', 'Please type your First Name. Maximum 21 characters');
                    break;
                case 'lastNameBtn':
                    formInputUpdate.setAttribute('maxlength', '31');
                    formInputUpdate.setAttribute('title', 'Please type your Last Name.  Maximum 31 characters');
                    break;
                case 'cityBtn':
                    formInputUpdate.setAttribute('title', 'Please type your City');
                    break;
                case 'emailBtn':
                    formInputUpdate.setAttribute('title', 'Please type a valid Email Address');
                    break;
                case 'passwordBtn':
                    formInputUpdate.setAttribute('minlength', '4');
                    formInputUpdate.setAttribute('title', 'Password must be at least 4 characters long. No whitespace allowed');
                    break;
            }

            formInput = 'inputElement';
        }
    
        var formInputCurrent2 = document.getElementById( formID ).getElementsByClassName('dont-break-out')[0];
        var formCurrentValueLabel = document.getElementById( formID ).getElementsByTagName( 'label' )[0];
    
        formCurrentValueLabel.innerHTML = 'Current ' + titleText + ':';
        formLabelUpdate.innerHTML = 'Change your ' + titleText + ':';
        formInputCurrent2.innerHTML = currentValue;
        
        document.getElementById('userProfileForm').setAttribute('activeProfileType', ('#' + formInput));
        document.getElementById('userProfileForm').setAttribute('activeProfileEdit', ('#' + inputAttr1));

        $('#userProfileFormModal').modal({
          keyboard: false,
          backdrop: 'static'
        })
    },

    clearForgotPassword: function() {
        var thisSpanErrorElement = $('#forgotPasswordFormModal').find('span');
        thisSpanErrorElement.removeClass('show').addClass('hide');
        $('#forgotPasswordEmail').removeClass('invalid');
        $('#forgotPasswordEmail').val('');
    },

    userProfileConfirm: function() {
        userProfileChangeConfirmed = false;
    },

    postData: function() {
        var data = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            confimEmail: $('#confirmEmail').val(),
            password: $('#password').val(),
            city: $('#city').val() == undefined ? null : $('#city').val(),
            state: $('#state').val() == undefined ? null : $('#state').val()
        }
        return data;
    },

}

$(function () {
    helper.init();
});

/*

  .modal.fade(id="forgot", name="forgot", tabindex='-1')
      .modal-dialog
          .modal-content
              .modal-header
                  button.close(type="button" data-dismiss="modal") &times;
                  h4.modal-title Forgot password?
              .modal-body
                  form(role="form")
                      p Forgot your password? Enter your email address below and we'll send instructions on how to reset your password.

                      fieldset

                        .alert.alert-warning(style="margin-top:10px; display: none; padding-left: 35px;")
                          strong(style="margin-left: 4px;") An email containing your password recovery link has been sent.

                        .form-group(style="border: 0 none;")
                          label
                            strong Email:
                          input.form-control(id="emaildeco" name="emaildeco" type="email" placeholder="Email Address")
                          div(style="color:#b94a48;")
                            strong Please enter a valid email address!
                        div
                          a.btn.btn-default(href="" id="forgot-password" name="forgot-password")
                            span
                              strong Go

              .modal-footer
                button.btn.btn-default(type="button",data-dismiss="modal") Close
                .loading(style="display:none;")

*/



