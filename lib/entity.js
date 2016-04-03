//function copyObject(obj)
var copyObject = function (obj)
{
    if (obj === null || typeof obj !== 'object')
        return obj;

    var copy = obj.constructor();
    for (var key in obj)
    {
        copy[key] = copyObject(obj[key]);
    }

    return copy;
};

function ActionList()
{
    this.list = Array();
    this.set = function(actionId, method)
    {
        this.list[actionId] = method;
    }

    this.unset = function(actionId)
    {
        this.list[actionId] = undefined;
    }

    this.displayActions = function(actions, parameter)
    {
        var out = '';
        for (i = 0; i < actions.length; ++i)
        {
            action = actions[i];
            out += this.execute(action, parameter);
        }
        return out;
    }
    this.execute = function(actionId, parameter)
    {
        var method = this.list[actionId];
        if (method === undefined)
            throw "ActionList.execute(" + actionId + ", ...) is undefined";

        return method(parameter);
    }

}
