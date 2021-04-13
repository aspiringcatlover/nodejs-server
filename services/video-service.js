const axios = require('axios').default;
const { exit } = require('process');

class VideoService {
    /* get RSTP streaming for live feed */
    getRTSPLink(params) {
        let cctvIP = "";
        
        return this.getCCTVDeviceInfo(params["device_id"])
            .then(function (results) {
                cctvIP = results.data[0]["IPAddr"];
                if (cctvIP == null) return null;

                return "rtsp://" + cctvIP + "/LiveMedia/ch1/Media1";
            }).catch(function (error) {
                console.log("Retrieving cctv IP from device-ID failed: " + error);
            });
    }

    /* get mp4 file in NAS if requested file_id exist */
    getNASFile(params) {
        let path = '';
        let p = { "device_id": params["device_id"], "file_id": params["file_id"] }

        return Promise
            .all([this.getCCTVmetadata(params["device_id"]), this.getCCTVDeviceInfo(p.device_id)])
            .then(function (results) {
                const nas = results[0];
                const ip = results[1];

                p["ip"] = ip.data[0]["IPAddr"];

                nas.data.forEach(obj => {
                    Object.entries(obj).forEach(([key, value]) => {
                        if (key == "file_id" && value == p.file_id) {
                            p["naspath"] = obj["file_full_name"];
                            // path = "./NAS/overcrowding/" + p.ip + "/" + p.naspath;
                            path = p.naspath;
                            // path = "./NAS/incidents/overcrowding/" + "172.16.3.198" + "/" + p.naspath;
                        }
                    });
                });
                return path;
            });
    }

    /* get LIST of mp4 files in NAS */
    getNASFileList(params) {
        let dic = { "device_id": params["device_id"], "list": [{ "file_id": "", "file_name": "", "incidence_type": "", "ts_occurrence": params["date"] }] }

        return this.getCCTVmetadata(params["device_id"])
            .then(function (results) {
                //TODO normal || incident
                results.data.forEach(obj => {
                    let sublist = {};
                    Object.entries(obj).forEach(([key, value]) => {

                        (key == "file_id" && value != null) ? sublist["file_id"] = value : exit;
                        (key == "file_full_name" && value != null) ? sublist["file_name"] = value : "";
                        (key == "mode" && value != null) ? sublist["incidence_type"] = value : ""; //TODO: suggestion - normal || incident_crowding

                    });
                    if (Object.keys(sublist).length > 0) dic.list.push(sublist)
                });

                return JSON.stringify(dic);
            });
    }

    updateNASFile(params) {

    }

    deleteNASFile(file_full_name) {
        return this.getCCTVDeviceIDBySystemID()
            .then(devices => {
                var device_id = '';
                devices.data[0].forEach(obj => {
                    if (obj.device_id == "device_id") {
                        device_id = obj.device_id;
                    }
                });
                return this.getCCTVmetadata(device_id);
            })
            .then(metadata => {
                var _file_id = '';
                metadata.data.forEach(obj => {
                    if(obj.file_full_name == file_full_name){
                        _file_id = obj.file_id;
                    }
                });
                return this.deleteCCTVmetadata(_file_id);
            })
            .catch(err => console.log(err));
    }

    /* CCTV Device Info */
    getCCTVDeviceIDBySystemID(system_id) {
        //LOL.. sorry this function name is meh
        return axios.get('http://192.168.4.2:3000/api/general/v1/device?system_id=CCTV_SYS'); //there is only one system_id for CCTV system
    }
    getCCTVDeviceIds(device_id) {
        return axios.get('http://192.168.4.2:3000/api/general/v1/device?device_id=' + device_id);
    }

    /* CCTV Device Info */
    getCCTVDeviceInfo(device_id) {
        return axios.get("http://192.168.4.2:3000/api/general/v1/device/info?device_id=" + device_id);
    }

    updateCCTVDeviceInfo(device_id, ipaddress) {
        return axios.post('http://192.168.4.2:3000/api/general/v1/device/info', {
            "device_id": device_id,
            "device_info_name": "Cctv_lookup1",
            "device_info_value": ipaddress
        });
    }

    /* CCTV Metadata */
    getCCTVmetadata(device_id) {
        return axios.get('http://192.168.4.2:3001/api/vertical/v1/cctv/device-metadata?device_id=' + device_id);
    }

    updateCCTVmetadata(incidentType, fileName) {
        var d = new Date();
        d.toLocaleDateString('en-SG', {
            timeZone: "Asia/Singapore",
            hour12: false
        });
        var n = d.toISOString();

        return axios.post('http://192.168.4.2:3001/api/vertical/v1/cctv/device-metadata', {
            "device_id": "Cctvcam1",
            "file_full_name": fileName,
            "file_size": 0,
            "start_time": n,
            "end_time": n,
            "duration": 0,
            "last_play_time": n,
            "mode": incidentType,
            "status": "active",
            "creation_by": "system",
            "creation_date": n,
            "modification_by": "system",
            "modification_date": n
        });
    }

    deleteCCTVmetadata(file_id) {
        return axios.post('http://192.168.4.2:3001/api/vertical/v1/cctv/device-metadata/delete', {
            "file_id": file_id,
        });
    }
}

//function to store information regarding a videoclip
function VideoClipInfo() {
    this.file_id = "",
        this.device_id = "",//"device_id",
        this.file_full_name = "",
        this.clipId = "",
        this.eventtype = "", //["live", null], //["incidents","crowding"]
        this.dateOfCreation = 0, //50,
        this.videoduration = 0, //60,
        this.videoSize = 0, //455
        this.videoClipDir = ""
};

//New video file info function according to new db schema requirements
function FileInfo() {
    this.file_id = 1,
        this.device_id = "CctvCam1",
        this.file_full_name = "NAS:\\videoclips\\clip1.mp4",
        this.file_size = 123,
        this.start_time = "2020-02-16T00:00:00.000Z",
        this.end_time = "2020-02-16T00:00:00.000Z",
        this.duration = 123,
        this.last_play_time = "2020-02-16T00:00:00.000Z",
        this.mode = "abc",
        this.status = "active",
        this.creation_date = "2021-02-26T16:07:23.560Z",
        this.creation_by = "system",
        this.modification_date = "2021-02-26T16:07:23.560Z",
        this.modification_by = "system"
};


//function to store information regarding a stream session
function VideoClipRTSPStreamInfo() {
    this.device_id = "",
        this.clip_id = "",
        this.rtspurl = ""
}
//new VideoClipStreamInfo according to new db schema requirements and streaming protocol
function VideoClipStreamInfo() {
    this.device_id = "",
        this.clip_id = "",
        this.streamUrl = "", //HLS link here?
        this.streamUrlType = "HLS" // indicate rtsp/HLS/rtmp??
}

var videoService = new VideoService();
module.exports = videoService;