
function getDateAndTime()
{
    var d = new Date()
    return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + " "
        + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

function g_loggerOutMethod(component, level, message)
{
    console.log( getDateAndTime() + " " + component + ":" + level + " | " + message);
}



function Logger(component)
{
    var logLevels = {
        "fatal": 1,
        "error": 2,
        "warning": 3,
        "info": 4,
        "debug": 5
    }
    this.component = component;
    this.log = function(messageLevel, message)
    {
        if (logLevels[messageLevel] > logLevels[Logger.logLevel])
            return;

        g_loggerOutMethod(this.component, messageLevel, message);
    }

    this.fatal = function(message) { this.log("fatal", message); }
    this.error = function(message) { this.log("error", message); }
    this.warning = function(message) { this.log("warning", message); }
    this.info = function(message) { this.log("info", message); }
    this.debug = function(message) { this.log("debug", message); }
}

Logger.logLevel = "info";
Logger.setLogLevel = function(level)
{
    Logger.logLevel = level;
}
