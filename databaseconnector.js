const Pool = require('pg').Pool

const DBclient=new Pool({ 
    host:"localhost",
    user:"postgres",
    password:"Aspirine",    
    port:5432,
    database:"NODEJS", 
});

DBclient.connect()
//droptables()  
//createtables()
//DBtest() 

  //addUser("ADMIN","admin","All","ALL","ALL","ADMIN@n-able.biz","119","password-admin","ADMIN",0)

 // addtowersite("DIL-222","YAK",'{"lat":12,"lng":80 }',"0331212121","Dilhi","India",123,1,"Hutch-DIL","FAULT") 
 // adddevice("Hutch-DIL","Test1",'[{"Temp":28,"Humid":80,"Flood":"not","Smoke":"not","Motion":"not","Door":"not","PowerSupply":"Main","Volt":230,"Watt":1203,"Generator":"Stop","FuelLevel":106,"Bat":12.8,"BatteryBackup":52.1}]',"testing-attributes","server-attributes",0,'TRUE')

  //addtowersite("COL-222","YAK",'{"lat":7,"lng":80 }',"0331212121","Colombo","Sri Lanka",123,1,"Hutch-COL","GOOD")
  // adddevice("Hutch-COL","Test1",'[{"Temp":16,"Humid":100,"Flood":"not","Smoke":"not","Motion":"not","Door":"not","PowerSupply":"GEN","Volt":230,"Watt":1003,"Generator":"ON","FuelLevel":1006,"Bat":13.8,"BatteryBackup":48.1}]',"testing-attributes","server-attributes",0,'TRUE')

  //  addtowersite("PEY-222","YAK",'{"lat":16,"lng":120 }',"0331212121","Peyching","China",123,1,"Hutch-PEY","OK")
  //  adddevice("Hutch-PEY","Test1",'[{"Temp":58,"Humid":10,"Flood":"DET","Smoke":"DET","Motion":"DET","Door":"DET","PowerSupply":"Main","Volt":230,"Watt":914,"Generator":"Stop","FuelLevel":206,"Bat":11.8,"BatteryBackup":42.1}]',"testing-attributes","server-attributes",0,'TRUE')

async function DBtest() {    
    const jj= await DBclient.query("select * from users")
    console.table(jj.rows)
 }module.exports.DBtest=DBtest;
 
async function createtables(){
try{
await DBclient.query("CREATE TABLE USERS (userID SERIAL PRIMARY KEY ,userName VARCHAR(60),password VARCHAR(20),country VARCHAR(20), district VARCHAR(20),projectname VARCHAR(30),"+
                                          "email VARCHAR(50),phonenumber VARCHAR(20),security_qusetion VARCHAR(50),security_Answer VARCHAR(50),user_LEVEL VARCHAR(15),sitelist integer[])")
                                               
await DBclient.query("CREATE TABLE userActivity (activityID SERIAL PRIMARY KEY,userID integer,timestamp TIMESTAMPTZ,activityname VARCHAR(20),ACTID integer,details VARCHAR(20))")

await DBclient.query("CREATE TABLE DEVICES(deviceID SERIAL PRIMARY KEY,serialnumber VARCHAR(20),devicename VARCHAR(20)"+
                                                ",devicetelementry TEXT[], deviceattributes TEXT[],serverattributes TEXT[],telemntrylastpoint integer[],devicestate bool)")

await DBclient.query("CREATE TABLE siteinfor (siteID SERIAL PRIMARY KEY,sitename VARCHAR(20),location VARCHAR(30),GPScoordinates VARCHAR(30),pnumber VARCHAR(20),"+
                                                      "district VARCHAR(20),country VARCHAR(20),AuthorisationID integer,type integer,serialnumber VARCHAR(20),sitecondition VARCHAR(5))")




var results = await DBclient.query("select * from USERS")
console.table(results.rows)
results = await DBclient.query("select * from userActivity")
console.table(results.rows) 
results = await DBclient.query("select * from DEVICES")
console.table(results.rows)
results = await DBclient.query("select * from siteinfor")
console.table(results.rows)
}
catch (ex){console.log(ex)}
finally {DBclient.end()}
console.log("created")
} 

async function droptables(){
try{
 
    await DBclient.query("DROP TABLE IF EXISTS USERS")
    await DBclient.query("DROP TABLE IF EXISTS userActivity")
    await DBclient.query("DROP TABLE IF EXISTS DEVICES")
    await DBclient.query("DROP TABLE IF EXISTS siteinfor")
}
catch (ex){console.log(ex)}
finally {DBclient.end()}
console.log("clear")
 }


////////////////////////////////////////////////////////////user functions////////////////////////////////////////////////////////////////////////////////////////
function getuserdatabyid(id,filter){
    var returnval
    DBclient.connect()
    .then (()=>DBclient.query("select "+filter+" from USERS where userID="+id))
    .then (results=>console.table(results.rows))
    .then (returnval=results.rows)
    .catch(e=>console.log(e))    
    .finally (()=>DBclient.end())
    return returnval
}module.exports.getuserdatabyid=getuserdatabyid;

function getuserdatabyname(name,filter){
    var returnval
    DBclient.connect()
    .then (()=>DBclient.query("select "+filter+" from USERS where userID="+name))
    .then (returnval=results.rows)
    .catch(e=>console.log(e))
    .finally (()=>DBclient.end())
    return returnval
}module.exports.getuserdatabyname=getuserdatabyname;

function addUser(userName,password,country,district,projectname,email,phonenumber,security_qusetion,user_LEVEL,sitelist){
    DBclient.connect()
    .then (()=>DBclient.query("INSERT INTO USERS(userName,password,country,district,projectname,email,phonenumber,security_qusetion,user_LEVEL,sitelist[0])VALUES('"+ 
                                                 userName+"','"+password +"','"+country+"','"+district+"','"+projectname+"','"+email+"','"+phonenumber+"','"+security_qusetion+
                                                 "','"+user_LEVEL+"',"+sitelist+")"))
                                                
    .catch(e=>console.log(e))
    .finally (()=>DBclient.end())
}module.exports.addUser=addUser;

function updateuserinfo(userName,parameter,data){
    DBclient.connect()
    .then (()=>DBclient.query("update users set parameter="+data+"WHERE userName ="+userName))
    .finally (()=>DBclient.end())
} module.exports.updateuserinfo=updateuserinfo;

////////////////////////////////////////////////////////////user functions////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////Devices functions/////////////////////////////////////////////////////////////////////////////////////
async function customqueries(input){
    try{ const jj=await DBclient.query(input) 
         return jj.rows;           
        }
        catch(ex){console.log(ex)
                   return null}  
}module.exports.customqueries=customqueries;

 function addtowersite(sitename,location,GPScoordinates,pnumber,district,country,AuthorisationID,type,serialnumber ,sitecondition){
    DBclient.connect()
    .then (()=>DBclient.query("INSERT INTO siteinfor(sitename,location,GPScoordinates,pnumber,district,country,AuthorisationID,type,serialnumber,sitecondition)VALUES('"+
    sitename+"','"+location +"','"+GPScoordinates+"','"+pnumber+"','"+district+"','"+country+"',"+AuthorisationID+","+type+",'"+serialnumber +"','"+sitecondition+"')"))
                                                
    .catch(e=>console.log(e))
    .finally (()=>DBclient.end())
}module.exports.addtowersite=addtowersite;

function adddevice(serialnumber,devicename,devicetelementry,deviceattributes,serverattributes,telemntrylastpoint,devicestate){
    DBclient.connect()
    .then (()=>DBclient.query("INSERT INTO DEVICES(serialnumber,devicename,devicetelementry[0],deviceattributes[0],serverattributes[0],telemntrylastpoint[0],devicestate)VALUES('"+
                                            serialnumber+"','"+devicename+"','"+devicetelementry+"','"+deviceattributes+"','"+serverattributes+"',"+telemntrylastpoint+","+devicestate+")"))
                                         
                                                
    .catch(e=>console.log(e))
    .finally (()=>DBclient.end())
}module.exports.adddevice=adddevice;
////////////////////////////////////////////////////////////Devices functions///////////////////////////////////////////////////////////////////////////////////////
var telementrymax=259200;exports.telementrymax = telementrymax;
var Attrybutemax=120;exports.Attrybutemax= Attrybutemax;
var serverAttrybutemax=120;exports.serverAttrybutemax= serverAttrybutemax;