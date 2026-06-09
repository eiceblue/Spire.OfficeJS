/**
 * Copyright (c) E-ICEBLUE 2024. All rights reserved
 *
 * https://cloud.e-iceblue.cn
 *
 * Version:11.5.7
 */

;(function(SpireCloudEditor, window, document){
    SpireCloudEditor.OpenApi = function (targetId, configs){
        var _configs = configs || {}, isChinese = (GetLanguage() == 'zh'), _that = this;
        copy(_configs, SpireCloudEditor.OpenApi.DefaultConfig);
        /////////////////////////////////////
        ////// Check User Attrs Start ///////
        /////////////////////////////////////
        if (!_configs.user) {
            alert(isChinese ? '"user"对象不能为空！' : 'Object \'user\' can not Empty！');
            return null;
        } else {
            var _private = _configs.user.customization.private = {
                token_url: null,//null, //'https://hostname//connect/token',
                verify_url: null,//null, //'https://hostname//connect/VerifyToken',
                socket_url: null,//'https://hostname/beta/connect',
                base_url: null, //'https://hostname/preview',
                appid: null,
                appkey: null,
                token: null
            };
            if (_private.token_url && _private.verify_url &&
                _private.token_url.indexOf('http') !== -1 &&
                _private.verify_url.indexOf('http') !== -1) {
                if (!_private.token){
                    if (!_private.appid || !_private.appkey) {
                        alert(isChinese ? '"appid"和"appkey"不能为空！' : '\'appid\' and \'appkey\' can not Empty！');
                        return null;
                    }
                }
            }
        }
        /////////////////////////////////////
        ////// Check File Attrs Start ///////
        /////////////////////////////////////
        if (!_configs.fileAttrs) {
            alert(isChinese ? '"fileAttrs"对象不能为空！' : 'Object \'fileAttrs\' can not Empty！');
            return null;
        }
        var fileAttrs = _configs.fileAttrs;
        // @brook serverless
        if (!fileAttrs.sourceUrl) {
            alert(isChinese ? '"sourceUrl"不能为空！' : '\'sourceUrl\' can not Empty！');
            return null;
        }
        var fileInfo = _configs.fileAttrs.fileInfo;
        if (!fileInfo) {
            _configs.fileAttrs.fileInfo = new Object();
            _configs.fileAttrs.fileInfo.creator = 'Me';
            _configs.fileAttrs.fileInfo.createTime = new Date();
            fileInfo = _configs.fileAttrs.fileInfo;
        }
        if (!fileInfo.name) _configs.fileAttrs.fileInfo.name = GetFileName(fileAttrs.sourceUrl);
        if (!fileInfo.ext) _configs.fileAttrs.fileInfo.ext = GetFileExt(_configs.fileAttrs.fileInfo.name);
        if (!fileInfo.primary) _configs.fileAttrs.fileInfo.primary = GetPrimary(64);

        /////////////////////////////////////
        ////// Check editorAttrs Start //////
        /////////////////////////////////////
        var editorAttrs = _configs.editorAttrs;
        if (!editorAttrs) {
            alert(isChinese ? '"editorAttrs"对象不能为空！' : 'Object \'editorAttrs\' can not Empty！');
            return null;
        }
        editorAttrs.platform = _configs.editorAttrs.platform || 'desktop';
        editorAttrs.editorMode = editorAttrs.editorMode ? editorAttrs.editorMode: (editorAttrs.isReadOnly === "true"? "view":"edit");
        editorAttrs.viewLanguage = _configs.editorAttrs.viewLanguage || GetLanguage();
        /////////////////////////////////////
        ////// Check File event Start ///////
        /////////////////////////////////////
        if (!editorAttrs.events) {
            editorAttrs.events = {};
        }
        editorAttrs.editorType = _configs.editorAttrs.editorType || GetEditorType(fileAttrs.sourceUrl);
        _configs.editorAttrs = editorAttrs;

        /////////////////////////////////////
        //////// Check Custom Start /////////
        /////////////////////////////////////
        var sendCommand = function (cmd, callback) {
            if (callback && typeof callback === 'function') {
                var event = cmd.event || GetPrimary();
                if (!cmd.data) cmd.data = {};
                cmd.data.event = event;
                _configs.editorAttrs.events[event] = function (data) {
                    callback(JSON.stringify({data: {'callFn': cmd.cmd, data: data.data }}));
                    if (!cmd.event) {
                        delete _configs.editorAttrs.events[event];
                    }
                }
            }
            if (editorFrame && editorFrame.contentWindow)
                overPostMessage(editorFrame.contentWindow, cmd);
        };

        _configs.editorAttrs.targetId = targetId;

        /* @brook serialization data */
        if(_configs.editorAttrs.serverless && _configs.editorAttrs.serverless.useServerless && _configs.editorAttrs.serverless.fileData) {
            _configs.editorAttrs.serverless.fileData = SpireCloudEditor.Serialize_Serverless_FileData(_configs.editorAttrs.serverless.fileData);
        }

        var resultApi = {};
        var customizationHandler = new CustomizationHandler(_configs, sendCommand);
        _configs = customizationHandler.initConfig(isChinese);
        var oApi = {
            options : _configs,
            asyncCommand: customizationHandler.sendCommand,
            syncCommand: customizationHandler.sync,
            notifyBuilder: customizationHandler.notifyBuilder,
            getBool : function(val){
                if (this.isEmpty(val)) return false;
                return (true === val || 'true' === val) ? true : false;
            }, isEmpty : function(val){
                return (val === null || val === undefined);
            }, isFunction : function(val){
                if (this.isEmpty(val)) return false;
                return (typeof val === 'function');
            }, isArray : function(val){
                if (this.isEmpty(val)) return false;
                return Object.prototype.toString.call(val) === '[object Array]';
            }, isString : function(val){
                if (this.isEmpty(val)) return false;
                return (typeof val === 'string');
            }, isObject : function(val){
                if (this.isEmpty(val)) return false;
                return Object.prototype.toString.call(val) === '[object Object]';
            }
        };

        resultApi.GetOpenApi = function() {
            return oApi;
        };

        var targetElement = document.getElementById(targetId);
        var editorFrame = GeneratFrame(_configs);
        if (!targetElement.parentNode) {
            alert('This target node must has parent node');
            return ;
        }
        targetElement.parentNode.replaceChild(editorFrame, targetElement);

        function overPostMessage(wid, msg) {
            if (wid && wid.postMessage) {
                wid.postMessage(JSON.stringify(msg), "*");
            }
        }
        var onMouseUp = function (evt) {
            //processMouse(evt);
        };
        var processMouse = function (evt) {
            var r = editorFrame.getBoundingClientRect();
            var data = {
                type: evt.type,
                x: evt.x - r.left,
                y: evt.y - r.top,
                event: evt
            };

            sendCommand({
                cmd: 'spire_ProcessMouse',
                data: data
            });
        };
        var bindMouseEvents = function () {
            if (window.addEventListener) {
                window.addEventListener("mouseup", onMouseUp, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmouseup", onMouseUp);
            }
        };

        var removeMouseEvents = function () {
            if (window.removeEventListener) {
                window.removeEventListener("mouseup", onMouseUp, false)
            } else if (window.detachEvent) {
                window.detachEvent("onmouseup", onMouseUp);
            }
        };

        var onEditorStart = function () {
            if (_configs.editorAttrs.platform === 'mobile') {
                document.body.onfocus = function (e) {
                    setTimeout(function () {
                        editorFrame.contentWindow.focus();
                        sendCommand({
                            cmd: 'spire_ResetFocus',
                            data: {}
                        })
                    }, 10);
                };
            }

            bindMouseEvents();

            initEditor(_configs);

            loadDocument();
        };

        var initEditor = function (props) {
            // @brook fileOpen 处理config中的function
            var funcArray = [];
            var cloneProps = SpireCloudEditor.strizedConfigsFunc(props, funcArray);
            cloneProps["funcArray"] = funcArray;
            sendCommand({
                cmd: 'spire_Init',
                data: { props: cloneProps }
            });
        };

        var loadDocument = function () {
            sendCommand({
                cmd: 'spire_LoadDocument'
            });
        };

        var loadNewDocument = function (options) {
            sendCommand({
                cmd: 'spire_OpenNewDocument',
                data: {
                    options: options
                }
            });
        };

        var msmq = function (msg) {
            if (msg) {
                if (msg.type === "onExternalPluginMessage") {
                    sendCommand(msg);
                } else if (msg.frameEditorId == targetId) {
                    var events = _configs.editorAttrs.events || {},
                        handler = events[msg.event];

                    if (msg.event === 'onRequestEditRights' && !handler) {
                        applyEditRights(false, 'handler isn\'t defined');
                    } else if (msg.event === 'onInternalMessage' && msg.data && msg.data.type == 'localstorage') {
                        callLocalStorage(msg.data.data);
                    } else {
                        if (msg.event === 'onStart') onEditorStart();
                        handler && handler.call(_that, { target: _that, data: msg.data });
                    }
                }
            }
        };

        var applyEditRights = function (allowed, message) {
            sendCommand({
                cmd: 'spire_ApplyEditRights',
                data: {
                    allowed: allowed,
                    message: message
                }
            });
        };

        var callLocalStorage = function (data) {
            if (data.cmd == 'get') {
                if (data.keys && data.keys.length) {
                    var af = data.keys.split(','), re = af[0];
                    for (i = 0; ++i < af.length;)
                        re += '|' + af[i];

                    re = new RegExp(re); k = {};
                    for (i in localStorage)
                        if (re.test(i)) k[i] = localStorage[i];
                } else {
                    k = localStorage;
                }

                sendCommand({
                    cmd: 'spire_InternalCommand',
                    data: { type: 'localstorage', keys: k }
                });
            } else if (data.cmd == 'set') {
                for (var i in data.keys) localStorage.setItem(i, data.keys[i]);
            }
        };

        var msgHandler = new MessageHandler(this, msmq);

        var cacheFonts = function (data) {
            sendCommand({
                command: 'cacheFonts',
                data: data
            });
        };

        var destroyEditor = function (cmd) {
            var target = document.createElement("div");
            target.setAttribute('id', targetId);

            if (editorFrame) {
                msgHandler && msgHandler.unbindEvents();
                removeMouseEvents();
                editorFrame.parentNode.replaceChild(target, editorFrame);
            }
        };

        var reload = function () {
            if (editorFrame && editorFrame.contentWindow)
                window.open(editorFrame.src, editorFrame.name);
        };

        var showMessage = function (title, msg) {
            msg = msg || title;
            sendCommand({
                cmd: 'spire_ShowMessage',
                data: {
                    msg: msg
                }
            });
        };

        var refreshHistory = function (data, message) {
            sendCommand({
                cmd: 'spire_RefreshHistory',
                data: {
                    data: data,
                    message: message
                }
            });
        };

        var setHistoryData = function (data, message) {
            sendCommand({
                cmd: 'spire_SetHistoryData',
                data: {
                    data: data,
                    message: message
                }
            });
        };

        var serviceCommand = function (command, data) {
            sendCommand({
                cmd: 'spire_InternalCommand',
                data: {
                    command: command,
                    data: data
                }
            });
        };

        var intercept = function () {
            sendCommand({
                cmd: 'spire_OnIntercept'
            });
        };

        var downloadAs = function (data, callback) {
            sendCommand({
                cmd: 'spire_DownloadAs',
                data: data
            }, callback);
        };

        var onSaveClick = function () {
            sendCommand({
                cmd: 'spire_OnSaveClick'
            });
        };

        var appendText = function (data, callback) {
            if ('document' !== _configs.editorAttrs.editorType)
            {
                if (callback)
                {
                    callback(customizationHandler.textNotWord);
                }
                else
                {
                    alert(customizationHandler.textNotWord);
                }
                return;
            }
            if (!customizationHandler.notifyBuilder(_configs, 'spire_onAppendText', 'appendText')){
                _configs.editorAttrs.events['spire_onAppendText'] = function(data){
                    if (callback)
                    {
                        callback(data);
                    }
                };
            }
            sendCommand({
                cmd: 'appendText',
                data: typeof data === 'string' ? data : JSON.stringify(data)
            });
        };

        var appendTextSync = function (data) {
            return new Promise(function (resolved, rejected){
                if ('document' !== _configs.editorAttrs.editorType) {
                    rejected(customizationHandler.textNotWord);
                } else {
                    customizationHandler.sync({
                        cmd: 'appendText', event: 'spire_onAppendText', data: typeof data === 'string' ? data : JSON.stringify(data)
                    }).then(function(res){
                        resolved(res);
                    }).catch(function(err){
                        rejected(err);
                    });
                }
            });
        };

        var onExcuteCtlContent = function(args, callback){
            if ('document' !== _configs.editorAttrs.editorType) {
                alert("此接口仅对Word文档开放；This Fuction Is Open For Word Only!");
                return;
            }
            sendCommand({
                cmd: 'onExecuteControlContent',
                data: typeof args == 'string' ? JSON.parse(args) : args
            },callback);
        };

        var defaultApi = {
            showMessage: showMessage,
            applyEditRights: applyEditRights,
            refreshHistory: refreshHistory,
            setHistoryData: setHistoryData,
            downloadAs: downloadAs,
            serviceCommand: serviceCommand,
            bindMouseEvents: bindMouseEvents,
            removeMouseEvents: removeMouseEvents,
            destroyEditor: destroyEditor,
            onSaveClick:onSaveClick,
            reload:reload,
            loadNewDocument: loadNewDocument,
            appendText: appendText,
            appendTextSync: appendTextSync,
            onExcuteCtlContent: onExcuteCtlContent,
            intercept: intercept
        };

        if (_configs.user.customization.public.common.cacheFontOnly) {
            defaultApi.cacheFonts = cacheFonts;
        }
        for (var a in defaultApi) {
            resultApi[a] = defaultApi[a];
        }
        // @brook 兼容npm发布
        defaultApi = null;
        return resultApi;
    };

    SpireCloudEditor.OpenApi.DefaultConfig = {
        user: {
            primary: 'USER_1627043496819',
            name: 'e-iceblue',
            canSave: true,
            canSaveByShortcut: true,
            customization: {
                public: {
                    common: {
                        whiteLabel: false,
                        defaultZoom: 1,
                        openReviewChanges: false,
                        permGroups: ['everyone'],//限制编辑分组
                        viewVersion: false,
                        header: {
                            hideTitle: false,
                            defaultView: 'full'
                        }
                    },
                    word: null,//doc定制
                    powerpoint: null,//ppt定制
                    excel: null//xls定制
                }
            }
        },
        editorAttrs: {//编辑器配置
            editorWidth: '100%',
            editorHeight: '100%',
            editorType: '',//编辑器类型，可不配置，程序根据文件类型获取，结果为 document,presentation,spreadsheet
            platform: 'desktop',//编辑器平台类型，可选desktop， mobile， embedded
            viewLanguage: 'en',//平台界面展示语言可选en/zh
            canChat: true,//是否可聊天
            canComment: true,//是否可批注
            canReview: true,
            embedded: {
                saveUrl: '',
                embedUrl: '',
                shareUrl: ''
            },
            events: {}
        }
    };

    SpireCloudEditor.OpenApi.version = function () {
        return '11.5.7';
    };

    /* PrivateDeploy_js_start */
    SpireCloudEditor.CleanupServerCache = function(url, password, files, callback) {
        this.baseUrl = "../../..";
        if (url) this.baseUrl = url;
        else {
            var js = document.scripts;
            for(var i=0;i<js.length;i++){
                if(js[i].src.indexOf("SpireCloudEditor.js") > -1 ){
                    this.baseUrl = js[i].src.substring(0,js[i].src.lastIndexOf("/web"));
                    break;
                }
            }
        }
        this.basePath = this.baseUrl + "/CleanCache";
        if(!(files && Array.isArray(files) && files.length > 0)) files = null;
        var customizationHandler;
        if(_self){
            customizationHandler = _self;
        }else
            customizationHandler = new CustomizationHandler()
        var xhr = customizationHandler.createXHR();
        if(callback)
            xhr.onreadystatechange = callback;
        else
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    console.log('cleanCache result:' + JSON.stringify({responseText: xhr.responseText, responseStatus: xhr.status}));
                }
            };
        xhr.open("post",this.basePath + "?password=" + password, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(files));
    };
    /* PrivateDeploy_js_end */

    /* serialization_data_start */
    SpireCloudEditor.Serialize_Serverless_FileData = function(data) {
        var uint8 = new Uint8Array(data);
        return JSON.stringify(Array.from(uint8));
    }
    SpireCloudEditor.Deserializ_Serverless_FileData = function(data) {
        if(data instanceof Uint8Array) return data;
        return new Uint8Array(JSON.parse(data));
    }
    /* serialization_data_end */
    SpireCloudEditor.strizedConfigsFunc = function(props, funcArray, parentName) {
        if(!parentName) parentName = 'root';
        if(props instanceof Object)
        {
            var cloneObj = Object.create(Object.getPrototypeOf(props));
            for(var key in props)
            {
                var tempParentName = parentName;
                if(props[key] instanceof Function)
                {
                    // 将function string化
                    funcArray.push(tempParentName + ',' + key);
                    cloneObj[key] = props[key].toString();
                    // console.log(funcArray);
                }
                else if(props.hasOwnProperty(key))
                {
                    tempParentName += ',' + key;
                    var tempValue = SpireCloudEditor.strizedConfigsFunc(props[key], funcArray, tempParentName);
                    if(tempValue instanceof Date)
                        cloneObj[key] = props[key];
                    else
                        cloneObj[key] = tempValue
                }
            }
            return cloneObj;
        }
        return props;
    }
    SpireCloudEditor.structuredConfigsFunc = function(props, funcArray, parentName) {
        if(!parentName) parentName = 'root';
        if(props instanceof Object)
        {
            var cloneObj = Object.create(Object.getPrototypeOf(props));
            for(var key in props)
            {
                var tempParentName = parentName;
                var propName = tempParentName + ',' + key;
                if(funcArray.includes(propName))
                {
                    // 将string化d的function转化为function
                    cloneObj[key] = new Function('return ' + props[key])();
                }
                else if(props.hasOwnProperty(key))
                {
                    tempParentName += ',' + key;
                    cloneObj[key] = SpireCloudEditor.structuredConfigsFunc(props[key], funcArray, tempParentName);
                }
            }
            return cloneObj;
        }
        return props;
    }
    var MessageHandler = function (scope, fun) {
        var _scope = scope || window;

        var bindEvents = function () {
            if (window.addEventListener) {
                window.addEventListener("message", onMessage, false)
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", onMessage);
            }
        };

        var onMessage = function (msg) {
            if (msg && msg.data) {
                try {
                    var msg = msg.data instanceof Object ? msg.data : JSON.parse(msg.data);
                    if (fun) {
                        fun.call(_scope, msg);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };
        var unbindEvents = function () {
            if (window.removeEventListener) {
                window.removeEventListener("message", onMessage, false)
            } else if (window.detachEvent) {
                window.detachEvent("onmessage", onMessage);
            }
        };

        bindEvents.call(this);

        return {
            unbindEvents: unbindEvents
        }
    };

    function GenaratSrc(config) {
        var scripts = document.getElementsByTagName('script'),
            match;
        var baseUri;
        var useWebAssemblyDoc = config.editorAttrs.useWebAssemblyDoc,
            useWebAssemblyExcel = config.editorAttrs.useWebAssemblyExcel,
            useWebAssemblyPpt = config.editorAttrs.useWebAssemblyPpt,
            useServerless = config.editorAttrs.serverless && config.editorAttrs.serverless.useServerless;

        for (var i = scripts.length - 1; i >= 0; i--) {
            match = scripts[i].src.match(/(.*)spireapi\/SpireCloudEditor.js/i);
            if (match) {
                baseUri = match[1];
                break;
            }
        }
        // @brook serverless 替换iframe的baseurl
        if((useWebAssemblyDoc || useWebAssemblyExcel || useWebAssemblyPpt) && useServerless)
        {
            var tempUrl = new URL(baseUri);
            var serverlessBaseUrl = config.editorAttrs.serverless.baseUrl;
            if(serverlessBaseUrl) {
                if(serverlessBaseUrl.endsWith('/'))
                    serverlessBaseUrl = serverlessBaseUrl.substring(0, serverlessBaseUrl.length - 1);

                if(baseUri.indexOf(serverlessBaseUrl) == -1)
                    baseUri = baseUri.replace(tempUrl.origin, serverlessBaseUrl);
            }
        }

        if (baseUri) {
            var appMap = {
                    'document': 'spiredocument',
                    'pdf': 'spiredocument',
                    'spreadsheet': 'spirespreadsheet',
                    'presentation': 'spirepresentation'
                }, app;
            app = appMap[config.editorAttrs.editorType.toLowerCase()];
            var type = /^(?:(xls|xlsx|ods|csv|xlst|xlsy|gsheet)|(pps|ppsx|ppt|pptx|odp|pptt|ppty|gslides))$/.exec(config.fileAttrs.fileInfo.ext);
            if (type) {
                if (typeof type[1] === 'string') app = appMap['spreadsheet']; else
                if (typeof type[2] === 'string') app = appMap['presentation'];
            }

            baseUri += app + "/";
            baseUri += (config.editorAttrs.platform === "mobile" ? "mobile" : config.editorAttrs.platform === "embedded" ? "embed" : "desktop");
            baseUri += "/index.html";

            var url = baseUri;
            url += '?spire_cloud_version=';
            url += SpireCloudEditor.OpenApi.version();
            if (config.editorAttrs && config.editorAttrs.viewLanguage)
                url += "&lang=" + config.editorAttrs.viewLanguage;
            if (config.editorAttrs.targetId)
                url += "&frameEditorId=" + config.editorAttrs.targetId;
            if(config.user.name)
                url += "&userName=" + config.user.name;
            url += "&t=" + new Date().getTime();
            return url;
        }
        return "";
    }

    function GeneratFrame(config) {
        var iframe = document.createElement("iframe");
        iframe.src = GenaratSrc(config);
        iframe.width = config.editorAttrs.editorWidth;
        iframe.height = config.editorAttrs.editorHeight;
        iframe.name = "SpireCloudEditor";
        iframe.id = "SpireCloudEditor";
        iframe.allowFullscreen = true;
        iframe.allow = "clipboard-read; clipboard-write ";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("onmousewheel", "");

        var s = { insideIframe: false }

        iframe.addEventListener('mouseenter', function() {
            s.insideIframe = true;
            s.scrollX = window.scrollX;
            s.scrollY = window.scrollY;
        });

        iframe.addEventListener('mouseleave', function() {
            s.insideIframe = false;
        });

        document.addEventListener('scroll', function() {
            if (s.insideIframe)
                window.scrollTo(s.scrollX, s.scrollY);
        });

        return iframe;
    }

    function copy(dest, src) {
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                if (typeof dest[prop] === 'undefined') {
                    dest[prop] = src[prop];
                } else if (typeof dest[prop] === 'object' &&
                            typeof src[prop] === 'object') {
                    copy(dest[prop], src[prop])
                }
            }
        }
        return dest;
    }

    function GetFileName(url) {
        var fileName = url.substr(url.lastIndexOf('/') + 1,url.length);
        if(GetEditorType(fileName) == null){
            var customizationHandler = new CustomizationHandler();
            var xhr = customizationHandler.createXHR();
            xhr.open("get",url, false);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(null);
            let contentDisposition = xhr.getResponseHeader("Content-disposition");
            if (contentDisposition) {
                fileName = window.decodeURI(contentDisposition.split('=')[1], "UTF-8");
                if(fileName.indexOf(";") !== -1) {
                    fileName = fileName.substring(0, fileName.indexOf(";"));
                }
                if(fileName.charAt(0) == '"'){
                    fileName = fileName.substring(1, fileName.length);
                }
                if(fileName.charAt(fileName.length - 1) == '"'){
                    fileName = fileName.substring(0, fileName.length - 1);
                }
            }
        }
        return fileName;
    }

    function GetEditorType(url) {
        var documentUrl = unescape(url)
            ,ext = GetFileExt(documentUrl);
        ext = ext.toLowerCase();
        if (ExtsDocument[ext]) return "document";
        if (ExtsSpreadsheet[ext]) return "spreadsheet";
        if (ExtsPresentation[ext]) return "presentation";
        return null;
    }

    function GetPrimary(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            var r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        uuid = uuid.join('');
        uuid = uuid.replace(/-/g,'');
        uuid = uuid.substr(uuid.length - Math.min(uuid.length, 20));
        uuid = uuid.toLowerCase();
        return uuid;
    }

    function GetFileExt(sName) {
        var nIndex = sName ? sName.lastIndexOf(".") : -1;
        if (-1 != nIndex)
            return sName.substring(nIndex + 1).toLowerCase();
        return "";
    }

    function GetLanguage() {
        var langNav = navigator.language||navigator.userLanguage,
            langNav = langNav.substr(0, 2);
        return langNav;
    }

    var ExtsSpreadsheet = {
        "xls": "xls", "xlsx": "xlsx", "xlsm": "xlsm",
        "xlt": "xlt", "xltx": "xltx", "xltm": "xltm",
        "ods": "ods", "fods": "fods", "ots": "ots", "csv": "csv"
    }, ExtsPresentation = {
        "pps":"pps", "ppsx":"ppsx", "ppsm":"ppsm",
        "ppt":"ppt", "pptx":"pptx", "pptm":"pptm",
        "pot":"pot", "potx":"potx", "potm":"potm",
        "odp":"odp", "fodp":"fodp", "otp":"otp"
    }, ExtsDocument = {
        "doc": "doc", "docx":"docx",
        "docm": "docm", "dot":"dot",
        "dotx":"dotx", "dotm":"dotm",
        "odt":"odt", "fodt":"fodt",
        "ott":"ott", "rtf":"rtf",
        "txt":"txt","html":"html",
        "htm":"htm", "mht":"mht",
        "pdf":"pdf", "fb2":"fb2",
        "epub":"epub", "xps":"xps"
    };

    var _self;
    var CustomizationHandler = function (_options, _sendCommand) {
        _self = this;
        _self.options = _options;
        _self.sendCommand = _sendCommand;
        _self.textNotWord = "此接口仅对Word文档开放；This Function Is Open For Word Only!";
    };
    CustomizationHandler.prototype = {
        constructor: CustomizationHandler,

        createXHR : function(){
            if (typeof XMLHttpRequest != "undefined"){
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined"){
                if (typeof arguments.callee.activeXString != "string"){
                    var versions = [ "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"], i, len;
                    for (i=0,len=versions.length; i < len; i++){
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex){

                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        },

        checkUrlForOSS : function (uri) {
            if (!uri) return false;
            var us = uri.split('://');
            us[0] = us[0].toLowerCase();
            if (us[0] == 'desk' || us[0].indexOf('oss') != -1 ||
                us[0] == 'bos' || us[0] == 'cos') return true;
            return false;
        },

        sync : function(cmd){
            return new Promise(function (resolved, rejected) {
                _self.sendCommand(cmd, function(data){
                    if (!data)
                    {
                        rejected();
                    }
                    else
                    {
                        try {
                            data = typeof data === 'string' ? JSON.parse(data) : data;
                            resolved(data.data);
                        } catch (err) {
                            rejected(err);
                        }
                    }
                });
            });
        },

        notifyBuilder: function(_options, event, callFn){
            if (!_options.user.customization.public.common.notify || !_options.user.customization.public.common.notify.enable) {
                _options.user.customization.public.common.notify = { enable : false };
                return false;
            }
            if (!_options.user.customization.public.common.notify.fn && !_options.user.customization.public.common.notify.url){
                return false;
            }
            if (!_options.user.customization.public.common.notify.fn) {
                _options.editorAttrs.events[event] = function (data) {
                    var xhr = _self.createXHR();
                    xhr.onreadystatechange = function(){
                        if (xhr.readyState == 4){
                            console.log('notify result:' + JSON.stringify({responseText: xhr.responseText, responseStatus: xhr.status}));
                        }
                    };
                    xhr.open("post", _options.user.customization.public.common.notify.url, true);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.send(JSON.stringify({data: {'callFn': callFn, data: data.data }}));
                }
            } else {
                _options.editorAttrs.events[event] = function (data) {
                    _options.user.customization.public.common.notify.fn(JSON.stringify({data: {'callFn': callFn, data: data.data }}));
                }
            }
            return true;
        },
	//angelo use webAssembly
        getFileFromBase64:function(uint8Array,fileName)
        {
            // 将 Uint8Array 转换为 Blob
            const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
            //const blob = result.data[1];
            // 从 Blob 创建 File 对象

            //const fileType = 'application/octet-stream'; // 或其他适当的 MIME 类型
            const file = new File([blob], fileName);
            return file;
        },
        downloadFileWithName: function (file, fileName) {
            var a = document.createElement('a');
            var url = URL.createObjectURL(file);
            a.href = url;
            a.download = fileName; // 设置下载的文件名
            document.body.appendChild(a);
            a.click(); // 触发点击事件以下载文件
            document.body.removeChild(a); // 移除 <a> 元素
            URL.revokeObjectURL(url); // 释放内存
        },
        initConfig: function(isChinese){
            var _options = _self.options, params;
            _options.user.customization.public.common.downloadWithFormatNotify = _self.notifyBuilder(_options, 'spire_onDownloadWithFormat', 'onDownloadWithFormat');
            _options.editorAttrs.canUseHistory = _options.editorAttrs.events && !!_options.editorAttrs.events.onRequestHistory&&!_options.editorAttrs.useWebAssemblyDoc;
            _options.editorAttrs.canHistoryClose = _options.editorAttrs.events && !!_options.editorAttrs.events.onRequestHistoryClose;
            _options.editorAttrs.canHistoryRestore = _options.editorAttrs.events && !!_options.editorAttrs.events.onRequestRestore;
            _options.editorAttrs.canSendEmailAddresses = _options.editorAttrs.events && !!_options.editorAttrs.events.onRequestEmailAddresses;
            _options.editorAttrs.canRequestEditRights = _options.editorAttrs.events && !!_options.editorAttrs.events.onRequestEditRights;
            _options.editorAttrs.canErrorCallback = _options.editorAttrs.events && !!_options.editorAttrs.events.onErrorCallback;
            _options.editorAttrs.canUseWebAssembly = false;
            if(_options.editorAttrs.editorType=="document"&&_options.fileAttrs.fileInfo.ext.toLowerCase() == 'pdf'){
                _options.editorAttrs.canUseWebAssembly = _options.editorAttrs.useWebAssemblyPdf;
            }else if(_options.editorAttrs.editorType=="document"){
                _options.editorAttrs.canUseWebAssembly = _options.editorAttrs.useWebAssemblyDoc;
            }else if(_options.editorAttrs.editorType=="spreadsheet"){
                _options.editorAttrs.canUseWebAssembly = _options.editorAttrs.useWebAssemblyExcel;
            }else if(_options.editorAttrs.editorType=="presentation"){
                _options.editorAttrs.canUseWebAssembly = _options.editorAttrs.useWebAssemblyPpt;
            }
            var clearDB = _options.editorAttrs.canUseWebAssembly && (_options.editorAttrs.serverless && _options.editorAttrs.serverless.useServerless);

            if (!_self.checkUrlForOSS(_options.fileAttrs.sourceUrl)) {
                if (_options.fileAttrs.callbackUrl) {
                    _options.editorAttrs.events["spire_onSave"] = function (result){
                        if(_options.editorAttrs.canUseWebAssembly)
                        {
                            result.data[2] = _options.fileAttrs.fileInfo.primary;
                        }else
                        {
                            var savedKey = result.data[1].slice(result.data[1].indexOf('/files/') + 7, result.data[1].indexOf('/output'));
                            result.data[2] = savedKey;
                        }

                        var xhr = _self.createXHR();
                        xhr.onreadystatechange = function(){
                            if (xhr.readyState == 4){
                                var code = ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) ? 0 : 1;
                                _self.sendCommand({
                                    cmd: 'spire_OnSaveResultChange',
                                    data: {code: code, clearDB: clearDB}
                                });
                                notied = true;
                            }
                        };
                        xhr.open("post", _options.fileAttrs.callbackUrl, true);
                        // @brook serverless 替换callbackUrl地址
                        if(_options.editorAttrs.canUseWebAssembly)
                        {
                            var tempCallbackUrl = new URL(_options.fileAttrs.callbackUrl);
                            if(tempCallbackUrl.pathname === '/save')
                                tempCallbackUrl.pathname = '/saveWebAssembly';
                            tempCallbackUrl = tempCallbackUrl.toJSON();
                            var fileName = result.data[0];
                            var unit8Array = result.data[1];
                            const file = _self.getFileFromBase64(unit8Array,fileName);
                            const formData = new FormData();
                            formData.append('fileName', fileName); // 附加文件名
                            formData.append('file', file);
                            formData.append('key', result.data[2]); // 附加其他键值对
                            xhr.send(formData);
                        }else
                        {
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.send(JSON.stringify({status:2, url:result.data[1], key: _options.fileAttrs.fileInfo.primary == result.data[2] ? _options.fileAttrs.fileInfo.primary : result.data[2]}));
                        }

                        var notied = false;
                        var saveTimeout = setTimeout(function () {
                            if (!notied) {
                                _self.sendCommand({
                                    cmd: 'spire_OnSaveResultChange',
                                    data: {code: 3, clearDB: clearDB}
                                });
                            }
                            clearTimeout(saveTimeout);
                        }, 12000);
                    };
                } else if (_options.editorAttrs.events && _options.editorAttrs.events["onSave"] &&
                    typeof _options.editorAttrs.events["onSave"] === "function"){
                    _options.editorAttrs.events["spire_onSave"] = function(data){
                        var code;
                        try {
                            data.key = _options.fileAttrs.fileInfo.primary;
                            if(_options.editorAttrs.canUseWebAssembly)
                            {
                                var fileName = data.data[0];
                                var unit8Array = data.data[1];
                                const file = _self.getFileFromBase64(unit8Array,fileName);
                                data.data[1] = file;
                                _options.editorAttrs.events["onSave"](data);
                                code = 0;
                            }else
                            {
                                _options.editorAttrs.events["onSave"](data);
                                code = 0;
                            }
                        }catch (e) {
                            code = 1;
                        }
                        _self.sendCommand({
                            cmd: 'spire_OnSaveResultChange',
                            data: {code: code, clearDB: clearDB}
                        });
                    };
                } 
                // @brook 新增fileOpen的保存逻辑
                else if(_options.fileAttrs.fileOpen) {
                    _options.editorAttrs.events["spire_onSave"] = function(data) {
                        var fileName = data.data[0];
                        var unit8Array = data.data[1];
                        var blob = new Blob([unit8Array], { type: 'application/octet-stream' });
                        _self.downloadFileWithName(blob, fileName);
                        _self.sendCommand({
                            cmd: 'spire_OnSaveResultChange',
                            data: {code: 0, clearDB: true}
                        });
                    }
                } else {
                    _options.user.canSave = false;
                    _options.editorAttrs.events["spire_onSave"] = function (result){
                        alert(isChinese ? "您未定义回调函数和回调url,二者至少存在一个才能使用保存功能,回调url优先级高于回调函数!" :
                            "You have not defined a callback function and a callback url. There is at least one of them to use the save function. The callback url has a higher priority than the callback function!");
                    }
                }
            }
            if(_options.editorAttrs.canPowerPointAI){
                if(_options.editorAttrs.events && _options.editorAttrs.events["AICallback"] &&
                typeof _options.editorAttrs.events["AICallback"] === "function"){
                    _options.editorAttrs.events["spire_onSendPPtInfo"] = function(data){
                        _options.editorAttrs.events["AICallback"](data); 
                    }
                }     
            }
            if (_options.editorAttrs.events.onDownload && typeof _options.editorAttrs.events.onDownload === "function" ){
                _options.editorAttrs.events.spire_onDownload = _options.editorAttrs.events.onDownload;
                _options.editorConfig.spire_onDownload = true;
            }

            // @brook fileopen
            if(_options.editorAttrs.canUseWebAssembly && _options.editorAttrs.serverless && _options.editorAttrs.serverless.useServerless) {
                _options.editorAttrs.events['spire_onFileOpen'] = function(data) {
                    var fileData = new Uint8Array(JSON.parse(data.data[0]));
                    var config = data.data[1];
                    var key = '';
                    config =SpireCloudEditor['structuredConfigsFunc'](config, config['funcArray']);
                    key = config['fileAttrs']['fileInfo']['primary'];
                    delete config['funcArray'];
                    if(config['editorAttrs']['serverless']['fileData']) 
                        config['editorAttrs']['serverless']['fileData'] = SpireCloudEditor['Deserializ_Serverless_FileData'](config['editorAttrs']['serverless']['fileData']);
                    if(_options.editorAttrs.serverless['fileOpenCallback']) {
                        _options.editorAttrs.serverless['fileOpenCallback'](fileData, config);
                    } else {
                        var url = new URL(location.href);
                        var urlSearch = url.searchParams;
                        urlSearch.set('fileName', config.fileAttrs.fileInfo.name);

                        if(urlSearch.has('verifyFile'))
                            urlSearch.set('verifyFile', false);
                        else
                            urlSearch.append('verifyFile', false);

                        // @brook 添加key参数
                        if(urlSearch.has('key'))
                            urlSearch.set('key', key);
                        else
                            urlSearch.append('key', key);
                        window.open(url.toString(), '_blank');
                    }

                }
            }

            var custom = _options.user.customization;
            if (custom.public.common.intercept) {
                var intercept = custom.public.common.intercept;
                _options.editorAttrs.events['spire_onIntercept'] = intercept["callback"];
            }
            if (custom.public.word) {
                params = _options.user.customization.public.word;
                if (params["headers"] && params["headers"]['itemCallback']){
                    _options.editorAttrs.events['spire_headerItemsClick'] = params["headers"]['itemCallback'];
                    _options.user.customization.public.word['events'] = 'spire_headerItemsClick';
                }
            }
            if (custom.public.excel) {
                params = custom.public.excel;
                if (params['sendSelectionRanges']) {
                    params = params['sendSelectionRanges'];
                    if (params['events'] && params['events']['eventstype'] == 'function') {
                        if (typeof params['events']['success'] !== 'function' ||
                            typeof params['events']['error'] !== 'function') {
                            if (!confirm(isChinese ? '自定义事件错误，标注事件类型为function时，success和error参数请使用js function定义回调函数！依然进入编辑吗？' :
                                'Custom event error. Please use javascript function to define callback function for success and error parameters when the event type is function!Still enter edit?')) {
                                return ;
                            }
                        }
                    } else {
                        params['events']['success'] = function (props){
                            var xhr = _self.createXHR();
                            xhr.onreadystatechange = function(){
                                if (xhr.readyState == 4){
                                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
                                        alert(xhr.responseText);
                                    } else {
                                        alert("Request Fail: " + xhr.status);
                                    }
                                }
                            };
                            xhr.open("post", _configs.user.customization.public.excel.success, true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.send(JSON.stringify({ranges:props,msg:''}));
                        };
                        params['events']['error'] = function (msg){
                            var xhr = _self.createXHR();
                            xhr.onreadystatechange = function(){
                                if (xhr.readyState == 4){
                                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
                                        alert(xhr.responseText);
                                    } else {
                                        alert("Request Fail: " + xhr.status);
                                    }
                                }
                            };
                            xhr.open("post", _configs.user.customization.public.excel.error, true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.send(JSON.stringify({ranges:[],msg:msg}));
                        };
                    }
                    _options.editorAttrs.events['spire_onSendSelectionRangesSuccess'] = params['events']['success'];
                    _options.editorAttrs.events['spire_onSendSelectionRangesError'] = params['events']['error'];
                }
            }
            if (custom.public.powerpoint) {
                params = _options.user.customization.public.powerpoint;
                if (params['rememberPlayTime']) {
                    if (params['rememberPlayTime'].callbackUrl) {
                        _options.editorAttrs.events['spire_onSendPlayTime'] = function (msg) {
                            var xhr = _self.createXHR();
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4) {
                                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

                                    } else {

                                    }
                                }
                            };
                            xhr.open("post", params['rememberPlayTime'].callbackUrl, true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.send(msg);
                        };
                        _options.user.customization.public.powerpoint['events'] = 'spire_onSendPlayTime';
                    } else if (params['rememberPlayTime'].callbackfn) {
                        _options.editorAttrs.events['spire_onSendPlayTime'] = params['rememberPlayTime'].callbackfn;
                        _options.user.customization.public.powerpoint['events'] = 'spire_onSendPlayTime';
                    }
                }
            }
            _self.inited = true;
            _self = _self;
            return _options;
        }
    };

})(window.SpireCloudEditor = window.SpireCloudEditor || {}, window, document);