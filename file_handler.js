
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
    this.filename = filename;
    var readyCallback = null;
    this.setCallback = function(cb)
    {
        console.log("set + " + typeof(cb));
        readyCallback = cb;
        console.log("set ++" + typeof(readyCallback));
    }

    this.read = function()
    {
        var client = new XMLHttpRequest();
        client.open('GET', this.filename);
        var handlerRef = this;
        client.onreadystatechange = function(handlerRef)
        {
            console.log("state:" + client.readyState);
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
        }
        catch (ex)
        {
            console.log("error: " + ex);
        }

    }
}
