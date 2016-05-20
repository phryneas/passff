Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");

PassFF.Preferences = {
    _environment        : Cc["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment),
    _gpgAgentEnv : null,
    _params : {
        passwordInputNames : "passwd,password,pass",
        loginInputNames    : "login,user,mail,email",
        loginFieldNames    : "login,user,username,id",
        passwordFieldNames : "passwd,password,pass",
        urlFieldNames      : "url,http",
        command            : "/bin/pass",
        home               : "",
        storeDir           : "",
        storeGit           : "",
        gpgAgentInfo       : ".gpg-agent-info",
        autoFill           : false,
        shortcutKey        : "t",
        shortcutMod        : "control,alt"
    },

    _init : function() {
        let defaultBranch = Services.prefs.getDefaultBranch("extensions.passff.");
        let branch = Services.prefs.getBranch('extensions.passff.');
        for (let [key, val] in Iterator(PassFF.Preferences._params)) {
            switch (typeof val) {
                case "boolean":
                    defaultBranch.setBoolPref(key, val);
                    this._params[key] = branch.getBoolPref(key);
                    break;
                case "number":
                    defaultBranch.setIntPref(key, val);
                    this._params[key] = branch.getIntPref(key);
                    break;
                case "string":
                    defaultBranch.setCharPref(key, val);
                    this._params[key] = branch.getCharPref(key);
                    break;
            }
        }

        this.setGpgAgentEnv();

        console.info("[PassFF]", "Preferences initialised", {
            passwordInputNames : this.passwordInputNames,
            loginInputNames    : this.loginInputNames,
            loginFieldNames    : this.loginFieldNames,
            passwordFieldNames : this.passwordFieldNames,
            urlFieldNames      : this.urlFieldNames,
            command            : this.command,
            home               : this.home,
            storeDir           : this.storeDir,
            storeGit           : this.storeGit,
            gpgAgentEnv        : this.gpgAgentEnv,
            autoFill           : this.autoFill,
            shortcutKey        : this.shortcutKey,
            shortcutMod        : this.shortcutMod
        });
    },

    get passwordInputNames() { return this._params.passwordInputNames.split(","); },
    get loginInputNames()    { return this._params.loginInputNames.split(","); },
    get loginFieldNames()    { return this._params.loginFieldNames.split(","); },
    get passwordFieldNames() { return this._params.passwordFieldNames.split(",");},
    get urlFieldNames()      { return this._params.urlFieldNames.split(",");},
    get command()            { return this._params.command; },
    get home()               { return (this._params.home.trim().length > 0 ? this._params.home : this._environment.get('HOME')); },
    get storeDir()           { return (this._params.storeDir.trim().length > 0 ? this._params.storeDir : this._environment.get('PASSWORD_STORE_DIR')); },
    get storeGit()           { return (this._params.storeGit.trim().length > 0 ? this._params.storeGit : this._environment.get('PASSWORD_STORE_GIT')); },
    get gpgAgentEnv()        { return this._gpgAgentEnv; },
    get autoFill()           { return this._params.autoFill; },
    get shortcutKey()        { return this._params.shortcutKey; },
    get shortcutMod()        { return this._params.shortcutMod; },

    setGpgAgentEnv : function() {
        let gpgAgentInfo = this._params.gpgAgentInfo;
        let filename = (gpgAgentInfo.indexOf("/") != 0 ? this.home + "/" : "") + gpgAgentInfo;
        let file = new FileUtils.File(filename);
        console.debug("[PassFF]", "Check Gpg agent file existance : " + filename);
        if (file.exists() && file.isFile()) {
            console.info("[PassFF]", "Retrieve Gpg agent variable from file " + filename);
            NetUtil.asyncFetch(file, function(inputStream, status) {
                let content = NetUtil.readInputStreamToString(inputStream, inputStream.available());
                console.debug("[PassFF]", "Set Gpg agent variable :", content);
                PassFF.Preferences._gpgAgentEnv = content.split("\n")
            });
        } else {
            console.info("[PassFF]", "Retrieve Gpg agent variable from environment");
            PassFF.Preferences._gpgAgentEnv = [
                "GPG_AGENT_INFO=" + this._environment.get('GPG_AGENT_INFO'),
                "GNOME_KEYRING_CONTROL = " + this._environment.get('GNOME_KEYRING_CONTROL'),
                //"SSH_AUTH_SOCK=" + this._environment.get('SSH_AUTH_SOCK'),
                //"SSH_AGENT_PID=" + this._environment.get('SSH_AGENT_PID')
            ]
        }
    }
};

(function() { this._init(); }).apply(PassFF.Preferences);
