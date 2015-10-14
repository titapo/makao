// helpers
function Tag(name, content, attrclass)
{
    return "<" + name + " class=" + attrclass + ">" + content + "</" + name + ">";
}

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
    this.name = name;
    this.type = type;
    this.base = base;

    console.log("create Entity(" + name + ", " + type + ")");

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
    this.clone = function()
    {
        return new Entity(this.name, this.type, this.base);
    }
}

function Leaf(name, content = "", type = "leaf", base = 0)
{
    Entity.call(this, name, type, base);
    this.content = content;
    console.log("create Leaf(" + name + ", " + content + ", " + type + ")");

    this.display = function(actions)
    {
        return this.displayBrief(actions) + " (" + this.type + ")";
    }

    this.displayBrief = function(actions)
    {
        return this.name + ": " + this.content + " "
            + actions.execute("child-modify", this);
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
}
Leaf.prototype = Object.create(Entity.prototype);

// Node
function Node(name, type = "node", base = 0)
{
    Entity.call(this, name, type, base);

    this.children = Array();

    console.log("create Node(" + name + ", " + type + ")");

    this.displayBrief = function(actions)
    {
        return this.name + ": (" + this.type + ") "
            + actions.execute("go-to-child", this)
            + actions.execute("child-modify", this);

    }

    this.display = function(actions)
    {
        // TODO separate view!
        console.log("Node.display() name:" + this.name);

        var out = "";
        if (this.base instanceof Node)
        {
            out += Tag("div", actions.execute("base-link", this), "base");
        }

        out += Tag("h3", this.name, "title");
        out += Tag("p", "(type:" + this.type + ")");
        out += actions.execute("node-actions", this);

        var content = ""
        for (i = 0; i < this.children.length; ++i)
        {
            child = this.children[i];
            content += Tag("p", child.displayBrief(actions), "");
        }

        out += Tag("div", content, "entity-content");

        return Tag("div", out, "entity");
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
            console.log("Node.remove(): no such child");

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
}
Node.prototype = Object.create(Entity.prototype);


function createTreeFromString(jsonString)
{
    var json = JSON.parse(jsonString);
    return createFromJson(json);
}

function createFromJson(json)
{
    switch (json.type)
    {
        case "leaf":
            return new Leaf(json.name, json.content, json.type);

        case "node":
        {
            var node = new Node(json.name, json.type);
            for (var i = 0; i < json.children.length; ++i)
            {
                var child = json.children[i];
                node.add(createFromJson(child));
            }

            return node;
        }
        default:
            throw "Invalid type: '" + json.type + "'";
    }
}
