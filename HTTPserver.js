const express = require('express');
const bodyParser = require('body-parser');
const jwt=require('jsonwebtoken')
const cors = require('cors') 
const DBconnector = require('./databaseconnector.js')
const port = 80
const app = express();
app.use(bodyParser .json());
app.use(cors());


/////////////////////////////////////angular page//////////////////////////////////////////////////
app.use(express.static('./Frontend'))
app.get('/', function (req, res) {
   res.sendFile('./Frontend/index.html',{root:__dirname})
})
/////////////////////////////////////angular page//////////////////////////////////////////////////

////////////////////////////////////////////////////user functions/////////////////////////////////////////////////////////////
app.post('/checkuserExhistbylocalstore', async function(req, res){    
   let userdata=jwt.verify(req.body.value,'LKJTS');
   
   const resttt= await DBconnector.customqueries("SELECT * FROM USERS WHERE userid="+userdata.userid);  
   //console.log(resttt[0].username);
if(resttt[0].username==userdata.username &&resttt[0].password==userdata.password ){
//console.log('valied')

// kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
// +userdata.userid+",'"+new Date().toLocaleString()+"','UserActive',4,'"+userdata.username+"')") ;
userdata.password='';
//console.log(userdata);
res.status(200).send({out:'valied',user:userdata});}
else res.status(400).send({out:'invalied',user:null});})

app.post('/checkuserExhist', async function(req, res){
   let userdata=req.body
   let out={result:'NOT-EX'}
  // console.log(userdata.Username) 
       const kk= await DBconnector.customqueries("SELECT * FROM USERS WHERE userName='"+userdata.Username+"'")    
  //     console.table(kk)  
        if(kk.length > 0){//console.log("true")
                         out.result='Already-EX'
                         res.status(200).send(out)}
        else  res.status(200).send(out)
})

app.post('/register', async function(req, res){
   let userdata=req.body   
 //  console.log(userdata)
   let kk= await DBconnector.customqueries("SELECT * FROM USERS WHERE userName='"+userdata.userName+"'")   
   let out={token:'',
      username:userdata.userName,
      projectname:userdata.projectname,
      MSG:'not'
     } 
  //console.log(kk.length)  
    if(kk.length ==0){
     kk= await DBconnector.customqueries("INSERT INTO USERS (userName, password , country , district , projectname,email "+
                                          ",phonenumber ,security_qusetion ,user_LEVEL ,sitelist)VALUES('"+ 
                                           userdata.userName+"','"+userdata.password +"','"+userdata.country+
                                          "','"+userdata.district+"','"+userdata.projectname+"','"+userdata.email+
                                          "','"+userdata.phonenumber+"','"+ userdata.security_qusetion+"','"+userdata.user_LEVEL +"','{"+userdata.sitelist+"}')")       
        out.MSG='registerd'
        out.token=jwt.sign(userdata,'LKJTS')  
        console.log(out)
        let useid = await DBconnector.customqueries("SELECT userid FROM USERS WHERE userName='"+userdata.userName+"'");
 
        kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
        +useid[0].userid+",'"+new Date().toLocaleString()+"','newUserregisterd',1,'"+userdata.username+"')") ;}     
   res.status(200).send({out})
})

app.post('/login',async function (req, res) {
   let userdata=req.body   
   console.log(req.body ); 
   let out={token:'',
            username:userdata.userName,
            projectname:userdata.projectname,
            MSG:'fail'
            } 
 let kk= await DBconnector.customqueries("SELECT * FROM USERS WHERE userName='"+userdata.userName+"'")  

   if(kk.length>0){
      out.MSG='passwordError'
      if(userdata.password== kk[0].password){
         out.token=jwt.sign(kk[0],'LKJTS')  
         out.MSG='OK'
         console.log(userdata.password); 
 
         kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
         +kk[0].userid+",'"+new Date().toLocaleString()+"','UserLoging',2,'"+kk[0].username+"')") ;   
      } 
   }
 res.status(200).send({out});
})

app.post('/userlogout',async function (req, res) {
   console.log("LOGOUT");
   let userdata=jwt.verify(req.body.value,'LKJTS');
   console.log(userdata.userid);
         kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
         +userdata.userid+",'"+new Date().toLocaleString()+"','UserLogout',3,'"+userdata.username+"')") ;

 res.status(200).send({res:'ok'});
})

// This responds a GET request for the /list_user page.





////////////////////////////////////////////////////user functions/////////////////////////////////////////////////////////////

////////////////////////////////////////////////////navigator functions/////////////////////////////////////////////////////////////
app.post('/getnavigatordata', async function(req, res){
   let userdata=jwt.verify(req.body.value,'LKJTS');//console.log(userdata);
   var out;
  if(userdata.user_level=="ADMIN"){out=await DBconnector.customqueries("SELECT * FROM siteinfor");}   
  if(userdata.user_level=="CONTM"){out=await DBconnector.customqueries("SELECT * FROM siteinfor where country='"+userdata.country+"'");}
  if(userdata.user_level=="DISTM"){out=await DBconnector.customqueries("SELECT * FROM siteinfor where country='"+userdata.country+"' AND district='"+userdata.district+"'");}
  if(userdata.user_level=="TOWRM"){out=await DBconnector.customqueries("SELECT * FROM siteinfor where siteID="+userdata.sitelist);}  
  //console.log(out)
  // out={contrylist:["sri Lanka","India","china"],piechart:{good:50,ok:3,fault:1}};//testing values
   res.status(200).send(out);
})



app.post('/getsitesummery', async function(req, res){
 //  console.log(req.body);
  const point= await DBconnector.customqueries("SELECT deviceID,devicename,telemntrylastpoint,serverattributes,devicestate FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'")
 // console.log(point[0].telemntrylastpoint); 
 const jj= await DBconnector.customqueries("SELECT devicetelementry["+point[0].telemntrylastpoint[0]+"] FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'")  
 const length =  await DBconnector.customqueries("SELECT array_length(devicetelementry, 1) FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'")  
 var out=[]
out[0]=jj[0].devicetelementry; 
 out[1]=point[0];
 out[2]=length[0]
 //console.log(out); 
      res.status(200).send(out)

})


app.post('/getDeviceDataArray', async function(req, res){
  // console.log(req.body);
   //datatype: 'Telementry', serialnumber: 'Hutch-PEY',startpoint: 0,stoppoint: 20
  // devicetelementry  deviceattributes serverattributes
  let userdata=jwt.verify(req.body.hashkye,'LKJTS');
  if(userdata.user_level==null) {res.status(203).send({reply:"unauthorised user"});return;} 


 // console.log(point[0].telemntrylastpoint); 
 var lastpoint=DBconnector.telementrymax-1;var checkvalue=0;
if(req.body.datatype=='deviceattributes'){checkvalue=1;lastpoint=Attrybutemax}
if(req.body.datatype=='serverattributes'){checkvalue=2;lastpoint=serverAttrybutemax;}

const point= await DBconnector.customqueries("SELECT telemntrylastpoint FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'")

var startpoint=req.body.startpoint+point[0].telemntrylastpoint[checkvalue];
if((stoppoint-startpoint)>lastpoint)stoppoint=startpoint+lastpoint;
if(startpoint>lastpoint){startpoint-=lastpoint+1}
var flag=false;
var stoppoint=req.body.numberOfElements+startpoint;
var jj,stoppoit1=0;
if(stoppoint>=lastpoint){stoppoit1=stoppoint-lastpoint ;stoppoint=lastpoint; flag=true;}
var filter =req.body.datatype+"["+startpoint+":"+stoppoint+"]";
jj= await DBconnector.customqueries("SELECT "+filter+" FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'")  
//console.log(filter);
if(flag){
   filter =req.body.datatype+"["+0+":"+stoppoit1+"]";console.log(filter);
   jj.concat(await DBconnector.customqueries("SELECT "+filter+"  FROM DEVICES WHERE serialnumber='"+req.body.serialnumber+"'") )
}//console.log(jj[0].devicetelementry)
 res.status(200).send(jj[0].devicetelementry)
})   
////////////////////////////////////////////////////navigator functions/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Administrator functions/////////////////////////////////////////////////////////////

app.post('/ADMINtowers', async function(req, res){
   console.log(req.body);
   let userdata=jwt.verify(req.body.hashkye,'LKJTS');
   //console.log(userdata);
   if(userdata.user_level!='ADMIN') {res.status(203).send({reply:"unauthorised user"});return;}  
   kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
   +userdata.userid+",'"+new Date().toLocaleString()+"','"+req.body.Opera+"-Tower',4,'"+req.body.details.siteid+"')") ;
  
if(req.body.Opera=="Add"){ await DBconnector.customqueries( "INSERT INTO siteinfor(siteID,sitename,location,GPScoordinates,pnumber,district,country,AuthorisationID,type,serialnumber)VALUES("+
          req.body.details.siteid+",'"+ req.body.details.sitename+"','"+ req.body.details.location +"','"+req.body.details.gpscoordinates+"','"+ req.body.details.pnumber+"','"
                               + req.body.details.district+"','"+ req.body.details.country+"',"+ req.body.details.authorisationid+","+ req.body.details.type+",'"
                               + req.body.details.serialnumber +"')")}
if(req.body.Opera=="update"){await DBconnector.customqueries("update  siteinfor set sitename='"+req.body.details.sitename+"',location='"+ req.body.details.location +
                              "',GPScoordinates='"+req.body.details.gpscoordinates+"',pnumber='"+ req.body.details.pnumber+"',district='"+ req.body.details.district+"',country='"+ req.body.details.country+
                              "',AuthorisationID="+ req.body.details.authorisationid+",type="+ req.body.details.type+",serialnumber='"+ req.body.details.serialnumber +"'where siteID="+req.body.details.siteid)}

if(req.body.Opera=="delete"){await DBconnector.customqueries("DELETE FROM siteinfor WHERE siteID="+req.body.details.siteid)}
console.log(req.body.details.gpscoordinates);
//const jj= await DBconnector.customqueries("SELECT *  FROM siteinfor WHERE serialnumber='"+req.body.details.serialnumber+"'")

//console.log(jj)
      res.status(200).send({out:"OK"});

}) 

app.post('/getAllUserData', async function(req, res){
   //console.log(req.body);
   let userdata=jwt.verify(req.body.value,'LKJTS');
  // console.log(userdata);
   if(userdata.user_level!='ADMIN') {res.status(203).send({reply:"unauthorised user"});return;}
   const kk= await DBconnector.customqueries("SELECT userID,userName,country,district,projectname,email,phonenumber,user_LEVEL,sitelist FROM USERS") 
  // console.log(kk)
   res.status(200).send(kk);
}) 


app.post('/ADMINUsers', async function(req, res){
   console.log(req.body);
   let userdata=jwt.verify(req.body.hashkye,'LKJTS');
  // console.log(userdata);
   if(userdata.user_level!='ADMIN') {res.status(203).send({reply:"unauthorised user"});return;}

   kk= await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
   +userdata.userid+",'"+new Date().toLocaleString()+"','"+req.body.Opera+"-user',5,"+req.body.details.userid+")") ;
   
   const Defaultpassword='123456'; 
if(req.body.Opera=="Add"){  
   await DBconnector.customqueries( "INSERT INTO USERS(userID,userName,password,country,district,projectname,email,phonenumber,user_LEVEL,sitelist)VALUES("+
          req.body.details.userid+",'"+ req.body.details. username+"','"+Defaultpassword+"','"+ req.body.details.country +"','"+req.body.details.district+"','"+ req.body.details.projectname+"','"
                               + req.body.details.email+"','"+ req.body.details.phonenumber+"','"+ req.body.details.user_level+"','{"+ req.body.details.sitelist+"}')")}

 if(req.body.Opera=="update"){await DBconnector.customqueries("update  USERS set userName='"+req.body.details. username+"',country='"+ req.body.details.country+
                              "',district='"+req.body.details.district+"',projectname='"+ req.body.details.projectname+"',email='"+ req.body.details.email+
                              "',phonenumber='"+ req.body.details.phonenumber+"',user_LEVEL='"+ req.body.details.user_level+"',sitelist='{"+
                               req.body.details.sitelist+"}'where userID="+req.body.details.userid)}

 if(req.body.Opera=="delete"&& req.body.details.userid!=1){ await DBconnector.customqueries("DELETE FROM USERS WHERE userID="+req.body.details.userid)}
 if(req.body.Opera=="reset"){await DBconnector.customqueries("update  USERS set password='"+Defaultpassword+"' WHERE userID="+req.body.details.userid)}

//const jj= await DBconnector.customqueries("SELECT *  FROM USERS WHERE userID="+req.body.details.userid)
//console.log(jj)
      res.status(200).send({out:"OK"});

}) 


app.post('/ADMINGETuserActivitys', async function(req, res){
   console.log(req.body);
   let userdata=jwt.verify(req.body.hashkye,'LKJTS');
   if(userdata.user_level!='ADMIN') {res.status(203).send({reply:"unauthorised user"});return;}
 

const jj= await DBconnector.customqueries("SELECT * FROM userActivity where timestamp<'"+req.body.end+"'AND timestamp>='"+req.body.start+"' AND userID="+req.body.userid)
console.log(jj)
      res.status(200).send({jj});

}) 

app.post('/Userpassword', async function(req, res){
   console.log(req.body);
   var out={result:"INVALIED"}
   let userdata=jwt.verify(req.body.hashkye,'LKJTS');
   const resttt= await DBconnector.customqueries("SELECT * FROM USERS WHERE userid="+userdata.userid);  
   console.log(resttt[0].username);


  if(resttt[0].username==userdata.username && resttt[0].password==req.body.currentpassword){
   if(req.body.sequrityquestion!=null&&req.body. sequrityAnswer!=null)
   {await DBconnector.customqueries("update  USERS set security_qusetion='"+req.body.sequrityquestion+"',security_Answer='"+req.body. sequrityAnswer+"'where userID="+userdata.userid); }
   if(req.body.newpassword!=null){await DBconnector.customqueries("update  USERS set password='"+req.body.newpassword+"'where userID="+userdata.userid);}   

   await DBconnector.customqueries("INSERT INTO userActivity (userID ,timestamp ,activityname ,ACTID ,details)VALUES("
                                        +userdata.userid+",'"+new Date().toLocaleString()+"','Change password',7,'"+userdata.username+"')") ;
                                        out={result:"SUCCESSFUL"}
  }

  const bk= await DBconnector.customqueries("SELECT * FROM USERS WHERE userid="+userdata.userid);  console.log(bk)
     
  res.status(200).send(out);

}) 



app.post('/Passwordquestion', async function(req, res){
   console.log(req.body);
   const bk= await DBconnector.customqueries("SELECT security_qusetion FROM USERS WHERE userName='"+req.body.name+"' AND email='"+req.body.email+"'");  
   console.log(bk[0])     
  res.status(200).send(bk[0]);

}) 

app.post('/sendmail', async function(req, res){
   console.log(req.body);
   out={reply:"OK"}
   const bk= await DBconnector.customqueries("SELECT security_Answer FROM USERS WHERE userName='"+req.body.name+"' AND email='"+req.body.email+"'");  
   console.log(bk[0])   
if(bk[0].security_answer==req.body.answer){}
else{out.reply="invalied"}
  res.status(200).send(out);

}) 

////////////////////////////////////////////////////Administrator functions/////////////////////////////////////////////////////////////

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port   
   console.log("Example app listening at http://%s:%s", host, port)
})