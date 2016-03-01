/**
*/

// TODO it should be derived from view base class
function View(name, model, path)
{
    this._init(name, model); // Observer
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
    this.subViews = [];
    this.controller = new SimpleController(this.name + "-ctrl", this.model, this);
}
View.prototype.init = function(p_area/*layer?*/, p_actionList)
{
    baseArea = p_area;
    var domNode = document.createElement("div");
    domNode.className = "default-area";
    baseArea.appendChild(domNode);
    this.area = domNode;
    this.actionList = p_actionList;
    this.logger.info("View initialized.");
}

/// @will-be deprecated. Use createSubView() instead.
View.prototype.createSubArea = function(identifier)
{
    var domNode = document.createElement("div");
    domNode.className = "sub-area";
    baseArea.appendChild(domNode);
    return domNode;
}

View.prototype.createSubView = function(identifier, path)
{
    var view = new View(identifier, this.model, path);
    var area = this.createSubArea("TODO-no-effect");
    view.init(area, this.actionList/*TODO may be different*/);
    this.subViews.push(view);
    this.display();
}

View.prototype.update = function()
{
    this.display();
}
View.prototype.display = function()
{
    if (this.area === null || this.actionList === null)
    {
        this.logger.error("View has not been initialized!");
        throw "View has not been initialized!";
    }
    this.logger.info("display");
    //throw "OK!";
    var node = this.getCurrentNode()
    var result = node.display(this.actionList);
    var o = '';
    //{
    var out = '';
    out += this.path.display();
    if (result.topactions !== undefined)
    {
        out += Tag("div", this.actionList.execute(result.topactions[0],
                    result.instance), {"class":"base"});
    }
    out += Tag("h3", result.name, {"class":"title"});
    out += Tag("p", "(type:" + result.type + ")");
    out += this.actionList.displayActions(result.actions, result.instance);

    for (var i = 0; i < result.actions.length; ++i)
    {
        out += Tag("p", "+" + result.actions[i]);
    }

    // debugger;
    console.info(result.content.length);
    var content = '';
    for (var i = 0; i < result.content.length; ++i)
    {
        var child = result.content[i];

        console.log(child.actions);
        //for (var j = 0; j < child.actions.length; ++j) TODO
        var action_names = this.actionList.list["child-modify"]();

        var action_content = '';
        for (var k = 0; k < action_names.length; ++k)
            action_content += ActionButton(
                    action_names[k],
                    this.controller.getAction(action_names[k]).display(child.name));

        content += Tag("p", child.name + " (" + child.type + ")"
                + (child.content?": " + child.content:"")
           //     + this.actionList.displayActions(child.actions, child.instance)
                + action_content
                );
    }

    out += Tag("div", content, {"class":"entity-content"});
    o = Tag("div", out, {"class":"entity"});
    //}

    this.area.innerHTML = o;
    this.displaySubViews()
}

View.prototype.displaySubViews = function()
{
    for (var i = 0; i < this.subViews.length; ++i)
    {
        this.subViews[i].display();
    }
}

View.prototype.getPath = function()
{
    return this.path;
}

//@deprecated
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
