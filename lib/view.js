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

/**
 * This method should be extracted
 */
View.prototype.remap = function(input)
{
    var map = {
        "go-to-child": "go",
        "move-up": "^",
        "move-down": "v",
    };

    if (map[input] !== undefined)
        return map[input];

    return input;
}

View.prototype.display = function()
{
    if (this.area === null || this.actionList === null)
    {
        this.logger.error("View has not been initialized!");
        throw "View has not been initialized!";
    }
    this.logger.info("display");
    var node = this.getCurrentNode()
    var result = node.display(this.actionList);
    var o = '';
    //{
    var out = '';
    out += this.path.display();
    if (result.topactions !== undefined)
    {
        out += Tag("div",
                this._displayActionGroup(result.topactions[0]), // TODO more if exists
                {"class":"base"});
    }
    out += Tag("h3", result.name, {"class":"title"});
    out += Tag("p", "(type:" + result.type + ")");
    for (var actionGroup of result.actions)
    {
        if (actionGroup == "node-action-creation") // it is very ugly
        {
            var creationMenu = new Menu("Create ...", default_menu);
            //out += "{" + this.actionList.list[actionGroup] + "}";
            for (var action of this.actionList.list[actionGroup]())
            {
                creationMenu.add(
                        ActionButton(
                            this.remap(action),
                            this.controller.getAction(actionGroup).display(action)));
            }
            out += creationMenu.display();
        }
    }
    out += this.actionList.displayActions(result.actions, result.instance);

    for (var i = 0; i < result.actions.length; ++i)
    {
        out += Tag("p", "+" + result.actions[i]);
    }

    // debugger;
    console.info(result.content.length);

    // TODO clean it up
    var content = '';
    for (var i = 0; i < result.content.length; ++i)
    {
        content += this._displayChild(result.content[i]);
    }

    out += Tag("div", content, {"class":"entity-content"});
    o = Tag("div", out, {"class":"entity"});
    //}

    this.area.innerHTML = o;
    this.displaySubViews()
}

View.prototype._displayChild = function(child)
{
    console.log(" child actions: " + child.actions);
    var action_out = '';
    // foreach action groups in child.actions
    for (var j = 0; j < child.actions.length; ++j)
    {
        var actionGroupName = child.actions[j];
        action_out += this._displayActionGroup(actionGroupName, child.name);
    }

    return Tag("p", child.name + " (" + child.type + ")"
            + (child.content?": " + child.content:"")
            + action_out
            );
}

View.prototype._displayActionGroup = function(groupName, childName)
{
    var groupActions = this.actionList.list[groupName]();

    // display concrete actions in this group
    var out = "";
    for (var i = 0; i < groupActions.length; ++i)
    {
        console.log("   create button for: " + groupActions[i]);
        out += ActionButton(
                this.remap(groupActions[i]),
                this.controller.getAction(groupActions[i]).display(childName));
    }
    return out;
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
