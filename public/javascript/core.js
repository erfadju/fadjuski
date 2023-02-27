let configVisible = false;

let hbCache = [];
let click = {
    x: 0,
    y: 0
};
sfield = "count";
sortDesc = false;
let mId = 0;
let modeNick = "Anonymous";
let realNick = "";
let modeTbl = [];


function refreshWH() {
    setWH();
    setTimeout(() => { refreshWH() }, 2000);
}


function getStylesAndParams() {
    $.get(`/getparams?channel=${channel}&page=${page}`, function (data) {
        //console.log(data);
        try {
            params = JSON.parse(data.rows[0].params);
            //console.log(params);

            if (params.contareaselect != undefined) {
                $("#contAreaSelect").val(params.contareaselect);
            }

            if (params.shadowradio != undefined) {
                $(`input[name="shadowRadio"][value=${params.shadowradio}]`).prop('checked', true);
            }     
            
            if (params.volume != undefined) {
                x.volume = params.volume/100;
                $("#volumeLabel").html(params.volume);
                $( "#volumeSlider" ).slider( "value", params.volume);
            }

            if (params.visibility != undefined) {
                for (let i = 0; i < params.visibility.length; i++) {
                    if (params.visibility[i].visible) {
                        if (pageType == "control") {
                            $("#ec" + params.visibility[i].eid).find(".showIconRed").hide();
                            $("#ec" + params.visibility[i].eid).find(".showIconGreen").show();
                            $(".vcb" + params.visibility[i].eid).prop("checked",true);
                        }
                        else {
                            $("#ec" + params.visibility[i].eid).show();
                        }
                    }
                    else {
                        if (pageType == "control") {
                            $("#ec" + params.visibility[i].eid).find(".showIconRed").show();
                            $("#ec" + params.visibility[i].eid).find(".showIconGreen").hide();
                            $(".vcb" + params.visibility[i].eid).prop("checked",false);
                        }
                        else {
                            $("#ec" + params.visibility[i].eid).hide();
                        }                        
                    }
                }
            }

            if (params.editlocked != undefined) {
                setLockEdit(params.editlocked, params.modewholocked);
            }


        }
        catch (e) {
            console.log(e.message);
        }
        getStylesAndParamsLocal();
    })

}


function getIndex(arr, elem, x) {
    // x = x.toLowerCase();
    let start=0, end=arr.length-1;
    while (start<=end){
        let mid=Math.floor((start + end)/2);
        let cv = arr[mid][elem];
        if (cv===x) return {found:true,pos:mid};
        else if (cv < x)
            start = mid + 1;
        else
            end = mid - 1;
    }
    let newpos = 0;
    if ((end > -1) && (x > arr[end][elem])) newpos = end + 1
    else newpos = end;
    if (newpos < 0) newpos = 0;
    return {found:false,newpos:newpos};
}

function getTableIndex(arr, elem, x) {
    let ind = -1;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][elem] ==x) {
            ind = i;
            break;
        }
    }
    return ind;
}


function indByField(tbl,field,value) {
    let res = -1;
    for (let i=0; i < tbl.length; i++) {
        if (tbl[i][field] == value) {
            res = i;
            break;
        }
    }
    return res;
}

function formatDateEf2(d,dtf) {
    //console.log("core formatDateEf2xx, d:" + d + " dtf:'" + dtf + "'");
    //console.log(JSON.stringify(dtf));
    let monTbl = ["Jan","Feb","Mar","Apr","May", "Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var year    = d.getFullYear();
    var month   = d.getMonth()+1;
    var day     = d.getDate();
    var hour    = d.getHours();
    var minute  = d.getMinutes();
    var second  = d.getSeconds();
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }
    if ((dtf==undefined) || (dtf=="")) {
        var dateTime = day + '.' + month + '.' + year + ' ' + hour + ':' + minute + ':' + second;
    }
    else if (dtf=="d.m.yy") {
        var dateTime = day + '.' + month + '.' + year;
    }
    else if (dtf=="d.m.yy hh.mm") {
        var dateTime = day + '.' + month + '.' + year + ' ' + hour + '.' + minute;
    }
    else if (dtf=="d.m. hh.mm") {
        //console.log(hour);
        var dateTime = day + '.' + month + '. ' + hour + '.' + minute;
    }
    else if (dtf=="hh.mm") {
        var dateTime = hour + '.' + minute ;
    }
    else if (dtf=="d mon yyyy") {
        var dateTime = day + ' ' + monTbl[month-1] + ' ' + year;
    }
    else if (dtf=="d mon yyyy hh:mm") {
        var dateTime = day + ' ' + monTbl[month-1] + ' ' + year + ' ' + hour + ':' + minute;;
    }
    else if (dtf=="d mon") {
        var dateTime = day + ' ' + monTbl[month-1];
    }
    else if (dtf=="d mon hh:mm") {
        var dateTime = day + ' ' + monTbl[month-1] + ' ' + hour + ':' + minute;
    }
    return dateTime;
}

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 function refreshPage() {
    console.log("Reload send");
    //sendWsRemote("reloadpage", {});
    sendWsRemoteWeid(weSelected,"reloadpage", {});
 }

 function showInfobox(viesti,tyyli) {
    $("#infoBox").html(viesti);
    $("#infoBox").show();
    setTimeout(() => {$("#infoBox").hide();}, 4000);
}

 function confirm(message, callback,cancelcb) {
    $('body').append('<div id="confirmDialog" style="display:none">'+message+'</div>'); // dont forget to hide this!
    $( "#confirmDialog" ).dialog({
        autoOpen: false,
        resizable: false,
        height:350,
        width: 350,
        title: "Confirm",
        modal: true,
        buttons: [
            {
                text: "YES",
                "class": "d_ok",
                click: function() {
                    $(this).dialog("close");
                    if ($.isFunction(callback)) {
                        callback.apply();
                    }
                    $('#confirmDialog').remove();
                }
            },{
                text: "NO",
                "class": "d_cancel",
                click: function() {
                    $(this).dialog("close");
                    if ($.isFunction(cancelcb)) {
                        cancelcb.apply();
                    }
                    else
                    {
                        return false;
                    }
                    $('#confirmDialog').remove();
                }
            }
        ],
        close: function(event, ui) {
            $('#confirmDialog').remove();
        }
    });
    $('.ui-dialog-buttonset').css('float','none');
    $('.ui-dialog-buttonset>button:last-child').css('float','right');
    $( "#confirmDialog" ).dialog( "open" );
}

function renderAS(tmpl_name, tmpl_data, cb) {
    //console.log('hbCache.length:' + hbCache.length);
    if ( ! hbCache[tmpl_name] ) {
        //console.log('Template uusi');
        var tmpl_dir = '/template';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.hbs?ts=aaa';

        $.get(tmpl_url, function(data) {
            let tmpl_string = data;
            hbCache[tmpl_name] = Handlebars.compile(tmpl_string);
            if (cb) cb(hbCache[tmpl_name](tmpl_data));
        });
    }
    else {
        //console.log('Template vanha');
        if (cb) cb(hbCache[tmpl_name](tmpl_data));
    }
}

function renderASS(tmpl_string, tmpl_data, cb) {
    //console.log('hbCache.length:' + hbCache.length);
        let tpl = Handlebars.compile(tmpl_string);
        if (cb) cb(tpl(tmpl_data));
}


function getStyleValue(elem,key) {
    //console.log(styleObj);
    //console.log("getStyleValue");
    let rv = "";
    for (i=0; i<styleObj.length; i++) {
        //console.log(`Elem: ${elem} ${styleObj[i].element}`);
        if (styleObj[i].element == elem) {
            for (j=0; j<styleObj[i].styles.length; j++) {
                //console.log(`${key} ${styleObj[i].styles[j].key}`);
                if (styleObj[i].styles[j].key == key) {
                    rv = styleObj[i].styles[j].value;
                    break;
                }
            }
        }
    }
    return rv;
}

function applyStyles() {
    //console.log("applyStyles");
    //console.log(styleObj);
    for (let i=0; i < styleObj.length; i++) {
        for (let j=0; j < styleObj[i].styles.length; j++) {
            $(styleObj[i].element).css(styleObj[i].styles[j].key,styleObj[i].styles[j].value);
            if (styleObj[i].styles[j].controls != undefined) {
                for (let k=0; k < styleObj[i].styles[j].controls.length; k++) {
                    if (styleObj[i].styles[j].controls[k].type == "slider") {
                        try {
                            $(styleObj[i].styles[j].controls[k].element).slider( "value", styleObj[i].styles[j].value.slice(0,-2));
                        }
                            catch(e) {
                        }
                    }
                    else if (styleObj[i].styles[j].controls[k].type == "select") {
                        $(styleObj[i].styles[j].controls[k].element).val(styleObj[i].styles[j].controls[k].value);
                    }                            
                    else if (styleObj[i].styles[j].controls[k].type == "label") {
                        $(styleObj[i].styles[j].controls[k].element).html(styleObj[i].styles[j].value);
                    }                            
                    else if (styleObj[i].styles[j].controls[k].type == "text") {
                        $(styleObj[i].styles[j].controls[k].element).val(styleObj[i].styles[j].value);
                    }    
                    else if (styleObj[i].styles[j].controls[k].type == "color") {
                        try {
                            console.log(styleObj[i].element);
                            console.log(styleObj[i].styles[j].value);
                            console.log(styleObj[i].styles[j].controls[k].element);
                            $(styleObj[i].styles[j].controls[k].element).spectrum("set", styleObj[i].styles[j].value);
                        }
                        catch(e) {
                            console.log(e.message);
                        }
                    }                          
                }
            }
        }
    }
}

function redrawStyles() {
    renderAS("stylerows", {stylerows:styleObj}, function(hbData) {
        $("#styleRows").html(hbData);
    })
}

function updateStyle(elem, key, value, dopost) {
    //console.log("updateStyle");
    //console.log(styleObj);
    //console.log(`${elem} ${key} ${value} `);
    //console.log(value);
    //console.log(value);
    let efound = false;
    let kfound = false;
    for (i=0; i<styleObj.length; i++) {
        if (styleObj[i].element == elem) {
            //console.log("elem found");
            efound = true;
            for (j=0; j<styleObj[i].styles.length; j++) {
                if (styleObj[i].styles[j].key == key) {
                    styleObj[i].styles[j].value = value;
                    kfound = true;
                    break;
                }
            }
            if (!kfound) {
                styleObj[i].styles.push({key:key,value:value});
            }
            break;
        }
    }
    if (!efound) {
        styleObj.push({element:elem, styles:[{key:key,value:value}]});
    }

    let lInd = indByField(sceneTbl,"scid",scId);
    sceneTbl[lInd].style = JSON.stringify(styleObj);

    if (dopost) {
        ss = JSON.stringify(styleObj);
        ss = ss.replace(/[\']/g, "''");
        //console.log(scId);
        $.post("/updatestyle",{scid:scId,style:ss}, function(data) {
            //console.log(data);
        });
        /* $.post("/updatestyle",{channel:channel,page:page,style:ss}, function(data) {
            console.log(data);
        }); */
    }
}

function updateParam(key,value) {
    params[key] = value;
    let sParams = JSON.parse(JSON.stringify(params));
    for (const p in sParams) {
        if (typeof sParams[p] === 'string' || sParams[p] instanceof String) {
            sParams[p] = sParams[p].replace(/[\"]/g, '\\\"');
            sParams[p] = sParams[p].replace(/[\']/g, "\\\'");
        }
        //console.log(sParams[p]);
    }; 
    let pData = {
        channel: channel,
        page: page,
        params: JSON.stringify(sParams)
    }
    //console.log(sParams);
    //console.log(pData.params);
    $.post("/updateparams", pData, function(data) {
       //console.log(data);
    });
}

function updateWeParamOne(weid, key,value, pType) {
    let pInd = indByField(params, "weid", weid);
    if (pInd > -1) {
        params[pInd][key] = value;
        if (pType == "string") {
            value = "'" + value + "'";
            console.log(value);
        }
        let pData = {
            weid: weid,
            key: key,
            value: value
        }
        $.post("/updateweparamone", pData, function(data) {
            //console.log(data);
        });
    }
}

function updateWeParam(weid, key,value) {
    let pInd = indByField(params, "weid", weid);
    if (pInd > -1) {
        params[pInd][key] = value;
        let sParams = JSON.parse(JSON.stringify(params[pInd]));
        for (const p in sParams) {
            //console.log(sParams[p]);
            if (typeof sParams[p] === 'string' || sParams[p] instanceof String) {
                sParams[p] = sParams[p].replace(/[\"]/g, '\\\"');
                sParams[p] = sParams[p].replace(/[\']/g, "\\\'");
                sParams[p] = sParams[p].replace(/[\n]/g, "\\n");
            }
            //console.log(sParams[p]);
        }; 
        if (sParams.presets != undefined) {
            for (let i = 0; i < sParams.presets.length; i++) {
                //console.log(sParams.presets[i].list);
                sParams.presets[i].list = sParams.presets[i].list.replace(/[\"]/g, '\\\"');
                sParams.presets[i].list = sParams.presets[i].list.replace(/[\']/g, "\\\'");  
                //console.log(sParams.presets[i].list);          
            }
        }         
        let pData = {
            weid: weid,
            params: JSON.stringify(sParams)
        }
        //console.log(sParams);
        //console.log(pData.params);
        $.post("/updateweparams", pData, function(data) {
            //console.log(data);
        });
    }
}

function updateWgParam(wgid, key,value) {
    let pInd = indByField(gparams, "wgid", wgid);
    if (pInd > -1) {
        gparams[pInd][key] = value;
        let sParams = JSON.parse(JSON.stringify(gparams[pInd]));
        for (const p in sParams) {
            //console.log(sParams[p]);
            if (typeof sParams[p] === 'string' || sParams[p] instanceof String) {
                sParams[p] = sParams[p].replace(/[\"]/g, '\\\"');
                sParams[p] = sParams[p].replace(/[\']/g, "\\\'");
                sParams[p] = sParams[p].replace(/[\n]/g, "\\n");
            }
            //console.log(sParams[p]);
        }; 
        if (sParams.presets != undefined) {
            for (let i = 0; i < sParams.presets.length; i++) {
                console.log(sParams.presets[i].list);
                sParams.presets[i].list = sParams.presets[i].list.replace(/[\"]/g, '\\\"');
                sParams.presets[i].list = sParams.presets[i].list.replace(/[\']/g, "\\\'");  
                console.log(sParams.presets[i].list);          
            }
        }         
        let pData = {
            wgid: wgid,
            params: JSON.stringify(sParams)
        }
        //console.log(sParams);
        //console.log(pData.params);
        $.post("/updatewgparams", pData, function(data) {
            console.log(data);
        });
    }
}

function updateVisibilityParam(weid, seid, value,post) {
    let pInd = indByField(params, "weid", weid);
    if (pInd > -1) {
        if (params[pInd].visibility == undefined) {
            params[pInd].visibility = [];
        }
        let tInd = indByField(params[pInd].visibility,"seid",seid);
        if (tInd == -1) {
            let vr = {
                seid:seid,
                visible: value
            }
            params[pInd].visibility.push(vr);
        }
        else {
            params[pInd].visibility[tInd].visible = value;
        }
        let sParams = JSON.parse(JSON.stringify(params[pInd]));
        for (const p in sParams) {
            if (typeof sParams[p] === 'string' || sParams[p] instanceof String) {
                sParams[p] = sParams[p].replace(/[\"]/g, '\\\"');
                sParams[p] = sParams[p].replace(/[\']/g, "\\\'");
            }
            //console.log(sParams[p]);
        };
        let pData = {
            weid: weid,
            params: JSON.stringify(sParams)
        }
        //console.log(sParams);
        //console.log(pData.params);
        if (post) {
            $.post("/updateweparams", pData, function(data) {
            // console.log(data);
            });
        }
    }
}

function upfileClick() {
    // $("#oriFileSpan").html('<img src="/img/spinner3.gif" style="height:40px;">');  // Ongelmana havaita, jos painaa cancel
    $('#upfile').click();
}

function fileSizeColor(fs) {
    console.log(fs);
    $(".oriFileSize").removeClass("fsGreen");
    $(".oriFileSize").removeClass("fsOrange");
    $(".oriFileSize").removeClass("fsRed");
    if (fs < 1) {
        $(".oriFileSize").addClass("fsGreen");
    }
    else if (fs < 5) {
        $(".oriFileSize").addClass("fsOrange");
    }
    else {
        $(".oriFileSize").addClass("fsRed");
    }

}

function osort(a,b) {
    if (typeof a[sfield] === 'string' && a[sfield] != null) {
        var eka = a[sfield].toLowerCase();
    }
    else {
        var eka = a[sfield];
    }
    if (typeof b[sfield] === 'string' && b[sfield] != null) {
        var toka = b[sfield].toLowerCase();
    }
    else {
        var toka = b[sfield];
    }
    if (sortDesc) {
        var vaihto = eka;
        eka = toka;
        toka=vaihto;
    }
    if (eka == toka) {return 0}
    else if (eka > toka) {return 1}
    else {return -1};

}

function secondsToTime(s) {
    let rHours = Math.floor(s/60/60);
    let rMinutes = Math.floor((s - rHours*3600)/60);
    let rSeconds = Math.floor(s - rHours*3600 - rMinutes*60);
    let hours = rHours.toString();
    if (rHours < 10) hours = "0" + hours;
    let mins = rMinutes.toString();
    if (rMinutes < 10) mins = "0" + mins;
    let secs = rSeconds.toString();
    if (rSeconds < 10) secs = "0" + secs;
    return hours + ":" + mins + ":" + secs;
}

function timeToSeconds(ts) {
    let st = ts.split(":");
    //console.log(st);
    let sec = 0;
    if (st.length==3) {
        sec += Number(st[0])*3600;
        sec += Number(st[1])*60;
        sec += Number(st[2]);
    }
    else {
        sec += Number(st[0])*60;
        sec += Number(st[1]);
    }
    return sec;
}

function secondsToTwitchTime(s) {
    let rHours = Math.floor(s/60/60);
    let rMinutes = Math.floor((s - rHours*3600)/60);
    let rSeconds = Math.floor(s - rHours*3600 - rMinutes*60);
    let hours = rHours.toString();
    let mins = rMinutes.toString();
    let secs = rSeconds.toString();
    return hours + "h" + mins + "m" + secs + "s";
}

function ytTimeToSeconds(s) {
    s = s.slice(2);
    let n = "";
    let sec = 0;
    let ntbl = ["0","1","2","3","4","5","6","7","8","9"];
    for (let i=0; i<s.length; i++) {
        if (ntbl.indexOf(s[i]) > -1) {
            n += s[i];
        }
        else {
            if (s[i] == "H") {sec += Number(n)*3600;}
            if (s[i] == "M") {sec += Number(n)*60;}
            if (s[i] == "S") {sec += Number(n);}
            n = "";
        }
    }
    return sec;
}

function twitchTimeToSeconds(s) {
    let n = "";
    let sec = 0;
    let ntbl = ["0","1","2","3","4","5","6","7","8","9"];
    for (let i=0; i<s.length; i++) {
        if (ntbl.indexOf(s[i]) > -1) {
            n += s[i];
        }
        else {
            if (s[i] == "h") {sec += Number(n)*3600;}
            if (s[i] == "m") {sec += Number(n)*60;}
            if (s[i] == "s") {sec += Number(n);}
            n = "";
        }
    }
    return sec;
}

function getTwitchAuth() {
    $.get("/gettwitchauthrequest",function(data) {
        let scope = "";
        for (let i=0; i < data.scope.length; i++) {
            scope += data.scope[i] + "+"
        }
        scope = scope.slice(0,-1);
        window.open(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${data.client_id}&redirect_uri=https://${hostName}/gettwitchauth&scope=${scope}&state=${data.state}`);
    })
}

function sendRefreshRequest() {
    let msgt = "Läheteään striimin widgetille refresh-pyyntö, jos se on esim. mennyt jumiin, niin ettei reagoi muutoksiin. Ei refreshaa välittömästi, mutta 10 s sisällä kuitenkin.<br><strong>Laitetaanko refresh?</strong>";
    confirm(msgt, function() {
        $.get(`/sendrefreshrequest?channel=${channel}&page=${page}`, function(data) {
            console.log(data);
        });
    });

}

function toggleConfig() {
    if ($("#configBlock").css("display") === "block") {
        $("#configBlock").hide();
        localStorage["configvisible_" + page] = "false";
    }
    else {
        $("#configBlock").show();
        localStorage["configvisible_" + page] = "true";
    }
}

function configClose() {
    $("#configBlock").hide();
    localStorage["configvisible_" + page] = "false";
}

function ytLocalPlayerOpen() {
    $("#ytLocalPlayerBlock").show();
}

function ytLocalPlayerClose() {
    $("#ytLocalPlayerBlock").hide();
    player.pauseVideo();
}

function ytSearchClose() {
    $("#ytSearchPanel").hide();
}

function aliveClick() {
    if ($("#aliveCb").prop("checked")) {
        console.log("Hereillä");
        noSleep.enable(); // keep the screen on!
    }
    else {
        console.log("Ei Hereillä");
        noSleep.disable(); // let the screen turn off.
    }
}



function setWH() {
    $("#cHeight").html($("#contentBlock").css("height"));
    $("#cWidth").html($("#contentBlock").css("width"));
}

function copyToCb(s,clean) {
    if (clean) {
        s = s.replace(/&amp;/g, "&");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&lt;/g, "<");
    }
    navigator.clipboard.writeText(s);
}


function showTimerAlert(aData) {
    if (alertVisible) {
        timerAlertQueue.push(aData);
        if (!timerAlertActive) { 
            timerAlertActive = true;
            DrawTimerAlert();
        }
    }
}

function DrawTimerAlert() {
    if (timerAlertQueue.length > 0) {
        if (timerAlertQueue[0].seconds < 60) {
            if (timerAlertQueue[0].seconds == 1) {
                timerAlertQueue[0].time = "1 sekunnin"
            }
            else {
                timerAlertQueue[0].time = timerAlertQueue[0].seconds + " sekuntia";
            }
        }
        else {
            if (timerAlertQueue[0].minutes == 1) {
                timerAlertQueue[0].time = "minuutin"
            }
            else {
                timerAlertQueue[0].time = timerAlertQueue[0].minutes + " minuuttia";
            }
        }
        let r = "luikautti";
        if ((params.randomlist != undefined) && (params.randomlist.length > 0)) {
            let ri = Math.floor(Math.random()*params.randomlist.length);
            console.log("Random" + params.randomlist.length + " " + ri + " " + params.randomlist[ri])
            r = params.randomlist[ri];
        }
        timerAlertQueue[0].randomverb = r;
        console.log(params.contitem1text);
        renderASS(params.contitem1text,timerAlertQueue[0], function(hbData) {
            $("#contentItem1").html(hbData);
            $("#contentItem1").show();
            setTimeout(() => {
                $("#contentItem1").hide();
                timerAlertQueue.shift();
                setTimeout(() => {
                    DrawTimerAlert()
                }, 3000)
            }, 9000)
            blinkCount = 0;
            blinkAlert($("#contentItem1"));
        });
    }
    else {
        timerAlertActive = false;
    }
}

function blinkAlert(elem) {
    blinkCount++;
    if (blinkCount % 2 === 0) {
        elem.show();
    }
    else {
        elem.hide();
    }
    if (blinkCount < 10) {
        setTimeout(() => {
            blinkAlert(elem);
        }, 100)
    }
    else {
        elem.show();
    }
}

function speakDlgOpen() {
    $(`#speakDlg`).dialog(`open`);
}

function speakText() {
    console.log("speakText");
    sendWsRemote("speak", {text:$("#textAndSpeakEdit").val()});
}

function logout() {
    localStorage.removeItem("modeid_" + channel);
    window.location.reload();
}

function askModeid() {
    $.get("/getmoderators?channel=" + channel, function(data) {
        renderAS("modidDlg", {modes:data.rows}, function(hbData) {
            $("#modeidPanel").html(hbData);
            $("#modeidPanel").show();
        });
    })
}

function modeIdSave() {
    if ((mId == -1) && ($("#newModeIdEdit").val() != "")) {
        $.get(`/newmode?channel=${channel}&version=0&nick=${$("#newModeIdEdit").val()}`, function(data) {
            console.log(data);
            mId = data.rows[1][0].newmodeid;
            localStorage["modeid_" + channel] = mId;
            $("#modeidPanel").hide();
            //sendWsRemote("updatemodlist",{});
            askModeVerification();
            updateModData();
        })
    } 
    else if (mId > 0) {
        localStorage["modeid_" + channel] = mId;
        $("#modeidPanel").hide();
        askModeVerification();
        updateModData();
    }
    else {
        alert("valitse joku");
    }
}

function modeIdCancel() {
    $("#modeidPanel").hide();
}

function setModeId(mid) {
    console.log(mid);
    mId = mid;
}

function askModeVerification() {
    if (channel == "fadju_e") {
        $.get("/getmoderators?channel=" + channel, function(data) {
            modeTbl = data.rows;
            let ind = indByField(modeTbl,'mid',mId);
            $("#ownNick").html(modeTbl[ind].nick);
            modeNick = modeTbl[ind].nick;
            realNick = modeTbl[ind].realnick;
            let vn = Math.floor(Math.random()*900000) + 100000;
            renderAS("modVerificationDlg", {realnick:realNick, verifycode:vn, channel:channel}, function(hbData) {
                $("#modeidPanel").html(hbData);
                $("#modeidPanel").show();
                sendVerificationRequest(realNick, vn);
            });

        })
    }
}

function verificationDone() {
    console.log("Verification done");
    $("#modeidPanel").hide();
}

function updateModData() {
    $.get("/getmoderators?channel=" + channel, function(data) {
        modeTbl = data.rows;
        let ind = indByField(modeTbl,'mid',mId);
        $("#ownNick").html(modeTbl[ind].nick);
        modeNick = modeTbl[ind].nick;
        realNick = modeTbl[ind].realnick;
    })
}

function showInfoDlg(tpl,data) {
    renderAS(tpl,data,function(hbData) {
        $("#infoDlg").html(hbData);
        $("#infoDlg").dialog("open");
    })
}

function showHelp(helpid) {
    $("#simpleDlg").html(`<img src="/pics/youtube-player ohje2.png" style="width:100%" alt="Youtube-player -ohje"/>`);
    if ($(window).width() < 500) $("#simpleDlg").dialog("option", "width", $(window).width())
    else $("#simpleDlg").dialog("option", "width", "1280");
    $("#simpleDlg").dialog("option", "title", "Youtube-player -ohje");
    $( "#simpleDlg" ).dialog( "option", "position", { my: "center top", at: "center top", of: "body" } );

    $("#simpleDlg").dialog("open");
}

function showLinkInfo() {
    let rData = {};
    let cUrl = window.location.href;
    let sUrl = cUrl.replace("/olc","/ol");
    rData.obsUrl = sUrl + "&device=obs";
    rData.seUrl = sUrl + "&device=SEmobile";
    rData.slUrl = sUrl + "&device=SLmobile";
    rData.scid = $("#sceneSelect").val();
    rData.scenename =$("#sceneSelect option:selected" ).text();
    rData.width = $("#contentBlock").css("width").slice(0,-2);
    rData.height = $("#contentBlock").css("height").slice(0,-2);
    if ((Number(rData.width) > 1719) || (Number(rData.height) > 966)) {
        rData.slmax = true;
        rData.slwidth = 1719;
        rData.slheight = 966;
    }
    else {
        rData.slmax = false;
        rData.slwidth = rData.width;
        rData.slheight = rData.height;
    }
    rData.secode = `<div class="main-container">  
    <iframe src="${rData.seUrl}&scid=${rData.scid}&c=xxxx" width="${rData.width}" height="${rData.height}" title="FadjuStream" style="border:none;"></iframe>
</div>`;
    renderAS("linkinfo",rData,function(hbData) {
        $("#infoDlg").html(hbData);
        $("#infoDlg").css("padding","10px");
        $("#infoDlg").dialog("open");
        $("#infoDlg").scrollTop(0);

    })
}
