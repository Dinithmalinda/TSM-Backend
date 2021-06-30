  const port = 1883
  const aedes = require('aedes')()
  const server = require('net').createServer(aedes.handle)
  const DBconnector = require('./databaseconnector.js')

  server.listen(port, function () {
    console.log('Aedes listening on port:', port)
    aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
  })

  aedes.on('subscribe', function (subscriptions, client) {   
   // console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
    //        '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
 })
  aedes.on('unsubscribe', function (subscriptions, client) {    
  //  console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
  //         '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
  })
  /////////////////////////////////////////////////////////////// when a client connects/////////////////////////////////////////////////////////////////
  aedes.on('client',async function (client) {
    //console.log(client.id)
    const kk= await DBconnector.customqueries("SELECT * FROM DEVICES WHERE serialnumber='"+client.id+"'")    
   // console.table(kk)  
    if(kk.length > 0){console.log("true")
          await DBconnector.customqueries("update DEVICES set devicestate=true WHERE serialnumber ='"+client.id+"'")
      }
    else {console.log("false")
          await DBconnector.customqueries("INSERT INTO DEVICES(serialnumber,telemntrylastpoint[0],devicestate)VALUES('"+client.id+"',0,TRUE)")
      }
})
 ////////////////////////////////////////// // client disconnects////////////////////////////////////////////////////////////////////////
  aedes.on('clientDisconnect',async function (client) {
    //console.log(client.id)
    const kk= await DBconnector.customqueries("SELECT * FROM DEVICES WHERE serialnumber='"+client.id+"'")    
   // console.table(kk)  
    if(kk.length() > 0){//console.log("true")
          await DBconnector.customqueries("update DEVICES set devicestate=false WHERE serialnumber ='"+client.id+"'")
      }
  })
  ////////////////////////////////////////////// when a message is published/////////////////////////////////////////////////////////////
  aedes.on('publish', async function (packet, client) {  
  //for(i=0;i<2880;i++){}
    try{
  //  console.log(client.id)
  // console.log(packet.payload)
    const kk= await DBconnector.customqueries("SELECT telemntrylastpoint[0] FROM DEVICES WHERE serialnumber='"+client.id+"'")  
    //console.log(kk)   
    var point=kk[0]['telemntrylastpoint']
   // console.log(point)   
    point--
    if(point<0) point=DBconnector.telementrymax

 await DBconnector.customqueries("update DEVICES set devicename='"+packet.topic+"', devicetelementry[" + point + "] = '{"+
                                                                   packet.payload+"} TIMESTAMP"+new Date().toLocaleString()+"' ,telemntrylastpoint[0] =" + point + " WHERE serialnumber ='"+client.id+"'")

    const jj= await DBconnector.customqueries("SELECT  devicetelementry[" + point + "]   FROM DEVICES WHERE serialnumber='"+client.id+"'")    
    console.table(jj)  
  }
  catch(ex){}

  })

////////////////////////////////////////////// when a message is published/////////////////////////////////////////////////////////////

function updateMQttclientsubscribe(Topic,databuffer){
  aedes.publish({ cmd: 'publish',qos: 0,topic: Topic,payload: new Buffer(databuffer),retain: false});
}module.exports.updateMQttclientsubscribe=updateMQttclientsubscribe;

