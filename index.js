const express = require('express');
const app = express()
const port = 3001
const videoService = require('./services/video-service');
const cors = require('cors');
app.use(cors());


app.get('/', (req, res) => {
  res.send('NodeJS backend for Smart-CCTV dashboard');
})

//get device info
app.get('/device-info', async(req,res) =>{
  let device_id = req.query.device_id;
  
  let result = await videoService.getCCTVDeviceInfo(device_id);
  res.send(result);
})

//get NAS file list
app.get('/nas-info',async (req,res) =>{
  console.log('get /nas-info');
  let device_id = req.query.device_id;

  let result = await videoService.getNASFileList({"device_id": device_id});
  res.send(result);
})

//get static video path
app.get('/video-metadata',(req,res) =>{
  console.log('get /video-metadata');
  let device_id = req.query.device_id;
  let file_id = req.query.file_id;
  
  let result = videoService.getNASFile({"device_id": device_id, "file_id": file_id});
  res.send(result);
})

//delete video metadata
app.delete('/video-metadata',(req,res) =>{
  console.log('delete /video-metadata');
  let file_name = req.query.file_name;
 
  let result = videoService.deleteNASFile(file_name);
  res.send(result);
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
