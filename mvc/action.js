/**
 * Callback
 * If only the first parameter passed, that means a global function.
 * If both parameters added, the first is the object, second is its member function.
 */
function Callback(arg1, arg2)
{
    if (arg2 === undefined)
    {
        this.obj = null;
        this.func = arg1;
    }
    else
    {
        this.obj = arg1;
        this.func = arg2;
    }
}
Callback.prototype = {
    execute: function(data)
    {
        var func;
        if (this.obj === null)
            var func = this.func;
        else
            func = this.func.bind(this.obj);

        func(data);
    }
}


/**
 * Generic action handler.
 *
 * var a = new Action(new Callback(...));
 * a.execute(data)
 *
 */
function Action(callback, id = null)
{
    this._init(callback, id);
}

Action.pool = [];
Action.counter = 0;
Action.invoke = function(id, data)
{
    var a = Action.pool[id];
    a.execute(data);
}

Action.prototype = {
    _init: function(cb, id)
    {
        this.callback = cb;
        if (id !== null)
            this.id = id
        else
            this.id = "action_" + Action.counter++;

        Action.pool[this.id] = this;
    },
    execute: function(data)
    {
        this.callback.execute(data)
    },
    display: function(data = '')
    {
        return 'Action.invoke(\'' + this.id + '\', \'' + data + '\')';
    }
};
