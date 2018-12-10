// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI

var debug = false;
function AppViewModel() {
    var self= this;
   var qrcode = new QRCode("qrcode");
   var qrcodeE = new QRCode("qrcodeE");
    self.email=ko.observable('');
    self.password=ko.observable('');
    self.urlIP=ko.observable('http://52.202.147.130:5000');
    self.newname=ko.observable('');
    self.newemail=ko.observable('ak@a.com');
    self.newpassword=ko.observable('a');
    self.evalname=ko.observable('');
    self.evalemail=ko.observable('');
    self.evalpass=ko.observable('');
    self.callback_webhook=ko.observable('');
    self.APIKey = ko.observable('');
    self.role = ko.observable('');
    self.isEdit = ko.observable(false);
    self.isDashboard = ko.observable(true);
    self.isDetail = ko.observable(false);
    self.teamNames = ko.observableArray([]);
    self.scores= ko.observableArray([]);
    self.newQuestion = ko.observable();
  //table variables
    var table,evaluatorsTable,resultsTable,detailTable,surveyTable;

  var token=  readCookie("token");
    self.token=ko.observable(token);
    self.adminName = ko.observable('Admin');

    self.logout=function () {
        eraseCookie("token");
        eraseCookie('role');
          self.token(null); self.role(null);
        window.location="index.html";
    }

    self.makeQRCode =function (params) {
        if(params==null || params ==''){
            params = self.newname();
        }
        qrcode.makeCode(params);
        $('#qrSpace').slideToggle();
    }
    self.makeEvalQRCode =function (params) {
        if(params==null || params ==''){
            params = self.evalname();
        }
        qrcodeE.makeCode(params);
        $('#qrSpaceE').slideToggle();
    }
   
    self.toggleQRCodeDisplay= function (params) {
        $('#qrcode').toggle();
        $('#eyeIcon').toggleClass('fa-eye fa-eye-slash');
    }
    self.toggleQRCodeDisplayE= function (params) {
        $('#qrcodeE').toggle();
        $('#eyeIconE').toggleClass('fa-eye fa-eye-slash');
    }
    self.login = function() {

      var email= self.email();
      var password= self.password();
    if(email=="") {
      $.toast({heading:'error',text:'Username is required',icon:'error'});
      return;

  }
    if(password=="") {
      $.toast({heading:'error',text:'Password is required',icon:'error'});
      return;

  }
if(debug){
$('#login').hide();
$('#page').show();
self.getTeams();
    return;
}


    $.ajax({
        method: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            email: self.email(),
            isPortal:true,
            password:self.password() }),
            url: self.urlIP()+"/user/login",
           
            success: function(result) {
               
                if(result.status==200){
               
                $.toast({ heading: 'Success',
                text: result.message,
                  showHideTransition: 'slide',
                icon: 'success'});
                $('#login').hide();
                $('#page').show();
                console.log(result)
                createCookie("token",result.data.token,1);
               

               
                self.getTeams();
                
                
              
                }
                else{
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
               
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                }
        
      });
        // .done(function( data ) {
        //   alert( "welcome your token is = : " + data.token );
        // });

    }

//to create new evaluator
    self.register = function() {

        var email= self.email();
      var password= self.password();
    if(email=="") {
      $.toast({heading:'error',text:'Username is required',icon:'error'});
      return;

  }
    if(password=="") {
      $.toast({heading:'error',text:'Password is required',icon:'error'});
      return;

  }

      var callback_webhook= self.callback_webhook();
    if(callback_webhook=="") {
      $.toast({heading:'error',text:'Callback webhook is required',icon:'error'});
      return;

  }
    
      
    $.ajax({
        method: "POST",
        contentType: 'application/json',
        data: JSON.stringify({
            email: self.email(),
            callback_webhook:self.callback_webhook(),
            password:self.password() }),
            
            url: self.urlIP()+"/user/signup",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                //self.token(result.token);
                console.log(result);
               self.APIKey( result.data.apiKey);
                $.toast({ heading: 'Success',
                text: result.message,
                  showHideTransition: 'slide',
                icon: 'success'});
                window.login="index.html";                
                }
                else{
                    if(result.status==200 )
                    $.toast({heading:'error',text:'Invalid User only admin is allowed to use this portal.', icon: 'error'});
                    else 
 
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
              

                }
                },
            error:
            function(result) {
                //Write your code here

                $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                }
        
      });
        // .done(function( data ) {
        //   alert( "welcome your token is = : " + data.token );
        // });

    }
    self.dashboardTab = function(params) {
        self.isDashboard(true);
        self.getTeams();
        self.showOneTable('home');
    }
    self.teamsTab = function(params) {
        $('#qrSpace').hide();
        self.isDashboard(false);
        self.getTeams();
        self.showOneTable('teams');
    }
    self.evaluatorsTab = function(params) {
        $('#qrSpaceE').hide();
        $('#addEvaluator').hide();
        self.isDashboard(true);
        self.getEvaluators();
        self.showOneTable('evaluators');
    }
    self.resultsTab = function (params) {
        self.isDashboard(false);
        self.getResults();
        self.showOneTable('results');
    }
    self.surveyTab = function (params) {
        self.isDashboard(false);
       self.getSurvey();
        self.showOneTable('survey');
    }
    self.showOneTable =function(selector){
        $('#teams').hide();
        $('#evaluators').hide();
        $('#results').hide();
        $('#home').hide();
        $('#survey').hide();
        $('#'+selector).show();

    }
    var myChart;
    self.drawCanvas = function (data) {
console.log(myChart)
self.teamNames([]);
self.scores([]);
        var teamnames = $.each( data, function( i, val){
           self.teamNames.push(val.teamName)
            return val.teamName;
          });
        //  self.teamNames(teamnames);
          self.teamNames.valueHasMutated();
          var scores = $.each( data, function( i, val){
              self.scores.push(val.score);
            return val.score;
          });
          self.scores.valueHasMutated();
          console.log(self.scores())
        var ctx = $("#myChart");
       var config =  {
            type: 'line',
            data: {
              labels:self.teamNames(),
              datasets: [{
                data: self.scores(),
                lineTension: 0,
                backgroundColor: 'transparent',
                borderColor: '#007bff',
                borderWidth: 4,
                pointBackgroundColor: '#007bff'
              }]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: false
                  }
                }]
              },
              legend: {
                display: false,
              }
            }
          };
          if(myChart!=null && myChart!=undefined){
              myChart.destroy();
           
          }
            myChart= new Chart(ctx,config);
          
        
    }
//to get all the teams data
self.getTeams=function(){
    $.ajax({
        method: "GET",
        contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
       
            url: self.urlIP()+ "/user/getTeam",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                //self.token(result.token);
             
                self.showTeams(result.data);
                if(self.isDashboard())
                self.drawCanvas(result.data);
                }
                else{
                    console.log('not getting status');
                    console.log(result);
                    $.toast({heading:'error',text:result.message, icon: 'error'});
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.message,icon:'error'});
                }
        
      });
  
}
self.getResults =function(){
    self.isDetail(false)
    $.ajax({
        method: "GET",
        contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
       
            url: self.urlIP()+ "/user/getTeam",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                //self.token(result.token);
                
             
                self.showResultsTable(result.data);
                }
                else{
                    console.log('not getting status');
                    console.log(result);
                    $.toast({heading:'error',text:result.message, icon: 'error'});
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.message,icon:'error'});
                }
        
      });
}
self.getResultDetail =function(teamId){
    self.isDetail(true);
    $('#results').hide();
    $.ajax({
        method: "POST",
        contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
        data: JSON.stringify({
            teamId:teamId
            }),
            url: self.urlIP()+ "/user/getResultForTeams",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                //self.token(result.token);
               
                self.showResultsDetailTable(result.data);
               
                }
                else{
                    console.log('not getting status');
                    console.log(result);
                    $.toast({heading:'error',text:result.message, icon: 'error'});
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.message,icon:'error'});
                }
        
      });
}
self.getEvaluators = function(){
    $.ajax({
        method: "GET",
        contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
       
            url: self.urlIP()+ "/user/getEvaluatorsList",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                self.showEvaluators(result.data);
                }
                else{
                    console.log('not getting status');
                    console.log(result);
                    $.toast({heading:'error',text:result.message, icon: 'error'});
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.message,icon:'error'});
                }
        
      });
  
}
self.getSurvey = function (params) {
    $.ajax({
        method: "GET",
        contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
       
            url: self.urlIP()+ "/user/getAllQuestions",
           
            success: function(result) {
                //Write your code here
                if(result.status==200){
                self.showSurveyTable(result.data);
                }
                else{
                    console.log('not getting status');
                    console.log(result);
                    $.toast({heading:'error',text:result.message, icon: 'error'});
                }
                },
            error:
            function(result) {
                //Write your code here
                $.toast({heading:'error',text:result.message,icon:'error'});
                }
        
      });
}
self.showTeams = function(data) {
    self.showTeamTable(data);
    console.log(readCookie('token'))
}
self.showEvaluators = function(data) {
    self.showEvaluatorsTable(data);
}
     //make ajax call to api to get the data required to show the data tables.
  
    self.showTeamTable= function(tabledata) {
        if(tabledata == null || tabledata ==[] || tabledata=='' ||tabledata.length <=0){ 
            $.toast({heading:'Ah! Oh!',text:"Looks like there is no data to show!",icon:'error'});
            return;}
     // console.log(table);
        $('#teams').fadeIn( 2000);
        if(table == null ){
        table=$('#teamstable').DataTable( {
            data: tabledata, 
            columns: [
                { data: '_id', title:'Team ID' },
                { data: 'teamName',title:'Team' },
                { data: 'score',title:'Average Score' },
                { data: 'numberOfEval' ,title:'#Evaluations'}
            ]
        } );
        $('#teamstable tbody').on( 'click', 'tr', function () {
            if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
                $('#editTeam').addClass('disabled')
                $('#deleteTeam').addClass('disabled');

            }
            else {
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#editTeam').removeClass('disabled');
                $('#deleteTeam').removeClass('disabled');

            }
        } );
        }
        else{
           //see how to update table
          // $('#teamstable').DataTable().draw();
            table.clear();
            table.rows.add(tabledata).draw();
        }
        

        
    } 
    self.showResultsTable= function(tabledata) {
        if(tabledata == null || tabledata ==[] || tabledata=='' ||tabledata.length <=0){ 
            $.toast({heading:'Ah! Oh!',text:"Looks like there is no data to show!",icon:'error'});
            return;}
        // console.log(table);
           $('#results').fadeIn( 2000);
           if(resultsTable == null ){
            resultsTable=$('#resultsTable').DataTable( {
               data: tabledata, 
               columns: [
                   { data: '_id', title:'Team ID' },
                   { data: 'teamName',title:'Team' },
                   { data: 'score',title:'Average Score' },
                   { data: 'numberOfEval' ,title:'#Evaluations'}
               ]
           } );
       
           }
           else{
              //see how to update table
             // $('#teamstable').DataTable().draw();
             resultsTable.clear();
             resultsTable.rows.add(tabledata).draw();
           }
           $('#resultsTable tbody').on( 'click', 'tr', function () {
            if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
             

            }
            else {
                resultsTable.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
             
                //   alert('show user details');
                //find the userid and surveyid admin clicked
                var teamid= resultsTable.row('.selected').data()._id;
               //hide this table and get details about the team using team id and results table
               self.getResultDetail(teamid)
               
           }
         });
           
       } 
    self.showResultsDetailTable= function(tabledata) {
        if(tabledata == null || tabledata ==[] || tabledata=='' ||tabledata.length <=0){ 
            $.toast({heading:'Ah! Oh!',text:"Looks like there is no data to show!",icon:'error'});
            return;}
        
           $('#detailResult').fadeIn( 2000);
           if(detailTable == null ){
            detailTable=$('#detailTable').DataTable( {
               data: tabledata, 
               columns: [
                   { data: '_id', title:'SN' },
                   { data: 'evalId',title:'Evaluator' },
                   { data: 'text',title:'Question' },
                   { data: 'answer' ,title:'Answer'}
               ]
           } );
       
           }
           else{
              //see how to update table
             // $('#teamstable').DataTable().draw();
             detailTable.clear();
             detailTable.rows.add(tabledata).draw();
           }
           
       } 
    self.showEvaluatorsTable= function(tabledata) {
        console.log(tabledata);
        if(tabledata == null || tabledata ==[] || tabledata=='' ||tabledata.length <=0){ 
            $.toast({heading:'Ah! Oh!',text:"Looks like there is no data to show!",icon:'error'});
            return;}
     
           $('#evaluators').fadeIn( 2000);
           if(evaluatorsTable == null){
           evaluatorsTable=$('#evaluatorsTable').DataTable( {
               data: tabledata, 
               columns: [
                   { data: '_id', title:'ID' },
                   { data: 'username',title:'Name' },
                   { data: 'email',title:'Email' },
                   
               ]
           } );
           
           $('#evaluatorsTable tbody').on( 'click', 'tr', function () {
            if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
                $('#editEvaluator').addClass('disabled')
                $('#deleteEvaluator').addClass('disabled');

            }
            else {
                evaluatorsTable.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#editEvaluator').removeClass('disabled');
                $('#deleteEvaluator').removeClass('disabled');

            }
        } );
        }
        else{
           //see how to update table
          // $('#teamstable').DataTable().draw();
          evaluatorsTable.clear();
          evaluatorsTable.rows.add(tabledata).draw();
        }
           
       }
       self.showSurveyTable = function(tabledata) {
        if(tabledata == null || tabledata ==[] || tabledata=='' ||tabledata.length <=0){ 
            $.toast({heading:'Ah! Oh!',text:"Looks like there is no data to show!",icon:'error'});
            return;}
            $('#survey').fadeIn( 2000);
            if(surveyTable == null){
                surveyTable=$('#surveyTable').DataTable( {
                data: tabledata,
                rowReorder: true,
                columns: [
                    { data: 'qId', title:'ID' },
                    { data: 'qText',title:'Text' },
                    { data: 'orderId',title:'Order' },
                    
                ]
            } );
            
            $('#surveyTable tbody').on( 'click', 'tr', function () {
             if ( $(this).hasClass('selected') ) {
                 $(this).removeClass('selected');
                 $('#editQuestion').addClass('disabled')
                 $('#deleteQuestion').addClass('disabled');
 
             }
             else {
                surveyTable.$('tr.selected').removeClass('selected');
                 $(this).addClass('selected');
                 $('#editQuestion').removeClass('disabled')
                 $('#deleteQuestion').removeClass('disabled');
               
             }
         } );
         }
         else{
            //see how to update table
           // $('#teamstable').DataTable().draw();
           surveyTable.clear();
           surveyTable.rows.add(tabledata).draw();
         }
       }
    self.showUsers=function (params) {
        $('#usertable').fadeIn(2000);
        $('#userDetail').hide();
    }
  
    self.saveTeam = function (isEdit) {
        //add user ajax to be called here'
        if(isEdit){
            self.editTeam();
            return;
        }

        console.log(readCookie('token'))
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                teamName:self.newname(),
                }),
                url: self.urlIP()+ "/user/registerTeam",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    console.log('team data')
                    console.log(result.data);

                     $('#addUser').slideToggle("slow");
                
                    //self.getData();
                    self.makeQRCode(result.data.teamId);
                    self.getTeams();
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
            // .done(function( data ) {
            //   alert( "welcome your token is = : " + data.token );
            // });
    
        

    }
    self.saveEvaluator = function (isEdit) {
      //  self.showEvaluatorForm();
        //add user ajax to be called here'
        if(isEdit){
            self.editEvaluator();
            return;
        }

        console.log("adding evaluator")
        console.log(self.evalemail()+self.evalpass()+self.evalname())
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                email:self.evalemail(),
                password:self.evalpass(),
                username:self.evalname(),
                }),
                url: self.urlIP()+ "/user/registerEvaluator",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    console.log('team data')
                    console.log(result.data);

                    // $('#addUser').slideToggle("slow");
                
                    //self.getData();
                    self.makeEvalQRCode(result.data.qrcode);
                    self.getEvaluators();
                    self.showEvaluatorForm()
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
            // .done(function( data ) {
            //   alert( "welcome your token is = : " + data.token );
            // });
    
        

    }
    self.saveQuest = function (isEdit) {
         //add user ajax to be called here'
         if(isEdit){
            self.editQuestion();
            return;
        }

        console.log("adding question")
        console.log(self.newQuestion())
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                qText:self.newQuestion()
                }),
                url: self.urlIP()+ "/user/createQuestion",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    console.log('queston data')
                    console.log(result.data);

                    // $('#addQuestion').slideToggle("slow");
                    //self.getData();
                   self.showQuestionForm();
                   self.getSurvey();
                  
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
            // .done(function( data ) {
            //   alert( "welcome your token is = : " + data.token );
            // });
    
    }
    self.showeditForm= function(){
        self.isEdit(!self.isEdit());
        var teamName= table.row('.selected').data().teamName;
        self.newname(teamName)
        $('#addTeam').slideToggle( "slow");
    }
    self.showeditEvaluatorForm= function(){
        self.isEdit(!self.isEdit());
        var name= evaluatorsTable.row('.selected').data().username;
       
        self.evalname(name)
        $('#emailEval').hide();
        $('#passwordEval').hide();
        $('#addEvaluator').slideToggle( "slow");
    }
    self.showEditQuestionForm= function(){
        self.isEdit(!self.isEdit());
        var text= surveyTable.row('.selected').data().qText;
        self.newQuestion(text)
        $('#addQuestion').slideToggle( "slow");
    }
    self.editTeam = function () {
        //add user ajax to be called here
        var teamId= table.row('.selected').data()._id;
        var tname =self.newname();
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                teamName:tname,
                id: teamId
                }),
                url: self.urlIP()+ "/user/editTeam",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                     $('#addUser').slideToggle("slow");
                     self.getTeams();
                     self.showeditForm();
                
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
            // .done(function( data ) {
            //   alert( "welcome your token is = : " + data.token );
            // });
    
        

    }
    self.editEvaluator= function () {
        //add user ajax to be called here
        var userId= evaluatorsTable.row('.selected').data()._id;
        var tname =self.evalname();
        console.log(tname);
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                username:tname,
                userId: userId
                }),
                url: self.urlIP()+ "/user/editEvaluator",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                     $('#addEvaluator').slideToggle("slow");
                     self.getEvaluators();
                   
                
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });

    }
    self.editQuestion =function(params) {
        //add user ajax to be called here
        var qid= surveyTable.row('.selected').data().qId;
        var qname =self.newQuestion();
        console.log('question :');
        console.log(qname);
        console.log('question id :');
        console.log(qid);
        $.ajax({
            method: "POST",
            contentType: 'application/json',
        headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                qId: qid, 
                qText:qname
                
                }),
                url: self.urlIP()+ "/user/editQuestion",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    // $('#addUser').slideToggle("slow");
                    console.log('edit question result : ');
                    console.log(result)
                     self.getSurvey();
                     self.showEditQuestionForm();
                
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
            // .done(function( data ) {
            //   alert( "welcome your token is = : " + data.token );
            // });
    }
    self.deleteTeam = function () {
        //add user ajax to be called here
        var teamId= table.row('.selected').data()._id;
        console.log(teamId)
        $.ajax({
            method: "DELETE",
            contentType: 'application/json',
            headers: {"Authorization": "BEARER "+readCookie('token')},
            url: self.urlIP()+ "/user/deleteTeam/"+teamId,
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    self.getTeams();
                    self.disableButtons();
                    $('#qrSpace').hide();
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
          
    
        

    }
    self.deleteSurvey = function () {
        
        //add user ajax to be called here
        var teamId= surveyTable.row('.selected').data().qId;
        console.log(teamId)
        $.ajax({
            method: "POST",
            contentType: 'application/json',
            headers: {"Authorization": "BEARER "+readCookie('token')},
            data: JSON.stringify({
                qId: teamId
                }),
            url: self.urlIP()+ "/user/deleteQuestion",
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                    self.getSurvey();
                    self.disableButtons();
                  //  $('#qrSpace').hide();
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
          
    
        

    }
    self.deleteEvaluator = function () {
        //add user ajax to be called here
        var id= evaluatorsTable.row('.selected').data()._id;
        //console.log(teamId)
        $.ajax({
            method: "DELETE",
            contentType: 'application/json',
            headers: {"Authorization": "BEARER "+readCookie('token')},
            url: self.urlIP()+ "/user/"+id,
               
                success: function(result) {
                    //Write your code here
                    if(result.status==200){
                    //self.token(result.token);
                    $.toast({ heading: 'Success',
                    text: result.message,
                      showHideTransition: 'slide',
                    icon: 'success'});
                   self.getEvaluators()
                    $('#qrSpace').hide();
                    }
                    else{
                        $.toast({heading:'error',text:result.message, icon: 'error'});
                    }
                    },
                error:
                function(result) {
                    //Write your code here
                    $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                    }
            
          });
      
    }


self.disableButtons=function(){
    $('#editQuestion').addClass('disabled')
    $('#deleteQuestion').addClass('disabled');

}
self.showTeamForm= function(){
    self.isEdit(false);
    self.newname('');
    $('#addTeam').slideToggle( "slow");
}

self.showEvaluatorForm= function(){
    self.isEdit(false);
    self.evalname('');
    self.evalpass('');
    self.evalemail('');
    $('#emailEval').show();
    $('#passwordEval').show();
    $('#addEvaluator').slideToggle( "slow");
}
self.saveOrder = function(){
var surveyData = surveyTable.rows().data();
var arrayToStore = $.each( surveyData, function( i, val){
    return val.orderId;
  });
  //send this array to ajax similar to saveTeam
}
self.showQuestionForm = function (params) {
    self.newQuestion('');
    self.isEdit(false);
    $('#addQuestion').slideToggle( "slow");
}
self.delelteSurvey = function (params) {
     //add user ajax to be called here
     var teamId= surveyTable.row('.selected').data()._id;
     console.log(teamId)
     $.ajax({
         method: "DELETE",
         contentType: 'application/json',
         headers: {"Authorization": "BEARER "+readCookie('token')},
         url: self.urlIP()+ "/user/deleteTeam/"+teamId,
            
             success: function(result) {
                 //Write your code here
                 if(result.status==200){
                 //self.token(result.token);
                 $.toast({ heading: 'Success',
                 text: result.message,
                   showHideTransition: 'slide',
                 icon: 'success'});
                 self.getTeams();
                 self.disableButtons();
                 $('#qrSpace').hide();
                 }
                 else{
                     $.toast({heading:'error',text:result.message, icon: 'error'});
                 }
                 },
             error:
             function(result) {
                 //Write your code here
                 $.toast({heading:'error',text:result.responseJSON.message,icon:'error'});
                 }
         
       });
    
}



//initialisation of the page goes here


if((self.token()==null || self.token()=="")){
$('#page').hide();

}else{
    //self.getData();
    self.getTeams();
    $('#page').show();
}

$('#addTeam').hide();
$('#addQuestion').hide();

//dummy data to be deleted later
var data = [
    {
        "_id":       "23",
        "teamName":   "System Architect",
        "score":     "$3,120",
        "numberOfEval": "2011/04/25"
    },
    {
        "_id":       "Tiger Nixon",
        "teamName":   "System Architect",
        "score":     "$3,120",
        "numberOfEval": "2011/04/25"
    }
    
];

}

ko.applyBindings(new AppViewModel());

function createCookie(name, value, days) {
    // var expires;

    // if (days) {
    //     var date = new Date();
    //     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    //     expires = "; expires=" + date.toGMTString();
    // } else {
    //     expires = "";
    // }
    // document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    window.localStorage.setItem(name,value);
}

function readCookie(name) {
    // var nameEQ = encodeURIComponent(name) + "=";
    // var ca = document.cookie.split(';');
    // for (var i = 0; i < ca.length; i++) {
    //     var c = ca[i];
    //     while (c.charAt(0) === ' ')
    //         c = c.substring(1, c.length);
    //     if (c.indexOf(nameEQ) === 0)
    //         return decodeURIComponent(c.substring(nameEQ.length, c.length));
    // }
    return window.localStorage.getItem(name);
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}


// Activates knockout.js


