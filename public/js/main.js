    var currentUser;
    var currentUserFullName;
    var currentUserEmail;

    $('#loginNav').click(function(){
        console.log('yahoo');
        $('#content').load('login');
    })
    $('#newNav').click(function(){
        $('#content').load('newuser');
    })

    $('#myStorySubmit').click(function(){
        loadNewPost();
    })

    function deletepost(postid){
        console.log(postid);
        $('#content').load('deletepost/' + currentUser + '/' + postid);
        //$('#content').load('mystory/'+ currentUser);
    }

    function deleteapost(post){
        console.log(typeof post);
        $.when(deletepost(post)).then(loadtwo())
    }

    function editapost(post){
        
    }

    function login(){
        $('#content').load('signin/'+ $('#username').val() + '/' + $('#password').val());
    }

    function setLoginInfo(username, email, name){
        currentUser = username;
        currentUserFullName = name;
        currentUserEmail = email;
        console.log(currentUser);
        changeJumbotron('My Story Homepage', 'Write Down your thoughts below. Read some of your old stories as well')
        $('#loginuser').text(currentUser);
        $('#ddname').text(currentUserFullName);
        $('#ddemail').text(currentUserEmail);
    }
    
    function newNav() {
        $('#content').load('newuser'); 
        changeJumbotron('Signup', 'Please Signup Below to start writing down your thoughts.');
        $('.cta').hide();   
    }

    function loginNav() {
        $('#content').load('login');
        changeJumbotron('Login', 'Please Login Below to start writing down your thoughts.');
        $('.cta').hide();           
    }

    function changeJumbotron(pageTitle, leadText){
        $('.page-title').text(pageTitle);
        $('.lead').text(leadText);
        $('.cta').hide();   
    }

    function loadMystory(){
        $('#content').load('mystory/'+ currentUser);
        changeJumbotron('My Story Homepage', 'Write Down your thoughts below. Read some of your old stories as well')
    }

    function loadone(){
        $('#content').load('newpost/'+ currentUser + '/' + encodeURIComponent($('#ms_title').val()) + '/' + encodeURIComponent($('#ms_post').val()) );
    }

    function loadtwo(){
        $('#content').load('mystory/'+ currentUser);
    }


    function loadNewPost(){
        $.when(loadone()).then(loadtwo());
    }
