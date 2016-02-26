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
// base class for leaves and nodes
function Entity(name, type, base)
{
    var logger = new Logger("entity");
    this.name = name;
    this.type = type;
    this.base = base;

    logger.debug("create(" + name + ", " + type + ")");

    this.display = function()
    {
        throw "Entity.display() is not callable!";
    }

    this.displayBrief = function()
    {
        throw "Entity.displayBrief() is not callable!";
    }

    this.generateOutput = function()
    {
        throw "Entity.generateOutput() is not callable!";
    }

    this.createForm = function(title)
    {
        throw "Entity.createForm() is not callable!";
    }

    this.clone = function()
    {
        return new Entity(this.name, this.type, this.base);
    }
}

function Leaf(name, content = "", type = "leaf", base = 0)
{
    if (!(this instanceof Leaf))
        return new Leaf(name, content, type, base);

    Entity.call(this, name, type, base);
    this.content = content;
    //debug("create Leaf(" + name + ", " + content + ", " + type + ")");

    this.display = function(actions)
    {
        //return this.displayBrief(actions) + " (" + this.type + ")";
        return this.displayBrief(actions);
    }

    this.displayBrief = function(actions)
    {
        var result = {
            name: this.name,
            type: this.type,
            content: this.content,
            tooltip: this.type,
            instance: this,
            actions: ['child-modify']
        };
        return result;
    }

    this.generateOutput = function()
    {
        var copy = this.clone();
        delete copy.base;

        return JSON.stringify(copy);
    }

    this.clone = function()
    {
        return new Leaf(this.name, this.content, this.type, this.base);
    }

    this.createForm = function(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        form.addInput(new FormField("Value", "content", this.content));
        return form;
    }
}
Leaf.prototype = Object.create(Entity.prototype);

// Node
function Node(name, type = "node", base = 0)
{
    if (!(this instanceof Node))
        return new Node(name, type, base);

    var logger = new Logger("node[" + name + "]");
    Entity.call(this, name, type, base);

    this.children = Array();

    // debug("create Node(" + name + ", " + type + ")");

    this.displayBrief = function(actions)
    {
        return {
            name: this.name,
            type: this.type,
            instance: this,
            actions: ["go-to-child", "child-modify"]
        }
    }

    this.display = function(actions)
    {
        // TODO separate view!
        // debug("Node.display() name:" + this.name);

        result = {
            name: this.name,
            type: this.type,
            instance: this,
            content: []
        };
        if (this.base instanceof Node)
        {
            result.topactions = ["base-link"]
        }

        result.actions = ["node-actions"];

        for (i = 0; i < this.children.length; ++i)
        {
            child = this.children[i];
            var childContent = child.displayBrief(actions);
            if (typeof childContent === 'object')
            {
                result.content.push(childContent);
            }
            else
                throw "FATAL:" + childContent;
        }

        return result;
    }

    this.add = function(node)
    {
        if (!(node instanceof Entity))
            throw "Node.add(): invalid type ";

        this.children.push(node);
        node.base = this;
    }

    this.remove = function(nodeName)
    {
        var index = this.getChildIndex(nodeName);
        if (index < 0)
        {
            logger.info("Node.remove('" + nodeName + "'): no such child");
            throw "ERROR";
        }

        this.children.splice(i, 1);
    }

    this.getChild = function(name)
    {
        for (i = 0; i < this.children.length; ++i)
        {
            child = this.children[i];
            if (child.name === name)
                return child;
        }
    }

    this.getChildIndex = function(name)
    {
        for (i = 0; i < this.children.length; ++i)
        {
            child = this.children[i];
            if (child.name === name)
                return i;
        }
        return -1;
    }

    this.generateOutput = function()
    {
        var attributes = ""
        for (var key in this)
        {
            if (key === "base" || key === "children"
                || typeof(this[key]) === "function")
                continue;

            if (attributes.length > 0)
                attributes += ",";

            attributes += '"' + key + '":"' + this[key]+ '"';
        }

        var childList = "";
        for (var i = 0; i < this.children.length; ++i)
        {
            if (childList.length > 0)
                childList += ",";

            childList += this.children[i].generateOutput();
        }

        if (attributes.length > 0)
            attributes += ",";

        attributes += '"children":[' + childList + ']';

        return '{' + attributes + '}';
    }

    this.clone = function()
    {
        var node = new Node(this.name, this.type, this.base);
        for (var i = 0; i < this.children.length; ++i)
        {
            node.add(this.children[i].clone())
        }

        return node;
    }

    this.createForm = function(title)
    {
        var form = new Form(title);
        form.addInput(new FormField("Name", "name", this.name));
        return form;
    }
}
Node.prototype = Object.create(Entity.prototype);