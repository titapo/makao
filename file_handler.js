
/**
 * How to use:
 *
 * var handler = new FileHandler("something.txt");
 * handler.setCallback(function(msg)
 * { ... });
 * handler.read();
 *
 */
function FileHandler(filename)
{
    var logger = new Logger("file[" + filename + "]");
    this.filename = filename;
    var readyCallback = null;
    this.setCallback = function(cb)
    {
        readyCallback = cb;
    }

    this.read = function()
    {
        var client = new XMLHttpRequest();
        client.open('GET', this.filename, false);
        var handlerRef = this;
        client.onreadystatechange = function(handlerRef)
        {
            logger.debug("state:" + client.readyState);
            /*
            console.log("type:" + client.responseType);
            console.log("text:" + client.responseText);
            */
            if (client.readyState !== 4) // not DONE
                return;

            if (readyCallback === null)
            {
                console.log("FileHandler() readyCallback is not set");
                return;
            }

            readyCallback(client.responseText);
        }

        try
        {
            client.send();
            if (client.status == 404)
                logger.error("not exists");
        }
        catch (ex)
        {
            console.log("error: " + ex);
        }

    }
}
