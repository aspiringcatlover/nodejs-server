const express = require('express');
const { getNASFileList } = require('./services/video-service');
const app = express()
const port = 3001
const videoService = require('./services/video-service');


app.get('/', (req, res) => {
  res.send('NodeJS backend for Smart-CCTV dashboard');
})

//get device info
app.get('/device-info', (req,res) =>{
  let device_id = req.query.device_id;
  
  let result = videoService.getCCTVDeviceInfo(device_id);
  res.send(result);
})

//get NAS file list
app.get('/nas-info',(req,res) =>{
  let device_id = req.query.device_id;
  
  let result = getNASFileList({"device_id": device_id, "date": ""});
  res.send(result);
})

//get static video path
app.get('/video-metadata',(req,res) =>{
  let device_id = req.query.device_id;
  let file_id = req.query.file_id;
  
  let result = getNASFile({"device_id": device_id, "file_id": file_id});
  res.send(result);
})

//delete video metadata
app.delete('/video-metadata',(req,res) =>{
  let file_name = req.query.file_name;
 
  let result = deleteNASFile(file_name);
  res.send(result);
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
