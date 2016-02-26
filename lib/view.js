/**
*/

// TODO should derive from view base class
function View(name, model, path)
{
    this._init(name, model)
    this.__init(model.getService("tree"), path);
}

View.prototype = Object.create(Observer.prototype);
View.prototype.constructor = View;

View.prototype.__init = function(tree, path)
{
    this.logger = new Logger("view");
    this.tree = tree;
    this.path = path;
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
    var node = this.getCurrentNode()
    var result = node.display(actionList);
    var o = '';
    //{
    var out = '';
    out += this.path.display();
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

    out += Tag("div", content, {"class":"entity-content"});
    o = Tag("div", out, {"class":"entity"});
    //}

    area.innerHTML = o;
}

View.prototype.getCurrentNode = function()
{
    this.logger.info("getCurrentNode:" + this.path.display());
    var node = this.tree.getEntity(this.path);
    if (!(node instanceof Node))
    {
        this.logger.error("given parameter is not a node");
        this.x = node;
        // TODO clear path
        throw "given parameter is not a node!";
    }
    return node;
}

View.prototype.goToBase = function()
{
    if (this.path.isOnTop())
    {
        this.logger.error("already on top");
        throw "already on top";
    }

    this.path.clear();
    this.display();
}

View.prototype.goUp = function()
{
    if (this.path.isOnTop())
    {
        this.logger.error("already on top");
        throw "already on top";
    }
    this.path.up();
    this.display();
}

View.prototype.goToChild = function(childName)
{
    this.path.to(childName);
    this.display();
}
