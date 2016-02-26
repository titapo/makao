/**
*/

// TODO should derive from view base class
function View(name, model, baseNode, path)
{
    this._init(name, model)
    this.__init(baseNode, path);
}

View.prototype = Object.create(Observer.prototype);
View.prototype.constructor = View;

View.prototype.__init = function(baseNode, path)
{
    this.logger = new Logger("view");
    this.base = baseNode;
    this.path = path;
    this.current = path.navigate(baseNode);
    this.baseArea = null;
    this.area = null;
    this.actionList = null;
}
View.prototype.init = function(p_area/*layer?*/, p_actionList)
{
    baseArea = p_area;
    var domNode = document.createElement("div");
    domNode.className = "default-area";
    baseArea.appendChild(domNode);
    area = domNode;
    actionList = p_actionList;
    this.logger.info("View initialized.");
}
View.prototype.createSubArea = function(identifier)
{
    var domNode = document.createElement("div");
    domNode.className = "sub-area";
    baseArea.appendChild(domNode);
    return domNode;
}
View.prototype.update = function()
{
    this.display();
}
View.prototype.display = function()
{
    if (area === null || actionList === null)
    {
        this.logger.error("View has not been initialized!");
        throw "View has not been initialized!";
    }
    this.logger.info("display");
    //throw "OK!";
    var result = this.current.display(actionList);
    var o = '';
    //{
    var out = '';
    if (result.topactions !== undefined)
    {
        out += Tag("div", actionList.execute(result.topactions[0],
                    result.instance), {"class":"base"});
    }
    out += Tag("h3", result.name, {"class":"title"});
    out += Tag("p", "(type:" + result.type + ")");
    out += actionList.displayActions(result.actions, result.instance);

    // debugger;
    console.info(result.content.length);
    var content = '';
    for (var i = 0; i < result.content.length; ++i)
    {
        var child = result.content[i];
        content += Tag("p", child.name + " (" + child.type + ")"
                + (child.content?": " + child.content:"")
                + actionList.displayActions(child.actions, child.instance));
        /* */
    }

    console.log("a1");
    out += Tag("div", content, {"class":"entity-content"});
    o = Tag("div", out, {"class":"entity"});
    //}

    area.innerHTML = o;
}

View.prototype.goTo = function(node)
{
    if (!(node instanceof Node))
    {
        this.logger.error("given parameter is not a node");
        this.x = node;
        throw "goTo(): given parameter is not a node!";
    }
    this.logger.info("goTo:" + node.name);

    this.current = node;
    this.display();
}

View.prototype.goToBase = function()
{
    if (this.current == this.base)
    {
        this.logger.error("already on top");
        throw "already on top";
    }

    this.path.clear();
    this.goTo(this.base);
}

View.prototype.goUp = function()
{
    if (this.current == this.base)
    {
        this.logger.error("already on top");
        throw "already on top";
    }
    this.path.up();
    this.goTo(this.current.base);
}

View.prototype.goToChild = function(childName)
{
    this.path.to(childName);
    this.goTo(this.current.getChild(childName));
}

// FIXME should not give it out
View.prototype.getCurrentNode = function()
{
    return this.current;
}
